var FocusEngine = (() => {
  const D = typeof FocusData !== 'undefined' ? FocusData : require('./data.js');
  const day = (time = Date.now()) => { const d = new Date(time); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const level = s => { let n = 1, remaining = s.xp; while (n < 60 && remaining >= n*55) remaining -= n++*55; return {value:n, xp:remaining, next:n*55}; };
  const log = (s, text, type = 'normal', now = Date.now()) => { s.logs.unshift({id:uid(),text,type,at:now}); s.logs.length = Math.min(s.logs.length,60); };
  function daily(s, date = day()) { return s.days[date] ||= {seconds:0,tasks:0,points:0,sessions:0}; }
  function grant(s, points, xp, now) { points = Math.max(0,Math.floor(points)); const st=stats(s);s.points += points; s.earned += points; s.xp += Math.floor(xp*(1+st.xp));s.coins+=Math.floor(xp/2*(1+st.loot)); daily(s,day(now)).points += points; }
  function create(now = Date.now()) {
    const s = {version:1,name:'小灵',createdAt:now,lastTick:now,xp:0,points:0,earned:0,coins:0,shards:0,
      skills:{},job:null,jobHistory:[],gear:{weapon:'starter-sword'},owned:['starter-sword'],lastDrop:null,region:0,stage:1,kills:0,attacks:0,bosses:[],bestiary:{},battle:null,battleEvents:[],battleEventId:0,
      focus:null,breakUntil:0,sessions:[],tasks:[],days:{},claimed:[],logs:[],settings:{goal:90,quiet:false}};
    return s;
  }
  function stats(s) {
    const lv = level(s).value;
    const out = {atk:8+lv*2,def:2+lv,hp:70+lv*10,crit:.05,loot:0,xp:0,focus:0,haste:0};
    for (const skill of D.skills) {const rank=s.skills[skill.id]||0;out[skill.effect] += rank*skill.value;out.haste+=rank*(skill.haste||0);}
    const job = D.jobs.find(j=>j.id===s.job);
    for (const bonus of [job?.bonus,...Object.values(s.gear).map(id=>D.equipment.find(e=>e.id===id)?.bonus)])
      if (bonus) for (const [key,value] of Object.entries(bonus)) out[key] += value;
    out.crit = Math.min(.65,out.crit); out.focus = Math.min(1,out.focus);out.speed=1+out.haste;
    out.power = Math.round(out.atk*3*out.speed + out.def*2 + out.hp*.2 + out.crit*100);
    return out;
  }
  const pathCount = (s,path) => D.skills.filter(k=>k.path===path && s.skills[k.id]>0).length;
  function skillReason(s, skill) {
    if (!skill) return '技能不存在';
    if ((s.skills[skill.id]||0)>=skill.max) return '已达到满级';
    if (level(s).value<skill.level) return `需要 Lv.${skill.level}`;
    if (skill.parent && !(s.skills[skill.parent]>0)) return '先点亮前置节点';
    if (s.points < skill.cost*((s.skills[skill.id]||0)+1)) return '灵感点数不足，完成任务或专注学习即可获得';
    return '';
  }
  function learn(s,id,now=Date.now()) {
    const skill=D.skills.find(k=>k.id===id), reason=skillReason(s,skill); if(reason) return {ok:false,message:reason};
    s.points-=skill.cost*((s.skills[id]||0)+1); s.skills[id]=(s.skills[id]||0)+1;
    log(s,`${D.paths[skill.path].verb} ${skill.name}`,'skill',now); return {ok:true,message:`${skill.name}${skill.path==='tech'?'研究完成':skill.path==='cultivation'?'参悟完成':'已学会'}`};
  }
  function jobReason(s,job) {
    if (!job) return '职业不存在'; if(s.job===job.id) return '当前职业';
    if(level(s).value<job.level) return `需要 Lv.${job.level}`;
    for(const [path,count] of Object.entries(job.requires)) if(pathCount(s,path)<count) return `需要 ${D.paths[path].short} ${count} 个节点`;
    if(s.points<job.cost) return '灵感点数不足'; return '';
  }
  function transfer(s,id,now=Date.now()) {
    const job=D.jobs.find(j=>j.id===id),reason=jobReason(s,job);if(reason)return {ok:false,message:reason};
    s.points-=job.cost;s.job=id;if(!s.jobHistory.includes(id))s.jobHistory.push(id);
    log(s,`转职为 ${job.name}，三道之路又近了一步。`,'skill',now);return {ok:true,message:`转职成功 · ${job.name}`};
  }
  function addTask(s,input,now=Date.now()) {
    const title=String(input.title||'').trim(),minutes=Number(input.minutes);
    if(!title || title.length>100) return {ok:false,message:'事项名称需要 1–100 个字'};
    if(!Number.isInteger(minutes)||minutes<5||minutes>180)return {ok:false,message:'预计时长应为 5–180 分钟'};
    const category=['学习','练习','复盘','生活'].includes(input.category)?input.category:'学习';
    const task={id:uid(),title,minutes,category,date:day(now),done:false,createdAt:now};s.tasks.push(task);return {ok:true,task,message:'今日事项已添加'};
  }
  const taskReward = task => Math.max(5,Math.round(task.minutes*.6));
  function completeTask(s,id,now=Date.now()) {
    const task=s.tasks.find(t=>t.id===id);if(!task || task.done)return {ok:false,message:'该事项已经结算或不存在'};
    task.done=true;task.completedAt=now;const reward=taskReward(task);grant(s,reward,task.minutes*2,now);daily(s,day(now)).tasks++;
    log(s,`完成「${task.title}」 · +${reward} 灵感点数`,'reward',now);return {ok:true,message:`完成事项！+${reward} 灵感点数`};
  }
  function startFocus(s,minutes,taskId=null,now=Date.now()) {
    if(s.focus)return {ok:false,message:'请先结算当前专注'};
    minutes=Number(minutes);if(!Number.isInteger(minutes)||minutes<1||minutes>180)return {ok:false,message:'专注时长应为 1–180 分钟'};
    if(taskId && !s.tasks.some(t=>t.id===taskId&&!t.done))return {ok:false,message:'关联事项不存在或已完成'};
    s.breakUntil=0;s.focus={id:uid(),goal:minutes*60,seconds:0,credited:0,points:0,taskId,running:true,lastUpdate:now,startedAt:now};
    log(s,`开始 ${minutes} 分钟专注，角色将为你自动探险。`,'focus',now);return {ok:true,message:'专注开始，把注意力留给学习'};
  }
  function addSeconds(s,from,to) {
    while(from<to) {const d=new Date(from);d.setHours(24,0,0,0);const end=Math.min(to,d.getTime());daily(s,day(from)).seconds+=(end-from)/1000;from=end;}
  }
  function settle(s,completed,now) {
    const f=s.focus;if(!f)return;
    if(completed){grant(s,5,10,now);f.points+=5;}
    if(f.seconds>=60){daily(s,day(now)).sessions++;s.sessions.unshift({id:f.id,startedAt:f.startedAt,endedAt:now,seconds:Math.floor(f.seconds),goal:f.goal,points:f.points,completed,taskId:f.taskId});s.sessions.length=Math.min(500,s.sessions.length);}
    log(s,`${completed?'专注完成':'专注已结算'} · ${Math.floor(f.seconds/60)} 分钟 · +${f.points} 点`,'focus',now);
    s.focus=null;return {ok:true,message:completed?'专注完成！休息一下，记得验收对应事项。':'已结算本次专注，完整分钟的奖励已保留'};
  }
  function focusTick(s,now) {
    const f=s.focus;if(!f||!f.running){if(f)f.lastUpdate=now;return false;}
    const elapsed=Math.max(0,Math.min((now-f.lastUpdate)/1000,f.goal-f.seconds));
    addSeconds(s,f.lastUpdate,f.lastUpdate+elapsed*1000);f.seconds+=elapsed;f.lastUpdate=now;
    const minutes=Math.floor(f.seconds/60),earned=minutes-f.credited;
    if(earned>0){const points=Math.floor(minutes*(1+stats(s).focus))-Math.floor(f.credited*(1+stats(s).focus));grant(s,points,earned*6,now);f.points+=points;f.credited=minutes;}
    if(f.seconds>=f.goal){settle(s,true,now);return true;}return false;
  }
  function pauseFocus(s,now=Date.now()){advance(s,now);if(!s.focus)return {ok:false,message:'当前专注已经结束'};s.focus.running=!s.focus.running;s.focus.lastUpdate=now;return {ok:true,message:s.focus.running?'继续专注':'已暂停，暂停时间不计入奖励'};}
  function finishFocus(s,now=Date.now()){advance(s,now);if(!s.focus)return {ok:false,message:'当前没有需要结算的专注'};return settle(s,false,now);}
  function enemy(s) {
    const r=D.regions[s.region],boss=s.stage%10===0,index=boss?3:(s.stage-1)%3;
    return {name:boss?r.boss:r.monsters[index],boss,sprite:r.sprites[index],hp:Math.round(r.hp*(boss?3:1)*(1+(s.stage-1)%10*.08)),atk:Math.round(r.atk*(boss?1.5:1)),speed:(.5+s.region*.02)*(boss?.85:1),key:`${s.region}-${index}`};
  }
  function dropChances(s) {
    const progress=(level(s).value-1)/59;
    return [.8-.6*progress,.17+.2*progress,.028+.26*progress,.002+.14*progress];
  }
  function dropEquipment(s,boss=false,now=Date.now(),random=Math.random) {
    if(!s.focus?.running||random()>=(boss?1:.25))return null;
    const chances=dropChances(s);let roll=random(),tier=0;
    while(tier<3&&roll>=chances[tier])roll-=chances[tier++];
    const pool=D.equipment.filter(e=>e.id!=='starter-sword'&&e.tier===tier),item=pool[Math.floor(random()*pool.length)],duplicate=s.owned.includes(item.id),shards=duplicate?1+tier:0;
    if(duplicate)s.shards+=shards;else s.owned.push(item.id);
    s.lastDrop={id:uid(),itemId:item.id,name:item.name,quality:item.quality,tier,duplicate,shards,at:now};
    log(s,`拾取 ${item.quality}·${item.name}${duplicate?`（重复，化为 ${shards} 星屑）`:'，已收入灵器匣'}`,'loot',now);return s.lastDrop;
  }
  function battleAdvance(s,seconds,now) {
    const st=stats(s),spells=D.skills.filter(k=>k.path==='arcane'&&s.skills[k.id]);let left=seconds;
    const emit=event=>{s.battleEvents.push({...event,id:++s.battleEventId,at:now-left*1000});if(s.battleEvents.length>32)s.battleEvents.shift();};
    while(left>1e-9){const e=enemy(s);
      if(!s.battle||s.battle.key!==`${s.region}-${s.stage}`)s.battle={key:`${s.region}-${s.stage}`,enemyHp:e.hp,heroHp:st.hp,heroCharge:0,enemyCharge:0,revive:0,guard:1};
      const b=s.battle;
      if(b.revive>0){const step=Math.min(left,b.revive);left-=step;b.revive-=step;if(b.revive<=1e-9){b.revive=0;b.heroHp=st.hp;}continue;}
      const step=Math.min(left,(1-b.heroCharge)/st.speed,(1-b.enemyCharge)/e.speed);left-=step;b.heroCharge+=step*st.speed;b.enemyCharge+=step*e.speed;
      if(b.heroCharge>=1-1e-9){b.heroCharge=0;s.attacks++;const critical=s.attacks%Math.max(2,Math.round(1/st.crit))===0,spell=spells.length&&s.attacks%3===0?spells[(s.attacks/3-1)%spells.length]:null;
        if(spell){s.lastSpell={name:spell.name,branch:spell.branch,at:now-left*1000};if(spell.branch===3)b.heroHp=Math.min(st.hp,b.heroHp+8+spell.step*2);if([1,5].includes(spell.branch))b.guard=.6;}
        const damage=Math.max(1,Math.round(st.atk*(critical?1.8:1)*(spell&&[0,2,4].includes(spell.branch)?1.35:1)));b.enemyHp=Math.max(0,b.enemyHp-damage);const lethal=b.enemyHp===0;let gain=0,drop=null;
        if(lethal){gain=Math.round((3+s.region*3)*(1+st.loot)*(e.boss?5:1));s.coins+=gain;s.kills++;s.bestiary[e.key]=(s.bestiary[e.key]||0)+1;if(e.boss){s.shards+=1+s.region;if(!s.bosses.includes(s.region))s.bosses.push(s.region);log(s,`击败 ${e.name} · +${gain} 灵石 / +${1+s.region} 星屑`,'battle',now-left*1000);}s.stage++;s.battle=null;}
        if(lethal)drop=dropEquipment(s,e.boss,now-left*1000);
        emit({actor:'hero',enemy:e,damage,lethal,gain,drop,spell:spell?{name:spell.name,branch:spell.branch}:null});
      }
      if(s.battle===b&&b.enemyCharge>=1-1e-9){b.enemyCharge=0;const damage=Math.max(1,Math.round((e.atk-st.def)*b.guard));b.guard=1;b.heroHp=Math.max(0,b.heroHp-damage);emit({actor:'enemy',enemy:e,damage});if(!b.heroHp){b.enemyHp=e.hp;b.heroCharge=b.enemyCharge=0;b.revive=30;log(s,`在 ${e.name} 面前暂时撤退，专注修行 30 秒后重整旗鼓。`,'battle',now-left*1000);}}
    }
  }
  function advance(s,now=Date.now()) {
    const dt=Math.max(0,Math.min(4*3600,(now-s.lastTick)/1000)),hadFocus=s.focus?.running;
    const remaining=hadFocus?Math.max(0,s.focus.goal-s.focus.seconds):0;
    const focusedFrom=hadFocus?Math.max(s.lastTick,s.focus.lastUpdate):now,focusSeconds=Math.min(dt,Math.max(0,(now-focusedFrom)/1000),remaining);if(focusSeconds>0)battleAdvance(s,focusSeconds,focusedFrom+focusSeconds*1000);
    const ended=focusTick(s,now);
    s.lastTick=Math.max(s.lastTick,now);
    return {focusEnded:ended,offline:dt>120,coins:s.coins};
  }
  function regionReason(s,index){if(!Number.isInteger(index)||!D.regions[index])return '地区不存在';if(level(s).value<D.regions[index].level)return `需要 Lv.${D.regions[index].level}`;if(index>0&&!s.bosses.includes(index-1))return `先击败${D.regions[index-1].boss}`;return '';}
  function travel(s,index,now=Date.now()){const reason=regionReason(s,index);if(reason)return {ok:false,message:reason};s.region=index;s.stage=1;s.battle=null;s.battleEvents=[];log(s,`抵达 ${D.regions[index].name}`,'battle',now);return {ok:true,message:`已前往${D.regions[index].name}`};}
  function craft(s,id,now=Date.now()) {
    const e=D.equipment.find(x=>x.id===id);if(!e)return {ok:false,message:'装备不存在'};
    if(s.owned.includes(id)){s.gear[e.slot]=id;return {ok:true,message:`已装备${e.name}`};}
    if(level(s).value<e.level)return {ok:false,message:`需要 Lv.${e.level}`};
    if(s.coins<e.cost||s.shards<e.shards)return {ok:false,message:'锻造材料不足，专注修行与完成事项可获得材料'};
    s.coins-=e.cost;s.shards-=e.shards;s.owned.push(id);s.gear[e.slot]=id;log(s,`锻造并装备 ${e.name}`,'skill',now);return {ok:true,message:`已锻造并装备${e.name}`};
  }
  function streak(s,now=Date.now()){let n=0,d=new Date(now);if(!(s.days[day(d)]?.tasks||s.days[day(d)]?.seconds>=60))d.setDate(d.getDate()-1);for(let i=0;i<366;i++){const v=s.days[day(d)];if(!(v?.tasks||v?.seconds>=60))break;n++;d.setDate(d.getDate()-1);}return n;}
  function metric(s,key,now=Date.now()){return ({tasks:s.tasks.filter(t=>t.done).length,minutes:Math.floor(Object.values(s.days).reduce((a,d)=>a+d.seconds,0)/60),skills:D.skills.filter(k=>s.skills[k.id]>0).length,jobs:s.jobHistory.length,bosses:s.bosses.length,kills:s.kills,streak:streak(s,now),triad:Math.min(...Object.keys(D.paths).map(p=>pathCount(s,p)))})[key]||0;}
  function claim(s,id,now=Date.now()){const a=D.achievements.find(x=>x.id===id);if(!a||s.claimed.includes(id)||metric(s,a.metric,now)<a.target)return {ok:false,message:'成就尚未完成或印记已领取'};s.claimed.push(id);log(s,`成就「${a.name}」已留念`,'normal',now);return {ok:true,message:'成就印记已领取'};}
  function restore(raw,now=Date.now()) {
    if(!raw || raw.version!==1 || !Array.isArray(raw.tasks) || !raw.days || typeof raw.days!=='object')throw new Error('这不是有效的灵枢存档');
    const s=create(now),number=(v,max=1e9)=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max;
    for(const key of ['xp','points','earned','coins','shards','stage','kills','lastTick','createdAt']){if(!number(raw[key],['lastTick','createdAt'].includes(key)?1e14:1e9))throw new Error(`存档字段 ${key} 无效`);s[key]=raw[key];}
    if(raw.attacks!==undefined){if(!number(raw.attacks)||!Number.isInteger(raw.attacks))throw new Error('攻击记录无效');s.attacks=raw.attacks;}
    if(!Number.isInteger(raw.region)||!D.regions[raw.region]||!Number.isInteger(raw.stage)||raw.stage<1)throw new Error('存档地区无效');
    s.region=raw.region;s.name=String(raw.name||'小灵').slice(0,16);s.skills={};
    for(const k of D.skills){const rank=raw.skills?.[k.id]||0;if(!Number.isInteger(rank)||rank<0||rank>k.max)throw new Error('技能等级无效');if(rank)s.skills[k.id]=rank;}
    s.tasks=raw.tasks.slice(0,5000).map(t=>{if(typeof t.id!=='string'||typeof t.title!=='string'||!Number.isInteger(t.minutes)||t.minutes<5||t.minutes>180||typeof t.done!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))throw new Error('事项记录无效');return {...t,title:t.title.slice(0,100)};});
    s.days={};for(const [date,d] of Object.entries(raw.days)){if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!['seconds','tasks','points','sessions'].every(k=>number(d[k])))throw new Error('学习记录无效');s.days[date]={seconds:d.seconds,tasks:d.tasks,points:d.points,sessions:d.sessions};}
    s.job=D.jobs.some(j=>j.id===raw.job)?raw.job:null;
    s.jobHistory=Array.isArray(raw.jobHistory)?raw.jobHistory.filter(id=>D.jobs.some(j=>j.id===id)):[];
    s.owned=Array.isArray(raw.owned)?raw.owned.filter(id=>D.equipment.some(e=>e.id===id)):[];s.gear={};
    for(const slot of ['weapon','armor','charm'])if(s.owned.includes(raw.gear?.[slot])&&D.equipment.some(e=>e.id===raw.gear[slot]&&e.slot===slot))s.gear[slot]=raw.gear[slot];
    if(!s.owned.includes('starter-sword'))s.owned.unshift('starter-sword');if(!s.gear.weapon)s.gear.weapon='starter-sword';
    s.bosses=Array.isArray(raw.bosses)?[...new Set(raw.bosses.filter(n=>Number.isInteger(n)&&D.regions[n]))]:[];
    s.bestiary={};for(const [key,n] of Object.entries(raw.bestiary||{}))if(/^\d+-[0-3]$/.test(key)&&number(n))s.bestiary[key]=n;
    s.claimed=Array.isArray(raw.claimed)?raw.claimed.filter(id=>D.achievements.some(a=>a.id===id)):[];
    s.logs=Array.isArray(raw.logs)?raw.logs.filter(l=>typeof l.text==='string'&&number(l.at,1e14)).slice(0,60).map(l=>({...l,text:l.text.slice(0,300)})):[];
    s.sessions=Array.isArray(raw.sessions)?raw.sessions.filter(f=>number(f.seconds,10800)&&number(f.startedAt,1e14)&&number(f.endedAt,1e14)&&number(f.points)).slice(0,500):[];
    if(raw.focus){const f=raw.focus;if(!['goal','seconds','credited','points','lastUpdate','startedAt'].every(k=>number(f[k],1e14))||f.goal<60||f.goal>10800||f.seconds>f.goal||typeof f.running!=='boolean'||f.credited>Math.floor(f.seconds/60))throw new Error('专注记录无效');s.focus={...f};}
    s.breakUntil=number(raw.breakUntil,1e14)?raw.breakUntil:0;s.settings={goal:Math.max(15,Math.min(480,Number(raw.settings?.goal)||90)),quiet:!!raw.settings?.quiet};
    return s;
  }
  return {D,day,uid,create,level,stats,daily,log,pathCount,skillReason,learn,jobReason,transfer,addTask,taskReward,completeTask,startFocus,pauseFocus,finishFocus,advance,enemy,dropChances,dropEquipment,regionReason,travel,craft,streak,metric,claim,restore};
})();
if (typeof module !== 'undefined') module.exports = FocusEngine;
