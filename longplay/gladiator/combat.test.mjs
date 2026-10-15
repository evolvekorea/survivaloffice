import test from 'node:test';
import assert from 'node:assert/strict';
import {battleView,battleDuration,ENTRY_MS,ROUND_MS} from './combat.mjs';
const battle={maxA:100,maxB:100,replayMs:0,frames:[{a:91,b:80,dealt:20,taken:9},{a:91,b:80,dealt:0,taken:0},{a:91,b:0,dealt:80,taken:0}]};
test('entry and attacks change HP only at their own impact time',()=>{
 const entry=battleView(battle,0);assert.equal(entry.phase,'entry');assert.equal(entry.entry,0);assert.equal(entry.a,100);assert.equal(entry.b,100);
 let v=battleView(battle,ENTRY_MS+ROUND_MS*.2);assert.equal(v.phase,'player');assert.equal(v.b,100);
 v=battleView(battle,ENTRY_MS+ROUND_MS*.4);assert.equal(v.b,80);assert.equal(v.a,100);
 v=battleView(battle,ENTRY_MS+ROUND_MS*.8);assert.equal(v.a,91);assert.equal(v.b,80);assert.equal(v.phase,'enemy');
});
test('misses retain HP and lethal attacks cannot produce a counterattack',()=>{
 let v=battleView(battle,ENTRY_MS+ROUND_MS*1.8);assert.equal(v.dealt,0);assert.equal(v.taken,0);assert.equal(v.a,91);assert.equal(v.b,80);
 v=battleView(battle,ENTRY_MS+ROUND_MS*2.8);assert.equal(v.b,0);assert.equal(v.a,91);assert.notEqual(v.phase,'enemy');
});
test('replay checkpoints are deterministic and final state matches the saved outcome',()=>{
 const at=ENTRY_MS+ROUND_MS*1.4, saved=JSON.parse(JSON.stringify({...battle,replayMs:at}));
 assert.deepEqual(battleView(saved),battleView(battle,at));
 const done=battleView(battle,battleDuration(battle));assert.equal(done.complete,true);assert.equal(done.a,91);assert.equal(done.b,0);assert.equal(done.round,3);
 assert.deepEqual(done,battleView(battle,battleDuration(battle)+50000));
});
