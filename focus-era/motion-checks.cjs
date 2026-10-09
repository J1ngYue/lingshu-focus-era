const assert=require('node:assert/strict'),{sampleCombat,sampleRig}=require('./combat-motion.cjs');
assert.equal(sampleCombat(.1).heroAction,'Walk');
assert.equal(sampleCombat(.35).heroAction,'Attack');
assert.equal(sampleCombat(.35).enemyAction,'Idle');
assert.equal(sampleCombat(.51).enemyAction,'Hit');
assert.equal(sampleCombat(1.1).enemyAction,'Attack');
assert.equal(sampleCombat(1.25).heroAction,'Hit');
assert.equal(sampleCombat(.51,false,true).enemyAction,'Death');
assert.equal(sampleCombat(1.3,false,true).enemyImpact,false);
assert.equal(sampleCombat(.35,true).heroAction,'Spellcast_Shoot');
for(const ranged of [false,true])for(const lethal of [false,true]){
 let last=sampleCombat(0,ranged,lethal);
 for(let i=1;i<=2000;i++){
  const m=sampleCombat(i/1000,ranged,lethal);
  for(const key of ['heroMove','enemyMove']){assert.ok(m[key]>=0&&m[key]<=1);assert.ok(Math.abs(m[key]-last[key])<.01,'movement discontinuity');}
  if(ranged)assert.equal(m.heroMove,0);
  if(lethal)assert.equal(m.enemyMove,0);
  last=m;
 }
 assert.equal(last.heroMove,0);assert.equal(last.enemyMove,0);assert.equal(last.done,true);
}
console.log('PASS: continuous approach/strike/retreat, staggered hits, ranged casting, lethal death without counterattack.');
for(const enemy of [false,true])for(const ranged of [false,true])for(const lethal of [false,true]){
 let previous=sampleRig(0,enemy,ranged,lethal,0);
 for(let i=1;i<2000;i++){const next=sampleRig(i/1000,enemy,ranged,lethal,i/1000);for(const [key,value] of Object.entries(next)){assert.ok(Number.isFinite(value));assert.ok(Math.abs(value-previous[key])<.04,key+' discontinuous');}if(enemy&&lethal)assert.equal(next.strike,0);if(!enemy&&ranged)assert.equal(next.walk,0);previous=next;}
 assert.ok(Object.values(sampleRig(.49,enemy,ranged,lethal,1,true)).every(v=>v===0));
}
assert.ok(sampleRig(.49).strike>.95);assert.ok(sampleRig(.56,true).hit>.95);assert.ok(sampleRig(1.29).hit>.95);assert.equal(sampleRig(2).attack,0);
console.log('PASS: continuous skeletal weights, impact recoil, footsteps, ranged casting, lethal motion and quiet mode.');
