import {createGame,flip,tick} from './engine.mjs';
const $=id=>document.getElementById(id),names=['헬멧','장화','장갑','소화기','호스','무전기'],storage='survivaloffice.gear-match.best.v1';
let game=null,phase='ready',previous='',peek=2,last=0,best=null;
try{const value=Number(localStorage.getItem(storage));if(Number.isFinite(value)&&value>0&&value<=90)best=value;}catch{}
function bestLabel(){$('best').textContent=best===null?'':`이 브라우저 최고 기록 · ${best.toFixed(1)}초`;}
function start(){game=createGame();phase='peek';peek=2;last=0;$('intro').hidden=true;$('play').hidden=false;$('result').hidden=true;$('pause').disabled=false;$('play').classList.remove('paused');draw();$('play').scrollIntoView({block:'start'});}
function draw(){
 if(!game)return;
 $('time').textContent=game.remaining.toFixed(1);$('clock').value=game.remaining;$('pairs').textContent=`${game.matched.length/2} / 6`;$('moves').textContent=game.moves;
 $('pause').textContent=phase==='paused'?'계속하기':'잠시 멈추기';$('pause').disabled=phase==='finished';
 $('message').textContent=phase==='peek'?`장비 위치를 기억해 주세요 · ${Math.ceil(peek)}초`:phase==='paused'?'잠시 쉬는 중 · 계속하기를 누르면 이어집니다.':phase==='finished'?'기록을 아래에서 확인해 보세요.':'같은 장비 두 장을 찾아보세요.';
 const focus=document.activeElement?.dataset?.card;
 const buttons=game.deck.map((kind,index)=>{
  const matched=game.matched.includes(index),face=phase!=='paused'&&(phase==='peek'||phase==='finished'||matched||game.open.includes(index));
  const button=document.createElement('button');button.className='card'+(face?' face':'')+(matched?' matched':'');button.dataset.card=index;
  if(face)button.dataset.kind=kind;
  button.setAttribute('aria-label',`${index+1}번 ${face?names[kind]+(matched?' · 찾은 짝':''):'뒤집힌 카드'}`);button.setAttribute('aria-pressed',String(face));button.disabled=phase!=='playing'||matched;
  const number=document.createElement('span');number.className='number';number.setAttribute('aria-hidden','true');number.textContent=String(index+1).padStart(2,'0');button.append(number);
  button.onclick=()=>{if(flip(game,index)){draw();if(game.status!=='playing')finish();}};return button;
 });
 $('board').replaceChildren(...buttons);if(focus!==undefined)$('board').querySelector(`[data-card="${focus}"]`)?.focus({preventScroll:true});
}
function pause(){if(!['peek','playing','paused'].includes(phase))return;if(phase==='paused'){phase=previous;last=0;}else{previous=phase;phase='paused';}$('play').classList.toggle('paused',phase==='paused');draw();}
function finish(){
 phase='finished';draw();const won=game.status==='won',used=90-game.remaining;
 $('resultTitle').textContent=won?'장비 6쌍, 모두 찾았어요!':'이번 도전은 여기까지!';
 $('record').textContent=won?`${used.toFixed(1)}초 · ${game.moves}번 시도로 완성했어요.`:`90초 동안 ${game.matched.length/2}쌍을 찾았어요. 다시 도전해 보세요.`;
 if(won&&(best===null||used<best)){best=used;try{localStorage.setItem(storage,String(best));}catch{}}
 bestLabel();$('share-status').textContent='';$('share-text').hidden=true;$('result').hidden=false;$('result').scrollIntoView({block:'start'});$('resultTitle').focus({preventScroll:true});
}
function reset(){phase='ready';game=null;$('play').hidden=true;$('result').hidden=true;$('intro').hidden=false;bestLabel();$('start').focus();}
function frame(now){const dt=last?(now-last)/1000:0;last=now;
 if(phase==='peek'){peek-=dt;if(peek<=0)phase='playing';draw();}
 else if(phase==='playing'){const open=game.open.length;tick(game,dt);$('time').textContent=game.remaining.toFixed(1);$('clock').value=game.remaining;if(game.status!=='playing')finish();else if(open!==game.open.length)draw();}
 requestAnimationFrame(frame);
}
function shareData(){const url=document.querySelector('link[rel=canonical]').href;return {url,text:`소방 장비 짝맞추기\n${$('record').textContent}`};}
$('share').onclick=async()=>{const {url,text}=shareData(),message=text+'\n'+url;try{await navigator.clipboard.writeText(message);$('share-status').textContent='기록과 게임 링크를 복사했어요.';}catch{$('share-text').value=message;$('share-text').hidden=false;$('share-text').focus();$('share-text').select();$('share-status').textContent='아래 기록을 직접 복사해 주세요.';}};
$('share-kakao').onclick=()=>{const {url,text}=shareData(),link={webUrl:url,mobileWebUrl:url};try{const sdk=window.Kakao;if(!sdk?.Share?.sendDefault)throw Error('SDK unavailable');if(!sdk.isInitialized())sdk.init('eee6c2e01641161de9f217ba99c6a0da');sdk.Share.sendDefault({objectType:'feed',content:{title:'소방 장비 짝맞추기 도전 기록',description:text,imageUrl:document.querySelector('meta[property="og:image"]').content,link},buttons:[{title:'나도 도전하기',link}]});}catch{$('share-status').textContent='카카오톡 공유를 열지 못했어요. 기록 복사를 이용해 주세요.';}};
$('start').onclick=start;$('again').onclick=start;$('reset').onclick=reset;$('pause').onclick=pause;
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['peek','playing'].includes(phase))pause();});
bestLabel();requestAnimationFrame(frame);
