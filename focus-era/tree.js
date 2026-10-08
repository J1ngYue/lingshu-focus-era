/* Three distinct, connected growth maps. Coordinates never change save IDs. */
var FocusTree = (() => {
  const cameras = {}, colors = ['#ca805b','#6daba9','#b8a052','#78a477','#9a82b4','#718fa4'];
  let active, observer, motionFrame, motionTarget;
  function layout(path) {
    const nodes = FocusData.skills.filter(n=>n.path===path).map(n=>{
      let x,y;
      if(path==='tech') { x=190+n.step*164; y=140+n.branch*124+(n.step%2?18:0); }
      else if(path==='cultivation') {
        const lanes=[810,490,235,1120,1390,1630];
        x=lanes[n.branch]+(n.branch?Math.sin(n.step*.9+n.branch)*32:0);y=2250-n.step*122;
      } else {
        const angle=n.branch*Math.PI/3-Math.PI/2,cluster=Math.floor(n.step/6),local=n.step%6;
        const radius=420+cluster*500, a=angle+Math.PI+(local*Math.PI/3);
        x=1800+Math.cos(angle)*radius+Math.cos(a)*132;
        y=1800+Math.sin(angle)*radius+Math.sin(a)*132;
      }
      return {...n,x,y};
    });
    return {nodes,width:path==='tech'?3190:path==='cultivation'?1880:3600,height:path==='tech'?920:path==='cultivation'?2440:3600,root:path==='tech'?{x:48,y:450}:path==='cultivation'?{x:810,y:2370}:{x:1800,y:1800}};
  }
  function render(path,state,icon,esc,selected) {
    const map=layout(path),byId=Object.fromEntries(map.nodes.map(n=>[n.id,n]));
    let decoration='';
    if(path==='tech') decoration=Array.from({length:6},(_,i)=>`<rect x="${100+i*492}" y="56" width="470" height="812" rx="18" fill="${i%2?'#9b865507':'#9b865513'}"/><text x="${345+i*492}" y="86" class="era-label">${['营火纪元','聚落纪元','灵械纪元','灵能纪元','星际纪元','万界纪元'][i]}</text>`).join('');
    if(path==='cultivation') decoration=`<path d="M810 2380 V92" class="meridian"/>`+[180,370,565,840].map((r,i)=>`<ellipse cx="810" cy="1240" rx="${r}" ry="${r*1.22}" class="ritual-ring"/><text x="${810+r}" y="1240" class="rune-label">${['心','意','道','界'][i]}</text>`).join('');
    if(path==='arcane') decoration=[420,920,1420,1660].map(r=>`<circle cx="1800" cy="1800" r="${r}" class="ritual-ring"/>`).join('')+Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<path d="M1800 1800 L${1800+Math.cos(a)*1660} ${1800+Math.sin(a)*1660}" class="radial-guide"/>`;}).join('');
    const links=map.nodes.map(n=>{
      const p=byId[n.parent]||map.root,learned=state.skills[n.id],available=!FocusEngine.skillReason(state,n);
      const d=path==='tech'?`M${p.x} ${p.y} C${(p.x+n.x)/2} ${p.y} ${(p.x+n.x)/2} ${n.y} ${n.x} ${n.y}`:`M${p.x} ${p.y} L${n.x} ${n.y}`;
      return `<path d="${d}" class="tree-link ${learned?'lit':available?'ready':''}" data-edge="${n.id}"/>`;
    }).join('');
    const labels=FocusData.branchNames[path].map((name,b)=>{
      let x,y;if(path==='tech'){x=145;y=103+b*124;}else if(path==='cultivation'){const n=map.nodes.find(n=>n.branch===b&&n.step===17);x=n.x;y=72;}else{const a=b*Math.PI/3-Math.PI/2;x=1800+Math.cos(a)*1660;y=1800+Math.sin(a)*1660;}
      return `<text x="${x}" y="${y}" class="branch-label" style="fill:${path==='arcane'?colors[b]:'#556b4b'}">${name}</text>`;
    }).join('');
    return `<div id="tree-viewport" class="tree-viewport" tabindex="0" aria-label="${esc(FocusData.paths[path].name)}，拖动平移，滚轮缩放，方向键移动"><div id="tree-plane" class="tree-plane" style="width:${map.width}px;height:${map.height}px"><svg class="tree-lines" width="${map.width}" height="${map.height}" aria-hidden="true">${decoration}${links}${labels}<circle cx="${map.root.x}" cy="${map.root.y}" r="30" class="tree-origin"/><text x="${map.root.x}" y="${map.root.y+6}" class="origin-label">${path==='tech'?'始':path==='cultivation'?'凡':'源'}</text></svg>${map.nodes.map(n=>{
      const learned=!!state.skills[n.id],reason=FocusEngine.skillReason(state,n),major=n.step%6===5||path==='cultivation'&&n.branch===0;
      return `<button class="tree-node ${path==='tech'?'hex-node':''} ${major?'notable':''} ${learned?'learned':!reason?'available':'locked'} ${selected===n.id?'selected':''}" style="left:${n.x}px;top:${n.y}px;--node-color:${path==='arcane'?colors[n.branch]:FocusData.paths[path].color}" data-action="select-node" data-id="${n.id}" data-branch="${n.branch}" title="${esc(n.name)} · ${learned?'已点亮':reason||n.cost+' 灵感'}" aria-label="${esc(n.name)}，${learned?'已点亮':!reason?'可点亮':'未解锁'}"><span class="node-seal">${icon(n.icon)}</span><span class="map-node-name">${esc(n.name)}</span>${learned?'<span class="node-check">✓</span>':''}</button>`;
    }).join('')}</div></div><div class="tree-tools"><button data-action="tree-zoom" data-direction="out" aria-label="缩小成长树">−</button><span id="tree-zoom-label">100%</span><button data-action="tree-zoom" data-direction="in" aria-label="放大成长树">＋</button><button data-action="tree-fit">全图</button><button data-action="tree-reset">起点</button></div><div class="tree-map-caption">拖动探索 · 滚轮缩放 · 点选查看 · 确认后点亮</div><svg id="tree-minimap" class="tree-minimap" viewBox="0 0 ${map.width} ${map.height}" aria-label="成长树全景小地图">${links}${map.nodes.map(n=>`<circle cx="${n.x}" cy="${n.y}" r="${state.skills[n.id]?13:9}" fill="${state.skills[n.id]?'#67977b':'#c2b087'}"/>`).join('')}<rect id="minimap-camera" fill="#bc975121" stroke="#8f7041" stroke-width="10"/></svg>`;
  }
  function mount(path,selected) {
    stopMotion();observer?.disconnect();const viewport=document.getElementById('tree-viewport');if(!viewport){active=null;return;}
    const map=layout(path),camera=cameras[path]||{x:0,y:0,zoom:.8,initialized:false};cameras[path]=camera;active={path,map,camera,viewport,plane:document.getElementById('tree-plane')};
    const resize=()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!camera.initialized)reset();else{if(camera.width){camera.x+=(w-camera.width)/2;camera.y+=(h-camera.height)/2;}update();}camera.width=w;camera.height=h;};observer=new ResizeObserver(resize);observer.observe(viewport);
    let drag=null,moved=false;
    viewport.addEventListener('pointerdown',e=>{if(e.button!==0)return;stopMotion();drag={x:e.clientX,y:e.clientY,ox:camera.x,oy:camera.y};moved=false;});
    viewport.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5){moved=true;viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');camera.x=drag.ox+dx;camera.y=drag.oy+dy;update();}});
    const end=e=>{drag=null;viewport.classList.remove('dragging');if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);};
    viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
    viewport.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
    viewport.addEventListener('wheel',e=>{e.preventDefault();const r=viewport.getBoundingClientRect();zoom(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top);},{passive:false});
    viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();stopMotion();camera.x+=e.key==='ArrowLeft'?70:e.key==='ArrowRight'?-70:0;camera.y+=e.key==='ArrowUp'?70:e.key==='ArrowDown'?-70:0;update();}else if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.25);}else if(e.key==='-'){e.preventDefault();zoom(.8);}else if(e.key==='Home'){e.preventDefault();reset();}});
    viewport.addEventListener('focusin',e=>{const n=e.target.closest('.tree-node');if(n?.matches(':focus-visible'))reveal(n.dataset.id,false);});
    document.getElementById('tree-minimap').addEventListener('click',e=>{stopMotion();const r=e.currentTarget.getBoundingClientRect();camera.x=viewport.clientWidth/2-(e.clientX-r.left)/r.width*map.width*camera.zoom;camera.y=viewport.clientHeight/2-(e.clientY-r.top)/r.height*map.height*camera.zoom;update();});
    resize();
  }
  function update(){if(!active)return;const {camera:c,viewport:v,plane,map}=active;const w=v.clientWidth,h=v.clientHeight;c.x=Math.max(90-map.width*c.zoom,Math.min(w-90,c.x));c.y=Math.max(70-map.height*c.zoom,Math.min(h-70,c.y));plane.style.transform=`translate(${c.x}px,${c.y}px) scale(${c.zoom})`;v.classList.toggle('overview',c.zoom<.42);document.getElementById('tree-zoom-label').textContent=Math.round(c.zoom*100)+'%';const rect=document.getElementById('minimap-camera');rect.setAttribute('x',-c.x/c.zoom);rect.setAttribute('y',-c.y/c.zoom);rect.setAttribute('width',w/c.zoom);rect.setAttribute('height',h/c.zoom);}
  function stopMotion(){cancelAnimationFrame(motionFrame);motionTarget=null;}
  function move(target){if(!active)return;const current=active,from={x:active.camera.x,y:active.camera.y,zoom:active.camera.zoom};stopMotion();if(matchMedia('(prefers-reduced-motion: reduce)').matches){Object.assign(active.camera,target);update();return;}motionTarget=target;const start=performance.now();function frame(now){if(active!==current)return;const t=Math.min(1,(now-start)/170),ease=1-(1-t)**3;for(const key of ['x','y','zoom'])current.camera[key]=from[key]+(target[key]-from[key])*ease;update();if(t<1)motionFrame=requestAnimationFrame(frame);else motionTarget=null;}motionFrame=requestAnimationFrame(frame);}
  function zoom(factor,x,y){if(!active)return;const {viewport:v}=active,c=motionTarget||active.camera;x=x??v.clientWidth/2;y=y??v.clientHeight/2;const next=Math.max(.16,Math.min(1.8,c.zoom*factor)),ratio=next/c.zoom;move({x:x-(x-c.x)*ratio,y:y-(y-c.y)*ratio,zoom:next});}
  function fit(){if(!active)return;stopMotion();const {camera:c,map,viewport:v}=active;c.zoom=Math.min((v.clientWidth-60)/map.width,(v.clientHeight-100)/map.height,1);c.x=(v.clientWidth-map.width*c.zoom)/2;c.y=(v.clientHeight-map.height*c.zoom)/2;c.initialized=true;update();}
  function reset(){if(!active)return;stopMotion();const {camera:c,viewport:v,path,map}=active;c.zoom=path==='tech'?.85:.8;const target=path==='tech'?{x:470,y:450}:path==='cultivation'?{x:810,y:2040}:map.root;c.x=v.clientWidth/2-target.x*c.zoom;c.y=v.clientHeight/2-target.y*c.zoom;c.initialized=true;update();}
  function reveal(id,center=true){if(!active)return;const n=active.map.nodes.find(n=>n.id===id);if(!n)return;const {camera:c,viewport:v}=active;const x=n.x*c.zoom+c.x,y=n.y*c.zoom+c.y;if(center||x<80||x>v.clientWidth-80||y<70||y>v.clientHeight-80){const next=Math.max(c.zoom,center?.85:c.zoom);move({zoom:next,x:v.clientWidth/2-n.x*next,y:v.clientHeight/2-n.y*next});}}
  function highlight(branch,search,selected){if(!active)return;active.viewport.querySelectorAll('.tree-node').forEach(el=>{const n=active.map.nodes.find(n=>n.id===el.dataset.id),match=(!search||n.name.includes(search)||FocusData.branchNames[active.path][n.branch].includes(search))&&(branch==='all'||n.branch===branch);el.classList.toggle('dimmed',!match);el.classList.toggle('selected',n.id===selected);el.classList.toggle('search-match',!!search&&match);});const chain=new Set();let n=active.map.nodes.find(n=>n.id===selected);while(n){chain.add(n.id);n=active.map.nodes.find(p=>p.id===n.parent);}active.plane.querySelectorAll('.tree-link').forEach(el=>el.classList.toggle('route',chain.has(el.dataset.edge)));}
  return {layout,render,mount,zoom,fit,reset,reveal,highlight};
})();
if(typeof module!=='undefined')module.exports=FocusTree;
