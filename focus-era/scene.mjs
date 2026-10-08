import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone} from 'three/addons/utils/SkeletonUtils.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const monsterModels=[
 ['blob-GreenBlob','blob-Mushnub','blob-GreenSpikyBlob','big-MushroomKing'],
 ['blob-Cat','blob-Cactoro','blob-Orc','big-Yeti'],
 ['flying-Goleling','big-Alien','flying-Armabee','flying-Goleling_Evolved'],
 ['flying-Ghost','flying-Ghost_Skull','blob-Wizard','big-BlueDemon'],
 ['flying-Pigeon','flying-Dragon','flying-Armabee_Evolved','flying-Dragon_Evolved'],
 ['blob-PinkBlob','big-Tribal','flying-Glub_Evolved','big-Demon'],
 ['blob-Alien','flying-Glub','flying-Hywirl','big-Monkroose'],
 ['big-Orc_Skull','big-Dino','flying-Squidle','flying-Alpaking_Evolved']
];
const loader=new GLTFLoader(),cache=new Map(),actors=[],envObjects=[],clouds=[],sprites=[];
let renderer,scene,camera,getState,hero,enemy,requestedHero='',requestedEnemy='',lastTime=0,frameHandle,lastTurn='',lastKey='',lastKills=-1,lastEnemyHp=0,lastHeroHp=0,attackAt=-20,deathUntil=0,region=-1,ready=false;
const homeHero=new THREE.Vector3(-2.4,0,2.5),homeEnemy=new THREE.Vector3(2.6,0,2.5);

function model(name){
 if(!cache.has(name)){
  const source=window.FocusModels[name];if(!source)return Promise.reject(new Error('Missing local model: '+name));
  const binary=Uint8Array.from(atob(source),c=>c.charCodeAt(0));
  cache.set(name,loader.parseAsync(binary.buffer,''));
 }
 return cache.get(name);
}
function materials(object){object.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>{m.roughness=.84;m.metalness=.02;if(m.name==='leafsGreen')m.color.set('#608751');if(m.name==='leafsDark')m.color.set('#476746');if(m.name==='grass')m.color.set('#749a61');if(m.name==='woodBark')m.color.set('#866445');if(m.name==='woodBarkDark')m.color.set('#715b43');if(m.map)m.map.anisotropy=4;});}});}
function accessories(object,name){
 const hides=name==='Knight'?['1H_Sword_Offhand','Rectangle_Shield','Round_Shield','Spike_Shield','2H_Sword']:name==='Mage'?['Spellbook','Wand']:['Crossbow','Quiver','Bow'];
 object.traverse(o=>{if(hides.some(n=>o.name===n||o.name.startsWith(n+'_')))o.visible=false;});
}
async function place(name,x,z,height,rotation=0){
 const gltf=await model(name),object=gltf.scene.clone(true);materials(object);
 const box=new THREE.Box3().setFromObject(object),size=box.getSize(new THREE.Vector3()),scale=height/Math.max(size.y,.01);object.scale.setScalar(scale);object.position.set(x,-box.min.y*scale,z);object.rotation.y=rotation;scene.add(object);return object;
}
function actor(gltf,name,height){
 const object=clone(gltf.scene);accessories(object,name);materials(object);
 const box=new THREE.Box3().setFromObject(object),scale=height/Math.max(box.getSize(new THREE.Vector3()).y,.01);object.scale.setScalar(scale);
 const mixer=new THREE.AnimationMixer(object),actions=Object.fromEntries(gltf.animations.map(clip=>[clip.name,mixer.clipAction(clip)]));
 const entity={object,mixer,actions,height,current:null,name,baseY:-box.min.y*scale};object.position.y=entity.baseY;
 mixer.addEventListener('finished',()=>{if(!/Death/i.test(entity.current?.getClip().name||''))play(entity,'Idle');});play(entity,'Idle');actors.push(entity);return entity;
}
function play(entity,type,once=false){
 const names=Object.keys(entity.actions);let key=names.find(n=>n===type);
 if(!key)key=names.find(n=>type==='Attack'?/Attack|Bite_Front|Spellcast_Shoot|Punch|Headbutt/i.test(n):type==='Death'?/Death/i.test(n):type==='Walk'?/Walking_A|Walk|Run/i.test(n):type==='Hit'?/Hit_A|HitRecieve|HitReact/i.test(n):/^Idle$|Idle_A|Flying_Idle/i.test(n));
 if(!key)key=names[0];const action=entity.actions[key];if(!action||entity.current===action&&!once)return;
 entity.current?.fadeOut(.12);action.reset().setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);action.clampWhenFinished=once;action.fadeIn(.12).play();entity.current=action;
}
function removeActor(entity){if(!entity)return;scene.remove(entity.object);entity.mixer.stopAllAction();entity.mixer.uncacheRoot(entity.object);actors.splice(actors.indexOf(entity),1);}
async function updateActors(state,time=Infinity){
 const job=FocusData.jobs.find(j=>j.id===state.job),name=job?.path==='arcane'?'Mage':job?.path==='cultivation'?'Rogue_Hooded':'Knight';
 if(requestedHero!==name){requestedHero=name;const gltf=await model(name);if(requestedHero!==name)return;removeActor(hero);hero=actor(gltf,name,3.25);hero.object.position.x=homeHero.x;hero.object.position.z=homeHero.z;hero.object.rotation.y=Math.PI*.33;scene.add(hero.object);}
 const e=FocusEngine.enemy(state),nameEnemy=monsterModels[state.region][e.boss?3:(state.stage-1)%3];
 if(requestedEnemy!==nameEnemy&&time>=deathUntil){requestedEnemy=nameEnemy;const gltf=await model(nameEnemy);if(requestedEnemy!==nameEnemy)return;removeActor(enemy);enemy=actor(gltf,nameEnemy,e.boss?3.05:2.35);enemy.object.position.x=homeEnemy.x;enemy.object.position.z=homeEnemy.z;enemy.object.rotation.y=-Math.PI*.32;scene.add(enemy.object);}
}
function mesh(geometry,color,position,roughness=.9){const m=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness}));if(position)m.position.copy(position);m.receiveShadow=true;m.castShadow=true;scene.add(m);return m;}
function label(id,enemy=false){let el=document.getElementById(id);if(!el){el=document.createElement('div');el.id=id;el.className='actor-label'+(enemy?' enemy':'');el.innerHTML='<strong></strong><span class="actor-health"><span></span></span>';document.body.append(el);}return el;}
function project(position){const vector=position.clone().project(camera);return {x:(vector.x+1)*innerWidth/2,y:(1-vector.y)*innerHeight/2};}
function updateLabels(state){
 document.body.classList.toggle('viewing-panel',document.body.dataset.view!=='home');
 for(const [id,entity,isEnemy] of [['hero-label',hero,false],['enemy-label',enemy,true]]){
  if(!entity)continue;const el=label(id,isEnemy),e=FocusEngine.enemy(state),st=FocusEngine.stats(state),pos=entity.object.position.clone();pos.y+=entity.height+.3;const p=project(pos);
  el.style.left=p.x+'px';el.style.top=p.y+'px';el.querySelector('strong').textContent=isEnemy?(e.boss?'首领 · ':'')+e.name:state.name+' · Lv.'+FocusEngine.level(state).value;
  el.querySelector('.actor-health>span').style.width=Math.max(0,Math.min(100,100*(isEnemy?(state.battle?.enemyHp??e.hp)/e.hp:(state.battle?.heroHp??st.hp)/st.hp)))+'%';
 }
}
function pop(text,entity,color){if(!entity||getState().settings.quiet||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const p=project(entity.object.position.clone().add(new THREE.Vector3(0,entity.height*.8,0))),el=document.createElement('div');el.className='damage-pop';el.textContent=text;el.style.left=p.x+'px';el.style.top=p.y+'px';if(color)el.style.color=color;document.body.append(el);setTimeout(()=>el.remove(),1400);}
function combat(state,time){
 const b=state.battle,key=state.region+'-'+state.stage,turn=b?b.key+'-'+b.turn:key;
 if(lastKills<0){lastKills=state.kills;lastTurn=turn;lastKey=key;lastEnemyHp=b?.enemyHp??0;lastHeroHp=b?.heroHp??0;return;}
 if(lastKills!==state.kills){if(enemy)play(enemy,'Death',true);if(hero)play(hero,'Cheer',true);deathUntil=time+.9;pop('战利品入袋',enemy,'#f5d88f');lastKills=state.kills;}
 else if(turn!==lastTurn&&lastKey===key&&b?.turn&&hero&&enemy){
  attackAt=time;play(hero,hero.name==='Mage'?'Spellcast_Shoot':'Attack',true);play(enemy,'Attack',true);
  if(lastEnemyHp>b.enemyHp)pop('−'+(lastEnemyHp-b.enemyHp),enemy);
  if(lastHeroHp>b.heroHp)setTimeout(()=>pop('−'+(lastHeroHp-b.heroHp),hero,'#f3c8a5'),300);
 }
 lastTurn=turn;lastKey=key;lastEnemyHp=b?.enemyHp??0;lastHeroHp=b?.heroHp??0;
}
async function buildWorld(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#d7dfcd');scene.fog=new THREE.Fog('#d7dfcd',24,64);
 camera=new THREE.OrthographicCamera(-12,12,8,-8,.1,100);camera.position.set(9,14,23);camera.lookAt(0,1.2,0);
 scene.add(new THREE.HemisphereLight('#fff1da','#789260',1.7));const sun=new THREE.DirectionalLight('#fff0d2',3.1);sun.position.set(-10,19,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-22,right:22,top:20,bottom:-20,near:1,far:60});sun.shadow.normalBias=.07;sun.shadow.bias=-.00015;sun.shadow.radius=3;scene.add(sun);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;scene.environmentIntensity=.3;room.dispose();pmrem.dispose();
 mesh(new THREE.CylinderGeometry(22,23,.8,96),'#b1c493',new THREE.Vector3(0,-.6,0));
 mesh(new THREE.CylinderGeometry(12.2,12.8,.3,80),'#acb98e',new THREE.Vector3(0,-.07,0));
 const arena=mesh(new THREE.CylinderGeometry(5.7,5.9,.13,80),'#dbd1ad',new THREE.Vector3(.1,.11,2.3));arena.scale.z=.69;
 const border=mesh(new THREE.TorusGeometry(5.65,.07,8,80),'#b6a879',new THREE.Vector3(.1,.2,2.3));border.rotation.x=Math.PI/2;border.scale.y=.69;
 // Softly reflective river and a bridge create depth behind the battle glade.
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-21,-.14,-3),new THREE.Vector3(-9,-.14,-2),new THREE.Vector3(-4,-.14,-6),new THREE.Vector3(4,-.14,-8),new THREE.Vector3(20,-.14,-5)]);
 const water=mesh(new THREE.TubeGeometry(curve,64,1.1,8,false),'#88b6b3');water.scale.y=.04;water.material.roughness=.25;water.material.metalness=.15;
 const envTasks=[];
 const trees=['nature-tree_oak','nature-tree_detailed','nature-tree_detailed_dark','nature-tree_pineTallA_detailed','nature-tree_pineRoundA'];
 for(let i=0;i<38;i++){const a=i*2.399963,r=9+(i%5)*1.8,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z>2&&Math.abs(x)<7)continue;envTasks.push(place(trees[i%trees.length],x,z,3.3+(i%5)*.38,a));}
 const undergrowth=['nature-plant_bushDetailed','nature-grass_large','nature-grass_leafsLarge','nature-flower_purpleA','nature-flower_yellowA','nature-flower_redA','nature-mushroom_redGroup'];
 for(let i=0;i<45;i++){const a=i*2.399963,r=6.2+(i%5)*.93,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z>3&&Math.abs(x)<5.5)continue;envTasks.push(place(undergrowth[i%undergrowth.length],x,z,i%7===0?.7:.22+(i%3)*.13,a));}
 for(let i=0;i<15;i++){const a=i*2.1,r=9+(i%4)*2.3;envTasks.push(place(i%2?'rock_single_A':'rock_single_B',Math.cos(a)*r,Math.sin(a)*r,.6+(i%3)*.18,a));}
 for(let i=0;i<6;i++)envTasks.push(place('mountain_A_grass',-24+i*9,-22-(i%2)*3,8+(i%3)*2,i*.6));
 envTasks.push(place('building_home_A_green',-6,-4,3.1,.7).then(o=>envObjects.push({o,condition:()=>true})));
 envTasks.push(place('building_home_B_green',-9,-3,2.8,.9));
 envTasks.push(place('building_well_green',-4.5,-2,1.5));
 envTasks.push(place('building_bridge_A',-4,-5.2,1.4,.9));
 envTasks.push(place('nature-campfire_stones',-4.7,1.2,.85).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-0-0']})));
 envTasks.push(place('building_castle_green',-.5,-7,4.6,.15).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-0-7']})));
 envTasks.push(place('building_blacksmith_green',-6,-.5,2.5,.8).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-2-1']})));
 envTasks.push(place('building_church_green',6,-5,3.8,-.3).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-4-4']})));
 envTasks.push(place('building_windmill_green',-11,-7,4.4,.4).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-1-1']})));
 envTasks.push(place('building_watermill_green',5,-8,2.9,0).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-1-0']})));
 for(let i=0;i<4;i++)envTasks.push(place('building_grain',-9+i*.65,-.8,1.1).then(o=>envObjects.push({o,condition:s=>!!s.skills['tech-0-1']})));
 for(let i=0;i<6;i++)envTasks.push(place('cloud_big',-17+i*7,-18,1.2+i%2).then(o=>{o.position.y=8+i%3;clouds.push(o);}));
 await Promise.all(envTasks);
 // Small luminous motes and a cultivation seal animate gently during focus.
 const seal=mesh(new THREE.TorusGeometry(1.6,.025,6,64),'#d1ba6a',new THREE.Vector3(homeHero.x,.23,homeHero.z));seal.rotation.x=Math.PI/2;seal.material.emissive=new THREE.Color('#98782d');seal.material.emissiveIntensity=.4;seal.userData.focus=true;sprites.push(seal);
 const sparkMat=new THREE.MeshBasicMaterial({color:'#f3deb0',transparent:true,opacity:.8});for(let i=0;i<20;i++){const o=new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),sparkMat);o.position.set(-9+i*.91,.6+i%3,-3+(i*1.73)%10);o.userData.base=o.position.clone();scene.add(o);sprites.push(o);}
 const orb=mesh(new THREE.SphereGeometry(.13,12,12),'#ebd4a0');orb.material.emissive=new THREE.Color('#edc975');orb.material.emissiveIntensity=2;orb.castShadow=false;orb.userData.orb=true;sprites.push(orb);
}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight,false);const aspect=innerWidth/innerHeight,span=innerWidth<760?10.2:8.7;camera.left=-span*aspect;camera.right=span*aspect;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();}
function tick(timeMs){
 frameHandle=requestAnimationFrame(tick);const time=timeMs/1000,frameRate=document.body.classList.contains('quiet')?6:document.body.dataset.view==='home'?30:10;if(time-lastTime<1/frameRate)return;const delta=Math.min(.2,Math.max(0,time-lastTime));lastTime=time;const state=getState(),quiet=state.settings.quiet||matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(ready){
  combat(state,time);updateActors(state,time).catch(showError);
  for(const a of actors){a.mixer.update(quiet?0:delta);if(quiet&&a.current)a.mixer.setTime(0);}
  for(const e of envObjects)e.o.visible=e.condition(state);
  if(hero){hero.object.position.x=homeHero.x+(quiet?0:time-attackAt<.75?Math.sin((time-attackAt)/.75*Math.PI)*.65:0);}
  for(let i=0;i<clouds.length;i++){clouds[i].position.x=-17+i*7+(quiet?0:Math.sin(time*.035+i)*2);}
  for(let i=0;i<sprites.length;i++){const o=sprites[i];if(o.userData.focus)o.visible=!!state.focus?.running;else if(o.userData.orb){const t=(time-attackAt-.15)/.55;o.visible=!quiet&&t>0&&t<1;if(o.visible)o.position.set(homeHero.x+(homeEnemy.x-homeHero.x)*t,1.8+Math.sin(t*Math.PI)*.65,homeHero.z);}else o.position.y=o.userData.base.y+(quiet?0:Math.sin(time*.7+i)*.35);}
  if(region!==state.region){region=state.region;const palette=['#d7dfcd','#c8dfd0','#e0d3b6','#d5d3e5','#d3e2df','#e4d4c7','#dfd3e7','#dadcbe'][region];scene.background.set(palette);scene.fog.color.set(palette);}
  renderer.render(scene,camera);updateLabels(state);
  for(const canvas of document.querySelectorAll('.scene-wrap canvas')){const rect=canvas.getBoundingClientRect();if(rect.width){canvas.width=Math.round(rect.width*devicePixelRatio);canvas.height=Math.round(rect.height*devicePixelRatio);const ctx=canvas.getContext('2d');ctx.drawImage(renderer.domElement,0,0,canvas.width,canvas.height);}}
 }
}
function showError(error){console.error(error);let el=document.querySelector('.world-loading');if(!el){el=document.createElement('div');el.className='world-loading';document.body.append(el);}el.classList.add('error');el.textContent='3D 场景加载失败：'+error.message+'。待办和专注仍可使用。';}
async function start(readState){
 getState=readState;cancelAnimationFrame(frameHandle);const loading=document.createElement('div');loading.className='world-loading';loading.textContent='正在唤醒你的三道世界…';document.body.append(loading);
 try{renderer=new THREE.WebGLRenderer({canvas:document.getElementById('game-world'),antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;await buildWorld();await updateActors(getState());resize();window.addEventListener('resize',resize);ready=true;document.body.dataset.worldReady='true';loading.remove();frameHandle=requestAnimationFrame(tick);}
 catch(error){showError(error);}
}
// Portraits are rendered from the same actual models used in the world.
async function portrait(name){const gltf=await model(name),mini=new THREE.Scene(),r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setSize(384,384);r.setPixelRatio(1);r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.1;mini.add(new THREE.HemisphereLight('#fff5e7','#8da47d',2.5));const light=new THREE.DirectionalLight('#fff0dd',3.5);light.position.set(-3,7,5);mini.add(light);const object=clone(gltf.scene);accessories(object,name);mini.add(object);const mixer=new THREE.AnimationMixer(object),clip=gltf.animations.find(a=>a.name==='Idle');if(clip){mixer.clipAction(clip).play();mixer.setTime(.35);}const b=new THREE.Box3().setFromObject(object),center=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3()),span=Math.max(size.y,size.x)*.61,cam=new THREE.OrthographicCamera(-span,span,span,-span,.01,100);cam.position.copy(center.clone().add(new THREE.Vector3(size.y*.65,size.y*.4,size.y*1.6)));cam.lookAt(center);r.render(mini,cam);const url=r.domElement.toDataURL('image/webp',.93);r.dispose();return url;}
window.FocusScene={start,portrait,monsterModels,debug:()=>({ready,actors:actors.map(a=>({model:a.name,animation:a.current?.getClip().name})),models:cache.size,drawCalls:renderer?.info.render.calls})};
