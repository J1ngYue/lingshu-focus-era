/* Ink-drawn interface symbols. The 324 node IDs and game rules stay unchanged. */
var FocusArt = (() => {
  const shapes={
    skull:'M8 25Q2 21 4 13Q5 3 19 3Q34 2 36 14Q38 23 30 26L28 35H12L10 25Z M10 14 16 13 15 20 10 20Z M23 13 30 14 30 20 24 20Z M18 25 20 21 23 25Z M16 29V35 M23 29V35',
    gate:'M7 37V16Q7 4 20 4Q33 4 33 16V37Z M14 14V37 M26 14V37 M8 25H32 M14 9 20 5 26 9',
    sword:'M8 29 27 5 31 3 30 9 12 32Z M6 23 16 32 M5 33 9 28',
    spear:'M7 33 25 11 M22 12 27 2 32 3 29 13Z',
    shield:'M7 5 20 2 33 5 31 23Q27 31 20 35Q12 31 9 23Z M20 8V28 M13 17H27',
    gem:'M12 4 27 3 34 13 23 35 7 24 5 13Z M12 4 15 16 23 35 M27 3 25 16 34 13 M5 13 15 16 25 16',
    leaf:'M5 30Q0 8 32 3Q38 30 10 29Z M6 34 26 10 M13 24 13 15 M19 18 28 19',
    book:'M3 7Q11 3 20 8Q29 3 37 7V31Q27 27 20 34Q11 27 3 31Z M20 8V34 M7 12 15 13 M25 13 32 12',
    cpu:'M9 9H31V31H9Z M15 15H25V25H15Z M14 3V8 M25 3V8 M14 32V37 M25 32V37 M3 14H8 M3 25H8 M32 14H37 M32 25H37',
    bolt:'M23 2 8 22H19L16 37 32 16H22Z',
    spark:'M20 2 24 14 37 20 25 25 20 37 15 25 3 20 15 14Z',
    star:'M20 3 25 14 37 16 28 25 31 37 20 31 9 37 12 25 3 16 15 14Z',
    snow:'M20 2V38 M4 11 36 29 M4 29 36 11 M14 6 20 12 26 6 M14 34 20 28 26 34',
    clock:'M20 4A16 16 0 1 1 19.9 4 M20 10V20L28 25 M15 1H25',
    orbit:'M7 28Q-1 16 15 5Q32-5 37 13Q42 27 25 35Q8 44 7 28Z M4 32 36 8 M20 10A10 10 0 1 1 19.9 10',
    home:'M3 19 20 3 37 19 M7 17V35H32V17 M16 35V24H24V35',
    map:'M3 7 14 3 26 8 37 3V32L26 37 14 32 3 37Z M14 3V32 M26 8V37 M18 17 23 22 19 28',
    crown:'M5 10 12 20 20 5 28 20 35 10 31 33H9Z M10 27H30',
    flame:'M21 2Q35 16 32 25Q33 37 20 37Q4 36 5 24Q5 13 13 10L14 21Q23 16 21 2Z M20 20Q30 35 19 33Q11 31 20 20Z',
    city:'M3 36V16H13V36 M16 36V5H27V36 M30 36V19H37V36 M5 21H11 M20 11H23 M20 19H23 M20 27H23',
    water:'M20 2Q4 21 7 29Q10 37 20 37Q35 37 34 24Q31 16 20 2Z M12 23Q10 31 18 32',
    rocket:'M12 27Q8 11 25 2Q39 14 27 29Z M12 20 4 25 6 33 15 28 M27 24 36 27 33 35 26 30 M17 31 13 39 M21 9A4 4 0 1 0 21 17A4 4 0 1 0 21 9',
    eye:'M2 20Q20 1 38 20Q20 38 2 20Z M20 11A9 9 0 1 1 19.9 11 M20 16V24',
    heart:'M20 35 4 20Q-2 8 10 5Q17 3 20 11Q25 0 34 6Q42 13 34 22Z',
    scroll:'M7 5H29Q37 5 36 12H12V31Q12 38 5 36V11Q5 5 7 5Z M12 31H33Q39 38 30 37H6 M15 18H29 M15 24H27',
    check:'M6 21 15 30 34 8',play:'M11 6 33 20 11 34Z',pause:'M10 7H15V33H10Z M25 7H30V33H25Z',plus:'M20 7V33 M7 20H33',
    arrow:'M4 20H35 M24 9 35 20 24 31',edit:'M7 30 26 6 33 11 14 34 5 36Z',trash:'M8 11H32L29 36H11Z M5 7H35 M15 3H25 M16 16V30 M24 16V30',
    focus:'M4 14V4H14 M26 4H36V14 M36 26V36H26 M14 36H4V26 M20 12A8 8 0 1 1 19.9 12',
    moon:'M28 3Q15 15 32 27Q21 41 8 29Q-3 14 12 5Q21 0 28 3Z',sun:'M20 10A10 10 0 1 1 19.9 10 M20 2V6 M20 34V38 M2 20H6 M34 20H38 M5 5 8 8 M32 32 35 35',
    settings:'M15 3H25L27 10 34 11 38 20 32 25 31 33 21 38 15 32 7 31 2 21 8 15 9 7Z M20 13A7 7 0 1 1 19.9 13',
    download:'M20 3V27 M11 18 20 27 29 18 M5 27V36H35V27',upload:'M20 27V3 M11 12 20 3 29 12 M5 27V36H35V27'
  };
  Object.assign(shapes,{
    camp:'M2 32 16 8 30 32Z M16 8 26 5 38 32H30 M12 32 17 21 22 32 M5 36H36',
    grain:'M20 37V5 M20 10Q4 0 7 11Q11 18 20 16 M20 20Q4 10 7 21Q11 28 20 26 M20 13Q36 3 33 14Q29 21 20 19 M20 27Q36 17 33 28Q29 35 20 33',
    wheel:'M20 4A16 16 0 1 1 19.9 4 M20 10A10 10 0 1 1 19.9 10 M20 4V36 M4 20H36 M9 9 31 31 M9 31 31 9',
    wind:'M20 37V19 M20 19Q2 20 4 7Q17 4 20 19Z M20 19Q22 1 35 5Q38 19 20 19Z M20 19Q35 28 29 37Q14 35 20 19Z',
    engine:'M4 16H31V32H4Z M10 16V7H19V16 M4 26H31 M31 19H37V29H31 M12 32V37 M24 32V37 M13 4Q9 0 14 0 M24 12V6',
    battery:'M7 7H33V35H7Z M15 7V2H25V7 M21 12 13 23H21L18 31 27 19H20Z',
    crystal:'M20 2 30 13 26 34H14L10 13Z M20 2 17 14 20 34 23 14Z M10 13H30',
    reactor:'M20 2 34 10V30L20 38 6 30V10Z M20 10A10 10 0 1 1 19.9 10 M20 15 16 21H21L19 26 25 19H20Z',
    magnet:'M6 7H15V23Q20 31 25 23V7H34V24Q20 45 6 24Z M6 14H15 M25 14H34',
    atom:'M6 8Q19-1 31 18Q44 36 31 33Q18 41 7 21Q-4 3 6 8Z M34 8Q21-1 9 18Q-4 36 9 33Q22 41 33 21Q44 3 34 8Z M20 17A3 3 0 1 1 19.9 17',
    planet:'M20 5A15 15 0 1 1 19.9 5 M5 18Q12 13 15 18L21 18 24 25 18 31 M26 7 23 15 30 19 35 18',
    galaxy:'M19 20Q21 10 30 14Q41 21 29 32Q16 45 5 29Q-8 10 12 3Q34-5 39 17 M20 17A3 3 0 1 1 19.9 17',
    gear:'M16 3H24L25 9 31 7 35 14 30 18 37 22 34 30 27 28 24 37H16L15 31 9 33 5 26 10 22 3 18 6 10 13 12Z M20 13A7 7 0 1 1 19.9 13',
    factory:'M3 35V17L14 10V19L25 10V35Z M29 35V3H36V35 M8 25H12 M18 25H22 M1 36H38',
    robot:'M8 10H32V28H8Z M20 10V4 M16 3H24 M12 16H16V20H12Z M24 16H28V20H24Z M15 25H25 M12 28V36 M28 28V36 M8 13H3V25H8 M32 13H37V25H32',
    hammer:'M7 6 16 2 30 16 23 24Z M20 22 7 35 3 31 16 18 M30 16 36 10 24 3 20 7',
    ingot:'M4 27 11 12H29L36 27 30 34H10Z M4 27H36 M11 12 14 27 M29 12 26 27',
    rock:'M4 28 7 12 18 4 31 8 37 24 29 35 13 34Z M7 12 19 16 31 8 M19 16 22 29 37 24 M4 28 22 29',
    cloth:'M4 6Q12 12 20 6Q28 12 36 6V33Q28 27 20 33Q12 27 4 33Z M12 10V29 M28 10V29 M5 17H35 M5 24H35',
    printer:'M9 3H31V12H9Z M4 12H36V29H29V22H11V29H4Z M11 22H29V37H11Z M9 17H12 M16 28H24 M16 32H24',
    dna:'M10 3Q35 11 20 20Q5 29 30 37 M30 3Q5 11 20 20Q35 29 10 37 M12 7H28 M13 14H27 M13 26H27 M12 33H28',
    bow:'M11 3Q37 20 11 37L23 20Z M3 20H34 M28 14 34 20 28 26',
    tower:'M8 36V9H3V3H11V8H17V3H23V8H29V3H37V9H32V36Z M16 36V25Q20 20 24 25V36 M15 15H25',
    radar:'M20 3A17 17 0 1 1 19.9 3 M20 10A10 10 0 1 1 19.9 10 M20 17A3 3 0 1 1 19.9 17 M20 20 33 7 M8 29 11 26',
    satellite:'M15 12 28 25 22 31 9 18Z M5 8 12 15 6 21 0 14Z M28 20 35 27 40 22 33 15Z M23 7Q31 5 33 13 M23 12 28 7 M12 27 6 33',
    network:'M16 16H24V24H16Z M4 4H12V12H4Z M28 4H36V12H28Z M4 28H12V36H4Z M28 28H36V36H28Z M12 12 16 16 M24 16 28 12 M12 28 16 24 M24 24 28 28',
    compass:'M20 3A17 17 0 1 1 19.9 3 M27 11 23 24 12 29 16 16Z M16 16 23 24',
    ship:'M3 26H37L30 36H11Z M20 26V3L5 22H20 M23 6 34 22H23',
    airship:'M3 13Q3 2 20 2Q37 2 37 13Q37 24 20 24Q3 24 3 13Z M20 2V24 M9 6Q4 15 11 22 M30 6Q36 15 29 22 M12 24 15 32H26L29 23 M15 32V36H26V32',
    flask:'M14 3H26 M16 3V16L5 32Q4 37 10 37H30Q36 37 35 32L24 16V3 M10 26H30 M16 30H18 M24 34H26',
    telescope:'M4 19 29 3 37 15 12 29Z M10 15 18 25 M20 22 15 37 M20 22 29 37',
    abacus:'M5 3H35V37H5Z M11 5V35 M20 5V35 M29 5V35 M6 14H34 M8 9H14V12H8Z M17 19H23V25H17Z M26 28H32V32H26Z',
    quill:'M6 35 28 6 M12 26Q6 7 24 3L36 2 34 13 22 24Z M18 18 18 9 M24 12 32 12',
    knot:'M5 4Q16 2 15 14Q12 26 5 24Q0 18 14 16L27 13Q39 13 35 26Q29 34 26 18 M8 25V36 M29 28V36',
    temple:'M2 13 20 3 38 13Z M6 16H34 M8 16V33 M17 16V33 M25 16V33 M33 16V33 M3 36H37',
    lotus:'M20 29Q4 13 20 2Q36 13 20 29Z M20 29Q-3 28 3 10Q20 12 20 29Z M20 29Q43 28 37 10Q20 12 20 29Z M3 29Q20 40 37 29',
    meditate:'M20 3A5 5 0 1 1 19.9 3 M14 15H26L30 25 36 30 20 35 4 30 10 25Z M12 24 20 29 28 24',
    pill:'M20 4A16 16 0 1 1 19.9 4 M12 10Q21 6 28 14 M13 29Q24 34 29 23 M16 20H24 M20 16V24',
    infant:'M20 4A7 7 0 1 1 19.9 4 M11 19H29L33 31Q20 40 7 31Z M11 25 20 30 29 25',
    spirit:'M20 2Q30 9 28 20L33 35 25 31 20 38 15 31 7 35 12 20Q10 9 20 2Z M16 15 18 17 M24 15 22 17',
    cloud:'M8 32Q-3 29 3 20Q5 16 11 18Q9 5 23 5Q32 6 32 18Q43 18 37 29Q35 32 8 32Z',
    person:'M20 2A5 5 0 1 1 19.9 2 M15 15H25L32 25 29 28 23 21V37H17V21L11 28 8 25Z',
    saber:'M5 33 13 25Q32 23 35 3L30 9 9 28Z M7 24 17 33 M2 37 7 32',
    bone:'M11 6Q8-2 2 3Q-3 8 6 11L29 34Q31 42 37 37Q42 31 34 29Z M6 11 11 6 M29 34 34 29',
    muscle:'M7 8 15 3 22 7 18 13 14 10 12 16Q30 8 35 21Q40 34 24 37H6L2 24Z M19 19Q26 13 31 22 M7 26 13 30',
    armor:'M8 3 15 6H25L32 3 38 14 30 18 32 36H8L10 18 2 14Z M15 6 20 13 25 6 M13 20H27 M15 29H25',
    mirror:'M20 3A13 13 0 1 1 19.9 3 M17 29V37H23V29 M12 14 21 7 M16 21 27 10',
    dragon:'M5 32Q10 20 23 22L27 15 22 14 24 6 31 10 36 4 37 18 32 24Q28 34 18 31L16 38 10 31 M28 15H31 M11 23 8 15 19 20',
    mountain:'M2 34 14 6 21 18 28 10 38 34Z M9 18 14 6 19 17 M23 21 28 10 32 20',
    wing:'M20 33Q-3 26 3 4L12 12 8 2 18 15 20 33Q43 26 37 4L28 12 32 2 22 15Z',
    ring:'M20 6A14 14 0 1 1 19.9 6 M20 13A7 7 0 1 1 19.9 13 M5 31 35 9',
    meteor:'M5 35 10 20 21 31Z M10 20 30 2 M16 25 37 6 M22 31 36 16 M5 35 12 34',
    rain:'M7 17Q0 16 3 9Q5 5 10 8Q14-3 24 3Q29 5 29 9Q40 5 38 16H7Z M9 24 5 32 M20 24 16 37 M31 24 27 33',
    seal:'M11 3H29V37H11Z M15 9 25 14 16 20 25 27 19 33 M7 10H3 M33 29H37',
    burst:'M20 2 25 11 36 7 30 19 39 25 27 27 26 38 18 30 7 36 10 25 1 18 13 16 10 5Z',
    familiar:'M7 18 3 7 15 11 20 5 25 11 37 7 33 18V30Q20 41 7 30Z M12 21 16 23 M28 21 24 23 M17 29H23',
    field:'M20 9Q6 11 4 29L20 37 36 29Q34 11 20 9Z M4 29Q20 22 36 29 M12 30 20 34 28 30 M20 2V5',
    cage:'M5 34V8L20 2 35 8V34Z M5 8H35 M12 5V34 M20 2V34 M28 5V34 M5 28H35',
    tree:'M18 37V23H22V37 M20 2 6 15H12L2 26H38L28 15H34Z',
    flower:'M20 14Q10-4 6 7Q-3 17 14 20Q-4 30 8 34Q19 42 20 26Q30 44 34 32Q44 21 26 20Q44 10 32 6Q21-2 20 14Z M20 15A5 5 0 1 1 19.9 15',
    portal:'M20 2Q37 2 37 20Q37 38 20 38Q3 38 3 20Q3 2 20 2Z M20 9Q30 9 30 20Q30 31 20 31Q10 31 10 20Q10 9 20 9Z M15 20H25',
    hourglass:'M8 3H32 M10 3V11L19 20 10 29V37 M30 3V11L21 20 30 29V37 M8 37H32 M13 9H27 M14 32 20 26 26 32Z',
    chain:'M14 5Q24-1 29 6Q34 12 27 19L22 24 M26 35Q16 41 11 34Q6 28 13 21L18 16 M14 26 26 14',
    hand:'M5 22Q1 16 7 16L13 22V5Q16-1 19 5V16L22 4Q27 1 27 8V17L30 9Q36 6 35 14L33 29Q31 38 22 38Q14 38 10 30Z',
    echo:'M6 11 11 17H18 M6 11H18 M6 11V23 M10 30Q30 43 35 24Q41 6 22 4 M20 12A8 8 0 1 1 19.9 12 M20 15V20H25',
    infinity:'M20 20Q6-2 2 14Q-3 34 12 29L20 20Q34-2 38 14Q43 34 28 29Z',
    branch:'M20 35V24L7 11 M20 24 33 11 M4 3H11V11H4Z M29 3H36V11H29Z M17 31H23V38H17Z',
    search:'M17 3A14 14 0 1 1 16.9 3 M27 27 37 37',
    minus:'M7 20H33',layers:'M3 13 20 3 37 13 20 23Z M3 21 20 31 37 21 M3 29 20 39 37 29',
    lock:'M9 17V10Q9 0 20 0Q31 0 31 10V17 M6 17H34V38H6Z M20 24V30',stop:'M8 8H32V32H8Z'
  });
  const colors={gem:'#75bed0',sword:'#c2cdd0',spear:'#b8c6d0',saber:'#a9b8ce',shield:'#a5a7a0',leaf:'#7ca991',book:'#d8c7a3',bolt:'#e4c26a',flame:'#d98757',snow:'#9cdae6',star:'#d5b3da',heart:'#c77667',cpu:'#a3ad9b',scroll:'#d3bd8e',lotus:'#d9b2bc',pill:'#d9b266',crystal:'#99c9b9',galaxy:'#b6a4d2',portal:'#b49dcc',flower:'#dcabc0',grain:'#d6bd75',water:'#8ec3d0',cloud:'#c3d7d9',armor:'#a6b6b9',bone:'#e2d3b0',magnet:'#c18c77',robot:'#a4b5ac',planet:'#a6bcb0',dragon:'#a0b58a'};
  function symbol(name,cls=''){const fill=colors[name]||'#b6b99f';return `<svg class="icon ink-icon ${cls}" viewBox="0 0 40 40" aria-hidden="true"><path d="${shapes[name]||shapes.spark}" fill="${['check','arrow','plus','download','upload','pause','focus','snow'].includes(name)?'none':fill}" stroke="#302b28" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 8 13 6" stroke="#fff1cd" stroke-width="1.4" fill="none" opacity=".7"/></svg>`;}
  // Primary object + meaningful inset: e.g. city/leaf = ecological city, sword/field = sword domain.
  const tech=[
    'camp/flame grain/leaf water/branch home/rock map/chain gem/hand book/person city/map ship/scroll book/quill temple/book city/leaf city/cloud temple/person city/planet rocket/city galaxy/network portal/city',
    'wheel/water wind/gear engine/cloud bolt/network battery/bolt crystal/flask tower/bolt crystal/chain magnet/atom atom/snow battery/atom portal/hand sun/satellite orbit/sun spark/atom reactor/star water/portal network/infinity',
    'rock/hammer ingot/flame hammer/ingot gear/chain gear/scroll cloth/gear hammer/compass factory/crystal robot/gear cpu/hand shield/leaf dna/heart printer/atom factory/spark planet/hammer rocket/gear sun/hammer hand/infinity',
    'tower/tree tower/rock bow/tower flame/factory armor/engine shield/magnet tower/flame robot/eye airship/shield radar/atom satellite/shield robot/armor shield/planet rocket/map city/star orbit/field portal/shield eye/infinity',
    'knot/scroll quill/book printer/scroll telescope/star scroll/temple abacus/book flask/book seal/cpu cpu/abacus cpu/eye tower/chain cpu/atom map/star person/network orbit/eye network/portal planet/eye book/infinity',
    'map/compass compass/map ship/compass map/rock wing/book airship/engine ship/crystal tower/cloud rocket/chain home/moon portal/gear portal/star map/planet ship/portal satellite/portal portal/network orbit/clock network/galaxy'
  ].map(row=>row.split(' '));
  const cultivation=[
    'leaf/water meditate/crystal temple/rock lotus/eye ring/leaf heart/flame pill/sun mirror/lotus infant/crystal spirit/wing spirit/branch person/ring portal/eye lotus/galaxy bolt/shield cloud/person wing/star crown/sun',
    'sword/book sword/leaf sword/eye sword/wind sword/flag sword/heart sword/spark sword/mirror sword/person sword/field sword/water sword/mountain sword/galaxy sword/ring sword/scroll sword/meditate sword/portal sword/network',
    'spear/book spear/person spear/eye spear/muscle spear/flag spear/heart spear/spark spear/mirror spear/ring spear/shield spear/dragon spear/mountain spear/bolt spear/field spear/scroll spear/meditate spear/portal spear/infinity',
    'saber/book saber/hammer saber/eye saber/wind saber/flag saber/heart saber/spark saber/mirror saber/person saber/mountain saber/water saber/sun saber/portal saber/field saber/scroll saber/meditate saber/galaxy saber/network',
    'bone/hammer muscle/water heart/rain armor/ingot bone/shield muscle/gem person/sun heart/ring person/hammer lotus/water person/mountain armor/star armor/infinity person/field bolt/person person/cloud person/wing person/crown',
    'meditate/lotus eye/person eye/spark eye/wind water/eye spirit/branch spirit/crystal mirror/water spirit/sun eye/planet spirit/map spirit/field meditate/portal spirit/ring eye/bolt eye/cloud spirit/galaxy spirit/infinity'
  ].map(row=>row.split(' '));
  const elements=['flame','snow','bolt','leaf','star','clock'];
  const spellForms=['spark','arrow','gem','seal','ring','shield','rain','burst','familiar','field','wing','branch','meteor','infinity','scroll','crown','atom','planet'];
  const arcane=elements.map(element=>spellForms.map(form=>form+'/'+element));
  const specialSpells={0:{2:'flame/flame',10:'wing/flame',11:'sun/flame'},1:{0:'spear/snow',1:'chain/snow',2:'crystal/snow',7:'lock/snow',10:'cage/snow',11:'flower/snow',12:'atom/snow',15:'meteor/snow'},2:{1:'bolt/bolt',2:'chain/bolt',7:'rocket/bolt',10:'dragon/bolt',11:'cloud/bolt',13:'cage/bolt'},3:{0:'grain/leaf',1:'chain/leaf',2:'spear/leaf',7:'heart/leaf',10:'heart/flower',11:'tree/leaf',12:'tree/planet',13:'shield/tree',15:'planet/leaf',17:'tree/infinity'},4:{2:'meteor/star',7:'magnet/star',10:'orbit/star',11:'network/star',12:'rock/star',13:'galaxy/shield',15:'galaxy/star'},5:{0:'hand/portal',1:'person/portal',2:'hourglass/clock',6:'rocket/portal',7:'bolt/clock',10:'map/portal',11:'echo/clock',12:'gate/portal',13:'lock/clock',15:'gate/clock',16:'hourglass/atom'}};
  for(const [b,steps] of Object.entries(specialSpells))for(const [step,pair] of Object.entries(steps))arcane[b][step]=pair;
  const catalogs={tech,cultivation,arcane};
  const branchKinds={tech:['city','reactor','factory','shield','cpu','rocket'],cultivation:['lotus','sword','spear','saber','armor','eye'],arcane:elements};
  // Flags and wind are also used in weapon intent; give them their own silhouettes.
  shapes.flag='M7 38V3 M7 4 20 7 34 3V23L20 27 7 23';
  shapes.gust='M3 12H27Q38 12 34 4Q30-1 25 4 M2 20H34Q43 20 37 29Q31 35 27 29 M5 29H16Q25 29 21 37';
  for(const row of cultivation)for(let i=0;i<row.length;i++)row[i]=row[i].replace('/wind','/gust');
  function nodeSpec(id){const n=FocusData.skills.find(n=>n.id===id);if(!n)return null;const [primary,accent]=catalogs[n.path][n.branch][n.step].split('/');return {primary,accent};}
  function branchIcon(path,branch){return symbol(branchKinds[path][branch]);}
  function nodeIcon(id){const n=FocusData.skills.find(n=>n.id===id);if(!n)return symbol('spark');const {primary,accent}=nodeSpec(id),tone=FocusData.paths[n.path].color;
    const glyph=`<svg class="icon ink-icon node-glyph" viewBox="0 0 48 48" aria-hidden="true"><path d="M5 14V6H13 M35 6H43V14 M43 34V42H35 M13 42H5V34" fill="none" stroke="${tone}" stroke-width="${1+n.tier*.2}" opacity=".55"/><g transform="translate(3 2) scale(.9)"><path d="${shapes[primary]}" fill="${['arrow','snow','wind'].includes(primary)?'none':colors[primary]||'#cbb98a'}" stroke="#3b362e" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/></g><circle cx="36" cy="36" r="11" fill="#eee1bd" stroke="${tone}" stroke-width="1.8"/><g transform="translate(27 27) scale(.45)"><path d="${shapes[accent]}" fill="${colors[accent]||tone}" stroke="#3b362e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`;
    return `<span class="node-ink" data-icon="${id}" data-motif="${primary}/${accent}">${glyph}<i>${n.step+1}</i></span>`;
  }
  return {icon:symbol,nodeIcon,nodeSpec,branchIcon,iconNames:Object.keys(shapes)};
})();
if(typeof module!=='undefined')module.exports=FocusArt;
