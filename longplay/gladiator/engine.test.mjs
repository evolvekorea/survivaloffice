import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh as rawFresh,act,validate,power,selected,view,lodgingCost,MAX_ROSTER,awardXP,xpNeeded,trainingXP,battleXP,titleFor,prize,schoolBonus,MAX_LEVEL,elapse,DAY_MS} from './engine.mjs';

const fresh=(seed)=>act(rawFresh(seed),'nameSchool','검증 훈련소');
const offered=(seed=42)=>elapse(act(fresh(seed),'train','stamina'),DAY_MS*2);
function legacy() {
 return {version:1,seed:42,day:9,gold:245,fame:20,generation:2,wins:2,matches:3,weapon:'spear',tier:2,armor:3,facility:1,declines:0,fatigue:43,injury:2,dead:false,name:'기존 검투사',stats:{strength:22,agility:17,stamina:25,skill:18},offer:null,battle:null,history:['8일 · 기존 기록'],fallen:[{name:'첫 검투사',wins:1,day:3}]};
}
test('start with three real fighters, independent stats and equipment',()=>{
 const s=fresh(12);assert.equal(s.capacity,3);assert.equal(s.fighters.length,3);assert.equal(new Set(s.fighters.map(f=>f.id)).size,3);
 assert.notEqual(s.fighters[0].stats,s.fighters[1].stats);assert.equal(selected(s).id,1);assert.deepEqual(validate(s),s);
});
test('selection does not advance time or alter an existing match offer',()=>{
 const s=offered(),snapshot=structuredClone(s);
 const switched=act(s,'select','2');assert.equal(switched.day,s.day);assert.equal(selected(switched).id,2);
 assert.deepEqual(switched.offer,s.offer);assert.deepEqual(s,snapshot);assert.throws(()=>act(s,'select',999));assert.equal(view(switched).name,'루시우스');
});
test('independent assignments cost no time; all living fighters follow their own daily schedule',()=>{
 let s=fresh();s=act(s,'assign',{id:1,training:'strength'});s=act(s,'assign',{id:2,training:'agility'});s=act(s,'assign',{id:3,training:'rest'});
 assert.equal(s.day,1);assert.equal(s.dayProgressMs,0);assert.ok(s.fighters.every(f=>f.xp===0));assert.equal(s.selectedId,1);
 const done=elapse(s,DAY_MS);assert.equal(done.day,2);
 assert.deepEqual(done.fighters.map(f=>f.xp),[10,10,0]);assert.deepEqual(done.fighters.map(f=>f.fatigue),[12,12,0]);
 assert.ok(done.fighters.every(f=>f.stats.strength===10));assert.ok(s.fighters.every(f=>f.xp===0));
 assert.throws(()=>act(s,'assign',{id:99,training:'basic'}));assert.throws(()=>act(s,'assign',{id:1,training:'unknown'}));validate(done);
});
test('gold is shared, gear upgrades and weapon switches belong to selected fighter',()=>{
 let s=act(fresh(),'weapon');assert.equal(s.gold,35);assert.equal(s.fighters[0].tier,1);assert.equal(s.fighters[1].tier,0);
 s=act(s,'select',2);s=act(s,'switch','spear');assert.equal(s.gold,5);assert.equal(s.fighters[0].weapon,'sword');assert.equal(selected(s).weapon,'spear');assert.equal(selected(s).tier,0);
 assert.throws(()=>act(s,'armor'));assert.throws(()=>act(s,'switch','bad'));
 s=fresh();s=act(s,'select',3);s=act(s,'armor');assert.equal(selected(s).armor,1);assert.equal(s.fighters[0].armor,0);assert.ok(power(s)>power(fresh()));
});
test('beds expand one at a time to eight and recruitment requires room and gold',()=>{
 let s=fresh();assert.throws(()=>act(s,'recruit'));assert.throws(()=>act(s,'lodging'));s.gold=10000;
 for(let capacity=4;capacity<=MAX_ROSTER;capacity++) {
  const before=s.gold,cost=lodgingCost(s),count=s.fighters.length;s=act(s,'lodging');
  assert.equal(s.capacity,capacity);assert.equal(s.gold,before-cost);assert.equal(s.fighters.length,count);
  s=act(s,'recruit');assert.equal(s.fighters.length,capacity);assert.equal(s.gold,before-cost-80);assert.equal(selected(s).id,capacity);assert.equal(s.day,1);validate(s);
 }
 assert.throws(()=>act(s,'lodging'));assert.throws(()=>act(s,'recruit'));
 const noGold=act({...fresh(),gold:150},'lodging');assert.equal(noGold.gold,0);assert.throws(()=>act(noGold,'recruit'));
});
test('refusal is consumed only for selected gladiator and remains spent after reselection',()=>{
 let s=act(offered(),'decline');assert.equal(s.fighters[0].declines,0);assert.equal(s.fighters[1].declines,1);
 s=elapse(s,DAY_MS*3);assert.ok(s.offer);assert.throws(()=>act(s,'decline'));
 s=act(s,'select',2);s=act(s,'decline');assert.equal(s.fighters[1].declines,0);assert.equal(s.fighters[2].declines,1);
});
test('battle pins selected fighter, survives reload, pays once, and pauses teammates',()=>{
 let s=act(offered(),'select',2);s.fighters[0].injury=3;s.fighters[0].fatigue=40;
 s=act(s,'fight','balanced');assert.equal(s.battle.fighterId,2);
 for(const action of ['select','fight','armor','recruit','lodging','successor'])assert.throws(()=>act(s,action,1));
 const reloaded=validate(JSON.parse(JSON.stringify(s)));assert.deepEqual(reloaded.battle,s.battle);
 const done=act(reloaded,'resolve');assert.deepEqual(done,act(s,'resolve'));assert.equal(done.fighters[1].matches,1);assert.equal(done.fighters[0].matches,0);
 assert.equal(done.fighters[0].fatigue,40);assert.equal(done.fighters[0].injury,3);assert.equal(done.gold,s.gold+s.battle.reward);
 if(!s.battle.win&&!s.battle.dead)assert.equal(done.fighters[1].injury,s.battle.injury);
 assert.throws(()=>act(done,'resolve'));
});
test('infirmary treats only selected fighter and does not advance the clock',()=>{
 let s=fresh();s.fighters[0].injury=4;s.fighters[0].fatigue=60;s.fighters[1].injury=2;
 assert.ok(power(s)<power({...selected(s),injury:0}));s=act(s,'heal');
 assert.equal(selected(s).injury,0);assert.equal(selected(s).fatigue,25);assert.equal(s.fighters[1].injury,2);assert.equal(s.day,1);assert.equal(s.gold,65);
});
test('death affects only combatant; others remain usable and successor inherits only that slot gear',()=>{
 let fallen;
 for(let seed=1;seed<3000;seed++) {
  let s=act(offered(seed),'select',2);s.offer.power=400;s.offer.lethal=true;
  s=act(s,'fight','attack');if(s.battle.dead){fallen=act(s,'resolve');break;}
 }
 assert.ok(selected(fallen).dead);assert.equal(fallen.fighters[0].dead,false);assert.equal(fallen.fighters[2].dead,false);
 assert.throws(()=>act(fallen,'rest'));const continuing=act(act(fallen,'select',1),'train','strength');assert.equal(selected(continuing).stats.strength,10);
 const oldId=fallen.selectedId;selected(fallen).armor=3;selected(fallen).tier=2;fallen.facility=2;fallen.fame=30;
 const others=fallen.fighters.filter(f=>f.id!==oldId),next=act(fallen,'successor');assert.equal(next.fighters.length,3);assert.equal(next.fighters.some(f=>f.id===oldId),false);
 assert.equal(selected(next).dead,false);assert.equal(selected(next).declines,1);assert.equal(selected(next).armor,3);assert.equal(selected(next).tier,2);assert.equal(selected(next).stats.strength,10);
 assert.deepEqual(next.fighters.filter(f=>f.id!==next.selectedId),others);assert.equal(next.day,fallen.day);assert.equal(next.gold,fallen.gold);assert.equal(next.facility,2);assert.equal(next.fallen.length,1);validate(next);
});
test('migrate version one without losing stats, gear, injuries, refusal, funds or fallen records',()=>{
 const old=legacy(),copy=structuredClone(old),s=validate(old);
 assert.equal(s.version,6);assert.equal(s.fighters.length,3);assert.equal(s.capacity,3);assert.equal(s.gold,245);
 for(const key of ['name','generation','wins','matches','weapon','tier','armor','declines','fatigue','injury','dead','stats'])assert.deepEqual(selected(s)[key],old[key]);
 for(const key of ['day','seed','gold','fame','facility','offer','fallen'])assert.deepEqual(s[key],old[key]);
 assert.ok(s.history.includes(old.history[0]));assert.deepEqual(old,copy);assert.deepEqual(validate(s),s);
 const dead=legacy();dead.dead=true;const migrated=validate(dead);assert.ok(selected(migrated).dead);assert.equal(act(migrated,'successor').fighters.length,3);
});
test('migration preserves a pending legacy battle result, locks fighter and cannot double collect',()=>{
 const old=legacy();old.offer={name:'검증 상대',power:60,weapon:'axe',tier:1,armor:1,reward:100,lethal:false};
 old.battle={win:true,dead:false,injury:0,reward:100,maxA:161,maxB:147,frames:[{a:140,b:0,dealt:147,taken:21}],tactic:'balanced',opponent:'검증 상대',deathChance:.08};
 const s=validate(old);assert.deepEqual(s.battle,{...old.battle,fighterId:1,baseReward:100,bonusPercent:0,xpGain:0,fameGain:10,streakAfter:1,replayMs:0,trainingAtEntry:'strength'});assert.throws(()=>act(s,'select',2));
 const done=act(validate(JSON.parse(JSON.stringify(s))),'resolve');assert.equal(done.gold,345);assert.equal(done.fighters[0].wins,3);assert.equal(done.fighters[1].wins,0);assert.throws(()=>act(done,'resolve'));
});
test('all tactics and outcomes serialize with different participants',()=>{
 let won=0,lost=0;
 for(let seed=0;seed<150;seed++)for(const tactic of ['balanced','attack','defend']) {
  let s=act(offered(seed),'select',seed%3+1);if(seed%2===0)s=act(s,'armor');
  s=act(s,'fight',tactic);validate(JSON.parse(JSON.stringify(s)));s.battle.win?won++:lost++;validate(act(s,'resolve'));
 }
 assert.ok(won>0&&lost>0);
});
test('malformed rosters, mismatched combatants and corrupt legacy saves are rejected',()=>{
 for(const mutate of [
  s=>s.capacity=9,s=>s.capacity=2,s=>s.fighters.push({...s.fighters[0]}),s=>s.fighters[1].id=1,s=>s.selectedId=99,s=>s.nextId=2,
  s=>s.fighters[0].fatigue=101,s=>s.fighters[0].stats.strength=null,s=>s.fighters[0].weapon='unknown',
  s=>s.gold=-1,s=>s.fighters=[],s=>s.fallen=[null],s=>s.offer=undefined
 ]){const s=fresh();mutate(s);assert.throws(()=>validate(s));}
 const s=act(offered(),'fight','balanced');s.battle.fighterId=2;assert.throws(()=>validate(s));s.battle.fighterId=1;s.battle.frames[0].a=-1;assert.throws(()=>validate(s));
 assert.throws(()=>validate({...legacy(),armor:8}));
});

test('school name is required, validated, normalized, safely round trips and can be renamed',()=>{
 const s=rawFresh(10);assert.equal(s.schoolName,'');assert.throws(()=>act(s,'train','strength'));
 for(const name of ['', '가','a'.repeat(21),'hello\u0000world',null])assert.throws(()=>act(s,'nameSchool',name));
 const named=act(s,'nameSchool','  붉은   모래  ');assert.equal(named.schoolName,'붉은 모래');assert.equal(named.day,1);assert.deepEqual(validate(named),named);
 assert.equal(act(named,'nameSchool','새 이름').schoolName,'새 이름');
});
test('level bonuses use current training at the level-up, not previous training',()=>{
 let s=fresh(1);selected(s).xp=89;
 s=elapse(act(s,'train','agility'),DAY_MS);assert.equal(selected(s).xp,99);assert.equal(selected(s).level,1);
 assert.deepEqual(selected(s).stats,{strength:10,agility:10,stamina:10,skill:10});
 s=act(s,'train','strength');assert.equal(selected(s).xp,99);
 s=elapse(s,DAY_MS);assert.equal(selected(s).level,2);assert.equal(selected(s).xp,9);
 assert.deepEqual(selected(s).stats,{strength:13,agility:12,stamina:12,skill:12});validate(s);
 const basic=selected(fresh());awardXP(basic,100);assert.deepEqual(basic.stats,{strength:12,agility:12,stamina:12,skill:12});
});
test('XP carries through multiple levels and stops cleanly at level cap',()=>{
 const f=selected(fresh());assert.equal(awardXP(f,250),2);assert.equal(f.level,3);assert.equal(f.xp,10);
 assert.equal(awardXP(f,100000),27);assert.equal(f.level,MAX_LEVEL);assert.equal(f.xp,0);assert.equal(awardXP(f,200),0);
 assert.ok(Object.values(f.stats).every(n=>n<=100));assert.equal(xpNeeded(1),100);assert.equal(xpNeeded(2),140);assert.equal(xpNeeded(30),0);
 for(let facility=0;facility<=3;facility++)assert.ok(battleXP('human')>=trainingXP({facility})*10);
 assert.equal(battleXP('tiger'),200);assert.equal(battleXP('lion',false),100);assert.equal(battleXP('human',false),80);
});
function winning(streak=0,kind='human'){
 let s=offered(9),f=selected(s);
 Object.assign(f,{wins:streak,matches:streak,streak,bestStreak:streak,tier:3,armor:4,fatigue:0});
 f.stats={strength:70,agility:70,stamina:70,skill:70};
 Object.assign(s.offer,{kind,power:15,lethal:kind!=='human',reward:100});
 return s;
}
test('5, 10, 15, 20, 30 consecutive wins unlock persistent titles and extra fame',()=>{
 const names={5:'모래의 승부사',10:'경기장의 지배자',15:'불굴의 검투사',20:'콜로세움의 전설',30:'불멸의 이름'};
 for(const milestone of [5,10,15,20,30]){
  let s=act(winning(milestone-1),'fight','balanced');assert.ok(s.battle.win);
  const fame=10+milestone*2+Math.min(100,milestone*5);
  assert.equal(s.battle.fameGain,fame);const b=s.battle;
  const done=act(validate(JSON.parse(JSON.stringify(s))),'resolve'),f=selected(done);
  assert.equal(f.streak,milestone);assert.equal(f.bestStreak,milestone);assert.equal(titleFor(f),names[milestone]);
  assert.equal(f.fame,fame);assert.equal(done.fame,fame);assert.equal(done.gold,s.gold+b.reward);assert.equal(f.level,2);assert.equal(f.xp,80);
  assert.throws(()=>act(done,'resolve'));validate(done);
 }
});
test('losing resets current streak but preserves highest title and fame; survivor earns XP',()=>{
 let found;
 for(let seed=1;seed<100;seed++){let s=winning(10);s.seed=seed;s.offer.power=1000;selected(s).fame=100;s.fame=150;s=act(s,'fight','balanced');if(!s.battle.dead&&!s.battle.win){found=s;break;}}
 assert.ok(found);assert.equal(found.battle.xpGain,80);const done=act(found,'resolve'),f=selected(done);
 assert.equal(f.streak,0);assert.equal(f.bestStreak,10);assert.equal(titleFor(f),'경기장의 지배자');assert.equal(f.fame,100);assert.equal(done.fame,150);assert.equal(f.xp,0);
});
test('payout depends on selected fighter and school fame; entry snapshot avoids same-match inflation',()=>{
 let s=winning(4);s.fame=100;selected(s).fame=75;
 assert.deepEqual(prize(s),{base:100,school:10,fighter:15,percent:25,total:125});assert.equal(view(s).fame,100);assert.equal(view(s).fighterFame,75);
 const other=act(s,'select',2);assert.equal(prize(other).total,110);assert.equal(schoolBonus(s),10);
 s=act(s,'fight','balanced');assert.equal(s.battle.reward,125);const done=act(s,'resolve');
 assert.equal(done.gold,s.gold+125);assert.equal(done.fame,145);assert.equal(selected(done).fame,120);
 done.offer={...s.offer};assert.equal(prize(done).total,130);
 done.fame=100000;selected(done).fame=100000;assert.equal(prize(done).percent,100);assert.equal(prize(done).total,200);
});
test('beasts occur after first completed match, have distinct mechanics and survive save reload',()=>{
 const kinds=new Set();
 for(let seed=1;seed<500;seed++){
  assert.equal(offered(seed).offer.kind,'human');
  let s=fresh(Math.imul(seed,2654435761)>>>0);selected(s).matches=1;s=elapse(s,DAY_MS*2);kinds.add(s.offer.kind);
  if(s.offer.kind!=='human'){assert.ok(s.offer.lethal);assert.ok(s.offer.reward>=173);}
 }
 assert.deepEqual([...kinds].sort(),['human','lion','tiger']);
 const human=act(winning(0,'human'),'fight','balanced'),lion=act(winning(0,'lion'),'fight','balanced'),tiger=act(winning(0,'tiger'),'fight','balanced');
 assert.equal(lion.battle.maxB,human.battle.maxB*1.25);assert.equal(tiger.battle.xpGain,200);assert.equal(lion.battle.deathChance,.85);
 assert.deepEqual(validate(tiger).battle,tiger.battle);assert.deepEqual(validate(lion).battle,lion.battle);
});
test('version two saves preserve roster, gear and precommitted battle payouts',()=>{
 const old=asLegacy(act(winning(0),'fight','balanced'));old.version=2;delete old.schoolName;
 for(const f of old.fighters)for(const k of ['level','xp','focus','streak','bestStreak','fame'])delete f[k];
 for(const k of ['baseReward','bonusPercent','xpGain','fameGain','streakAfter'])delete old.battle[k];
 const migrated=validate(old);assert.equal(migrated.version,6);assert.equal(migrated.schoolName,'모래와 철 훈련소');
 assert.deepEqual(selected(migrated).stats,selected(old).stats);assert.deepEqual(migrated.battle.frames,old.battle.frames);
 assert.equal(migrated.battle.reward,old.battle.reward);assert.equal(migrated.battle.xpGain,0);
 const done=act(migrated,'resolve');assert.equal(selected(done).xp,0);assert.equal(done.gold,old.gold+old.battle.reward);validate(done);
});
test('invalid progression and opponent data are rejected',()=>{
 for(const mutate of [s=>selected(s).level=31,s=>selected(s).xp=100,s=>selected(s).training='bad',s=>selected(s).streak=1,s=>selected(s).fame=-1,s=>s.schoolName='가']){
  const s=fresh();mutate(s);assert.throws(()=>validate(s));
 }
 const s=offered();s.offer.kind='dragon';assert.throws(()=>validate(s));
});
test('default basic training runs for every fighter and preserves partial days across reload',()=>{
 const s=fresh(2);assert.ok(s.fighters.every(f=>f.training==='basic'));
 const half=elapse(s,DAY_MS-1);assert.equal(half.day,1);assert.ok(half.fighters.every(f=>f.xp===0));
 const next=elapse(validate(JSON.parse(JSON.stringify(half))),1);
 assert.equal(next.day,2);assert.equal(next.dayProgressMs,0);assert.deepEqual(next.fighters.map(f=>f.xp),[10,10,10]);assert.deepEqual(next.fighters.map(f=>f.fatigue),[8,8,8]);
});
test('pause, unnamed schools, no survivors, offers and battles stop the shared clock',()=>{
 for(const s of [rawFresh(),act(fresh(),'pause'),{...fresh(),fighters:fresh().fighters.map(f=>({...f,dead:true}))},offered(),act(offered(),'fight','defend')]){
  assert.strictEqual(elapse(s,DAY_MS*10),s);
 }
 let s=act(fresh(),'pause');s=act(s,'pause');assert.equal(elapse(s,DAY_MS).day,2);
 assert.throws(()=>elapse(s,-1));assert.throws(()=>elapse(s,NaN));
});
test('offers stop long elapsed intervals and resolution/refusal do not consume a day',()=>{
 let s=elapse(fresh(),DAY_MS*20);assert.equal(s.day,3);assert.equal(s.dayProgressMs,0);assert.ok(s.offer);
 assert.ok(s.fighters.every(f=>f.xp===20));s=act(s,'decline');assert.equal(s.day,3);assert.equal(s.nextOfferDay,6);
 s=elapse(s,DAY_MS*3);assert.equal(s.day,6);assert.ok(s.offer);
 const fighting=act(s,'fight','balanced'),done=act(fighting,'resolve');assert.equal(done.day,6);assert.equal(done.nextOfferDay,9);
});
test('injured and exhausted fighters recover while other fighters train or earn gold',()=>{
 let s=fresh();selected(s).injury=2;selected(s).fatigue=60;s.fighters[1].fatigue=90;
 s=act(s,'assign',{id:3,training:'work'});const done=elapse(s,DAY_MS);
 assert.equal(done.fighters[0].injury,1);assert.equal(done.fighters[0].fatigue,22);assert.equal(done.fighters[0].xp,0);
 assert.equal(done.fighters[1].fatigue,52);assert.equal(done.fighters[1].xp,0);assert.equal(done.fighters[1].training,'basic');
 assert.equal(done.gold,118);assert.equal(done.fighters[2].fatigue,8);
 const again=elapse(done,DAY_MS);assert.equal(again.fighters[0].injury,0);assert.equal(again.fighters[1].xp,10);
});
test('battle XP uses the entry assignment; a former focus gives no bonus after switching to basic',()=>{
 let s=winning();s=act(s,'train','agility');s=act(s,'fight','defend');const before=structuredClone(selected(s).stats);
 assert.equal(s.battle.trainingAtEntry,'agility');assert.throws(()=>act(s,'assign',{id:1,training:'strength'}));
 const done=act(s,'resolve');assert.equal(selected(done).stats.agility,before.agility+3);assert.equal(selected(done).stats.strength,before.strength+2);
 let basic=act(act(winning(),'train','strength'),'train','basic');const stats=structuredClone(selected(basic).stats);
 basic=act(act(basic,'fight','defend'),'resolve');for(const key of Object.keys(stats))assert.equal(selected(basic).stats[key],stats[key]+2);
});
test('version three migration keeps levels, XP, streaks and pending rewards, assigning basic training',()=>{
 const old=asLegacy(act(winning(5),'fight','defend'));old.version=3;
 for(const key of ['dayProgressMs','nextOfferDay','paused'])delete old[key];
 for(const f of old.fighters){f.focus='skill';delete f.training;}
 delete old.battle.replayMs;delete old.battle.trainingAtEntry;
 const s=validate(old);assert.equal(s.version,6);assert.equal(s.dayProgressMs,0);assert.ok(s.fighters.every(f=>f.training==='basic'));
 assert.equal(selected(s).xp,selected(old).xp);assert.equal(selected(s).streak,5);assert.equal(s.battle.reward,old.battle.reward);assert.equal(s.battle.trainingAtEntry,'skill');
 const done=act(s,'resolve');assert.equal(selected(done).stats.skill,selected(old).stats.skill+3);assert.throws(()=>act(done,'resolve'));validate(done);
});
test('invalid clock and replay save data is rejected',()=>{
 for(const mutate of [s=>s.dayProgressMs=DAY_MS,s=>s.dayProgressMs=-1,s=>s.paused=1,s=>s.nextOfferDay=s.day,s=>selected(s).training='bad']){
  const s=fresh();mutate(s);assert.throws(()=>validate(s));
 }
 const s=act(offered(),'fight','defend');s.battle.replayMs=1e8;assert.throws(()=>validate(s));s.battle.replayMs=0;s.battle.trainingAtEntry='bad';assert.throws(()=>validate(s));
});

function asLegacy(s){ for(const key of ['format','units','results','champion'])delete s.battle[key]; return s; }
