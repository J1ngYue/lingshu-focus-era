"""Extract generated sprite atlases into offline, baseline-aligned game assets."""
from pathlib import Path
import shutil
from PIL import Image
import numpy as np
from scipy.ndimage import label

ROOT = Path(__file__).resolve().parent
SOURCE = Path(r'C:\Users\JLY\.codex\generated_images\01a11191-ef54-76f0-9f54-46159e7a528e')
OUT = ROOT / 'assets' / 'ink'
OUT.mkdir(parents=True, exist_ok=True)
sources = {
    'forest.png': 'exec-4018713d-8cfb-4257-892d-00509691fba3.png',
    'heroes.png': 'exec-174764ba-3b61-4065-b7f0-ebd8ceaab208.png',
    'monsters.png': 'exec-c186b398-dcda-4d21-b115-b923053e7ad2.png',
    'scholar-city.png': 'exec-d21062d8-4d70-4422-9fdc-7db85769b9fe.png',
    'metro.png': 'exec-81b2bd00-d0e0-485e-a2f6-22ce9489786d.png',
    'moon-palace.png': 'exec-e3ce7580-cafb-4ad2-a82a-371fb0735ecb.png',
    'sky-isles.png': 'exec-a64b0548-5180-4a82-9ae4-5c959aa00da7.png',
    'forge.png': 'exec-9be5db85-b013-4380-9d92-cfbb36f9c21d.png',
    'void-palace.png': 'exec-433112d4-fdca-481c-bee2-4761e9cff96b.png',
    'celestial-city.png': 'exec-cf2f59d2-04cd-4e90-a4f5-eaefaeb800b4.png',
}
for target, source in sources.items():
    if (SOURCE / source).exists():
        shutil.copy2(SOURCE / source, OUT / target)

heroes = Image.open(OUT / 'heroes.png').convert('RGBA')
for column, role in enumerate(['Knight', 'Rogue_Hooded', 'Mage']):
    for row, pose in enumerate(['idle', 'attack', 'hurt']):
        sprite = heroes.crop((round(column*heroes.width/3), round(row*heroes.height/3), round((column+1)*heroes.width/3), round((row+1)*heroes.height/3)))
        box = sprite.getchannel('A').point(lambda a: 255 if a > 45 else 0).getbbox()
        sprite = sprite.crop(box)
        # A common scale preserves pose sizes; feet align in every animation.
        sprite.thumbnail((442, 310), Image.Resampling.LANCZOS)
        frame = Image.new('RGBA', (480, 360))
        frame.alpha_composite(sprite, ((480-sprite.width)//2, 345-sprite.height))
        frame.save(OUT / f'{role}-{pose}.png', optimize=True)

monsters = Image.open(OUT / 'monsters.png').convert('RGBA')
names = ['slime', 'goblin', 'skeleton', 'demon', 'wolf', 'treant', 'ghost', 'dragon']
for i, name in enumerate(names):
    col, row = i % 4, i // 4
    top, bottom = (0, 478) if row == 0 else (478, 887)
    sprite = monsters.crop((round(col*1774/4), top, round((col+1)*1774/4), bottom))
    # Ignore a neighboring sprite's disconnected sword/feet at a grid edge.
    alpha = np.asarray(sprite.getchannel('A'))
    components, _ = label(alpha > 30)
    counts = np.bincount(components.ravel())
    counts[0] = 0
    principal = int(counts.argmax())
    sprite.putalpha(Image.fromarray(np.where(components == principal, alpha, 0).astype('uint8')))
    box = sprite.getchannel('A').point(lambda a: 255 if a > 45 else 0).getbbox()
    sprite = sprite.crop(box)
    sprite.thumbnail((420, 350), Image.Resampling.LANCZOS)
    frame = Image.new('RGBA', (480, 400))
    frame.alpha_composite(sprite, ((480-sprite.width)//2, 380-sprite.height))
    frame.save(OUT / f'{name}.png', optimize=True)

icon = Image.open(OUT / 'Knight-idle.png').crop((110, 5, 365, 265))
icon.save(OUT / 'app.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
print('Saved forest, 9 hero poses, 8 monsters and desktop icon:', OUT)
