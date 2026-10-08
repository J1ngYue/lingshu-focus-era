/* All game content is local; no account or network is required. */
var FocusData = (() => {
  const paths = {
    tech: { name: '世界科技树', short: '科技', verb:'研究', subtitle: '从篝火营地，到灵能文明，再到星际世界', color: '#467f9a', icon: 'cpu' },
    cultivation: { name: '修仙悟道树', short: '修行', verb:'参悟', subtitle: '境界突破、剑意枪意、炼体与神识', color: '#52856a', icon: 'leaf' },
    arcane: { name: '术法技能树', short: '术法', verb:'学习', subtitle: '六大法系，让灵感成为真正的术法', color: '#9274ab', icon: 'spark' }
  };
  const branchNames = {
    tech:['聚落与文明','能源与灵网','工业与造物','防卫与远征','知识与计算','空间与星际'],
    cultivation:['境界突破','剑意之道','枪意之道','刀意之道','炼体之道','神识之道'],
    arcane:['赤焰术法','寒霜术法','雷霆术法','青木术法','星辰术法','时空术法']
  };
  const names = {
    tech:[
      '营火聚落,农耕起源,灌溉水渠,石筑村落,道路网络,集市贸易,公共学堂,城镇规划,驿站物流,图书馆,学术学院,生态都市,浮空城邦,文明议会,行星都市,星际港城,银河共同体,万界文明',
      '水轮动力,风力磨坊,蒸汽引擎,电力网络,蓄能电池,灵石提纯,灵能电网,聚灵输送,磁约束能源,冷聚变,反物质储能,虚空汲能,恒星采集,戴森环,真空零点能,星核引擎,维度潮汐能,永恒能源网',
      '石器加工,铜器冶炼,铁器锻造,机械传动,标准零件,自动织机,精密机床,灵械工厂,自动装配,纳米制造,自修复材料,生体工程,分子打印,造物工坊,行星工程,星舰制造,恒星锻造,万象造物',
      '木栅防线,石砌城墙,弩塔工事,火药工坊,蒸汽战甲,电磁护盾,灵能炮台,无人哨站,飞行舰队,量子雷达,轨道防卫,机甲军团,行星护盾,深空远征,星际堡垒,引力阵列,维度防壁,诸界守望',
      '结绳记事,文字记录,纸张印刷,天文观测,公共档案,数理体系,科研实验,灵纹编码,自动计算,认知芯片,灵能通信,量子计算,星图数据库,集体智慧,因果推演,万界知识网,真理模拟,全知图书馆',
      '方位测绘,远行罗盘,航海仪器,地理勘探,飞行原理,蒸汽飞艇,灵能飞舟,近空航站,轨道升降,月面基地,星门雏形,跨星传送,行星航路,亚空间航行,维度锚点,万界星门,时空航道,宇宙织网'
    ],
    cultivation:[
      '引气入体,炼气境,筑基境,开光境,融合境,心动境,金丹境,灵寂境,元婴境,出窍境,分神境,合体境,洞虚境,大乘境,渡劫境,地仙境,天仙境,金仙境',
      '识剑,养剑,剑感,剑气,剑势,剑心,剑意初成,剑意通明,人剑合一,剑域雏形,无尘剑境,山河剑意,星河剑意,剑域圆满,问道一剑,无我之剑,太虚剑道,万剑归一',
      '识枪,站桩,枪感,枪劲,枪势,枪心,枪意初成,枪意通明,人枪合一,破军枪意,游龙枪意,山河枪意,惊天枪意,枪域圆满,问道一枪,无我之枪,太虚枪道,万法一枪',
      '识刀,养刃,刀感,刀气,刀势,刀心,刀意初成,刀意通明,人刀合一,断岳刀意,归海刀意,日月刀意,裂空刀意,刀域圆满,问道一刀,无我之刀,太虚刀道,万象归刃',
      '锻骨入门,易筋洗髓,气血充盈,铜皮境,铁骨境,玉筋境,金身初成,五脏归元,百炼灵体,无垢道体,山岳真身,星辰体魄,不灭金身,道体圆满,渡劫仙躯,地仙真体,天仙无垢,万古不朽',
      '静心凝神,内视己身,灵觉初醒,神识外放,识海开辟,分念双行,神魂凝练,心镜澄明,元神初成,洞察万物,神游天地,心念成界,无我忘境,元神圆满,渡劫不迷,仙识初成,太虚神游,万念归一'
    ],
    arcane:[
      '火花术,灼热箭,火球术,燃烧印记,烈焰环,炎盾术,火雨术,爆炎术,赤焰召唤,熔火领域,凤凰火翼,九阳焚阵,天火流星,不灭圣焰,焚天禁咒,太阳之怒,原初之火,赤焰创世',
      '霜针术,寒气缠绕,冰锥术,冻结印记,寒霜环,冰镜盾,暴风雪,冰封术,霜灵召唤,极寒领域,冰晶牢笼,千里霜华,绝对零度,永冻之境,冰河禁咒,寒星坠落,原初之冰,霜雪创世',
      '电火花,雷击术,闪电链,雷鸣印记,电磁环,雷光盾,雷雨术,奔雷术,雷灵召唤,风暴领域,雷龙咆哮,九霄雷阵,天劫引落,万雷天牢,雷罚禁咒,雷神之怒,原初之雷,雷霆创世',
      '嫩芽术,藤蔓缠绕,荆棘术,生命印记,青木环,树皮盾,花雨术,回春术,树灵召唤,森罗领域,生命共鸣,万木生长,世界树枝,自然庇佑,森海禁咒,大地苏醒,原初之木,青木创世',
      '星光术,星芒箭,流星术,星辉印记,星辰环,星幕盾,星雨术,引力术,星灵召唤,银河领域,星轨连结,群星法阵,陨星天降,银河庇护,星陨禁咒,星河之怒,原初之星,群星创世',
      '移物术,空间步,迟缓术,时序印记,空间环,虚空盾,瞬移术,加速术,时灵召唤,时空领域,折叠空间,时间回响,虚空放逐,时停结界,时空禁咒,因果之门,原初时序,时空创世'
    ]
  };
  const techEffects = [['loot',.03,'gem'],['def',1,'bolt'],['atk',2,'cpu'],['hp',6,'shield'],['xp',.015,'book'],['loot',.04,'map']];
  const cultivationEffects = [['hp',8,'leaf'],['atk',2,'sword'],['crit',.006,'sword'],['atk',2,'sword'],['def',1,'shield'],['focus',.008,'orbit']];
  const arcaneEffects = [['atk',2,'spark'],['def',1,'snow'],['crit',.006,'bolt'],['hp',7,'leaf'],['xp',.015,'star'],['focus',.008,'clock']];
  const effectText = {atk:'攻击',def:'防御',hp:'生命',crit:'暴击率',loot:'灵石产出',xp:'学习经验',focus:'专注点数加成'};
  const skills = Object.entries(names).flatMap(([path,branches]) => branches.flatMap((list,branch) => list.split(',').map((name,step) => {
    const [effect,base,icon] = ({tech:techEffects,cultivation:cultivationEffects,arcane:arcaneEffects})[path][branch];
    const value = base * (1+Math.floor(step/6)), percentage=['crit','loot','xp','focus'].includes(effect);
    const prefix=path==='tech'?`文明设施 · ${branchNames[path][branch]}`:path==='cultivation'?`修行层次 · ${branchNames[path][branch]}`:`法术技能 · ${branchNames[path][branch]}`;
    return {id:`${path}-${branch}-${step}`,path,branch,step,tier:Math.floor(step/3),column:branch,name,
      description:`${prefix}。${effectText[effect]} +${percentage?Math.round(value*1000)/10+'%':value}。${path==='tech'&&step%3===0?'推动营地设施升级。':''}`,
      effect,value,icon,max:1,level:Math.max(1,step*2-1),cost:15+step*12+Math.floor(step/6)*15,parent:step?`${path}-${branch}-${step===12&&!(branch===0&&path!=='arcane')?5:step-1}`:null};
  })));
  const jobs = [
    { id: 'engineer', name: '灵械师', path: 'tech', tier: 1, level: 3, cost: 45, requires: {tech: 1}, icon: 'cpu', description: '机关与灵能的初次共鸣', bonus: {atk: 8, def: 3} },
    { id: 'swordsman', name: '御剑修士', path: 'cultivation', tier: 1, level: 3, cost: 45, requires: {cultivation: 1}, icon: 'sword', description: '以心为锋，以专注养剑', bonus: {atk: 10, hp: 20} },
    { id: 'mage', name: '符文术士', path: 'arcane', tier: 1, level: 3, cost: 45, requires: {arcane: 1}, icon: 'spark', description: '让知识化为闪耀的符文', bonus: {atk: 8, crit: .08} },
    { id: 'mecha', name: '天机剑客', path: 'tech', tier: 2, level: 8, cost: 120, requires: {tech: 4, cultivation: 3}, icon: 'sword', description: '机械剑阵 × 御剑之道', bonus: {atk: 25, def: 8} },
    { id: 'alchemist', name: '星辰炼金师', path: 'arcane', tier: 2, level: 8, cost: 120, requires: {arcane: 4, tech: 3}, icon: 'flask', description: '星辉术式 × 灵能科技', bonus: {atk: 22, loot: .25, xp: .1} },
    { id: 'sage', name: '玄灵道师', path: 'cultivation', tier: 2, level: 8, cost: 120, requires: {cultivation: 4, arcane: 3}, icon: 'orbit', description: '仙门心法 × 元素术法', bonus: {atk: 22, hp: 65, focus: .15} },
    { id: 'celestial', name: '太虚机神', path: 'tech', tier: 3, level: 16, cost: 260, requires: {tech: 9, cultivation: 5, arcane: 5}, icon: 'cpu', description: '三道合一 · 万物皆可创造', bonus: {atk: 60, def: 20, hp: 100} },
    { id: 'immortal', name: '星河剑仙', path: 'cultivation', tier: 3, level: 16, cost: 260, requires: {cultivation: 9, arcane: 5, tech: 5}, icon: 'sword', description: '三道合一 · 以剑开辟星河', bonus: {atk: 65, crit: .12, hp: 100} },
    { id: 'archmage', name: '万象法尊', path: 'arcane', tier: 3, level: 16, cost: 260, requires: {arcane: 9, tech: 5, cultivation: 5}, icon: 'spark', description: '三道合一 · 重写世界法则', bonus: {atk: 60, xp: .25, focus: .3} }
  ];
  const realms = ['练气初境','练气圆满','筑基境','金丹境','元婴境','化神境','渡劫境','太虚境'];
  const regions = [
    {name:'青苔原野',sub:'第一个认真学习的地方',level:1,palette:['#cae4bf','#b4d3a7','#7da783','#8bbcc3'], monsters:['苔灵史莱姆','迷途小妖','藤蔓精'], boss:'古木守望者',hp:38,atk:5,sprites:[109,110,111,113]},
    {name:'灵雾竹海',sub:'在宁静中磨炼心性',level:3,palette:['#b4d8c3','#a0c9b4','#6d9d85','#8ac9c5'],monsters:['竹叶妖','幽雾狐','青玉螳'],boss:'千年竹灵',hp:90,atk:11,sprites:[112,114,115,116]},
    {name:'赤铜工坊',sub:'灵能机械开始苏醒',level:5,palette:['#e1c69e','#ceb282','#a58260','#91bfc4'],monsters:['失控齿轮','铜甲卫兵','磁能飞虫'],boss:'蒸汽巨像',hp:160,atk:17,sprites:[117,118,119,120]},
    {name:'月影遗迹',sub:'古老符文藏着新的答案',level:8,palette:['#ccd0e6','#b6bdd6','#8b92b2','#a1bdde'],monsters:['月影幽灵','符文蝙蝠','镜界傀儡'],boss:'月蚀祭司',hp:280,atk:25,sprites:[111,115,122,121]},
    {name:'雷霆浮岛',sub:'越过风暴，触及天空',level:12,palette:['#bcd9df','#a5c9d1','#719ca8','#b6c9e7'],monsters:['雷云兽','苍翼龙','风灵使'],boss:'雷霆龙王',hp:460,atk:35,sprites:[123,124,125,126]},
    {name:'星核熔炉',sub:'让科技与仙术一起燃烧',level:16,palette:['#e3c8bd','#d4b09f','#af7f72','#ddb89c'],monsters:['熔岩蛞蝓','火核机兵','赤焰魔灵'],boss:'星核泰坦',hp:700,atk:46,sprites:[118,120,121,127]},
    {name:'太虚秘境',sub:'心流尽处，万象初生',level:20,palette:['#d8cae9','#c4b3dc','#9c88b5','#bbd0e5'],monsters:['虚空游灵','梦境织者','道纹异兽'],boss:'太虚观测者',hp:1000,atk:58,sprites:[124,122,125,128]},
    {name:'三界交汇',sub:'属于长期坚持者的终点',level:25,palette:['#d9dbc3','#c5cba6','#a3ac82','#a2c3be'],monsters:['混沌守卫','时空裂兽','万象之影'],boss:'三界之主',hp:1450,atk:72,sprites:[126,127,128,129]}
  ];
  const equipment = ['初阶','精良','史诗','传说'].flatMap((quality, tier) => [
    {id:`weapon-${tier}`,slot:'weapon',name:['竹锋短剑','灵能光刃','雷纹仙剑','星河裁决'][tier],quality,tier,icon:'sword',level:[1,4,9,16][tier],cost:[30,100,280,650][tier],shards:[0,2,6,15][tier],bonus:{atk:[5,14,32,65][tier]}},
    {id:`armor-${tier}`,slot:'armor',name:['布衣护甲','铜灵战衣','月辉道袍','太虚灵铠'][tier],quality,tier,icon:'shield',level:[1,4,9,16][tier],cost:[25,90,250,600][tier],shards:[0,2,6,15][tier],bonus:{def:[2,5,12,24][tier],hp:[10,25,55,110][tier]}},
    {id:`charm-${tier}`,slot:'charm',name:['静心玉佩','星砂怀表','天机灵环','万象之心'][tier],quality,tier,icon:'gem',level:[1,4,9,16][tier],cost:[25,100,260,620][tier],shards:[0,2,6,15][tier],bonus:{xp:[.03,.08,.15,.25][tier]}}
  ]);
  const achievements = [
    {id:'first-task',name:'迈出第一步',description:'完成第一个事项',metric:'tasks',target:1,reward:10,icon:'check'},
    {id:'first-focus',name:'一刻钟的自己',description:'累计专注 15 分钟',metric:'minutes',target:15,reward:15,icon:'focus'},
    {id:'ten-tasks',name:'说到做到',description:'累计完成 10 个事项',metric:'tasks',target:10,reward:25,icon:'check'},
    {id:'hour',name:'渐入佳境',description:'累计专注 60 分钟',metric:'minutes',target:60,reward:25,icon:'clock'},
    {id:'five-skills',name:'三道初识',description:'点亮 5 个不同成长节点',metric:'skills',target:5,reward:20,icon:'spark'},
    {id:'first-job',name:'找到自己的路',description:'完成第一次转职',metric:'jobs',target:1,reward:30,icon:'sword'},
    {id:'first-boss',name:'守望者的认可',description:'首次击败地区首领',metric:'bosses',target:1,reward:20,icon:'crown'},
    {id:'hundred',name:'原野漫游者',description:'累计击败 100 只怪兽',metric:'kills',target:100,reward:30,icon:'map'},
    {id:'three-days',name:'再见面，老朋友',description:'连续 3 天完成任务或专注满 1 分钟',metric:'streak',target:3,reward:30,icon:'sun'},
    {id:'ten-hours',name:'时间的复利',description:'累计专注 600 分钟',metric:'minutes',target:600,reward:80,icon:'orbit'},
    {id:'triad',name:'科技 · 修仙 · 术法',description:'三棵树各点亮 3 个节点',metric:'triad',target:3,reward:45,icon:'leaf'},
    {id:'all-bosses',name:'三界学者',description:'击败全部 8 位地区首领',metric:'bosses',target:8,reward:150,icon:'crown'}
  ];
  return {paths,skills,jobs,realms,regions,equipment,achievements,branchNames};
})();
if (typeof module !== 'undefined') module.exports = FocusData;
