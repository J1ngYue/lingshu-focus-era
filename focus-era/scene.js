/* Original world composition, built with CC0 Kenney sprites. */
var FocusScene = (() => {
  const images={},path='assets/kenney/';
  for(const pack of ['tiny-town','tiny-dungeon','tiny-battle']){const image=new Image();image.src=`${path}${pack}/Tilemap/tilemap_packed.png`;images[pack]=image;}
  const sprite=(pack,index)=>`${path}${pack}/Tiles/tile_${String(index).padStart(4,'0')}.png`;
  let frame=0,handle=0,lastFrame=0;
  function tile(ctx,pack,index,x,y,size=16,flip=false){const im=images[pack];if(!im?.complete||!im.naturalWidth)return;const cols=im.naturalWidth/16;ctx.save();if(flip){ctx.translate(x+size,y);ctx.scale(-1,1);x=0;y=0;}ctx.drawImage(im,(index%cols)*16,Math.floor(index/cols)*16,16,16,Math.round(x),Math.round(y),size,size);ctx.restore();}
  function house(ctx,x,y,style=0){const roof=style===1?52:style===2?48:60;for(let k=0;k<3;k++){tile(ctx,'tiny-town',roof+k,x+k*16,y);tile(ctx,'tiny-town',style===1?64+k:style===2?60+k:48+k,x+k*16,y+16);}tile(ctx,'tiny-town',84,x,y+32);tile(ctx,'tiny-town',85,x+16,y+32);tile(ctx,'tiny-town',86,x+32,y+32);}
  function label(ctx,text,x,y,color='#354f34'){ctx.font='8px "Microsoft YaHei",sans-serif';ctx.textAlign='center';const width=ctx.measureText(text).width+12;ctx.fillStyle='#ffffeedb';ctx.fillRect(x-width/2,y-8,width,13);ctx.fillStyle=color;ctx.fillText(text,x,y+1);}
  function draw(canvas,s,time=0){
    const ctx=canvas.getContext('2d');canvas.width=480;canvas.height=232;ctx.imageSmoothingEnabled=false;
    const r=FocusData.regions[s.region],tech=FocusEngine.pathCount(s,'tech'),quiet=s.settings.quiet||matchMedia('(prefers-reduced-motion: reduce)').matches;
    ctx.fillStyle=r.palette[0];ctx.fillRect(0,0,480,232);
    for(let y=0;y<15;y++)for(let x=0;x<30;x++){ctx.globalAlpha=.78;tile(ctx,'tiny-town',(x*7+y*13)%19===0?2:(x*17+y*11)%7===0?1:0,x*16,y*16);ctx.globalAlpha=1;}
    // A winding river separates the settlement from the expedition trail.
    for(let y=0;y<15;y++){const x=Math.floor(4+Math.sin(y*.5)*.65);for(let w=0;w<2;w++)tile(ctx,'tiny-battle',38,(x+w)*16,y*16);tile(ctx,'tiny-battle',37,(x-1)*16,y*16);tile(ctx,'tiny-battle',39,(x+2)*16,y*16);}
    for(let x=2;x<27;x++){tile(ctx,'tiny-town',13,x*16,144);tile(ctx,'tiny-town',25,x*16,160);}
    for(let y=6;y<14;y++){tile(ctx,'tiny-town',25,192,y*16);tile(ctx,'tiny-town',25,208,y*16);}
    for(let x=3;x<=8;x++){tile(ctx,'tiny-town',45,x*16,144);tile(ctx,'tiny-town',45,x*16,160);}
    const trees=[[6,7],[19,22],[37,30],[430,25],[449,49],[409,48],[393,7],[334,13],[276,22],[295,39],[448,196],[417,205],[375,204],[19,193],[36,210],[143,198],[169,211],[255,214]];
    for(const [x,y]of trees){ctx.fillStyle='#31563619';ctx.fillRect(x+4,y+22,18,4);tile(ctx,'tiny-town',5,x,y,24);tile(ctx,'tiny-town',18,x,y+21,24);}
    ctx.fillStyle='#b7c999';ctx.fillRect(134,74,68,58);ctx.fillStyle='#c4d7a5';ctx.fillRect(138,78,60,50);
    if(s.skills['tech-0-0'])house(ctx,143,73,0);else{tile(ctx,'tiny-town',22,151,88,32);tile(ctx,'tiny-town',27,177,103,24);}label(ctx,s.skills['tech-0-0']?'营火聚落':'初心营地',167,64);
    for(let x=8;x<12;x++)tile(ctx,'tiny-town',44,x*16,129);tile(ctx,'tiny-town',22,136,119);tile(ctx,'tiny-town',94,189,111);
    if(s.skills['tech-0-1']){for(let y=0;y<3;y++)for(let x=0;x<3;x++){ctx.fillStyle=(x+y)%2?'#b3945d':'#aa884f';ctx.fillRect(110+x*9,54+y*7,7,5);}tile(ctx,'tiny-town',17,117,54);label(ctx,'农田',121,40);}
    if(s.skills['tech-2-0']){house(ctx,222,56,1);label(ctx,s.skills['tech-2-7']?'灵械工厂':'造物工坊',244,45);tile(ctx,'tiny-battle',50,251,104);}
    if(s.skills['tech-4-0']){house(ctx,118,185,2);label(ctx,s.skills['tech-0-10']?'学术学院':'知识档案馆',140,179);}
    if(s.skills['tech-1-0']){tile(ctx,'tiny-battle',27,243,187,24);tile(ctx,'tiny-battle',29,266,187,24);label(ctx,s.skills['tech-1-6']?'灵能电网':'水轮动力站',266,177);}
    if(s.skills['tech-5-6']){tile(ctx,'tiny-battle',46,326,49,28);tile(ctx,'tiny-battle',47,354,49,28);label(ctx,'飞舟空港',350,40);}
    if(s.skills['tech-5-10']){ctx.strokeStyle='#c4a2d5';ctx.lineWidth=3;ctx.strokeRect(387,86,31,35);ctx.fillStyle='#c4a2d566';ctx.fillRect(391,89,23,30);label(ctx,s.skills['tech-5-15']?'万界星门':'星门雏形',402,78);}
    // Sprite identities are separate from monster names; each biome gives them a different aura.
    const bob=quiet?0:Math.sin(time/350)*1.8,heroX=288,heroY=145,monsterX=373;
    const job=FocusData.jobs.find(j=>j.id===s.job);const hero=job?.path==='arcane'?84:job?.path==='tech'?87:85;
    ctx.fillStyle='#37533b22';ctx.fillRect(heroX+6,heroY+36,22,4);ctx.fillRect(monsterX+5,heroY+35,29,5);
    tile(ctx,'tiny-dungeon',hero,heroX,heroY+bob,32);
    const e=FocusEngine.enemy(s),monster=[108,122,121,120][e.boss?3:(s.stage-1)%3];
    ctx.save();ctx.filter=`hue-rotate(${s.region*28}deg)`;tile(ctx,'tiny-dungeon',monster,monsterX,heroY-bob+(e.boss?-5:0),e.boss?40:32,true);ctx.restore();
    label(ctx,s.name,heroX+16,heroY-17);label(ctx,e.name,monsterX+18,heroY-17,e.boss?'#985948':'#52714b');
    const max=FocusEngine.stats(s).hp,b=s.battle;
    for(const [x,f,color] of [[heroX,(b?.heroHp||max)/max,'#91b36f'],[monsterX,(b?.enemyHp||e.hp)/e.hp,'#c99b74']]){ctx.fillStyle='#334c3638';ctx.fillRect(x,heroY-6,34,3);ctx.fillStyle=color;ctx.fillRect(x,heroY-6,Math.max(0,Math.min(34,34*f)),3);}
    if(s.lastSpell&&Date.now()-s.lastSpell.at<5000)label(ctx,s.lastSpell.name,heroX+16,heroY+48,'#8b699d');
    if(!quiet){const t=(time%3000)/3000;if(t<.35){ctx.fillStyle=s.lastSpell?['#df8c55','#b6e7ec','#e9ce65','#8fc078','#b3a0d6','#84c9c5'][s.lastSpell.branch]:job?.path==='arcane'?'#b78cd0':'#f1d28a';ctx.fillRect(heroX+32+t*180,heroY+16,7,4);}
      for(let i=0;i<8;i++){const x=119+(i*43)%290,y=40+(i*29)%170+Math.sin(time/1300+i)*3;ctx.fillStyle=i%2?'#f5eaa4b0':'#ffffcc77';ctx.fillRect(x,y,2,2);}}
    tile(ctx,'tiny-town',104,315,182);tile(ctx,'tiny-town',30,352,193);tile(ctx,'tiny-town',27,237,126);tile(ctx,'tiny-town',93,411,168);
    // A soft vignette preserves the quiet, warm look of the interface.
    const shade=ctx.createLinearGradient(0,0,0,232);shade.addColorStop(0,'#f5f1d933');shade.addColorStop(.6,'#ffffff00');shade.addColorStop(1,'#5b79691a');ctx.fillStyle=shade;ctx.fillRect(0,0,480,232);
  }
  function start(getState){cancelAnimationFrame(handle);const animate=time=>{if(time-lastFrame>80){lastFrame=time;for(const canvas of document.querySelectorAll('canvas.world-canvas'))draw(canvas,getState(),time);frame++;}handle=requestAnimationFrame(animate);};handle=requestAnimationFrame(animate);}
  return {start,sprite,draw};
})();
