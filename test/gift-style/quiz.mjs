const types = [
 ['취향 수집가','상대가 무심코 했던 말을 기억해 두었다가 선물에 담아요. 여러 사람에게 무난한 것보다 그 사람에게 꼭 맞는 하나를 찾는 시간이 즐거워요.','완벽한 물건을 찾느라 지쳤다면, 떠올린 이유를 짧게 적어 함께 건네 보세요.'],
 ['다정한 나눔러','같은 자리에서 웃으며 나눌 수 있는 선물을 좋아해요. 한 사람의 큰 감동만큼, 함께 있는 모두가 소외되지 않는 분위기를 중요하게 여겨요.','모두를 챙기는 날에도 내 몫 하나는 남겨 두세요. 작은 나눔은 부담 없는 범위에서 오래 이어져요.'],
 ['반전 연출가','포장을 열기 전의 궁금함과 뜻밖의 웃음을 선물해요. 물건의 쓰임뿐 아니라 건네는 순간의 이야기까지 함께 상상하는 편이에요.','놀라움의 크기보다 상대가 편하게 즐길 수 있는지를 먼저 떠올려 보세요.'],
 ['진심 기록가','크고 화려한 선물보다 왜 이 사람에게 주고 싶은지를 먼저 생각해요. 짧은 메모나 함께한 기억이 선물의 온도를 높인다고 느껴요.','막연한 칭찬보다 함께했던 장면 하나를 적으면 마음이 더 선명하게 전해져요.'],
];
const portraits = [
 ['작은 선물을 정성스럽게 포장하는 직장인','말 속의 힌트를 잘 포착해 상대의 필요와 취향을 연결해요.','상대의 만족을 혼자 책임지려다 선택이 어려워질 수 있어요. 예산과 후보 수를 먼저 정해 보세요.'],
 ['개별 포장한 간식을 바구니에 담아 나누는 직장인','낯선 사람도 쉽게 참여할 수 있는 편안한 분위기를 만들어요.','한꺼번에 많은 사람을 챙기다 내 시간과 비용을 넘기지 않는지 살펴보세요.'],
 ['별 장식 리본의 선물 상자를 들고 웃는 직장인','익숙한 관계에도 새로운 장면과 대화의 계기를 만들어요.','나에게 재미있는 연출이 상대에게도 편한지 확인해 보세요. 공개적인 이벤트가 부담스러운 사람도 있어요.'],
 ['작은 소포 옆에서 개인적인 편지를 쓰는 직장인','평소 잘 표현하지 못했던 고마움을 구체적인 말로 전달해요.','마음을 정확히 표현하려다 전달을 미루기 쉬워요. 짧고 서툰 한 문장도 충분해요.'],
];
const scenes=['01 · 고르기','02 · 기억하기','03 · 예산','04 · 포장','05 · 건네기','06 · 예상 밖 상황','07 · 답례','08 · 돌아보기'];
const questions = [
 ['기념일에 동료에게 작은 선물을 고른다면?', '최근 갖고 싶다고 했던 물건을 찾아본다.', '다 같이 나눠 먹을 수 있는 간식을 고른다.', '받자마자 웃을 만한 색다른 것을 찾는다.', '짧은 편지를 먼저 쓰고 어울리는 선물을 고른다.'],
 ['선물할 사람을 떠올릴 때 가장 먼저 생각나는 것은?', '평소 자주 쓰는 물건과 좋아하는 취향.', '함께 있을 때 편안하고 즐거웠던 분위기.', '둘이 웃으며 이야기했던 엉뚱한 장면.', '고맙다고 말하고 싶었지만 넘겼던 순간.'],
 ['생각했던 것보다 선물 가격이 높다. 나는?', '원했던 기능이나 취향을 살리면서 다른 후보를 찾는다.', '부담 없는 크기로 바꿔 여러 사람이 즐길 것을 고른다.', '작은 물건이라도 재미있는 조합으로 새로 구성한다.', '예산 안에서 고르고 진심 어린 메시지를 더한다.'],
 ['물건을 골랐다. 포장은 어떻게 할까?', '선물 색과 상대 취향에 맞춰 단정하게 꾸민다.', '받고 나눠 갖기 편하도록 작게 나눈다.', '리본이나 색을 활용해 열어보는 재미를 만든다.', '이름과 손글씨가 보이는 카드를 붙인다.'],
 ['선물을 건네는 순간, 내게 더 자연스러운 방식은?', '왜 이 물건을 골랐는지 짧게 알려준다.', '다 같이 쉬는 시간에 부담 없이 나눈다.', '상대가 편한 자리에서 작은 깜짝 연출을 한다.', '둘만 있을 때 고마웠던 일을 말하며 건넨다.'],
 ['선물을 주려던 사람이 이미 같은 물건을 갖고 있다면?', '바꿀 수 있는 다른 후보를 알아본다.', '함께 쓸 수 있거나 나눌 방법을 찾아본다.', '다르게 활용할 재미있는 방법을 떠올린다.', '그 사람을 떠올리며 고른 이유부터 전한다.'],
 ['뜻밖의 답례를 받았을 때 나는?', '상대가 내 취향을 어떻게 기억했는지 눈에 들어온다.', '다음에 함께 나눌 기회를 자연스럽게 떠올린다.', '선물에 담긴 예상 밖 아이디어가 오래 기억난다.', '상대의 말이나 카드 내용을 다시 읽어본다.'],
 ['시간이 지난 뒤에도 좋은 선물이었다고 느끼는 때는?', '상대가 실제로 잘 쓰는 모습을 봤을 때.', '다 같이 나누던 순간이 좋은 기억으로 남았을 때.', '그날의 반응이 둘만의 재미있는 이야기가 됐을 때.', '전하고 싶었던 고마움이 잘 닿았다고 느낄 때.'],
];
const $ = id => document.getElementById(id);
const picks = [];
let step = 0;
function show(id) {
 for (const panel of ['start','quiz','result']) $(panel).hidden = panel !== id;
}
function render() {
 show('quiz');
 $('step').textContent = 'QUESTION ' + String(step + 1).padStart(2,'0') + ' / ' + questions.length;
 $('scene').textContent = scenes[step];
 $('progress').value = step + 1;
 $('question').textContent = questions[step][0];
 $('back').disabled = step === 0;
 $('answers').replaceChildren(...Array.from({length:4}, (_, position) => {
   const type = (position + step) % 4;
   const button = document.createElement('button');
   button.textContent = questions[step][type + 1];
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
 const [name, desc, tip] = types[winner];
 const [alt, strength, watch] = portraits[winner];
 $('portrait').dataset.type = winner;
 $('portrait').setAttribute('aria-label', alt);
 $('strength').textContent = strength;
 $('watch').textContent = watch;
 $('type').textContent = name;
 $('desc').textContent = desc;
 $('tip').textContent = tip;
 $('share-status').textContent = '';
 $('share-text').hidden = true;
 show('result');
 $('type').focus({preventScroll:true});
}
$('begin').onclick = () => { step = 0; picks.length = 0; render(); };
$('back').onclick = () => { if (step > 0) { step--; render(); } };
$('restart').onclick = () => { show('start'); $('begin').focus(); };
$('share').onclick = async () => {
 const title = '선물 취향 심리테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '나의 선물 메이트 유형은 ' + $('type').textContent + '!';
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
       title:'나의 선물 메이트 유형은 ' + $('type').textContent + '!',
       description:'선물 취향 심리테스트 · 나도 해보기',
       imageUrl:document.querySelector('meta[property="og:image"]').content,
       link,
     },
     buttons:[{title:'테스트 하러 가기', link}],
   });
   status.textContent = '';
 } catch {
   status.textContent = '카카오톡 공유를 열지 못했어요. 다른 방법으로 공유해 주세요.';
 }
};
