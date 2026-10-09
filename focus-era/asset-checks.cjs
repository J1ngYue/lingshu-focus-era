const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,D=require('./data.js'),E=require('./engine.js'),P=require('./pixel-data.js');
global.FocusData=D;global.FocusEngine=E;global.FocusPixels=P;global.FocusArt=require('./ink-art.js');
const Tree=require('./tree.js'),state=E.create();
function png(relative,w,h){const b=fs.readFileSync(path.join(root,relative));assert.equal(b.subarray(1,4).toString(),'PNG',relative);if(w)assert.equal(b.readUInt32BE(16),w);if(h)assert.equal(b.readUInt32BE(20),h);return b;}
const iconHashes=new Set(),inkGlyphs=new Set(),motifs=new Set();
for(const treePath of Object.keys(D.paths)){
 const graph=Tree.layout(treePath);assert.equal(graph.nodes.length,108);
 assert.equal(new Set(graph.nodes.map(n=>`${n.x},${n.y}`)).size,108,'overlapping coordinates');
 for(const n of graph.nodes){
  assert.ok(n.x>60&&n.x<graph.width-60&&n.y>60&&n.y<graph.height-60,n.id+' outside graph');
  if(n.parent)assert.ok(graph.nodes.some(p=>p.id===n.parent),n.id+' disconnected');
  const seen=new Set();let walk=n;while(walk){assert.ok(!seen.has(walk.id),'cycle '+n.id);seen.add(walk.id);walk=graph.nodes.find(p=>p.id===walk.parent);}
  iconHashes.add(crypto.createHash('sha256').update(png('assets/pixel/nodes/'+n.id+'.png',24,24)).digest('hex'));
  const spec=FocusArt.nodeSpec(n.id);assert.ok(spec,'missing ink icon: '+n.id);
  for(const part of [spec.primary,spec.accent])assert.ok(FocusArt.iconNames.includes(part),'unknown symbol '+part+' in '+n.id);
  const ink=FocusArt.nodeIcon(n.id);assert.ok(!ink.includes('undefined'),n.id+' invalid path');
  inkGlyphs.add(ink.match(/<svg[\s\S]*<\/svg>/)[0]);motifs.add(spec.primary+'/'+spec.accent);
 }
 for(const n of graph.nodes)for(const m of graph.nodes)if(n.id!==m.id)assert.ok(Math.hypot(n.x-m.x,n.y-m.y)>85,'nodes collide: '+n.id+' '+m.id);
 assert.ok(graph.nodes.some(n=>graph.nodes.filter(c=>c.parent===n.id).length>1),'no actual forks');
 const html=Tree.render(treePath,state,()=>'',s=>s,graph.nodes[0].id);
 assert.equal((html.match(/data-action="select-node"/g)||[]).length,108);
 assert.equal((html.match(/data-edge=/g)||[]).length,216);
 assert.equal((html.match(/class="node-ink"/g)||[]).length,108);
 assert.equal((html.match(/data-flow=/g)||[]).length,108,'each node needs an incoming feedback path');
}
assert.equal(iconHashes.size,324,'every node needs its own identifiable icon');
assert.equal(inkGlyphs.size,324,'current ink drawings must differ without relying on node IDs or rank numbers');
assert.ok(motifs.size>280,'icons must represent specific content rather than repeating a branch symbol');
const atlas=png(P.atlas),aw=atlas.readUInt32BE(16),ah=atlas.readUInt32BE(20);
for(const [name,[x,y,w,h]] of Object.entries(P.rects))assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=aw&&y+h<=ah,'frame outside atlas: '+name);
for(const actor of new Set([...Object.values(P.roles),...Object.values(P.actors)]))for(const anim of ['idle','run'])for(let frame=0;frame<4;frame++)assert.ok(P.rects[actor+'_'+anim+'_anim_f'+frame]||P.rects[actor+'_anim_f'+frame],actor+' missing '+anim+' frame '+frame);
for(const name of [...Object.keys(P.roles),...Object.keys(P.actors)])png('assets/pixel/portraits/'+name+'.png',40,40);
for(let i=0;i<8;i++)png('assets/pixel/town-'+i+'.png');
for(const f of fs.readdirSync(path.join(root,'assets/pixel/ui')))png('assets/pixel/ui/'+f,16,16);
const licenses=fs.readFileSync(path.join(root,'assets/pixel/LICENSES.md'),'utf8');assert.match(licenses,/0x72/);assert.match(licenses,/CC0/);assert.match(licenses,/Kyrise/);assert.match(licenses,/CC BY 4.0/);assert.match(licenses,/changed/);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(!/src="(?:models|scene)\.js"/.test(html),'legacy WebGL model bundles are still loaded');assert.match(html,/ink-scene.js/);assert.ok(!/src="pixel-(?:data|scene)\.js"/.test(html));
const shared=require('./combat-motion.cjs'),pixel=require('./pixel-motion.js');for(let t=0;t<2;t+=.013)for(const ranged of [false,true])for(const lethal of [false,true])assert.deepEqual(pixel.sampleCombat(t,ranged,lethal),shared.sampleCombat(t,ranged,lethal));
console.log(`PASS: 324 connected, branching nodes with 324 unique pixel icons; ${Object.keys(P.rects).length} atlas frames, idle/run animation, 35 portraits, 8 terrains, attribution, offline entry and shared motion.`);

for(const name of ['forest','scholar-city','metro','moon-palace','sky-isles','forge','void-palace','celestial-city']){const b=png('assets/ink/'+name+'.png');assert.ok(b.readUInt32BE(16)>=1200,'landscape too small');}
for(const role of ['Knight','Mage','Rogue_Hooded'])for(const pose of ['idle','attack','hurt'])png('assets/ink/'+role+'-'+pose+'.png',480,360);
const cultivators=require('./cultivator-art.js'),cultivatorAtlas=png('assets/ink/'+cultivators.image+'.png');assert.equal(cultivatorAtlas[25],6,'cultivator atlas must preserve alpha');assert.equal(Object.keys(cultivators.frames).length,9);assert.match(html,/cultivator-art.js/);assert.ok(!html.includes('Knight-idle.png'),'startup still shows old crossbow role');
for(const role of ['Knight','Mage','Rogue_Hooded'])for(const pose of ['idle','attack','hurt']){const f=cultivators.frames[role+'-'+pose];assert.ok(f,'missing cultivation pose');const [x,y,w,h]=f.source,[left,top,fw,fh]=f.frame;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=cultivatorAtlas.readUInt32BE(16)&&y+h<=cultivatorAtlas.readUInt32BE(20));assert.ok(left>=0&&top>=0&&left+fw<=480&&top+fh<=360);assert.ok(Math.abs(top+fh-345)<1e-8,'feet not aligned');assert.ok(f.grip[0]>0&&f.grip[0]<480&&f.grip[1]>0&&f.grip[1]<360,'invalid sword grip');}
for(const monster of ['slime','goblin','skeleton','demon','wolf','treant','ghost','dragon'])png('assets/ink/'+monster+'.png',480,400);
console.log(`PASS: 8 illustrated maps, 9 new transparent cultivator poses with sword grips, 8 monsters, 324 distinct ink drawings / ${motifs.size} content-specific motifs, 324 animated incoming paths.`);
