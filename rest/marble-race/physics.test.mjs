import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace,standings,validateNames,STEP,FINISH} from './physics.mjs';

const names=n=>Array.from({length:n},(_,i)=>`참가자 ${i+1}`);
function complete(race){
 for(let frame=0;frame<180/STEP&&!race.done;frame++){
  stepRace(race);
  for(const b of race.balls)assert.ok([b.x,b.y,b.vx,b.vy].every(Number.isFinite),'physics must stay finite');
 }
 assert.ok(race.done,`all balls must finish: count=${race.balls.length}, seed=${race.seed}`);
 return race;
}
test('participant limits, blank and duplicate names, trimming',()=>{
 assert.deepEqual(validateNames([' 민수 ','지은']),['민수','지은']);
 for(const invalid of [[],['one'],names(31),['','two'],['same',' same '],['a'.repeat(13),'two']])assert.throws(()=>validateNames(invalid));
 assert.equal(validateNames(names(30)).length,30);
});
test('every supported player count finishes over multiple starting configurations',()=>{
 for(let count=2;count<=30;count++)for(let seed=1;seed<=8;seed++){
  const race=complete(createRace(names(count),seed));
  assert.equal(new Set(race.finished).size,count);
  const order=standings(race);
  assert.deepEqual(race.finished,order.map(b=>b.id));
  for(let i=0;i<count;i++){
   assert.ok(order[i].y>=FINISH);
   assert.ok(order[i].finishTime>0&&order[i].finishTime<=race.time);
   if(i)assert.ok(order[i].finishTime>=order[i-1].finishTime);
  }
 }
});
test('names do not alter physics or finishing order',()=>{
 const a=complete(createRace(names(8),12345)),b=complete(createRace(names(8).map(n=>'다른 '+n),12345));
 assert.deepEqual(a.finished,b.finished);
 assert.deepEqual(a.balls.map(b=>b.finishTime),b.balls.map(b=>b.finishTime));
});
test('1x and 4x fixed-step batches have identical results, finished races stay frozen',()=>{
 const a=complete(createRace(names(30),8765)),b=createRace(names(30),8765);
 while(!b.done)for(let i=0;i<4;i++)stepRace(b);
 assert.deepEqual(b,a);
 const frozen=structuredClone(b);stepRace(b);assert.deepEqual(b,frozen);
});
test('a ball balanced on a bumper is freed without teleporting',()=>{
 const race=createRace(names(2),7),b=race.balls[0];
 b.x=75;b.y=341;b.vx=0;b.vy=0;b.lastY=b.y;
 for(let i=0;i<8/STEP;i++)stepRace(race);
 assert.ok(b.y>400,'bumper vibration must release the ball');
});
test('30 shuffled starting positions are distinct and do not overlap',()=>{
 const race=createRace(names(30),9);
 for(let i=0;i<30;i++)for(let j=i+1;j<30;j++)assert.ok(Math.hypot(race.balls[i].x-race.balls[j].x,race.balls[i].y-race.balls[j].y)>=22);
 assert.equal(new Set(race.balls.map(b=>b.color)).size,30);
});
test('spring launches upward only once per ball and pad, without teleporting',()=>{
 const race=createRace(names(2),9),b=race.balls[0],pad=race.course.springs[0];
 b.x=pad.x;b.y=pad.y-pad.r-10;b.vy=200;b.vx=0;
 const before=b.y;stepRace(race);
 assert.ok(b.vy<-700);assert.ok(Math.abs(b.y-before)<5);assert.deepEqual(b.springsHit,[pad.id]);
 assert.equal(race.events[0].id,b.id);
 b.x=pad.x;b.y=pad.y-pad.r-10;b.vy=200;b.vx=0;stepRace(race);
 assert.ok(b.vy>-700);assert.equal(race.events.length,1);
});
test('active updraft reverses a falling ball',()=>{
 const race=createRace(names(2),9),b=race.balls[0];race.phase=Math.PI/2;b.x=300;b.y=6200;b.vy=80;
 for(let i=0;i<30;i++)stepRace(race);
 assert.ok(b.vy<0);assert.ok(b.boostUntil>race.time);
});
