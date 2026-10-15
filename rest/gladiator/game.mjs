import {fresh,act,validate,WEAPONS,ARMORS,TIERS,STATS,power,danger,weaponCost,armorCost,facilityCost,lodgingCost,RECRUIT_COST,MAX_ROSTER,selected,view,titleFor,xpNeeded,trainingXP,previewXP,prize,schoolBonus,MAX_LEVEL,OPPONENTS} from './engine.mjs';
import {drawScene,drawGear,drawOpponent} from './art.mjs';
const $=id=>document.getElementById(id), KEY='survivaloffice.gladiator.v1', BACKUP=KEY+'.backup';
let state, lastStored=null, loadMessage='', storageBroken=false, corrupt=false, battleStart=0, shownFrame=-2, skip=false, tactic='balanced',renaming=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function load(){
 corrupt=false;loadMessage='';
 try{lastStored=localStorage.getItem(KEY);if(lastStored){try{const raw=JSON.parse(lastStored),loaded=validate(raw);if(raw.version<3)loadMessage='기존 능력치·장비·전적을 유지했습니다. 레벨 성장과 연승은 새 경기부터 기록됩니다. 훈련소 이름도 변경할 수 있습니다.';return loaded;}catch{const backup=localStorage.getItem(BACKUP);if(backup){try{const recovered=validate(JSON.parse(backup));loadMessage='최근 저장을 읽지 못해 직전 자동 저장을 복구했습니다. 저장 파일을 내보내 두세요.';return recovered;}catch{}}corrupt=true;loadMessage='저장 파일을 읽지 못했습니다. 불러오기로 복구하거나 새 훈련소를 선택해 주세요. 기존 데이터는 아직 덮어쓰지 않았습니다.';}}
 }catch{storageBroken=true;loadMessage='브라우저 저장소를 사용할 수 없습니다. 종료하기 전에 저장 파일을 내보내 주세요.';}return fresh();
}
state=load();
function save(){try{const encoded=JSON.stringify(state);if(lastStored){try{validate(JSON.parse(lastStored));localStorage.setItem(BACKUP,lastStored);}catch{/* Keep an existing valid backup when the current file is corrupt. */}}localStorage.setItem(KEY,encoded);lastStored=encoded;storageBroken=false;$('saveState').textContent='● 자동 저장 완료';}catch{storageBroken=true;$('saveState').textContent='저장 불가 · 파일 내보내기 필요';notice('브라우저에 저장하지 못했습니다. 종료하기 전에 저장 파일을 내보내 주세요.',true);}}
function notice(message,error=false){$('notice').textContent=message;$('notice').classList.toggle('error',error);}
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function locked(){return !!state.battle||selected(state).dead||corrupt||!state.schoolName;}
function moneyButton(id,cost,label,maxed){const el=$(id);el.textContent=maxed?'최고 등급':`${label} ${cost} G`;el.disabled=locked()||maxed||state.gold<cost;}
function renderRoster(){
 const s=state,busy=!!s.battle||corrupt;
 $('roster').dataset.count=String(s.fighters.length);
 $('rosterCount').textContent=s.fighters.length+' / '+s.capacity+'명';
 $('rosterHint').textContent='명단에서 선택 → 훈련·장비 구매·출전. 대기자는 하루마다 피로 −14, 부상 회복 1일.';
 $('expandLodging').textContent=s.capacity>=MAX_ROSTER?'숙소 최대 8명':'숙소 '+s.capacity+' → '+(s.capacity+1)+'명 · '+lodgingCost(s)+' G';
 $('expandLodging').disabled=busy||s.capacity>=MAX_ROSTER||s.gold<lodgingCost(s);
 $('recruitFighter').textContent=s.fighters.length>=s.capacity?'영입 · 숙소 가득 참':'검투사 영입 · '+RECRUIT_COST+' G';
 $('recruitFighter').disabled=busy||s.fighters.length>=s.capacity||s.gold<RECRUIT_COST;
 $('roster').innerHTML=s.fighters.map(f=>{
  const chosen=f.id===s.selectedId,status=f.dead?'전사 · 후계자 영입 가능':s.battle?.fighterId===f.id?'경기 중':f.injury?'부상 '+f.injury+'일':f.fatigue>65?'휴식 필요':'출전 가능';
  return '<button class="roster-card '+(chosen?'selected ':'')+(f.dead?'fallen':'')+'" data-action="select" data-arg="'+f.id+'" aria-pressed="'+chosen+'" aria-label="'+esc(f.name)+' 선택 · '+status+'" '+(busy?'disabled':'')+'><canvas id="rosterSprite'+f.id+'" width="64" height="64" aria-hidden="true"></canvas><span class="roster-info"><strong>'+esc(f.name)+'<small>'+(chosen?'선택 중':f.wins+'승')+'</small></strong><span class="roster-status '+(f.injury||f.dead?'bad':'')+'">'+status+' · 피로 '+f.fatigue+'</span><span class="roster-gear">'+TIERS[f.tier]+' '+WEAPONS[f.weapon].name+' · '+ARMORS[f.armor]+'</span><span class="roster-meta">Lv.'+f.level+' · '+f.streak+'연승 · 거절 '+f.declines+'회</span></span></button>';
 }).join('');
 for(const f of s.fighters)drawGear($('rosterSprite'+f.id),f,'fighter');
}
function render(){
 const s=view(state),fighter=selected(state);
 $('schoolSetup').hidden=!!state.schoolName&&!renaming;
 $('game').hidden=!state.schoolName&&!corrupt;
 $('setupSubmit').textContent=state.schoolName?'이름 저장':'훈련소 열기';
 $('cancelName').hidden=!state.schoolName;
 $('schoolNameDisplay').textContent=state.schoolName;
 $('schoolBonus').textContent='훈련소 명성 상금 +'+schoolBonus(state)+'%';
 $('renameSchool').disabled=!!state.battle||corrupt;
 $('levelLabel').textContent='Lv. '+s.level;
 $('xpText').textContent=s.level===MAX_LEVEL?'최고 레벨':s.xp+' / '+xpNeeded(s.level)+' EXP';
 $('xpFill').style.width=(s.level===MAX_LEVEL?100:s.xp/xpNeeded(s.level)*100)+'%';
 $('fighterTitle').textContent=titleFor(fighter);
 $('streakLine').textContent='현재 '+s.streak+'연승 · 최고 '+s.bestStreak+'연승 · 선수 명성 '+fighter.fame;
 $('growthHint').textContent='레벨업마다 모든 능력치 +2, 중점 능력치 +1 추가 (현재 '+STATS[s.focus]+'). 최대 Lv.30.';
 renderRoster();
 $('day').textContent=String(s.day).padStart(2,'0');$('gold').textContent=`${s.gold.toLocaleString()} G`;$('fame').textContent=state.fame.toLocaleString();$('generation').textContent=s.fighters.filter(f=>!f.dead).length+'/'+s.capacity;
 $('fighterLabel').textContent=s.dead?'IN MEMORIAM':'SELECTED GLADIATOR';
 $('actionTarget').textContent=s.name+' · 행동 1회 = 1일';$('gearTarget').textContent=s.name+'에게 장착';$('fighterName').innerHTML=`${esc(s.name)} <small>${s.wins}승 · ${s.matches}전</small>`;
 $('condition').textContent=s.dead?'전사':s.injury?`부상 · 회복까지 ${s.injury}일`:s.fatigue>65?'휴식 필요':'출전 가능';$('condition').classList.toggle('bad',s.dead||s.injury>0||s.fatigue>65);
 $('stats').innerHTML=Object.entries(STATS).map(([key,label])=>`<div><div class="stat-top"><span>${label}</span><b>${s.stats[key]}</b></div><div class="meter" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.stats[key]}"><i style="width:${s.stats[key]}%"></i></div></div>`).join('');
 $('fatigue').textContent=`${s.fatigue} / 100`;$('fatigueFill').style.width=s.fatigue+'%';$('equipmentLine').textContent=`${TIERS[s.tier]} ${WEAPONS[s.weapon].name} · ${ARMORS[s.armor]}　/　현재 전력 ${power(s)}${s.injury?' · 부상으로 전력 감소':''}`;
 $('training').innerHTML=Object.entries(STATS).map(([key,label])=>`<button data-action="train" data-arg="${key}" ${locked()||s.offer||s.fatigue>75||s.injury||s.level>=MAX_LEVEL?'disabled':''}><b>${label} 중점 훈련</b><small>경험치 +${trainingXP(state)} · 피로 +18</small></button>`).join('');
 document.querySelectorAll('[data-action="rest"],[data-action="work"]').forEach(el=>el.disabled=locked()||!!s.offer);
 document.querySelector('[data-action="heal"]').disabled=locked()||s.gold<35||(!s.fatigue&&!s.injury);
 $('weapons').innerHTML=Object.entries(WEAPONS).map(([key,w])=>`<button data-action="switch" data-arg="${key}" class="${key===s.weapon?'selected':''}" aria-pressed="${key===s.weapon}" ${locked()||key===s.weapon||s.gold<30?'disabled':''}>${w.name}${key===s.weapon?' · 장착':''}</button>`).join('');
 $('weaponName').textContent=`${TIERS[s.tier]} ${WEAPONS[s.weapon].name}`;$('armorName').textContent=ARMORS[s.armor];moneyButton('upgradeWeapon',weaponCost(s),'강화',s.tier>=3);moneyButton('upgradeArmor',armorCost(s),'구매',s.armor>=4);
 $('upgradeFacility').innerHTML=`<span>훈련 시설 개선<small>훈련 ${trainingXP(state)} EXP → ${s.facility>=3?'최대':`${trainingXP(state)+2} EXP`}</small></span><b>${s.facility>=3?'최고 등급':facilityCost(s)+' G'}</b>`;$('upgradeFacility').disabled=!!state.battle||corrupt||s.facility>=3||s.gold<facilityCost(s);$('facilityLevel').textContent=`시설 Lv.${s.facility}`;
 $('history').innerHTML=s.history.map(text=>`<li>${esc(text)}</li>`).join('');drawGear($('weaponPreview'),s,'weapon');drawGear($('armorPreview'),s,'armor');
 $('sceneTitle').textContent=s.battle?'모래의 경기장':'검투사 훈련소';$('sceneBadge').textContent=s.battle?'ARENA · 돌아올 수 있는가':'LUDUS · 훈련과 휴식';$('sceneMode').textContent=s.battle?'경기 중':'훈련소';$('sceneCaption').textContent=s.battle?'모래 위에서, 준비의 값을 증명하세요.':s.dead?'한 검투사의 기록이 끝났습니다.':s.injury?'회복도 훈련의 일부입니다.':'살아 돌아오기 위한 하루.';
 $('scene').setAttribute('aria-label',s.battle?`검투사와 ${OPPONENTS[s.offer.kind].label}의 대결을 보여주는 도트 그래픽 경기장`:`검투사 ${s.fighters.filter(f=>!f.dead).length}명이 생활하는 훈련소. 선택: ${s.name}, ${TIERS[s.tier]} ${WEAPONS[s.weapon].name}, ${ARMORS[s.armor]}`);
 renderOffer();if(storageBroken)$('saveState').textContent='저장 불가 · 파일 내보내기 필요';if(corrupt)$('saveState').textContent='저장 파일 복구 필요';
}
function renderOffer(){
 const s=view(state), host=$('offerContent');
 if(corrupt){host.innerHTML='<div class="offer-empty"><span class="offer-symbol">!</span><h3>저장 파일 확인 필요</h3><p>아래 불러오기 또는 새 훈련소로 시작하세요.</p></div>';return;}
 if(s.dead){host.innerHTML=`<p class="eyebrow">THE CHRONICLE CONTINUES</p><h3 class="result-title">남겨진 이름</h3><p class="result-copy">${esc(s.name)} · ${s.wins}승<br>명단에서 다른 검투사를 선택해 계속 운영하거나, 이 자리의 후계자를 무료로 영입하세요. 후계자는 전사한 검투사의 장비를 이어받습니다.</p><button class="primary" data-action="successor">이 자리의 후계자 영입 · 무료</button><p class="refusal">기억하는 검투사 ${s.fallen.length}명 · 거절권도 새로 지급됩니다.</p>`;return;}
 if(s.battle){shownFrame=-2;renderBattle(-1);return;}
 if(!s.offer){host.innerHTML=`<div class="offer-empty"><span class="offer-symbol">Ⅲ</span><h3>다음 경기를 준비하세요</h3><p>경기 제안까지 <strong>${3-s.day%3}일</strong><br>훈련소에서 하루씩 준비합니다.</p></div><p class="offer-help">훈련과 경기로 경험치를 쌓고<br>상금으로 <strong>무기와 갑옷</strong>을 갖추세요.<br>피로가 높으면 강한 장비도 소용없습니다.</p><p class="refusal">${esc(s.name)}의 거절권 <strong>${s.declines}회</strong><br>검투사마다 생애에 단 한 번.</p>`;return;}
 const o=s.offer,risk=danger(s),quote=prize(state),opponent=OPPONENTS[o.kind];host.innerHTML=`<div class="offer-kicker"><span>${o.kind!=='human'?'맹수전 · 생사전':o.lethal?'생사전 · 높은 보상':'정규 경기 · 출전 제안'}</span><span class="risk ${risk.includes('위험')?'danger':''}">${risk}</span></div><div class="opponent-heading"><canvas id="opponentPreview" width="100" height="64" aria-label="${opponent.label}" role="img"></canvas><h3 class="opponent">${esc(o.name)}</h3></div><p class="opponent-detail">${o.kind==='human'?`${TIERS[o.tier]} ${WEAPONS[o.weapon].name} · ${ARMORS[o.armor]}`:opponent.trait}<br>패배 시 전사 확률 ${o.lethal?'35':'8'}% · 그 외 2~4일 부상</p><div class="comparison"><div>${esc(s.name)} · 출전 예정<strong>${power(s)}</strong></div><div>상대 전력<strong>${o.power}</strong></div></div><div class="reward"><span>승리 상금</span><b>${quote.total} G</b></div><p class="prize-detail">기본 ${quote.base} G + 명성 ${quote.percent}%<br>훈련소 +${quote.school}% · 선수 +${quote.fighter}%</p><p class="xp-reward">승리 +${o.kind==='human'?160:200} EXP<br>생존 패배 +${o.kind==='human'?80:100} EXP</p><label class="tactic-label" for="tactic">출전 전술</label><select id="tactic"><option value="balanced">균형 · 공수 균형</option><option value="attack">맹공 · 공격 +23% / 받는 피해 +20%</option><option value="defend">수비 · 공격 −15% / 받는 피해 −24%</option></select><p class="tactic-hint">전력 비교는 참고치입니다. 전술과 전투 중 변수가 결과에 영향을 줍니다.</p><div class="offer-buttons"><button class="primary" data-action="fight">${esc(s.name)} 출전</button><button data-action="decline" ${s.declines?'':'disabled'}>경기 거절 (${s.declines}/1)</button></div><p class="refusal">${s.declines?'선택한 검투사의 거절권을 사용합니다. 명단에서 출전 선수를 바꿀 수 있습니다.':'이 검투사는 거절권을 사용했습니다. 출전하거나 다른 검투사를 선택하세요.'}</p>`;$('tactic').value=tactic;drawOpponent($('opponentPreview'),o);
}
function renderBattle(index){
 const b=state.battle;if(!b||shownFrame===index)return;shownFrame=index;const done=index>=b.frames.length-1, f=b.frames[index]||{a:b.maxA,b:b.maxB},growth=previewXP(selected(state),b.xpGain),nextTitle=titleFor({...selected(state),bestStreak:Math.max(selected(state).bestStreak,b.streakAfter)});
 if(done){$('offerContent').innerHTML=`<p class="eyebrow">BATTLE REPORT</p><h3 class="result-title">${b.win?'승리':b.dead?'전사':'패배'}</h3><p class="result-copy">${b.win?`살아 돌아왔습니다.<br>상금 <strong class="gold">${b.reward} G</strong> · 선수/훈련소 명성 +${b.fameGain}<br>${b.streakAfter}연승 · ${esc(nextTitle)}`:b.dead?'검투사의 여정이 여기서 끝났습니다.<br>훈련소의 장비와 시설은 남습니다.':`부상을 입었지만 살아 돌아왔습니다.<br>회복까지 ${b.injury}일 · 위로금 ${b.reward} G`}</p><p class="xp-reward">경험치 +${b.xpGain} EXP${growth.levels?` · Lv.${selected(state).level} → Lv.${growth.level}`:''}</p><p class="battle-line">${index+1}합의 대결 · ${esc(b.opponent)}</p><button class="primary" data-action="resolve">${b.win?'상금 받고 훈련소로':'결과 확인 · 훈련소로'}</button><p class="refusal">경기 결과는 저장되었습니다. 보상은 확인 시 한 번만 지급됩니다.</p>`;return;}
 $('offerContent').innerHTML=`<p class="eyebrow">IN THE ARENA</p><h3 class="opponent">${index<0?'경기장에 입장합니다':`${index+1}합 · 대결 중`}</h3><div class="battle-hp"><div><span>${esc(selected(state).name)}</span><b>${Math.ceil(f.a)} / ${Math.ceil(b.maxA)}</b></div><div class="meter"><i style="width:${f.a/b.maxA*100}%"></i></div><div><span>${esc(b.opponent)}</span><b>${Math.ceil(f.b)} / ${Math.ceil(b.maxB)}</b></div><div class="meter"><i style="width:${f.b/b.maxB*100}%;background:#bd8060"></i></div></div><p class="battle-line">${index<0?'전술과 훈련의 결실을 지켜보세요.':`${f.dealt?`${f.dealt} 피해를 주었습니다.`:'상대가 공격을 피했습니다.'}<br>${f.taken?`${f.taken} 피해를 받았습니다.`:'상대의 공격을 허용하지 않았습니다.'}`}</p><button id="skipBattle">결과 바로 보기</button><p class="refusal">자동 전투 · 새로고침해도 결과는 유지됩니다.</p>`;
}
function beginBattle(){battleStart=performance.now();shownFrame=-2;skip=reduced;}
function hasExternalChange(){try{const now=localStorage.getItem(KEY);if(now!==lastStored){state=load();beginBattle();render();notice('다른 탭에서 바뀐 저장을 불러왔습니다. 내용을 확인하고 다시 선택해 주세요.');return true;}}catch{}return false;}
function perform(action,arg){if(corrupt)return false;if(hasExternalChange())return false;try{state=act(state,action,arg);if(action==='fight')beginBattle();save();render();if(action==='select')document.querySelector(`[data-action="select"][data-arg="${state.selectedId}"]`)?.focus({preventScroll:true});if(!storageBroken)notice(action==='fight'?selected(state).name+' 출전 · 대기 중인 동료들은 하루를 회복합니다.':action==='select'?selected(state).name+' 선택 · 이 검투사를 훈련하고 장비를 구매합니다.':state.history[0]);return true;}catch(error){notice(error.message,true);return false;}}
$('schoolForm').addEventListener('submit',event=>{event.preventDefault();try{const next=act(state,'nameSchool',$('schoolNameInput').value);if(corrupt)throw Error('불러오기 또는 새 훈련소로 저장 파일을 복구해 주세요.');if(hasExternalChange())return;state=next;renaming=false;save();render();$('setupError').textContent='';notice(state.history[0]);}catch(error){$('setupError').textContent=error.message;}});
$('renameSchool').addEventListener('click',()=>{renaming=true;$('schoolNameInput').value=state.schoolName;render();$('schoolNameInput').focus();});
$('cancelName').addEventListener('click',()=>{renaming=false;render();});
$('setupImport').addEventListener('click',()=>$('saveFile').click());
document.addEventListener('click',event=>{const btn=event.target.closest('[data-action]');if(btn&&!btn.disabled){const action=btn.dataset.action;perform(action,action==='fight'?($('tactic')?.value||tactic):btn.dataset.arg);}if(event.target.closest('#skipBattle'))skip=true;});
document.addEventListener('change',event=>{if(event.target.id==='tactic')tactic=event.target.value;});
async function confirm(title,message){$('confirmTitle').textContent=title;$('confirmText').textContent=message;const d=$('confirmDialog');d.returnValue='cancel';d.showModal();return new Promise(resolve=>d.addEventListener('close',()=>resolve(d.returnValue==='confirm'),{once:true}));}
function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`sand-and-iron-day-${state.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('저장 파일을 내보냈습니다. 다른 기기에서 불러올 수 있습니다.');}
$('exportSave').addEventListener('click',exportSave);
$('importSave').addEventListener('click',()=>$('saveFile').click());
$('saveFile').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>200000)throw Error('저장 파일이 너무 큽니다.');const loaded=validate(JSON.parse(await file.text()));if(await confirm('저장 파일을 불러올까요?',`${loaded.day}일째 검투사 ${loaded.fighters.length}명의 기록으로 현재 훈련소를 교체합니다. 현재 기록이 필요하면 먼저 내보내 주세요.`)){state=loaded;renaming=false;corrupt=false;save();beginBattle();render();notice('저장 파일을 불러왔습니다.');}}catch(error){notice('불러오기 실패: '+error.message,true);}});
$('resetGame').addEventListener('click',async()=>{if(await confirm('새 훈련소를 시작할까요?','현재 검투사와 장비, 골드 기록이 초기화됩니다. 기록을 남기려면 먼저 저장 파일을 내보내 주세요.')){state=fresh();renaming=false;$('schoolNameInput').value='';corrupt=false;save();render();notice('새 훈련소를 열었습니다. 첫 경기 전 훈련과 장비를 준비하세요.');}});
window.addEventListener('storage',event=>{if(event.key===KEY){state=load();beginBattle();render();notice(loadMessage||'다른 탭의 최신 저장을 불러왔습니다.');}});
render();if(loadMessage)notice(loadMessage,corrupt||storageBroken||loadMessage.startsWith('최근 저장'));if(state.battle)beginBattle();
let lastDraw=0;
function tick(now){if(now-lastDraw>66 && !document.hidden){const index=state.battle?(skip?state.battle.frames.length-1:Math.min(state.battle.frames.length-1,Math.floor((now-battleStart)/850)-1)):-1;drawScene($('scene'),view(state),{battle:!!state.battle,frame:index,time:now/1000,reduced});if(state.battle)renderBattle(index);lastDraw=now;}requestAnimationFrame(tick);}requestAnimationFrame(tick);
