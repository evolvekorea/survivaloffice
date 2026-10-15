const armorColors=['#c9b98d','#84533c','#ac8045','#a3afb0','#c4b87d'];
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
function hash(x,y){return Math.abs(Math.sin(x*12.9898+y*78.233)*43758.5453)%1;}
export function fighter(c,x,y,{weapon='sword',tier=0,armor=0,facing=1,moving=false,attack=false,dead=false,main=false}={},t=0){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(facing,1);if(dead){c.rotate(Math.PI/2);c.translate(-9,-5);}
 const step=moving?Math.round(Math.sin(t*8)*2):0,bob=moving?Math.round(Math.sin(t*16)):0;
 rect(c,-6,0,14,3,'#352c2455');c.translate(0,bob);
 rect(c,-4,-6,3,6+step,'#82553b');rect(c,2,-6,3,6-step,'#82553b');rect(c,-5,step,4,2,'#342d27');rect(c,2,-step,4,2,'#342d27');
 rect(c,-5,-14,11,9,'#322b29');rect(c,-4,-14,9,7,armorColors[armor]);rect(c,-4,-7,9,2,'#493828');rect(c,0,-7,2,2,'#cfb46d');
 if(armor>1){rect(c,-6,-14,4,3,armorColors[armor]);rect(c,5,-14,3,3,armorColors[armor]);rect(c,-3,-12,7,1,'#e2cda077');rect(c,-3,-5,2,3,armorColors[armor]);rect(c,1,-5,2,3,armorColors[armor]);}
 rect(c,-3,-21,7,7,'#c8946c');rect(c,-4,-23,8,4,'#49382c');rect(c,3,-19,2,1,'#272b25');
 if(armor>=2){rect(c,-4,-23,9,4,armorColors[armor]);rect(c,-4,-19,2,4,armorColors[armor]);if(armor>=3)rect(c,3,-19,2,3,armorColors[armor]);if(armor===4){rect(c,-2,-26,6,3,'#a04a35');rect(c,-4,-25,2,4,'#a04a35');}}
 rect(c,-7,-12,3,7,'#b7835c');rect(c,6,-12,attack?10:3,attack?3:6,'#c8946c');
 const metal=['#92958a','#b2bdba','#d3d9cf','#edcf7c'][tier], shift=attack?6:0;
 c.save();c.translate(shift,attack?-3:0);if(attack){c.translate(10,-7);c.rotate(.65);c.translate(-10,7);}
 if(weapon==='spear'){rect(c,10,-26,2,31,'#785638');rect(c,9,-31-tier,4,7+tier,metal);rect(c,10,-34-tier,2,4,metal);if(tier>=2)rect(c,8,-25,6,2,'#c2a35d');}
 else if(weapon==='axe'){rect(c,10,-22,2,24,'#755239');rect(c,7,-23,10+tier,7+tier,metal);rect(c,15,-22,3,5+tier,metal);if(tier>=2)rect(c,6,-21,3,6,metal);}
 else {rect(c,10,-23-tier*2,3,17+tier*2,metal);rect(c,11,-25-tier*2,1,3,metal);rect(c,8,-7,7,2,tier>1?'#d6ba64':'#76603d');rect(c,11,-5,2,6,'#75503a');}
 rect(c,8,-8,4,3,'#c8946c');c.restore();
 if(armor>=1){rect(c,-9,-12,6,9,'#372e28');rect(c,-8,-11,4,7,armorColors[armor]);rect(c,-7,-9,2,3,'#d5be83');}
 if(main){rect(c,-3,-34,6,2,'#edcc7c');rect(c,-2,-32,4,2,'#edcc7c');rect(c,-1,-30,2,2,'#edcc7c');}
 c.restore();
}
function beast(c,x,y,{kind='tiger',facing=1,moving=false,attack=false,dead=false}={},t=0){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(facing,1);
 const lion=kind==='lion',fur=lion?'#c9a15d':'#d89a4b',dark=lion?'#715038':'#49382b',step=moving?Math.round(Math.sin(t*8)*2):0;
 rect(c,-20,0,40,3,'#352c2455');if(dead){c.translate(0,-3);c.scale(1,.5);}
 c.translate(attack?2:0,0);
 rect(c,-25,-16,10,3,fur);rect(c,-27,-20,3,6,fur);rect(c,-28,-21,4,3,dark);
 rect(c,-18,-18,30,12,fur);rect(c,-17,-7,5,7+step,fur);rect(c,-8,-7,4,7-step,fur);rect(c,4,-7,4,7+step,fur);rect(c,10,-8,4,8-step,fur);
 for(const [lx,ly] of [[-18,step],[-9,-step],[3,step],[9,-step]])rect(c,lx,ly,7,2,dark);
 rect(c,-15,-9,24,3,lion?'#dfbc7e':'#e9cf9a');
 if(lion){rect(c,5,-24,16,20,dark);rect(c,3,-20,20,12,dark);rect(c,7,-23,4,17,'#93663b');rect(c,11,-24,5,4,'#a57842');}
 rect(c,11,-22,12,12,fur);rect(c,11,-25,4,5,fur);rect(c,19,-25,4,5,fur);rect(c,12,-24,2,2,dark);rect(c,20,-24,2,2,dark);
 rect(c,20,-16,8,6,lion?'#e3c789':'#efe0b6');rect(c,26,-16,3,3,dark);rect(c,21,-20,2,2,'#27291f');
 if(!lion){for(let i=0;i<5;i++){rect(c,-15+i*5,-18,2,6,dark);rect(c,-14+i*5,-12,2,3,dark);}rect(c,13,-22,2,5,dark);rect(c,17,-22,2,3,dark);rect(c,16,-14,4,2,dark);}
 if(attack){rect(c,23,-10,5,3,'#59382d');rect(c,24,-10,1,2,'#fff0ce');rect(c,27,-10,1,2,'#fff0ce');}
 c.restore();
}
export function drawOpponent(canvas,o){const c=canvas.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,50,32);c.imageSmoothingEnabled=false;if(o.kind==='human')fighter(c,23,30,o);else {c.save();c.scale(.82,.82);beast(c,30,34,o);c.restore();}}
function ground(c,arena){rect(c,0,0,360,190,arena?'#af8d5a':'#717255');rect(c,0,64,360,126,arena?'#bb985f':'#ae9566');for(let i=0;i<800;i++){const x=Math.floor(hash(i,7)*360),y=65+Math.floor(hash(i,9)*125);rect(c,x,y,1+Math.floor(hash(i,4)*3),1,hash(i,5)>.5?'#846e4740':'#dfc68b55');} }
function wall(c,x,y,w,h){rect(c,x,y,w,h,'#655d48');rect(c,x,y,w,3,'#b9aa80');for(let row=0;row<h/9;row++){for(let col=0;col<w/17;col++){const bx=x+col*17+(row%2?8:0);if(bx+15<x+w)rect(c,bx+1,y+4+row*9,15,7,hash(col,row)>.4?'#948363':'#84775b');}}rect(c,x,y+h,w,4,'#484b37');}
function column(c,x,y,h){rect(c,x+3,y,8,h,'#aca27e');rect(c,x+4,y,2,h,'#d1c49a');rect(c,x,y-3,14,4,'#c0b18a');rect(c,x-1,y+h,16,4,'#8b8260');}
function roof(c,x,y,w){rect(c,x+5,y,w-10,4,'#674636');rect(c,x,y+4,w,5,'#9b5c42');rect(c,x-5,y+9,w+10,5,'#794b38');rect(c,x-5,y+14,w+10,3,'#4e3c2b');for(let i=0;i<w/8;i++)rect(c,x+i*8,y+4,2,9,'#b9744d');}
function tree(c,x,y){rect(c,x-1,y-18,4,24,'#62523a');rect(c,x-11,y-31,23,16,'#404d36');rect(c,x-15,y-25,30,12,'#4e5d3e');rect(c,x-10,y-33,20,12,'#61714b');rect(c,x-6,y-35,14,6,'#788254');rect(c,x-12,y+5,27,3,'#484c3733');}
function dummy(c,x,y){rect(c,x-8,y,18,3,'#65583855');rect(c,x-1,y-29,3,30,'#735333');rect(c,x-6,y-24,13,14,'#c4ae72');rect(c,x-5,y-23,11,3,'#e1ca8b');rect(c,x-11,y-21,23,3,'#84633c');rect(c,x-4,y-32,9,8,'#c4ae72');rect(c,x-2,y-29,2,2,'#73603e');rect(c,2,y-29,2,2,'#73603e');rect(c,x-5,y-15,12,2,'#826744');}
function bench(c,x,y){rect(c,x,y,29,4,'#765339');rect(c,x,y,29,1,'#bd925d');rect(c,x+2,y+4,3,5,'#4f4230');rect(c,x+24,y+4,3,5,'#4f4230');}
function flag(c,x,y,t){rect(c,x,y,2,31,'#4e4431');rect(c,x+2,y,13,20,'#854534');rect(c,x+4,y+2,2,15,'#ae6644');rect(c,x+13,y+Math.round(Math.sin(t)*2),3,17,'#854534');rect(c,x+6,y+5,6,2,'#d6b66f');rect(c,x+8,y+5,2,8,'#d6b66f');}
export function drawScene(canvas,s,{battle=false,frame=-1,time=0,reduced=false}={}){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,360,190);const t=reduced?0:time;
 ground(c,battle);
 if(battle){
  rect(c,0,0,360,68,'#413f32');for(let row=0;row<4;row++){rect(c,0,10+row*13,360,3,'#73674c');for(let i=0;i<38;i++){let x=i*10+(row%2?4:0),y=6+row*13;rect(c,x,y,3,3,'#b49b74');rect(c,x-1,y+3,5,5,['#6c754f','#945943','#a09263','#59625a'][Math.floor(hash(i,row)*4)]);}}
  wall(c,0,58,360,17);rect(c,145,22,70,53,'#6d634b');rect(c,152,31,56,44,'#242923');rect(c,156,28,48,6,'#242923');for(let x=156;x<209;x+=8)rect(c,x,31,2,44,'#69654d');column(c,137,25,47);column(c,210,25,47);rect(c,133,18,95,6,'#b3a47a');flag(c,111,35,t);flag(c,245,35,t+1);
  c.strokeStyle='#ddbd7d';c.lineWidth=1;c.beginPath();c.ellipse(180,128,128,44,0,0,Math.PI*2);c.stroke();
  const f=s.battle?.frames[frame], done=frame>=s.battle?.frames.length-1;
  fighter(c,163+(f?Math.sin(t*6)*3:0),132,{...s,main:true,attack:!!f&&Math.sin(t*7)>.3,moving:!done,dead:done&&!s.battle.win},t);
  (s.offer.kind==='human'?fighter:beast)(c,s.offer.kind==='human'?198:210,132,{...s.offer,facing:-1,attack:!!f&&Math.sin(t*7)<-.3,moving:!done,dead:done&&s.battle.win},t+.5);
  if(f&&!done){const hit=Math.sin(t*7)>.3;c.font='bold 7px monospace';c.fillStyle=hit?'#fff1a3':'#703c2b';c.fillText(hit?`−${f.dealt}`:`−${f.taken}`,hit?197:159,94-Math.round(Math.abs(Math.sin(t*7))*5));if(hit&&f.dealt){rect(c,188,116,3,1,'#fff1a3');rect(c,189,113,1,6,'#fff1a3');}}
  bench(c,18,150);bench(c,314,150);
 }else{
  wall(c,0,29,360,44);rect(c,146,22,66,51,'#9d8a65');rect(c,158,35,42,38,'#343b2b');rect(c,164,30,30,9,'#343b2b');column(c,145,30,39);column(c,201,30,39);rect(c,141,20,77,6,'#b6a67d');flag(c,131,37,t);flag(c,219,37,t+.5);
  rect(c,19,30,95,39,'#4d4e39');column(c,24,32,38);column(c,65,32,38);column(c,104,32,38);roof(c,20,17,95);bench(c,36,57);bench(c,76,57);
  rect(c,249,29,94,40,'#4b4d39');column(c,249,31,39);column(c,291,31,39);column(c,333,31,39);roof(c,246,17,100);rect(c,264,41,16,24,'#72513a');rect(c,266,42,2,23,'#a37d4f');rect(c,300,46,22,3,'#967451');rect(c,303,38,2,24,'#c4c5ab');rect(c,309,40,2,22,'#afad93');rect(c,315,36,2,26,'#baaa7a');
  for(let i=0;i<7;i++)rect(c,157+(i%2?2:0),76+i*15,44,11,i%2?'#b5a077':'#bdaa81');
  tree(c,10,89);tree(c,347,95);tree(c,25,164);tree(c,332,170);
  rect(c,38,100,94,48,'#857a5355');rect(c,45,102,78,2,'#c3ae78');rect(c,45,147,78,2,'#c3ae78');rect(c,45,102,2,47,'#c3ae78');rect(c,122,102,2,47,'#c3ae78');
  dummy(c,112,122);dummy(c,259,117);dummy(c,285,152);bench(c,224,167);bench(c,72,168);
  const positions=[[88,123],[236,119],[262,155],[60,165],[147,157],[309,119],[180,98],[210,163]];
  for(let i=0;i<s.fighters.length;i++){
   const member=s.fighters[i];if(member.dead)continue;
   const [x,y]=positions[i],chosen=member.id===s.selectedId;
   fighter(c,x,y,{...member,main:chosen,attack:chosen&&!member.injury&&member.fatigue<=75&&Math.sin(t*4)>.3},t+i*.7);
   c.font='6px sans-serif';c.textAlign='center';c.fillStyle=chosen?'#fff0b2':'#f0dfb6';c.fillText(member.name,x,y+11);c.textAlign='start';
   if(member.injury){rect(c,x+8,y-26,7,2,'#b14b37');rect(c,x+10,y-28,2,6,'#b14b37');}
  }
  rect(c,21,115,10,14,'#855e3d');rect(c,21,118,10,2,'#484a38');rect(c,21,126,10,2,'#484a38');rect(c,322,114,14,8,'#6f573a');rect(c,321,112,16,3,'#9b7848');
  if(s.facility){rect(c,46,83,30+s.facility*9,4,'#8d6c43');for(let i=0;i<s.facility+2;i++){rect(c,49+i*9,77,3,14,'#c2c3a7');rect(c,47+i*9,88,7,2,'#695234');}}
 }
 rect(c,0,182,360,8,'#5b5b40');rect(c,0,180,360,2,'#aa9d70');
}
export function drawGear(canvas,s,kind){const c=canvas.getContext('2d');c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,32,32);fighter(c,13,29,{...s,armor:kind==='weapon'?0:s.armor,weapon:kind==='armor'?'sword':s.weapon},0);}
