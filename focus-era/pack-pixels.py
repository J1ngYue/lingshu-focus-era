"""Package local, licensed sprite frames and semantic pixel icons for the game."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, shutil

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'assets/pixel'
DUNGEON = OUT / 'dungeon/0x72_DungeonTilesetII_v1.7'
ICONS = OUT / "kyrise/Kyrise's 16x16 RPG Icon Pack - V1.3/icons/16x16"
OUT.mkdir(exist_ok=True)
for folder in ['nodes', 'ui', 'portraits']:
    (OUT / folder).mkdir(exist_ok=True)
shutil.copyfile(DUNGEON / '0x72_DungeonTilesetII_v1.7.png', OUT / 'dungeon.png')
rects = {}
for line in (DUNGEON / 'tile_list_v1.7').read_text().splitlines():
    fields = line.split()
    if len(fields) == 5:
        rects[fields[0]] = list(map(int, fields[1:]))
atlas = Image.open(OUT / 'dungeon.png').convert('RGBA')
roles = {'Knight': 'knight_m', 'Mage': 'wizzard_m', 'Rogue_Hooded': 'elf_m'}
monsters = [
    ['tiny_slug', 'goblin', 'orc_shaman', 'ogre'],
    ['lizard_f', 'elf_f', 'lizard_m', 'big_zombie'],
    ['skelet', 'masked_orc', 'imp', 'ogre'],
    ['angel', 'imp', 'doc', 'wizzard_f'],
    ['chort', 'lizard_m', 'angel', 'big_demon'],
    ['slug', 'orc_warrior', 'chort', 'big_demon'],
    ['angel', 'wogol', 'doc', 'big_zombie'],
    ['masked_orc', 'lizard_f', 'wogol', 'big_demon']
]
for name, actor in list(roles.items()) + [(f'monster-{i}-{j}', actor) for i, group in enumerate(monsters) for j, actor in enumerate(group)]:
    x, y, w, h = rects.get(actor + '_idle_anim_f0', rects.get(actor+'_anim_f0'))
    image = atlas.crop((x, y, x+w, y+h))
    # Portraits use the same actual game sprite, on a transparent square.
    portrait = Image.new('RGBA', (40, 40))
    if name.startswith('monster'):
        i = int(name.split('-')[1])
        tint = ['#79aa70','#8bbdbc','#caad71','#b5a2d0','#95bdd3','#dc9174','#b098cc','#bea575'][i]
        overlay = Image.new('RGBA', image.size, tint)
        overlay.putalpha(image.getchannel('A').point(lambda a: int(a*.18)))
        image = Image.alpha_composite(image, overlay)
    portrait.paste(image, ((40-w)//2, (40-h)//2+2), image)
    portrait.save(OUT / 'portraits' / (name+'.png'))

app_icon=Image.new('RGBA',(64,64),'#f4e7c9');d=ImageDraw.Draw(app_icon)
d.rectangle((1,1,62,62),outline='#77634b',width=3);d.rectangle((5,5,58,58),outline='#c9b48a',width=2)
app_icon.alpha_composite(Image.open(OUT/'portraits/Knight.png').resize((56,56),Image.Resampling.NEAREST),(4,2))
app_icon.save(OUT/'app.ico',format='ICO',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64)])

# The original ground and foliage are recolored together, preventing tile seams.
town = Image.open(ROOT/'assets/kenney/tiny-town/Tilemap/tilemap_packed.png').convert('RGBA')
for region, color in enumerate(['#84a369','#79a18c','#b69165','#958fa5','#8faba3','#b68361','#9e90b1','#a29e71']):
    target=tuple(int(color[i:i+2],16) for i in (1,3,5));terrain=town.copy()
    terrain.putdata([tuple(min(255,round(v*t/ref)) for v,t,ref in zip((r,g,b),target,(132,194,100)))+(a,) if g>r*1.15 and g>b*1.1 else (r,g,b,a) for r,g,b,a in town.getdata()])
    terrain.save(OUT/f'town-{region}.png')

def original(kind):
    """Small code-drawn pixel symbols for technology and interface actions."""
    im = Image.new('RGBA', (16,16)); d = ImageDraw.Draw(im)
    dark, mid, light, green, gold = '#473e39','#9b795b','#f4d6a0','#789662','#d89b4d'
    def box(x,y,w,h,color): d.rectangle((x,y,x+w-1,y+h-1),fill=color)
    def line(points,color=dark,width=1): d.line(points, fill=color,width=width)
    if kind in ['house','city','school','factory','temple']:
        box(3,6,10,8,dark);box(4,7,8,6,light);box(6,10,3,4,mid)
        if kind=='factory': box(3,2,3,5,dark);box(9,4,3,3,mid);box(3,8,10,2,gold)
        elif kind=='city': box(1,3,4,11,dark);box(2,4,2,2,light);box(11,1,4,13,dark);box(12,3,2,3,light)
        elif kind=='temple':box(1,5,14,2,mid);line([(2,4),(8,1),(14,4)],dark,2);box(5,8,1,5,mid);box(10,8,1,5,mid)
        else:line([(2,6),(8,1),(14,6)],dark,2);line([(4,5),(8,3),(12,5)],gold,2)
    elif kind in ['cog','engine','reactor','chip','robot']:
        box(4,3,8,10,dark);box(3,5,10,6,dark);box(5,4,6,8,mid);box(6,6,4,4,light);box(7,7,2,2,green)
        for x,y in [(1,6),(13,6),(6,0),(6,14)]:box(x,y,3,2,mid)
        if kind=='chip':box(5,5,6,6,green);box(6,6,4,4,'#c6dfb2')
        if kind=='robot':box(5,5,2,2,light);box(9,5,2,2,light);box(6,10,4,1,dark)
        if kind=='reactor':line([(7,5),(5,9),(9,9),(8,12)],'#f5ba64',2)
    elif kind in ['planet','galaxy','portal','orbit','star','sun','moon']:
        d.ellipse((3,3,12,12),fill=dark);d.ellipse((4,4,11,11),fill=gold if kind in ['star','sun'] else '#8095b1')
        box(5,5,2,2,light);box(8,9,3,2,green)
        if kind in ['galaxy','portal','orbit']:line([(0,10),(3,12),(12,3),(15,5)],light,2);box(1,1,1,1,gold);box(14,13,1,1,gold)
        if kind=='moon':d.ellipse((7,1,14,11),fill=(0,0,0,0))
        if kind in ['star','sun']:box(7,0,2,3,gold);box(0,7,3,2,gold);box(13,7,3,2,gold);box(7,13,2,3,gold)
    elif kind in ['rocket','ship','satellite','airship']:
        line([(4,11),(8,2),(12,11)],dark,3);box(5,6,7,6,mid);box(7,4,3,7,light);box(7,7,2,2,'#88afb1');box(6,13,4,2,gold)
        if kind in ['ship','airship']:box(1,10,14,3,dark);box(3,3,10,5,gold);box(5,2,6,1,light)
        if kind=='satellite':box(0,4,4,7,'#88afb1');box(12,4,4,7,'#88afb1');line([(4,7),(12,7)],dark)
    elif kind in ['battery','tower','water','wind','flame','bolt']:
        if kind=='battery':box(5,1,6,2,dark);box(3,3,10,12,dark);box(4,4,8,10,green);box(5,5,6,2,light)
        elif kind=='flame':d.polygon([(8,0),(11,6),(13,5),(14,10),(11,14),(4,14),(2,10),(5,4),(6,8)],fill=dark);d.polygon([(8,3),(10,8),(12,8),(11,12),(5,12),(4,9),(7,6)],fill='#d57c42');box(7,9,3,4,'#f0c66c')
        elif kind=='bolt':d.polygon([(9,0),(3,9),(7,9),(6,15),(13,5),(9,5)],fill=dark);line([(9,2),(5,8),(10,8),(7,13)],'#f2c862',2)
        elif kind=='water':d.polygon([(8,1),(3,9),(3,12),(6,15),(10,15),(13,12),(13,9)],fill=dark);d.polygon([(8,4),(5,10),(5,12),(8,13),(11,11)],fill='#80adba');box(6,9,1,3,light)
        elif kind=='wind':box(7,3,2,12,mid);line([(2,2),(13,13)],dark,3);line([(13,2),(2,13)],dark,3);box(7,7,2,2,light)
        else:box(4,4,8,11,mid);box(3,2,10,3,dark);box(5,7,2,2,light);box(9,7,2,2,light)
    elif kind in ['road','map','scroll','flag']:
        box(2,2,12,12,dark);box(3,3,10,10,light);line([(5,4),(6,8),(11,7),(10,12)],green,2);box(8,5,2,2,gold)
        if kind=='flag':box(3,1,2,14,mid);box(5,2,8,6,gold)
    elif kind in ['heart','eye','spear','saber','snow']:
        if kind=='heart':d.polygon([(1,4),(4,2),(7,4),(9,2),(13,2),(15,5),(15,8),(8,15),(1,8)],fill=dark);d.polygon([(3,4),(5,4),(8,7),(10,4),(13,4),(13,8),(8,12),(3,8)],fill='#cd7867');box(4,5,2,2,'#edb598')
        elif kind=='eye':d.polygon([(0,8),(4,4),(11,4),(15,8),(11,12),(4,12)],fill=dark);box(3,6,10,4,light);box(6,5,4,6,green);box(7,7,2,3,dark)
        elif kind=='spear':line([(3,14),(11,6)],mid,2);d.polygon([(8,5),(15,0),(13,7),(11,7)],fill=dark);line([(11,5),(13,2)],light,2)
        elif kind=='saber':d.polygon([(3,13),(6,9),(11,4),(14,1),(14,7),(9,11),(6,13)],fill=dark);d.polygon([(6,11),(11,5),(13,3),(12,7),(8,11)],fill='#dadfd2');line([(1,14),(4,11)],mid,2);line([(3,10),(7,14)],gold,2)
        else:line([(8,1),(8,14)],dark,3);line([(2,4),(14,11)],dark,3);line([(2,11),(14,4)],dark,3);line([(8,2),(8,13)],'#b5dce2');line([(3,4),(13,10)],'#b5dce2');line([(3,10),(13,4)],'#b5dce2')
    elif kind in ['play','pause','stop','plus','check','arrow','download','upload','edit','trash','focus','settings']:
        if kind=='play':d.polygon([(4,2),(13,8),(4,14)],fill=dark);d.polygon([(5,4),(10,8),(5,11)],fill=green)
        elif kind=='pause':box(3,2,4,12,dark);box(9,2,4,12,dark);box(4,3,2,9,gold);box(10,3,2,9,gold)
        elif kind=='stop':box(3,3,10,10,dark);box(4,4,8,8,gold)
        elif kind=='plus':box(7,2,2,12,green);box(2,7,12,2,green)
        elif kind=='focus':
            for x,y,dx,dy in [(1,1,1,1),(14,1,-1,1),(1,14,1,-1),(14,14,-1,-1)]:line([(x+dx*3,y),(x,y),(x,y+dy*3)],dark,2)
            box(6,6,4,4,green);box(7,7,2,2,light)
        elif kind=='check':line([(2,8),(6,12),(14,3)],dark,3);line([(2,7),(6,11),(13,3)],green,2)
        elif kind in ['arrow','download','upload']:line([(2,8),(13,8)],mid,2);line([(9,4),(13,8),(9,12)],mid,2)
        elif kind=='edit':line([(3,13),(12,4)],dark,4);line([(4,12),(12,4)],gold,2);box(2,12,2,2,mid)
        elif kind=='trash':box(4,4,8,11,dark);box(5,5,6,9,mid);box(2,2,12,2,dark);box(6,0,4,2,dark)
        else:return original('cog')
    else:return original('star')
    return im

def source(name):
    return Image.open(ICONS / (name+'.png')).convert('RGBA') if (ICONS / (name+'.png')).exists() else original(name)

tech_symbols = [
 ['flame','leaf_01a','water','house','road','coin_01a','school','city','ship','book_01a','school','flower_01a','airship','temple','planet','rocket','galaxy','portal'],
 ['water','wind','engine','bolt','battery','crystal_01a','tower','reactor','orbit','reactor','battery','portal','sun','orbit','star','rocket','galaxy','reactor'],
 ['stoneblock_01a','ingot_01a','ingot_01b','cog','cog','factory','engine','factory','robot','chip','shield_01a','heart','chip','factory','planet','rocket','sun','star'],
 ['plank_01a','tower','bow_01a','flame','armor_01a','shield_01c','tower','robot','airship','eye','satellite','robot','shield_03c','rocket','city','orbit','portal','shield_03e'],
 ['scroll_01a','book_01a','scroll_01b','star','book_02a','book_03a','potion_01b','chip','chip','chip','tower','reactor','map','eye','orbit','galaxy','planet','book_06e'],
 ['map','map','ship','map','airship','airship','ship','tower','rocket','planet','portal','portal','map','ship','satellite','portal','orbit','galaxy']
]
colors = ['#ca7758','#739ba7','#d0a550','#799c6d','#a18bae','#7e91b5']
for path in ['tech','cultivation','arcane']:
    for branch in range(6):
        for step in range(18):
            if path=='tech': symbol=tech_symbols[branch][step]
            elif path=='cultivation':
                symbol=['crystal_01'+chr(97+(step//2)%10),'sword_0'+str(step//6+1)+chr(97+step%5),'spear','saber','armor_01'+chr(97+step%5),'eye'][branch]
            else:
                letter=['d','c','e','a','e','b'][branch];element=['flame','snow','bolt','leaf_01a','star','portal'][branch]
                symbol=[element,'arrow_01'+letter,element,'scroll_01'+letter,'ring_01'+letter,'shield_01'+letter,'spellbook_01'+letter,'staff_01'+letter,'crystal_01'+letter,'ring_03'+letter,'staff_03'+letter,'scroll_01'+letter,'planet','shield_03'+letter,'spellbook_03'+letter,'staff_03'+letter,'crystal_01'+letter,'galaxy'][step]
            im=Image.new('RGBA',(24,24)); d=ImageDraw.Draw(im)
            d.rectangle((1,1,22,22),fill='#403c35');d.rectangle((2,2,21,21),fill={'tech':'#f3e7c9','cultivation':'#e4e8c9','arcane':'#ede1da'}[path]);d.rectangle((3,3,20,20),fill=colors[branch]+'55')
            art=source(symbol);im.paste(art,(4,3),art)
            # A six-stage rune strip distinguishes every node while preserving its symbol.
            for bit in range(5):
                d.rectangle((4+bit*3,20,5+bit*3,21),fill=colors[branch] if (step+1)&(1<<bit) else '#d4c5a7')
            im.save(OUT/'nodes'/f'{path}-{branch}-{step}.png')
ui = {'home':'house','cpu':'chip','leaf':'leaf_01a','spark':'flame','sword':'sword_02a','map':'map','gem':'gem_01b','book':'book_02a','star':'star','crown':'helmet_02a','clock':'orbit','bolt':'bolt','shield':'shield_02a','heart':'heart','orbit':'orbit','sun':'sun','snow':'snow','flask':'potion_01b','eye':'eye','moon':'moon'}
for name in ['check','settings','focus','plus','play','pause','stop','edit','trash','arrow','download','upload']:ui[name]=name
for name,symbol in ui.items():source(symbol).save(OUT/'ui'/f'{name}.png')
metadata = {'atlas':'assets/pixel/dungeon.png','rects':rects,'roles':roles,'monsters':[[f'monster-{i}-{j}' for j in range(4)] for i in range(8)],'actors':{f'monster-{i}-{j}':a for i,g in enumerate(monsters) for j,a in enumerate(g)}}
(ROOT/'pixel-data.js').write_text('/* Local sprite coordinates: 0x72 DungeonTileset II, CC0. */\nvar FocusPixels = '+json.dumps(metadata,separators=(',',':'))+';\nFocusPixels.icon = (name,cls="") => `<img class="icon pixel-icon ${cls}" src="assets/pixel/ui/${name}.png" alt="" aria-hidden="true">`;\nFocusPixels.nodeIcon = id => `<img class="node-pixel" src="assets/pixel/nodes/${id}.png" alt="" aria-hidden="true">`;\nif(typeof module!=="undefined")module.exports=FocusPixels;\n',encoding='utf8')
(OUT/'LICENSES.md').write_text('''# Pixel art credits

* 0x72 / Robert: DungeonTileset II v1.7. CC0 1.0. https://0x72.itch.io/dungeontileset-ii
  License: https://creativecommons.org/publicdomain/zero/1.0/
  Atlas and sprite coordinates retained; portraits cropped and region colors tinted.
* Kyrise: Kyrise’s Free 16x16 RPG Icon Pack, v1.3 (2018). CC BY 4.0.
  Source: https://kyrise.itch.io/kyrises-free-16x16-rpg-icon-pack
  License: https://creativecommons.org/licenses/by/4.0/
  Icons composited into 24px node frames with stage markings. Some colors/frames changed.
* Kenney: Tiny Town / Tiny Dungeon / Tiny Battle. CC0 1.0.
  https://kenney.nl/assets/tiny-town — original licenses in ../kenney/.
* Technology / action pixel symbols: original code-drawn artwork for this project.

The referenced commercial idle games supply design references only. Their art is not included.
''',encoding='utf8')
print('Packaged animated atlas, 35 portraits, 324 node icons and',len(ui),'interface icons.')
