import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,flip,tick} from './engine.mjs';
test('every shuffle contains six pairs and completion records six attempts',()=>{
 for(let seed=1;seed<=50;seed++){
  let n=seed;const g=createGame(()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;});
  assert.equal(g.deck.length,12);
  for(let kind=0;kind<6;kind++){const pair=g.deck.flatMap((v,i)=>v===kind?[i]:[]);assert.equal(pair.length,2);assert.ok(flip(g,pair[0]));assert.ok(flip(g,pair[1]));}
  assert.equal(g.status,'won');assert.equal(g.moves,6);const snapshot=structuredClone(g);tick(g,100);assert.deepEqual(g,snapshot);assert.equal(flip(g,0),false);
 }
});
test('duplicate flip and a third flip during mismatch are rejected',()=>{
 const g=createGame(()=>.4);const a=0,b=g.deck.findIndex(x=>x!==g.deck[a]),c=Array.from({length:12},(_,i)=>i).find(i=>i!==a&&i!==b);
 flip(g,a);assert.equal(flip(g,a),false);flip(g,b);assert.equal(g.moves,1);assert.equal(flip(g,c),false);tick(g,.8);assert.equal(g.open.length,2);tick(g,.06);assert.equal(g.open.length,0);assert.equal(flip(g,c),true);
});
test('timeout closes play and invalid elapsed values cannot extend clock',()=>{
 const g=createGame();tick(g,-1);tick(g,NaN);assert.equal(g.remaining,90);tick(g,89);assert.equal(g.status,'playing');tick(g,2);assert.equal(g.remaining,0);assert.equal(g.status,'lost');assert.equal(flip(g,0),false);
});
