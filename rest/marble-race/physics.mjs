export const WIDTH=600, FINISH=7600, RADIUS=11, STEP=1/120;
export const COLORS=['#ff686b','#64baff','#ffd166','#a5e65a','#bd93ff','#ff9d57','#65e2d2','#ee91c8','#d5dcf0','#b2c95c','#88a2ff','#c99874','#ff4596','#4ed8ff','#f6ef72','#58d893','#dd77ff','#ffbf91','#87dfc2','#ffaaca','#b3c2ff','#dbe599','#83b0cf','#dbac50','#fda3a3','#8aeaff','#dcadff','#c2f0a0','#ffcd6e','#9ed7d0'];
export const ZONES=[{y:0,t:'01 / 핀볼 숲'},{y:950,t:'02 / 지그재그 레일'},{y:1510,t:'03 / 회전 교차로'},{y:2500,t:'04 / 역주행 점프대'},{y:3150,t:'05 / 움직이는 벽'},{y:4100,t:'06 / 돌풍 통로'},{y:4900,t:'07 / 더블 점프'},{y:5400,t:'08 / 회전 십자문'},{y:5950,t:'09 / 상승 기류'},{y:6500,t:'10 / 마지막 뒤집기'}];
export function zoneAt(y){return ZONES.findLast(z=>y>=z.y)||ZONES[0];}
export function random(seed){let n=seed>>>0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function validateNames(values){
 if(!Array.isArray(values)||values.length<2||values.length>30)throw Error('참가자는 2~30명으로 설정해 주세요.');
 const names=values.map(v=>String(v).trim());
 if(names.some(v=>!v||[...v].length>12))throw Error('모든 공에 1~12자로 이름을 붙여 주세요.');
 if(new Set(names).size!==names.length)throw Error('공을 구별할 수 있도록 서로 다른 이름을 써 주세요.');
 return names;
}
export function course(){
 const pegs=[],rails=[],rotors=[];
 for(let row=0;row<5;row++)for(let col=0;col<5;col++)pegs.push({x:75+col*105+(row%2)*34,y:370+row*115,r:row%2?14:18});
 rails.push({x1:35,y1:1010,x2:380,y2:1155},{x1:565,y1:1270,x2:220,y2:1415});
 rotors.push({x:185,y:1630,length:104,speed:.75,phase:0},{x:425,y:1810,length:105,speed:-.85,phase:1.4});
 for(let row=0;row<3;row++)for(let col=0;col<4;col++)pegs.push({x:85+col*140+(row%2)*15,y:2070+row*160,r:25});
 rails.push({x1:40,y1:2570,x2:190,y2:2620},{x1:560,y1:2570,x2:410,y2:2620});
 const springs=[140,300,460].map((x,i)=>({id:i,x,y:2800,r:30,firedAt:-10}));
 springs.push({id:3,x:190,y:5140,r:34,firedAt:-10},{id:4,x:410,y:5230,r:34,firedAt:-10});
 const sweepers=[{x:300,y:3420,r:36,amplitude:185,speed:1.3},{x:300,y:3800,r:42,amplitude:180,speed:-1.1}];
 rails.push({x1:35,y1:3190,x2:180,y2:3270},{x1:565,y1:3600,x2:400,y2:3690},{x1:90,y1:4470,x2:340,y2:4580},{x1:565,y1:4800,x2:340,y2:4900});
 rotors.push({x:300,y:5660,length:165,speed:1.1,phase:0},{x:300,y:5660,length:165,speed:1.1,phase:Math.PI/2});
 for(let row=0;row<4;row++)for(let col=0;col<4;col++)pegs.push({x:85+col*140+(row%2)*15,y:6660+row*155,r:24});
 rails.push({x1:40,y1:7340,x2:200,y2:7420},{x1:560,y1:7340,x2:400,y2:7420});
 return {pegs,rails,rotors,springs,sweepers};
}
export function createRace(names,seed){
 names=validateNames(names);const rng=random(seed),slots=Array.from({length:names.length},(_,i)=>i);
 for(let i=slots.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
 return {seed:seed>>>0,time:0,finished:[],done:false,course:course(),phase:rng()*Math.PI*2,
  balls:names.map((name,id)=>({id,name,color:COLORS[id],x:55+(slots[id]%15)*490/(Math.min(15,names.length)-1),y:110+Math.floor(slots[id]/15)*34,vx:(rng()-.5)*35,vy:0,angle:0,finished:false,finishTime:null,stuck:0,lastY:110,springsHit:[],boostUntil:0})),events:[]};
}
function impact(b,x,y,r,vx=0,vy=0){
 let dx=b.x-x,dy=b.y-y,d=Math.hypot(dx,dy),limit=RADIUS+r;
 if(d>=limit)return;if(d<.0001){dx=.01;dy=-1;d=Math.hypot(dx,dy);}
 const nx=dx/d,ny=dy/d;b.x=x+nx*(limit+.02);b.y=y+ny*(limit+.02);
 const speed=(b.vx-vx)*nx+(b.vy-vy)*ny;
 if(speed<0){b.vx-=1.6*speed*nx;b.vy-=1.6*speed*ny;}
}
function segment(b,x1,y1,x2,y2,rotor){
 const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((b.x-x1)*dx+(b.y-y1)*dy)/(dx*dx+dy*dy))),x=x1+t*dx,y=y1+t*dy;
 impact(b,x,y,7,rotor?-(y-rotor.y)*rotor.speed:0,rotor?(x-rotor.x)*rotor.speed:0);
}
export function rotorEnds(rotor,time,phase){const a=time*rotor.speed+rotor.phase+phase,dx=Math.cos(a)*rotor.length,dy=Math.sin(a)*rotor.length;return [rotor.x-dx,rotor.y-dy,rotor.x+dx,rotor.y+dy];}
export function sweeperPosition(s,time,phase){const a=time*s.speed+phase;return {x:s.x+Math.sin(a)*s.amplitude,y:s.y,vx:Math.cos(a)*s.amplitude*s.speed};}
export function stepRace(race,dt=STEP){
 if(race.done)return;race.time+=dt;const arrivals=[];
 for(const b of race.balls){
  if(b.finished)continue;const oldY=b.y;
  b.vy=Math.min(460,b.vy+320*dt);
  if(b.y>4180&&b.y<4690)b.vx+=Math.sin(race.time*1.5+race.phase)*420*dt;
  if(b.y>6010&&b.y<6380&&Math.sin(race.time*1.8+race.phase)>.35){b.vy-=950*dt;b.boostUntil=race.time+.2;}
  b.vx*=Math.exp(-.12*dt);b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=b.vx*dt/RADIUS;
  for(const p of race.course.pegs)if(Math.abs(b.y-p.y)<65)impact(b,p.x,p.y,p.r);
  for(const s of race.course.rails)if(b.y>s.y1-35&&b.y<s.y2+35)segment(b,s.x1,s.y1,s.x2,s.y2);
  for(const r of race.course.rotors)if(Math.abs(b.y-r.y)<r.length+30)segment(b,...rotorEnds(r,race.time,race.phase),r);
  for(const s of race.course.sweepers)if(Math.abs(b.y-s.y)<s.r+RADIUS){const p=sweeperPosition(s,race.time,race.phase);impact(b,p.x,p.y,s.r,p.vx,0);}
  for(const s of race.course.springs){
   if(Math.hypot(b.x-s.x,b.y-s.y)>=s.r+RADIUS)continue;
   const launch=b.y<s.y&&b.vy>0&&!b.springsHit.includes(s.id);impact(b,s.x,s.y,s.r);
   if(launch){b.vy=-800;b.vx+=(b.x<s.x?-1:1)*180;b.springsHit.push(s.id);b.boostUntil=race.time+.9;s.firedAt=race.time;race.events.push({id:b.id,time:race.time,text:'점프대 발동!'});if(race.events.length>6)race.events.shift();}
  }
  if(b.x<24+RADIUS){b.x=24+RADIUS;b.vx=Math.abs(b.vx)*.7;}if(b.x>WIDTH-24-RADIUS){b.x=WIDTH-24-RADIUS;b.vx=-Math.abs(b.vx)*.7;}
  if(b.y<25){b.y=25;b.vy=Math.abs(b.vy);}
  // A small shared sideways vibration dislodges a ball balanced on a peg.
  b.vx+=Math.sin(race.time*3.3)*8*dt;
  if(Math.abs(b.y-b.lastY)<4)b.stuck+=dt;else {b.stuck=0;b.lastY=b.y;}
  if(b.stuck>2.5){b.vx+=Math.sin(race.time*2)>0?70:-70;b.vy-=35;b.stuck=0;}
  b.vx=Math.max(-450,Math.min(450,b.vx));b.vy=Math.max(-850,Math.min(460,b.vy));
  if(b.y>=FINISH){b.finished=true;b.finishTime=race.time-dt+dt*Math.max(0,Math.min(1,(FINISH-oldY)/(b.y-oldY)));arrivals.push(b);}
 }
 for(let i=0;i<race.balls.length;i++)for(let j=i+1;j<race.balls.length;j++){
  const a=race.balls[i],b=race.balls[j];if(a.finished||b.finished)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
  if(d>=RADIUS*2)continue;if(d<.0001){dx=1;dy=0;d=1;}const nx=dx/d,ny=dy/d,push=(RADIUS*2-d)/2;
  a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(relative<0){const impulse=-relative*.85;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
 }
 arrivals.sort((a,b)=>a.finishTime-b.finishTime);race.finished.push(...arrivals.map(b=>b.id));race.done=race.finished.length===race.balls.length;
}
export function standings(race){return [...race.balls].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:a.finished?-1:b.finished?1:b.y-a.y);}

