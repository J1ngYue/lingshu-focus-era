"""Embed compact, self-contained GLBs for an offline file:// desktop game."""
from pathlib import Path
import base64, copy, hashlib, json, mimetypes, shutil, struct

ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'output'/'assets-source'
KEEP={'Idle','Walking_A','Running_A','1H_Melee_Attack_Chop','1H_Melee_Attack_Slice_Horizontal','Spellcast_Shoot','Hit_A','Death_A','Cheer','Lie_Idle'}

def read(path):
    data=path.read_bytes()
    if path.suffix=='.glb':
        size,_=struct.unpack_from('<II',data,12)
        doc=json.loads(data[20:20+size]);binary=data[28+size:]
        return doc,[binary]
    doc=json.loads(data)
    buffers=[]
    for item in doc.get('buffers',[]):
        uri=item['uri']
        buffers.append(base64.b64decode(uri.split(',',1)[1]) if uri.startswith('data:') else (path.parent/uri).read_bytes())
    return doc,buffers

def pack(path):
    doc,buffers=read(path)
    if path.suffix=='.glb':doc['animations']=[a for a in doc.get('animations',[]) if a.get('name') in KEEP]
    used=set()
    for mesh in doc.get('meshes',[]):
        for primitive in mesh['primitives']:
            used.update(primitive.get('attributes',{}).values())
            if 'indices' in primitive:used.add(primitive['indices'])
            for target in primitive.get('targets',[]):used.update(target.values())
    for skin in doc.get('skins',[]):
        if 'inverseBindMatrices' in skin:used.add(skin['inverseBindMatrices'])
    for animation in doc.get('animations',[]):
        for sampler in animation['samplers']:used.update([sampler['input'],sampler['output']])
    mapping={old:new for new,old in enumerate(sorted(used))}
    for mesh in doc.get('meshes',[]):
        for p in mesh['primitives']:
            p['attributes']={k:mapping[v] for k,v in p.get('attributes',{}).items()}
            if 'indices' in p:p['indices']=mapping[p['indices']]
            for target in p.get('targets',[]):
                for key in target:target[key]=mapping[target[key]]
    for skin in doc.get('skins',[]):
        if 'inverseBindMatrices' in skin:skin['inverseBindMatrices']=mapping[skin['inverseBindMatrices']]
    for a in doc.get('animations',[]):
        for s in a['samplers']:s['input']=mapping[s['input']];s['output']=mapping[s['output']]
    doc['accessors']=[doc['accessors'][old] for old in sorted(used)]
    views=set(a['bufferView'] for a in doc.get('accessors',[]) if 'bufferView' in a)
    views.update(i['bufferView'] for i in doc.get('images',[]) if 'bufferView' in i)
    if any('sparse' in a for a in doc.get('accessors',[])):raise ValueError('Unexpected sparse accessor')
    remap={old:new for new,old in enumerate(sorted(views))}
    blob=bytearray();new_views=[]
    for old in sorted(views):
        view=copy.deepcopy(doc['bufferViews'][old]);offset=view.get('byteOffset',0);chunk=buffers[view.get('buffer',0)][offset:offset+view['byteLength']]
        view['buffer']=0;view['byteOffset']=len(blob);new_views.append(view);blob.extend(chunk);blob.extend(b'\0'*((-len(blob))%4))
    for a in doc.get('accessors',[]):
        if 'bufferView' in a:a['bufferView']=remap[a['bufferView']]
    for image in doc.get('images',[]):
        if 'bufferView' in image:image['bufferView']=remap[image['bufferView']]
        else:
            uri=image.pop('uri')
            chunk=base64.b64decode(uri.split(',',1)[1]) if uri.startswith('data:') else (path.parent/uri).read_bytes()
            image['bufferView']=len(new_views);image['mimeType']=mimetypes.guess_type(uri)[0] or 'image/png'
            new_views.append({'buffer':0,'byteOffset':len(blob),'byteLength':len(chunk)});blob.extend(chunk);blob.extend(b'\0'*((-len(blob))%4))
    doc['bufferViews']=new_views;doc['buffers']=[{'byteLength':len(blob)}]
    encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4)
    return struct.pack('<III',0x46546c67,2,28+len(encoded)+len(blob))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(blob),0x004e4942)+blob

models={};manifest=[]
for entry in json.loads((ROOT/'assets'/'model-sources.json').read_text())['models']:
    path=SOURCE/entry['target'];folder=Path(entry['target']).parts[0]
    data=pack(path);models[path.stem]=base64.b64encode(data).decode()
    manifest.append({'name':path.stem,'source':folder,'sourceSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':len(data)})
(ROOT/'models.js').write_text('var FocusModels = '+json.dumps(models,separators=(',',':'))+';\n',encoding='utf-8')
licenses=ROOT/'assets'/'licenses';licenses.mkdir(parents=True,exist_ok=True)
for path,name in [(SOURCE/'kaykit'/'Character-License.txt','KayKit-Characters.txt'),(SOURCE/'kaykit'/'Environment-License.txt','KayKit-Environment.txt'),(SOURCE/'monsters'/'License.txt','Quaternius-Monsters.txt'),(SOURCE/'nature'/'License.txt','Kenney-Nature.txt'),(ROOT/'node_modules'/'three'/'LICENSE','Three-MIT.txt')]:shutil.copy2(path,licenses/name)
(ROOT/'assets'/'model-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(len(models),'models;',sum(m['bytes'] for m in manifest),'GLB bytes;', (ROOT/'models.js').stat().st_size,'offline bundle bytes')
