const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,D=require('./data.js'),E=require('./engine.js'),P=require('./pixel-data.js');
global.FocusData=D;global.FocusEngine=E;global.FocusPixels=P;
const Tree=require('./tree.js'),state=E.create();
function png(relative,w,h){const b=fs.readFileSync(path.join(root,relative));assert.equal(b.subarray(1,4).toString(),'PNG',relative);if(w)assert.equal(b.readUInt32BE(16),w);if(h)assert.equal(b.readUInt32BE(20),h);return b;}
const iconHashes=new Set();
for(const treePath of Object.keys(D.paths)){
 const graph=Tree.layout(treePath);assert.equal(graph.nodes.length,108);
 assert.equal(new Set(graph.nodes.map(n=>`${n.x},${n.y}`)).size,108,'overlapping coordinates');
 for(const n of graph.nodes){
  assert.ok(n.x>60&&n.x<graph.width-60&&n.y>60&&n.y<graph.height-60,n.id+' outside graph');
  if(n.parent)assert.ok(graph.nodes.some(p=>p.id===n.parent),n.id+' disconnected');
  const seen=new Set();let walk=n;while(walk){assert.ok(!seen.has(walk.id),'cycle '+n.id);seen.add(walk.id);walk=graph.nodes.find(p=>p.id===walk.parent);}
  iconHashes.add(crypto.createHash('sha256').update(png('assets/pixel/nodes/'+n.id+'.png',24,24)).digest('hex'));
 }
 for(const n of graph.nodes)for(const m of graph.nodes)if(n.id!==m.id)assert.ok(Math.hypot(n.x-m.x,n.y-m.y)>85,'nodes collide: '+n.id+' '+m.id);
 assert.ok(graph.nodes.some(n=>graph.nodes.filter(c=>c.parent===n.id).length>1),'no actual forks');
 const html=Tree.render(treePath,state,()=>'',s=>s,graph.nodes[0].id);
 assert.equal((html.match(/data-action="select-node"/g)||[]).length,108);
 assert.equal((html.match(/data-edge=/g)||[]).length,216);
 assert.equal((html.match(/class="node-pixel"/g)||[]).length,108);
}
assert.equal(iconHashes.size,324,'every node needs its own identifiable icon');
const atlas=png(P.atlas),aw=atlas.readUInt32BE(16),ah=atlas.readUInt32BE(20);
for(const [name,[x,y,w,h]] of Object.entries(P.rects))assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=aw&&y+h<=ah,'frame outside atlas: '+name);
for(const actor of new Set([...Object.values(P.roles),...Object.values(P.actors)]))for(const anim of ['idle','run'])for(let frame=0;frame<4;frame++)assert.ok(P.rects[actor+'_'+anim+'_anim_f'+frame]||P.rects[actor+'_anim_f'+frame],actor+' missing '+anim+' frame '+frame);
for(const name of [...Object.keys(P.roles),...Object.keys(P.actors)])png('assets/pixel/portraits/'+name+'.png',40,40);
for(let i=0;i<8;i++)png('assets/pixel/town-'+i+'.png');
for(const f of fs.readdirSync(path.join(root,'assets/pixel/ui')))png('assets/pixel/ui/'+f,16,16);
const licenses=fs.readFileSync(path.join(root,'assets/pixel/LICENSES.md'),'utf8');assert.match(licenses,/0x72/);assert.match(licenses,/CC0/);assert.match(licenses,/Kyrise/);assert.match(licenses,/CC BY 4.0/);assert.match(licenses,/changed/);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(!/src="(?:models|scene)\.js"/.test(html),'legacy WebGL model bundles are still loaded');assert.match(html,/pixel-scene.js/);
const shared=require('./combat-motion.cjs'),pixel=require('./pixel-motion.js');for(let t=0;t<2;t+=.013)for(const ranged of [false,true])for(const lethal of [false,true])assert.deepEqual(pixel.sampleCombat(t,ranged,lethal),shared.sampleCombat(t,ranged,lethal));
console.log(`PASS: 324 connected, branching nodes with 324 unique pixel icons; ${Object.keys(P.rects).length} atlas frames, idle/run animation, 35 portraits, 8 terrains, attribution, offline entry and shared motion.`);
