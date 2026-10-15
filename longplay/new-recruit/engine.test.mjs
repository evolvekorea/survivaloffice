import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,next,validate,eligibleEndings,availableOutfits,EVENTS,ENDINGS} from './engine.mjs';
function choiceFor(s,preferred=[]){const e=EVENTS[s.month-1];return e.choices.findIndex(c=>preferred.includes(c.flag)&&(!c.need||Object.entries(c.need).every(([k,v])=>(s.stats[k]??s[k])>=v)));}
function play(plan,preferred=[],gender='female'){
 let s=fresh('서하',gender);
 for(let i=0;i<36;i++){s=next(s,'plan',plan);s=next(s,'month');const index=choiceFor(s,preferred);const safe=EVENTS[s.month-1].choices.findIndex(c=>!c.need||Object.entries(c.need).every(([k,v])=>(s.stats[k]??s[k])>=v));s=next(s,'choose',index<0?safe:index);validate(s);s=next(s,'continue');validate(s);}
 return s;
}
test('male and female have identical starting resources and opportunity',()=>{
 const a=fresh('서하','female'),b=fresh('서하','male');b.gender='female';assert.deepEqual(a,b);assert.throws(()=>fresh(' ','male'));assert.throws(()=>fresh('가'.repeat(13),'female'));assert.throws(()=>fresh('이름','other'));
});
test('every month has an event and a free available choice',()=>{assert.equal(EVENTS.length,36);assert.equal(new Set(EVENTS.map(e=>e.title)).size,36);for(const e of EVENTS){assert.equal(e.choices.length,2);assert.ok(e.choices.some(c=>!c.need));}});
test('planning is free and only month action spends resources',()=>{const s=fresh('서하','female'),n=next(s,'plan',['study','rest','work']);assert.deepEqual(n.stats,s.stats);assert.equal(n.money,s.money);assert.equal(n.month,1);assert.equal(s.plan[0],'work');assert.throws(()=>next(s,'plan',['work']));assert.throws(()=>next(s,'plan',['bad','rest','rest']));});
test('monthly payment happens once and reload resumes committed choices',()=>{let s=next(fresh('태오','male'),'month');assert.equal(s.phase,'event');const saved=validate(JSON.parse(JSON.stringify(s)));assert.deepEqual(saved,s);assert.throws(()=>next(saved,'month'));s=next(saved,'choose',0);assert.throws(()=>next(s,'choose',1));assert.equal(s.phase,'report');assert.deepEqual(validate(s),s);s=next(s,'continue');assert.equal(s.month,2);assert.equal(s.history.length,1);assert.throws(()=>next(s,'continue'));});
test('exhaustion and insufficient budget replace activities with recovery, without negative money',()=>{let s=fresh('서하','female');s.energy=0;s.stress=99;s.money=0;s.plan=['overtime','study','study'];s=next(s,'month');assert.equal(s.report.steps[0].key,'rest');assert.ok(s.burnouts>=1);assert.ok(s.money>=0);assert.ok(s.report.steps.some(x=>x.planned==='study'&&x.key==='rest'));validate(s);});
test('skilled workers spend less energy on the same task',()=>{const s=fresh('서하','female');s.plan=['work','rest','rest'];const trained=structuredClone(s);trained.stats.work=90;assert.ok(next(trained,'month').report.steps[0].delta.energy>next(s,'month').report.steps[0].delta.energy);});
test('event requirements cannot be bypassed and free choice remains usable',()=>{let s=play(['rest','rest','rest']);assert.ok(s);let t=fresh('서하','female');for(let m=1;m<7;m++){t=next(next(t,'month'),'choose',1);t=next(t,'continue');}t=next(t,'month');t.money=0;assert.throws(()=>next(t,'choose',0));assert.equal(next(t,'choose',1).phase,'report');});
test('quarter review grants bonus once and later rank raises salary',()=>{let s=fresh('서하','female');for(let i=0;i<6;i++){s=next(s,'plan',['work','network','rest']);s=next(s,'month');s=next(s,'choose',0);s=next(s,'continue');}assert.ok(s.rank>=1);const t=next(s,'month');assert.equal(t.report.salary,210+s.rank*25);assert.throws(()=>next(t,'continue'));});
test('all six endings are reachable through complete games, without fabricated stats',()=>{
 const runs=[play(['work','network','rest'],['lead']),play(['study','study','rest'],['learn','certificate']),play(['study','network','rest'],['career']),play(['side','work','rest'],['business']),play(['work','rest','rest'],['balance'])];
 const reached=new Set(runs.flatMap(eligibleEndings));assert.deepEqual([...reached].sort(),Object.keys(ENDINGS).sort());
 for(const s of runs){assert.equal(s.phase,'ending');assert.equal(s.month,36);assert.equal(s.history.length,36);for(const key of eligibleEndings(s)){const done=next(s,'ending',key);assert.equal(done.phase,'finished');assert.deepEqual(validate(JSON.parse(JSON.stringify(done))),done);assert.throws(()=>next(done,'month'));assert.throws(()=>next(done,'ending',key));}}
});
test('entire identical lives are equal for both character genders',()=>{const a=play(['work','study','rest'],['learn'],'female'),b=play(['work','study','rest'],['learn'],'male');b.gender='female';assert.deepEqual(a,b);});
test('wardrobe is cosmetic and unlocks by year',()=>{const s=fresh('서하','male');assert.deepEqual(availableOutfits(s),['daily']);assert.throws(()=>next(s,'outfit','leader'));const done=play(['work','rest','rest']);const dressed=next(done,'outfit','leader');assert.deepEqual(dressed.stats,done.stats);assert.equal(dressed.money,done.money);assert.equal(dressed.outfit,'leader');validate(dressed);});
test('malformed saves, phase mismatches and impossible histories are rejected',()=>{
 for(const mutate of [s=>s.energy=-1,s=>s.month=37,s=>s.gender='other',s=>s.flags.lead=Infinity,s=>s.history=[{}],s=>s.phase='ending',s=>s.plan=['bad','rest','work'],s=>s.outfit='leader',s=>s.name='<'.repeat(13),s=>s.stats.work=101]){const s=fresh('서하','female');mutate(s);assert.throws(()=>validate(s));}
 const pending=next(fresh('서하','female'),'month');pending.report.steps[0].delta={work:0};assert.throws(()=>validate(pending));
});
