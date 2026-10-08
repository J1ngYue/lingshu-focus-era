"""Acquire the CC0 models listed in assets/model-sources.json from their authors."""
from pathlib import Path
import io, json, urllib.request, urllib.parse, zipfile

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'output'/'assets-source'
CATALOG=json.loads((ROOT/'assets'/'model-sources.json').read_text())

def download(url):
    with urllib.request.urlopen(urllib.parse.quote(url,safe='/:?=&'),timeout=60) as response:
        return response.read()

def fetch(path,url):
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():path.write_bytes(download(url))
    return path

for entry in CATALOG['models']:
    if 'url' not in entry:continue
    path=fetch(SOURCE/entry['target'],entry['url'])
    if path.suffix=='.gltf':
        doc=json.loads(path.read_text())
        for item in doc.get('buffers',[])+doc.get('images',[]):
            uri=item.get('uri','')
            if uri and not uri.startswith('data:'):
                fetch(path.parent/Path(uri).name,urllib.parse.urljoin(entry['url'],uri))
                item['uri']=Path(uri).name
        path.write_text(json.dumps(doc))
    print(path.name,path.stat().st_size,flush=True)

nature=[entry for entry in CATALOG['models'] if 'archiveEntry' in entry]
archive=fetch(SOURCE/'nature.zip',CATALOG['natureArchive'])
with zipfile.ZipFile(io.BytesIO(archive.read_bytes())) as pack:
    for entry in nature:
        target=SOURCE/entry['target'];target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(pack.read(entry['archiveEntry']))
    license_path=SOURCE/'nature'/'License.txt';license_path.parent.mkdir(parents=True,exist_ok=True)
    license_path.write_bytes(pack.read('License.txt'))

for name,repo in [('Character','KayKit-Character-Pack-Adventures-1.0'),('Environment','KayKit-Medieval-Hexagon-Pack-1.0')]:
    fetch(SOURCE/'kaykit'/(name+'-License.txt'),'https://raw.githubusercontent.com/KayKit-Game-Assets/'+repo+'/main/LICENSE.txt')
fetch(SOURCE/'monsters'/'License.txt','https://drive.google.com/uc?export=download&id=16GqsDGESyEOfRbc4dS7EqAwkIUSIW4_y')
