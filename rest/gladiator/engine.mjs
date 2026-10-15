export const WEAPONS = { sword:{ name:'검', power:5, speed:1.05 }, spear:{ name:'창', power:7, speed:.96 }, axe:{ name:'도끼', power:10, speed:.87 } };
export const ARMORS = ['천옷','가죽 갑옷','청동 갑옷','철 갑옷','근위대 갑옷'];
export const TIERS = ['훈련용','단련된','정예','명장'];
export const STATS = { strength:'근력', agility:'민첩', stamina:'체력', skill:'기술' };
export const MAX_ROSTER = 8;
export const MAX_LEVEL = 30;
export const TITLES = [{streak:5,name:'모래의 승부사'},{streak:10,name:'경기장의 지배자'},{streak:15,name:'불굴의 검투사'},{streak:20,name:'콜로세움의 전설'},{streak:30,name:'불멸의 이름'}];
export const OPPONENTS = {human:{label:'검투사',trait:'무기와 갑옷을 갖춘 상대'},tiger:{label:'호랑이',trait:'날렵한 발톱 · 공격력 +13% · 높은 회피'},lion:{label:'사자',trait:'맹수의 체격 · 체력 +25%'}};
export function titleFor(f) { return [...TITLES].reverse().find(t=>f.bestStreak>=t.streak)?.name||'이름 없는 도전자'; }
export function xpNeeded(level) { return level>=MAX_LEVEL?0:100+(level-1)*40; }
export function trainingXP(s) { return 10+s.facility*2; }
export function battleXP(kind,win=true) { return (win?160:80)+(kind==='human'?0:win?40:20); }
export function awardXP(f,amount) {
 if(f.level>=MAX_LEVEL)return 0;
 f.xp+=amount;let gained=0;
 while(f.level<MAX_LEVEL&&f.xp>=xpNeeded(f.level)) {
  f.xp-=xpNeeded(f.level);f.level++;gained++;
  for(const key of Object.keys(STATS))f.stats[key]=Math.min(100,f.stats[key]+2+(key===f.focus?1:0));
 }
 if(f.level===MAX_LEVEL)f.xp=0;return gained;
}
export function previewXP(f,amount) { const after=structuredClone(f);const levels=awardXP(after,amount);return {level:after.level,xp:after.xp,levels}; }
export function schoolBonus(s) { return Math.min(50,Math.floor(s.fame/50)*5); }
export function prize(s,f=selected(s)) {
 const base=s.offer?.reward||0,school=schoolBonus(s),fighter=Math.min(50,Math.floor(f.fame/25)*5);
 return {base,school,fighter,percent:school+fighter,total:Math.floor(base*(100+school+fighter)/100)};
}
function fameFor(streak) { return 10+2*streak+(streak%5===0?Math.min(100,streak*5):0); }
function cleanName(value) {
 if(typeof value!=='string'||/[\u0000-\u001f\u007f]/.test(value))throw Error('훈련소 이름을 2~20자로 입력해 주세요.');
 const name=value.normalize('NFC').trim().replace(/\s+/g,' ');
 if([...name].length<2||[...name].length>20)throw Error('훈련소 이름을 2~20자로 입력해 주세요.');
 return name;
}
export const RECRUIT_COST = 80;
const names = ['마르쿠스','루시우스','티투스','카시우스','발레리우스','펠릭스','아우렐리우스','레오'];
const fighterKeys = ['name','generation','wins','matches','weapon','tier','armor','declines','fatigue','injury','dead','stats'];
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
const has=(obj,key)=>Object.hasOwn(obj,key);
export function random(s) { s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296; }
function recruit(id,generation=1) {
 return {id,name:names[(id-1)%names.length]+(id>8?' '+Math.ceil(id/8):''),generation,level:1,xp:0,focus:'strength',streak:0,bestStreak:0,fame:0,wins:0,matches:0,weapon:'sword',tier:0,armor:0,declines:1,fatigue:0,injury:0,dead:false,stats:{strength:10,agility:10,stamina:10,skill:10}};
}
export function fresh(seed=Date.now()>>>0) {
 return {version:3,schoolName:'',seed,day:1,gold:100,fame:0,facility:0,capacity:3,nextId:4,selectedId:1,fighters:[recruit(1),recruit(2),recruit(3)],offer:null,battle:null,history:['1일 · 검투사 3명과 함께 훈련소의 문을 열었습니다.'],fallen:[]};
}
export function selected(s) { return s.fighters.find(f=>f.id===s.selectedId); }
// A read-only presentation object keeps shared resources separate from fighter saves.
export function view(s) { return {...s,...selected(s),fame:s.fame,fighterFame:selected(s).fame}; }
function note(s,t) { s.history.unshift(s.day+'일 · '+t);s.history=s.history.slice(0,30); }
export function power(f) { if(f.fighters&&!f.stats)f=selected(f);return Math.round((f.stats.strength+f.stats.agility+f.stats.stamina+f.stats.skill+WEAPONS[f.weapon].power+f.tier*9+f.armor*8)*(1-f.fatigue*.004)*(f.injury?.78:1)); }
export function weaponCost(f) { return [65,140,260][f.tier]??0; }
export function armorCost(f) { return [55,110,190,300][f.armor]??0; }
export function facilityCost(s) { return s.facility<3?120+s.facility*120:0; }
export function lodgingCost(s) { return s.capacity<MAX_ROSTER?150+(s.capacity-3)*75:0; }
export function danger(s) { if(!s.offer)return '';const ratio=s.offer.power/Math.max(1,power(s));return ratio<.83?'유리':ratio<1.1?'대등':ratio<1.35?'위험':'매우 위험'; }
function offer(s) {
 const experience=Math.max(0,...s.fighters.filter(f=>!f.dead).map(f=>f.matches));
 const roll=random(s),kind=experience>=1?(roll<.16?'tiger':roll<.32?'lion':'human'):'human';
 const p=Math.round(43+experience*8+random(s)*12+(kind==='human'?0:10)),lethal=kind!=='human'||(experience>=2&&random(s)<.3);
 s.offer={kind,name:['붉은 모래의 브루투스','방패꾼 옥타비우스','검은 창의 세베루스','도전자 가이우스'][Math.floor(random(s)*4)],power:p,weapon:Object.keys(WEAPONS)[Math.floor(random(s)*3)],tier:Math.min(3,Math.floor(experience/3)),armor:Math.min(4,Math.floor(experience/2)),reward:65+experience*18+(lethal?55:0)+(kind==='human'?0:35),lethal};
 if(kind!=='human'){s.offer.name=kind==='tiger'?'줄무늬 사냥꾼 · 호랑이':'황금 갈기의 왕 · 사자';s.offer.tier=0;s.offer.armor=0;}
 note(s,'경기 제안 도착 · 명단에서 출전할 검투사를 선택하세요.');
}
function advanceDay(s,activeId,{recoverActive=true,createOffer=true}={}) {
 s.day++;
 for(const f of s.fighters) {
  if(f.dead)continue;
  if(f.id!==activeId)f.fatigue=Math.max(0,f.fatigue-14);
  if(f.id!==activeId||recoverActive)f.injury=Math.max(0,f.injury-1);
 }
 if(createOffer&&s.day%3===0)offer(s);
}
function spend(s,amount) { if(s.gold<amount)throw Error('골드가 부족합니다.');s.gold-=amount; }
export function act(state,action,arg) {
 const s=structuredClone(state),f=selected(s);
 if(s.battle&&action!=='resolve')throw Error('경기 결과를 먼저 확인해 주세요.');
 if(action==='nameSchool'){s.schoolName=cleanName(arg);note(s,s.schoolName+' · 훈련소 이름 등록');return s;}
 if(!s.schoolName)throw Error('먼저 훈련소 이름을 정해 주세요.');
 if(action==='select') {
  if(!s.fighters.some(member=>member.id===Number(arg)))throw Error('명단에 없는 검투사입니다.');
  s.selectedId=Number(arg);return s;
 }
 if(action==='lodging') {
  if(s.capacity>=MAX_ROSTER)throw Error('숙소는 최대 8명까지 확장할 수 있습니다.');
  spend(s,lodgingCost(s));s.capacity++;note(s,'숙소 확장 · 정원 '+s.capacity+'명');return s;
 }
 if(action==='recruit') {
  if(s.fighters.length>=s.capacity)throw Error('숙소가 가득 찼습니다. 먼저 숙소를 확장하세요.');
  spend(s,RECRUIT_COST);const newcomer=recruit(s.nextId++);s.fighters.push(newcomer);s.selectedId=newcomer.id;
  note(s,newcomer.name+' 영입 · '+RECRUIT_COST+' G');return s;
 }
 if(action==='facility') {
  if(s.facility>=3)throw Error('훈련소가 최고 등급입니다.');
  spend(s,facilityCost(s));s.facility++;note(s,'훈련 시설 개선 · 훈련 경험치 +2');return s;
 }
 if(action==='successor') {
  if(!f.dead)throw Error('전사한 검투사를 선택해 주세요.');
  const next=recruit(s.nextId++,f.generation+1);
  next.weapon=f.weapon;next.tier=f.tier;next.armor=f.armor;
  s.fighters[s.fighters.indexOf(f)]=next;s.selectedId=next.id;
  note(s,next.name+' 영입 · '+f.name+'의 장비를 계승합니다.');return s;
 }
 if(f.dead)throw Error('살아 있는 검투사를 선택하거나 후계자를 영입해 주세요.');
 if(action==='train') {
  if(s.offer)throw Error('경기 제안을 먼저 결정해 주세요.');
  if(!has(STATS,arg))throw Error('훈련을 선택해 주세요.');
  if(f.fatigue>75)throw Error('피로가 높습니다. 쉬거나 다른 검투사를 훈련하세요.');
  if(f.injury)throw Error('부상 중에는 훈련할 수 없습니다. 다른 검투사를 선택해 주세요.');
  if(f.level>=MAX_LEVEL)throw Error('이미 최고 레벨입니다.');
  f.focus=arg;const gain=trainingXP(s),levels=awardXP(f,gain);f.fatigue=Math.min(100,f.fatigue+18);
  note(s,f.name+' · '+STATS[arg]+' 중점 훈련 +'+gain+' EXP'+(levels?' · Lv.'+f.level+' 달성':''));
  advanceDay(s,f.id);
 } else if(action==='rest'||action==='work') {
  if(s.offer)throw Error('경기 제안을 먼저 결정해 주세요.');
  if(action==='rest'){f.fatigue=Math.max(0,f.fatigue-38);note(s,f.name+' · 휴식으로 피로 회복');}
  else {s.gold+=18;f.fatigue=Math.min(100,f.fatigue+8);note(s,f.name+' · 훈련소 잡일 +18 G');}
  advanceDay(s,f.id);
 } else if(action==='heal') {
  if(!f.injury&&!f.fatigue)throw Error('이미 최상의 상태입니다.');
  spend(s,35);f.injury=0;f.fatigue=Math.max(0,f.fatigue-35);note(s,f.name+' · 의무실 치료 35 G');
 } else if(action==='weapon') {
  if(f.tier>=3)throw Error('최고 등급입니다.');
  spend(s,weaponCost(f));f.tier++;note(s,f.name+' · '+TIERS[f.tier]+' '+WEAPONS[f.weapon].name+' 강화');
 } else if(action==='switch') {
  if(!has(WEAPONS,arg)||arg===f.weapon)throw Error('다른 무기를 선택해 주세요.');
  spend(s,30);f.weapon=arg;note(s,f.name+' · '+WEAPONS[arg].name+' 장착 · 강화 등급 유지');
 } else if(action==='armor') {
  if(f.armor>=4)throw Error('최고 등급입니다.');
  spend(s,armorCost(f));f.armor++;note(s,f.name+' · '+ARMORS[f.armor]+' 구입');
 } else if(action==='decline') {
  if(!s.offer||!f.declines)throw Error('이 검투사의 거절권을 이미 사용했습니다.');
  f.declines=0;s.offer=null;note(s,f.name+'의 유일한 경기 거절권 사용');advanceDay(s,f.id);
 } else if(action==='fight') {
  if(!s.offer)throw Error('아직 경기 제안이 없습니다.');
  if(!['balanced','attack','defend'].includes(arg))throw Error('전술을 선택해 주세요.');
  s.battle=simulate(s,f,arg);note(s,f.name+' · 경기장 입장');
 } else if(action==='resolve') {
  if(!s.battle)throw Error('진행 중인 경기가 없습니다.');
  const b=s.battle,combatant=s.fighters.find(member=>member.id===b.fighterId);
  if(!combatant||combatant.dead)throw Error('출전한 검투사 정보를 확인할 수 없습니다.');
  combatant.matches++;combatant.fatigue=Math.min(100,combatant.fatigue+22);s.gold+=b.reward;
  const oldTitle=titleFor(combatant),levels=awardXP(combatant,b.xpGain);
  if(b.win){
   combatant.wins++;combatant.streak=b.streakAfter;combatant.bestStreak=Math.max(combatant.bestStreak,combatant.streak);
   combatant.fame+=b.fameGain;s.fame+=b.fameGain;
   note(s,combatant.name+' '+combatant.streak+'연승! '+b.reward+' G · '+b.xpGain+' EXP · 선수/훈련소 명성 +'+b.fameGain+(levels?' · Lv.'+combatant.level+' 달성':''));
   if(titleFor(combatant)!==oldTitle)note(s,combatant.name+' 칭호 획득 · '+titleFor(combatant));
  }
  else {
   combatant.injury=b.injury;combatant.dead=b.dead;combatant.streak=0;
   note(s,b.dead?combatant.name+' · 경기장에서 전사':combatant.name+' 패배 · '+b.injury+'일 부상 · '+b.reward+' G · '+b.xpGain+' EXP'+(levels?' · Lv.'+combatant.level+' 달성':''));
   if(b.dead)s.fallen.unshift({name:combatant.name,wins:combatant.wins,day:s.day});s.fallen=s.fallen.slice(0,20);
  }
  s.battle=null;s.offer=null;
  advanceDay(s,combatant.id,{recoverActive:false,createOffer:false});
 } else throw Error('알 수 없는 행동입니다.');
 return s;
}
function simulate(s,f,tactic) {
 const o=s.offer,p=power(f),aggressive=tactic==='attack',defensive=tactic==='defend';
 const maxA=65+f.stats.stamina*3+f.armor*7,maxB=(75+o.power*1.2)*(o.kind==='lion'?1.25:1);let a=maxA,b=maxB;const frames=[];
 for(let i=0;i<36&&a>0&&b>0;i++) {
  const hit=random(s)>(o.kind==='tiger'?.18:.12),dealt=hit?Math.round((10+p*.17)*(.75+random(s)*.5)*WEAPONS[f.weapon].speed*(aggressive?1.23:defensive?.85:1)):0;
  b=Math.max(0,b-dealt);let taken=0;
  if(b>0){taken=random(s)>.08+Math.min(.18,f.stats.agility*.002)?Math.max(2,Math.round((10+o.power*.17)*(o.kind==='tiger'?1.13:1)*(.75+random(s)*.5)*(aggressive?1.2:defensive?.76:1)-f.armor*1.7)):0;a=Math.max(0,a-taken);}
  frames.push({a,b,dealt,taken});
 }
 const win=b<=0||(a>0&&a/maxA>=b/maxB),deathChance=o.lethal?.35:.08;
 const dead=!win&&random(s)<deathChance,injury=win?0:(random(s)<.45?2:4);
 const quoted=prize(s,f),streakAfter=win?f.streak+1:0;
 return {fighterId:f.id,win,dead,injury,reward:win?quoted.total:Math.floor(quoted.total*.2),baseReward:quoted.base,bonusPercent:quoted.percent,xpGain:dead?0:battleXP(o.kind,win),fameGain:win?fameFor(streakAfter):0,streakAfter,maxA,maxB,frames,tactic,opponent:o.name,deathChance};
}
function checkFighter(f,withId=true) {
 if(!f||typeof f!=='object')throw Error('검투사 정보를 읽을 수 없습니다.');
 for(const [key,min,max] of [['generation',1,100000],['wins',0,100000],['matches',0,100000],['tier',0,3],['armor',0,4],['declines',0,1],['fatigue',0,100],['injury',0,4]])if(!integer(f[key],min,max))throw Error('검투사 기록이 손상되었습니다.');
 if(withId&&!integer(f.id,1,1000000))throw Error('잘못된 검투사 번호입니다.');
 if(!has(WEAPONS,f.weapon)||typeof f.dead!=='boolean'||typeof f.name!=='string'||!f.name.length||f.name.length>40||!f.stats||!Object.keys(STATS).every(k=>integer(f.stats[k],1,100)))throw Error('검투사 정보를 읽을 수 없습니다.');
 if(f.wins>f.matches)throw Error('검투사 전적이 올바르지 않습니다.');
}
function checkCommon(s) {
 for(const [key,min,max] of [['seed',0,4294967295],['day',1,1000000],['gold',0,100000000],['fame',0,10000000],['facility',0,3]])if(!integer(s[key],min,max))throw Error('저장 데이터가 손상되었습니다.');
 if(!Array.isArray(s.history)||s.history.length>30||!s.history.every(t=>typeof t==='string'&&t.length<200)||!Array.isArray(s.fallen)||s.fallen.length>20||!s.fallen.every(f=>f&&typeof f.name==='string'&&f.name.length<=40&&integer(f.wins,0,100000)&&integer(f.day,1,1000000)))throw Error('기록을 읽을 수 없습니다.');
 if(s.offer!==null) {
  const o=s.offer;if(!o||typeof o.name!=='string'||o.name.length>60||!integer(o.power,1,2000000)||!integer(o.reward,0,10000000)||!has(WEAPONS,o.weapon)||!integer(o.tier,0,3)||!integer(o.armor,0,4)||typeof o.lethal!=='boolean')throw Error('경기 정보를 읽을 수 없습니다.');
 }
}
function checkBattle(s,f) {
 if(s.battle===null)return;
 const b=s.battle;
 if(!b||!s.offer||f.dead||typeof b.win!=='boolean'||typeof b.dead!=='boolean'||(b.win&&b.dead)||!integer(b.injury,0,4)||!integer(b.reward,0,10000000)||typeof b.opponent!=='string'||b.opponent.length>60||!['attack','defend','balanced'].includes(b.tactic)||![.08,.35].includes(b.deathChance)||!Number.isFinite(b.maxA)||!Number.isFinite(b.maxB)||b.maxA<=0||b.maxB<=0||b.maxA>1e7||b.maxB>1e7||!Array.isArray(b.frames)||!b.frames.length||b.frames.length>36||!b.frames.every(frame=>frame&&['a','b','dealt','taken'].every(k=>Number.isFinite(frame[k])&&frame[k]>=0&&frame[k]<=1e7)))throw Error('진행 중인 경기를 읽을 수 없습니다.');
}
function migrateLegacy(old) {
 checkCommon(old);checkFighter(old,false);checkBattle(old,old);
 const s=fresh(old.seed);
 for(const key of ['day','gold','fame','facility','offer','battle','history','fallen'])s[key]=structuredClone(old[key]);
 for(const key of fighterKeys)s.fighters[0][key]=structuredClone(old[key]);
 if(s.battle)s.battle.fighterId=1;
 note(s,'숙소 정원 3명 · 기존 검투사의 기록과 장비를 유지하고 동료 2명을 맞이했습니다.');
 return s;
}
export function validate(input) {
 if(!input||![1,2,3].includes(input.version))throw Error('지원하지 않는 저장 파일입니다.');
 const s=input.version===1?migrateLegacy(input):structuredClone(input);
 checkCommon(s);
 if(!integer(s.capacity,3,MAX_ROSTER)||!Array.isArray(s.fighters)||s.fighters.length<1||s.fighters.length>s.capacity)throw Error('숙소 정원이나 명단이 올바르지 않습니다.');
 s.fighters.forEach(f=>checkFighter(f));
 const ids=s.fighters.map(f=>f.id);
 if(new Set(ids).size!==ids.length||!ids.includes(s.selectedId)||!integer(s.nextId,1,1000001)||s.nextId<=Math.max(...ids))throw Error('검투사 명단이 손상되었습니다.');
 if(s.battle&&s.battle.fighterId!==s.selectedId)throw Error('출전한 검투사와 저장된 선택이 일치하지 않습니다.');
 checkBattle(s,selected(s));
 if(input.version<3){
  s.version=3;s.schoolName='모래와 철 훈련소';
  for(const f of s.fighters){
   f.level=Math.max(1,Math.min(MAX_LEVEL,1+Math.floor((Object.values(f.stats).reduce((a,b)=>a+b,0)-40)/9)));
   f.xp=0;f.focus='strength';f.streak=0;f.bestStreak=0;f.fame=0;
  }
  if(s.offer)s.offer.kind='human';
  // Keep already-committed legacy payouts intact; don't invent past streaks or XP.
  if(s.battle)Object.assign(s.battle,{baseReward:s.offer.reward,bonusPercent:0,xpGain:0,fameGain:s.battle.win?10:0,streakAfter:s.battle.win?1:0});
  note(s,'기존 능력치·장비·전적 유지 · 레벨과 연승 기록은 새 경기부터 이어집니다.');
 }
 if(typeof s.schoolName!=='string'||(s.schoolName!==''&&cleanName(s.schoolName)!==s.schoolName))throw Error('훈련소 이름이 올바르지 않습니다.');
 for(const f of s.fighters){
  if(!integer(f.level,1,MAX_LEVEL)||!integer(f.xp,0,f.level===MAX_LEVEL?0:xpNeeded(f.level)-1)||!has(STATS,f.focus)||!integer(f.streak,0,f.wins)||!integer(f.bestStreak,f.streak,f.wins)||!integer(f.fame,0,10000000))throw Error('레벨 또는 연승 기록이 손상되었습니다.');
 }
 if(s.offer&&!has(OPPONENTS,s.offer.kind))throw Error('알 수 없는 경기 상대입니다.');
 if(s.battle){
  const b=s.battle,f=selected(s);
  if(!s.schoolName||!integer(b.baseReward,0,10000000)||!integer(b.bonusPercent,0,100)||!integer(b.xpGain,0,200)||!integer(b.fameGain,0,1000000)||b.streakAfter!==(b.win?f.streak+1:0)||(!b.win&&b.fameGain!==0)||(b.dead&&b.xpGain!==0))throw Error('경기 보상 기록이 손상되었습니다.');
 }
 return s;
}
