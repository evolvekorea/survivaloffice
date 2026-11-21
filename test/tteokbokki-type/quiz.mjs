const types = [
  {
    image: 'classic.webp', alt: '검은 냄비에 담긴 빨간 국물떡볶이',
    name: '판을 여는 국물떡볶이',
    description: '단톡방에 「아무거나」만 오가면 먼저 날짜와 장소를 올리는 편이에요. 국물떡볶이처럼 존재감이 확실해서 흐지부지될 뻔한 모임도 일단 시작하게 만들어요.',
    strength: '무엇부터 할지 말해 주면 다들 다음 행동을 고르기 쉬워져요.',
    watch: '결정이 빠른 만큼 아직 고민 중인 사람의 의견을 지나칠 수 있어요.',
    tip: '장소를 제안한 뒤 「여기 어때? 다른 데 있으면 점심 전까지 알려줘」라고 답할 시간을 남겨 보세요.',
  },
  {
    image: 'rose.webp', alt: '분홍색 그릇에 담긴 크리미한 로제 떡볶이',
    name: '입맛을 맞추는 로제 떡볶이',
    description: '한 명은 매운맛, 한 명은 순한 맛을 원할 때 두 사람 모두 한입씩 즐길 방법이 떠올라요. 어색한 자리에서도 각자의 취향을 묻는 덕분에 사람들이 편하게 의견을 내요.',
    strength: '말이 적어진 사람도 대화에 끼어들 수 있게 가볍게 말을 건네요.',
    watch: '모두에게 맞추다 보면 내가 원했던 건 뒤늦게 떠오를 때가 있어요.',
    tip: '주문하기 전에 「나는 로제가 먹고 싶은데, 너는?」처럼 내 취향을 첫 문장에 담아 보세요.',
  },
  {
    image: 'cheese.webp', alt: '젓가락 끝에서 치즈가 길게 늘어나는 떡볶이',
    name: '한 수 더하는 치즈 떡볶이',
    description: '늘 가던 가게에서도 처음 보는 토핑이나 조합부터 눈에 들어와요. 아무 계획 없던 저녁에 짧은 산책이나 웃긴 사진 한 장을 더해 오래 기억할 순간을 만들어요.',
    strength: '정해 둔 계획이 틀어져도 곧 다른 재미를 찾아 분위기를 살려요.',
    watch: '해 보고 싶은 게 많아서 시간과 예산을 놓치면 함께 온 사람이 먼저 지칠 수 있어요.',
    tip: '새로운 걸 하나만 곁들이고, 나머지는 모두가 좋아하는 익숙한 메뉴로 채워 보세요.',
  },
  {
    image: 'soy.webp', alt: '청록색 접시에 담긴 채소와 간장 떡볶이',
    name: '속도를 지키는 간장 떡볶이',
    description: '사람 많은 신상 가게 앞에서는 줄부터 보고, 여유 있게 먹을 자리가 있는지 살펴요. 담백한 간장 떡볶이처럼 편안한 흐름을 만들어 같이 있는 사람도 한숨 돌리게 해요.',
    strength: '바쁜 날에도 끝나는 시간과 돌아갈 길을 챙겨 모임에 무리가 없게 해요.',
    watch: '속으로만 기준을 세우면 친구들은 왜 마음에 들지 않는지 알기 어려워요.',
    tip: '약속을 잡을 때 「내일 일찍 일어나야 해서 8시 반에는 나가야 해」처럼 편한 조건을 미리 말해 보세요.',
  },
];

const questions = [
  ['점심 단톡방', '점심 메뉴를 정하는 단톡방에 「난 다 좋아」만 세 번 올라왔다.', [
    '가까운 분식집 링크를 올리고 12시에 가자고 한다.',
    '아직 답 안 한 사람에게 못 먹는 메뉴가 있는지 묻는다.',
    '새로 나온 떡볶이 사진을 보고 오늘 한 번 먹어 보자고 한다.',
    '시간을 보고, 여유 있게 먹고 올 수 있는 가게를 고른다.',
  ]],
  ['메뉴판 앞', '자리에 앉자마자 직원이 주문하러 왔다. 메뉴판 첫 장도 못 봤다면?', [
    '제일 유명한 기본 떡볶이부터 주문하고 나머지는 천천히 고른다.',
    '다들 어느 정도 매운맛까지 먹는지 먼저 확인한다.',
    '사진에서 처음 본 조합을 하나 물어본다.',
    '잠깐만 시간을 달라고 하고 메뉴를 차분히 훑어본다.',
  ]],
  ['첫 주문', '함께 온 친구 한 명이 매운맛은 자신 없다고 한다.', [
    '순한 기본 메뉴로 바로 바꿔 주문한다.',
    '두 가지 맛을 작은 접시로 나눠 모두 한입씩 먹자고 한다.',
    '안 맵게 먹을 수 있는 색다른 토핑이 있는지 물어본다.',
    '친구가 평소에 편하게 먹는 맛이 있으면 그걸로 고른다.',
  ]],
  ['기다리는 동안', '퇴근길에 들른 가게 앞에 25분 대기 안내가 붙어 있다.', [
    '근처에서 바로 들어갈 수 있는 곳을 찾아 제안한다.',
    '같이 온 사람이 얼마나 기다릴 수 있는지 먼저 묻는다.',
    '잠시 골목을 구경하고 돌아오자고 한다.',
    '늦게 먹으면 피곤할 것 같아 다음에 오기로 한다.',
  ]],
  ['첫 입', '내가 고른 떡볶이가 예상보다 훨씬 맛있다.', [
    '다음에 먼저 주문할 메뉴 하나가 생겼다고 생각한다.',
    '먹어 보라고 친구 접시에 한 조각 건넨다.',
    '다음 한입은 튀김을 소스에 찍어 다른 맛을 본다.',
    '휴대폰을 잠시 내려놓고 식기 전에 천천히 먹는다.',
  ]],
  ['사이드 메뉴', '다들 배가 거의 찼는데 옆 테이블에서 맛있는 냄새가 난다.', [
    '추가 주문할지 지금 의견을 모아 깔끔하게 정한다.',
    '아쉬워하는 사람이 있으면 작은 접시로 나눠 먹자고 한다.',
    '처음 보는 메뉴라 한 접시만 맛보고 싶다.',
    '지금이 딱 기분 좋게 배불러서 다음에 먹기로 한다.',
  ]],
  ['예상 밖의 주문', '주문한 토핑이 품절이라고 한다.', [
    '가장 무난한 토핑을 골라 바로 바꾼다.',
    '그 토핑을 제일 기대한 사람에게 대안을 고르게 한다.',
    '직원에게 평소 잘 안 시키지만 맛있는 조합을 추천받는다.',
    '원래 메뉴만으로 충분하면 토핑 없이 먹는다.',
  ]],
  ['계산 뒤', '다 먹고 나왔는데 친구가 「그냥 헤어지기 아쉽다」고 한다.', [
    '근처 카페를 하나 골라 갈 사람부터 정한다.',
    '아직 집에 가기 아쉬운 사람이 더 있는지 물어본다.',
    '가는 길에 보였던 즉석 사진관에 들르자고 한다.',
    '다음 날 부담 없게 역까지 천천히 함께 걷자고 한다.',
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
 const title = '떡볶이 취향 테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '나를 닮은 떡볶이는 ' + $('type').textContent + '!';
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
       title:'나를 닮은 떡볶이는 ' + $('type').textContent + '!',
       description:'떡볶이 취향 테스트 · 나도 해보기',
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
