(()=>{
  'use strict';
  const $=s=>document.querySelector(s),canvas=$('#gameCanvas'),ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=false;
  const heroImg=new Image(),bossImg=new Image();heroImg.src='assets/hero-sprites.png';bossImg.src='assets/boss-sprites.png?v=20260814c';
  const rounds=[
    {name:'내리지도 않았는데 먼저 타는 빌런',line:'사람들이 아직 내리는 중인데 밀고 들어온다!',sprite:0,pattern:'rush'},
    {name:'큰소리로 유튜브 보는 빌런',line:'이어폰은 없고 자동 재생은 멈추지 않는다!',sprite:1,pattern:'video'},
    {name:'백팩 빌런',line:'거대한 백팩이 객차 절반을 차지한다!',sprite:2,pattern:'backpack'},
    {name:'쩍벌 빌런',line:'한 사람이 세 자리의 주인이 되었다!',sprite:3,pattern:'wide'},
    {name:'좌석을 침대로 쓰는 학생 무리',line:'신발도 벗지 않고 긴 의자를 점령했다!',sprite:4,pattern:'snack',count:3},
    {name:'댄스 빌런',line:'객차를 개인 무대로 착각하고 있다!',sprite:5,pattern:'dance'},
    {name:'지하철 빌런 연합',line:'지금까지의 민폐가 한 객차에 전부 모였다!',sprite:0,pattern:'all',final:true}
  ];
  const input={left:false,right:false,up:false,down:false,charge:false};
  let joystickX=0,joystickY=0;
  let mode='title',round=0,score=0,best=Number(localStorage.getItem('dansoVillainBest')||0),last=0,shake=0,skillTimer=0,chargeTextStage=0,chargeLocked=false,projectiles=[],enemies=[];
  const player={x:170,y:405,z:0,vz:0,patience:100,ki:0,facing:1,frame:0,attack:0,dodge:0,invincible:0,walkClock:0};
  const overlay=$('#overlay'),overlayEyebrow=$('#overlayEyebrow'),overlayTitle=$('#overlayTitle'),overlayText=$('#overlayText'),overlayButton=$('#overlayButton');
  const ui={round:$('#roundValue'),score:$('#scoreValue'),patience:$('#patienceValue'),patienceBar:$('#patienceBar'),energy:$('#energyValue'),energyBar:$('#energyBar'),bossName:$('#bossName'),bossBar:$('#bossBar'),bossValue:$('#bossValue'),ultimate:$('#ultimateButton'),skill:$('#skillText')};

  function resetPlayer(){Object.assign(player,{x:170,y:405,z:0,vz:0,patience:100,ki:0,facing:1,frame:0,attack:0,dodge:0,invincible:0,walkClock:0});score=0;round=0;projectiles=[];chargeLocked=false;input.charge=false;joystickX=0;joystickY=0;$('#chargeButton').classList.remove('locked');}
  function makeEnemy(sprite,x,y,hp=100,pattern=rounds[round].pattern){return{sprite,x,y,hp,maxHp:hp,pattern,cooldown:1+Math.random(),hit:0,phase:Math.random()*6.28,defeated:false,facing:-1,moveSpeed:0,lean:0,action:0};}
  function prepareRound(){
    const r=rounds[round];projectiles=[];enemies=[];player.x=150;player.y=405;player.ki=Math.min(player.ki,70);
    if(r.final){for(let i=0;i<6;i++)enemies.push(makeEnemy(i,650+(i%3)*95,330+(i%2)*90,45,['rush','video','backpack','wide','snack','dance'][i]));}
    else if(r.count){for(let i=0;i<r.count;i++)enemies.push(makeEnemy(r.sprite,670+i*85,330+i%2*85,55,r.pattern));}
    else enemies.push(makeEnemy(r.sprite,760,390,100,r.pattern));
    mode='intro';updateHud();showOverlay(`ROUND ${round+1}`,`${r.name} 등장`,r.line,'대결 시작',()=>{mode='playing';hideOverlay()});
  }
  function newGame(){resetPlayer();prepareRound();}
  function showOverlay(eye,title,text,button,onClick){overlayEyebrow.textContent=eye;overlayTitle.textContent=title;overlayText.innerHTML=text;overlayButton.textContent=button;overlayButton.onclick=onClick;overlay.classList.remove('hidden');}
  function hideOverlay(){overlay.classList.add('hidden');}
  function popText(text,kind='small'){
    ui.skill.textContent=text;ui.skill.className='skill-text';void ui.skill.offsetWidth;ui.skill.classList.add('show');if(kind==='ultimate')shake=16;
  }
  function nearestAhead(range=150){
    let bestTarget=null,bestDist=Infinity;for(const e of enemies){if(e.defeated)continue;const dx=e.x-player.x,dy=Math.abs(e.y-player.y);if(dx*player.facing<-15||dy>85)continue;const d=Math.abs(dx)+dy*.5;if(d<range&&d<bestDist){bestTarget=e;bestDist=d;}}return bestTarget;
  }
  function feint(){if(mode!=='playing'||player.attack>0||player.dodge>0||input.charge)return;player.attack=.34;player.frame=3;const target=nearestAhead(175);if(target){target.hp=Math.max(0,target.hp-9);target.hit=.3;target.x+=player.facing*24;player.ki=Math.min(100,player.ki+8);score+=90;popText('흠칫!');checkDefeated(target)}else popText('허공!');updateHud();}
  function ultimate(){if(mode!=='playing'||player.ki<100)return;const target=nearestAhead(270);if(!target){popText('대상이 없어!');return;}player.ki=0;player.attack=1;player.frame=3;player.x=target.x-player.facing*105;target.hp=Math.max(0,target.hp-34);target.hit=1;target.x+=player.facing*55;score+=500;skillTimer=1;popText('안 때렸어','ultimate');checkDefeated(target);updateHud();}
  function jump(){if(mode!=='playing'||player.z>0||player.vz>0||input.charge||player.dodge>0)return;player.z=1;player.vz=590;player.frame=1;popText('점프!');}
  function dodge(){if(mode!=='playing'||player.dodge>0||input.charge)return;player.dodge=.55;player.invincible=.65;player.x=Math.max(50,Math.min(910,player.x-player.facing*70));popText('슬쩍!');}
  function checkDefeated(e){if(e.hp>0||e.defeated)return;e.defeated=true;score+=1000;setTimeout(()=>{if(enemies.every(v=>v.defeated))roundClear()},450);}
  function roundClear(){if(mode!=='playing')return;mode='clear';const finished=rounds[round];if(round===rounds.length-1){best=Math.max(best,score);localStorage.setItem('dansoVillainBest',best);showOverlay('ALL CLEAR','민폐 승객 전원 하차',`최종 점수 <strong>${score.toLocaleString()}</strong><br>최고 기록 ${best.toLocaleString()}점`,'다시 하기',newGame);try{gtag('event','game_complete',{game:'danso_villain',score})}catch{}}
    else{round++;showOverlay('ROUND CLEAR',`${finished.name} 퇴치`,`실제로 때린 횟수 <strong>0회</strong><br>다음 역으로 이동합니다.`,'다음 역',prepareRound);}}
  function hurt(amount,text){if(player.invincible>0||player.z>42||mode!=='playing')return;player.patience=Math.max(0,player.patience-amount);player.invincible=.8;shake=9;popText(text);updateHud();if(player.patience<=0){mode='over';showOverlay('GAME OVER','인내심이 바닥났습니다',`민폐는 강했습니다. 하지만 실제로 때린 횟수는 여전히 <strong>0회</strong>입니다.<br>점수 ${score.toLocaleString()}점`,'다시 도전',newGame);}}
  function spawnProjectile(e,type,speed=190){projectiles.push({x:e.x-45,y:e.y-80,vx:-speed,type,life:4,spin:0});}
  function updateEnemies(dt){
    for(const e of enemies){if(e.defeated)continue;const oldX=e.x,oldY=e.y;e.phase+=dt;e.cooldown-=dt;e.action=Math.max(0,e.action-dt);if(e.hit>0){e.hit-=dt;continue;}const dx=player.x-e.x,dy=player.y-e.y,dist=Math.hypot(dx,dy);
      if(e.pattern==='video'||e.pattern==='snack'){e.x+=Math.sin(e.phase*1.6)*48*dt;e.y+=Math.cos(e.phase*2.2)*28*dt;if(dist>260)e.x+=dx/dist*38*dt;if(e.cooldown<=0){spawnProjectile(e,e.pattern==='video'?'sound':'snack',e.pattern==='video'?230:180);e.action=.45;e.cooldown=1.7+Math.random();}}
      else if(e.pattern==='dance'){e.x+=Math.cos(e.phase*2.7)*115*dt;e.y+=Math.sin(e.phase*3.1)*88*dt;if(dist<100&&e.cooldown<=0){hurt(10,'춤선 침범!');e.action=.5;e.cooldown=1.3;}}
      else{const speed=e.pattern==='rush'?175:e.pattern==='backpack'?112:82;if(dist>80){e.x+=dx/dist*speed*dt;e.y+=dy/dist*speed*.62*dt;}else if(e.cooldown<=0){hurt(e.pattern==='backpack'?13:e.pattern==='wide'?8:10,e.pattern==='rush'?'먼저 탈게요!':e.pattern==='backpack'?'백팩 회전!':'자리 침범!');e.action=.5;e.cooldown=1.25;}}
      const movedX=e.x-oldX,movedY=e.y-oldY;e.moveSpeed=Math.hypot(movedX,movedY)/Math.max(dt,.001);e.lean=Math.max(-.1,Math.min(.1,movedX*.02));if(Math.abs(movedX)>.1)e.facing=Math.sign(movedX);e.x=Math.max(55,Math.min(915,e.x));e.y=Math.max(310,Math.min(455,e.y));}
    for(const p of projectiles){p.x+=p.vx*dt;p.spin+=dt*7;p.life-=dt;if(Math.abs(p.x-player.x)<42&&Math.abs(p.y-player.y+70)<60&&player.z<42){p.life=0;hurt(8,p.type==='sound'?'자동 재생!':'쓰레기 투척!');}}projectiles=projectiles.filter(p=>p.life>0&&p.x>-80);
  }
  function update(dt){
    if(shake>0)shake=Math.max(0,shake-45*dt);if(skillTimer>0)skillTimer-=dt;if(player.invincible>0)player.invincible-=dt;if(player.attack>0){player.attack-=dt;if(player.attack<=0)player.frame=0;}if(player.dodge>0)player.dodge-=dt;
    if(player.z>0||player.vz>0){player.vz-=1420*dt;player.z+=player.vz*dt;if(player.z<=0){player.z=0;player.vz=0;if(player.attack<=0)player.frame=0;}}
    if(mode!=='playing')return;
    const charging=input.charge&&player.attack<=0&&player.dodge<=0;if(charging){player.frame=2;player.ki=Math.min(100,player.ki+28*dt);const stage=Math.floor(player.ki/25);if(stage>chargeTextStage&&player.ki<100){chargeTextStage=stage;popText(['','위협 중…','때릴 것 같은데…','진짜 때릴 것 같은데…'][stage]||'');}if(player.ki>=100&&chargeTextStage<5){chargeTextStage=5;popText('기 충전 완료!');}}
    else{chargeTextStage=Math.floor(player.ki/25);let mx=(input.right?1:0)-(input.left?1:0)+joystickX,my=(input.down?1:0)-(input.up?1:0)+joystickY;if(mx||my){const len=Math.hypot(mx,my);if(len>1){mx/=len;my/=len;}player.x+=mx*220*dt;player.y+=my*150*dt;if(Math.abs(mx)>.08)player.facing=Math.sign(mx);player.walkClock+=dt;player.frame=Math.floor(player.walkClock*8)%2;}else if(player.attack<=0)player.frame=0;}
    player.x=Math.max(48,Math.min(912,player.x));player.y=Math.max(315,Math.min(455,player.y));updateEnemies(dt);updateHud();
  }
  function updateHud(){
    ui.round.textContent=`${round+1} / 7`;ui.score.textContent=score.toLocaleString();ui.patience.textContent=Math.ceil(player.patience);ui.patienceBar.style.width=`${player.patience}%`;ui.energy.textContent=`${Math.floor(player.ki)}%`;ui.energyBar.style.width=`${player.ki}%`;
    const alive=enemies.filter(e=>!e.defeated),total=alive.reduce((a,e)=>a+e.hp,0),max=alive.reduce((a,e)=>a+e.maxHp,0)||1;ui.bossName.textContent=rounds[round].name;ui.bossBar.style.width=`${total/max*100}%`;ui.bossValue.textContent=`뻔뻔함 ${Math.ceil(total)}`;ui.ultimate.disabled=player.ki<100||!nearestAhead(270);ui.ultimate.classList.toggle('ready',!ui.ultimate.disabled);
  }
  function subwayBackground(){
    const palettes=[['#163048','#27516a'],['#30213f','#63385b'],['#163b3d','#27706d'],['#393024','#765f38'],['#202d48','#3a5990'],['#3a2039','#713866'],['#2d1720','#782c3e']],p=palettes[round];ctx.fillStyle='#0a111a';ctx.fillRect(0,0,960,540);ctx.fillStyle=p[0];ctx.fillRect(0,45,960,305);ctx.fillStyle='#d8e1df';ctx.fillRect(0,48,960,18);
    for(let i=0;i<5;i++){const x=25+i*196;ctx.fillStyle='#09131e';ctx.fillRect(x,92,158,168);ctx.strokeStyle=p[1];ctx.lineWidth=7;ctx.strokeRect(x,92,158,168);ctx.fillStyle='#152a3b';ctx.fillRect(x+12,105,134,135);ctx.fillStyle='#243746';ctx.fillRect(x+18,212,122,33);}
    ctx.fillStyle='#17304b';ctx.fillRect(0,270,960,88);for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#1d4167':'#24517f';ctx.fillRect(i*82,278,76,68);}ctx.fillStyle='#101720';ctx.fillRect(0,358,960,182);ctx.strokeStyle='#344657';ctx.lineWidth=2;for(let y=375;y<540;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}for(let x=0;x<960;x+=96){ctx.beginPath();ctx.moveTo(480+(x-480)*.55,358);ctx.lineTo(x,540);ctx.stroke();}
    ctx.fillStyle='#c99b37';for(let i=0;i<5;i++){ctx.fillRect(85+i*195,65,8,245);ctx.beginPath();ctx.strokeStyle='#d8b24f';ctx.lineWidth=5;ctx.arc(89+i*195,103,17,0,Math.PI*2);ctx.stroke();}
  }
  function drawHero(){if(!heroImg.complete)return;const fw=heroImg.width/4,sy=90,sh=heroImg.height-110,sw=fw,shadowScale=Math.max(.48,1-player.z/330);const frame=Math.min(3,player.frame);ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,4,52*shadowScale,14*shadowScale,0,0,Math.PI*2);ctx.fill();ctx.translate(0,-player.z);if(player.facing<0)ctx.scale(-1,1);if(player.invincible>0&&Math.floor(player.invincible*12)%2)ctx.globalAlpha=.35;ctx.drawImage(heroImg,frame*fw,sy,sw,sh,-92,-248,184,260);ctx.restore();}
  function drawEnemy(e){if(!bossImg.complete||e.defeated)return;const sx=(e.sprite%3)*512,sy=Math.floor(e.sprite/3)*512,moving=e.moveSpeed>18,bob=Math.sin(e.phase*(moving?11:4))*(moving?5:2),attackLean=e.action>0?Math.sin(e.action*25)*.08:0;ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(0,3,57,15,0,0,Math.PI*2);ctx.fill();if(moving){ctx.strokeStyle='#76dfff88';ctx.lineWidth=4;ctx.lineCap='round';for(let i=0;i<3;i++){const trailX=-e.facing*(50+i*18);ctx.beginPath();ctx.moveTo(trailX,-45-i*5);ctx.lineTo(trailX-e.facing*18,-45-i*5);ctx.stroke();}}ctx.translate(0,bob);ctx.rotate(e.lean+attackLean);if(e.facing>0)ctx.scale(-1,1);if(e.hit>0){ctx.globalAlpha=Math.floor(e.hit*18)%2?.4:1;ctx.translate(-e.facing*7,0);}ctx.drawImage(bossImg,sx,sy,512,512,-102,-205,204,204);ctx.restore();}
  function drawProjectile(p){ctx.save();ctx.translate(p.x,p.y);if(p.type==='sound'){ctx.strokeStyle='#5cecff';ctx.lineWidth=6;ctx.lineCap='round';ctx.shadowColor='#21d4ff';ctx.shadowBlur=12;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(12,0,12+i*12,Math.PI*.7,Math.PI*1.3);ctx.stroke();}ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(10,0,5,0,Math.PI*2);ctx.fill();}else{ctx.rotate(-p.spin);ctx.fillStyle='#ffbd3c';ctx.strokeStyle='#5b3411';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,-24);ctx.lineTo(17,-20);ctx.lineTo(22,20);ctx.lineTo(-15,25);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff1a8';ctx.fillRect(-14,-16,27,5);ctx.fillStyle='#e45636';ctx.beginPath();ctx.arc(1,3,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5b3411';ctx.beginPath();ctx.arc(-4,0,2,0,Math.PI*2);ctx.arc(5,6,2,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function draw(){ctx.save();if(shake){ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);}subwayBackground();const actors=[...enemies.filter(e=>!e.defeated).map(e=>({y:e.y,draw:()=>drawEnemy(e)})),{y:player.y,draw:drawHero}].sort((a,b)=>a.y-b.y);actors.forEach(a=>a.draw());for(const p of projectiles)drawProjectile(p);ctx.restore();}
  function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop);}
  const joystick=$('#joystick'),joystickKnob=$('#joystickKnob');let joystickPointer=null;
  function moveJoystick(clientX,clientY){const rect=joystick.getBoundingClientRect(),dx=clientX-(rect.left+rect.width/2),dy=clientY-(rect.top+rect.height/2),max=rect.width*.31,dist=Math.hypot(dx,dy),scale=dist>max?max/dist:1,mx=dx*scale,my=dy*scale;joystickX=mx/max;joystickY=my/max;joystickKnob.style.transform=`translate(calc(-50% + ${mx}px),calc(-50% + ${my}px))`;joystick.classList.add('active');}
  function resetJoystick(){joystickPointer=null;joystickX=0;joystickY=0;joystickKnob.style.transform='translate(-50%,-50%)';joystick.classList.remove('active');}
  joystick.addEventListener('pointerdown',e=>{e.preventDefault();joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoystick(e.clientX,e.clientY)});
  joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)moveJoystick(e.clientX,e.clientY)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>joystick.addEventListener(n,e=>{if(joystickPointer===null||e.pointerId===joystickPointer)resetJoystick()}));
  const chargeButton=$('#chargeButton');let chargeDownAt=0;chargeButton.addEventListener('pointerdown',e=>{e.preventDefault();chargeDownAt=performance.now();input.charge=true});['pointercancel','pointerleave'].forEach(n=>chargeButton.addEventListener(n,()=>{if(!chargeLocked)input.charge=false}));chargeButton.addEventListener('pointerup',e=>{e.preventDefault();const quick=performance.now()-chargeDownAt<260;if(quick){chargeLocked=!chargeLocked;input.charge=chargeLocked;chargeButton.classList.toggle('locked',chargeLocked)}else input.charge=chargeLocked});$('#jumpButton').addEventListener('pointerdown',e=>{e.preventDefault();jump()});$('#feintButton').addEventListener('pointerdown',e=>{e.preventDefault();feint()});$('#ultimateButton').addEventListener('pointerdown',e=>{e.preventDefault();ultimate()});$('#dodgeButton').addEventListener('pointerdown',e=>{e.preventDefault();dodge()});
  addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','shift','z','x','c','a','d','w','s'].includes(k))e.preventDefault();if(k==='arrowleft'||k==='a'){input.left=true;if(!e.repeat)player.x-=52}if(k==='arrowright'||k==='d'){input.right=true;if(!e.repeat)player.x+=52}if(k==='arrowup'||k==='w'){input.up=true;if(!e.repeat)player.y-=34}if(k==='arrowdown'||k==='s'){input.down=true;if(!e.repeat)player.y+=34}if(!e.repeat&&k==='x'){chargeLocked=!chargeLocked;input.charge=chargeLocked;chargeButton.classList.toggle('locked',chargeLocked)}if(!e.repeat&&k==='z')feint();if(!e.repeat&&k==='c')ultimate();if(!e.repeat&&k===' ')jump();if(!e.repeat&&k==='shift')dodge();});
  addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')input.left=false;if(k==='arrowright'||k==='d')input.right=false;if(k==='arrowup'||k==='w')input.up=false;if(k==='arrowdown'||k==='s')input.down=false;});
  addEventListener('blur',()=>{Object.keys(input).forEach(k=>input[k]=false);resetJoystick()});
  overlayButton.onclick=newGame;updateHud();requestAnimationFrame(loop);
})();
