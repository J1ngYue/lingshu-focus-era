const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=__dirname,D=require('./data.js'),E=require('./engine.js');
global.FocusData=D;global.FocusEngine=E;
const Tree=require('./tree.js'),state=E.create();
for(const treePath of Object.keys(D.paths)){
 const graph=Tree.layout(treePath);assert.equal(graph.nodes.length,108);
 assert.equal(new Set(graph.nodes.map(n=>`${n.x.toFixed(1)},${n.y.toFixed(1)}`)).size,108,'overlapping coordinates');
 for(const n of graph.nodes){assert.ok(n.x>60&&n.x<graph.width-60&&n.y>60&&n.y<graph.height-60,n.id+' outside graph');if(n.parent)assert.ok(graph.nodes.some(p=>p.id===n.parent),n.id+' disconnected');}
 const html=Tree.render(treePath,state,()=>'',s=>s,graph.nodes[0].id);
 assert.equal((html.match(/data-action="select-node"/g)||[]).length,108);
 assert.equal((html.match(/data-edge=/g)||[]).length,216,'108 main graph edges and 108 minimap edges');
}
const sandbox={};vm.runInNewContext(fs.readFileSync(path.join(root,'models.js'),'utf8'),sandbox);
const models=sandbox.FocusModels,manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/model-manifest.json')));
assert.equal(Object.keys(models).length,manifest.length);
const monsterNames=manifest.filter(m=>m.source==='monsters').map(m=>m.name);assert.equal(monsterNames.length,32);
assert.equal(new Set(monsterNames).size,32);
for(const item of manifest){
 const bytes=Buffer.from(models[item.name],'base64');assert.equal(bytes.length,item.bytes,item.name);
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(8),bytes.length);
 const jsonLength=bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 assert.ok(doc.meshes?.length,item.name+' empty mesh');assert.equal(doc.buffers.length,1);
 assert.equal(doc.buffers[0].uri,undefined,item.name+' external buffer');
 for(const image of doc.images||[]){assert.equal(image.uri,undefined,item.name+' external texture');assert.ok(Number.isInteger(image.bufferView));}
 for(const view of doc.bufferViews){assert.ok((view.byteOffset||0)+view.byteLength<=doc.buffers[0].byteLength,item.name+' truncated buffer');}
 if(item.source==='monsters'||item.source==='kaykit'){
  assert.ok(doc.skins?.length,item.name+' missing skeleton');assert.ok(doc.animations.length>=3,item.name+' missing animations');
  assert.ok(doc.animations.some(a=>/Idle/i.test(a.name)),item.name+' missing idle animation');
  assert.ok(doc.animations.some(a=>/Attack|Bite|Spellcast|Punch|Headbutt/i.test(a.name)),item.name+' missing attack animation');
  assert.ok(doc.animations.some(a=>/Death/i.test(a.name)),item.name+' missing death animation');
  assert.ok(fs.existsSync(path.join(root,'assets/portraits',item.name+'.webp')),item.name+' missing portrait');
 }
}
for(const name of ['KayKit-Characters.txt','KayKit-Environment.txt','Quaternius-Monsters.txt','Kenney-Nature.txt'])assert.match(fs.readFileSync(path.join(root,'assets/licenses',name),'utf8'),/CC0|Creative Commons Zero/);
assert.ok(fs.existsSync(path.join(root,'assets/licenses/Three-MIT.txt')));
console.log(`PASS: 324 connected graph coordinates, ${manifest.length} self-contained GLBs, 3 animated heroes, 32 distinct animated monsters, portraits and bundled licenses.`);
