/* Short, bounded visual feedback. Never changes rewards, focus time or save data. */
var FocusFeedback = (() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Map(),timers=new Map(),effects=new Set();
  const enabled=()=>!reduced.matches&&!document.body.classList.contains('quiet');
  function animate(el,frames,duration=260){if(!el||!enabled())return;animations.get(el)?.cancel();const animation=el.animate(frames,{duration,easing:'cubic-bezier(.2,.8,.2,1)'});animations.set(el,animation);animation.onfinish=()=>{if(animations.get(el)===animation)animations.delete(el);};}
  function mark(el,name,duration){if(!el||!enabled())return;const key=name+':'+(el.dataset.id||el.id);clearTimeout(timers.get(key));el.classList.remove(name);void el.offsetWidth;el.classList.add(name);timers.set(key,setTimeout(()=>{el.classList.remove(name);timers.delete(key);},duration));}
  function effect(cls,x,y,duration=700,text=''){if(!enabled())return;const el=document.createElement('span');el.className=cls;el.setAttribute('aria-hidden','true');el.style.left=x+'px';el.style.top=y+'px';el.textContent=text;document.body.append(el);effects.add(el);setTimeout(()=>{el.remove();effects.delete(el);},duration);return el;}
  function tap(button,event){if(!enabled()||button.disabled)return;const r=button.getBoundingClientRect(),x=event.detail?event.clientX:r.left+r.width/2,y=event.detail?event.clientY:r.top+r.height/2;effect('tap-wave',x,y);animate(button.querySelector('.ink-icon'),[{scale:1},{scale:.83,offset:.3},{scale:1}],220);}
  function select(detail,node){animate(detail?.querySelector('.detail-scroll'),[{opacity:.45,translate:'9px 0'},{opacity:1,translate:'0 0'}],240);animate(node?.querySelector('.node-seal'),[{scale:.83},{scale:1.15,offset:.55},{scale:1}],340);mark(node,'node-selected',650);}
  function unlock(node,edge,detail,name){if(!enabled())return;mark(node,'just-learned',1100);mark(edge,'edge-unlocked',1000);mark(detail,'detail-unlocked',1000);animate(node?.querySelector('.node-seal'),[{scale:.65},{scale:1.24,offset:.45},{scale:1}],650);
    const viewport=document.getElementById('tree-viewport')?.getBoundingClientRect(),rect=node?.getBoundingClientRect();
    const visible=rect&&viewport&&rect.left>viewport.left&&rect.right<viewport.right&&rect.top>viewport.top&&rect.bottom<viewport.bottom;
    const source=visible?node:detail?.querySelector('.detail-emblem');if(!source)return;const r=source.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    effect('unlock-ring',x,y,1000);for(let i=0;i<8;i++){const p=effect('unlock-mote',x,y,950),angle=i*Math.PI/4;p.style.setProperty('--dx',Math.cos(angle)*65+'px');p.style.setProperty('--dy',Math.sin(angle)*65+'px');p.style.animationDelay=i*12+'ms';}
    effect('unlock-callout',Math.max(130,Math.min(innerWidth-130,x)),Math.max(85,y-35),1200,name+' · 已点亮');
  }
  function appear(el){animate(el,[{opacity:.55,translate:'0 8px'},{opacity:1,translate:'0 0'}],220);}
  function number(el){animate(el,[{scale:1},{scale:1.18,color:'#d18b35',offset:.35},{scale:1}],380);}
  function clear(){for(const animation of animations.values())animation.cancel();animations.clear();for(const timer of timers.values())clearTimeout(timer);timers.clear();for(const el of effects)el.remove();effects.clear();document.querySelectorAll('.node-selected,.just-learned,.edge-unlocked,.detail-unlocked').forEach(el=>el.classList.remove('node-selected','just-learned','edge-unlocked','detail-unlocked'));}
  reduced.addEventListener('change',()=>{if(reduced.matches)clear();});
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(button)tap(button,event);});
  return {enabled,select,unlock,appear,number,clear};
})();
