const types = [
  {
    image: "rhythm.webp",
    alt: "헤드폰을 쓰고 햇빛 드는 지하철 계단을 오르는 주황색 외투 차림의 사람",
    name: "걸음을 바꾸는 리듬파",
    description: "들으려고 고른 곡이 어느새 걷는 속도까지 바꿔요. 앞부분 몇 초만 들어도 오늘 이 노래와 잘 맞겠다는 걸 알 때가 있어요. 출근길이 유난히 길게 느껴지는 날에도 박자가 한 번 잡히면 몸이 먼저 따라가요.",
    strength: "기운이 가라앉은 순간에 몸을 움직이게 해줄 곡을 금방 골라요.",
    watch: "첫 박자가 잔잔한 곡을 넘기면 뒤에서 확 달라지는 리듬을 놓칠 수 있어요.",
    tip: "출근길 첫 세 곡을 ‘천천히 걷기 → 보폭 넓히기 → 기분 좋게 도착하기’ 순서로 놓아 보세요.",
  },
  {
    image: "lyrics.webp",
    alt: "비 내리는 창가에서 헤드폰을 끼고 노트에 글을 적는 사람",
    name: "한 문장을 돌려 듣는 가사파",
    description: "같은 노래도 누구와 헤어진 날에 듣는지, 평범한 퇴근길에 듣는지에 따라 다르게 들려요. 멜로디가 끝난 뒤에도 말 한 줄이 남아서 며칠 동안 생각날 때가 있어요.",
    strength: "친구에게 곡을 보낼 때 왜 하필 오늘 보냈는지 한 문장으로 말해줄 수 있어요.",
    watch: "곡에 담긴 이야기를 따라가다 보면 반주가 가사를 어떻게 받쳐 주는지는 지나치기 쉬워요.",
    tip: "마음에 남은 가사 한 줄 옆에 그때 있던 장소나 시간을 적어 보세요. 나중에 같은 곡을 다시 들으면 달라진 부분이 보일 거예요.",
  },
  {
    image: "arrange.webp",
    alt: "작은 합주실에서 믹서의 조절기를 만지는 손과 베이스, 건반",
    name: "베이스가 먼저 들리는 소리파",
    description: "어제 들은 곡이라도 오늘은 건반이, 내일은 뒤에서 따라오는 베이스가 새로 들려요. 영상 없이도 악기들이 어떻게 자리를 나눠 쓰는지 느껴지는 공연에서 유난히 집중해요.",
    strength: "같은 곡의 녹음과 라이브가 어떻게 다른지 구체적으로 짚어요.",
    watch: "소리를 나눠 듣다가 처음 느꼈던 곡 전체의 분위기를 놓치기도 해요.",
    tip: "좋아하는 곡의 라이브와 음원을 이어서 들어 보세요. 한 번은 전체를 듣고, 한 번은 악기 하나가 언제 들어오는지만 따라가 보세요.",
  },
  {
    image: "discover.webp",
    alt: "초록빛 문이 열린 작은 공연장으로 내려가는 두 사람",
    name: "모르는 곡을 저장하는 발굴파",
    description: "플레이리스트 끝에 자동으로 이어진 낯선 곡을 그냥 흘려보내지 않아요. 가수 이름을 눌러 이전 앨범까지 가 보고, 작은 공연장에서 좋았던 첫 곡을 집에 와서 다시 찾는 타입이에요.",
    strength: "좋은 곡 하나를 매개로 몰랐던 음악가나 장르에 쉽게 닿아요.",
    watch: "발견하는 속도가 빨라지면 저장만 해두고 다시 듣지 않는 곡이 쌓여요.",
    tip: "이번 주 처음 들은 곡 중 세 곡만 별도 목록에 넣어 보세요. 주말에 다시 듣고 다음 앨범까지 찾고 싶은 음악가를 하나 골라 보세요.",
  },
];

const questions = [
  ["지하철 출근길", "헤드폰을 끼고 첫 곡을 고른다. 무엇부터 재생할까?", [
    "발걸음을 가볍게 만들어줄 박자 빠른 곡.",
    "오늘 내 기분을 대신 말해주는 가사가 있는 곡.",
    "베이스가 묵직하게 들어오는 걸 좋아했던 곡.",
    "어젯밤 우연히 저장한 아직 잘 모르는 곡.",
  ]],
  ["첫 15초", "친구가 노래 하나를 보내왔다. 무엇 때문에 끝까지 들을까?", [
    "첫 박자부터 어깨가 들썩인다.",
    "노래의 첫 문장이 와닿는다.",
    "악기들이 차례로 들어오는 방식이 궁금하다.",
    "이런 분위기의 곡은 처음 들어본다.",
  ]],
  ["같은 곡, 다른 녹음", "늘 듣던 노래의 라이브 버전을 찾았다.", [
    "관객 박수에 맞춰 박자가 더 살아나는 순간을 기다린다.",
    "원래 알던 가사를 그날 어떻게 부르는지 듣는다.",
    "드럼이나 건반이 음원과 어떻게 다른지 비교한다.",
    "같은 공연에 나온 다른 팀 영상도 이어서 찾아본다.",
  ]],
  ["공연장 앞", "친구와 작은 공연장에 도착했다. 어디부터 가볼까?", [
    "사람들이 가볍게 박자 타는 자리에 선다.",
    "보컬의 표정과 입모양이 잘 보이는 쪽을 찾는다.",
    "악기 손동작이 잘 보이는 자리로 간다.",
    "아직 이름을 모르는 팀이 연주하는 방으로 들어간다.",
  ]],
  ["플레이리스트 순서", "다음 곡을 고를 때 무엇이 가장 중요할까?", [
    "앞 곡의 기운을 이어갈 만한 속도인지.",
    "앞 곡과 이야기가 이어지거나 다른 시선이 되는지.",
    "소리의 질감이 앞 곡과 이어질 때 어떤 느낌인지.",
    "두 곡 사이에 의외의 한 곡이 들어가도 재미있는지.",
  ]],
  ["후렴 뒤", "좋아하는 부분을 한 군데만 다시 듣는다면?", [
    "리듬이 바뀌고 몸이 먼저 반응하는 부분.",
    "그 말이 드디어 나오며 마음이 풀리는 부분.",
    "보컬이 잠깐 쉬고 악기만 남는 부분.",
    "처음 듣고 예상 못 했던 방식으로 끝나는 부분.",
  ]],
  ["친구에게 한 곡", "퇴근하는 친구에게 딱 한 곡을 보낸다. 뭐라고 덧붙일까?", [
    "‘이거 틀고 걸으면 집까지 금방이야.’",
    "‘두 번째 절에 오늘 네가 한 말이 나와.’",
    "‘이어폰 끼고 마지막 20초만 들어봐.’",
    "‘오늘 처음 들었는데 너도 좋아할 것 같아.’",
  ]],
  ["다시 재생", "일주일이 지나도 손이 가는 곡은 어떤 곡일까?", [
    "출근길 걸음에 가장 잘 맞았던 노래.",
    "기분이 다를 때 들으니 가사가 또 다르게 들린 노래.",
    "몇 번을 들어도 그때마다 다른 악기가 들리는 노래.",
    "듣고 나서 처음부터 앨범 전체를 찾게 된 노래.",
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
 const title = '플레이리스트 취향 테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '내 플레이리스트 취향은 ' + $('type').textContent + '!';
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
       title:'내 플레이리스트 취향은 ' + $('type').textContent + '!',
       description:'플레이리스트 취향 테스트 · 나도 해보기',
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
