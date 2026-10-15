import {fresh,next,validate,snapshot,delta,season,dateLabel,rankLabel,availableOutfits,eligibleEndings,ENDING_HINTS,ACTIONS,EVENTS,ENDINGS} from './engine.mjs';
import {STATS} from './data.mjs';
import {portrait,room} from './art.mjs';
const $=id=>document.getElementById(id),KEY='survivaloffice.new-recruit.v1',BACKUP=KEY+'.backup';
const names={...STATS,energy:'체력',stress:'스트레스',money:'자금'},outfitNames={daily:'첫 출근의 옷',smart:'익숙해진 출근길',leader:'나만의 분위기'};
let state=null,lastStored=null,corrupt=false,storageFailed=false,loadNote='',draft=[],activeSlot=0;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function read(){
 corrupt=false;loadNote='';
 try{lastStored=localStorage.getItem(KEY);if(!lastStored)return null;try{return validate(JSON.parse(lastStored));}catch{
  const backup=localStorage.getItem(BACKUP);if(backup){try{const recovered=validate(JSON.parse(backup));loadNote='최근 저장을 읽지 못해 직전 기록을 복구했습니다. 저장 파일을 내보내 두세요.';return recovered;}catch{}}
  corrupt=true;loadNote='저장 기록을 읽지 못했습니다. 저장·설정에서 파일을 불러오거나 새로운 인물로 시작해 주세요. 기존 기록은 아직 덮어쓰지 않았습니다.';
 }}catch{storageFailed=true;loadNote='이 브라우저에서 자동 저장을 사용할 수 없습니다. 종료하기 전에 저장 파일을 내보내 주세요.';}return null;
}
function notice(text,error=false){$('notice').textContent=text;$('notice').classList.toggle('error',error);$('settingsMessage').textContent=text;}
function save(){
 try{if(lastStored){try{validate(JSON.parse(lastStored));localStorage.setItem(BACKUP,lastStored);}catch{}}
  const encoded=JSON.stringify(state);localStorage.setItem(KEY,encoded);lastStored=encoded;storageFailed=false;$('saveStatus').textContent='● 자동 저장 완료';
 }catch{storageFailed=true;$('saveStatus').textContent='저장 불가 · 파일 내보내기 필요';notice('자동 저장에 실패했습니다. 설정에서 저장 파일을 내보내 주세요.',true);}
}
function externalChange(){try{if(localStorage.getItem(KEY)!==lastStored){state=read();closeAll();render();notice('다른 창의 최신 기록을 불러왔습니다. 내용을 확인하고 다시 선택해 주세요.');return true;}}catch{}return false;}
function closeAll(){for(const d of document.querySelectorAll('dialog[open]'))d.close();}
function open(id){for(const d of document.querySelectorAll('dialog[open]'))if(d.id!==id&&d.id!=='confirmDialog')d.close();if(!$(id).open)$(id).showModal();}
function commit(action,arg){
 if(!state||corrupt||externalChange())return false;
 try{state=next(state,action,arg);save();render();return true;}catch(error){notice(error.message,true);for(const id of ['planError','storyError'])$(id).textContent=error.message;return false;}
}
function line(){if(state.phase==='finished')return '이제, 내 이야기는 다음 장으로.';if(state.energy<30)return '오늘은 조금 쉬어 가도 괜찮겠죠?';if(state.stress>=65)return '숨을 고르고, 다시 천천히 해볼래요.';if(state.month>=25)return '나답게 일하는 법을 조금 알 것 같아요.';if(state.month>=13)return '작년보다 익숙해진 내가 보여요.';return '서툴러도, 오늘 하나만 더 배워볼게요.';}
function render(){
 $('setup').hidden=!!state;$('game').hidden=!state;$('exportSave').disabled=!state;
 $('saveStatus').textContent=storageFailed?'저장 불가 · 파일 내보내기 필요':corrupt?'저장 복구 필요':state?'● 이 기기에 저장됨':'이 기기에 자동 저장';
 if(!state){$('setupError').textContent=loadNote;return;}
 $('dateLabel').textContent=dateLabel(state);$('periodLabel').textContent=`${season(state.month)} · ${state.phase==='finished'?'36개월의 여정 완료':state.month+' / 36개월'}`;
 $('seasonIcon').textContent=({봄:'✿',여름:'☀',가을:'❧',겨울:'❄'})[season(state.month)];$('journeyFill').style.width=((state.phase==='finished'?36:state.month-1)/36*100)+'%';
 $('personName').textContent=state.name;$('personRank').textContent=rankLabel(state);$('personAge').textContent=`${24+Math.floor((state.month-1)/12)}세 · ${Math.floor((state.month-1)/12)+1}년 차의 기록`;
 $('stats').innerHTML=Object.entries(STATS).map(([k,label])=>`<div class="stat"><div><span>${label}</span><strong>${state.stats[k]}</strong></div><div class="meter" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${state.stats[k]}"><i style="width:${state.stats[k]}%"></i></div></div>`).join('');
 $('energy').textContent=state.energy+' / 100';$('stress').textContent=state.stress+' / 100';$('energyFill').style.width=state.energy+'%';$('stressFill').style.width=state.stress+'%';$('money').textContent=state.money.toLocaleString()+'만 원';
 $('room').innerHTML=room(state.month);$('characterImage').innerHTML=portrait(state);$('characterImage').setAttribute('aria-label',`${state.gender==='female'?'여성':'남성'} 캐릭터 ${state.name} · ${outfitNames[state.outfit]} · ${state.energy<30||state.stress>=65?'지친 표정':'차분한 미소'}`);$('characterLine').textContent=line();$('nameplate').textContent=state.name+'의 이야기';
 $('chapterLabel').textContent=state.month<13?'CHAPTER 01 · 모든 것이 처음인 날들':state.month<25?'CHAPTER 02 · 조금씩 나만의 속도로':'CHAPTER 03 · 내가 고른 내일';
 $('noteTitle').textContent=state.phase==='finished'?'이야기는 계속됩니다':'이번 달의 나에게';
 $('monthLine').textContent=state.phase==='finished'?'세 해의 기록을 돌아보고, 나만의 다음 장을 나눠보세요.':state.energy<30||state.stress>=65?'열심히 달려왔네요. 이번에는 쉬어 가는 시간을 넣어볼까요?':state.month<13?'처음부터 잘할 필요는 없어요. 배우고, 만나고, 쉬며 조금씩 자라나요.':'일은 익숙해졌지만 선택은 여전히 새롭죠. 내가 원하는 하루를 골라보세요.';
 $('currentPlan').innerHTML=state.plan.map((key,i)=>`<div><em>0${i+1}</em><span>${ACTIONS[key].name}</span></div>`).join('');
 $('planButton').hidden=state.phase!=='plan';$('resumeButton').hidden=state.phase==='plan';$('resumeButton').textContent=state.phase==='finished'?'나의 엔딩 다시 보기 →':state.phase==='ending'?'다음 장 선택하기 →':'이번 달 이야기 이어서 →';
 $('monthHint').textContent=state.phase==='plan'?`월급 ${210+state.rank*25}만 · 생활비 180만 · 진행할 때 정산`:'창을 닫거나 새로고침해도 같은 이야기로 이어집니다.';
}
function deltaText(changes){return Object.entries(changes).filter(([,v])=>v).map(([k,v])=>`${names[k]} ${v>0?'+':''}${v}${k==='money'?'만':''}`).join(' · ')||'변화 없음';}
function drawPlanner(){
 $('planSlots').innerHTML=draft.map((key,i)=>`<button class="plan-slot ${i===activeSlot?'active':''}" data-slot="${i}" aria-pressed="${i===activeSlot}"><small>${i+1}번째 시간</small><strong>${ACTIONS[key].name}</strong></button>`).join('');
 $('slotHelp').textContent=(activeSlot+1)+'번째 시간을 바꿀 일정을 골라 주세요.';
 $('actionChoices').innerHTML=Object.entries(ACTIONS).map(([key,a])=>`<button class="action-choice" data-plan-action="${key}" aria-pressed="${draft[activeSlot]===key}"><span aria-hidden="true">${a.icon}</span><b>${a.name}</b><small>${a.desc}${key==='rest'?'':'<br>'+deltaText(Object.fromEntries(Object.entries(a.effect).filter(([k])=>k==='energy')))}</small></button>`).join('');
 const preview=next(next(state,'plan',draft),'month'),change=delta(snapshot(state),snapshot(preview));
 $('planPreview').textContent=`일정 후 예상 · ${deltaText(change)}. 월급 ${preview.report.salary}만 − 생활비 180만을 포함합니다. 사건 선택에 따라 추가로 달라집니다.${preview.report.steps.some(x=>x.key!==x.planned)?' 체력·스트레스·예산 때문에 일부 일정은 휴식으로 바뀝니다.':''}`;
}
function openPlanner(){if(state?.phase!=='plan')return;draft=[...state.plan];activeSlot=0;$('planError').textContent='';drawPlanner();open('planDialog');}
function choiceHint(c){const effects=deltaText(c.effect),need=c.need?Object.entries(c.need).map(([k,v])=>`${names[k]} ${v}${k==='money'?'만 원':''} 이상 필요`).join(' · '):'';return effects+(need?' / '+need:'');}
function showStory(){
 if(!state)return;if(state.phase==='finished'){showEnding();return;}if(state.phase==='plan')return;
 $('storyError').textContent='';$('storyPortrait').innerHTML=portrait(state,'story');$('storyKicker').textContent=dateLabel(state)+' · '+(state.phase==='event'?'이번 달의 이야기':state.phase==='ending'?'다음 장':'한 달의 기록');
 const host=$('storyContent');
 if(state.phase==='event'){
  const e=EVENTS[state.month-1];$('storyTitle').textContent=e.title;
  host.innerHTML=`<details class="report-finance"><summary>이번 달에 보낸 시간</summary>${state.report.steps.map(x=>`<p><strong>${ACTIONS[x.key].name}</strong><br>${esc(x.text)}</p>`).join('')}</details><p class="speaker">${e.speaker}</p><p class="story-body">${e.body}</p>${e.choices.map((c,i)=>`<button class="event-choice" data-choice="${i}" ${canChooseLocal(c)?'':'disabled'}>${c.label}<small>${choiceHint(c)}</small></button>`).join('')}`;
 }else if(state.phase==='report'){
  const r=state.report;$('storyTitle').textContent='또 한 달, 자라난 나';
  host.innerHTML=`<div class="report-finance">월급 +${r.salary}만 · 생활비 −180만<br>이번 달 전체 변화: ${deltaText(delta(r.before,r.after))}</div>${r.steps.map((x,i)=>`<div class="report-step"><strong>0${i+1} · ${ACTIONS[x.key].name}${x.key!==x.planned?' (일정 조정)':''}</strong><p>${esc(x.text)}</p><small>${deltaText(x.delta)}</small></div>`).join('')}<p class="event-result">“${esc(r.eventText)}”</p>${r.review?`<div class="review"><strong>분기 평가 · ${r.review.score}점</strong><br>${r.review.promoted?'새로운 직급: '+rankLabel(state)+' · 다음 달부터 월급 인상':'내 속도로 경험을 쌓아가고 있습니다.'}${r.review.bonus?' · 성과금 '+r.review.bonus+'만 원':''}</div>`:''}<button class="primary" id="continueMonth">${state.month===36?'36개월의 다음 장으로':'다음 달로'} →</button>`;
 }else{
  $('storyTitle').textContent='이제, 어떤 내일로 걸어갈까요?';
  host.innerHTML=`<p class="story-body">${esc(state.name)}님이 고른 하루들이 여기까지 이어졌습니다. 지금 열린 가능성 중, 가장 마음이 가는 다음 장을 골라 주세요.</p>${eligibleEndings(state).map(key=>`<button class="event-choice" data-ending="${key}"><b>${ENDINGS[key].title}</b><small>${ENDINGS[key].tag}</small></button>`).join('')}`;
 }
 open('storyDialog');$('storyDialog').scrollTop=0;
}
function canChooseLocal(c){return !c.need||Object.entries(c.need).every(([k,v])=>(k in state.stats?state.stats[k]:state[k])>=v);}
function openCloset(){if(!state)return;const available=availableOutfits(state);$('outfits').innerHTML=Object.keys(outfitNames).map((key,i)=>`<button data-outfit="${key}" aria-pressed="${state.outfit===key}" ${available.includes(key)?'':'disabled'}>${portrait({...state,outfit:key},'closet-'+key)}<strong>${outfitNames[key]}<small>${i===0?'처음부터 함께':(i+1)+'년 차부터'}${state.outfit===key?' · 입는 중':''}</small></strong></button>`).join('');open('closetDialog');}
function openJournal(){if(!state)return;const eligible=eligibleEndings(state);$('endingHints').innerHTML=Object.entries(ENDINGS).map(([key,e])=>`<div class="ending-hint"><strong>${e.title}</strong><span>${eligible.includes(key)?'현재 조건 충족':'성장 중'}</span><p>${ENDING_HINTS[key]}</p></div>`).join('');$('history').innerHTML=state.history.length?state.history.slice().reverse().map(h=>`<li><strong>${Math.floor((h.month-1)/12)+1}년 차 ${(h.month-1)%12+1}개월 · ${EVENTS[h.month-1].title}</strong><span>${h.plan.map(k=>ACTIONS[k].name).join(' / ')}</span>${EVENTS[h.month-1].choices[h.eventChoice].text}</li>`).join(''):'<li>첫 달을 보내면 여기에 기록이 쌓입니다.</li>';open('journalDialog');}
function shareText(){const e=ENDINGS[state.ending];return `「내일의 나」 신입사원 키우기\n${state.name}의 36개월 — ${e.title}\n실무 ${state.stats.work} · 전문성 ${state.stats.expert} · 인맥 ${state.stats.social}\n서툰 첫 출근부터, 나다운 내일까지.\nhttps://survivaloffice.com/longplay/new-recruit/`;}
function showEnding(){if(!state?.ending)return;const e=ENDINGS[state.ending];$('endingPortrait').innerHTML=portrait({...state,stress:10,energy:90},'ending');$('endingTag').textContent=e.tag;$('endingTitle').textContent=e.title;$('endingName').textContent=state.name+'의 36개월';$('endingText').textContent=e.text;$('endingStats').textContent=`실무 ${state.stats.work} · 전문성 ${state.stats.expert} · 인맥 ${state.stats.social} / 체력 ${state.energy} · 스트레스 ${state.stress} / 모은 돈 ${state.money.toLocaleString()}만 원`;$('shareText').value=shareText();$('shareStatus').textContent='이름과 성장 기록이 공유 문구에 포함됩니다.';open('endingDialog');}
async function copy(){try{await navigator.clipboard.writeText(shareText());$('shareStatus').textContent='이야기와 게임 링크를 복사했습니다.';}catch{$('shareText').hidden=false;$('shareText').focus();$('shareText').select();$('shareStatus').textContent='아래 문구를 직접 복사해 주세요.';}}
function exportSave(){if(!state)return;const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-first-chapter-month-'+state.month+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('settingsMessage').textContent='저장 파일을 내보냈습니다.';}
async function confirm(title,text){$('confirmTitle').textContent=title;$('confirmText').textContent=text;const d=$('confirmDialog');d.returnValue='cancel';d.showModal();return new Promise(resolve=>d.addEventListener('close',()=>resolve(d.returnValue==='confirm'),{once:true}));}
$('startForm').addEventListener('submit',event=>{event.preventDefault();try{if(corrupt)throw Error(loadNote);if(externalChange())return;state=fresh($('nameInput').value,new FormData(event.target).get('gender'));save();render();$('game').scrollIntoView({block:'start'});$('planButton').focus({preventScroll:true});notice('첫 출근을 환영합니다. 이번 달 일정 세 개를 정해 주세요.');}catch(error){$('setupError').textContent=error.message;}});
$('planButton').addEventListener('click',openPlanner);$('resumeButton').addEventListener('click',showStory);$('closetButton').addEventListener('click',openCloset);$('journalButton').addEventListener('click',openJournal);$('settingsButton').addEventListener('click',()=>open('settingsDialog'));
$('runMonth').addEventListener('click',()=>{if(commit('plan',draft)&&commit('month'))showStory();});
document.addEventListener('click',event=>{
 const close=event.target.closest('[data-close]');if(close)close.closest('dialog').close();
 const slot=event.target.closest('[data-slot]');if(slot){activeSlot=Number(slot.dataset.slot);drawPlanner();document.querySelector(`[data-slot="${activeSlot}"]`).focus();}
 const choice=event.target.closest('[data-plan-action]');if(choice){const key=choice.dataset.planAction;draft[activeSlot]=key;activeSlot=Math.min(2,activeSlot+1);drawPlanner();document.querySelector(`[data-plan-action="${key}"]`).focus({preventScroll:true});}
 const storyChoice=event.target.closest('[data-choice]');if(storyChoice&&!storyChoice.disabled&&commit('choose',Number(storyChoice.dataset.choice)))showStory();
 if(event.target.closest('#continueMonth')&&commit('continue')){if(state.phase==='ending')showStory();else {closeAll();$('planButton').focus({preventScroll:true});notice(state.month===13||state.month===25?'새로운 해가 시작됐습니다. 옷장에서 새 옷을 입어보세요.':'다음 달이 시작됐습니다. 나에게 맞는 일정을 골라 주세요.');}}
 const outfit=event.target.closest('[data-outfit]');if(outfit&&!outfit.disabled&&commit('outfit',outfit.dataset.outfit)){openCloset();document.querySelector(`[data-outfit="${state.outfit}"]`).focus();}
 const ending=event.target.closest('[data-ending]');if(ending&&commit('ending',ending.dataset.ending))showEnding();
});
$('copyEnding').addEventListener('click',copy);$('shareEnding').addEventListener('click',async()=>{if(!state?.ending)return;try{if(navigator.share)await navigator.share({title:'내일의 나 · '+ENDINGS[state.ending].title,text:shareText()});else await copy();}catch(error){if(error.name!=='AbortError')await copy();}});
$('exportSave').addEventListener('click',exportSave);$('importSave').addEventListener('click',()=>$('saveFile').click());
$('saveFile').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>120000)throw Error('파일이 너무 큽니다.');const loaded=validate(JSON.parse(await file.text()));if(await confirm('이 이야기를 이어갈까요?',`${loaded.name} · ${dateLabel(loaded)} 기록으로 바뀝니다. 현재 이야기를 남기려면 취소하고 저장 파일을 먼저 내보내 주세요.`)){state=loaded;corrupt=false;save();closeAll();render();notice('저장 파일을 불러왔습니다.');if(state.phase!=='plan')showStory();}}catch(error){$('settingsMessage').textContent='불러오기 실패: '+error.message;}});
$('newGame').addEventListener('click',async()=>{if(!await confirm('새로운 인물로 시작할까요?','현재 이야기는 초기화됩니다. 기록을 남기려면 취소하고 저장 파일을 먼저 내보내 주세요.'))return;try{localStorage.removeItem(KEY);localStorage.removeItem(BACKUP);lastStored=null;storageFailed=false;}catch{storageFailed=true;}state=null;corrupt=false;loadNote='';closeAll();render();$('nameInput').value='';$('nameInput').focus();});
window.addEventListener('storage',event=>{if(event.key===KEY){state=read();closeAll();render();notice(loadNote||'다른 창의 최신 이야기를 불러왔습니다.');}});
for(const d of document.querySelectorAll('dialog:not(#confirmDialog)'))d.addEventListener('close',()=>{if(document.querySelector('dialog[open]'))return;const button=d.id==='settingsDialog'?$('settingsButton'):!state?$('nameInput'):state.phase==='plan'?$('planButton'):$('resumeButton');button.focus({preventScroll:true});});
$('femalePreview').innerHTML=portrait({gender:'female'},'setup-f');$('malePreview').innerHTML=portrait({gender:'male'},'setup-m');
state=read();render();if(loadNote)notice(loadNote,true);if(state&&state.phase!=='plan')showStory();
