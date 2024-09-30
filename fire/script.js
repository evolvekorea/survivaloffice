document.getElementById("generate-btn").addEventListener("click", generateLottoNumbers);
document.getElementById("save-btn").addEventListener("click", saveToLocalStorage);

let generatedNumbers = [];
let isSpinning = false; // 애니메이션 진행 여부

// 로또 번호 생성
function generateLottoNumbers() {
    if (isSpinning) return; // 이미 애니메이션이 진행 중인 경우 무시
    isSpinning = true;

    let slots = document.querySelectorAll(".slot-machine .slot");

    // 애니메이션: 번호가 바뀌는 동안 일정 시간 동안 진행
    let spinDuration = 2000; // 2초 동안 애니메이션
    let interval = setInterval(() => {
        slots.forEach(slot => {
            let randomNumber = Math.floor(Math.random() * 45) + 1;
            slot.textContent = randomNumber;
        });
    }, 100); // 0.1초마다 랜덤 번호 변경

    // 2초 후에 애니메이션 종료 및 최종 번호 설정
    setTimeout(() => {
        clearInterval(interval);
        generatedNumbers = [];

        // 최종 로또 번호 생성
        while (generatedNumbers.length < 6) {
            let randomNumber = Math.floor(Math.random() * 45) + 1;
            if (!generatedNumbers.includes(randomNumber)) {
                generatedNumbers.push(randomNumber);
            }
        }

        // 생성된 숫자를 슬롯에 표시
        for (let i = 0; i < slots.length; i++) {
            slots[i].textContent = generatedNumbers[i];
        }

        isSpinning = false; // 애니메이션 종료 상태
    }, spinDuration);
}

// 로컬 스토리지에 저장하고 5개까지만 유지, 맨 위에서부터 업데이트
function saveToLocalStorage() {
    if (generatedNumbers.length === 6) {
        let savedNumbers = JSON.parse(localStorage.getItem("savedLottoNumbers")) || [];

        // 최대 5개만 유지하도록 처리
        if (savedNumbers.length >= 5) {
            savedNumbers.pop(); // 가장 오래된 번호 제거
        }

        // 새로운 번호를 배열의 맨 앞에 추가하여 최신 번호가 맨 위로 오게 함
        savedNumbers.unshift(generatedNumbers);
        localStorage.setItem("savedLottoNumbers", JSON.stringify(savedNumbers));

        displaySavedNumbers(); // 번호 저장 후 저장된 목록을 다시 표시
        alert("번호가 저장되었습니다!");
    } else {
        alert("먼저 번호를 생성하세요!");
    }
}

// 저장된 번호 목록을 화면에 표시
function displaySavedNumbers() {
    const savedNumbers = JSON.parse(localStorage.getItem("savedLottoNumbers")) || [];
    const listElement = document.getElementById("saved-numbers-list");
    
    // 목록을 초기화
    listElement.innerHTML = "";

    // 저장된 번호 중 상위 5개만 표시
    savedNumbers.slice(0, 5).forEach(numbers => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("saved-number-row");

        numbers.forEach(number => {
            const numberDiv = document.createElement("div");
            numberDiv.classList.add("saved-slot"); // 저장된 번호에도 'slot'과 동일한 디자인 적용
            numberDiv.textContent = number;
            rowDiv.appendChild(numberDiv);
        });

        listElement.appendChild(rowDiv);
    });
}

// 페이지 로드 시 저장된 번호 목록 삭제
window.onload = function() {
    // 로컬 스토리지의 저장된 번호를 초기화
    localStorage.removeItem("savedLottoNumbers");
    displaySavedNumbers(); // 초기화 후 저장된 목록을 비운 상태로 표시
}
