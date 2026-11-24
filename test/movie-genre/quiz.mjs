const types = [
  {
    image: "mystery.webp",
    alt: "비 내리는 밤 트램 정류장의 벤치에 놓인 봉투",
    name: "단서를 놓치지 않는 미스터리파",
    description: "가볍게 지나가는 대사에서 수상한 말 한마디를 골라내요. 정답을 맞히는 것도 좋지만, 평범해 보였던 첫 장면이 마지막에 전혀 다르게 읽히는 순간을 더 좋아해요.",
    strength: "흩어진 단서를 이어 보면서 이야기에 빠져드는 편이에요.",
    watch: "무슨 일이 일어날지 맞히는 데 집중하면 인물의 작은 감정 변화를 놓칠 때도 있어요.",
    tip: "다음엔 소개글 한 줄만 읽고 미스터리 영화를 골라보세요. 끝나고 나서 첫 장면의 의미가 어떻게 달라졌는지 떠올려 보세요.",
  },
  {
    image: "comedy.webp",
    alt: "빨래방에서 굴러가는 귤을 보고 웃음을 참는 친구 두 사람",
    name: "어색함을 즐기는 코미디파",
    description: "아무도 그런 말을 할 줄 몰랐던 순간이나, 두 사람이 같은 말을 완전히 다르게 알아듣는 장면이 오래 남아요. 웃긴 대사를 친구와 주고받는 순간까지가 영화 한 편이에요.",
    strength: "표정이나 말 사이의 뜸처럼 작지만 웃긴 순간을 잘 알아차려요.",
    watch: "예고편에 가장 큰 웃음이 이미 나와 있으면 본편이 싱겁게 느껴질 수 있어요.",
    tip: "가끔은 소동이 큰 영화 대신 인물들이 서로 엇갈리는 생활 코미디를 골라보세요. 가장 웃겼던 장면에서 누가 무엇을 오해했는지 친구와 얘기해 보세요.",
  },
  {
    image: "drama.webp",
    alt: "늦은 오후 정류장에서 종이컵을 든 채 서로를 바라보는 두 사람",
    name: "표정이 오래 남는 드라마파",
    description: "어떤 사건이 터졌는지보다 그 일을 겪은 사람이 마지막에 어떤 말을 고르는지가 중요해요. 아무 말 없이 건넨 종이컵 같은 장면을 보고 며칠 뒤에야 그때 인물의 마음을 이해하기도 해요.",
    strength: "인물의 선택을 겉으로 보이는 행동만으로 단정하지 않아요.",
    watch: "큰 사건이 이어지는 영화는 인물의 마음을 따라잡을 틈이 적어서 피곤할 수 있어요.",
    tip: "기분에 맞는 영화를 찾을 땐 줄거리보다 주인공이 맺는 관계를 먼저 살펴보세요. 엔딩 뒤에는 기억에 남은 표정 하나를 친구에게 말해 보세요.",
  },
  {
    image: "fantasy.webp",
    alt: "금빛 문이 있는 겹겹의 언덕으로 향하는 청록색 코트 차림의 여행자",
    name: "새로운 세계를 걷는 판타지파",
    description: "골목 끝의 문이 전혀 다른 세상으로 이어진다면 망설임 없이 따라가요. 그곳의 규칙이 무엇인지, 주민들이 어떻게 사는지 상상하다 보면 엔딩 뒤에도 그 세계에 조금 더 있고 싶어요.",
    strength: "낯선 설정을 금방 받아들이고 화면 밖 세계까지 상상하는 편이에요.",
    watch: "새로운 세계가 눈길을 끌어도 주인공에게 그곳이 왜 중요한지 놓치면 중반부터 흥미가 떨어질 수 있어요.",
    tip: "다음엔 거대한 왕국이 나오는 영화에 더해, 현실의 한 가지 규칙만 살짝 달라진 판타지도 골라보세요. 어떤 설정이 더 오래 남았는지 비교해 보세요.",
  },
];

const questions = [
  ["첫 장면", "자정에 텅 빈 정류장에 버스가 멈춘다. 어떤 일이 이어지면 궁금할까?", [
    "좌석마다 같은 날짜가 적힌 봉투가 놓여 있다.",
    "손님이 하나도 없는데 기사가 분실물 발표를 시작한다.",
    "10년 전 연락이 끊긴 두 친구가 우연히 같은 버스에 오른다.",
    "버스 창밖으로 땅과 바다가 거꾸로 보인다.",
  ]],
  ["예고편", "30초짜리 예고편 하나를 끝까지 본다면?", [
    "같은 사건을 기억하는 네 사람의 말이 조금씩 다르다.",
    "진지한 회의에서 모두가 엉뚱한 사람을 통역으로 믿는다.",
    "떠나려는 딸과 남아 달라는 아빠가 말없이 저녁을 차린다.",
    "도시 전체가 일 년에 하루, 지도 위에서 자리를 옮긴다.",
  ]],
  ["주인공", "주인공을 따라 두 시간을 보낸다면 어떤 사람이 좋을까?", [
    "다들 우연이라 넘긴 일에서 공통점을 찾는 사람.",
    "꼭 진지해야 할 때 말실수를 하고도 수습을 잘하는 사람.",
    "마음속으로 수십 번 연습한 말을 결국 다르게 꺼내는 사람.",
    "처음 보는 세상에서 그곳 사람들의 규칙을 배우는 사람.",
  ]],
  ["중반부", "영화가 절반쯤 지났다. 어떤 장면이 나오면 의자에 등을 떼게 될까?", [
    "처음에 들었던 대사가 사실 두 가지 뜻이었다는 걸 알아챈다.",
    "따로 보였던 세 사람의 실수가 한 장면에서 동시에 터진다.",
    "두 인물이 처음으로 서로의 사정을 제대로 듣는다.",
    "지금까지 배경처럼 보였던 풍경이 거대한 생물처럼 움직인다.",
  ]],
  ["소리만으로", "화면이 어두워지고 소리만 들린다. 무엇이 가장 기대될까?", [
    "같은 장소에서 들리던 발걸음의 박자가 달라진다.",
    "세 사람이 말을 하려다 번갈아 헛기침만 한다.",
    "누군가 전화를 걸고 한참 동안 아무 말도 못 한다.",
    "멀리 있는 종소리에 맞춰 지도가 한 장씩 펼쳐진다.",
  ]],
  ["영화 속에서", "어떤 영화 속 공간을 잠깐 둘러보고 싶을까?", [
    "사건 기록과 사진이 벽 한쪽을 가득 채운 작은 방.",
    "손님이 자꾸 뒤바뀌는 동네 빨래방.",
    "무심한 인물들이 조금씩 가까워지는 단골 식당.",
    "해 질 때마다 출입구가 바뀌는 기묘한 도서관.",
  ]],
  ["마지막 장면", "불이 켜지기 직전, 어떤 엔딩이면 한동안 자리를 못 뜰까?", [
    "첫 장면을 당장 다시 확인하고 싶어지는 엔딩.",
    "웃음이 났다가 한 박자 늦게 더 웃겨지는 엔딩.",
    "주인공이 결국 건넨 인사 한마디가 오래 남는 엔딩.",
    "주인공이 떠난 뒤에도 그 세계가 계속될 것 같은 엔딩.",
  ]],
  ["영화관 밖", "친구가 스포일러 없이 느낌만 말해 달라고 한다.", [
    "“처음에 나온 그 물건, 꼭 눈여겨봐.”",
    "“난 빨래방에서 웃음 참느라 힘들었어.”",
    "“그 사람이 왜 끝까지 아무 말도 안 했는지 자꾸 생각나.”",
    "“나도 저 세계에 하루만 들어가 보고 싶어.”",
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
 const title = '영화 장르 취향 테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '내 영화 취향은 ' + $('type').textContent + '!';
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
       title:'내 영화 취향은 ' + $('type').textContent + '!',
       description:'영화 장르 취향 테스트 · 나도 해보기',
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
