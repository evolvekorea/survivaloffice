import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,act,elapse,validate,DAY_MS,selected} from './engine.mjs';
import {battleView,battleDuration,ENTRY_MS} from './combat.mjs';
const named=seed=>act(fresh(seed),'nameSchool','황금 모래 훈련소');
function offered(a=1,e=1,seed=42){
 const s=elapse(named(seed),DAY_MS*2);
 Object.assign(s.offer,{allyCount:a,enemyCount:e,power:65,reward:200});
 if(e>1)s.offer.opponents=Array.from({length:e},(_,i)=>({kind:'human',name:'상대 '+i,power:65,weapon:'spear',tier:0,armor:0,tactic:'balanced'}));
 return s;
}
const enter=(s,tactic='balanced')=>act(s,'fight',{tactic,ids:s.fighters.slice(0,s.offer.allyCount).map(f=>f.id)});
test('one day is exactly 30 seconds; v4 fractional progress migrates proportionally once',()=>{
 assert.equal(DAY_MS,30000);const s=named(3);assert.equal(elapse(s,29999).day,1);assert.equal(elapse(s,30000).day,2);
 const old={...s,version:4,dayProgressMs:10000};delete old.schoolWins;delete old.ending;delete old.championAfter;
 const next=validate(old);assert.equal(next.dayProgressMs,15000);assert.deepEqual(validate(next),next);
});
test('every format has real participants, turn attacks, separate HP and exactly one team payout',()=>{
 for(const [a,e] of [[2,1],[3,1],[2,2],[1,2],[1,3]]){
  const s=enter(offered(a,e)),b=s.battle;assert.equal(b.units.length,a+e);assert.equal(b.results.length,a);
  assert.ok(new Set(b.frames.map(f=>f.actor)).size>=2);assert.equal(Object.keys(b.frames.at(-1).hp).length,a+e);
  assert.deepEqual(validate(s).battle,b);const done=act(s,'resolve');validate(done);
  assert.equal(done.gold,s.gold+b.reward);assert.equal(done.schoolWins,b.win?1:0);
  assert.deepEqual(done.fighters.map(f=>f.matches),done.fighters.map((_,i)=>i<a?1:0));
  assert.throws(()=>act(done,'resolve'));
 }
});
test('reject missing, duplicate, dead and incorrect leader participants',()=>{
 const s=offered(2,2);
 for(const ids of [[1],[1,1],[2,1],[1,99],[1,2,3]])assert.throws(()=>act(s,'fight',{tactic:'attack',ids}));
 s.fighters[1].dead=true;assert.throws(()=>act(s,'fight',{tactic:'attack',ids:[1,2]}));
});
test('tactics affect real damage and critical frequency; criticals and misses both occur',()=>{
 const totals={};
 for(const tactic of ['balanced','attack','defend']){
  const samples=[];for(let seed=1;seed<=150;seed++)samples.push(...enter(offered(1,1,seed),tactic).battle.frames.filter(f=>f.actor==='a1'));
  totals[tactic]={damage:samples.reduce((n,f)=>n+f.damage,0)/samples.length,crit:samples.filter(f=>f.critical).length/samples.length};
  assert.ok(samples.some(f=>f.damage===0));assert.ok(samples.some(f=>f.critical));
 }
 assert.ok(totals.attack.damage>totals.balanced.damage);assert.ok(totals.balanced.damage>totals.defend.damage);
 assert.ok(totals.attack.crit>totals.balanced.crit);assert.ok(totals.balanced.crit>totals.defend.crit);
 // Same seed, first enemy hit: defenses change received damage before any subsequent decisions.
 const hit=t=>enter(offered(1,1,10),t).battle.frames.find(f=>f.actor==='e0').damage;
 assert.ok(hit('attack')>hit('balanced'));assert.ok(hit('balanced')>hit('defend'));
});
test('team playback updates individual HP only at impact and reload resumes identically',()=>{
 const s=enter(offered(2,2)),b=s.battle,index=b.frames.findIndex(f=>f.damage>0),first=b.frames[index];
 const before=battleView(b,ENTRY_MS+index*1100+527),after=battleView(b,ENTRY_MS+index*1100+528);
 assert.notDeepEqual(before.hp,after.hp);assert.deepEqual(after.hp,first.hp);
 b.replayMs=5234;assert.deepEqual(battleView(validate(s).battle),battleView(b));
 assert.deepEqual(battleView(b,battleDuration(b)).hp,b.frames.at(-1).hp);
});
test('corrupt multi-fighter HP, participants and results are rejected',()=>{
 const s=enter(offered(2,2));
 for(const mutate of [b=>b.units[0].maxHp=0,b=>b.frames[0].hp.a1=-1,b=>b.frames[0].actor='missing',b=>b.results[1].fighterId=1,b=>b.results[1].xpGain=-1,b=>b.frames[0].damage=-1]){const bad=structuredClone(s);mutate(bad.battle);assert.throws(()=>validate(bad));}
});
test('30th consecutive team win schedules champion in three days, refusal preserves rights and retries after nine days',()=>{
 let s=offered(2,1);s.schoolWins=39;s.schoolStreak=29;s.schoolBestStreak=29;for(const f of s.fighters){f.stats={strength:100,agility:100,stamina:100,skill:100};f.armor=4;f.tier=3;}
 s=enter(s);assert.ok(s.battle.win);s=act(s,'resolve');assert.equal(s.schoolWins,40);assert.equal(s.schoolStreak,30);assert.equal(s.ending,null);assert.equal(s.nextOfferDay,s.day+3);
 s=elapse(s,DAY_MS*3);assert.ok(s.offer.champion);assert.equal(s.offer.allyCount,1);
 const day=s.day,rights=selected(s).declines;s=act(s,'decline');assert.equal(selected(s).declines,rights);assert.equal(s.championAfter,day+9);
 s=elapse(s,DAY_MS*3);assert.equal(s.offer.champion,false);
 s=act(enter(s),'resolve');s=elapse(s,DAY_MS*3);assert.equal(s.offer.champion,false);
 s=act(enter(s),'resolve');s=elapse(s,DAY_MS*3);assert.ok(s.offer.champion);validate(s);
});
test('champion victory produces persistent named ending, stops time and cannot pay twice',()=>{
 let s=named(25);s.schoolWins=30;s.schoolStreak=30;s.schoolBestStreak=30;const f=selected(s);f.stats={strength:100,agility:100,stamina:100,skill:100};f.tier=3;f.armor=4;
 s=elapse(s,DAY_MS*2);s=enter(s,'defend');assert.ok(s.battle.win);
 const reward=s.battle.reward,gold=s.gold;s=act(s,'resolve');
 assert.equal(s.gold,gold+reward);assert.equal(s.ending.schoolName,'황금 모래 훈련소');assert.equal(s.ending.championName,f.name);assert.equal(s.ending.wins,31);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);assert.strictEqual(elapse(s,DAY_MS*5),s);
 for(const action of ['resolve','train','nameSchool','pause','recruit'])assert.throws(()=>act(s,action,'test'));
});
test('champion loss resets eligibility; replacement gladiators must build a new streak',()=>{
 let s=named(2);s.schoolWins=30;s.schoolStreak=30;s.schoolBestStreak=30;s=elapse(s,DAY_MS*2);s=enter(s);assert.equal(s.battle.win,false);s=act(s,'resolve');assert.equal(s.ending,null);assert.equal(s.schoolWins,30);assert.equal(s.schoolLosses,1);assert.equal(s.schoolStreak,0);assert.equal(s.schoolBestStreak,30);
 if(selected(s).dead)s=act(s,'successor');s=elapse(s,DAY_MS*3);assert.equal(s.offer.champion,false);validate(s);
});
test('a team can win while an individual is knocked out; injury and XP belong to each participant',()=>{
 let found;
 for(let seed=1;seed<500;seed++){
  const s=offered(2,1,seed);s.fighters[1].stats={strength:100,agility:100,stamina:100,skill:100};s.fighters[1].armor=4;s.offer.power=270;s.offer.lethal=true;
  const battle=enter(s);if(battle.battle.win&&battle.battle.results[0].injury){found=battle;break;}
 }
 assert.ok(found);const done=act(found,'resolve');validate(done);
 assert.equal(done.fighters[0].injury,found.battle.results[0].injury);assert.equal(done.fighters[1].dead,false);assert.equal(done.schoolWins,1);
});
test('generated invitations include all six formats and never demand unavailable allies',()=>{
 const formats=new Set();
 for(let seed=1;seed<=180;seed++){
  let s=named(Math.imul(seed,2654435761)>>>0);selected(s).matches=3;s=elapse(s,DAY_MS*2);validate(s);
  formats.add(s.offer.allyCount+':'+s.offer.enemyCount);
  if(seed<10){const b=enter(s);validate(b);validate(act(b,'resolve'));}
 }
 assert.deepEqual([...formats].sort(),['1:1','1:2','1:3','2:1','2:2','3:1']);
 let solo=named(3);solo.fighters[1].dead=true;solo.fighters[2].dead=true;selected(solo).matches=8;
 solo=elapse(solo,DAY_MS*2);assert.equal(solo.offer.allyCount,1);
});
test('actual v4 pending duel keeps precommitted payout, focused XP and replay position',()=>{
 let old=named(4);old.version=4;old.schoolName='기존 훈련소';selected(old).training='skill';
 old.dayProgressMs=5000;delete old.schoolWins;delete old.championAfter;delete old.ending;
 old.offer={name:'기존 상대',kind:'human',power:60,weapon:'sword',tier:0,armor:0,reward:80,lethal:false};
 old.battle={fighterId:1,replayMs:2450,trainingAtEntry:'skill',win:true,dead:false,injury:0,reward:80,baseReward:80,bonusPercent:0,xpGain:160,fameGain:12,streakAfter:1,maxA:95,maxB:147,frames:[{a:77,b:0,dealt:147,taken:18}],tactic:'defend',opponent:'기존 상대',deathChance:.08};
 const s=validate(old);assert.deepEqual(s.battle,old.battle);assert.equal(s.dayProgressMs,7500);
 const done=act(s,'resolve');assert.equal(done.gold,180);assert.equal(done.schoolWins,1);assert.equal(selected(done).stats.skill,13);assert.equal(selected(done).stats.strength,12);validate(done);
});

test('lifetime wins alone never unlock the championship',()=>{
 for(const streak of [0,1,29]){
  const s=named(42);s.schoolWins=80;s.schoolLosses=9;s.schoolStreak=streak;s.schoolBestStreak=29;
  const next=elapse(s,DAY_MS*2);assert.equal(next.offer.champion,false);validate(next);
 }
});
test('a team defeat counts once, resets school streak and preserves best streak and individual losses',()=>{
 let s=offered(2,2);s.schoolWins=48;s.schoolLosses=3;s.schoolStreak=29;s.schoolBestStreak=29;
 s.offer.opponents.forEach(e=>e.power=10000);s=enter(s);assert.equal(s.battle.win,false);
 const done=act(s,'resolve');assert.equal(done.schoolWins,48);assert.equal(done.schoolLosses,4);assert.equal(done.schoolStreak,0);assert.equal(done.schoolBestStreak,29);
 assert.deepEqual(done.fighters.map(f=>f.matches-f.wins),[1,1,0]);assert.deepEqual(validate(done),done);assert.throws(()=>act(done,'resolve'));
});
test('declining an invitation is neither a loss nor a broken streak',()=>{
 const s=offered();s.schoolWins=20;s.schoolStreak=12;s.schoolBestStreak=15;s.schoolLosses=3;
 const done=act(s,'decline');assert.equal(done.schoolLosses,3);assert.equal(done.schoolStreak,12);validate(done);
});
function asV5(s){
 s=structuredClone(s);s.version=5;
 for(const key of ['schoolLosses','schoolStreak','schoolBestStreak','recordStartDay','legacyChampion'])delete s[key];
 if(s.ending)for(const key of ['losses','schoolStreak','schoolBestStreak','recordStartDay'])delete s.ending[key];
 return s;
}
function championReady(){
 const s=named(25);s.schoolWins=40;s.schoolStreak=30;s.schoolBestStreak=30;selected(s).stats={strength:100,agility:100,stamina:100,skill:100};selected(s).armor=4;selected(s).tier=3;
 return elapse(s,DAY_MS*2);
}
test('v5 migration preserves fighter records but starts unknown school streak/losses at the recorded update day',()=>{
 const old=asV5(championReady());selected(old).wins=18;selected(old).matches=23;selected(old).streak=7;selected(old).bestStreak=9;
 const s=validate(old);assert.equal(s.version,6);assert.equal(s.schoolWins,40);assert.equal(s.schoolStreak,0);assert.equal(s.schoolLosses,0);assert.equal(s.recordStartDay,s.day);assert.deepEqual(s.fighters,old.fighters);
 assert.equal(s.offer,null);assert.equal(s.nextOfferDay,s.day+3);assert.deepEqual(validate(s),s);assert.equal(elapse(s,DAY_MS*3).offer.champion,false);
});
test('already committed v5 championship and completed ending survive the rule change',()=>{
 const battle=enter(championReady(),'defend');assert.ok(battle.battle.win);
 const old=asV5(battle);old.battle.deathChance=.35;
 const migrated=validate(old);assert.deepEqual(migrated.battle,old.battle);assert.equal(migrated.legacyChampion,true);
 const done=act(migrated,'resolve');assert.ok(done.ending);assert.equal(done.schoolWins,41);assert.equal(done.schoolStreak,1);validate(done);
 const oldEnding=asV5(act(battle,'resolve')),ending=validate(oldEnding);assert.equal(ending.ending.championName,oldEnding.ending.championName);assert.equal(ending.ending.wins,oldEnding.ending.wins);assert.equal(ending.legacyChampion,true);validate(ending);
});
test('fatality rates increase to 60%/85%, with survivors injured and dead fighters receiving no XP',()=>{
 const deaths=[];
 for(const lethal of [false,true]){
  let count=0;
  for(let i=1;i<=600;i++){
   const s=offered(1,1,Math.imul(i,2654435761)>>>0);s.offer.power=10000;s.offer.lethal=lethal;
   const b=enter(s).battle;assert.equal(b.win,false);assert.equal(b.deathChance,lethal?.85:.6);
   if(b.dead){count++;assert.equal(b.xpGain,0);}else assert.ok([2,4].includes(b.injury));
  }
  deaths.push(count/600);
 }
 assert.ok(deaths[0]>.54&&deaths[0]<.66);assert.ok(deaths[1]>.79&&deaths[1]<.91);assert.ok(deaths[1]>deaths[0]);
});
test('invalid school loss and streak saves are rejected',()=>{
 for(const mutate of [s=>s.schoolLosses=-1,s=>s.schoolStreak=1,s=>s.schoolBestStreak=1,s=>s.recordStartDay=s.day+1,s=>s.legacyChampion=true]){const s=named(1);mutate(s);assert.throws(()=>validate(s));}
});
