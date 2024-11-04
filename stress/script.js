// Firebase 설정 및 초기화
const firebaseConfig = {
    apiKey: "AIzaSyAzCVvSMhEPviumJZKi1RadieG4UfR_hAo",
    authDomain: "stressgame-4ccaa.firebaseapp.com",
    projectId: "stressgame-4ccaa",
    storageBucket: "stressgame-4ccaa.appspot.com",
    messagingSenderId: "986046565225",
    appId: "1:986046565225:web:a350a6b3513ed3269b8bf8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// HTML 요소 가져오기
const button = document.getElementById('pressButton');
const counterDisplay = document.getElementById('counter');
const viewRecordsButton = document.getElementById('viewRecords');
const recordList = document.getElementById('recordList');
const recordListItems = document.getElementById('recordListItems');
const nicknameInput = document.getElementById('nickname');
const saveNicknameButton = document.getElementById('saveNickname');
const dateDisplay = document.getElementById('dateDisplay');
const saveDataButton = document.getElementById('saveDataButton');

// 클릭 수, 닉네임 및 날짜 데이터 초기화
let pressCount = parseInt(sessionStorage.getItem('pressCount')) || 0;
let lastReset = sessionStorage.getItem('lastReset') || new Date().toDateString();
let nickname = localStorage.getItem('nickname') || '';
let records = JSON.parse(localStorage.getItem('records')) || [];

// 클릭 수 업데이트
function updateCounter() {
    if (nickname) {
        counterDisplay.textContent = `${nickname} 님, ${pressCount}번 눌렀습니다`;
    } else {
        counterDisplay.textContent = `${pressCount}번 눌렀습니다`;
    }
}

// 현재 날짜 업데이트
function updateDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    dateDisplay.textContent = `${year}년 ${month}월 ${day}일`;
}

// 클릭 수 저장
function savePressCount() {
    sessionStorage.setItem('pressCount', pressCount);
}

// 닉네임 저장
function saveNickname() {
    nickname = nicknameInput.value.trim();
    if (nickname) {
        localStorage.setItem('nickname', nickname);
        alert('닉네임이 저장되었습니다!');
        updateCounter();
    } else {
        alert('닉네임을 입력해주세요.');
    }
}

// 닉네임 불러오기
function loadNickname() {
    if (nickname) {
        nicknameInput.value = nickname;
    }
}

// Firestore에 데이터 저장
function saveRecordToFirestore(date, nickname, count) {
    db.collection('pressRecords')
        .where('date', '==', date)
        .where('nickname', '==', nickname || 'Unknown')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                const updatePromises = [];
                querySnapshot.forEach((doc) => {
                    const existingRecord = doc.data();
                    if (count > existingRecord.count) {
                        const updatePromise = db.collection('pressRecords').doc(doc.id).update({
                            count: count
                        });
                        updatePromises.push(updatePromise);
                    }
                });

                if (updatePromises.length > 0) {
                    Promise.all(updatePromises)
                        .then(() => {
                            alert('기록이 업데이트되었습니다.');
                        })
                        .catch((error) => {
                            console.error("Error updating data: ", error);
                        });
                }
            } else {
                db.collection('pressRecords').add({
                    date: date,
                    nickname: nickname || 'Unknown',
                    count: count
                }).then(() => {
                    alert('저장되었습니다.');
                }).catch((error) => {
                    console.error("Error saving data: ", error);
                });
            }
        }).catch((error) => {
            console.error("Error checking existing records: ", error);
        });
}

// Firestore에서 기록 불러오기
function displayRecordsFromFirestore() {
    db.collection('pressRecords').get().then((querySnapshot) => {
        const recordMap = {};
        querySnapshot.forEach((doc) => {
            const record = doc.data();
            const date = new Date(record.date);
            const formattedDate = `${date.getFullYear()}년 ${('0' + (date.getMonth() + 1)).slice(-2)}월 ${('0' + date.getDate()).slice(-2)}일`;
            const key = `${record.nickname}-${formattedDate}`;

            if (!recordMap[key] || record.count > recordMap[key].count) {
                recordMap[key] = {
                    nickname: record.nickname,
                    date: formattedDate,
                    count: record.count
                };
            }
        });

        recordListItems.innerHTML = '';
        Object.values(recordMap).sort((a, b) => b.count - a.count).slice(0, 10).forEach((record) => {
            recordListItems.innerHTML += `<li>${record.date} - ${record.nickname}: ${record.count}번</li>`;
        });
        recordList.style.display = 'block';
    }).catch((error) => {
        console.error("Error fetching records: ", error);
    });
}

// 24시가 지나면 클릭 수 초기화 (날짜가 바뀌면)
function resetDaily() {
    const today = new Date().toDateString();
    if (lastReset !== today) {
        saveRecordToFirestore(lastReset, nickname, pressCount);
        pressCount = 0; // 클릭 수 초기화
        lastReset = today;
        sessionStorage.setItem('lastReset', lastReset);
        savePressCount();
        updateCounter();
    }
}

// 자정을 체크하는 함수
function checkForMidnight() {
    setInterval(() => {
        resetDaily();
    }, 60000); // 1분마다 resetDaily 함수 호출
}

// 버튼 클릭 시 클릭 수 증가
button.addEventListener('click', () => {
    pressCount++;
    savePressCount();
    updateCounter();
});

// 기록 보기 버튼 클릭 이벤트 처리
viewRecordsButton.addEventListener('click', () => {
    if (recordList.style.display === 'none' || recordList.style.display === '') {
        displayRecordsFromFirestore();
        viewRecordsButton.textContent = 'TOP10 숨기기';
    } else {
        recordList.style.display = 'none';
        viewRecordsButton.textContent = 'TOP10 보기';
    }
});

// 닉네임 저장 버튼 클릭 이벤트 처리
saveNicknameButton.addEventListener('click', saveNickname);

// 수동으로 데이터 저장 버튼 클릭 시 Firestore에 데이터 저장
saveDataButton.addEventListener('click', () => {
    const today = new Date().toDateString();
    saveRecordToFirestore(today, nickname, pressCount);
});

// 페이지 로딩 시 초기화
updateCounter();
updateDate();
loadNickname();
resetDaily(); // 24시가 지났는지 확인하고 초기화
checkForMidnight(); // 자정 체크 함수 호출
