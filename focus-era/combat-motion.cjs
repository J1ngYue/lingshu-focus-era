const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function sampleCombat(t,ranged=false,lethal=false){
 const heroMove=ranged?0:t<.27?ease(t/.27):t<.58?1:t<.86?1-ease((t-.58)/.28):0;
 const enemyMove=lethal?0:t<.82?0:t<1.04?ease((t-.82)/.22):t<1.43?1:t<1.73?1-ease((t-1.43)/.3):0;
 let heroAction=t<.27?(ranged?'Idle':'Walk'):t<.58?(ranged?'Spellcast_Shoot':'Attack'):t<.86?(ranged?'Idle':'Walk'):lethal&&t<1.6?'Cheer':!lethal&&t>=1.2&&t<1.43?'Hit':'Idle';
 const enemyAction=lethal&&t>=.48?'Death':t>=.48&&t<.72?'Hit':t>=.82&&t<1.04?'Walk':t>=1.04&&t<1.43?'Attack':t>=1.43&&t<1.73?'Walk':'Idle';
 return {heroMove,enemyMove,heroAction,enemyAction,heroImpact:t>=.48,enemyImpact:!lethal&&t>=1.2,done:t>=1.8};
}
module.exports={sampleCombat};
