const types = [
  {
    image: "color.webp",
    alt: "파란색과 빨간색이 선명한 추상 작품 앞에 선 관람객",
    name: "색에 먼저 반하는 사람",
    description: "전시실에 들어서자마자 시선이 꽂히는 작품이 있어요. 등장인물이나 시대를 몰라도 색이 서로 부딪치는 방식, 그림 앞에 서면 달라지는 기분을 먼저 느껴요. 마음에 든 색 조합은 다음 날 옷을 고를 때도 떠오를 수 있어요.",
    strength: "전시에서 받은 첫인상을 자기 말로 표현하는 힘이 있어요.",
    watch: "차분한 작품은 눈에 늦게 들어와서 지나치기 쉬워요.",
    tip: "강렬했던 작품에서 색 두 가지를 골라 이름을 붙여 보세요. 다음 방에서는 가장 조용한 색의 작품 하나에 30초만 머물러 보세요.",
  },
  {
    image: "story.webp",
    alt: "언덕 위 집 그림을 보며 창문과 산책하는 사람을 상상하는 관람객",
    name: "장면 뒤를 상상하는 사람",
    description: "그림 속에 불이 켜진 창문이 보이면 누가 그 안에 살까 궁금해져요. 인물의 표정이나 자리에 비어 있는 의자에서 자기만의 이야기를 떠올리고, 전시 밖으로 나와서도 그 뒷이야기를 이어가요.",
    strength: "친구와 같은 작품을 보고도 서로 다른 이야기가 나온다는 걸 즐겨요.",
    watch: "처음 떠올린 이야기로 마음이 굳으면 그림에 있는 다른 단서를 놓칠 수 있어요.",
    tip: "인상 깊었던 작품에 내 제목을 먼저 붙인 뒤 실제 제목을 읽어 보세요. 둘 사이에서 달라진 느낌을 한 줄로 남겨 보세요.",
  },
  {
    image: "detail.webp",
    alt: "작은 붉은 장갑 그림 앞에서 수첩을 펼친 초록 목도리 차림의 관람객",
    name: "구석까지 읽는 관찰자",
    description: "그림 모서리의 작은 장갑이나 도자기 표면의 손자국처럼 처음에는 잘 보이지 않는 흔적에서 더 오래 멈춰요. 자세히 보고 설명을 읽다 보면 여러 작품에 반복되는 모티프가 눈에 들어옵니다.",
    strength: "다른 사람들이 스쳐 지나간 부분을 발견하고 작품 사이의 연결을 기억해요.",
    watch: "모든 설명을 읽으려다 보면 후반부에 작품을 볼 시간이 짧아져요.",
    tip: "전시 처음에는 방마다 가장 궁금한 작품 한 점만 자세히 보세요. 나가기 전 가장 궁금했던 방에 한 번 더 들러도 좋아요.",
  },
  {
    image: "space.webp",
    alt: "빛이 드는 전시실 벤치에 앉아 하얀 조각을 보는 관람객",
    name: "공간을 듣는 산책자",
    description: "어떤 작품이 있었는지만큼 방과 방을 오갈 때 달라진 공기와 빛을 기억해요. 벤치에 앉아 조각과 그림자 사이의 여백을 보거나, 사람이 적은 방을 천천히 걷는 시간이 전시의 일부예요.",
    strength: "작품 배치와 동선이 만들어낸 분위기를 자연스럽게 알아차려요.",
    watch: "공간의 첫인상이 강하면 각 작품에 한 번 더 다가갈 타이밍을 놓칠 수 있어요.",
    tip: "좋았던 방에서 서로 다른 자리 두 곳에 서 보세요. 멀리서 본 첫 느낌과 가까이서 눈에 들어온 하나의 단서를 각각 적어 보세요.",
  },
];

const questions = [
  ["전시실 입구", "퇴근하고 미술관에 왔다. 첫 전시실에서 가장 먼저 하는 일은?", [
    "멀리서도 색이 또렷한 작품으로 향한다.",
    "문득 사연이 궁금해지는 인물 그림에 다가간다.",
    "입구에 있는 전시 지도와 첫 작품 설명을 읽는다.",
    "입구에 잠깐 서서 방 전체와 다른 관람객의 흐름을 본다.",
  ]],
  ["낯선 작품 앞", "그림 한가운데 빈 의자가 하나 놓여 있다. 무엇이 먼저 눈에 들어올까?", [
    "의자에 걸린 주황색 천과 배경의 파란색.",
    "방금 그 의자에서 일어난 사람은 누구였을지.",
    "등받이 옆에 가려진 작은 사물의 모양.",
    "멀찍이 떨어져 봤을 때 더 크게 느껴지는 여백.",
  ]],
  ["관람 속도", "같이 온 친구가 다음 방으로 가자고 한다. 아직 보고 싶은 게 있다면?", [
    "가장 강렬했던 색을 한 번 더 보고 나온다.",
    "이 그림의 뒷이야기를 서로 하나씩 말하고 간다.",
    "아까 놓친 작품 이름과 재료를 읽고 간다.",
    "친구를 먼저 보내고 방 전체를 한 바퀴 더 돈다.",
  ]],
  ["조각과 조명", "하얀 조각 하나와 벤치 하나만 있는 방에 들어섰다.", [
    "하얀 표면에 비치는 푸른빛과 노란빛을 본다.",
    "조각의 형태가 어떤 표정이나 몸짓처럼 느껴지는지 생각한다.",
    "가까이에서 접힌 부분과 표면 재질이 어떻게 다른지 살펴본다.",
    "벤치에 앉아 조각과 그림자가 한눈에 들어오는 자리를 찾는다.",
  ]],
  ["설명을 읽고", "작품에 대한 설명을 듣고 처음과 다르게 보이기 시작했다.", [
    "설명을 듣기 전과 후에 눈에 띄는 색이 바뀌었는지 본다.",
    "처음 상상했던 이야기와 설명에 나온 이야기를 나란히 떠올린다.",
    "설명에서 언급한 작은 요소가 그림 어디 있는지 찾아본다.",
    "한 발 물러나서 이 작품이 왜 이 방에 있는지 본다.",
  ]],
  ["한 장만 남기기", "촬영이 가능한 구역에서 친구에게 사진 한 장을 보낸다면?", [
    "두 색이 가장 선명하게 만나는 작품을 담는다.",
    "사진과 함께 내가 지어 본 짧은 이야기를 보낸다.",
    "가까이에서 봐야 보이는 질감이나 모양을 찍는다.",
    "창빛과 바닥, 작품이 함께 보이게 넓게 담는다.",
  ]],
  ["마지막 10분", "폐관 안내가 나오고 한 방만 더 볼 수 있다.", [
    "색이 제일 마음에 들었던 방으로 돌아간다.",
    "처음 본 작품에 이어 어떤 장면이 나오는지 마지막 방으로 간다.",
    "아직 확인 못 한 작품의 설명을 읽으러 간다.",
    "가장 편안했던 방에서 천천히 마지막 시간을 보낸다.",
  ]],
  ["미술관을 나온 뒤", "친구가 어떤 점이 좋았냐고 물으면 뭐라고 답할까?", [
    "“파란색 옆에 있던 주황이 아직도 눈에 남아.”",
    "“그 그림에 비워 둔 의자가 자꾸 생각나.”",
    "“장갑이 다른 그림에도 나왔더라. 나중에 알아챘어.”",
    "“하얀 조각이 있던 방에 조용히 앉아 있는 게 좋았어.”",
  ]],
];

const $ = id => document.getElementById(id);
const picks = [];
let step = 0;
function show(id) {
 for (const panel of ['start','quiz','result']) $(panel).hidden = panel !== id;
}
function render() {
 show('quiz');
 $('step').textContent = String(step + 1) + ' / ' + questions.length;
 $('scene').textContent = questions[step][0];
 $('progress').value = step + 1;
 $('question').textContent = questions[step][1];
 $('back').disabled = step === 0;
 $('answers').replaceChildren(...Array.from({length:4}, (_, position) => {
   const type = (position + step) % 4;
   const button = document.createElement('button');
   button.textContent = questions[step][2][type];
   button.setAttribute('aria-pressed', String(picks[step] === type));
   button.addEventListener('click', () => {
     picks[step++] = type;
     if (step === questions.length) result();
     else render();
   });
   return button;
 }));
 $('question').focus({preventScroll:true});
}
function result() {
 const counts = types.map((_, i) => picks.filter(p => p === i).length);
 const most = Math.max(...counts);
 const winner = [...picks].reverse().find(i => counts[i] === most);
 const type = types[winner];
 $('portrait').src = type.image;
 $('portrait').alt = type.alt;
 $('result').dataset.type = winner;
 $('strength').textContent = type.strength;
 $('watch').textContent = type.watch;
 $('type').textContent = type.name;
 $('desc').textContent = type.description;
 $('tip').textContent = type.tip;
 $('share-status').textContent = '';
 $('share-text').hidden = true;
 show('result');
 $('result').scrollIntoView({block:'start'});
 $('type').focus({preventScroll:true});
}
$('begin').onclick = () => { step = 0; picks.length = 0; render(); };
$('back').onclick = () => { if (step > 0) { step--; render(); } };
$('restart').onclick = () => { show('start'); $('begin').focus(); };
$('share').onclick = async () => {
 const title = '전시회 취향 테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '내 전시 관람 유형은 ' + $('type').textContent + '!';
 if (navigator.share) {
   try { await navigator.share({title, text, url}); return; }
   catch (error) { if (error.name === 'AbortError') return; }
 }
 const message = title + '\n' + text + '\n' + url;
 try {
   await navigator.clipboard.writeText(message);
   $('share-status').textContent = '결과와 테스트 링크를 복사했어요.';
 } catch {
   $('share-text').value = message;
   $('share-text').hidden = false;
   $('share-text').select();
   $('share-status').textContent = '아래 결과를 복사해 주세요.';
 }
};
$('share-kakao').onclick = () => {
 const status = $('share-status');
 const url = document.querySelector('link[rel=canonical]').href;
 const link = {mobileWebUrl:url, webUrl:url};
 try {
   const sdk = window.Kakao;
   if (!sdk?.Share?.sendDefault) throw new Error('KakaoTalk share SDK unavailable');
   if (!sdk.isInitialized()) sdk.init('eee6c2e01641161de9f217ba99c6a0da');
   sdk.Share.sendDefault({
     objectType:'feed',
     content:{
       title:'내 전시 관람 유형은 ' + $('type').textContent + '!',
       description:'전시회 취향 테스트 · 나도 해보기',
       imageUrl:new URL($('portrait').getAttribute('src'), url).href,
       link,
     },
     buttons:[{title:'테스트 하러 가기', link}],
   });
   status.textContent = '';
 } catch {
   status.textContent = '카카오톡 공유를 열지 못했어요. 다른 방법으로 공유해 주세요.';
 }
};
