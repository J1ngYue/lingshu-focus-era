const assert=require('node:assert/strict'),{sampleCombat}=require('./combat-motion.cjs');
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
