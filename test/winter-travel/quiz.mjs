const types = [
  {
    image: "trail.webp",
    alt: "눈 덮인 소나무 길에서 바다를 바라보는 노란색 외투 차림의 여행자",
    name: "눈길 따라 걷는 탐험가",
    description: "차에서 내리자마자 바람이 어디서 부는지 느끼고, 평소에는 볼 수 없는 풍경 앞에서 오래 멈춰요. 많이 돌아다녀서가 아니라 걷는 동안 주변을 내 속도로 볼 수 있어서 여행이 좋아요.",
    strength: "좋은 풍경을 보면 함께 온 사람도 잠깐 멈춰 서게 해요.",
    watch: "예쁜 길을 더 보고 싶어 돌아오는 시간이나 동행의 체력을 잊을 수 있어요.",
    tip: "풍경을 오래 보고 싶은 장소 하나를 고르고, 해가 지기 전 돌아올 시각을 함께 정해 보세요.",
  },
  {
    image: "market.webp",
    alt: "전구가 이어진 겨울 야시장을 걷는 목도리 차림의 친구들",
    name: "불빛을 쫓는 밤마실러",
    description: "저녁에 불이 켜지기 시작하면 숙소에 돌아갈 생각이 싹 사라져요. 겨울 시장의 노래나 광장에 모인 사람들처럼 그날 그 자리에서만 만날 수 있는 장면이 기억에 남아요.",
    strength: "동행이 어색해할 때도 음악이나 골목 가게를 핑계로 같이 즐길 일을 찾아요.",
    watch: "행사 시간을 전부 쫓다 보면 한곳에서 느긋하게 즐기는 시간이 짧아져요.",
    tip: "공연이나 점등 시간 중 하나만 정해두고, 전후로 30분은 발길 가는 대로 걸어 보세요.",
  },
  {
    image: "stay.webp",
    alt: "푸른 겨울 바다가 보이는 창가의 담요와 펼친 책, 김이 오르는 잔",
    name: "창가에 오래 머무는 쉼표형",
    description: "이번 여행에서 가장 하고 싶은 일은 시계를 덜 보는 거예요. 먼 곳까지 와서도 창밖의 파도를 보거나 평소 못 읽던 책을 마저 읽는 시간이 아깝지 않아요.",
    strength: "일정이 바뀌어도 따뜻하고 조용한 곳을 찾아 여행의 리듬을 되찾아요.",
    watch: "동행은 빈 시간을 어떻게 보낼지 모르고 기다릴 수 있어요.",
    tip: "여행 전에 혼자 쉬고 싶은 시간과 같이 나갈 시간을 한 번만 맞춰 보세요. 오전은 각자, 오후 산책은 함께 하는 식이면 충분해요.",
  },
  {
    image: "food.webp",
    alt: "바닷가 골목 식당에서 차려낸 파를 얹은 따뜻한 국수 한 그릇",
    name: "한 그릇으로 기억하는 미식가",
    description: "여행이 끝난 뒤에도 뜨거운 국물과 옆자리 사람들의 말소리가 같이 떠올라요. 유명한 이름을 모아 방문하기보다 그 동네 사람들이 평소 어떤 음식을 먹는지 궁금해요.",
    strength: "식사 한 번을 그 동네 분위기까지 느끼는 시간으로 만들어요.",
    watch: "끼니마다 찾아갈 곳을 정하면 처음 본 골목에 잠깐 들르는 재미를 놓칠 수 있어요.",
    tip: "하루 한 끼만 꼭 먹고 싶은 걸 정하고, 다음 끼니는 걸으며 찾거나 동행에게 골라 달라고 해 보세요.",
  },
];

const questions = [
  ["출발 전", "겨울 주말 이틀이 비었다. 지도에 가장 먼저 찍는 곳은?", [
    "눈 쌓인 산책로와 바다가 함께 보이는 전망대.",
    "퇴근 뒤부터 불이 켜지는 겨울 야시장.",
    "밖에 안 나가도 바다가 보이는 조용한 숙소.",
    "오래 끓인 국물을 내는 작은 동네 식당.",
  ]],
  ["도착 직후", "짐을 내려놓고 해 지기 전 한 시간쯤 남았다.", [
    "바다 쪽으로 이어지는 길을 따라 한 번 걸어본다.",
    "저녁 행사가 시작되는 광장으로 먼저 가 본다.",
    "창가 좋은 자리에 앉아 따뜻한 차부터 마신다.",
    "저녁에 갈 만한 식당의 입구와 메뉴를 둘러본다.",
  ]],
  ["출발이 늦어질 때", "함께 온 친구가 아침에 한 시간만 더 쉬자고 한다.", [
    "가까운 산책길만 먼저 혼자 한 바퀴 돈다.",
    "늦게까지 열리는 축제나 시장을 찾아본다.",
    "좋다고 하고 나도 책을 읽거나 조금 더 잔다.",
    "늦게 나가도 따뜻한 아침을 먹을 곳을 찾아본다.",
  ]],
  ["발길이 멈추는 곳", "바닷가 골목을 걷다가 뭐가 보이면 속도를 늦출까?", [
    "계단 사이로 파란 바다가 보이는 작은 샛길.",
    "전구를 걸기 시작한 광장과 쌀쌀한 바람 속 음악.",
    "김이 서린 창과 푹신한 의자가 보이는 찻집.",
    "가게 앞 솥에서 김이 오르고 사람들이 모이는 모습.",
  ]],
  ["눈이 오기 시작하면", "예상보다 눈발이 굵어졌다. 다음 일정은 어떻게 바꿀까?", [
    "무리하지 않고 가까운 곳에서 눈 풍경을 볼 수 있는 길을 고른다.",
    "실내 공연이나 지붕 있는 시장을 찾아본다.",
    "따뜻한 곳에 자리를 잡고 창밖에 내리는 눈을 본다.",
    "근처에서 뜨거운 국물이나 군고구마를 먹는다.",
  ]],
  ["함께할 한 가지", "동행이 딱 한 가지만 계획에 넣어달라고 한다면?", [
    "아침 공기를 마시며 함께 걷는 짧은 산책.",
    "광장에 불이 켜지는 순간 같이 보기.",
    "오후 일정 사이에 따뜻한 곳에서 쉬어가는 시간.",
    "각자 다른 동네 음식을 골라 한입씩 나눠 먹기.",
  ]],
  ["여행 사진", "집에 보내고 싶은 사진 딱 한 장을 고른다면?", [
    "발자국이 이어진 하얀 길과 뒤로 펼쳐지는 바다.",
    "노란 전구가 켜지고 사람들이 모이는 겨울 시장.",
    "창가에 놓인 머그잔 너머 흐린 겨울 바다.",
    "끝까지 따뜻해서 기억에 남은 국수 한 그릇.",
  ]],
  ["돌아가는 날", "돌아가는 기차에서 어떤 말이 먼저 나올까?", [
    "다음에는 저 길이 어디까지 이어지는지 가 보자.",
    "다음에는 다른 도시의 밤 축제도 가 보자.",
    "이렇게 아무것도 안 해도 좋은 여행이었어.",
    "그 국수집은 다음에도 꼭 다시 가고 싶어.",
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
 const title = '겨울 여행 스타일 테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '내 겨울 여행 유형은 ' + $('type').textContent + '!';
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
       title:'내 겨울 여행 유형은 ' + $('type').textContent + '!',
       description:'겨울 여행 스타일 테스트 · 나도 해보기',
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
