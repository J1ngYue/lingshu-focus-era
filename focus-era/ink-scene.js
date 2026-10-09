/* Offline illustrated sprites, real equipment overlays, and engine-driven combat. */
var FocusScene = (() => {
  const D=FocusData,E=FocusEngine,base='assets/ink/',images={},particles=[];
  const maps=['forest','scholar-city','metro','moon-palace','sky-isles','forge','void-palace','celestial-city'];
  const floors=[.775,.745,.645,.72,.714,.705,.66,.68];
  const monsters=[['slime','goblin','treant','treant'],['treant','wolf','goblin','treant'],['demon','skeleton','ghost','demon'],['ghost','ghost','skeleton','ghost'],['wolf','dragon','ghost','dragon'],['slime','skeleton','ghost','demon'],['ghost','ghost','dragon','ghost'],['skeleton','dragon','ghost','demon']];
  let canvas,ctx,width,height,getState,ready=false,time=0,lastFrame=0,sequence,lastTurn,lastKills=-1,lastKey,shownEnemy,shownRegion=-1,lastHeroHp=0,lastEnemyHp=0,lastCoins=0,lastState;
  const metrics={frames:0,hits:0,loot:0,heroFrames:new Set(),enemyFrames:new Set(),renderer:'Canvas2D articulated sprite mesh',appearance:null,rig:null};
  const poseLayer=document.createElement('canvas');poseLayer.width=480;poseLayer.height=360;const poseCtx=poseLayer.getContext('2d');
  const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
  function deform(u,v,r,name){let x=u,y=v;const side=name==='hero'?1:-1,upper=1-smooth(.65,.97,v);
    x+=side*(r.strike*.09-r.wind*.065-r.hit*.08)*upper;y+=r.hit*.035*upper-r.breath*upper;
    if(name==='slime'){x=.5+(x-.5)*(1+r.wind*.2+r.hit*.22-r.strike*.15);y=1-(1-y)*(1-r.wind*.2-r.hit*.19+r.strike*.18);x+=r.sway*Math.sin(v*5);}
    else if(name==='ghost'){x+=Math.sin(v*8+time*4)*(.018+r.strike*.02)*smooth(.45,1,v)*(r.breath||r.sway?1:0);y-=Math.abs(r.breath)*2;}
    else if(name==='wolf'){y+=(r.wind*.06-r.strike*.055+r.hit*.05)*upper;x-=r.strike*.04*upper;}
    else {const front=name==='hero'?smooth(.53,.72,u):1-smooth(.28,.48,u),arm=front*smooth(.42,.62,v)*(1-smooth(.82,.97,v)),px=name==='hero'?.56:.42,py=.65,angle=side*(-r.wind*.85+r.strike*.48+r.hit*.3),dx=u-px,dy=v-py;
      x+=(dx*Math.cos(angle)-dy*Math.sin(angle)-dx)*arm;y+=(dx*Math.sin(angle)+dy*Math.cos(angle)-dy)*arm;
      if(name==='dragon'){const wing=Math.abs(u-.5)*2*(1-smooth(.55,.85,v));y+=(r.sway*5-r.wind*.1+r.strike*.08)*wing;}
      if(name==='treant'){x+=(r.sway*2+r.wind*.035-r.strike*.04)*Math.abs(u-.5)*upper;}
    }
    const leg=smooth(.78,1,v),foot=u<.5?1:-1;x+=r.step*.035*foot*leg;y-=Math.max(0,r.step*foot)*.055*leg;
    if(name==='hero')x+=r.sway*(1-smooth(.25,.6,u))*smooth(.3,.8,v);
    return {x,y};
  }
  function mesh(im,x,y,w,h,r,name){const cols=5,rows=[0,.2,.4,.6,.76,.88,1],grid=[];
    for(let j=0;j<rows.length;j++){grid[j]=[];for(let i=0;i<=cols;i++){const u=i/cols,v=rows[j],p=deform(u,v,r,name);grid[j][i]={u,v,x:x+p.x*w,y:y+p.y*h};}}
    function triangle(a,b,c){const bu=b.u-a.u,bv=b.v-a.v,cu=c.u-a.u,cv=c.v-a.v,det=bu*cv-cu*bv,bx=b.x-a.x,by=b.y-a.y,cx=c.x-a.x,cy=c.y-a.y;
      const aa=(bx*cv-cx*bv)/det,bb=(by*cv-cy*bv)/det,cc=(cx*bu-bx*cu)/det,dd=(cy*bu-by*cu)/det,mx=(a.x+b.x+c.x)/3,my=(a.y+b.y+c.y)/3;
      ctx.save();ctx.beginPath();for(const [i,p] of [a,b,c].entries()){const dx=p.x-mx,dy=p.y-my,length=Math.hypot(dx,dy)||1;ctx[i?'lineTo':'moveTo'](p.x+dx/length*.35,p.y+dy/length*.35);}ctx.closePath();ctx.clip();ctx.transform(aa,bb,cc,dd,a.x-aa*a.u-cc*a.v,a.y-bb*a.u-dd*a.v);ctx.drawImage(im,0,0,1,1);ctx.restore();
    }
    for(let j=0;j<rows.length-1;j++)for(let i=0;i<cols;i++){triangle(grid[j][i],grid[j][i+1],grid[j+1][i]);triangle(grid[j][i+1],grid[j+1][i+1],grid[j+1][i]);}
  }
  function load(name){if(images[name])return images[name];const im=new Image();im.src=base+name+'.png';images[name]=im;return im;}
  function heroName(state){const job=D.jobs.find(j=>j.id===state.job);return job?.path==='arcane'?'Mage':job?.path==='cultivation'?'Rogue_Hooded':'Knight';}
  function ground(){const css=getComputedStyle(document.documentElement);return height-parseFloat(css.getPropertyValue('--deck'))-parseFloat(css.getPropertyValue('--nav'))-12;}
  function positions(){const y=ground(),cx=width*.54,gap=Math.min(195,width*.16);return {hero:cx-gap,enemy:cx+gap,y,size:Math.min(190,Math.max(105,height*.225))};}
  function background(state){const name=maps[state.region],im=load(name),used=im.complete&&im.naturalWidth?im:images.forest;
    if(!used?.naturalWidth)return;const scale=Math.max(width/used.width,(ground()+90)/used.height),ratio=used===im?floors[state.region]:floors[0];
    ctx.drawImage(used,(width-used.width*scale)/2,ground()-used.height*ratio*scale,used.width*scale,used.height*scale);
    const shade=ctx.createLinearGradient(0,0,0,height);shade.addColorStop(0,'#162e3b16');shade.addColorStop(.62,'#14273300');shade.addColorStop(1,'#101e2980');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    if(!state.settings.quiet&&!matchMedia('(prefers-reduced-motion: reduce)').matches){ctx.save();ctx.globalAlpha=.16;ctx.fillStyle='#9ac8c5';for(let i=0;i<6;i++){const x=(i*width/5+time*4)%width;ctx.beginPath();ctx.ellipse(x,ground()-28-i%3*14,120,10,0,0,7);ctx.fill();}ctx.restore();}
  }
  function gearDraw(c,state,size,behind,rig={wind:0,strike:0,hit:0,sway:0}){const armor=D.equipment.find(e=>e.id===state.gear.armor),weapon=D.equipment.find(e=>e.id===state.gear.weapon),charm=D.equipment.find(e=>e.id===state.gear.charm);
    c.save();c.scale(size/150,size/150);c.translate((rig.strike*.09-rig.wind*.065-rig.hit*.08)*200,rig.hit*5);c.lineJoin='round';c.lineWidth=2;c.strokeStyle='#273337';
    if(behind&&armor){const colors=['#6e927c','#8b7b59','#8e79aa','#c7c3ab'];c.fillStyle=colors[armor.tier];c.beginPath();c.moveTo(-10,-99);c.lineTo(-42,-81);c.lineTo(-53,-29);c.lineTo(-35,-40);c.lineTo(-23,-22);c.lineTo(9,-70);c.closePath();c.fill();c.stroke();c.strokeStyle=['#c9c4a8','#d5b36e','#ceafdb','#d7e9e1'][armor.tier];c.beginPath();c.moveTo(-19,-83);c.lineTo(-40,-43);c.stroke();}
    if(!behind&&armor){c.fillStyle=['#779687','#b89867','#aa98c4','#e1dfc4'][armor.tier];c.beginPath();c.moveTo(-15,-58);c.lineTo(8,-62);c.lineTo(15,-46);c.lineTo(8,-20);c.lineTo(-11,-27);c.closePath();c.fill();c.stroke();c.fillStyle='#e0c790';c.fillRect(-11,-45,24,4);}
    if(!behind&&weapon){const colors=['#d0d3bc','#79d4d4','#bdacdf','#f5d994'];c.save();c.translate(21+rig.strike*8-rig.hit*7,-57+rig.hit*4);c.rotate(.35-rig.wind*.85+rig.strike*1.1);c.fillStyle=colors[weapon.tier];c.shadowColor=colors[weapon.tier];c.shadowBlur=weapon.tier*5;c.beginPath();c.moveTo(-3,8);c.lineTo(-3,-50-weapon.tier*6);c.lineTo(0,-60-weapon.tier*6);c.lineTo(4,-50-weapon.tier*6);c.lineTo(4,8);c.closePath();c.fill();c.stroke();c.fillStyle='#a58e59';c.fillRect(-9,7,20,4);c.fillStyle='#4a5047';c.fillRect(-3,11,7,16);c.restore();}
    if(!behind&&charm){const colors=['#8fb992','#e3bd7a','#ab9bcf','#f4d986'];c.fillStyle=colors[charm.tier];c.shadowColor=colors[charm.tier];c.shadowBlur=5+charm.tier*3;c.beginPath();c.arc(-10,-45,5+charm.tier,0,7);c.fill();c.stroke();c.shadowBlur=0;c.strokeStyle='#d8c9a0';c.beginPath();c.moveTo(-10,-39);c.lineTo(-10,-26);c.stroke();if(charm.tier>0){c.save();c.globalAlpha=.6;c.strokeStyle=colors[charm.tier];c.lineWidth=1.5;c.beginPath();c.ellipse(0,-72,42+charm.tier*4,58,0,0,7);c.stroke();c.restore();}}
    c.restore();
  }
  function hero(state,x,y,size,action,age,quiet,lethal){const name=heroName(state),r=FocusMotion.sampleRig(age,false,name!=='Rogue_Hooded',lethal,time,quiet),attack=r.attack*(1-r.hit),hurt=r.hit,idle=1-attack-hurt;if(!images[name+'-idle']?.naturalWidth)return;
    poseCtx.clearRect(0,0,480,360);poseCtx.globalCompositeOperation='lighter';for(const [pose,weight] of [['idle',idle],['attack',attack],['hurt',hurt]])if(weight>.001){poseCtx.globalAlpha=weight;poseCtx.drawImage(images[name+'-'+pose],0,0,480,360);metrics.heroFrames.add(name+'-'+pose);}poseCtx.globalAlpha=1;poseCtx.globalCompositeOperation='source-over';
    ctx.save();ctx.translate(x,y);ctx.rotate(-r.hit*.09);gearDraw(ctx,state,size,true,r);mesh(poseLayer,-size*2/3,-size*.96,size*4/3,size,r,'hero');gearDraw(ctx,state,size,false,r);ctx.restore();metrics.rig={hero:r,enemy:metrics.rig?.enemy};
    metrics.appearance={role:name,weapon:state.gear.weapon||null,armor:state.gear.armor||null,charm:state.gear.charm||null};
  }
  function enemy(state,name,x,y,size,action,alpha,quiet,age,lethal){const im=images[name],r=FocusMotion.sampleRig(age,true,false,lethal,time,quiet);if(!im?.naturalWidth)return;ctx.save();ctx.translate(x,y+r.death*size*.15);ctx.globalAlpha=alpha;ctx.rotate(r.hit*.09+r.death*.6);mesh(im,-size*.6,-size*.95,size*1.2,size,r,name);ctx.restore();metrics.enemyFrames.add(name+'-'+action);metrics.monster=name;metrics.rig={...metrics.rig,enemy:r};}
  function portrait(name){return base+name+(['Knight','Mage','Rogue_Hooded'].includes(name)?'-idle':'')+'.png';}
  function paintPortrait(target,state){if(!ready||!target)return;const key=[heroName(state),...['weapon','armor','charm'].map(k=>state.gear[k]||'')].join(':');if(target.dataset.appearance===key)return;target.dataset.appearance=key;
    const layer=document.createElement('canvas');layer.width=layer.height=240;const cc=layer.getContext('2d');cc.translate(119,228);gearDraw(cc,state,190,true);cc.drawImage(images[heroName(state)+'-idle'],-127,-182,254,190);gearDraw(cc,state,190,false);const out=target.getContext('2d');out.clearRect(0,0,target.width,target.height);out.drawImage(layer,50,48,167,178,0,0,target.width,target.height);target.classList.add('ready');
  }
  function pop(text,x,y,color='#f8d9a0'){if(document.body.dataset.view!=='home')return;const el=document.createElement('div');el.className='damage-pop';el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';el.style.color=color;document.body.append(el);setTimeout(()=>el.remove(),950);}
  function burst(x,y,color,loot=false){for(let i=0;i<12;i++)particles.push({x,y,vx:(Math.random()-.5)*160,vy:-60-Math.random()*60,age:0,color,loot});metrics[loot?'loot':'hits']++;}
  function labels(state,p,en,enemyHp,heroHp){for(const [id,x,name,hp,max] of [['hero-label',p.hero,'1P · '+state.name,heroHp,E.stats(state).hp],['enemy-label',p.enemy,(en.boss?'首领 · ':'')+en.name,enemyHp,en.hp]]){let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.className='actor-label'+(id==='enemy-label'?' enemy':'');el.innerHTML='<strong></strong><span class="actor-health"><span></span></span>';document.body.append(el);}el.style.left=x+'px';el.style.top=(p.y-p.size-12)+'px';el.querySelector('strong').textContent=name;el.querySelector('.actor-health>span').style.width=Math.max(0,100*hp/max)+'%';}}
  function combat(state){if(state!==lastState){lastState=state;lastKills=-1;sequence=null;particles.length=0;}const b=state.battle,key=state.region+'-'+state.stage,turn=b?b.key+'-'+b.turn:key,current=E.enemy(state);
    if(lastKills<0){lastTurn=turn;lastKills=state.kills;lastKey=key;shownEnemy=current;shownRegion=state.region;lastHeroHp=b?.heroHp??E.stats(state).hp;lastEnemyHp=b?.enemyHp??current.hp;lastCoins=state.coins;return;}
    const lethal=state.kills>lastKills;
    if(!state.settings.quiet&&(lethal||lastTurn!==turn&&lastKey===key&&b?.turn)){sequence={at:time,lethal,enemy:shownEnemy||current,heroBefore:lastHeroHp,enemyBefore:lastEnemyHp,enemyAfter:lethal?0:b.enemyHp,heroAfter:b?.heroHp??E.stats(state).hp,gain:Math.max(0,state.coins-lastCoins),hit:false,counter:false,spell:state.lastSpell?.at>Date.now()-1800?state.lastSpell:null};sequence.enemyDamage=Math.max(1,sequence.enemyBefore-sequence.enemyAfter);sequence.heroDamage=Math.max(0,sequence.heroBefore-sequence.heroAfter);}
    if(key!==lastKey&&!lethal||state.region!==shownRegion){sequence=null;shownEnemy=current;shownRegion=state.region;}if(!sequence)shownEnemy=current;lastTurn=turn;lastKills=state.kills;lastKey=key;lastHeroHp=b?.heroHp??E.stats(state).hp;lastEnemyHp=b?.enemyHp??current.hp;lastCoins=state.coins;
  }
  function draw(state,dt){const quiet=state.settings.quiet||matchMedia('(prefers-reduced-motion: reduce)').matches,p=positions();ctx.clearRect(0,0,width,height);ctx.fillStyle='#345b70';ctx.fillRect(0,0,width,height);background(state);
    const s=quiet?null:sequence,age=s?time-s.at:2,ranged=heroName(state)!=='Rogue_Hooded',m=FocusMotion.sampleCombat(age,ranged,s?.lethal||false),hx=p.hero+(p.enemy-p.hero-p.size*.65)*m.heroMove,ex=p.enemy+(p.hero-p.enemy+p.size*.7)*m.enemyMove,en=s?.enemy||E.enemy(state),monster=monsters[state.region][Number(en.key.split('-')[1])],alpha=s?.lethal&&age>.65?Math.max(0,1-(age-.65)*1.6):1;
    ctx.fillStyle='#0d20254d';for(const [x,size] of [[hx,p.size],[ex,p.size]]){ctx.beginPath();ctx.ellipse(x,p.y-3,size*.33,7,0,0,7);ctx.fill();}
    hero(state,hx,p.y,p.size,m.heroAction,age,quiet,s?.lethal||false);enemy(state,monster,ex,p.y,p.size*(en.boss?1.32:.9),m.enemyAction,alpha,quiet,age,s?.lethal||false);
    if(s&&age>.3&&age<.63){ctx.save();const t=Math.min(1,(age-.3)/.18);ctx.globalAlpha=age>.48?Math.max(0,1-(age-.48)/.15):1;ctx.strokeStyle=heroName(state)==='Mage'?'#9be1e5':'#f2e4bb';ctx.lineWidth=4;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=12;if(ranged){const x=hx+(ex-hx)*t,y=p.y-p.size*.6-Math.sin(t*Math.PI)*20;ctx.beginPath();ctx.moveTo(x-32,y+3);ctx.lineTo(x+8,y);ctx.stroke();ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.arc(x+8,y,heroName(state)==='Mage'?7:3,0,7);ctx.fill();}else{ctx.lineWidth=8;ctx.beginPath();ctx.arc(hx+22,p.y-p.size*.5,p.size*.47,-1.8+t*1.2,-.9+t*2.5);ctx.stroke();ctx.lineWidth=2;ctx.strokeStyle='#fff5d8';ctx.stroke();}ctx.restore();}
    if(s&&m.heroImpact&&!s.hit){s.hit=true;burst(ex,p.y-p.size*.4,'#f5d78b');pop('−'+s.enemyDamage,ex,p.y-p.size*.8);if(s.spell){const seal=document.getElementById('spell-seal-'+s.spell.branch);seal?.classList.remove('casting');if(seal){void seal.offsetWidth;seal.classList.add('casting');setTimeout(()=>seal.classList.remove('casting'),700);}}if(s.lethal){burst(ex,p.y-p.size*.4,'#edc574',true);pop('+'+s.gain+' 灵石',ex+40,p.y-p.size*.4);}}
    if(s&&age>.48&&age<.67){ctx.save();ctx.globalAlpha=(.67-age)/.19;ctx.strokeStyle='#fff1ba';ctx.lineWidth=3;ctx.beginPath();const rr=12+(age-.48)*130;ctx.arc(ex,p.y-p.size*.5,rr,0,7);ctx.moveTo(ex-rr*1.4,p.y-p.size*.5);ctx.lineTo(ex+rr*1.4,p.y-p.size*.5);ctx.stroke();ctx.restore();}
    if(s&&m.enemyImpact&&!s.counter){s.counter=true;burst(hx,p.y-p.size*.4,'#d7947b');pop(s.heroDamage?'−'+s.heroDamage:'格挡',hx,p.y-p.size*.8,'#f0bea1');}
    if(s?.spell&&s.hit&&age>.48&&age<1){ctx.save();ctx.globalAlpha=1-(age-.48)/.52;ctx.strokeStyle=['#edab71','#9ddbe3','#eee28e','#b9d2a1','#cdb2df','#bca4d2'][s.spell.branch];ctx.lineWidth=3;ctx.beginPath();ctx.arc(ex,p.y-p.size*.5,20+(age-.48)*110,0,7);ctx.stroke();ctx.restore();}
    for(let i=particles.length-1;i>=0;i--){const f=particles[i];f.age+=quiet?1:dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=220*dt;if(f.age>.85){particles.splice(i,1);continue;}ctx.save();ctx.globalAlpha=1-f.age/.85;ctx.fillStyle=f.color;ctx.strokeStyle='#776442';ctx.beginPath();ctx.arc(f.x,f.y,f.loot?5:2,0,7);ctx.fill();if(f.loot)ctx.stroke();ctx.restore();}
    if(quiet)sequence=null;labels(state,{...p,hero:hx,enemy:ex},en,s?(s.hit?s.enemyAfter:s.enemyBefore):(state.battle?.enemyHp??en.hp),s?(s.counter?s.heroAfter:s.heroBefore):(state.battle?.heroHp??E.stats(state).hp));
    if(s&&m.done){sequence=null;shownEnemy=E.enemy(state);}if(document.body.dataset.view==='world')document.querySelectorAll('.scene-wrap canvas').forEach(c=>{const r=c.getBoundingClientRect();if(c.width!==r.width||c.height!==r.height){c.width=r.width;c.height=r.height;}c.getContext('2d').drawImage(canvas,0,0,width,Math.max(1,p.y+15),0,0,c.width,c.height);});metrics.frames++;
  }
  function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=true;}
  async function start(read){getState=read;canvas=document.getElementById('game-world');ctx=canvas.getContext('2d',{alpha:false});resize();addEventListener('resize',resize);const names=['forest',...['Knight','Rogue_Hooded','Mage'].flatMap(n=>['idle','attack','hurt'].map(p=>n+'-'+p)),...new Set(monsters.flat())];maps.forEach(load);const loading=document.createElement('div');loading.className='world-loading';loading.textContent='正在展开仙械山海…';document.body.append(loading);
    try{await Promise.all(names.map(n=>{const im=load(n);return new Promise((resolve,reject)=>{if(im.complete&&im.naturalWidth)resolve();else{im.onload=resolve;im.onerror=reject;}});}));}catch{loading.textContent='本地插画素材读取失败，请重新打开游戏。';loading.classList.add('error');return;}ready=true;loading.remove();
    function frame(now){if(now-lastFrame>=12){const dt=Math.min(.1,(now-lastFrame)/1000||.016);lastFrame=now;time=now/1000;const state=getState();combat(state);if(['home','world'].includes(document.body.dataset.view))draw(state,dt);}requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }
  return {start,portrait,paintPortrait,monsterModels:monsters,mapImage:i=>base+maps[i]+'.png',debug:()=>({...metrics,heroFrames:[...metrics.heroFrames],enemyFrames:[...metrics.enemyFrames],ready,map:maps[getState().region],mapsReady:maps.filter(n=>images[n]?.naturalWidth).length,sequence:sequence?{age:time-sequence.at,lethal:sequence.lethal}:null,canvas:{width,height}})};
})();
