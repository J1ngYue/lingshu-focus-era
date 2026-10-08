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
  const colors={gem:'#75bed0',sword:'#c2cdd0',shield:'#a5a7a0',leaf:'#7ca991',book:'#d8c7a3',bolt:'#e4c26a',flame:'#d98757',snow:'#9cdae6',star:'#d5b3da',heart:'#c77667',cpu:'#a3ad9b',scroll:'#d3bd8e'};
  function symbol(name,cls=''){const fill=colors[name]||'#b6b99f';return `<svg class="icon ink-icon ${cls}" viewBox="0 0 40 40" aria-hidden="true"><path d="${shapes[name]||shapes.spark}" fill="${['check','arrow','plus','download','upload','pause','focus','snow'].includes(name)?'none':fill}" stroke="#302b28" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 8 13 6" stroke="#fff1cd" stroke-width="1.4" fill="none" opacity=".7"/></svg>`;}
  function nodeIcon(id){const n=FocusData.skills.find(n=>n.id===id);if(!n)return symbol('spark');let kind=n.icon;
    if(n.path==='cultivation')kind=['leaf','sword','spear','sword','heart','eye'][n.branch];
    else if(n.path==='arcane')kind=['flame','snow','bolt','leaf','star','clock'][n.branch];
    else if(/城|村|聚落|都市/.test(n.name))kind='city';else if(/星|航|飞|宇/.test(n.name))kind='rocket';else if(/水|渠|潮/.test(n.name))kind='water';else if(/火|燃|热/.test(n.name))kind='flame';else if(/知识|书|学校/.test(n.name))kind='book';
    return `<span class="node-ink" data-icon="${id}" style="--rank:${n.step}">${symbol(kind)}<i>${n.step+1}</i></span>`;
  }
  return {icon:symbol,nodeIcon};
})();
if(typeof module!=='undefined')module.exports=FocusArt;
