(()=>{'use strict';
const QUESTIONS=[
{e:'🍂',q:'선선한 가을 주말, 더 끌리는 시간은?',a:['단풍길을 천천히 걸으며 생각 정리하기','친구들과 새로운 장소로 떠나기'],s:['walk','camp']},
{e:'☕',q:'카페에 들어갔을 때 고르는 자리는?',a:['사람들과 이야기하기 좋은 넓은 테이블','창가의 조용하고 포근한 자리'],s:['latte','knit']},
{e:'📖',q:'갑자기 비가 내리는 가을 저녁에는?',a:['책이나 영화를 보며 혼자 깊이 빠져든다','밀린 일을 정리하고 내일 계획을 세운다'],s:['read','harvest']},
{e:'🍁',q:'가을 풍경에서 가장 먼저 눈에 들어오는 것은?',a:['낙엽의 색과 바람에 흔들리는 작은 장면','넓은 들판과 풍성하게 익은 열매'],s:['walk','harvest']},
{e:'🧶',q:'지친 친구가 찾아왔을 때 나는?',a:['말없이 곁을 지키며 편안하게 해준다','따뜻한 음료와 대화로 기분을 풀어준다'],s:['knit','latte']},
{e:'⛺',q:'예정에 없던 가을 여행 제안이 왔다면?',a:['일단 가보자! 새로운 경험이 기대된다','일정과 준비물을 확인한 뒤 결정한다'],s:['camp','harvest']},
{e:'🎵',q:'나만의 가을 플레이리스트를 만든다면?',a:['가사를 곱씹게 되는 잔잔하고 깊은 음악','함께 들으면 분위기가 좋아지는 부드러운 음악'],s:['read','latte']},
{e:'🌰',q:'복잡한 고민이 생겼을 때 해결하는 방식은?',a:['혼자 걸으며 마음의 속도를 천천히 맞춘다','익숙한 공간에서 충분히 쉬고 마음을 돌본다'],s:['walk','knit']},
{e:'🌙',q:'가을밤 가장 설레는 장면은?',a:['별 아래 모닥불과 처음 만나는 풍경','스탠드 불빛 아래 펼친 책 한 권'],s:['camp','read']},
{e:'🧺',q:'해야 할 일이 여러 개 쌓이면?',a:['순서를 정하고 하나씩 끝내야 마음이 놓인다','분위기 좋은 곳에서 누군가와 함께 풀어간다'],s:['harvest','latte']},
{e:'🧣',q:'사람들이 나에게 자주 하는 말은?',a:['같이 있으면 편안하고 마음이 놓여','생각이 깊고 너만의 취향이 확실해'],s:['knit','read']},
{e:'🚶',q:'이번 가을, 꼭 남기고 싶은 기억은?',a:['조용한 산책길에서 발견한 나만의 장면','망설이지 않고 떠난 짜릿한 모험'],s:['walk','camp']}
];
const RESULTS={
walk:{name:'단풍길 산책형',quote:'천천히 걸을수록 더 많은 것을 발견하는 사람',desc:'당신은 자신의 속도를 잃지 않는 섬세한 관찰자예요. 복잡한 마음도 조용히 걸으며 정리하고, 다른 사람이 지나치는 작은 아름다움을 발견합니다.',traits:['세심한 관찰력','차분한 감성','나만의 속도'],activity:'단풍 명소 산책과 필름 사진',food:'군고구마와 따뜻한 차',match:'포근한 니트형',contrast:'가을밤 캠핑형',image:'maple-walk.webp'},
knit:{name:'포근한 니트형',quote:'곁에 있는 것만으로 마음을 데워주는 사람',desc:'부드럽고 다정한 당신은 주변 사람에게 안정감을 줍니다. 화려하게 나서지 않아도 진심 어린 배려로 관계를 오래 따뜻하게 지켜요.',traits:['다정한 배려','편안한 안정감','따뜻한 공감'],activity:'담요 속 가을 영화와 홈카페',food:'시나몬 쿠키와 밀크티',match:'단풍길 산책형',contrast:'풍성한 수확형',image:'cozy-knit.webp'},
latte:{name:'따뜻한 라떼형',quote:'좋은 대화로 평범한 하루를 특별하게',desc:'사람과 분위기를 사랑하는 부드러운 사교형이에요. 상대의 기분을 자연스럽게 살피며, 편안한 대화로 누구와도 따뜻한 시간을 만듭니다.',traits:['부드러운 사교성','분위기 메이커','공감 대화'],activity:'테라스 카페에서 친구와 수다',food:'단호박 라떼와 스콘',match:'풍성한 수확형',contrast:'감성 독서형',image:'warm-latte.webp'},
camp:{name:'가을밤 캠핑형',quote:'새로운 풍경 앞에서 가장 생생해지는 사람',desc:'호기심과 행동력이 가득한 자유로운 모험가예요. 낯선 경험을 두려워하기보다 직접 부딪치며, 예상 밖의 순간을 최고의 추억으로 만듭니다.',traits:['강한 호기심','즉흥적 행동력','자유로운 에너지'],activity:'별 보기 캠핑과 야간 드라이브',food:'모닥불 마시멜로와 바비큐',match:'따뜻한 라떼형',contrast:'단풍길 산책형',image:'night-camping.webp'},
read:{name:'감성 독서형',quote:'고요한 시간 속에서 마음의 문장을 찾는 사람',desc:'조용하지만 생각이 깊고 자신만의 취향이 선명해요. 혼자 있는 시간에서 에너지를 채우며, 경험을 오래 음미해 자신만의 의미로 남깁니다.',traits:['깊은 사색','선명한 취향','풍부한 상상력'],activity:'독립서점 탐방과 가을 일기',food:'밤양갱과 홍차',match:'포근한 니트형',contrast:'따뜻한 라떼형',image:'quiet-reading.webp'},
harvest:{name:'풍성한 수확형',quote:'오늘의 작은 노력을 내일의 결실로 만드는 사람',desc:'현실적이고 성실하며 맡은 일을 끝까지 해내는 든든한 유형이에요. 계획을 세우고 차근차근 쌓아 올려 주변 사람까지 풍요롭게 만듭니다.',traits:['꾸준한 실행력','현실적인 계획','든든한 책임감'],activity:'가을 장터와 제철 요리 만들기',food:'밤밥과 사과파이',match:'따뜻한 라떼형',contrast:'가을밤 캠핑형',image:'rich-harvest.webp'}
};
const $=s=>document.querySelector(s),ui={start:$('#startScreen'),quiz:$('#quizScreen'),result:$('#resultScreen'),startBtn:$('#startButton'),back:$('#backButton'),a:$('#answerA'),b:$('#answerB'),q:$('#questionText'),emoji:$('#questionEmoji'),num:$('#questionNumber'),current:$('#currentNumber'),bar:$('#progressBar'),name:$('#resultName'),quote:$('#resultQuote'),image:$('#resultImage'),desc:$('#resultDescription'),traits:$('#resultTraits'),activity:$('#resultActivity'),food:$('#resultFood'),match:$('#resultMatch'),contrast:$('#resultContrast'),share:$('#shareKakao'),restart:$('#restartButton')};
let index=0,answers=[],latest='walk';
function show(el){[ui.start,ui.quiz,ui.result].forEach(x=>x.hidden=x!==el);scrollTo({top:0,behavior:'smooth'})}
function render(){const item=QUESTIONS[index];ui.num.textContent=`QUESTION ${String(index+1).padStart(2,'0')}`;ui.current.textContent=index+1;ui.bar.style.width=`${(index+1)/QUESTIONS.length*100}%`;ui.emoji.textContent=item.e;ui.q.textContent=item.q;ui.a.textContent=item.a[0];ui.b.textContent=item.a[1];ui.back.hidden=index===0}
function choose(choice){answers[index]=choice;if(index<QUESTIONS.length-1){index++;render()}else finish()}
function finish(){const score=Object.fromEntries(Object.keys(RESULTS).map(k=>[k,0]));QUESTIONS.forEach((q,i)=>score[q.s[answers[i]]]++);latest=Object.keys(score).sort((a,b)=>score[b]-score[a])[0];const r=RESULTS[latest];ui.name.textContent=r.name;ui.quote.textContent=`“${r.quote}”`;ui.image.src=`/images/autumn-type/${r.image}`;ui.image.alt=`${r.name} 결과 이미지`;ui.desc.textContent=r.desc;ui.traits.replaceChildren(...r.traits.map(t=>Object.assign(document.createElement('span'),{textContent:`# ${t}`})));ui.activity.textContent=r.activity;ui.food.textContent=r.food;ui.match.textContent=r.match;ui.contrast.textContent=r.contrast;show(ui.result)}
function reset(){index=0;answers=[];render();show(ui.quiz)}
function share(){const r=RESULTS[latest],url='https://www.survivaloffice.com/test/autumn-type/';if(!window.Kakao){alert('카카오톡 공유를 불러오지 못했습니다.');return}if(!Kakao.isInitialized())Kakao.init('eee6c2e01641161de9f217ba99c6a0da');Kakao.Link.sendDefault({objectType:'feed',content:{title:`나의 가을 감성은 ${r.name}`,description:r.quote,imageUrl:`https://www.survivaloffice.com/images/autumn-type/${r.image}`,link:{mobileWebUrl:url,webUrl:url}},buttons:[{title:'나도 가을 유형 찾기',link:{mobileWebUrl:url,webUrl:url}}]})}
ui.startBtn.addEventListener('click',()=>{render();show(ui.quiz)});ui.a.addEventListener('click',()=>choose(0));ui.b.addEventListener('click',()=>choose(1));ui.back.addEventListener('click',()=>{if(index>0){index--;render()}});ui.restart.addEventListener('click',reset);ui.share.addEventListener('click',share);
})();
