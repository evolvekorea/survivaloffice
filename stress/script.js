// HTML 요소들을 자바스크립트로 가져오기
const button = document.getElementById('pressButton');
const counterDisplay = document.getElementById('counter');
const viewRecordsButton = document.getElementById('viewRecords');
const recordList = document.getElementById('recordList');
const recordListItems = document.getElementById('recordListItems');

// 현재 누른 횟수, localStorage에서 불러오거나 없으면 0으로 시작
let pressCount = localStorage.getItem('pressCount') || 0;
let lastReset = localStorage.getItem('lastReset') || new Date().toDateString();
let records = JSON.parse(localStorage.getItem('records')) || [];

// 화면에 현재 횟수를 업데이트하는 함수
function updateCounter() {
    counterDisplay.textContent = `${pressCount}번 눌렀습니다`;
}

// 버튼을 눌렀을 때 횟수를 증가시키고 저장하는 함수
function savePressCount() {
    localStorage.setItem('pressCount', pressCount);
}

// 하루마다 기록을 초기화하고 저장하는 함수
function resetDaily() {
    const today = new Date().toDateString();
    if (lastReset !== today) {
        // 어제의 기록을 저장하고, 기록 리스트를 정렬 후 상위 10개만 저장
        records.push({ date: lastReset, count: pressCount });
        records.sort((a, b) => b.count - a.count);
        records = records.slice(0, 10);
        localStorage.setItem('records', JSON.stringify(records));

        // 새로운 하루 시작
        pressCount = 0;
        lastReset = today;
        localStorage.setItem('lastReset', lastReset);
        savePressCount();
    }
}

// 기록을 화면에 표시하는 함수
function displayRecords() {
    recordListItems.innerHTML = records.map(record => 
        `<li>${record.date}: ${record.count}번</li>`
    ).join('');
    recordList.style.display = 'block'; // 기록 리스트를 보여줍니다
}

// 버튼 클릭 이벤트 처리
button.addEventListener('click', () => {
    pressCount++;
    savePressCount();
    updateCounter();
});

// 기록 보기 버튼 클릭 이벤트 처리
viewRecordsButton.addEventListener('click', () => {
    if (recordList.style.display === 'none' || recordList.style.display === '') {
        // 기록이 보이지 않으면 표시
        displayRecords();
        recordList.style.display = 'block';
        viewRecordsButton.textContent = '기록 숨기기';  // 버튼 텍스트 변경
    } else {
        // 기록이 보이면 숨김
        recordList.style.display = 'none';
        viewRecordsButton.textContent = '기록 보기';  // 버튼 텍스트 변경
    }
});

// 초기 실행 시 현재 횟수와 기록을 불러옵니다
updateCounter();
resetDaily();
