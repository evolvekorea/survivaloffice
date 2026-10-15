import {ACTIONS,EVENTS,ENDINGS} from './data.mjs';
export {ACTIONS,EVENTS,ENDINGS};
export const MONTHS=36;
const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(v)));
const flags=['kind','balance','learn','lead','build','business','trust','certificate','career','change'];
export function fresh(name,gender){
 name=String(name).trim();if(name.length<1||name.length>12)throw Error('이름은 1~12자로 입력해 주세요.');
 if(!['male','female'].includes(gender))throw Error('캐릭터를 선택해 주세요.');
 return {version:2,name,gender,month:1,phase:'plan',stats:{work:18,expert:15,social:15},energy:85,stress:10,money:120,rank:0,flags:Object.fromEntries(flags.map(k=>[k,0])),burnouts:0,plan:[null,null,null],outfit:'daily',report:null,history:[],ending:null,revision:0};
}
export function season(month){return ['봄','여름','가을','겨울'][Math.floor((month-1)%12/3)];}
export function dateLabel(s){return `${Math.floor((s.month-1)/12)+1}년 차 · ${(s.month-1)%12+1}개월째`;}
export function rankLabel(s){return ['신입사원','사원','선임','책임'][s.rank];}
export function availableOutfits(s){return ['daily',...(s.month>=13?['smart']:[]),...(s.month>=25?['leader']:[])];}
export function apply(s,effect){for(const [key,value] of Object.entries(effect)){if(key in s.stats)s.stats[key]=clamp(s.stats[key]+value);else if(key==='money')s.money=clamp(s.money+value,0,100000);else if(['energy','stress'].includes(key))s[key]=clamp(s[key]+value);}}
export function canChoose(s,choice){return !choice.need||Object.entries(choice.need).every(([k,v])=>(k in s.stats?s.stats[k]:s[k])>=v);}
export function next(s,action,arg){
 const n=structuredClone(s);n.revision++;
 if(action==='outfit'){if(!availableOutfits(n).includes(arg))throw Error('아직 열리지 않은 옷입니다.');n.outfit=arg;return n;}
 if(action==='plan'){if(n.phase!=='plan')throw Error('이번 달을 마친 뒤 일정을 바꿔 주세요.');if(!Array.isArray(arg)||arg.length!==3||arg.some(k=>k!==null&&!Object.hasOwn(ACTIONS,k)))throw Error('세 개의 일정을 골라 주세요.');n.plan=[...arg];return n;}
 if(action==='month'){
  if(n.phase!=='plan')throw Error('이미 진행한 달입니다. 화면의 이야기를 먼저 확인해 주세요.');
  if(n.plan.some(k=>!Object.hasOwn(ACTIONS,k)))throw Error('빈칸 없이 일정 세 개를 모두 골라 주세요.');
  const before=snapshot(n),salary=210+n.rank*25,living=180;
  n.money+=salary-living;const steps=[];
  for(const key of n.plan){
   const a=ACTIONS[key],exhausted=key!=='rest'&&(n.energy<15||n.stress>=85),unaffordable=n.money+(a.effect.money||0)<0;
   const actual=exhausted||unaffordable?'rest':key,effect={...ACTIONS[actual].effect},stepBefore=snapshot(n);
   if(exhausted)n.burnouts++;
   for(const stat of Object.keys(n.stats))if(effect[stat])effect[stat]=Math.max(1,Math.round(effect[stat]*(n.stats[stat]>=60?.65:1)*(n.stress>60?.7:1)));
   if(effect.energy<0&&['work','overtime'].includes(actual))effect.energy=Math.ceil(effect.energy*(1-n.stats.work/200));
   apply(n,effect);if(actual==='side')n.flags.business++;if(actual==='rest')n.flags.balance++;
   steps.push({key:actual,planned:key,text:exhausted?'몸이 먼저 휴식을 요청했다. 이번 일정은 회복으로 바꿨다.':unaffordable?'예산이 부족해 이번에는 쉬며 다음 기회를 준비했다.':ACTIONS[actual].line,delta:delta(stepBefore,snapshot(n))});
  }
  n.report={month:n.month,before,salary,living,steps,eventChoice:null,eventText:'',review:null,after:null};n.phase='event';return n;
 }
 if(action==='choose'){
  if(n.phase!=='event')throw Error('이미 선택한 이야기입니다.');const choice=EVENTS[n.month-1].choices[arg];if(!Number.isInteger(arg)||!choice)throw Error('선택지를 확인해 주세요.');
  if(!canChoose(n,choice))throw Error('이 선택에 필요한 조건을 아직 갖추지 못했습니다.');apply(n,choice.effect);if(choice.flag)n.flags[choice.flag]++;
  n.report.eventChoice=arg;n.report.eventText=choice.text;
  if(n.month%3===0){const score=Math.round(n.stats.work*.45+n.stats.expert*.35+n.stats.social*.2),old=n.rank;
   n.rank=Math.max(n.rank,score>=78&&n.month>=25?3:score>=52&&n.month>=13?2:score>=28&&n.month>=6?1:0);
   const bonus=score>=70?40:score>=40?20:0;n.money+=bonus;
   n.report.review={score,bonus,promoted:n.rank>old,rank:n.rank};
  }
  n.report.after=snapshot(n);n.phase='report';return n;
 }
 if(action==='continue'){
  if(n.phase!=='report')throw Error('이번 달의 기록을 먼저 확인해 주세요.');
  n.history.push({month:n.month,plan:n.report.steps.map(x=>x.key),eventChoice:n.report.eventChoice,stats:{...n.stats},rank:n.rank});
  n.report=null;if(n.month===MONTHS)n.phase='ending';else {n.month++;n.phase='plan';n.plan=[null,null,null];}return n;
 }
 if(action==='ending'){
  if(n.phase!=='ending'||!eligibleEndings(n).includes(arg))throw Error('지금 선택할 수 없는 다음 장입니다.');n.ending=arg;n.phase='finished';return n;
 }
 throw Error('알 수 없는 행동입니다.');
}
export function snapshot(s){return {...s.stats,energy:s.energy,stress:s.stress,money:s.money};}
export function delta(a,b){return Object.fromEntries(Object.keys(a).map(k=>[k,b[k]-a[k]]));}
export function eligibleEndings(s){
 const a=[];if(s.stats.work>=65&&s.stats.social>=50&&s.flags.lead>=5)a.push('leader');
 if(s.stats.expert>=70&&s.flags.learn+s.flags.certificate>=5)a.push('expert');
 if(s.stats.expert>=50&&s.stats.social>=45&&s.flags.career>=3)a.push('career');
 if(s.flags.business>=10&&s.money>=250&&s.stats.work>=40)a.push('founder');
 if(s.flags.balance>=12&&s.stress<=55&&s.energy>=45)a.push('balance');
 a.push('change');return a;
}
export const ENDING_HINTS={leader:'실무 65 · 인맥 50 · 리더십 선택 5회',expert:'전문성 70 · 배움·자격 선택 합계 5회',career:'전문성 50 · 인맥 45 · 진로 탐색 3회',founder:'부업·사업 시도 10회 · 자금 250만 · 실무 40',balance:'휴식·균형 선택 12회 · 스트레스 55 이하 · 체력 45 이상',change:'모든 여정에서 선택할 수 있습니다'};
export function validate(raw){
 const fail=()=>{throw Error('이 게임의 올바른 저장 파일이 아닙니다.');},int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
 if(!raw||![1,2].includes(raw.version)||typeof raw.name!=='string'||raw.name.trim().length<1||raw.name.length>12||!['male','female'].includes(raw.gender))fail();
 const n=structuredClone(raw);
 if(!int(n.month,1,36)||!['plan','event','report','ending','finished'].includes(n.phase)||!int(n.rank,0,3)||!int(n.energy,0,100)||!int(n.stress,0,100)||!int(n.money,0,100000)||!int(n.revision,0,1e9)||!int(n.burnouts,0,108))fail();
 if(!n.stats||Object.keys(n.stats).length!==3||['work','expert','social'].some(k=>!int(n.stats[k],0,100)))fail();
 if(!n.flags||Object.keys(n.flags).length!==flags.length||flags.some(k=>!int(n.flags[k],0,144)))fail();
 if(!Array.isArray(n.plan)||n.plan.length!==3||n.plan.some(k=>!(n.version===2&&n.phase==='plan'&&k===null)&&!Object.hasOwn(ACTIONS,k))||!availableOutfits(n).includes(n.outfit))fail();
 if(!Array.isArray(n.history)||n.history.length!==(n.phase==='ending'||n.phase==='finished'?36:n.month-1))fail();
 n.history.forEach((h,i)=>{if(h.month!==i+1||!Array.isArray(h.plan)||h.plan.length!==3||h.plan.some(k=>!Object.hasOwn(ACTIONS,k))||!int(h.eventChoice,0,1)||!int(h.rank,0,3)||!h.stats||Object.keys(n.stats).some(k=>!int(h.stats[k],0,100)))fail();});
 if(['event','report'].includes(n.phase)){
  const r=n.report;if(!r||r.month!==n.month||!Array.isArray(r.steps)||r.steps.length!==3||!int(r.salary,210,285)||r.living!==180)fail();
  const snap=x=>x&&Object.entries(x).length===6&&Object.entries(x).every(([k,v])=>['work','expert','social','energy','stress','money'].includes(k)&&int(v,0,k==='money'?100000:100));
  if(!snap(r.before)||r.steps.some(x=>!Object.hasOwn(ACTIONS,x.key)||!Object.hasOwn(ACTIONS,x.planned)||typeof x.text!=='string'||x.text.length>200||!x.delta||Object.keys(x.delta).length!==6||Object.entries(x.delta).some(([k,v])=>!['work','expert','social','energy','stress','money'].includes(k)||!int(v,-100000,100000))))fail();
  if(n.phase==='event'&&(r.eventChoice!==null||r.after!==null||r.review!==null))fail();
  if(n.phase==='report'&&(!int(r.eventChoice,0,1)||!snap(r.after)||typeof r.eventText!=='string'||r.eventText.length>300))fail();
  if(r.review&&(!int(r.review.score,0,100)||!int(r.review.bonus,0,40)||!int(r.review.rank,0,3)||typeof r.review.promoted!=='boolean'))fail();
 }else if(n.report!==null)fail();
 if(['ending','finished'].includes(n.phase)&&n.month!==36)fail();
 if(n.phase==='finished'?!eligibleEndings(n).includes(n.ending):n.ending!==null)fail();
 if(n.version===1){if(n.phase==='plan')n.plan=[null,null,null];n.version=2;}
 return n;
}
