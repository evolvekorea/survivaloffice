export function createGame(rng=Math.random){
 const deck=Array.from({length:12},(_,i)=>i%6);
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
 return {deck,open:[],matched:[],moves:0,remaining:90,wait:0,status:'playing'};
}
export function flip(g,index){
 if(g.status!=='playing'||g.wait>0||!Number.isInteger(index)||index<0||index>=12||g.matched.includes(index)||g.open.includes(index))return false;
 g.open.push(index);
 if(g.open.length===2){
  g.moves++;
  if(g.deck[g.open[0]]===g.deck[g.open[1]]){g.matched.push(...g.open);g.open=[];if(g.matched.length===12)g.status='won';}
  else g.wait=.85;
 }
 return true;
}
export function tick(g,seconds){
 if(g.status!=='playing'||!Number.isFinite(seconds)||seconds<=0)return;
 g.remaining=Math.max(0,g.remaining-seconds);
 if(g.remaining===0){g.status='lost';return;}
 if(g.wait>0){g.wait=Math.max(0,g.wait-seconds);if(g.wait===0)g.open=[];}
}
