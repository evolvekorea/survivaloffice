export const ENTRY_MS=1800, ROUND_MS=2200;
export function battleDuration(b){return ENTRY_MS+b.frames.length*(b.format==='teams'?1100:ROUND_MS);}
export function battleView(b,elapsed=b.replayMs){
 if(b.format==='teams')return teamView(b,elapsed);
 const last=b.frames.at(-1);
 if(elapsed>=battleDuration(b))return {complete:true,phase:'finished',round:b.frames.length,index:b.frames.length-1,progress:1,entry:1,a:last.a,b:last.b,dealt:last.dealt,taken:last.taken};
 if(elapsed<ENTRY_MS)return {complete:false,phase:'entry',round:0,index:-1,progress:0,entry:Math.max(0,elapsed/ENTRY_MS),a:b.maxA,b:b.maxB,dealt:0,taken:0};
 const index=Math.min(b.frames.length-1,Math.floor((elapsed-ENTRY_MS)/ROUND_MS)),progress=((elapsed-ENTRY_MS)%ROUND_MS)/ROUND_MS;
 const f=b.frames[index],before=b.frames[index-1]||{a:b.maxA,b:b.maxB};
 const phase=progress<.16?'ready':progress<.5?'player':progress<.56?'ready':progress<.9&&f.b>0?'enemy':'recover';
 return {complete:false,phase,round:index+1,index,progress,entry:1,a:progress>=.72?f.a:before.a,b:progress>=.32?f.b:before.b,dealt:f.dealt,taken:f.taken};
}

function teamView(b,elapsed){
 const complete=elapsed>=battleDuration(b),entry=Math.min(1,Math.max(0,elapsed/ENTRY_MS));
 const index=elapsed<ENTRY_MS?-1:Math.min(b.frames.length-1,Math.floor((elapsed-ENTRY_MS)/1100));
 const progress=complete?1:elapsed<ENTRY_MS?0:((elapsed-ENTRY_MS)%1100)/1100;
 const event=index>=0?b.frames[index]:null,impact=complete||progress>=.48;
 const hp=index<0?Object.fromEntries(b.units.map(u=>[u.key,u.maxHp])):impact?event.hp:index===0?Object.fromEntries(b.units.map(u=>[u.key,u.maxHp])):b.frames[index-1].hp;
 const sum=side=>b.units.filter(u=>u.side===side).reduce((n,u)=>n+hp[u.key],0);
 return {complete,entry,index,round:index+1,progress,phase:complete?'finished':index<0?'entry':progress<.2?'ready':progress<.8?'strike':'recover',hp,event,impact,a:sum('ally'),b:sum('enemy'),dealt:event?.dealt||0,taken:event?.taken||0};
}
