import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,next,snapshot} from './engine.mjs';
import {activityFrames,changeChips,activityScene} from './activity.mjs';
test('animation frames reproduce actual committed outcomes without modifying the save',()=>{
 for(const plan of [['work','study','rest'],['network','overtime','side'],['study','study','study']]){
  const s=fresh('서하','female');s.money=0;s.energy=18;
  const event=next(next(s,'plan',plan),'month'),before=structuredClone(event);
  const frames=activityFrames(event.report);assert.equal(frames.length,4);
  assert.deepEqual(frames.at(-1).values,snapshot(event));assert.deepEqual(event,before);
  assert.deepEqual(activityFrames(event.report),frames);
  for(const [i,step] of event.report.steps.entries()){assert.equal(frames[i+1].key,step.key);assert.deepEqual(frames[i+1].changes,step.delta);}
 }
});
test('stress relief is beneficial and all activities have distinct scenes for either character',()=>{
 assert.match(changeChips({stress:-10}),/gain/);assert.match(changeChips({money:-35}),/cost/);assert.match(changeChips({money:25}),/\+25만/);
 for(const gender of ['female','male'])for(const key of ['payday','work','study','network','overtime','rest','side']){const html=activityScene({gender},key);assert.match(html,new RegExp('scene-'+key));assert.ok(!html.includes('undefined'));}
});
