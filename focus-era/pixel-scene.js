/* Native 2D pixel renderer. All artwork and sprite frames are available offline. */
var FocusScene = (() => {
  const P=FocusPixels,D=FocusData,E=FocusEngine,images={},particles=[];
  const palette=[['#bcc99f','#84a369','#638852','#dfcea6'],['#b7cbb5','#79a18c','#557c6a','#d9ceb1'],['#d0b598','#b69165','#8c7050','#dfc6a0'],['#c4b4c5','#958fa5','#716b83','#d6c7bf'],['#bfd5cf','#8faba3','#6b8d89','#ddd8b9'],['#d9b096','#b68361','#875c49','#e3bd8d'],['#c9bfd6','#9e90b1','#7b7294','#d9cbe1'],['#c9c3a5','#a29e71','#7f8358','#e4d1a0']];
  let canvas,ctx,scale=3,width,height,getState,ready=false,time=0,lastFrame=0,sequence,lastTurn,lastKills=-1,lastKey,shownEnemy,shownRegion=-1,region=-1,bg,lastHeroHp=0,lastEnemyHp=0,lastCoins=0,lastState;
  const metrics={frames:0,heroFrames:new Set(),enemyFrames:new Set(),hits:0,loot:0,renderer:'Canvas2D',spritesReady:0};
  const portrait=name=>'assets/pixel/portraits/'+name+'.png';
  function load(url){if(images[url])return images[url];const im=new Image();im.src=url;images[url]=im;return im;}
  function sprite(name,x,y,mult=1,flip=false,alpha=1){const rect=P.rects[name];if(!rect)return;const [sx,sy,w,h]=rect;ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.round(x),Math.round(y));ctx.scale(flip?-1:1,1);ctx.drawImage(images[P.atlas],sx,sy,w,h,Math.round(-w*mult/2),-h*mult,w*mult,h*mult);ctx.restore();}
  function tile(id,x,y,mult=1){const im=images['town-'+Math.max(0,region)];const columns=im.width/16;ctx.drawImage(im,(id%columns)*16,Math.floor(id/columns)*16,16,16,Math.round(x),Math.round(y),16*mult,16*mult);}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
  function rand(seed){const n=Math.sin(seed*17.329+1.7)*43758.5453;return n-Math.floor(n);}
  function area(){const mobile=innerWidth<=760;return mobile?{left:8,right:width-8,top:35,bottom:Math.max(125,(innerHeight-405)/scale)}:{left:134/scale,right:(innerWidth-396)/scale,top:100/scale,bottom:(innerHeight-235)/scale};}
  function positions(){const a=area(),cx=(a.left+a.right)/2,y=Math.max(a.top+88,(a.top+a.bottom)/2+30),gap=Math.max(21,Math.min(43,(a.right-a.left)*.19));return {hero:cx-gap,enemy:cx+gap,y,cx,a};}
  function tree(x,y,type=0){ctx.save();ctx.globalAlpha=.15;rect(x-11,y-3,22,5,'#37442e');ctx.restore();const top=[4,5,3,7][type%4],bottom=[16,17,15,19][type%4];tile(top,x-8,y-32);tile(bottom,x-8,y-16);}
  function cabin(x,y){[52,53,54,64,65,67,72,85,74].forEach((id,i)=>tile(id,x-24+(i%3)*16,y-47+Math.floor(i/3)*16));}
  function background(state){
    region=state.region;const [sky,grass,dark,path]=palette[region];const {cx,y,a}=positions();
    bg=document.createElement('canvas');bg.width=width;bg.height=height;const old=ctx;ctx=bg.getContext('2d');ctx.imageSmoothingEnabled=false;
    rect(0,0,width,height,grass);rect(0,0,width,48,sky);
    // Stepped silhouettes and sparse clouds keep the scene unmistakably pixel art.
    for(let i=0;i<12;i++){const x=i*width/10-30,h=12+rand(i+region)*20;rect(x,48-h,50,h+12,region===3?'#a598b0':'#a4b58b');rect(x+8,36-h,27,12,sky);}
    for(let i=0;i<5;i++){const x=rand(i+8)*width;rect(x,20+i%2*7,26,6,'#e9e1ca');rect(x+5,16+i%2*7,12,4,'#e9e1ca');}
    // A tile road connects the actual camp and the arena, with broken stone edges.
    for(let x=0;x<width;x+=16)for(let yy=55;yy<height;yy+=16){if(rand(x*3+yy+region)>.77)tile(1+(Math.floor(rand(x+yy)*2)),x,yy);}
    rect(0,y-8,width,30,path);rect(0,y-10,width,2,'#aa9266');rect(0,y+22,width,2,dark);
    for(let x=0;x<width;x+=16){rect(x+rand(x)*8,y+2,4,2,'#cab48f');rect(x+5,y+15,3,1,'#eddbb4');}
    // A river and little wooden bridge sit behind the fighting lane.
    const riverX=Math.max(22,cx-60);rect(riverX,52,20,y-65,'#79a4a3');rect(riverX+2,52,2,y-65,'#accac0');rect(riverX-4,y-42,29,24,'#6c5542');
    for(let yy=y-40;yy<y-18;yy+=4)rect(riverX-3,yy,27,2,'#b59768');
    for(let i=0;i<36;i++){
      const x=rand(i+31)*width,ty=65+rand(i*5+7)*(height-50);
      if(x>a.left-30&&x<a.right+30&&ty>y-40&&ty<y+56)continue;
      if(ty<62)continue;tree(x,ty,i%4);
    }
    cabin(a.left+21,y-22);tile(94,a.left+32,y-28);
    for(let i=0;i<6;i++)tile(i%2?44:45,a.left+i*16,y+40);
    // Growing technology adds actual camp equipment, rather than separate skills.
    const tech=E.pathCount(state,'tech');if(tech){tile(105,a.left+55,y-25);tile(104,a.left+70,y-26);}
    if(tech>=6){cabin(a.left+48,y-88);tile(115,a.left+51,y-112);}if(tech>=18){tile(116,a.left+95,y-27);tile(103,a.left+95,y-52);}
    if(region>=2){for(let i=0;i<5;i++){sprite('wall_top_mid',a.left+22+i*16,y-68);sprite('wall_mid',a.left+22+i*16,y-52);}}
    // Stones and flowers are deterministic: no distracting random terrain shifts.
    for(let i=0;i<28;i++){const x=rand(i*7+50)*width,ty=rand(i*11+20)*(height-y-45)+y+50;tile(i%4?2:15,x,ty);}
    ctx=old;bg.tech=tech;
  }
  function pop(text,x,y,color='#f9eac1'){if(document.body.dataset.view!=='home')return;const el=document.createElement('div');el.className='damage-pop pixel-pop';el.textContent=text;el.style.left=Math.round(x*scale)+'px';el.style.top=Math.round(y*scale)+'px';el.style.color=color;document.body.append(el);setTimeout(()=>el.remove(),950);}
  function burst(x,y,color,loot=false){for(let i=0;i<(loot?10:9);i++)particles.push({x,y,vx:(rand(i+time)-.5)*60,vy:-15-rand(i*3+time)*30,age:0,color,loot,size:loot?2:1});if(loot)metrics.loot++;else metrics.hits++;}
  function labels(state,hx,ex,y,enemyData,enemyHp,heroHp){
    for(const [id,x,name,hp,max,isEnemy] of [['hero-label',hx,state.name+' · Lv.'+E.level(state).value,heroHp,E.stats(state).hp,false],['enemy-label',ex,(enemyData.boss?'首领 · ':'')+enemyData.name,enemyHp,enemyData.hp,true]]){
      let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.className='actor-label pixel-label'+(isEnemy?' enemy':'');el.innerHTML='<strong></strong><span class="actor-health"><span></span></span>';document.body.append(el);}
      el.style.left=Math.round(x*scale)+'px';el.style.top=Math.round((y+(innerWidth<=760?8:27))*scale)+'px';el.querySelector('strong').textContent=name;el.querySelector('.actor-health>span').style.width=Math.max(0,100*hp/max)+'%';
    }
  }
  function actor(name,x,y,action,flip,alpha=1){const still=getState().settings.quiet||matchMedia('(prefers-reduced-motion: reduce)').matches,frame=still?0:(Math.floor(time*(action==='Walk'?9:5)))%4;const anim=action==='Walk'?'run':'idle';const prefix=P.roles[name]||P.actors[name];const hit=prefix+'_hit_anim_f0',regular=prefix+'_'+anim+'_anim_f'+frame,key=action==='Hit'&&P.rects[hit]?hit:P.rects[regular]?regular:prefix+'_anim_f'+frame;sprite(key,x,y,2,flip,alpha);if(P.roles[name])metrics.heroFrames.add(key);else metrics.enemyFrames.add(key);}
  function combat(state){
    if(state!==lastState){lastState=state;lastKills=-1;sequence=null;particles.length=0;}
    const b=state.battle,key=state.region+'-'+state.stage,turn=b?b.key+'-'+b.turn:key,current=E.enemy(state);
    if(lastKills<0){lastTurn=turn;lastKills=state.kills;lastKey=key;shownEnemy=current;shownRegion=state.region;lastHeroHp=b?.heroHp??E.stats(state).hp;lastEnemyHp=b?.enemyHp??current.hp;lastCoins=state.coins;return;}
    const lethal=state.kills>lastKills;
    if(!state.settings.quiet&&(lethal||lastTurn!==turn&&lastKey===key&&b?.turn)){
      sequence={at:time,lethal,enemy:shownEnemy||current,heroBefore:lastHeroHp,enemyBefore:lastEnemyHp,enemyAfter:lethal?0:b.enemyHp,heroAfter:b?.heroHp??E.stats(state).hp,gain:Math.max(0,state.coins-lastCoins),hit:false,counter:false,spell:state.lastSpell?.at>Date.now()-1800?state.lastSpell:null};
      sequence.enemyDamage=Math.max(1,sequence.enemyBefore-sequence.enemyAfter);sequence.heroDamage=Math.max(0,sequence.heroBefore-sequence.heroAfter);
    }
    if(key!==lastKey&&!lethal||state.region!==shownRegion){sequence=null;shownEnemy=current;shownRegion=state.region;}
    if(!sequence)shownEnemy=current;
    lastTurn=turn;lastKills=state.kills;lastKey=key;lastHeroHp=b?.heroHp??E.stats(state).hp;lastEnemyHp=b?.enemyHp??current.hp;lastCoins=state.coins;
  }
  function draw(state,dt){
    const quiet=state.settings.quiet||matchMedia('(prefers-reduced-motion: reduce)').matches,p=positions();
    if(region!==state.region||bg?.tech!==E.pathCount(state,'tech'))background(state);
    ctx.drawImage(bg,0,0);const s=quiet?null:sequence,age=s?time-s.at:2,m=FocusMotion.sampleCombat(age,P.roles[heroName(state)]==='wizzard_m',s?.lethal||false),hx=p.hero+(p.enemy-p.hero-26)*m.heroMove,ex=p.enemy+(p.hero-p.enemy+28)*m.enemyMove;
    const en=s?.enemy||E.enemy(state),enemyName=P.monsters[state.region][Number(en.key.split('-')[1])],alpha=s?.lethal&&age>.65?Math.max(0,1-(age-.65)*1.6):1;
    // Ground shadows stay under the feet throughout attacks and retreats.
    rect(hx-13,p.y-3,27,5,'#52654844');rect(ex-15,p.y-3,en.boss?40:29,5,'#52654844');
    actor(heroName(state),hx,p.y,m.heroAction,false);actor(enemyName,ex,p.y,m.enemyAction,true,alpha);
    // The source pack deliberately supplies separate weapons for procedural swings.
    ctx.save();ctx.translate(Math.round(hx+13),Math.round(p.y-18));const swing=age>=.27&&age<.58;
    ctx.rotate(swing?-1.8+(age-.27)*9:.5);sprite(heroName(state)==='Mage'?'weapon_red_magic_staff':heroName(state)==='Rogue_Hooded'?'weapon_katana':'weapon_knight_sword',0,10,1.25);ctx.restore();
    if(swing&&heroName(state)!=='Mage'){ctx.save();ctx.strokeStyle='#fff0bd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(hx+16,p.y-42);ctx.lineTo(hx+33,p.y-29);ctx.lineTo(hx+29,p.y-10);ctx.stroke();ctx.restore();}
    if(s&&heroName(state)==='Mage'&&age>.27&&age<.52){const x=hx+(ex-hx)*(age-.27)/.25;rect(x-3,p.y-30,6,6,'#e28b51');rect(x-1,p.y-29,3,3,'#ffe6a0');}
    if(s&&m.heroImpact&&!s.hit){s.hit=true;burst(ex,p.y-25,'#f6d998');pop('−'+s.enemyDamage,ex,p.y-38);if(s.lethal){burst(ex,p.y-25,'#e7b35d',true);pop('+'+s.gain+' 灵石',ex+12,p.y-14,'#f6d998');}}
    if(s&&!s.lethal&&age>1.04&&age<1.3){ctx.strokeStyle='#f0c598';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ex-18,p.y-34);ctx.lineTo(ex-30,p.y-24);ctx.lineTo(ex-24,p.y-12);ctx.stroke();}
    if(s&&m.enemyImpact&&!s.counter){s.counter=true;burst(hx,p.y-24,'#da997b');pop(s.heroDamage?'−'+s.heroDamage:'格挡',hx,p.y-38,'#f4ccae');}
    // Learned magic really appears in combat; effects respect the engine spell event.
    if(s?.spell&&s.hit&&age>.48&&age<.7){const color=['#eeaa68','#a5d5de','#f6df88','#bbd697','#c8b3e1','#c5a6c9'][s.spell.branch];for(let i=0;i<5;i++){const d=(age-.48)*50;rect(ex+(i-2)*d,p.y-30+Math.abs(i-2)*d,2,2,color);}}
    for(let i=particles.length-1;i>=0;i--){const f=particles[i];f.age+=quiet?1:dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=80*dt;if(f.age>.7){particles.splice(i,1);continue;}if(f.loot)sprite('coin_anim_f'+Math.floor(time*12)%4,f.x,f.y);else rect(f.x,f.y,f.size,f.size,f.color);}
    // A small campfire has its own source frames and bright pixel embers.
    if(!quiet){const fireX=p.a.left+53;sprite('flask_yellow',fireX,p.y-22);rect(fireX-2,p.y-29-(Math.floor(time*5)%3),4,7,'#d58448');rect(fireX,p.y-26,2,4,'#f8d98e');}
    if(quiet&&sequence)sequence=null;
    labels(state,p.hero,p.enemy,p.y,en,s?(s.hit?s.enemyAfter:s.enemyBefore):(state.battle?.enemyHp??en.hp),s?(s.counter?s.heroAfter:s.heroBefore):(state.battle?.heroHp??E.stats(state).hp));
    if(s&&m.done){sequence=null;shownEnemy=E.enemy(state);}
    document.body.classList.toggle('viewing-panel',document.body.dataset.view!=='home');
    if(document.body.dataset.view==='world')document.querySelectorAll('.scene-wrap canvas').forEach(c=>{const r=c.getBoundingClientRect(),cw=Math.round(r.width),ch=Math.round(r.height);if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;}const cc=c.getContext('2d');cc.imageSmoothingEnabled=false;const aw=p.a.right-p.a.left,ah=p.a.bottom-p.a.top,rw=aw/ah,rh=cw/ch;let sw=aw,sh=ah;if(rw>rh)sw=ah*rh;else sh=aw/rh;cc.drawImage(canvas,(p.cx-sw/2),(p.y-sh*.64),sw,sh,0,0,cw,ch);});
    metrics.frames++;
  }
  function heroName(state){const job=D.jobs.find(j=>j.id===state.job);return job?.path==='arcane'?'Mage':job?.path==='cultivation'?'Rogue_Hooded':'Knight';}
  function resize(){canvas.width=width=Math.ceil(innerWidth/scale);canvas.height=height=Math.ceil(innerHeight/scale);ctx.imageSmoothingEnabled=false;region=-1;}
  async function start(read){
    getState=read;canvas=document.getElementById('game-world');ctx=canvas.getContext('2d',{alpha:false});resize();addEventListener('resize',resize);
    for(let i=0;i<8;i++)images['town-'+i]=load('assets/pixel/town-'+i+'.png');load(P.atlas);
    const loading=document.createElement('div');loading.className='world-loading';loading.textContent='正在展开像素远征地图…';document.body.append(loading);
    await Promise.all([images[P.atlas],...Array.from({length:8},(_,i)=>images['town-'+i])].map(im=>new Promise((resolve,reject)=>{if(im.complete&&im.naturalWidth)resolve();else{im.onload=resolve;im.onerror=reject;}}))).catch(()=>{loading.textContent='本地像素素材读取失败，请重新打开游戏。';loading.classList.add('error');});
    if(!images[P.atlas].naturalWidth||Array.from({length:8},(_,i)=>images['town-'+i]).some(im=>!im.naturalWidth))return;
    ready=true;metrics.spritesReady=Object.keys(P.rects).length;loading.remove();
    function frame(now){if(now-lastFrame>=32){const dt=Math.min(.1,(now-lastFrame)/1000||.033);lastFrame=now;time=now/1000;const state=getState();combat(state);if(document.body.dataset.view==='home'||document.body.dataset.view==='world')draw(state,dt);}requestAnimationFrame(frame);}requestAnimationFrame(frame);
  }
  return {start,portrait,monsterModels:P.monsters,debug:()=>({...metrics,heroFrames:[...metrics.heroFrames],enemyFrames:[...metrics.enemyFrames],ready,sequence:sequence?{age:time-sequence.at,lethal:sequence.lethal}:null,canvas:{width,height,scale}})};
})();
