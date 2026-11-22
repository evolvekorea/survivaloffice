const types = [
  {"image": "compare.webp", "alt": "가격표 여러 장을 들여다보는 민트색 돋보기 캐릭터", "name": "비교왕 돋보기", "description": "장바구니에 하나를 담으면 비슷한 물건도 두세 개 열어 봐요. 인터넷 창이 열 개쯤 쌓여도 마지막에는 무엇을 기준으로 골랐는지 설명할 수 있어요.", "strength": "배송비나 반품 조건처럼 할인 표시 아래 숨어 있는 차이를 잘 발견해요.", "watch": "선택에 큰 영향이 없는 차이까지 살피다 보면 정작 중요한 기준을 놓칠 수 있어요.", "tip": "검색을 더 하기 전에 비교할 기준을 두 개만 적어 보세요. 둘 다 충족하면 남은 탭은 닫아도 좋아요."},
  {"image": "quick.webp", "alt": "택배 상자 하나를 싣고 달리는 파란 장바구니 카트", "name": "직진 결제 카트", "description": "이미 필요하다고 생각해 둔 물건을 발견하면 결정을 미루지 않아요. 남들이 후기 읽다가 주말을 다 보낼 때, 당신은 주문을 끝내고 다른 일로 넘어가요.", "strength": "필요한 조건이 맞을 때 시간을 낭비하지 않고 결정을 내릴 줄 알아요.", "watch": "한정 수량이나 마감 타이머를 보면 평소 기준보다 속도를 앞세우기 쉬워요.", "tip": "결제 버튼 앞에서 옵션과 수량만 한 번 더 읽어 보세요. 평소의 빠른 결정에 확인 한 번이면 충분해요."},
  {"image": "curate.webp", "alt": "보라색 니트 앞에서 색 견본을 들어 보는 라벤더색 캐릭터", "name": "취향 수집가 스와치", "description": "같은 니트라도 색감과 질감에 따라 손이 가는 횟수가 달라진다고 생각해요. 옷장에 있는 것과 어울리는 장면이 떠오르면 할인율보다 그 조합이 오래 기억에 남아요.", "strength": "자주 쓸 물건을 고를 때 나만의 기준이 분명해요.", "watch": "첫눈에 마음에 든 색이나 디자인 때문에 불편한 부분을 대수롭지 않게 넘길 수 있어요.", "tip": "이미 가진 물건과 어울리는 조합을 두 가지 떠올려 보세요. 이번 주에 쓸 장면이 하나라도 있으면 더 쉽게 판단할 수 있어요."},
  {"image": "pause.webp", "alt": "달이 뜬 창가에서 닫힌 노트북 옆을 지키는 금빛 모래시계 캐릭터", "name": "하루 묵히는 모래시계", "description": "마음에 드는 물건을 봐도 일단 저장해 두고 창을 닫아요. 다음 날에도 생각나는 물건과 세일 배너를 볼 때만 끌렸던 물건을 잘 구분하는 편이에요.", "strength": "주변에서 다 산다고 해도 내 생활에 필요한지 차분히 살펴요.", "watch": "오래 봐 온 물건도 계속 미루면 다시 찾아보는 데 시간을 쓰게 돼요.", "tip": "관심 있는 물건 하나에 다시 볼 날짜를 정해 두세요. 그날 평소대로 쓰는 모습이 떠오르면 결정을 마무리해 보세요."},
];

const questions = [
  ["세일 첫날", "퇴근길에 블랙프라이데이 알림이 떴다. 가장 먼저 하는 일은?", ["같은 모델을 파는 다른 쇼핑몰도 열어 본다.", "이미 사려던 물건의 할인부터 확인한다.", "눈에 띈 색이나 디자인을 골라 저장한다.", "알림만 닫고 저녁에 생각나면 다시 본다."]],
  ["비슷한 두 상품", "가격대가 비슷한 헤드폰 두 개가 화면에 나란히 보인다.", ["무게와 배터리처럼 자주 체감할 차이를 비교한다.", "내가 정해 둔 조건을 먼저 충족한 쪽을 고른다.", "가방에 넣고 다닐 때 더 마음에 드는 디자인을 본다.", "지금 쓰는 헤드폰의 어떤 점이 아쉬웠는지 다시 생각한다."]],
  ["마감 타이머", "장바구니에 넣으니 쿠폰이 5분 뒤 사라진다고 뜬다.", ["배송비까지 포함한 가격을 다른 곳과 빠르게 비교한다.", "원래 사기로 한 물건이면 바로 결제한다.", "색과 옵션이 정말 원하는 조합인지 마지막으로 본다.", "타이머 때문에 고민하는 거라면 일단 창을 닫는다."]],
  ["친구의 링크", "친구가 니트 링크를 보내며 네가 좋아할 것 같다고 한다.", ["소재와 관리 방법부터 훑어본다.", "평소 찾던 핏과 사이즈라면 바로 주문한다.", "옷장에 있는 바지 두 벌과 매치해 본다.", "저장해 두고 내일도 생각나는지 본다."]],
  ["무료 배송", "무료 배송까지 8천 원이 남았다. 화면에 추천 상품이 뜬다.", ["배송비를 내는 경우와 추가 구매 총액을 비교한다.", "지금 필요한 물건만 결제하고 화면을 닫는다.", "원래 담은 것과 같이 써보고 싶던 물건이 있는지 본다.", "추가하기 전에 왜 배송비에 신경 쓰였는지 잠깐 생각한다."]],
  ["후기가 엇갈릴 때", "별점은 높지만 어떤 후기에서 불편한 점을 지적했다.", ["같은 불편을 말한 사람이 얼마나 많은지 찾아본다.", "내가 중요하게 보는 단점이 아니면 결정한다.", "후기 사진의 실제 색이나 질감을 찾아본다.", "이번 주에 꼭 필요한 게 아니면 보류한다."]],
  ["택배가 도착했다", "오래 구경하던 물건이 드디어 도착했다. 어떤 순간이 가장 즐거운가?", ["고민했던 조건들이 실제로 잘 맞는 걸 확인할 때.", "택배를 받자마자 꺼내 쓸 수 있을 때.", "집에 있던 물건과 기대한 대로 잘 어울릴 때.", "며칠이 지나도 여전히 잘 골랐다는 생각이 들 때."]],
  ["세일 마지막 날", "장바구니에 아직 결제하지 않은 물건이 세 개 있다.", ["최종 가격과 반품 조건을 다시 보고 하나 고른다.", "이번 주 안에 쓸 물건만 남기고 결제한다.", "갖고 있는 물건과 가장 자주 쓸 조합을 고른다.", "며칠 동안 한 번도 떠오르지 않았던 것은 지운다."]],
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
 const title = '쇼핑 성향 테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '내 장바구니 유형은 ' + $('type').textContent + '!';
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
       title:'내 장바구니 유형은 ' + $('type').textContent + '!',
       description:'쇼핑 성향 테스트 · 나도 해보기',
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
