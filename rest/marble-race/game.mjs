import {createRace,stepRace,standings,validateNames,COLORS,WIDTH,FINISH,STEP,zoneAt} from './physics.mjs';
import {drawTrack,drawMap} from './render.mjs';
const $=id=>document.getElementById(id),key='survivaloffice.marble-race.names.v1',canvas=$('trackCanvas'),ctx=canvas.getContext('2d');
const mapCanvas=$('mapCanvas'),mapCtx=mapCanvas.getContext('2d');mapCtx.scale(2,2);
let names=['참가자 1','참가자 2','참가자 3','참가자 4'],race,phase='setup',pausedFrom='',countdown=3,accumulator=0,last=0,uiTime=0,camera=0,width=600,height=660;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
try{const saved=localStorage.getItem(key);if(saved)names=validateNames(JSON.parse(saved));}catch{}
function seed(){const data=new Uint32Array(1);crypto.getRandomValues(data);return data[0];}
function inputs(){
 $('playerCount').value=names.length;$('playerCountBadge').textContent=names.length+'명';
 $('nameInputs').innerHTML=names.map((n,i)=>`<div class="name-row"><label for="name-${i}" style="--ball:${COLORS[i]}" title="${i+1}번 공">${i+1}<span class="sr-only"></span></label><input id="name-${i}" aria-label="${i+1}번 공 이름" maxlength="12" value="${safe(n)}" autocomplete="off" required></div>`).join('');
 $('follow').innerHTML='<option value="auto">선두 추적</option>'+names.map((n,i)=>`<option value="${i}">${i+1} · ${safe(n||`${i+1}번 공`)}</option>`).join('');
 preview();
}
function preview(){race=createRace(names.map((n,i)=>`${i+1}번 ${n}`.slice(0,12)),42);race.balls.forEach((b,i)=>b.name=names[i]||`${i+1}번 공`);camera=0;updateUI();}
function overlay(kicker,title,text,kind=''){const o=$('stageOverlay');o.hidden=false;o.className='stage-overlay '+kind;$('overlayKicker').textContent=kicker;$('overlayTitle').textContent=title;$('overlayText').textContent=text;}
function start(){
 try{names=validateNames([...$('nameInputs').querySelectorAll('input')].map(i=>i.value));}catch(e){$('formError').textContent=e.message;return;}
 $('formError').textContent='';try{localStorage.setItem(key,JSON.stringify(names));}catch{$('saveNote').textContent='이름 저장을 사용할 수 없지만 게임은 진행할 수 있습니다.';}
 race=createRace(names,seed());phase='countdown';countdown=3;accumulator=0;camera=0;last=0;$('showResult').hidden=true;$('resultDialog').close();$('setupFields').disabled=true;$('startButton').disabled=true;$('setupPanel').classList.add('locked');$('pauseButton').disabled=false;$('pauseButton').textContent='잠시 멈추기';$('editButton').disabled=false;$('follow').value='auto';$('raceNotice').textContent='주황 점프대는 공마다 한 번씩 발동해요. 상황판의 점을 누르면 공을 추적합니다.';
 overlay('READY, SET…','3','모든 공이 함께 출발합니다.','countdown');updateUI();$('stage').scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
function edit(){phase='setup';$('resultDialog').close();$('setupFields').disabled=false;$('startButton').disabled=false;$('setupPanel').classList.remove('locked');$('pauseButton').disabled=true;$('editButton').disabled=true;$('showResult').hidden=true;$('raceNotice').textContent='';inputs();overlay("LET'S ROLL",'준비됐나요?','이름을 확인하고 다시 출발해 보세요.');$('setupPanel').scrollIntoView({block:'start'});$('name-0').focus({preventScroll:true});}
function pause(){
 if(phase==='paused'){phase=pausedFrom;$('pauseButton').textContent='잠시 멈추기';if(phase==='running')$('stageOverlay').hidden=true;else overlay('READY, SET…',Math.ceil(countdown),'모든 공이 함께 출발합니다.','countdown');last=0;}
 else if(['running','countdown'].includes(phase)){pausedFrom=phase;phase='paused';$('pauseButton').textContent='계속 굴리기';overlay('TAKE A BREATH','잠시 쉬는 중','계속 굴리기를 누르면 이어집니다.');}
 updateUI();
}
function updateUI(){
 $('raceStatus').textContent=({setup:'출발 대기',countdown:'곧 출발합니다',running:'레이스 진행 중',paused:'일시정지',finished:'모두 도착! 결과 확정'})[phase];$('liveDot').classList.toggle('running',phase==='running');$('raceTime').textContent=race.time.toFixed(1).padStart(4,'0');$('finishCount').textContent=`${race.finished.length} / ${race.balls.length} 도착`;
 const order=phase==='setup'?race.balls:standings(race);
 $('standings').innerHTML=order.map((b,i)=>`<li><span class="place">${phase==='setup'?'—':i+1}</span><span class="ball-dot" style="--ball:${b.color}">${b.id+1}</span><span class="participant-name">${safe(b.name)}</span><span class="race-progress" aria-hidden="true"><i style="width:${Math.min(100,b.y/FINISH*100)}%"></i></span><span class="standing-time">${b.finished?b.finishTime.toFixed(2)+'초':phase==='setup'?'대기':Math.min(99,Math.floor(b.y/FINISH*100))+'%'}</span></li>`).join('');
 $('rankingHint').textContent=phase==='finished'?'도착 시간순 최종 결과':'결과는 결승선을 넘어야 확정돼요';
}
function results(){
 const order=standings(race),winner=order[0];$('winnerOrb').style.setProperty('--ball',winner.color);$('resultTitle').textContent=winner.name;$('winnerTime').textContent=`${winner.finishTime.toFixed(2)}초 만에 결승선 도착!`;
 $('results').innerHTML=order.map((b,i)=>`<li><span class="place">${i+1}</span><span class="ball-dot" style="--ball:${b.color}">${b.id+1}</span><strong>${safe(b.name)}</strong><span>${b.finishTime.toFixed(2)}초</span></li>`).join('');$('copyStatus').textContent='이름과 순위가 복사 내용에 포함됩니다.';$('copyFallback').hidden=true;if(!$('resultDialog').open)$('resultDialog').showModal();
}
function finish(){phase='finished';$('pauseButton').disabled=true;$('showResult').hidden=false;overlay('FINISH!',`${standings(race)[0].name} 1등!`,'모든 공이 도착했습니다. 결과를 확인해 보세요.');updateUI();results();}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
function frame(timestamp){
 const dt=last?Math.min(.1,(timestamp-last)/1000):0;last=timestamp;
 if(phase==='countdown'){countdown-=dt;$('overlayTitle').textContent=Math.max(1,Math.ceil(countdown));if(countdown<=0){phase='running';$('stageOverlay').hidden=true;updateUI();}}
 if(phase==='running'){
  accumulator+=dt*Number($('speed').value);while(accumulator>=STEP&&!race.done){stepRace(race);accumulator-=STEP;}if(race.done)finish();
 }
 if(phase!=='setup'&&phase!=='countdown'){
  const selected=$('follow').value,order=standings(race),ball=selected==='auto'?(order.find(b=>!b.finished)||order[0]):race.balls[Number(selected)],worldHeight=height/(width/WIDTH),target=Math.max(0,Math.min(FINISH+140-worldHeight,(ball?.y||0)-worldHeight*.35));
  camera+=(target-camera)*Math.min(1,dt*5);
 }
 const followed=$('follow').value==='auto'?(standings(race).find(b=>!b.finished)||standings(race)[0]):race.balls[Number($('follow').value)];
 drawTrack(ctx,race,width,height,camera,phase==='setup'||phase==='countdown',followed.id);
 drawMap(mapCtx,race,camera,height/(width/WIDTH),followed.id);
 $('monitorFocus').textContent=`${followed.id+1} · ${followed.name}`;
 $('monitorFocus').title=`${followed.name} · ${followed.finished?'도착':zoneAt(followed.y).t}`;
 $('zoneLabel').textContent=zoneAt(camera).t;
 uiTime+=dt;if(uiTime>.12&&phase==='running'){updateUI();uiTime=0;}
 requestAnimationFrame(frame);
}
$('playerCount').addEventListener('change',()=>{names=[...$('nameInputs').querySelectorAll('input')].map(i=>i.value);const count=Number($('playerCount').value);names=Array.from({length:count},(_,i)=>names[i]??`참가자 ${i+1}`);$('formError').textContent='';inputs();});
$('nameInputs').addEventListener('input',event=>{const i=[...$('nameInputs').querySelectorAll('input')].indexOf(event.target);if(i<0)return;names[i]=event.target.value;race.balls[i].name=event.target.value||`${i+1}번 공`;$('follow').options[i+1].textContent=`${i+1} · ${race.balls[i].name}`;$('formError').textContent='';updateUI();});
$('setupForm').addEventListener('submit',event=>{event.preventDefault();start();});$('pauseButton').addEventListener('click',pause);$('editButton').addEventListener('click',edit);$('closeResult').addEventListener('click',()=>$('resultDialog').close());$('showResult').addEventListener('click',results);$('raceAgain').addEventListener('click',start);$('changeNames').addEventListener('click',edit);
$('copyResult').addEventListener('click',async()=>{const text='🏁 오피스 구슬 레이스\n'+standings(race).map((b,i)=>`${i+1}등 ${b.name} · ${b.finishTime.toFixed(2)}초`).join('\n')+'\nhttps://survivaloffice.com/rest/marble-race/';try{await navigator.clipboard.writeText(text);$('copyStatus').textContent='결과와 게임 링크를 복사했습니다.';}catch{$('copyFallback').value=text;$('copyFallback').hidden=false;$('copyFallback').focus();$('copyFallback').select();$('copyStatus').textContent='아래 결과를 직접 복사해 주세요.';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['running','countdown'].includes(phase)){pause();$('raceNotice').textContent='다른 화면으로 이동해 자동으로 멈췄어요. 계속 굴리기를 눌러 주세요.';}});
$('toggleMonitor').addEventListener('click',()=>{const open=$('monitorBody').hidden;$('monitorBody').hidden=!open;$('toggleMonitor').setAttribute('aria-expanded',String(open));$('toggleMonitor').innerHTML='상황판 <span>'+ (open?'−':'+')+'</span>';});
mapCanvas.addEventListener('click',event=>{const rect=mapCanvas.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*112,y=(event.clientY-rect.top)/rect.height*152;const nearest=[...race.balls].sort((a,b)=>Math.hypot(8+a.x/WIDTH*96-x,8+Math.min(1,a.y/FINISH)*136-y)-Math.hypot(8+b.x/WIDTH*96-x,8+Math.min(1,b.y/FINISH)*136-y))[0];$('follow').value=nearest.id;updateUI();});
inputs();new ResizeObserver(resize).observe(canvas);resize();requestAnimationFrame(frame);
