const messages={
 friend:{
  warm:['같이 걸어온 시간이 있잖아. 오늘도 네 속도로 한 문제씩 풀고 와. 끝나면 내가 먼저 만나러 갈게.','긴 시간 버틴 너를 생각하면 괜히 내가 다 뿌듯해. 오늘만큼은 잘해야 한다는 마음을 조금 내려놓고, 네가 아는 것부터 차근차근 해보자.'],
  plain:['수능 잘 다녀와. 평소처럼 한 문제씩, 끝나고 보자.','긴 준비 정말 수고했어. 시험 끝나면 같이 맛있는 거 먹자.'],
  playful:['오늘의 할 일: 시험 보기, 나오기, 맛있는 거 먹기. 마지막 항목은 내가 맡을게.','시험 끝나면 문제 풀이보다 저녁 메뉴부터 같이 고르자. 오늘 메뉴 선택권은 네 거야!'],
 },
 family:{
  warm:['결과보다 네가 여기까지 걸어온 시간이 더 소중해. 끝나면 따뜻한 밥 차려 둘게. 다녀와.','잘해야 한다는 말 대신, 수고했다는 말을 먼저 해주고 싶어. 오늘도 평소처럼 다녀와. 네 편은 늘 여기 있어.'],
  plain:['준비하느라 고생했어. 따뜻하게 입고, 차분히 다녀와.','오늘은 네 속도로. 시험이 끝나면 푹 쉬자.'],
  playful:['오늘 저녁 메뉴 결정권은 수험생에게! 먹고 싶은 것 생각해 두고 다녀와.','집에 돌아오면 제일 먼저 할 일은 채점이 아니라 신발 벗고 소파에 눕기야. 다녀와!'],
 },
 teacher:{
  warm:['책상 앞에서 쌓아 온 시간을 기억합니다. 오늘은 그동안 배운 것을 하나씩 꺼내 보세요. 시험을 마치고 돌아오는 발걸음까지 응원합니다.','긴 시간 집중을 놓지 않으려 애쓴 모습을 잘 알고 있어요. 결과와 별개로 그 노력은 여러분의 것입니다. 차분히 다녀오세요.'],
  plain:['그동안 익힌 것을 차분히 꺼내는 하루가 되길 바랍니다. 준비하느라 수고했어요.','한 문제씩, 평소에 해 온 방식대로. 수능 응원합니다.'],
  playful:['오늘 선생님이 내는 숙제는 하나예요. 시험 끝나고 잘 먹고 잘 쉬기!','시험이 끝나면 오늘의 마지막 과목은 휴식입니다. 그 과목만큼은 꼭 만점 받으세요.'],
 },
 colleague:{
  warm:['일과 준비를 병행해 온 걸 가까이에서 봐서 더 응원하고 싶어요. 오늘은 일 걱정 잠깐 내려놓고, 준비한 만큼 차분히 다녀오세요.','틈틈이 준비한 시간이 쉽지 않았을 텐데 정말 수고하셨어요. 오늘은 본인에게 집중하는 하루 보내세요.'],
  plain:['수능 준비하시느라 고생 많으셨습니다. 차분히 잘 다녀오세요.','오늘 시험 응원합니다. 돌아오시면 커피 한잔해요.'],
  playful:['오늘만큼은 메신저 알림 대신 시험 종료 종만 신경 쓰세요. 커피는 다음에 제가 쏠게요!','오늘의 회의는 시험지와 단둘이! 마치고 오시면 수고하셨다는 말부터 전할게요.'],
 },
};
const labels={friend:'친구',family:'가족',teacher:'선생님',colleague:'동료',warm:'다정하게',plain:'담백하게',playful:'가볍게'};
const $=id=>document.getElementById(id), field=$('message'),status=$('status');
const preview=$('card-preview'), cardImage=$('card-image'), previewMessage=$('preview-message');
let alternate=0;
function updateCount(){
 previewMessage.textContent=field.value.trim() || field.placeholder;
 $('count').value=field.value.length+' / 180';
 $('copy').disabled=$('save').disabled=!field.value.trim();
}
function pick(){
 const sender=document.querySelector('[name="sender"]:checked').value;
 const tone=document.querySelector('[name="tone"]:checked').value;
 field.value=messages[sender][tone][alternate];
 $('choice').textContent=labels[sender]+' · '+labels[tone];status.textContent='';updateCount();
}
for(const control of document.querySelectorAll('.options input'))control.addEventListener('change',()=>{alternate=0;pick();});
function selectArtwork(){
 const selected=document.querySelector('[name="card-art"]:checked');
 cardImage.src='art-'+selected.value+'.webp';
 cardImage.alt=selected.dataset.alt;
 preview.style.setProperty('--card-accent',selected.dataset.accent);
 status.textContent='';
}
for(const option of document.querySelectorAll('[name="card-art"]')){
 option.addEventListener('change',selectArtwork);
}
$('alternate').onclick=()=>{alternate=1-alternate;pick();};
field.addEventListener('input',()=>{status.textContent='';updateCount();});
$('copy').onclick=async()=>{
 const text=field.value.trim();if(!text)return;
 try{await navigator.clipboard.writeText(text);status.textContent='응원 문구를 복사했어요.';}
 catch{field.focus();field.select();status.textContent='선택된 문구를 직접 복사해 주세요.';}
};

function wrap(ctx,text,maxWidth){
 const lines=[];
 for(const paragraph of text.split('\n')){
  let line='';
  for(const word of paragraph.trim().split(/\s+/)){
   const next=line?line+' '+word:word;
   if(ctx.measureText(next).width<=maxWidth){line=next;continue;}
   if(line)lines.push(line);
   line='';
   for(const char of word){
    if(line&&ctx.measureText(line+char).width>maxWidth){lines.push(line);line='';}
    line+=char;
   }
  }
  lines.push(line.trimEnd());
 }
 return lines;
}
$('save').onclick=async()=>{
 const text=field.value.trim();if(!text)return;
 const artwork=new Image();
 artwork.src=cardImage.src;
 const accent=preview.style.getPropertyValue('--card-accent');
 try{
  await artwork.decode();
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx)throw Error('Canvas unavailable');
  const width=1080, margin=86, box=width-margin*2;
  let fontSize=42,lines;
  const font='"Malgun Gothic", "Apple SD Gothic Neo", sans-serif';
  do{ctx.font='600 '+fontSize+'px '+font;lines=wrap(ctx,text,box);if(lines.length*fontSize*1.5<=406||fontSize===26)break;fontSize-=2;}while(fontSize>=26);
  const height=Math.max(1080,640+Math.ceil(lines.length*fontSize*1.5));
  canvas.width=width;canvas.height=height;
  ctx.fillStyle='#fff7e8';ctx.fillRect(0,0,width,height);
  const cutHeight=artwork.naturalWidth*476/width;
  ctx.drawImage(artwork,0,(artwork.naturalHeight-cutHeight)/2,artwork.naturalWidth,cutHeight,0,0,width,476);
  ctx.fillStyle=accent;ctx.fillRect(0,476,width,10);
  ctx.font='700 26px '+font;ctx.fillText('수능 응원 카드',margin,550);
  ctx.fillStyle='#20323d';ctx.font='600 '+fontSize+'px '+font;
  lines.forEach((line,i)=>ctx.fillText(line,margin,613+i*fontSize*1.5));
  ctx.fillStyle='#53646b';ctx.font='500 21px '+font;ctx.fillText('서바이벌 오피스 · 생존키트',margin,height-42);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('Image unavailable');
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='수능-응원-카드.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  status.textContent='응원 카드 이미지 저장을 요청했어요.';
 }catch{status.textContent='이미지를 만들지 못했어요. 문구 복사를 이용해 주세요.';}
};
$('kakao').onclick=()=>{
 const url=document.querySelector('link[rel=canonical]').href,link={webUrl:url,mobileWebUrl:url};
 try{
  const sdk=window.Kakao;if(!sdk?.Share?.sendDefault)throw Error('SDK unavailable');
  if(!sdk.isInitialized())sdk.init('eee6c2e01641161de9f217ba99c6a0da');
  sdk.Share.sendDefault({objectType:'feed',content:{title:'수능 응원 문구 만들기',description:'친구와 가족, 제자에게 보낼 응원을 골라 카드로 저장해 보세요.',imageUrl:document.querySelector('meta[property="og:image"]').content,link},buttons:[{title:'응원 문구 만들기',link}]});
 }catch{$('share-status').textContent='카카오톡 공유를 열지 못했어요. 주소를 복사해 전해 주세요.';}
};
pick();
selectArtwork();
