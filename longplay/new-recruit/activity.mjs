import {ACTIONS,STATS} from './data.mjs';
import {portrait} from './art.mjs';
const labels={...STATS,energy:'체력',stress:'스트레스',money:'자금'};
export function changeChips(changes){
 return Object.entries(changes).filter(([,value])=>value).map(([key,value])=>`<span class="change-chip ${(key==='stress'?value<0:value>0)?'gain':'cost'}">${labels[key]} <b>${value>0?'+':'−'}${Math.abs(value)}${key==='money'?'만':''}</b></span>`).join('')||'<span class="change-chip neutral">변화 없음 · 현재 수치 유지</span>';
}
// Playback only reads the already committed report. It never grants rewards.
export function activityFrames(report){
 const values={...report.before,money:report.before.money+report.salary-report.living};
 const frames=[{key:'payday',title:'한 달의 살림부터',text:'월급을 받고 이번 달 생활비를 정산했어요.',changes:{money:report.salary-report.living},values:{...values}}];
 for(const [i,step] of report.steps.entries()){
  for(const [key,value] of Object.entries(step.delta))values[key]+=value;
  frames.push({key:step.key,title:`${i+1}번째 시간 · ${ACTIONS[step.key].name}`,text:step.text,changes:step.delta,values:{...values},adjusted:step.key!==step.planned?`${ACTIONS[step.planned].name} → ${ACTIONS[step.key].name}`:''});
 }
 return frames;
}
export function activityScene(person,key){
 const props={
  payday:'<div class="pay-envelope">₩<span>월급 도착</span></div><span class="scene-spark">✦</span>',
  work:'<div class="activity-laptop"><span>▰ ▰ ▰</span><i></i><i></i><i></i></div><div class="typing-dots">● ● ●</div>',
  study:'<div class="activity-book"><span>배움의 기록</span><i></i></div><span class="scene-spark">✎</span>',
  network:'<div class="activity-coffee">☕ <span>☕</span></div><div class="chat-bubble">오늘 어땠어요?</div>',
  overtime:'<span class="activity-moon">☾</span><div class="activity-laptop"><span>마감까지 조금만!</span><i></i><i></i><i></i></div><div class="typing-dots">● ● ●</div>',
  rest:'<div class="activity-rest">잘 쉬는 것도 성장</div><span class="rest-breath">후—</span><span class="scene-leaf">❀</span>',
  side:'<div class="activity-package">✦<span>나의 작은 작업물</span></div><span class="scene-spark">+₩</span>'
 };
 return `<div class="activity-scene scene-${key}" aria-hidden="true"><div class="activity-window"></div><div class="activity-person">${portrait(person,'activity')}</div><div class="activity-desk"></div>${props[key]}</div>`;
}
export function activityValues(values){return Object.entries(labels).map(([key,label])=>`<span>${label}<strong>${values[key].toLocaleString()}<small>${key==='money'?'만':' / 100'}</small></strong></span>`).join('');}
