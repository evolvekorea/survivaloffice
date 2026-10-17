import {WIDTH,FINISH,RADIUS,rotorEnds,sweeperPosition,ZONES} from './physics.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function drawTrack(ctx,race,width,height,camera=0,preview=false,selectedId=-1){
 const scale=width/WIDTH,view=height/scale;ctx.clearRect(0,0,width,height);ctx.save();ctx.scale(scale,scale);ctx.translate(0,-camera);
 ctx.fillStyle='#111e24';ctx.fillRect(0,camera,WIDTH,view);
 ctx.fillStyle='#1b2b30';ctx.fillRect(24,camera,552,view);ctx.strokeStyle='#22373b';ctx.lineWidth=1;
 for(let y=Math.floor(camera/48)*48;y<camera+view;y+=48){ctx.beginPath();ctx.moveTo(24,y);ctx.lineTo(576,y);ctx.stroke();}
 for(let x=48;x<WIDTH;x+=48){ctx.beginPath();ctx.moveTo(x,camera);ctx.lineTo(x,camera+view);ctx.stroke();}
 ctx.strokeStyle='#49645a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(21,camera);ctx.lineTo(21,camera+view);ctx.moveTo(579,camera);ctx.lineTo(579,camera+view);ctx.stroke();
 ctx.fillStyle='#bedfa6';ctx.font='bold 12px sans-serif';ctx.textAlign='left';ctx.fillText('START / 함께 출발',45,68);
 ctx.setLineDash([7,8]);ctx.strokeStyle='#6b8568';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(35,155);ctx.lineTo(565,155);ctx.stroke();ctx.setLineDash([]);
 function bar(x1,y1,x2,y2,color='#b7e878'){
  ctx.lineCap='round';ctx.lineWidth=18;ctx.strokeStyle='#080e1288';ctx.beginPath();ctx.moveTo(x1,y1+6);ctx.lineTo(x2,y2+6);ctx.stroke();
  ctx.strokeStyle=color;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle='#e5ffab';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1-3);ctx.lineTo(x2,y2-3);ctx.stroke();
 }
 for(const p of race.course.pegs){if(p.y<camera-50||p.y>camera+view+50)continue;
  ctx.fillStyle='#080e1277';ctx.beginPath();ctx.arc(p.x,p.y+6,p.r+2,0,Math.PI*2);ctx.fill();
  const g=ctx.createRadialGradient(p.x-p.r*.4,p.y-p.r*.5,1,p.x,p.y,p.r);g.addColorStop(0,'#ddfda7');g.addColorStop(1,'#7dba47');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4b7135';ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
 }
 for(const s of race.course.rails)bar(s.x1,s.y1,s.x2,s.y2);
 for(const s of race.course.springs){
  const active=race.time-s.firedAt<.8;ctx.fillStyle=active?'#fff2b3':'#ed9056';ctx.shadowColor='#ffae57';ctx.shadowBlur=active?24:0;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='#623523';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(s.x-12,s.y+7);ctx.lineTo(s.x,s.y-7);ctx.lineTo(s.x+12,s.y+7);ctx.stroke();
 }
 for(const s of race.course.sweepers){const p=sweeperPosition(s,race.time,race.phase);ctx.strokeStyle='#42516f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x-s.amplitude,s.y);ctx.lineTo(s.x+s.amplitude,s.y);ctx.stroke();ctx.fillStyle='#b69bff';ctx.beginPath();ctx.arc(p.x,p.y,s.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#463867';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('↔',p.x,p.y+7);}
 for(const area of [{y:4180,end:4690,up:false},{y:6010,end:6380,up:true}]){
  ctx.fillStyle=area.up?'#6adce012':'#be9cff12';ctx.fillRect(30,area.y,540,area.end-area.y);ctx.fillStyle=area.up?'#81e3db77':'#c2abff77';ctx.font='24px sans-serif';ctx.textAlign='center';
  for(let y=area.y+40;y<area.end;y+=85)for(let x=80;x<550;x+=110)ctx.fillText(area.up?'↑':Math.sin(race.time*1.5+race.phase)>0?'→':'←',x,y+(area.up?-race.time*45%60:0));
 }
 for(const r of race.course.rotors){bar(...rotorEnds(r,race.time,race.phase),'#73d0bd');ctx.fillStyle='#effbda';ctx.beginPath();ctx.arc(r.x,r.y,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c4d44';ctx.beginPath();ctx.arc(r.x,r.y,3,0,Math.PI*2);ctx.fill();}
 for(let row=0;row<2;row++)for(let col=0;col<22;col++){ctx.fillStyle=(row+col)%2?'#233731':'#d0ebae';ctx.fillRect(25+col*25,FINISH+row*14,25,14);}
 ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillStyle='#d6f3b9';ctx.fillText('FINISH',300,FINISH+80);
 for(const b of race.balls){
  if(b.finished)continue;if(b.y<camera-60||b.y>camera+view+60)continue;
  if(!preview){ctx.strokeStyle=b.color+'55';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(b.x-b.vx*.06,b.y-b.vy*.06);ctx.stroke();}
  ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(b.x+2,b.y+6,RADIUS+2,RADIUS,0,0,Math.PI*2);ctx.fill();
  const g=ctx.createRadialGradient(b.x-4,b.y-5,1,b.x,b.y,RADIUS);g.addColorStop(0,'#fff');g.addColorStop(.25,b.color);g.addColorStop(1,b.color+'aa');ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,RADIUS,0,Math.PI*2);ctx.fill();ctx.strokeStyle=b.color;ctx.lineWidth=1.5;ctx.stroke();
  ctx.font=`800 ${Math.min(10,Math.max(8,scale*9))/scale}px sans-serif`;ctx.fillStyle='#10232b';ctx.textAlign='center';ctx.fillText(b.id+1,b.x,b.y+3/scale);
  if(b.boostUntil>race.time){ctx.strokeStyle='#ffc278';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,RADIUS+7,0,Math.PI*2);ctx.stroke();}

 }
 ctx.restore();
 const visible=race.balls.filter(b=>!b.finished&&b.y>=camera&&b.y<=camera+view).sort((a,b)=>(b.id===selectedId)-(a.id===selectedId)||b.y-a.y);
 const obstacles=visible.map(b=>({x:b.x*scale-7,y:(b.y-camera)*scale-7,w:14,h:14}));
 // Reserve the monitor rectangle; crowded labels are omitted, ball numbers stay visible.
 obstacles.push({x:width-(width<500?108:132),y:0,w:132,h:width<500?206:222});
 const labels=[];ctx.font='700 11px sans-serif';
 for(const b of visible){
  if(width<500&&labels.length>=4&&b.id!==selectedId)continue;
  const label=b.id+1+' · '+([...b.name].length>8?[...b.name].slice(0,7).join('')+'…':b.name),w=Math.min(126,ctx.measureText(label).width+12),x=clamp(b.x*scale-w/2,8,width-w-8),base=(b.y-camera)*scale;
  for(const offset of [-30,18,-52,40]){
   const box={x,y:base+offset,w,h:20};
   if(box.y<35||box.y+20>height-8||[...obstacles,...labels].some(o=>box.x<o.x+o.w+3&&box.x+box.w+3>o.x&&box.y<o.y+o.h+3&&box.y+box.h+3>o.y))continue;
   ctx.strokeStyle=b.color+'88';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(b.x*scale,base);ctx.lineTo(x+w/2,box.y+10);ctx.stroke();
   ctx.fillStyle='#0a151bf2';ctx.beginPath();ctx.roundRect(x,box.y,w,20,4);ctx.fill();ctx.textAlign='center';ctx.fillStyle=b.color;ctx.fillText(label,x+w/2,box.y+14);labels.push(box);break;
  }
 }
 return labels;
}

export function drawMap(ctx,race,camera,view,selectedId){
 const w=112,h=152,pad=8;ctx.clearRect(0,0,w,h);ctx.fillStyle='#14272d';ctx.fillRect(0,0,w,h);
 const sy=y=>pad+clamp(y/FINISH,0,1)*(h-pad*2),sx=x=>pad+x/WIDTH*(w-pad*2);
 ctx.strokeStyle='#466159';ctx.lineWidth=1;
 for(const z of ZONES){ctx.beginPath();ctx.moveTo(pad,sy(z.y));ctx.lineTo(w-pad,sy(z.y));ctx.stroke();}
 ctx.fillStyle='#c5f26e26';ctx.fillRect(pad,sy(camera),w-pad*2,Math.max(3,sy(camera+view)-sy(camera)));ctx.strokeStyle='#c5f29d';ctx.strokeRect(pad,sy(camera),w-pad*2,Math.max(3,sy(camera+view)-sy(camera)));
 for(const b of race.balls){ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(sx(b.x),sy(b.finished?FINISH:b.y),b.id===selectedId?4:2.4,0,Math.PI*2);ctx.fill();}
 const b=race.balls[selectedId];if(b){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(sx(b.x),sy(b.y),6,0,Math.PI*2);ctx.stroke();}
 ctx.fillStyle='#e0edb8';ctx.fillRect(pad,h-pad,w-pad*2,2);
}

