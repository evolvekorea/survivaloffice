(() => {
  document.documentElement.dataset.storyBuild='20260814b';
  const $ = (selector) => document.querySelector(selector);
  const imageBase = 'assets/images/';
  const initialState = () => ({health:100,trust:0,rescued:0,minute:47,items:[],flags:{},sceneNumber:1,path:[]});
  let state = initialState();
  let currentScene = 'opening';
  let choiceRevealId = null;
  let audioOn = true;

  const scenes = {
    opening:{image:'office-dusk.webp',alt:'해 질 무렵 텅 빈 사무실과 복도의 수상한 경비원',location:'17층 사무실',mood:'calm',title:'금요일 오후 5시 47분',text:[
      '<strong class="impact">퇴근까지 13분.</strong> 오늘만큼은 6시에 정확히 회사를 나가야 합니다.',
      '컴퓨터 종료 버튼을 누르려던 순간, 복도 조명이 한꺼번에 꺼집니다.',
      '<span class="broadcast">[사내 긴급방송] 전 임직원은 현재 위치에서 대기해 주십시오.</span>',
      '방송은 비명과 함께 끊깁니다. 유리문 너머에는 경비원 한 명이 고개를 떨군 채 서 있습니다.'
    ],next:'door'},
    door:{image:'glass-door.webp',alt:'유리문을 두드리는 지수와 뒤에서 다가오는 좀비 경비원',location:'17층 출입문',mood:'danger',title:'문밖의 지수',text:[
      '<span class="danger">쿵. 쿵.</span>',
      '팀 막내 지수가 유리문을 두드립니다. 뒤쪽에서는 눈빛이 달라진 경비원이 천천히 다가옵니다.',
      '<span class="message">지수 · 문 좀 열어주세요. 빨리요!</span>'
    ],question:'지수를 어떻게 하시겠습니까?',choices:[
      {label:'문을 열어 지수를 구한다',effect:{trust:2,rescued:1,flags:{jisu:true}},flash:'지수가 합류했습니다',next:'plan'},
      {label:'감염됐을 수 있으니 문을 잠근다',effect:{trust:-2,flags:{leftJisu:true}},flash:'동료들이 당신을 바라봅니다',next:'plan'},
      {label:'지수에게 뒤를 보라고 소리친다',effect:{trust:1,rescued:1,flags:{jisu:true}},flash:'지수가 몸을 피해 사무실로 들어왔습니다',next:'plan'}
    ]},
    plan:{image:'office-dusk.webp',alt:'어두워진 사무실 안에 모인 생존자들',location:'17층 사무실',mood:'suspense',title:'두 개의 메시지',text:[
      '사무실에 흩어져 있던 김 대리, 박 과장, 최 부장이 중앙 회의실로 모입니다.',
      '<span class="message">익명 · B2 서버실로 오세요. 엘리베이터는 절대 타지 마세요.</span>',
      '최 부장은 옥상 구조 안내 문자를 내밉니다. 그때 탕비실에서 냉장고 문이 닫히는 소리와 짧은 신음이 들립니다.'
    ],question:'첫 이동 경로를 정하세요.',choices:[
      {label:'옥상으로 올라간다',effect:{minute:3},next:'stair'},
      {label:'지하 2층 서버실로 내려간다',effect:{minute:3},next:'parking'},
      {label:'탕비실에서 물품부터 확보한다',effect:{minute:2},next:'pantry'}
    ]},
    pantry:{image:'pantry.webp',alt:'어두운 탕비실과 바닥에 앉아 있는 연구원',location:'17층 탕비실',mood:'suspense',title:'냉장고 안의 비밀',text:[
      '바닥에는 회사가 비공개 시험 배포한 집중력 음료가 흩어져 있습니다.',
      '냉장고 옆에 숨어 있던 제품개발팀 연구원이 상처 입은 팔을 감춘 채 속삭입니다.',
      '<strong>“음료를 마신 사람들은 특정 고주파에 반응해요. 송신기는 대표실에 있습니다.”</strong>'
    ],question:'연구원을 어떻게 하시겠습니까?',choices:[
      {label:'숨긴 팔을 확인하고 상태를 묻는다',effect:{trust:1,rescued:1,items:['임시 억제제'],flags:{researcher:true,antidote:true}},flash:'임시 억제제를 얻었습니다',next:'afterPantry'},
      {label:'생수와 간식만 챙겨 떠난다',effect:{health:10,items:['생수','에너지바']},flash:'체력을 회복했습니다',next:'afterPantry'},
      {label:'설명을 믿고 함께 이동한다',effect:{trust:2,rescued:1,items:['임시 억제제'],flags:{researcher:true,antidote:true}},flash:'연구원이 합류했습니다',next:'afterPantry'}
    ]},
    afterPantry:{image:'pantry.webp',alt:'탕비실에서 다음 이동을 준비하는 생존자',location:'17층 탕비실',mood:'suspense',title:'신호를 끄는 방법',text:[
      '연구원이 알려준 송신기는 감염자의 청각을 자극해 공격성을 키우고 있습니다.',
      '실험 기록이 있는 서버실, 송신기를 끌 수 있는 대표실, 구조 가능성을 확인할 옥상. 어느 쪽도 안전하지 않습니다.'
    ],question:'어디로 이동하시겠습니까?',choices:[
      {label:'대표실에서 신호를 끈다',effect:{minute:3},next:'director'},
      {label:'서버실에서 증거를 확보한다',effect:{minute:3},next:'parking'},
      {label:'옥상에서 탈출로를 찾는다',effect:{minute:3},next:'stair'}
    ]},
    stair:{image:'stairwell.webp',alt:'붉은 비상등이 켜진 계단과 좀비가 된 인사팀장',location:'14층 비상계단',mood:'danger',title:'퇴사 면담',text:[
      '14층과 15층 사이 비상계단을 좀비가 된 인사팀장이 막고 있습니다.',
      '그는 고개를 꺾은 채 같은 말을 반복합니다.',
      '<span class="broadcast">“퇴사 사유를… 구체적으로 말씀해주시겠어요?”</span>'
    ],question:'계단을 어떻게 통과하시겠습니까?',choices:[
      {label:'소화기로 시야를 가리고 돌파한다',effect:{health:-8,items:['소화기'],flags:{brave:true}},flash:'소화기를 확보했습니다',next:'rooftop'},
      {label:'회의실을 통해 외부 계단을 찾는다',effect:{minute:3,health:-3,flags:{careful:true}},next:'rooftop'},
      {label:'박 과장을 앞세운다',effect:{trust:-2,flags:{usedPark:true}},flash:'동료 신뢰가 낮아졌습니다',next:'rooftop'}
    ]},
    rooftop:{image:'rooftop.webp',alt:'밤의 옥상에서 맞은편 건물로 이어지는 케이블을 바라보는 생존자들',location:'건물 옥상',mood:'wind',title:'오지 않는 헬기',text:[
      '옥상은 비어 있습니다. 최 부장이 내민 문자는 6개월 전 재난 훈련 때 받은 안내였습니다.',
      '비상 무전기에서는 “감염 건물 접근 금지, 구조 중단”이라는 통신만 반복됩니다. 아래층에서는 수십 개의 발소리가 계단을 타고 올라옵니다.',
      '맞은편 건물 전광판에는 대피소 폐쇄까지 12분이 남았다는 경고가 깜빡이고, 두 건물 사이에는 점검용 케이블 하나가 흔들립니다.'
    ],question:'마지막 기회를 선택하세요.',choices:[
      {label:'케이블을 타고 맞은편 건물로 이동한다',effect:{health:-18,minute:3,flags:{cable:true}},next:'escape'},
      {label:'옥상에서 구조 신호를 보내며 기다린다',effect:{minute:8},next:'ending:rooftop'},
      {label:'서버실로 내려가 익명의 발신자를 찾는다',effect:{minute:4},next:'parking'}
    ]},
    parking:{image:'parking.webp',alt:'좀비들이 서 있는 지하 주차장과 마스터 카드를 든 이 차장',location:'지하 1층 주차장',mood:'danger',title:'차량 사이의 구조 요청',text:[
      '주차된 차량 사이에서 이 차장이 구조를 요청합니다. 혼자 움직이기 힘들지만 마스터 카드를 들고 있습니다.',
      '멀리 서 있던 감염자들이 출입 단말기의 신호음에 일제히 고개를 돌립니다.'
    ],question:'이 차장을 어떻게 하시겠습니까?',choices:[
      {label:'부축해서 함께 데려간다',effect:{trust:2,rescued:1,minute:3,items:['마스터 카드'],flags:{manager:true}},flash:'마스터 카드를 얻었습니다',next:'server'},
      {label:'카드만 받아 빠르게 떠난다',effect:{trust:-2,items:['마스터 카드'],flags:{tookCard:true}},flash:'마스터 카드를 얻었습니다',next:'server'},
      {label:'감염 여부를 확인한 뒤 데려간다',effect:{trust:1,rescued:1,minute:2,items:['마스터 카드'],flags:{manager:true,careful:true}},next:'server'}
    ]},
    server:{image:'server-room.webp',alt:'붉고 푸른 조명의 서버실과 유리문 밖의 좀비들',location:'지하 2층 서버실',mood:'tech',title:'집중력 음료 프로젝트',text:[
      '익명의 발신자는 전산팀 윤 주임이었습니다.',
      '서버에는 음료를 마신 직원 명단과 고주파 반응 실험 기록이 남아 있습니다.',
      '<strong class="impact">시험 대상자 47명.</strong> 외부 기관으로 자료를 보내려면 감염자들이 몰려 있는 시설관리실의 보조 발전기를 작동해야 합니다.'
    ],question:'서버 자료를 어떻게 처리하시겠습니까?',choices:[
      {label:'발전기를 작동해 외부 기관에 전송한다',effect:{health:-12,minute:4,trust:2,flags:{evidence:true,transmitted:true}},flash:'사건의 증거가 전송됐습니다',next:'director'},
      {label:'자료를 저장장치에 복사하고 탈출한다',effect:{minute:2,items:['증거 저장장치'],flags:{evidence:true}},flash:'증거를 확보했습니다',next:'escape'},
      {label:'문을 잠그고 구조를 기다린다',effect:{minute:8},next:'ending:overtime'}
    ]},
    director:{image:'director-office.webp',alt:'대표실의 붉게 빛나는 송신기와 유리문 밖의 좀비들',location:'20층 대표실',mood:'reveal',title:'모든 신호의 시작',text:[
      '대표실 책상 위 송신기가 건물 전체에 고주파를 내보내고 있습니다.',
      '유리문 밖 감염자들은 신호가 강해질 때마다 동시에 몸을 움직입니다.',
      '<span class="danger">삐——</span>'
    ],question:'송신기를 어떻게 처리하시겠습니까?',choices:[
      {label:'전원을 완전히 차단한다',effect:{trust:2,flags:{signalOff:true}},flash:'고주파 신호가 멈췄습니다',next:'escape'},
      {label:'실험 기록을 먼저 복사한 뒤 끈다',effect:{minute:3,health:-8,flags:{signalOff:true,evidence:true},items:['대표실 기록']},flash:'신호와 증거를 모두 확보했습니다',next:'escape'},
      {label:'신호를 크게 틀어 감염자들을 유인한다',effect:{health:-35,flags:{lured:true}},next:'escape'}
    ]},
    escape:{image:'service-exit.webp',alt:'서비스 출구에서 카드키를 대는 주인공과 뒤따르는 동료들',location:'직원 전용 출구',mood:'escape',title:'마지막 출구',text:[
      '오후 6시를 훌쩍 넘겼습니다. 서쪽 대피소가 폐쇄되기까지 몇 분 남지 않았습니다.',
      '직원 전용문은 잠겨 있고, 뒤쪽 복도에서는 감염자들이 가까워집니다. 지금까지 구한 동료와 물품이 마지막 탈출 수단입니다.'
    ],question:'마지막 탈출 방법을 선택하세요.',choices:[
      {label:'마스터 카드로 직원 전용문을 연다',require:s=>s.items.includes('마스터 카드'),effect:{flags:{finalPlan:'card'}},next:'resolve'},
      {label:'지수의 휴대전화로 반대편에 알림음을 울린다',require:s=>s.flags.jisu,effect:{trust:1,flags:{finalPlan:'jisu'}},next:'resolve'},
      {label:'소화기로 시야를 가리고 모두 함께 돌파한다',require:s=>s.items.includes('소화기'),effect:{health:-10,trust:1,flags:{finalPlan:'extinguisher'}},next:'resolve'},
      {label:'혼자서 가장 가까운 출구로 달린다',effect:{health:-20,trust:-3,flags:{finalPlan:'run'}},next:'resolve'}
    ]}
  };

  const endings = {
    allSaved:{image:'survivor-ending.webp',title:'모두의 퇴근',text:'고주파 신호가 멈추자 감염자들의 움직임이 눈에 띄게 느려졌습니다. 당신은 증거를 전송하고 구한 동료들과 함께 폐쇄 직전의 대피소에 도착합니다.<br><strong>생존자 명단에는 당신이 데려온 사람들의 이름이 나란히 기록됩니다.</strong><br>오늘의 퇴근은 혼자가 아닙니다.',mood:'ending'},
    truth:{image:'survivor-ending.webp',title:'회사가 묻으려 한 것',text:'확보한 실험 기록이 외부 기관에 전달되며 사건의 원인이 세상에 알려집니다. 기자가 처음부터 수상하지 않았느냐고 묻자 당신은 짧게 대답합니다.<br><strong>“금요일마다 무료로 나눠 주던 그 음료요.”</strong>',mood:'ending'},
    team:{image:'survivor-ending.webp',title:'이번 프로젝트도 내가 살렸다',text:'당신은 위험한 순간마다 동료를 포기하지 않았습니다. 생존자들이 모두 탈출하자 회사에서 포상 메일이 도착합니다.<br><strong>특별 포상: 모바일 상품권 1만 원</strong>',mood:'ending'},
    solo:{image:'service-exit.webp',title:'정시 퇴근',text:'당신은 누구도 기다리지 않고 가장 빠른 길로 혼자 탈출했습니다. 약속 상대에게 메시지가 옵니다.<br>“오늘도 야근이야?”<br><strong>“아니. 오늘은 칼퇴했어.”</strong>',mood:'ending'},
    betrayed:{image:'director-office.webp',title:'팀장님 먼저 들어가 보시죠',text:'출구 앞에서 동료들이 당신을 뒤에 남겨둔 채 문을 닫습니다.<br><strong>“좋은 리더는 팀원을 믿고 뒤를 맡기는 법입니다.”</strong><br>평소의 선택은 결정적인 순간에 돌아옵니다.',mood:'failure'},
    infected:{image:'office-dusk.webp',title:'퇴근은 했습니다',text:'무리하게 출구를 향해 달린 당신은 건물 밖에 도착합니다. 하지만 사원증 속 사진과 달리 눈동자가 희미하게 빛나기 시작합니다.<br><strong>출근 가능 여부: 확인 중</strong>',mood:'failure'},
    overtime:{image:'server-room.webp',title:'최후의 야근자',text:'서버실 문을 잠그고 구조를 기다렸지만, 건물은 이미 봉쇄된 뒤였습니다. 새벽 1시 19분, 문 바깥의 충격음과 함께 조명이 꺼집니다.<br><strong>출퇴근 시스템은 당신을 자동으로 퇴근 처리했습니다.<br>그러나 문을 열고 나온 사람은 없었습니다.</strong>',mood:'failure'},
    rooftop:{image:'rooftop.webp',title:'옥상의 마지막 신호',text:'휴대전화 불빛을 흔들며 기다리지만 구조 헬기는 오지 않습니다. 무전기에서는 건물 봉쇄 명령만 반복되고, 옥상 출입문이 안쪽에서 크게 휘어집니다.<br><strong>출입문이 무너진 뒤, 당신의 구조 신호가 마지막으로 끊깁니다.</strong><br>이 선택에서는 살아서 퇴근하지 못했습니다.',mood:'failure'},
    sacrifice:{image:'rooftop.webp',title:'전설의 퇴근 조장',text:'당신이 감염자들을 유인한 사이 동료들은 모두 빠져나갔습니다. 마지막으로 닫히는 문 너머에서 지수가 외칩니다.<br><strong>“월요일에 꼭 다시 만나요!”</strong><br>당신의 사원증은 회사 로비에 오래도록 남았습니다.',mood:'ending'}
  };

  class AudioEngine {
    constructor(){this.ctx=null;this.master=null;this.nodes=[];this.mood='';}
    start(){if(!audioOn)return;this.ctx ||= new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume();this.master ||= this.ctx.createGain();this.master.gain.value=.12;this.master.connect(this.ctx.destination);this.setMood('calm');}
    stopNodes(){this.nodes.forEach(n=>{try{n.stop()}catch{}});this.nodes=[];}
    setMood(mood){if(!this.ctx||!audioOn||mood===this.mood)return;this.stopNodes();this.mood=mood;const table={calm:[110,164.8],suspense:[82.4,123.5],danger:[65.4,98],wind:[73.4,110],tech:[98,147],reveal:[61.7,92.5],escape:[123.5,185],ending:[130.8,196],failure:[55,82.4]};const freqs=table[mood]||table.suspense;freqs.forEach((f,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=i?'triangle':'sine';o.frequency.value=f;g.gain.value=i?.022:.032;o.connect(g);g.connect(this.master);o.start();this.nodes.push(o)});}
    sfx(type){if(!this.ctx||!audioOn)return;const now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();const map={choice:[420,620,.12],alert:[180,90,.28],gain:[520,820,.18],hurt:[140,70,.22],next:[260,340,.08],ending:[392,523,.55]};const v=map[type]||map.next;o.frequency.setValueAtTime(v[0],now);o.frequency.exponentialRampToValueAtTime(v[1],now+v[2]);g.gain.setValueAtTime(.11,now);g.gain.exponentialRampToValueAtTime(.001,now+v[2]);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+v[2]);}
    toggle(){audioOn=!audioOn;$('#soundToggle').textContent=audioOn?'🔊':'🔇';if(audioOn)this.start();else{this.stopNodes();this.mood='';}}
  }
  const audio=new AudioEngine();

  function applyEffect(effect={}){
    ['health','trust','rescued','minute'].forEach(k=>{if(effect[k])state[k]+=effect[k]});
    state.health=Math.max(0,Math.min(100,state.health));
    (effect.items||[]).forEach(item=>{if(!state.items.includes(item))state.items.push(item)});
    Object.assign(state.flags,effect.flags||{});
  }
  function updateStatus(){
    $('#healthValue').textContent=state.health;$('#trustValue').textContent=state.trust>0?`+${state.trust}`:state.trust;$('#rescueValue').textContent=state.rescued;
    const total=17*60+state.minute;$('#clockValue').textContent=`${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
    $('#inventoryItems').innerHTML=state.items.length?state.items.map(i=>`<b>${i}</b>`).join(''):'<em>아직 없음</em>';
  }
  function flash(message,type='gain'){const box=$('#eventFlash');box.textContent=message;box.classList.remove('show');void box.offsetWidth;box.classList.add('show');audio.sfx(type)}
  function save(){localStorage.setItem('officeZombieSave',JSON.stringify({state,currentScene}))}
  function clearTimer(){clearTimeout(choiceRevealId);choiceRevealId=null;$('#timerTrack').hidden=true;$('#choiceTimer').textContent=''}
  function preload(scene){if(!scene)return;const img=new Image();img.src=imageBase+scene.image}
  function renderText(lines){const box=$('#storyText');box.innerHTML='';lines.forEach((line,i)=>{const p=document.createElement('p');p.innerHTML=line;p.style.animationDelay=`${i*.28}s`;box.appendChild(p)})}
  function getReadingDelay(scene){const plainLength=scene.text.join(' ').replace(/<[^>]+>/g,'').length;return Math.min(12000,Math.max(7000,plainLength*45))}
  function showContinuePrompt(scene){
    $('#choiceEyebrow').textContent='NEXT SCENE';$('#choiceQuestion').textContent='복도에서 들려온 소리를 확인해보세요.';const wrap=$('#choiceButtons');wrap.innerHTML='';
    const button=document.createElement('button');button.type='button';button.textContent='계속하기';button.addEventListener('click',()=>{button.disabled=true;audio.sfx('choice');state.sceneNumber++;showScene(scene.next)});wrap.appendChild(button);$('#choicePanel').hidden=false;audio.sfx('next');
  }
  function showChoices(scene){
    const valid=scene.choices.filter(c=>!c.require||c.require(state));if(!valid.length)return resolveEnding();
    $('#choiceEyebrow').textContent='DECISION';$('#choiceQuestion').textContent=scene.question;const wrap=$('#choiceButtons');wrap.innerHTML='';
    valid.forEach(choice=>{const b=document.createElement('button');b.type='button';b.textContent=choice.label;b.addEventListener('click',()=>choose(choice,b,wrap));wrap.appendChild(b)});
    $('#choicePanel').hidden=false;audio.sfx('next');
  }
  function choose(choice,button,wrap){
    if(button.disabled)return;clearTimer();[...wrap.children].forEach(b=>{b.disabled=true;b.classList.toggle('chosen',b===button);b.classList.toggle('dim',b!==button)});audio.sfx('choice');
    applyEffect(choice.effect);updateStatus();if(choice.flash)flash(choice.flash,choice.effect?.health<0?'hurt':'gain');
    state.path.push({scene:currentScene,choice:choice.label});state.sceneNumber++;save();
    setTimeout(()=>{if(choice.next==='resolve')resolveEnding();else if(choice.next.startsWith('ending:'))showEnding(choice.next.split(':')[1]);else showScene(choice.next)},720);
  }
  function showScene(id){
    clearTimer();currentScene=id;const scene=scenes[id];if(!scene)return;$('#choicePanel').hidden=true;$('#endingPanel').hidden=true;$('#storyPanel').hidden=false;$('#inventory').hidden=false;
    const frame=$('#sceneFrame');frame.classList.remove('enter','tense');void frame.offsetWidth;frame.classList.add('enter');if(scene.mood==='danger')setTimeout(()=>frame.classList.add('tense'),450);
    $('#sceneImage').src=imageBase+scene.image;$('#sceneImage').alt=scene.alt;$('#locationLabel').textContent=scene.location;$('#sceneCount').textContent=`SCENE ${String(state.sceneNumber).padStart(2,'0')}`;$('#sceneTitle').textContent=scene.title;renderText(scene.text);updateStatus();audio.setMood(scene.mood);save();
    $('#continueButton').hidden=true;choiceRevealId=setTimeout(()=>{choiceRevealId=null;if(scene.choices)showChoices(scene);else showContinuePrompt(scene)},getReadingDelay(scene));
    if(scene.choices){const first=scene.choices.find(c=>!c.require||c.require(state));if(first&&scenes[first.next])preload(scenes[first.next])}else if(scene.next)preload(scenes[scene.next]);
  }
  function resolveEnding(){
    let key='solo';
    if(state.flags.lured&&state.health<=65)key='sacrifice';
    else if(state.trust<=-3)key='betrayed';
    else if(state.health<=35||state.flags.finalPlan==='run'&&state.health<65)key='infected';
    else if(state.flags.signalOff&&state.flags.evidence&&state.rescued>=2&&state.trust>=3)key='allSaved';
    else if(state.flags.evidence)key='truth';
    else if(state.rescued>=2&&state.trust>=2)key='team';
    showEnding(key);
  }
  function showEnding(key){
    clearTimer();const ending=endings[key]||endings.solo;currentScene=`ending:${key}`;$('#choicePanel').hidden=true;$('#storyPanel').hidden=true;$('#inventory').hidden=true;
    $('#sceneImage').src=imageBase+ending.image;$('#sceneImage').alt=ending.title;$('#locationLabel').textContent='ENDING';$('#endingTitle').textContent=ending.title;$('#endingText').innerHTML=ending.text;$('#endHealth').textContent=state.health;$('#endRescue').textContent=`${state.rescued}명`;$('#endTrust').textContent=state.trust;$('#endingPanel').hidden=false;audio.setMood(ending.mood);audio.sfx('ending');localStorage.removeItem('officeZombieSave');
    try{gtag('event','story_ending',{game:'office_zombie',ending:key})}catch{}
  }
  function restart(){clearTimer();localStorage.removeItem('officeZombieSave');state=initialState();currentScene='opening';$('#startButton').textContent='생존 시작하기';$('#startOverlay').hidden=false;$('#endingPanel').hidden=true;showScene('opening')}
  function startGame(){audio.start();$('#startOverlay').hidden=true;const saved=localStorage.getItem('officeZombieSave');if(saved){try{const parsed=JSON.parse(saved);if(parsed.currentScene&&!parsed.currentScene.startsWith('ending:')){state=parsed.state;showScene(parsed.currentScene);return}}catch{}}state=initialState();showScene('opening')}
  async function share(){const title=$('#endingTitle').textContent;const data={title:'오피스 좀비: 퇴근까지 13분',text:`내 엔딩은 「${title}」! 당신도 살아서 퇴근할 수 있을까요?`,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text} ${data.url}`);flash('공유 문구를 복사했습니다')}}catch{}}

  $('#startButton').addEventListener('click',startGame);$('#restartButton').addEventListener('click',restart);$('#restartTop').addEventListener('click',restart);$('#shareButton').addEventListener('click',share);$('#soundToggle').addEventListener('click',()=>audio.toggle());
  if(localStorage.getItem('officeZombieSave'))$('#startButton').textContent='이어하기';
  updateStatus();renderText(scenes.opening.text);
})();
