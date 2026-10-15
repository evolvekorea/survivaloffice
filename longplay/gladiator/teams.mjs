export const DEATH_CHANCE={regular:.6,lethal:.85};
// Battle snapshots are committed at entry, so reloading never rerolls a match.
export const TACTICS={balanced:{name:'균형',attack:1,received:1,crit:.08,description:'공격·방어 균형 · 치명타 8%'},attack:{name:'맹공',attack:1.23,received:1.2,crit:.14,description:'공격 +23% · 받는 피해 +20% · 치명타 14%'},defend:{name:'수비',attack:.85,received:.76,crit:.05,description:'공격 −15% · 받는 피해 −24% · 치명타 5%'}};
export function simulateTeams(s,ids,tactic,{random,power,prize,battleXP,fameFor,WEAPONS}){
 const o=s.offer,allies=ids.map(id=>s.fighters.find(f=>f.id===id)),enemyCount=o.enemyCount||1;
 const units=allies.map(f=>({key:'a'+f.id,side:'ally',fighterId:f.id,name:f.name,kind:'human',weapon:f.weapon,tier:f.tier,armor:f.armor,maxHp:65+f.stats.stamina*3+f.armor*7,power:power(f),agility:f.stats.agility,tactic}));
 for(let i=0;i<enemyCount;i++){
  const e=o.opponents?.[i]||o;
  units.push({key:'e'+i,side:'enemy',name:e.name,kind:e.kind,weapon:e.weapon,tier:e.tier,armor:e.armor,maxHp:(75+e.power*1.2)*(e.kind==='lion'?1.25:1),power:e.power,agility:10,tactic:e.tactic||'balanced'});
 }
 const hp=Object.fromEntries(units.map(u=>[u.key,u.maxHp])),frames=[];
 const sum=side=>units.filter(u=>u.side===side).reduce((n,u)=>n+hp[u.key],0);
 const maxA=sum('ally'),maxB=sum('enemy');
 // Interleave sides; every living participant gets a turn before the next round.
 const a=units.filter(u=>u.side==='ally'),e=units.filter(u=>u.side==='enemy'),order=[];
 for(let i=0;i<Math.max(a.length,e.length);i++){if(a[i])order.push(a[i]);if(e[i])order.push(e[i]);}
 for(let round=0;round<24&&sum('ally')>0&&sum('enemy')>0;round++)for(const actor of order){
  if(hp[actor.key]<=0)continue;
  const targets=units.filter(u=>u.side!==actor.side&&hp[u.key]>0);if(!targets.length)break;
  const target=targets[Math.floor(random(s)*targets.length)],at=TACTICS[actor.tactic],dt=TACTICS[target.tactic];
  const evade=target.kind==='tiger'?.18:target.side==='ally'?.08+Math.min(.18,target.agility*.002):.12;
  const hit=random(s)>evade,critical=hit&&random(s)<at.crit;
  const base=(10+actor.power*.17)*(actor.kind==='tiger'?1.13:actor.side==='ally'?WEAPONS[actor.weapon].speed:1);
  const damage=hit?Math.max(2,Math.round((base*(.75+random(s)*.5)*at.attack*dt.received-target.armor*1.7)*(critical?1.7:1))):0;
  hp[target.key]=Math.max(0,hp[target.key]-damage);
  frames.push({actor:actor.key,target:target.key,damage,critical,hp:{...hp},a:sum('ally'),b:sum('enemy'),dealt:actor.side==='ally'?damage:0,taken:actor.side==='enemy'?damage:0});
 }
 const win=sum('enemy')<=0||(sum('ally')>0&&sum('ally')/maxA>=sum('enemy')/maxB),deathChance=o.lethal?DEATH_CHANCE.lethal:DEATH_CHANCE.regular;
 const results=allies.map(f=>{
  // A knocked-out teammate still risks injury/death even when the team wins.
  const down=hp['a'+f.id]<=0,dead=(!win||down)&&random(s)<deathChance,injury=(!win||down)?(random(s)<.45?2:4):0;
  const streakAfter=win&&!dead?f.streak+1:0;
  return {fighterId:f.id,trainingAtEntry:f.training,dead,injury,xpGain:dead?0:battleXP(o.kind,win),streakAfter,fameGain:win&&!dead?fameFor(streakAfter):0};
 });
 const lead=results[0],quote=prize(s,allies[0]);
 return {...lead,format:'teams',units,results,fighterId:ids[0],replayMs:0,win,reward:win?quote.total:Math.floor(quote.total*.2),baseReward:quote.base,bonusPercent:quote.percent,maxA,maxB,frames,tactic,opponent:o.name,deathChance,champion:!!o.champion};
}
export function checkTeamBattle(s){
 const b=s.battle,fail=()=>{throw Error('다인전 저장 기록이 손상되었습니다.');},num=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max,int=(v,min,max)=>Number.isInteger(v)&&num(v,min,max);
 if(!s.offer||!Array.isArray(b.units)||b.units.length<2||b.units.length>6||!Array.isArray(b.results)||!Array.isArray(b.frames)||!b.frames.length||b.frames.length>144||typeof b.champion!=='boolean'||!int(b.reward,0,10000000)||![.08,.35,DEATH_CHANCE.regular,DEATH_CHANCE.lethal].includes(b.deathChance)||typeof b.opponent!=='string'||b.opponent.length>60)fail();
 const keys=b.units.map(u=>u.key),a=b.units.filter(u=>u.side==='ally'),e=b.units.filter(u=>u.side==='enemy');
 if(new Set(keys).size!==keys.length||a.length!==(s.offer.allyCount||1)||e.length!==(s.offer.enemyCount||1)||b.results.length!==a.length||a[0]?.fighterId!==s.selectedId)fail();
 for(const u of b.units)if(!['ally','enemy'].includes(u.side)||!['human','tiger','lion'].includes(u.kind)||typeof u.name!=='string'||u.name.length>60||!['sword','spear','axe'].includes(u.weapon)||!int(u.tier,0,3)||!int(u.armor,0,4)||!num(u.maxHp,1,1e7)||!num(u.power,1,2e6)||!num(u.agility,0,100)||!Object.hasOwn(TACTICS,u.tactic))fail();
 if(new Set(a.map(u=>u.fighterId)).size!==a.length)fail();
 for(const [i,r] of b.results.entries()){
  const f=s.fighters.find(f=>f.id===r.fighterId);
  if(!f||f.dead||r.fighterId!==a[i].fighterId||typeof r.dead!=='boolean'||!int(r.injury,0,4)||!int(r.xpGain,0,200)||!int(r.fameGain,0,1000000)||r.streakAfter!==(b.win&&!r.dead?f.streak+1:0)||r.trainingAtEntry!==f.training||(r.dead&&r.xpGain!==0)||(!b.win&&r.fameGain!==0))fail();
 }
 let previous=Object.fromEntries(b.units.map(u=>[u.key,u.maxHp]));
 for(const frame of b.frames){
  const actor=b.units.find(u=>u.key===frame.actor),target=b.units.find(u=>u.key===frame.target);
  if(!actor||!target||actor.side===target.side||previous[actor.key]<=0||previous[target.key]<=0||!int(frame.damage,0,1e7)||typeof frame.critical!=='boolean'||(frame.critical&&!frame.damage)||!frame.hp)fail();
  for(const u of b.units)if(frame.hp[u.key]!==Math.max(0,previous[u.key]-(u.key===target.key?frame.damage:0)))fail();
  if(frame.a!==a.reduce((n,u)=>n+frame.hp[u.key],0)||frame.b!==e.reduce((n,u)=>n+frame.hp[u.key],0)||frame.dealt!==(actor.side==='ally'?frame.damage:0)||frame.taken!==(actor.side==='enemy'?frame.damage:0))fail();
  previous=frame.hp;
 }
 if(b.maxA!==a.reduce((n,u)=>n+u.maxHp,0)||b.maxB!==e.reduce((n,u)=>n+u.maxHp,0)||!Object.hasOwn(TACTICS,b.tactic))fail();
 const last=b.frames.at(-1),won=last.b<=0||(last.a>0&&last.a/b.maxA>=last.b/b.maxB);
 if(b.win!==won||b.champion!==!!s.offer.champion)fail();
 for(const key of ['fighterId','trainingAtEntry','dead','injury','xpGain','streakAfter','fameGain'])if(b[key]!==b.results[0][key])fail();
}
