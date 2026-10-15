import {TACTICS,DEATH_CHANCE} from './teams.mjs';
import {fresh,act,validate,WEAPONS,ARMORS,TIERS,STATS,power,danger,weaponCost,armorCost,facilityCost,lodgingCost,RECRUIT_COST,MAX_ROSTER,selected,view,titleFor,xpNeeded,trainingXP,previewXP,prize,schoolBonus,MAX_LEVEL,OPPONENTS,TRAINING,DAY_MS,elapse,currentActivity} from './engine.mjs';
import {battleView,battleDuration} from './combat.mjs';
import {drawScene,drawGear,drawOpponent,drawEnding} from './art.mjs';
const $=id=>document.getElementById(id), KEY='survivaloffice.gladiator.v1', BACKUP=KEY+'.backup';
let state, lastStored=null, loadMessage='', storageBroken=false, corrupt=false, shownFrame='', tactic='balanced',renaming=false;
let playbackPaused=false,playbackSpeed=1,lastTick=performance.now(),lastCheckpoint=lastTick,lastDraw=0,runtimeDirty=false;
let lineup=[],offerAnnouncement='';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function load(){
 corrupt=false;loadMessage='';
 try{lastStored=localStorage.getItem(KEY);if(lastStored){try{const raw=JSON.parse(lastStored),loaded=validate(raw);if(raw.version<6)loadMessage='개인 전적·연승과 기존 경기 결과는 유지했습니다. 이전에 집계하지 않던 훈련소 패배·연승은 업데이트 이후부터 기록합니다. 챔피언전은 훈련소 30연승이 필요합니다.';return loaded;}catch{const backup=localStorage.getItem(BACKUP);if(backup){try{const recovered=validate(JSON.parse(backup));loadMessage='최근 저장을 읽지 못해 직전 자동 저장을 복구했습니다. 저장 파일을 내보내 두세요.';return recovered;}catch{}}corrupt=true;loadMessage='저장 파일을 읽지 못했습니다. 불러오기로 복구하거나 새 훈련소를 선택해 주세요. 기존 데이터는 아직 덮어쓰지 않았습니다.';}}
 }catch{storageBroken=true;loadMessage='브라우저 저장소를 사용할 수 없습니다. 종료하기 전에 저장 파일을 내보내 주세요.';}return fresh();
}
state=load();
function save(){runtimeDirty=false;lastCheckpoint=performance.now();try{const encoded=JSON.stringify(state);if(lastStored){try{validate(JSON.parse(lastStored));localStorage.setItem(BACKUP,lastStored);}catch{/* Keep an existing valid backup when the current file is corrupt. */}}localStorage.setItem(KEY,encoded);lastStored=encoded;storageBroken=false;$('saveState').textContent='● 자동 저장 완료';}catch{storageBroken=true;$('saveState').textContent='저장 불가 · 파일 내보내기 필요';notice('브라우저에 저장하지 못했습니다. 종료하기 전에 저장 파일을 내보내 주세요.',true);}}
function notice(message,error=false){document.querySelectorAll('[data-dialog-notice]').forEach(el=>{el.textContent=message;el.classList.toggle('error',error);});$('notice').textContent=message;$('notice').classList.toggle('error',error);}
function esc(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function locked(){return !!state.ending||!!state.battle||selected(state).dead||corrupt||!state.schoolName;}
function moneyButton(id,cost,label,maxed){const el=$(id);el.textContent=maxed?'최고 등급':`${label} ${cost} G`;el.disabled=locked()||maxed||state.gold<cost;}
function renderRoster(){
 const s=state,busy=!!s.ending||!!s.battle||corrupt;
 $('roster').dataset.count=String(s.fighters.length);
 $('rosterCount').textContent=s.fighters.length+' / '+s.capacity+'명';
 $('rosterHint').textContent='기본훈련은 자동으로 진행됩니다. 카드를 눌러 일정·장비·치료를 한곳에서 관리하세요.';
 $('expandLodging').textContent=s.capacity>=MAX_ROSTER?'숙소 최대 8명':'숙소 '+s.capacity+' → '+(s.capacity+1)+'명 · '+lodgingCost(s)+' G';
 $('expandLodging').disabled=busy||s.capacity>=MAX_ROSTER||s.gold<lodgingCost(s);
 $('recruitFighter').textContent=s.fighters.length>=s.capacity?'영입 · 숙소 가득 참':'검투사 영입 · '+RECRUIT_COST+' G';
 $('recruitFighter').disabled=busy||s.fighters.length>=s.capacity||s.gold<RECRUIT_COST;
 $('roster').innerHTML=s.fighters.map(f=>{
  const chosen=f.id===s.selectedId,status=f.dead?'전사 · 후계자 영입 가능':(s.battle?.results?.some(r=>r.fighterId===f.id)||s.battle?.fighterId===f.id)?'경기 중':f.injury?'부상 '+f.injury+'일':f.fatigue>65?'휴식 필요':'출전 가능';
  return '<div class="roster-slot"><button class="roster-card '+(chosen?'selected ':'')+(f.dead?'fallen':'')+'" data-action="select" data-arg="'+f.id+'" aria-label="'+esc(f.name)+' 관리 · '+status+'" '+(busy?'disabled':'')+'><canvas id="rosterSprite'+f.id+'" width="64" height="64" aria-hidden="true"></canvas><span class="roster-info"><strong>'+esc(f.name)+'<small>Lv.'+f.level+'</small></strong><span class="roster-status '+(f.injury||f.dead?'bad':'')+'">'+currentActivity(f)+' · 피로 '+f.fatigue+'</span><span class="roster-meta">'+f.wins+'승 '+(f.matches-f.wins)+'패 · '+f.streak+'연승</span></span><span class="roster-arrow" aria-hidden="true">↗</span></button></div>';

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
 $('renameSchool').disabled=!!state.ending||!!state.battle||corrupt;
 $('campaignText').textContent=state.ending?'월계관의 주인 · 여정 완수':'훈련소 '+state.schoolStreak+'연승 / 챔피언전 초대 30연승';
 $('campaignFill').style.width=Math.min(100,state.schoolStreak/30*100)+'%';
 $('campaignHint').textContent=state.ending?'챔피언을 탄생시킨 훈련소로 기록되었습니다.':state.schoolStreak>=30?'30연승 달성! 초대를 거절할 수 있지만 패배하면 연승과 도전 자격이 초기화됩니다.':'다인전도 경기당 1승·1패. 패배하면 연승은 0이 됩니다. 30연승을 달성해 챔피언에 도전하세요.';
 $('campaignRecord').textContent='통산 '+state.schoolWins+'승 · '+state.schoolLosses+'패 · 최고 '+state.schoolBestStreak+'연승'+(state.recordStartDay?' (패배·훈련소 연승은 '+state.recordStartDay+'일 업데이트 이후 집계)':'');
 $('streakChip').textContent=state.schoolStreak+'연승';$('successorPanel').hidden=!fighter.dead;
 $('levelLabel').textContent='Lv. '+s.level;
 $('xpText').textContent=s.level===MAX_LEVEL?'최고 레벨':s.xp+' / '+xpNeeded(s.level)+' EXP';
 $('xpFill').style.width=(s.level===MAX_LEVEL?100:s.xp/xpNeeded(s.level)*100)+'%';
 $('fighterTitle').textContent=titleFor(fighter);
 $('streakLine').textContent='현재 '+s.streak+'연승 · 최고 '+s.bestStreak+'연승 · 선수 명성 '+fighter.fame;
 $('growthHint').textContent='레벨업: 모든 능력치 +2'+(STATS[s.training]?' · 현재 '+STATS[s.training]+' 훈련 가산 +1':' · 현재 중점훈련 가산 없음')+'. 출전 시 훈련 일정이 경기 경험치에도 적용됩니다.';
 renderRoster();
 $('day').textContent=String(s.day).padStart(2,'0');$('gold').textContent=`${s.gold.toLocaleString()} G`;$('fame').textContent=state.fame.toLocaleString();$('generation').textContent=s.fighters.filter(f=>!f.dead).length+'/'+s.capacity;
 $('fighterLabel').textContent=s.dead?'IN MEMORIAM':'SELECTED GLADIATOR';
 $('actionTarget').textContent=s.name+' · '+TRAINING[s.training];$('gearTarget').textContent=s.name+'에게 장착';$('fighterName').innerHTML=`${esc(s.name)} <small>${s.wins}승 ${s.matches-s.wins}패 · ${s.matches}전</small>`;
 $('condition').textContent=s.dead?'전사':s.injury?`부상 · 회복까지 ${s.injury}일`:s.fatigue>65?'휴식 필요':'출전 가능';$('condition').classList.toggle('bad',s.dead||s.injury>0||s.fatigue>65);
 $('stats').innerHTML=Object.entries(STATS).map(([key,label])=>`<div><div class="stat-top"><span>${label}</span><b>${s.stats[key]}</b></div><div class="meter" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${s.stats[key]}"><i style="width:${s.stats[key]}%"></i></div></div>`).join('');
 $('fatigue').textContent=`${s.fatigue} / 100`;$('fatigueFill').style.width=s.fatigue+'%';$('equipmentLine').textContent=`${TIERS[s.tier]} ${WEAPONS[s.weapon].name} · ${ARMORS[s.armor]}　/　현재 전력 ${power(s)}${s.injury?' · 부상으로 전력 감소':''}`;
 $('training').innerHTML=Object.entries({basic:'기본훈련',...Object.fromEntries(Object.entries(STATS).map(([k,v])=>[k,v+' 중점']))}).map(([key,label])=>`<button data-action="train" data-arg="${key}" aria-pressed="${s.training===key}" class="${s.training===key?'selected':''}" ${locked()?'disabled':''}><b>${label}${s.training===key?' · 배정 중':''}</b><small>하루 +${trainingXP(state)} EXP · 피로 +${key==='basic'?8:12}</small></button>`).join('');
 document.querySelectorAll('[data-action="rest"],[data-action="work"]').forEach(el=>{el.disabled=locked();el.classList.toggle('selected',el.dataset.action===s.training);el.setAttribute('aria-pressed',String(el.dataset.action===s.training));});
 document.querySelector('[data-action="heal"]').disabled=locked()||s.gold<35||(!s.fatigue&&!s.injury);
 $('weapons').innerHTML=Object.entries(WEAPONS).map(([key,w])=>`<button data-action="switch" data-arg="${key}" class="${key===s.weapon?'selected':''}" aria-pressed="${key===s.weapon}" ${locked()||key===s.weapon||s.gold<30?'disabled':''}>${w.name}${key===s.weapon?' · 장착':''}</button>`).join('');
 $('weaponName').textContent=`${TIERS[s.tier]} ${WEAPONS[s.weapon].name}`;$('armorName').textContent=ARMORS[s.armor];moneyButton('upgradeWeapon',weaponCost(s),'강화',s.tier>=3);moneyButton('upgradeArmor',armorCost(s),'구매',s.armor>=4);
 $('upgradeFacility').innerHTML=`<span>훈련 시설 개선<small>훈련 ${trainingXP(state)} EXP → ${s.facility>=3?'최대':`${trainingXP(state)+2} EXP`}</small></span><b>${s.facility>=3?'최고 등급':facilityCost(s)+' G'}</b>`;$('upgradeFacility').disabled=!!state.ending||!!state.battle||corrupt||s.facility>=3||s.gold<facilityCost(s);$('facilityLevel').textContent=`시설 Lv.${s.facility}`;
 $('history').innerHTML=s.history.map(text=>`<li>${esc(text)}</li>`).join('');drawGear($('weaponPreview'),s,'weapon');drawGear($('armorPreview'),s,'armor');
 $('sceneTitle').textContent='훈련장';$('sceneBadge').textContent='기본훈련은 자동으로 진행됩니다';$('sceneMode').textContent='훈련소';$('sceneCaption').textContent='각자의 하루가, 다음 경기의 힘이 됩니다.';
 $('scene').setAttribute('aria-label',`검투사 ${s.fighters.filter(f=>!f.dead).length}명이 각자의 일정에 따라 훈련하는 훈련소`);
 renderOffer();renderClock();renderEnding();syncOfferDialog();if(state.battle)openArena();else if($('arenaDialog').open)$('arenaDialog').close();if(storageBroken)$('saveState').textContent='저장 불가 · 파일 내보내기 필요';if(corrupt)$('saveState').textContent='저장 파일 복구 필요';
}
function renderOffer(){
 const s=view(state),host=$('offerContent');
 if(!s.offer||s.battle||state.ending){host.innerHTML='';return;}
 const o=s.offer,count=o.allyCount||1,enemyCount=o.enemyCount||1;
 if(s.dead){host.innerHTML='<p>선택한 검투사는 전사했습니다. 훈련소에서 다른 검투사를 선택하거나 후계자를 영입한 뒤 초대장을 다시 열어 주세요.</p><button data-close-dialog>훈련소에서 준비</button>';return;}
 const quote=prize(state);
 lineup=[s.id,...lineup.filter(id=>id!==s.id&&state.fighters.some(f=>f.id===id&&!f.dead))].slice(0,count);
 const total=lineup.reduce((n,id)=>n+power(state.fighters.find(f=>f.id===id)),0),enemyPower=(o.opponents||[o]).reduce((n,e)=>n+e.power,0);
 host.innerHTML=`<div class="offer-overview"><div><p class="eyebrow">${o.champion?'CHAMPIONSHIP':o.lethal?'생사전':'정규 경기'}</p><h3 class="match-format">아군 ${count} <span>vs</span> 상대 ${enemyCount}</h3></div><div class="opponent-heading"><canvas id="opponentPreview" width="100" height="64" aria-label="경기 상대" role="img"></canvas><h3 class="opponent">${esc(o.name)}</h3></div></div><p class="opponent-detail">${OPPONENTS[o.kind].trait} · 패배·기절 시 전사 <strong>${Math.round((o.lethal?DEATH_CHANCE.lethal:DEATH_CHANCE.regular)*100)}%</strong></p>${o.champion?'<p class="champion-invite">30연승의 증명. 불패의 아우렐리안을 꺾고 훈련소의 이름을 역사에 남기세요.</p>':''}<div class="offer-setup"><div><label class="tactic-label" for="offerLeader">대표 선수</label><select id="offerLeader">${state.fighters.filter(f=>!f.dead).map(f=>`<option value="${f.id}">${esc(f.name)} · 전력 ${power(f)}</option>`).join('')}</select><p class="leader-condition">Lv.${s.level} · 피로 ${s.fatigue}/100${s.injury?" · 부상 "+s.injury+"일":""}<br>${TIERS[s.tier]} ${WEAPONS[s.weapon].name} · ${ARMORS[s.armor]}</p><fieldset class="lineup" ${count===1?"hidden":""}><legend>출전 명단 ${lineup.length} / ${count}명</legend>${state.fighters.filter(f=>!f.dead).map(f=>`<label><input type="checkbox" data-lineup="${f.id}" ${lineup.includes(f.id)?'checked':''} ${f.id===s.id?'disabled':''}><span>${esc(f.name)}${f.id===s.id?' · 대표':''}<small>전력 ${power(f)} · ${f.injury?'부상 '+f.injury+'일':'피로 '+f.fatigue}</small></span></label>`).join('')}</fieldset></div><div><label class="tactic-label" for="tactic">팀 전술</label><select id="tactic">${Object.entries(TACTICS).map(([key,t])=>`<option value="${key}">${t.name}</option>`).join('')}</select><p id="tacticEffect" class="tactic-effect"></p><div class="comparison"><div>아군 전력<strong>${total}</strong></div><div>상대 전력<strong>${enemyPower}</strong></div></div><p class="tactic-hint">전력은 참고치입니다. 체력·장비·전술·인원에 따라 달라집니다. 피로와 부상이 있다면 닫고 치료부터 준비하세요.</p><div class="reward"><span>승리 상금</span><b>${quote.total} G</b></div><p class="xp-reward">생존 선수마다 승리 +${o.kind==='human'?160:200} EXP</p></div></div><details class="match-details"><summary>보상·전술·부상 자세히</summary><p>기본 ${quote.base} G + 명성 ${quote.percent}% (훈련소 ${quote.school}% · 대표 선수 ${quote.fighter}%). 상금은 팀에 한 번 지급됩니다. 생존 패배 경험치는 ${o.kind==='human'?80:100} EXP입니다. 치명타는 피해 1.7배이며, 전술은 출전 시 확정됩니다. 전사하지 않으면 2~4일 부상을 입습니다. 쓰러진 동료는 팀 승리 시에도 부상·전사할 수 있습니다.</p></details><div class="offer-buttons"><button class="primary" data-action="fight" ${lineup.length===count?'':'disabled'}>${o.champion?'챔피언에 도전':count+'명 출전'}</button><button data-action="decline" ${o.champion||s.declines?'':'disabled'}>${o.champion?'초대 거절':'경기 거절 ('+s.declines+'/1)'}</button><button data-close-dialog>훈련소에서 준비</button></div><p class="refusal">${o.champion?'거절권 소모 없이 거절할 수 있습니다. 30연승을 유지하면 9일 뒤 다시 초대받습니다.':'경기 거절은 대표 선수의 생애 1회 거절권을 사용합니다. 창만 닫으면 거절권은 유지됩니다.'}</p>`;
 $('offerLeader').value=String(s.id);$('tactic').value=tactic;$('tacticEffect').textContent=TACTICS[tactic].description;drawOpponent($('opponentPreview'),o);
}
function resultHTML(b){
 if(b.format==='teams')return `<p class="eyebrow">${b.champion?'CHAMPIONSHIP':'TEAM BATTLE'} REPORT</p><h3 class="result-title">${b.win?b.champion?'새로운 챔피언':'팀 승리':'팀 패배'}</h3><p class="result-copy">훈련소 정산 <strong class="gold">${b.reward} G</strong> · 통산 ${state.schoolWins+(b.win?1:0)}승 ${state.schoolLosses+(b.win?0:1)}패<br>훈련소 ${b.win?state.schoolStreak+1:0}연승${b.win?'':' · 연승 초기화'}</p><div class="team-results">${b.results.map(r=>{const f=state.fighters.find(f=>f.id===r.fighterId),growth=previewXP(f,r.xpGain,r.trainingAtEntry);return `<div><strong>${esc(f.name)}</strong><span>${r.dead?'전사':r.injury?r.injury+'일 부상':'생환'} · +${r.xpGain} EXP${growth.levels?' · Lv.'+growth.level:''}<br>${f.wins+(b.win?1:0)}승 ${f.matches-f.wins+(b.win?0:1)}패 · ${r.streakAfter}연승 · 명성 +${r.fameGain}</span></div>`;}).join('')}</div><button class="primary" data-action="resolve">${b.win&&b.champion?'월계관을 받다 · 엔딩':'보상 확인 · 훈련소로'}</button><p class="refusal">보상은 한 번만 지급됩니다. 출전 당시 훈련의 레벨업 가산을 적용합니다.</p>`;

 const growth=previewXP(selected(state),b.xpGain,b.trainingAtEntry),nextTitle=titleFor({...selected(state),bestStreak:Math.max(selected(state).bestStreak,b.streakAfter)});
 return `<p class="eyebrow">BATTLE REPORT</p><h3 class="result-title">${b.win?'승리':b.dead?'전사':'패배'}</h3><p class="result-copy">${b.win?`상금 <strong class="gold">${b.reward} G</strong> · 선수/훈련소 명성 +${b.fameGain}<br>${b.streakAfter}연승 · ${esc(nextTitle)}`:b.dead?'검투사의 여정이 여기서 끝났습니다.':`생환 · 부상 ${b.injury}일 · 위로금 ${b.reward} G`}</p><p class="xp-reward">경험치 +${b.xpGain} EXP${growth.levels?` · Lv.${selected(state).level} → Lv.${growth.level}`:''}<br>출전 당시 일정: ${TRAINING[b.trainingAtEntry]}${STATS[b.trainingAtEntry]?' · 레벨업 시 '+STATS[b.trainingAtEntry]+' 추가 +1':''}</p><button class="primary" data-action="resolve">보상 확인 · 훈련소로</button><p class="refusal">보상은 한 번만 지급됩니다.</p>`;
}
function renderBattle(v){
 const b=state.battle;if(!b)return;
 if(b.format==='teams'){renderTeamBattle(v);return;}
 $('teamHud').hidden=true;$('legacyHud').hidden=false;
 const key=[v.round,v.phase,v.a,v.b,v.progress>=.32,v.progress>=.72,v.complete].join(':');if(shownFrame===key)return;shownFrame=key;
 $('arenaRound').textContent=v.complete?'경기 종료':v.phase==='entry'?'경기장 입장':v.round+'합 / '+b.frames.length+'합';
 $('arenaPlayer').textContent=selected(state).name;$('arenaOpponent').textContent=b.opponent;
 $('arenaHpA').textContent=Math.ceil(v.a)+' / '+Math.ceil(b.maxA);$('arenaHpB').textContent=Math.ceil(v.b)+' / '+Math.ceil(b.maxB);
 $('arenaFillA').style.width=v.a/b.maxA*100+'%';$('arenaFillB').style.width=v.b/b.maxB*100+'%';
 let line=v.phase==='entry'?'양쪽 입구에서 경기장으로 들어옵니다.':v.complete?(b.win?'승리했습니다. 경기 보상을 확인하세요.':'대결이 끝났습니다. 결과를 확인하세요.'):'간격을 재며 다음 공격을 준비합니다.';
 if(v.phase==='player')line=v.progress<.32?selected(state).name+'의 공격!':v.dealt?'공격 적중 · 상대에게 '+v.dealt+' 피해':'상대가 공격을 피했습니다.';
 if(v.phase==='enemy')line=v.progress<.72?'상대가 반격합니다!':v.taken?'반격 적중 · '+v.taken+' 피해를 받았습니다.':'상대의 공격을 피했습니다.';
 $('arenaLog').textContent=line;
 $('arenaResult').hidden=!v.complete;
 if(v.complete)$('arenaResult').innerHTML=resultHTML(b);
 $('arenaPause').disabled=v.complete;$('arenaSpeed').disabled=v.complete;$('arenaSkip').hidden=v.complete;
}
function openArena(){if(!state.battle)return;closeManagementDialogs();renderBattle(battleView(state.battle));if(!$('arenaDialog').open)$('arenaDialog').showModal();}
function beginBattle(){shownFrame='';playbackPaused=false;playbackSpeed=1;lastTick=performance.now();$('arenaPause').textContent='관전 일시정지';$('arenaSpeed').textContent='속도 1배';}
function renderClock(active=!document.hidden&&document.hasFocus()){
 const stopped=state.ending?'여정 완수':corrupt?'저장 복구 필요':!state.schoolName?'훈련소 이름 설정':state.battle?'경기 관전 중':state.offer?'경기 제안 선택 중':state.paused?'일시정지':renaming||managementOpen()||$('confirmDialog').open?'관리 중 · 시간 멈춤':!state.fighters.some(f=>!f.dead)?'후계자 영입 대기':!active?'다른 탭·창에서 대기 중':'전원 일정 진행 중';
 $('clockStatus').textContent=stopped;document.querySelector('.clock-bar').classList.toggle('running',stopped==='전원 일정 진행 중');
 renderNextEvent();
 $('clockCountdown').textContent='다음 날까지 '+Math.ceil((DAY_MS-state.dayProgressMs)/1000)+'초';
 $('dayFill').style.width=state.dayProgressMs/DAY_MS*100+'%';
 $('toggleClock').textContent=state.offer&&!state.battle?'제안 대기':state.paused?'시간 재개':'일시정지';$('toggleClock').disabled=!!state.ending||corrupt||!!state.offer||!!state.battle||!state.schoolName;
}
function hasExternalChange(){try{const now=localStorage.getItem(KEY);if(now!==lastStored){state=load();beginBattle();render();notice('다른 탭에서 바뀐 저장을 불러왔습니다. 내용을 확인하고 다시 선택해 주세요.');return true;}}catch{}return false;}
function perform(action,arg){if(corrupt)return false;if(hasExternalChange())return false;try{state=act(state,action,arg);if(action==='fight')beginBattle();save();render();if(!storageBroken)notice(action==='fight'?selected(state).name+' 출전 · 경기장이 열렸습니다.':action==='select'?selected(state).name+' 선택 · 이 검투사를 훈련하고 장비를 구매합니다.':state.history[0]);return true;}catch(error){notice(error.message,true);return false;}}
$('schoolForm').addEventListener('submit',event=>{event.preventDefault();try{const next=act(state,'nameSchool',$('schoolNameInput').value);if(corrupt)throw Error('불러오기 또는 새 훈련소로 저장 파일을 복구해 주세요.');if(hasExternalChange())return;state=next;renaming=false;save();render();$('setupError').textContent='';notice(state.history[0]);}catch(error){$('setupError').textContent=error.message;}});
$('renameSchool').addEventListener('click',()=>{closeManagementDialogs();renaming=true;$('schoolNameInput').value=state.schoolName;render();$('schoolNameInput').focus();});
$('cancelName').addEventListener('click',()=>{renaming=false;render();});
$('setupImport').addEventListener('click',()=>$('saveFile').click());
document.addEventListener('click',event=>{const btn=event.target.closest('[data-action]');if(btn&&!btn.disabled){const action=btn.dataset.action;if(perform(action,action==='fight'?{tactic:$('tactic')?.value||tactic,ids:lineup}:btn.dataset.arg)&&action==='select')openManagement('fighterDialog');}if(event.target.closest('#openArena'))openArena();if(event.target.closest('#openEnding'))$('endingDialog').showModal();});
document.addEventListener('change',event=>{
 if(event.target.id==='offerLeader'){lineup=[];perform('select',event.target.value);$('offerLeader')?.focus({preventScroll:true});}
 if(event.target.id==='tactic'){tactic=event.target.value;$('tacticEffect').textContent=TACTICS[tactic].description;}
 if(event.target.matches('[data-lineup]')){
  const id=Number(event.target.dataset.lineup);
  if(event.target.checked&&lineup.length>=(state.offer.allyCount||1)){event.target.checked=false;notice('출전 인원이 찼습니다. 다른 동료의 체크를 먼저 해제해 주세요.',true);return;}
  lineup=event.target.checked?[...lineup,id]:lineup.filter(n=>n!==id);renderOffer();
  document.querySelector('[data-lineup="'+id+'"]')?.focus({preventScroll:true});
 }
});
async function confirm(title,message){$('confirmTitle').textContent=title;$('confirmText').textContent=message;const d=$('confirmDialog');d.returnValue='cancel';d.showModal();return new Promise(resolve=>d.addEventListener('close',()=>resolve(d.returnValue==='confirm'),{once:true}));}
function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`sand-and-iron-day-${state.day}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('저장 파일을 내보냈습니다. 다른 기기에서 불러올 수 있습니다.');}
$('exportSave').addEventListener('click',exportSave);
$('importSave').addEventListener('click',()=>$('saveFile').click());
$('saveFile').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;try{if(file.size>200000)throw Error('저장 파일이 너무 큽니다.');const loaded=validate(JSON.parse(await file.text()));if(await confirm('저장 파일을 불러올까요?',`${loaded.day}일째 검투사 ${loaded.fighters.length}명의 기록으로 현재 훈련소를 교체합니다. 현재 기록이 필요하면 먼저 내보내 주세요.`)){closeManagementDialogs();offerAnnouncement='';state=loaded;renaming=false;corrupt=false;save();beginBattle();render();notice('저장 파일을 불러왔습니다.');}}catch(error){notice('불러오기 실패: '+error.message,true);}});
$('resetGame').addEventListener('click',async()=>{if(await confirm('새 훈련소를 시작할까요?','현재 검투사와 장비, 골드 기록이 초기화됩니다. 기록을 남기려면 먼저 저장 파일을 내보내 주세요.')){closeManagementDialogs();offerAnnouncement='';state=fresh();renaming=false;$('schoolNameInput').value='';corrupt=false;save();render();notice('새 훈련소를 열었습니다. 첫 경기 전 훈련과 장비를 준비하세요.');}});
window.addEventListener('storage',event=>{if(event.key===KEY){state=load();beginBattle();render();notice(loadMessage||'다른 탭의 최신 저장을 불러왔습니다.');}});
$('arenaClose').addEventListener('click',()=>$('arenaDialog').close());
$('arenaPause').addEventListener('click',()=>{playbackPaused=!playbackPaused;$('arenaPause').textContent=playbackPaused?'관전 계속':'관전 일시정지';});
$('arenaSpeed').addEventListener('click',()=>{playbackSpeed=playbackSpeed===1?2:1;$('arenaSpeed').textContent='속도 '+playbackSpeed+'배';});
$('arenaSkip').addEventListener('click',()=>{if(state.battle){state.battle.replayMs=battleDuration(state.battle);save();renderBattle(battleView(state.battle));}});
function initialize(){render();if(loadMessage)notice(loadMessage,corrupt||storageBroken||loadMessage.startsWith('최근 저장'));if(state.battle)beginBattle();}
function checkpoint(){
 if(runtimeDirty&&!corrupt){if(!hasExternalChange())save();runtimeDirty=false;}
}
window.addEventListener('blur',()=>{checkpoint();lastTick=performance.now();});
window.addEventListener('focus',()=>{lastTick=performance.now();});
document.addEventListener('visibilitychange',()=>{checkpoint();lastTick=performance.now();});
window.addEventListener('pagehide',checkpoint);
function tick(now){
 const elapsed=Math.max(0,Math.min(1000,Math.round(now)-Math.round(lastTick)));lastTick=now;
 const active=!document.hidden&&document.hasFocus();
 if(active&&!state.ending&&!corrupt&&!renaming&&!managementOpen()&&!$('confirmDialog').open){
  if(state.battle){
   if(!playbackPaused){const before=state.battle.replayMs;state.battle.replayMs=Math.min(battleDuration(state.battle),before+elapsed*playbackSpeed);runtimeDirty||=state.battle.replayMs!==before;}
  }else{
   const day=state.day,next=elapse(state,elapsed);
   if(next!==state){state=next;runtimeDirty=true;if(state.day!==day){checkpoint();render();notice(state.offer?'경기 제안이 도착했습니다. 훈련소 시간이 잠시 멈췄습니다.':state.day+'일째 · 전원의 일정이 함께 진행되었습니다.');}}
  }
 }
 if(now-lastCheckpoint>=1000){checkpoint();lastCheckpoint=now;}
 if(now-lastDraw>66&&!document.hidden){
  const options={battle:!!state.battle,time:state.battle?state.battle.replayMs/1000:now/1000,reduced};
  drawScene($('scene'),view(state),{battle:false,time:now/1000,reduced});renderClock(active);
  if(state.battle){renderBattle(battleView(state.battle));if($('arenaDialog').open)drawScene($('arenaScene'),view(state),options);}
  lastDraw=now;
 }
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

function renderTeamBattle(v){
 const b=state.battle,key=[v.index,v.phase,v.impact,v.complete].join(':');if(shownFrame===key)return;shownFrame=key;
 $('teamHud').hidden=false;$('legacyHud').hidden=true;
 $('arenaRound').textContent=v.complete?'경기 종료':v.phase==='entry'?'경기장 입장':v.round+' / '+b.frames.length+' 공격';
 $('teamHud').innerHTML=['ally','enemy'].map(side=>`<div class="team-column"><p>${side==='ally'?'우리 훈련소 · '+TACTICS[b.tactic].name:'상대 진영'}</p>${b.units.filter(u=>u.side===side).map(u=>`<div class="unit-hp"><strong>${esc(u.name)}</strong><span>${Math.ceil(v.hp[u.key])} / ${Math.ceil(u.maxHp)}</span><div class="meter"><i style="width:${v.hp[u.key]/u.maxHp*100}%"></i></div></div>`).join('')}</div>`).join('');
 const event=v.event,actor=event&&b.units.find(u=>u.key===event.actor),target=event&&b.units.find(u=>u.key===event.target);
 let line=v.complete?(b.win?'승리! 출전 선수들의 결과를 확인하세요.':'경기가 끝났습니다. 생환한 선수들을 돌봐 주세요.'):!event?'선수들이 각자의 진영으로 입장합니다.':!v.impact?actor.name+' → '+target.name+' 공격 준비':event.damage?(event.critical?'치명타! ':'')+actor.name+' → '+target.name+' · '+event.damage+' 피해':target.name+' · 공격 회피';
 $('arenaLog').textContent=line;$('arenaLog').classList.toggle('critical',!!event?.critical&&v.impact&&!v.complete);
 $('arenaResult').hidden=!v.complete;if(v.complete)$('arenaResult').innerHTML=resultHTML(b);
 $('arenaPause').disabled=v.complete;$('arenaSpeed').disabled=v.complete;$('arenaSkip').hidden=v.complete;
}
let endingRendered='';
function renderEnding(){
 const e=state.ending,d=$('endingDialog');
 if(!e){endingRendered='';if(d.open)d.close();return;}
 const key=JSON.stringify(e);if(key===endingRendered)return;endingRendered=key;
 drawEnding($('endingCard'),e);
 $('endingSchool').textContent=e.schoolName;
 $('endingStory').textContent='이름 없는 세 검투사와 작은 훈련장에서 시작한 '+e.schoolName+'. '+e.day+'일 동안의 훈련과 선택, 모래 위에 남긴 발자국은 마침내 하나의 월계관이 되었습니다. '+e.championName+'의 검이 불패의 아우렐리안을 꺾은 날, 관중들은 검투사의 이름과 함께 당신의 훈련소를 외쳤습니다.';
 $('endingEpilogue').textContent='이제 이곳은 챔피언을 탄생시킨 훈련소로 기억됩니다. 무명의 도전자들이 당신의 문을 두드립니다. 오늘, 이 이야기는 끝나지만 그 이름은 오래 남을 것입니다.';
 $('shareText').value=shareText(e);$('shareStatus').textContent='기록 카드와 도전 링크를 함께 남겨 보세요.';
 closeManagementDialogs();if($('arenaDialog').open)$('arenaDialog').close();d.showModal();
}
function shareText(e){return '🏆 '+e.schoolName+' — 챔피언을 탄생시킨 훈련소!\n챔피언 '+e.championName+' · '+e.day+'일 · 통산 '+e.wins+'승 '+e.losses+'패 · 훈련소 최고 '+e.schoolBestStreak+'연승'+(e.recordStartDay?' (패배·훈련소 연승은 '+e.recordStartDay+'일 업데이트 이후 집계)':'')+' · 명성 '+e.fame+'\n모래와 철에서 나만의 검투사 훈련소를 키워 보세요.\nhttps://survivaloffice.com/longplay/gladiator/';}
$('copyEnding').addEventListener('click',async()=>{if(!state.ending)return;try{await navigator.clipboard.writeText(shareText(state.ending));$('shareStatus').textContent='기록과 게임 링크를 복사했습니다.';}catch{$('shareText').hidden=false;$('shareText').focus();$('shareText').select();$('shareStatus').textContent='아래 공유 문구를 직접 복사해 주세요.';}});
$('endingClose').addEventListener('click',()=>$('endingDialog').close());
$('shareEnding').addEventListener('click',async()=>{
 const e=state.ending;if(!e)return;
 const text=shareText(e);
 try{
  if(navigator.share){await navigator.share({title:e.schoolName+' · 챔피언의 기록',text});$('shareStatus').textContent='공유를 완료했습니다.';}
  else {await navigator.clipboard.writeText(text);$('shareStatus').textContent='기록과 게임 링크를 복사했습니다. 원하는 곳에 붙여 넣으세요.';}
 }catch(error){if(error.name==='AbortError'){$('shareStatus').textContent='공유를 취소했습니다.';return;}$('shareText').hidden=false;$('shareText').focus();$('shareText').select();$('shareStatus').textContent='아래 공유 문구를 직접 복사해 주세요.';}
});
$('downloadEnding').addEventListener('click',()=>{$('endingCard').toBlob(blob=>{if(!blob){$('shareStatus').textContent='이미지를 만들지 못했습니다. 다시 시도해 주세요.';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='sand-and-iron-champion.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('shareStatus').textContent='챔피언 기록 카드를 저장했습니다.';},'image/png');});

function managementOpen(){return ['fighterDialog','schoolDialog','recordsDialog'].some(id=>$(id).open);}
function closeManagementDialogs(){for(const id of ['fighterDialog','schoolDialog','recordsDialog','offerDialog'])if($(id).open)$(id).close();}
function openManagement(id){
 if((state.battle||state.ending)&&id==='fighterDialog')return;
 closeManagementDialogs();$(id).showModal();lastTick=performance.now();
}
function syncOfferDialog(){
 if(!state.schoolName||state.ending||!state.offer||state.battle){if($('offerDialog').open)$('offerDialog').close();if(!state.offer)offerAnnouncement='';return;}
 const key=state.day+':'+JSON.stringify(state.offer);
 if(key!==offerAnnouncement&&!document.querySelector('dialog[open]')&&!renaming){offerAnnouncement=key;$('offerDialog').showModal();}
}
function renderNextEvent(){
 const b=$('nextEventButton');
 b.hidden=!state.offer&&!state.battle&&!state.ending;
 $('nextEventTitle').textContent=state.ending?'월계관의 주인':state.battle?'경기 진행 중':state.offer?'경기 초대장이 도착했습니다':'다음 경기까지 '+Math.max(0,state.nextOfferDay-state.day)+'일';
 $('nextEventHint').textContent=state.ending?'챔피언의 기록을 다시 보거나 공유하세요.':state.battle?'훈련소 시간은 멈춰 있습니다.':state.offer?'확인할 때까지 시간이 멈춥니다. 장비·치료를 준비해도 됩니다.':'제안이 도착하면 팝업으로 알려드립니다.';
 b.textContent=state.ending?'엔딩·공유':state.battle?'경기장 보기':'제안 확인';
}
$('nextEventButton').addEventListener('click',()=>{if(state.ending)$('endingDialog').showModal();else if(state.battle)openArena();else if(state.offer){closeManagementDialogs();$('offerDialog').showModal();}});
document.addEventListener('click',event=>{
 const close=event.target.closest('[data-close-dialog]');if(close){close.closest('dialog').close();lastTick=performance.now();}
 const open=event.target.closest('[data-open-dialog]');if(open)openManagement(open.dataset.openDialog);
 const tab=event.target.closest('[data-fighter-tab]');if(tab){
  document.querySelectorAll('[data-fighter-tab]').forEach(button=>{button.setAttribute('aria-selected',String(button===tab));button.tabIndex=button===tab?0:-1;});
  for(const id of ['trainingPanel','gearPanel'])$(id).hidden=id!==tab.dataset.fighterTab;
 }
});
document.querySelector('.fighter-tabs').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const tabs=[...document.querySelectorAll('[data-fighter-tab]')],current=tabs.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?1:(current+1)%2;tabs[next].click();tabs[next].focus();}});
for(const id of ['fighterDialog','schoolDialog','recordsDialog','offerDialog'])$(id).addEventListener('close',()=>{lastTick=performance.now();syncOfferDialog();if(!renaming&&state.schoolName&&!document.querySelector('dialog[open]')){const target=id==='fighterDialog'?document.querySelector('[data-action="select"][data-arg="'+state.selectedId+'"]'):id==='offerDialog'?$('nextEventButton'):document.querySelector('[data-open-dialog="'+id+'"]');target?.focus({preventScroll:true});}});
initialize();
