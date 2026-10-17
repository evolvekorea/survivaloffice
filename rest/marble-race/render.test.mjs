import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace} from './physics.mjs';
import {drawTrack} from './render.mjs';
const ctx=new Proxy({measureText:s=>({width:[...s].length*7}),createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
test('dense 30-player nameplates never overlap on mobile or desktop',()=>{
 for(const width of [276,331,600,880])for(const camera of [0,2500,5900]){
  const race=createRace(Array.from({length:30},(_,i)=>`아주긴참가자이름${i+1}`),12);
  race.balls.forEach((b,i)=>{b.y=camera+100+(i%7)*25;b.x=80+(i%9)*50;});
  const labels=drawTrack(ctx,race,width,560,camera,false,0);
  assert.ok(labels.length>0);
  if(width<500)assert.ok(labels.length<=4);
  for(let i=0;i<labels.length;i++){
   const a=labels[i];assert.ok(a.x>=0&&a.x+a.w<=width&&a.y>=0&&a.y+a.h<=560);
   for(const b of labels.slice(i+1))assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);
  }
 }
});
