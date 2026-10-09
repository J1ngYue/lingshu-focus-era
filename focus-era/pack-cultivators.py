"""Read alpha bounds and write atlas coordinates; leave generated pixels unchanged."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent
image = Image.open(root / 'assets/ink/cultivators-v2.png')
frames = {}
hands = [[(270, 220), (198, 572), (180, 901)], [(726, 220), (667, 571), (703, 906)], [(1207, 220), (1156, 583), (1167, 909)]]
for column, role in enumerate(['Knight', 'Rogue_Hooded', 'Mage']):
    rows = [0, 383, 727, image.height]
    bounds = []
    for row, pose in enumerate(['idle', 'attack', 'hurt']):
        cell = (round(column * image.width / 3), rows[row],
                round((column + 1) * image.width / 3), rows[row + 1])
        alpha = image.crop(cell).getchannel('A').point(lambda value: 255 if value > 45 else 0)
        box = alpha.getbbox()
        assert box, (role, pose)
        bounds.append((pose, [cell[0] + box[0], cell[1] + box[1], box[2] - box[0], box[3] - box[1]]))
    scale = min(442 / max(b[2] for _, b in bounds), 310 / max(b[3] for _, b in bounds))
    for row, (pose, source) in enumerate(bounds):
        width, height = source[2] * scale, source[3] * scale
        left, top = (480-width)/2, 345-height
        frames[role + '-' + pose] = {'source': source, 'frame': [left, top, width, height],
                                   'grip': [left+(hands[column][row][0]-source[0])*scale, top+(hands[column][row][1]-source[1])*scale]}
output = {'image': 'cultivators-v2', 'frames': frames}
(root / 'cultivator-art.js').write_text('var FocusCultivators = ' + json.dumps(output, separators=(',', ':')) + ';\nif (typeof module !== "undefined") module.exports = FocusCultivators;\n', encoding='utf-8')
print(json.dumps(output, indent=2))
