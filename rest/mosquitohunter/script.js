const _0x5ee663=_0x28eb;(function(_0x4d33f5,_0x25e57a){const _0x3c43cb=_0x28eb,_0xb08e2e=_0x4d33f5();while(!![]){try{const _0x44229d=parseInt(_0x3c43cb(0x15d))/0x1*(parseInt(_0x3c43cb(0x153))/0x2)+parseInt(_0x3c43cb(0x1e5))/0x3+-parseInt(_0x3c43cb(0x172))/0x4+-parseInt(_0x3c43cb(0x157))/0x5*(parseInt(_0x3c43cb(0x1c1))/0x6)+-parseInt(_0x3c43cb(0x16c))/0x7*(-parseInt(_0x3c43cb(0x19f))/0x8)+parseInt(_0x3c43cb(0x147))/0x9*(-parseInt(_0x3c43cb(0x1b6))/0xa)+parseInt(_0x3c43cb(0x184))/0xb*(-parseInt(_0x3c43cb(0x180))/0xc);if(_0x44229d===_0x25e57a)break;else _0xb08e2e['push'](_0xb08e2e['shift']());}catch(_0x3830de){_0xb08e2e['push'](_0xb08e2e['shift']());}}}(_0x4992,0xb37c1));import{initializeApp}from'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';import{getFirestore,collection,query,where,getDocs,addDoc,updateDoc,doc,orderBy,limit}from'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';const firebaseConfig={'apiKey':_0x5ee663(0x19e),'authDomain':_0x5ee663(0x16b),'projectId':_0x5ee663(0x1c3),'storageBucket':_0x5ee663(0x193),'messagingSenderId':_0x5ee663(0x1d5),'appId':_0x5ee663(0x1a3)},app=initializeApp(firebaseConfig),db=getFirestore(app),loadingMessage=document[_0x5ee663(0x1b7)](_0x5ee663(0x15f)),startButton=document[_0x5ee663(0x1b7)](_0x5ee663(0x149)),startScreen=document[_0x5ee663(0x1b7)]('start-screen'),gamearea=document[_0x5ee663(0x1b7)]('game-area');function preloadImages(_0x3efa2f,_0x4d9a0a){let _0x50ca5b=0x0;const _0x17e55b=_0x3efa2f['length'];_0x3efa2f['forEach'](_0x439bec=>{const _0x512cfd=_0x28eb,_0x31903e=new Image();_0x31903e[_0x512cfd(0x1be)]=_0x439bec,_0x31903e['onload']=()=>{const _0x46cde5=_0x512cfd;_0x50ca5b++,loadingMessage['textContent']=_0x46cde5(0x194)+_0x50ca5b+'/'+_0x17e55b+')',_0x50ca5b===_0x17e55b&&_0x4d9a0a();},_0x31903e['onerror']=()=>{const _0x471fdf=_0x512cfd;console[_0x471fdf(0x1c5)](_0x471fdf(0x168)+_0x439bec),_0x50ca5b++,loadingMessage[_0x471fdf(0x1a7)]=_0x471fdf(0x194)+_0x50ca5b+'/'+_0x17e55b+')',_0x50ca5b===_0x17e55b&&_0x4d9a0a();};});}preloadImages([_0x5ee663(0x18c),'https://www.survivaloffice.com/images/beeR.png',_0x5ee663(0x1e6),_0x5ee663(0x196),_0x5ee663(0x1ab),'https://www.survivaloffice.com/images/dfD.png','https://www.survivaloffice.com/images/moL.png','https://www.survivaloffice.com/images/moR.png','https://www.survivaloffice.com/images/moD.png',_0x5ee663(0x178),_0x5ee663(0x161),_0x5ee663(0x1ac),_0x5ee663(0x17f)],()=>{const _0x878fa8=_0x5ee663;console[_0x878fa8(0x16f)](_0x878fa8(0x14b)),loadingMessage[_0x878fa8(0x1a7)]='',startButton[_0x878fa8(0x19b)][_0x878fa8(0x1b1)]=_0x878fa8(0x18a);});let isGameStarted=![];startButton['addEventListener'](_0x5ee663(0x1af),_0x4c0963=>{const _0x694594=_0x5ee663;_0x4c0963[_0x694594(0x163)](),isGameStarted=!![],startScreen[_0x694594(0x19b)][_0x694594(0x1b1)]=_0x694594(0x14d),gamearea[_0x694594(0x19b)][_0x694594(0x1b1)]=_0x694594(0x18a),console[_0x694594(0x16f)](_0x694594(0x1bd));});const top10RankButton=document['getElementById'](_0x5ee663(0x15b)),rankingContainer=document['getElementById'](_0x5ee663(0x177));top10RankButton&&rankingContainer?top10RankButton[_0x5ee663(0x179)](_0x5ee663(0x1af),async()=>{const _0x2bc1b9=_0x5ee663;console['log'](_0x2bc1b9(0x1ae)),rankingContainer[_0x2bc1b9(0x19b)][_0x2bc1b9(0x1b1)]=_0x2bc1b9(0x18a),rankingContainer[_0x2bc1b9(0x186)]='<p>로딩\x20중...</p>',await loadTop10Rankings(),await loadAllTimeHighScore();}):console[_0x5ee663(0x1c5)](_0x5ee663(0x167));async function loadTop10Rankings(){const _0x174825=_0x5ee663,_0x48a43f=collection(db,'mosquito'),{startDate:_0x2046d0,endDate:_0x3ea26f}=getCurrentWeekRange();console[_0x174825(0x16f)](_0x174825(0x174),_0x2046d0),console['log'](_0x174825(0x195),_0x3ea26f);const _0x4958bb=query(_0x48a43f,where(_0x174825(0x18e),'>=',_0x2046d0),where('date','<=',_0x3ea26f),orderBy(_0x174825(0x18f),'desc'),orderBy(_0x174825(0x18e),'desc'),limit(0xa)),_0x47982f=await getDocs(_0x4958bb);console[_0x174825(0x16f)](_0x174825(0x17b),_0x47982f['size']),_0x47982f[_0x174825(0x1e0)](_0x5edc81=>{const _0x124ef9=_0x174825;console['log'](_0x5edc81[_0x124ef9(0x1bc)]());});try{const _0x907a3=await getDocs(_0x4958bb);if(_0x907a3[_0x174825(0x1de)]){rankingContainer[_0x174825(0x186)]=_0x174825(0x1ce);return;}let _0x34ccc0=_0x174825(0x1b5),_0x4231f0=0x1;_0x907a3[_0x174825(0x1e0)](_0x537c4e=>{const _0x401343=_0x174825,_0x3081be=_0x537c4e[_0x401343(0x1bc)](),_0x55d9f5=_0x3081be['nickname']||_0x401343(0x182),_0x5b21ac=_0x3081be[_0x401343(0x18f)]||0x0;let _0x32fe72;typeof _0x3081be[_0x401343(0x18e)]===_0x401343(0x1b0)?_0x32fe72=_0x3081be['date'][_0x401343(0x1cb)](0x0,0xa):_0x32fe72=_0x401343(0x162);let _0x24ab98='';if(_0x4231f0===0x1)_0x24ab98='🥇';else{if(_0x4231f0===0x2)_0x24ab98='🥈';else{if(_0x4231f0===0x3)_0x24ab98='🥉';}}_0x34ccc0+=_0x401343(0x1c4)+_0x24ab98+'\x20'+_0x4231f0+_0x401343(0x1dc)+_0x55d9f5+',\x20'+_0x5b21ac+_0x401343(0x1a6)+_0x32fe72+_0x401343(0x152),_0x4231f0++;}),_0x34ccc0+=_0x174825(0x1bb),console[_0x174825(0x16f)]('Before\x20updating:',rankingContainer[_0x174825(0x186)]),rankingContainer[_0x174825(0x186)]=_0x34ccc0,console[_0x174825(0x16f)](_0x174825(0x1db),rankingContainer[_0x174825(0x186)]);const _0x1ffd68=document[_0x174825(0x19d)]('.ranking-item');_0x1ffd68[_0x174825(0x1e0)]((_0x265f95,_0x567651)=>{const _0x209ff0=_0x174825;_0x265f95[_0x209ff0(0x19b)]['animationDelay']=_0x567651*0.5+'s';});}catch(_0x12966d){console['error'](_0x174825(0x1cd),_0x12966d),rankingContainer[_0x174825(0x186)]='<p>랭킹\x20데이터를\x20불러오지\x20못했습니다.</p>';}}function getCurrentWeekRange(){const _0x921a58=_0x5ee663,_0x3ac589=new Date(),_0x31f6de=_0x3ac589[_0x921a58(0x14f)]();console[_0x921a58(0x16f)](_0x921a58(0x191)+_0x3ac589),console['log'](_0x921a58(0x199)+_0x31f6de);const _0x3c2502=_0x31f6de===0x0?-0x6:0x1-_0x31f6de;console['log'](_0x921a58(0x150)+_0x3c2502);const _0x35a36c=new Date(_0x3ac589);_0x35a36c['setDate'](_0x3ac589[_0x921a58(0x1e4)]()+_0x3c2502),_0x35a36c['setHours'](0x0,0x0,0x0,0x0),console[_0x921a58(0x16f)](_0x921a58(0x1cc)+_0x35a36c);const _0x3fdd18=new Date(_0x35a36c);_0x3fdd18[_0x921a58(0x1ca)](_0x35a36c['getDate']()+0x6),_0x3fdd18[_0x921a58(0x165)](0x17,0x3b,0x3b,0x3e7),console['log']('계산된\x20일요일:\x20'+_0x3fdd18);const _0x315c7f=_0x35a36c[_0x921a58(0x1d9)]()+'-'+String(_0x35a36c['getMonth']()+0x1)['padStart'](0x2,'0')+'-'+String(_0x35a36c[_0x921a58(0x1e4)]())[_0x921a58(0x1ad)](0x2,'0'),_0x30153a=_0x3fdd18[_0x921a58(0x1d9)]()+'-'+String(_0x3fdd18['getMonth']()+0x1)['padStart'](0x2,'0')+'-'+String(_0x3fdd18[_0x921a58(0x1e4)]())[_0x921a58(0x1ad)](0x2,'0');return console['log']('이번\x20주\x20날짜\x20범위:\x20'+_0x315c7f+'\x20~\x20'+_0x30153a),{'startDate':_0x315c7f,'endDate':_0x30153a};}async function loadAllTimeHighScore(){const _0x512d31=_0x5ee663,_0x528f49=collection(db,_0x512d31(0x1b9)),_0x4ecdb3=query(_0x528f49,orderBy('score',_0x512d31(0x1b8)),limit(0x1));try{const _0x31f2de=await getDocs(_0x4ecdb3);if(_0x31f2de[_0x512d31(0x1de)]){rankingContainer['innerHTML']+=_0x512d31(0x1aa);return;}let _0x55e123='<h2>🏆역대\x20최고\x20기록🏆</h2>';_0x31f2de['forEach'](_0x5c49fd=>{const _0x33c00d=_0x512d31,_0xac903=_0x5c49fd['data'](),_0x57e4db=_0xac903[_0x33c00d(0x169)]||_0x33c00d(0x182),_0x23948a=_0xac903['score']||0x0;let _0xfb330c;if(_0xac903[_0x33c00d(0x18e)]&&typeof _0xac903['date'][_0x33c00d(0x1d8)]===_0x33c00d(0x190)){const _0x3eaa82=_0xac903['date'][_0x33c00d(0x1d8)](),_0x142510=_0x3eaa82['getFullYear'](),_0x56d7f1=String(_0x3eaa82[_0x33c00d(0x1ea)]()+0x1)[_0x33c00d(0x1ad)](0x2,'0'),_0x37df4e=String(_0x3eaa82[_0x33c00d(0x1e4)]())['padStart'](0x2,'0');_0xfb330c=_0x142510+'-'+_0x56d7f1+'-'+_0x37df4e;}else typeof _0xac903[_0x33c00d(0x18e)]==='string'?_0xfb330c=_0xac903[_0x33c00d(0x18e)][_0x33c00d(0x1cb)](0x0,0xa):_0xfb330c='날짜\x20없음';_0x55e123+='\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<h3\x20style=\x22display:\x20flex;\x20justify-content:\x20space-between;\x20align-items:\x20center;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20🎉\x20\x20'+_0x57e4db+',\x20\x20'+_0x23948a+_0x33c00d(0x1b2)+_0xfb330c+_0x33c00d(0x1df);}),rankingContainer[_0x512d31(0x186)]+=_0x55e123;}catch(_0x2ce08f){console[_0x512d31(0x1c5)](_0x512d31(0x1da),_0x2ce08f),rankingContainer['innerHTML']+='<p>최고\x20점수\x20데이터를\x20불러오지\x20못했습니다.</p>';}}rankingContainer?rankingContainer[_0x5ee663(0x179)](_0x5ee663(0x1af),()=>{const _0x254c73=_0x5ee663;rankingContainer[_0x254c73(0x19b)]['display']=_0x254c73(0x14d);}):console[_0x5ee663(0x1c5)]('ranking-container\x20요소를\x20찾을\x20수\x20없습니다.');async function saveScore(_0x146565,_0x50f1c5){const _0x476337=_0x5ee663;console[_0x476337(0x16f)]('Firestore에\x20점수\x20저장\x20시도:',_0x146565,_0x50f1c5);const _0x26fea4=new Date(),_0x304923=0x9*0x3c*0x3c*0x3e8,_0x4fd034=new Date(_0x26fea4['getTime']()+_0x304923),_0x493b5c=_0x4fd034['toISOString']()['split']('T')[0x0],_0x3c19df=collection(db,_0x476337(0x1b9));try{console[_0x476337(0x16f)]('새로운\x20점수\x20저장\x20중...'),await addDoc(_0x3c19df,{'nickname':_0x146565||_0x476337(0x182),'score':_0x50f1c5,'date':_0x493b5c}),alert(_0x476337(0x17e));}catch(_0x3f9539){console[_0x476337(0x1c5)]('Error\x20adding\x20data:',_0x3f9539),alert('점수\x20저장\x20중\x20오류가\x20발생했습니다.');};}document[_0x5ee663(0x1b7)]('closePopupButton')['addEventListener'](_0x5ee663(0x1af),()=>{const _0x5bdcd8=_0x5ee663;console[_0x5bdcd8(0x16f)](_0x5bdcd8(0x1d7)),window[_0x5bdcd8(0x155)][_0x5bdcd8(0x1a9)]();});const saveScoreButton=document['getElementById']('saveScoreButton');saveScoreButton[_0x5ee663(0x179)]('click',async _0x3deb4d=>{const _0xc31bbb=_0x5ee663;_0x3deb4d[_0xc31bbb(0x1c6)]();if(saveScoreButton[_0xc31bbb(0x1e3)]){alert(_0xc31bbb(0x1bf));return;}const _0x3660b3=document[_0xc31bbb(0x1b7)](_0xc31bbb(0x1a4))[_0xc31bbb(0x17d)];if(_0x3660b3[_0xc31bbb(0x181)]===0x0){alert('닉네임을\x20입력해주세요.');return;}else{if(_0x3660b3['length']>0x5){alert(_0xc31bbb(0x1a0));return;}}await saveScore(_0x3660b3,score),saveScoreButton[_0xc31bbb(0x1e3)]=!![],saveScoreButton[_0xc31bbb(0x19b)][_0xc31bbb(0x158)]=_0xc31bbb(0x173),saveScoreButton['textContent']=_0xc31bbb(0x154);});function showGameOverPopup(){const _0x25a7f5=_0x5ee663,_0x22e4fa=document[_0x25a7f5(0x1b7)](_0x25a7f5(0x18d));_0x22e4fa[_0x25a7f5(0x19b)][_0x25a7f5(0x1b1)]=_0x25a7f5(0x18a),isInputBlocked=!![];}const mosquitoTypes=[{'leftImage':_0x5ee663(0x148),'rightImage':_0x5ee663(0x1a5),'deadImage':_0x5ee663(0x1c2),'score':0xa,'clicksToKill':0x1,'probability':0x5f,'width':0x32,'height':0x32},{'leftImage':_0x5ee663(0x1e6),'rightImage':_0x5ee663(0x19c),'deadImage':_0x5ee663(0x18c),'score':-0xa,'clicksToKill':0x1,'probability':0x3,'width':0x32,'height':0x32},{'leftImage':_0x5ee663(0x196),'rightImage':'https://www.survivaloffice.com/images/dfR.png','deadImage':'https://www.survivaloffice.com/images/dfD.png','score':-0x32,'clicksToKill':0x1,'probability':0x2,'width':0x32,'height':0x32}];console[_0x5ee663(0x170)](_0x5ee663(0x1c9),mosquitoTypes);function getRandomMosquitoType(){const _0x5aafcc=_0x5ee663;if(!mosquitoTypes||mosquitoTypes[_0x5aafcc(0x181)]===0x0)return console[_0x5aafcc(0x1c5)](_0x5aafcc(0x164)),null;console[_0x5aafcc(0x170)](_0x5aafcc(0x175)+mosquitoesCaught+_0x5aafcc(0x18b)+kingMosquitoAppeared);if(mosquitoesCaught>0x0&&mosquitoesCaught%0xa===0x0&&!kingMosquitoAppeared)return kingMosquitoAppeared=!![],console[_0x5aafcc(0x16f)](_0x5aafcc(0x171)),{'leftImage':_0x5aafcc(0x178),'rightImage':_0x5aafcc(0x161),'deadImage':'https://www.survivaloffice.com/images/mokD.png','score':0x64,'clicksToKill':0x3,'probability':0x64,'width':0x46,'height':0x46};const _0x2ece14=Math[_0x5aafcc(0x16e)]()*0x64;let _0x4c8436=0x0;for(const _0x34137d of mosquitoTypes){_0x4c8436+=_0x34137d[_0x5aafcc(0x1e1)];if(_0x2ece14<=_0x4c8436)return _0x34137d;}return console[_0x5aafcc(0x1c5)](_0x5aafcc(0x1e9)),mosquitoTypes[0x0];}let score=0x0;function _0x4992(){const _0x235b9f=['모기\x20생성\x20시작','classList','mosquitoTypes\x20배열\x20확인:','setDate','slice','계산된\x20월요일:\x20','Firestore에서\x20랭킹\x20데이터를\x20가져오는\x20중\x20오류\x20발생:','<p>랭킹\x20데이터가\x20없습니다.</p>','stringify','기존\x20모기\x20생성\x20타이머\x20제거','top','clicksToKill','#76c7c0','backgroundImage','877963060151','카운트다운\x20중:\x20','닫기\x20버튼\x20클릭됨','toDate','getFullYear','Firestore에서\x20최고\x20점수\x20데이터를\x20가져오는\x20중\x20오류\x20발생:','After\x20updating:','위\x20-\x20','url(','empty','</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</h3>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</p>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20','forEach','probability','deadWidth','disabled','getDate','755514bRkDrC','https://www.survivaloffice.com/images/beeL.png','생성된\x20모기\x20타입:\x20','모기\x20생성\x20주기\x20업데이트:\x20','모기\x20타입\x20선택\x20실패:\x20기본\x20모기를\x20반환합니다.','getMonth','남은\x20클릭\x20수:\x20','81QHfrNV','https://www.survivaloffice.com/images/moL.png','start-btn','게임이\x20시작되지\x20않았습니다.\x20모기\x20생성\x20타이머를\x20시작하지\x20않습니다.','모든\x20이미지가\x20로드되었습니다!','rightImage','none','dead','getDay','월요일까지의\x20차이:\x20','Score:\x20','</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</li>','1884GYcBan','등록\x20완료','location','className','965tLstli','cursor','width','leftImage','top10-rank','모기\x20타입\x20또는\x20이미지\x20데이터가\x20유효하지\x20않습니다:','887GjRwPe','remove','loading-message','contains','https://www.survivaloffice.com/images/mokR.png','날짜\x20없음','stopPropagation','mosquitoTypes\x20배열이\x20비어\x20있습니다.','setHours','add','top10-rank\x20버튼\x20또는\x20ranking-container\x20요소를\x20찾을\x20수\x20없습니다.','이미지\x20로드\x20실패:\x20','nickname','game-area','upupup-e4c2c.firebaseapp.com','4512683SpXJlu','countdown-container','random','log','debug','왕모기\x20등장!','1286884OdHXnh','not-allowed','Start\x20Date:','현재\x20잡은\x20모기\x20수:\x20','bottom','ranking-container','https://www.survivaloffice.com/images/mokL.png','addEventListener','#f39c12','쿼리\x20결과\x20개수:','backgroundColor','value','점수가\x20성공적으로\x20저장되었습니다.','https://www.survivaloffice.com/images/momain.png','6595308YbBBoS','length','Unknown','right','11VJZJJE','createElement','innerHTML','timer-container','height','모기\x20타입\x20또는\x20이미지\x20데이터가\x20유효하지\x20않습니다.','block',',\x20왕모기\x20등장\x20여부:\x20','https://www.survivaloffice.com/images/beeD.png','result-popup','date','score','function','현재\x20날짜:\x20','게임이\x20시작되지\x20않았습니다.\x20생성\x20주기를\x20업데이트하지\x20않습니다.','upupup-e4c2c.appspot.com','이미지\x20로드\x20중...\x20(','End\x20Date:','https://www.survivaloffice.com/images/dfL.png','floor','timer-bar','현재\x20요일:\x20','게임\x20화면\x20표시','style','https://www.survivaloffice.com/images/beeR.png','querySelectorAll','AIzaSyCK4Zdkhlc0cnjqC3TpmUJmLAt8Xrh8VOw','16iBhEMs','닉네임은\x205글자\x20이하로\x20입력해주세요.','div','left','1:877963060151:web:e70751cb30638880767e32','nicknameInput','https://www.survivaloffice.com/images/moR.png','점\x20<span\x20class=\x22date\x22>','textContent','opacity','reload','<h3>최고\x20점수\x20데이터가\x20없습니다.</h3>','https://www.survivaloffice.com/images/dfR.png','https://www.survivaloffice.com/images/mokD.png','padStart','랭킹\x20보기\x20버튼\x20클릭됨','click','string','display','점\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22date\x22\x20style=\x22margin-left:\x20auto;\x20text-align:\x20right;\x22>','timer-text','appendChild','<h2>Top\x2010\x20랭킹</h2><ul>','403120iUqaWk','getElementById','desc','mosquito','모기\x20생성\x20타이머\x20시작:\x20주기\x20','</ul><h4\x20style=\x22color:\x20red;\x22>📢\x20랭킹은\x20매주\x20월요일\x20초기화됩니다.</h4>','data','게임\x20시작!','src','이미\x20점수가\x20등록되었습니다.','createMosquito\x20함수\x20호출됨','12666sCNqIT','https://www.survivaloffice.com/images/moD.png','upupup-e4c2c','<li\x20class=\x22ranking-item\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20','error','preventDefault'];_0x4992=function(){return _0x235b9f;};return _0x4992();}function _0x28eb(_0x4043b9,_0x59f944){const _0x49927a=_0x4992();return _0x28eb=function(_0x28eb00,_0xb2c765){_0x28eb00=_0x28eb00-0x147;let _0x230c89=_0x49927a[_0x28eb00];return _0x230c89;},_0x28eb(_0x4043b9,_0x59f944);}const scoreDisplay=document['getElementById']('score'),timerContainer=document[_0x5ee663(0x1b7)](_0x5ee663(0x187));let remainingTime=0x3c,timerInterval,isGameOver=![],isInputBlocked=![],mosquitoesCaught=0x0,kingMosquitoAppeared=![];const maxMosquitoCount=0x32;let currentMosquitoCount=0x0;const boundary={'left':-0x14,'right':0x6e,'top':-0x14,'bottom':0x6e};function createMosquito(_0x4e95dd,_0x18b3bd){const _0x575e3d=_0x5ee663;console[_0x575e3d(0x16f)](_0x575e3d(0x1c0));if(isGameOver||currentMosquitoCount>=maxMosquitoCount){console[_0x575e3d(0x170)]('모기\x20생성\x20차단:\x20게임\x20종료\x20또는\x20최대\x20모기\x20수\x20초과');return;}console[_0x575e3d(0x170)]('모기\x20생성\x20조건\x20통과');const _0x13d442=getRandomMosquitoType();if(!_0x13d442||!_0x13d442[_0x575e3d(0x15a)]||!_0x13d442[_0x575e3d(0x14c)]){console['error'](_0x575e3d(0x189));return;}console[_0x575e3d(0x170)](_0x575e3d(0x1e7)+JSON[_0x575e3d(0x1cf)](_0x13d442));const _0x4ead5e=document[_0x575e3d(0x185)](_0x575e3d(0x1a1));_0x4ead5e[_0x575e3d(0x156)]=_0x575e3d(0x1b9),_0x4ead5e[_0x575e3d(0x19b)]['width']=_0x13d442[_0x575e3d(0x159)]+'px',_0x4ead5e['style'][_0x575e3d(0x188)]=_0x13d442[_0x575e3d(0x188)]+'px',_0x4ead5e['style'][_0x575e3d(0x1d4)]=_0x575e3d(0x1dd)+_0x13d442[_0x575e3d(0x15a)]+')';let _0x206158=_0x13d442[_0x575e3d(0x1d2)];const _0x4309fe=getStartPosition();_0x4ead5e['style'][_0x575e3d(0x1a2)]=_0x4309fe['x']+'%',_0x4ead5e[_0x575e3d(0x19b)][_0x575e3d(0x1d1)]=_0x4309fe['y']+'%',_0x4ead5e[_0x575e3d(0x19b)][_0x575e3d(0x1a8)]=0x0,_0x4ead5e['addEventListener'](_0x575e3d(0x1af),()=>{const _0x4198b3=_0x575e3d;if(isInputBlocked)return;_0x206158--,_0x206158<=0x0?(_0x4ead5e[_0x4198b3(0x19b)]['backgroundImage']=_0x4198b3(0x1dd)+_0x13d442['deadImage']+')',_0x4ead5e[_0x4198b3(0x19b)][_0x4198b3(0x159)]=(_0x13d442[_0x4198b3(0x1e2)]||_0x13d442[_0x4198b3(0x159)])+'px',_0x4ead5e[_0x4198b3(0x19b)][_0x4198b3(0x188)]=(_0x13d442['deadHeight']||_0x13d442[_0x4198b3(0x188)])+'px',_0x4ead5e[_0x4198b3(0x1c8)][_0x4198b3(0x166)](_0x4198b3(0x14e)),updateScore(_0x13d442[_0x4198b3(0x18f)]),_0x13d442[_0x4198b3(0x15a)]!=='https://www.survivaloffice.com/images/mokL.png'&&(mosquitoesCaught++,console[_0x4198b3(0x16f)](_0x4198b3(0x175)+mosquitoesCaught),mosquitoesCaught%0xa===0x0&&(kingMosquitoAppeared=![])),setTimeout(()=>{const _0x536bd1=_0x4198b3;_0x4ead5e[_0x536bd1(0x15e)](),currentMosquitoCount--;},0x1f4)):console['debug'](_0x4198b3(0x1eb)+_0x206158);}),document[_0x575e3d(0x1b7)](_0x575e3d(0x16a))[_0x575e3d(0x1b4)](_0x4ead5e),currentMosquitoCount++,setTimeout(()=>{const _0x249308=_0x575e3d;_0x4ead5e[_0x249308(0x19b)][_0x249308(0x1a8)]=0x1,moveMosquito(_0x4ead5e,_0x13d442);},0x3e8);}function getStartPosition(){const _0x2fdbbf=_0x5ee663,_0x598f7a=Math[_0x2fdbbf(0x197)](Math['random']()*0x4),_0x35bf03={'x':0x0,'y':0x0};switch(_0x598f7a){case 0x0:_0x35bf03['x']=Math[_0x2fdbbf(0x16e)]()*0x64,_0x35bf03['y']=boundary[_0x2fdbbf(0x1d1)];break;case 0x1:_0x35bf03['x']=Math[_0x2fdbbf(0x16e)]()*0x64,_0x35bf03['y']=boundary[_0x2fdbbf(0x176)];break;case 0x2:_0x35bf03['x']=boundary[_0x2fdbbf(0x1a2)],_0x35bf03['y']=Math[_0x2fdbbf(0x16e)]()*0x64;break;case 0x3:_0x35bf03['x']=boundary[_0x2fdbbf(0x183)],_0x35bf03['y']=Math[_0x2fdbbf(0x16e)]()*0x64;break;}return _0x35bf03;}function moveMosquito(_0x49a93c,_0x571546){const _0x4f21ff=_0x5ee663;if(!_0x571546||!_0x571546[_0x4f21ff(0x15a)]||!_0x571546['rightImage']){console[_0x4f21ff(0x1c5)](_0x4f21ff(0x15c),_0x571546);return;}let _0x12b619=Math[_0x4f21ff(0x16e)]()*0x2-0x1,_0x2a3397=Math[_0x4f21ff(0x16e)]()*0x2-0x1;const _0x2ad3fe=setInterval(()=>{const _0x8ae192=_0x4f21ff;if(_0x49a93c[_0x8ae192(0x1c8)][_0x8ae192(0x160)](_0x8ae192(0x14e))){clearInterval(_0x2ad3fe);return;}const _0x606a6b=parseFloat(_0x49a93c[_0x8ae192(0x19b)][_0x8ae192(0x1a2)]),_0x5dece3=parseFloat(_0x49a93c[_0x8ae192(0x19b)][_0x8ae192(0x1d1)]);let _0xc0b381=_0x606a6b+_0x12b619,_0x318f16=_0x5dece3+_0x2a3397;if(_0xc0b381<boundary[_0x8ae192(0x1a2)]||_0xc0b381>boundary[_0x8ae192(0x183)])_0x12b619=-_0x12b619;if(_0x318f16<boundary[_0x8ae192(0x1d1)]||_0x318f16>boundary[_0x8ae192(0x176)])_0x2a3397=-_0x2a3397;if(_0x12b619>0x0)_0x49a93c[_0x8ae192(0x19b)][_0x8ae192(0x1d4)]=_0x8ae192(0x1dd)+_0x571546[_0x8ae192(0x14c)]+')';else _0x12b619<=0x0&&(_0x49a93c[_0x8ae192(0x19b)]['backgroundImage']=_0x8ae192(0x1dd)+_0x571546[_0x8ae192(0x15a)]+')');_0x49a93c[_0x8ae192(0x19b)][_0x8ae192(0x1a2)]=_0xc0b381+'%',_0x49a93c[_0x8ae192(0x19b)]['top']=_0x318f16+'%';},0x10);}function updateScore(_0x3ed21d){const _0x504625=_0x5ee663;score+=_0x3ed21d,scoreDisplay['textContent']=_0x504625(0x151)+score;}const countdownContainer=document[_0x5ee663(0x1b7)](_0x5ee663(0x16d));function startCountdown(){const _0x4f8f52=_0x5ee663;countdownContainer[_0x4f8f52(0x19b)][_0x4f8f52(0x1b1)]=_0x4f8f52(0x18a);let _0x21e7d5=0x3;const _0x413c44=setInterval(()=>{const _0x46df21=_0x4f8f52;countdownContainer[_0x46df21(0x1a7)]=_0x21e7d5,console['log'](_0x46df21(0x1d6)+_0x21e7d5),_0x21e7d5--,_0x21e7d5<0x0&&(clearInterval(_0x413c44),countdownContainer[_0x46df21(0x19b)][_0x46df21(0x1b1)]=_0x46df21(0x14d),console['log']('카운트다운\x20종료.\x20게임\x20UI\x20표시'),showGameUI());},0x3e8);}function showGameUI(){const _0x3b4051=_0x5ee663;document[_0x3b4051(0x1b7)]('start-screen')[_0x3b4051(0x19b)][_0x3b4051(0x1b1)]='none',console[_0x3b4051(0x16f)](_0x3b4051(0x19a)),isGameOver=![],startTimer(),startMosquitoSpawner();}let mosquitoSpawnInterval=0x1f4,mosquitoSpawner=null;function startMosquitoSpawner(){const _0x4bca08=_0x5ee663;if(!isGameStarted){console['warn'](_0x4bca08(0x14a));return;}mosquitoSpawner&&(clearInterval(mosquitoSpawner),console['log'](_0x4bca08(0x1d0))),mosquitoSpawner=setInterval(()=>{const _0x10c733=_0x4bca08;console['log'](_0x10c733(0x1c7)),createMosquito(0x32,0x32);},mosquitoSpawnInterval),console[_0x4bca08(0x16f)](_0x4bca08(0x1ba)+mosquitoSpawnInterval+'ms');}function increaseSpawnSpeed(){const _0xa71e3d=_0x5ee663;if(!isGameStarted){console['warn'](_0xa71e3d(0x192));return;}mosquitoSpawnInterval>0x12c&&(mosquitoSpawnInterval-=0x14,startMosquitoSpawner(),console[_0xa71e3d(0x16f)](_0xa71e3d(0x1e8)+mosquitoSpawnInterval+'ms'));}setInterval(increaseSpawnSpeed,0x2710),setInterval(increaseSpawnSpeed,0x2710),document[_0x5ee663(0x1b7)](_0x5ee663(0x149))[_0x5ee663(0x179)](_0x5ee663(0x1af),()=>{startCountdown();});function startTimer(){if(timerInterval)clearInterval(timerInterval);remainingTime=0x3c,updateTimerUI(),timerInterval=setInterval(()=>{remainingTime--,updateTimerUI(),remainingTime<=0x0&&(clearInterval(timerInterval),endGame());},0x3e8);}function updateTimerUI(){const _0x555c07=_0x5ee663,_0x31cca7=document['getElementById'](_0x555c07(0x198)),_0x36484d=document[_0x555c07(0x1b7)](_0x555c07(0x1b3)),_0xed4680=remainingTime/0x3c*0x64;_0x31cca7[_0x555c07(0x19b)]['width']=_0xed4680+'%',_0x36484d[_0x555c07(0x1a7)]=remainingTime+'초';if(remainingTime<=0xa)_0x31cca7[_0x555c07(0x19b)]['backgroundColor']='#e74c3c';else remainingTime<=0x14?_0x31cca7[_0x555c07(0x19b)][_0x555c07(0x17c)]=_0x555c07(0x17a):_0x31cca7[_0x555c07(0x19b)]['backgroundColor']=_0x555c07(0x1d3);}function endGame(){if(isGameOver)return;isGameOver=!![],showGameOverPopup();}