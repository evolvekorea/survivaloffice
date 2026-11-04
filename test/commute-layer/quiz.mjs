const types = [
 ['준비된 울 코트','한 번 정한 기준이 있으면 쉽게 흔들리지 않아요. 일정과 변수를 미리 살펴두는 덕분에 급한 순간에도 주변을 챙길 여유가 생겨요.','내일 꼭 해야 할 일 하나만 적고, 나머지는 내일의 나에게 맡겨 보세요.'],
 ['다정한 카디건','함께하는 사람의 기분과 분위기를 빠르게 알아차려요. 작은 안부나 배려가 자연스럽지만, 내 몫의 여유까지 내주지는 않아도 돼요.','부탁에 바로 답하기 전에 오늘 내게 남은 시간을 먼저 확인해 보세요.'],
 ['기민한 바람막이','계획이 바뀌어도 새 길을 금방 찾아요. 일단 해보고 고치는 데 능숙해, 예상 밖의 일이 생길 때 특히 빛나요.','새로운 일에 손대기 전, 오늘 끝낼 일을 하나 골라 마무리해 보세요.'],
 ['내 페이스 머플러','주변이 바빠도 나에게 편한 리듬을 찾는 편이에요. 작은 루틴으로 집중력을 회복하고, 조용히 내 할 일을 끝내요.','퇴근길에 업무 알림을 잠시 끄고 좋아하는 음악 한 곡을 온전히 들어 보세요.'],
];
const portraits = [
 ['노트를 든 네이비 울 코트 차림의 직장인','미리 정해 둔 기준 덕분에 돌발 상황에서도 우선순위를 잡아요.','변수를 모두 막으려다 시작이 늦어질 수 있어요. 꼭 확인할 것 두 가지만 먼저 정해 보세요.'],
 ['커피잔을 든 붉은 카디건 차림의 직장인','회의에서 말이 적어진 사람에게도 자연스럽게 의견을 물어요.','분위기를 챙기느라 정작 내 의견을 미룰 수 있어요. 동료의 말에 답한 뒤 내 생각도 한 문장 덧붙여 보세요.'],
 ['은행잎 사이를 걷는 청록색 바람막이 차림의 직장인','막힌 방법에 시간을 더 쓰기보다 작게 다른 방법을 시험해요.','가능성을 여럿 열어두면 마무리가 밀릴 수 있어요. 새 시도 전에 오늘 끝낼 기준을 정해 보세요.'],
 ['머플러와 헤드폰을 착용한 직장인','주변이 소란스러워도 내 리듬을 되찾아 일에 집중해요.','혼자 정리하는 동안 주변은 상황을 모를 수 있어요. 시간이 필요할 땐 언제 답할지 한마디 알려주세요.'],
];
const scenes = ['07:30 · 현관', '08:20 · 출근길', '10:00 · 회의실', '12:30 · 점심시간', '14:00 · 사무실', '16:00 · 협업', '18:00 · 퇴근길', '22:30 · 집'];
const questions = [
 ['현관에서 날씨를 보니 아침과 낮 기온 차가 크다. 어떻게 나갈까?', '시간대별 예보를 보고 입을 옷을 정한다.', '같이 출근하는 동료에게 겉옷 챙기라고 알려준다.', '벗어 들고 다니기 편한 겉옷을 집는다.', '평소 몸이 편했던 조합을 그대로 입는다.'],
 ['출근길 지하철이 지연된다는 안내가 나왔다.', '지연 시간을 확인하고 도착 시각을 계산한다.', '먼저 기다리고 있을 사람에게 상황을 전한다.', '지금 바로 탈 수 있는 다른 노선을 찾는다.', '약속에 늦지 않는다면 잠시 기다리며 아침 루틴을 이어간다.'],
 ['오전 회의 직전, 발표 순서가 바뀌었다.', '바뀐 순서에 맞춰 자료와 메모를 다시 정리한다.', '함께 발표할 사람과 역할부터 맞춘다.', '지금 가진 자료로 먼저 시작하고 흐름을 맞춘다.', '잠깐 호흡을 고르고 꼭 전할 한 문장을 정한다.'],
 ['따뜻해진 점심시간, 갑자기 30분이 비었다.', '오후 일을 미리 정리해 두고 편하게 쉰다.', '동료에게 같이 잠깐 걸을지 물어본다.', '처음 보는 골목이나 가게를 둘러본다.', '좋아하는 음료를 들고 혼자 바람을 쐰다.'],
 ['오후에 예상하지 못한 업무가 들어왔다.', '마감과 중요도를 확인하고 할 일 순서를 조정한다.', '관련된 사람들에게 필요한 것이 무엇인지 묻는다.', '가장 빨리 처리할 수 있는 부분부터 해본다.', '하던 일을 정리할 시간을 확보한 뒤 전환한다.'],
 ['함께 작업하던 동료와 의견이 엇갈렸다.', '각 방법을 비교할 기준부터 정한다.', '동료가 왜 그렇게 생각하는지 먼저 들어본다.', '작은 예시를 둘 다 만들어 보고 결정한다.', '잠시 생각할 시간을 갖고 차분히 의견을 전한다.'],
 ['퇴근 직전, 저녁 약속이 취소됐다.', '미뤄둔 용무를 하나 끝내기로 한다.', '요즘 못 본 사람에게 저녁이 비었냐고 물어본다.', '지나가다 눈에 띄는 곳에 들러본다.', '집에 일찍 가서 나만의 시간을 보낸다.'],
 ['내일도 일교차가 크다고 한다. 오늘 밤 할 일은?', '가방과 겉옷을 미리 챙겨 둔다.', '내일 만날 사람에게 아침이 쌀쌀하다고 한마디 보낸다.', '가벼운 겉옷만 걸어두고 나머지는 아침에 정한다.', '기상 알람만 맞추고 평소처럼 하루를 마친다.'],
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
 const title = '출근길 옷차림 심리테스트';
 const url = document.querySelector('link[rel=canonical]').href;
 const text = '나를 닮은 겉옷은 ' + $('type').textContent + '!';
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
       title:'나를 닮은 겉옷은 ' + $('type').textContent + '!',
       description:'출근길 옷차림 심리테스트 · 나도 해보기',
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
