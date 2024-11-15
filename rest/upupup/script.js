// 모듈 방식으로 Firebase와 Firestore 가져오기 (최상단에 위치)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

    // Firebase 초기화
    const firebaseConfig = {
        apiKey: "AIzaSyCK4Zdkhlc0cnjqC3TpmUJmLAt8Xrh8VOw",
        authDomain: "upupup-e4c2c.firebaseapp.com",
        projectId: "upupup-e4c2c",
        storageBucket: "upupup-e4c2c.appspot.com",
        messagingSenderId: "877963060151",
        appId: "1:877963060151:web:e70751cb30638880767e32"
    };
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // `db` 인스턴스 확인
    console.log("Firestore DB 인스턴스 확인:", db);    

document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('closePopupButton');
    const stairsContainer = document.getElementById('stairs-container');
    const character = document.getElementById('character'); 
    const timeElement = document.getElementById('time');
    const scoreElement = document.getElementById('score-value');
    const leftButton = document.getElementById('left-btn');
    const rightButton = document.getElementById('right-btn');
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const background = document.getElementById('background');
    const gameContainer = document.getElementById('game-container');

    let timeLeft = 100;
    let score = 0;
    let currentStep = 0;
    let currentGrid = 2;
    let scrollPosition = 0;
    const gridWidth = 4;
    const TOTAL_STAIRS = 101;
    const stairPositions = [];
    let timeInterval;
    let isGameOver = false;

    // 미리 로드할 이미지 URL 목록
    const imageUrls = [
        "https://www.survivaloffice.com/images/UPA.jpg",
        "https://www.survivaloffice.com/images/UPB.jpg",
        "https://www.survivaloffice.com/images/UPC.jpg",
        "https://www.survivaloffice.com/images/UPD.jpg",
        "https://www.survivaloffice.com/images/start.png",
        "https://www.survivaloffice.com/images/left.png",
        "https://www.survivaloffice.com/images/right.png",
        "https://www.survivaloffice.com/images/end.png",
        "https://www.survivaloffice.com/images/goal.png"
    ];

    // 이미지 미리 로드 함수
    function preloadImages(callback) {
        let loadedImages = 0;

        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                loadedImages++;
                if (loadedImages === imageUrls.length) {
                    callback();
                }
            };
            img.onerror = () => {
                loadedImages++;
                if (loadedImages === imageUrls.length) {
                    callback();
                }
            };
        });
    }

    // 게임 시작 준비
    preloadImages(() => {
        startBtn.disabled = false;
    });
    
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        createInitialStairs();
        setInitialPosition();

        // 이동 키를 누르기 전 기본 캐릭터 이미지 설정
        character.style.backgroundImage = "url('https://www.survivaloffice.com/images/right.png')";

        // 타이머 시작
        timeInterval = setInterval(decreaseTime, 1000);
        updateBackground(score);
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            moveCharacter('left');
        } else if (event.key === 'ArrowRight') {
            moveCharacter('right');
        }
    });

    leftButton.addEventListener('click', () => moveCharacter('left'));
    rightButton.addEventListener('click', () => moveCharacter('right'));

    function updateBackground(currentStep) {
        if (currentStep >= 0 && currentStep <= 30) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPA.jpg')";
        } else if (currentStep >= 31 && currentStep <= 70) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPB.jpg')";
        } else if (currentStep >= 71 && currentStep <= 99) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPC.jpg')";
        } else if (currentStep >= 100) {
            background.style.backgroundImage = "url('https://www.survivaloffice.com/images/UPD.jpg')";
        }
    }

    function createInitialStairs() {
        let lastGrid = 2;
        stairPositions.length = 0; // 이전 데이터를 초기화
        for (let i = 0; i < TOTAL_STAIRS; i++) {
            createStair(i, lastGrid);
            lastGrid = currentGrid;
        }
    }

    function createStair(step, lastGrid) {
        const stair = document.createElement('div');
        stair.classList.add('stair');
        stair.style.bottom = `${step * 60}px`;

        if (lastGrid === 1) currentGrid = 2;
        else if (lastGrid === 2) currentGrid = Math.random() > 0.5 ? 1 : 3;
        else if (lastGrid === 3) currentGrid = Math.random() > 0.5 ? 2 : 4;
        else if (lastGrid === 4) currentGrid = 3;

        stair.style.left = `${(currentGrid - 1) * 100}px`;
        stairsContainer.appendChild(stair);
        stairPositions.push({ step: step, grid: currentGrid, element: stair });
    }

    function setInitialPosition() {
        const firstStair = stairPositions[0];
        currentGrid = firstStair.grid;
    
        // 초기 위치 설정
        character.style.left = `${(currentGrid - 1) * 100 + 30}px`;
        character.style.bottom = `${firstStair.step * 60}px`;
        character.style.display = 'block'; // 캐릭터 표시
    
        // 계단 컨테이너의 스크롤 위치 초기화
        stairsContainer.style.transform = 'translateY(0px)';
        scrollPosition = 0;
    }

    function moveCharacter(direction) {
        if (isGameOver) return; // 게임 종료 시 이동 불가

        const nextStep = currentStep + 1;

        // 방향에 맞는 이미지 변경
        if (direction === 'left' && currentGrid > 1) {
            currentGrid--;
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/left.png')";
        } else if (direction === 'right' && currentGrid < gridWidth) {
            currentGrid++;
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/right.png')";
        }

        if (isOnStair(currentGrid, nextStep)) {
            currentStep++;
            if (currentStep < 6) character.style.bottom = `${currentStep * 60}px`;
            else {
                scrollPosition += 60;
                stairsContainer.style.transform = `translateY(${scrollPosition}px)`;
                character.style.bottom = `${5 * 60}px`;
            }
            character.style.left = `${(currentGrid - 1) * 100 + 30}px`;

            updateBackground(currentStep);
            increaseScore();
            checkIfGameFinished();
        } else {
            gameOver();
        }
    }

    function isOnStair(grid, step) {
        return stairPositions.some(pos => pos.step === step && pos.grid === grid);
    }

    function increaseScore() {
        score++;
        scoreElement.textContent = score;
        if (score % 10 === 0) {
            timeLeft += 1;
            timeElement.style.color = '#4caf50';
            setTimeout(() => {
                timeElement.style.color = '#000';
            }, 500);
        }
    }

    function decreaseTime() {
        if (timeLeft > 0) timeLeft--;
        else gameOver();
        timeElement.textContent = timeLeft;
    }

    function showPopup(message) {
        const popup = document.getElementById('result-popup');
        const resultMessage = document.getElementById('result-message');
        resultMessage.innerHTML = `${message}<br>최종 점수: ${score}`;
        popup.style.display = 'block';
    }

    function closePopup() {
        const popup = document.getElementById('result-popup');
        popup.style.display = 'none';
    }

    function gameOver() {
        isGameOver = true; // 게임 종료 상태로 설정
        character.style.backgroundImage = "url('https://www.survivaloffice.com/images/end.png')";    
        showPopup("게임 오버! 다시 도전하세요.");
        clearInterval(timeInterval); // 타이머 정지
    }

    function checkIfGameFinished() {
        if (currentStep >= 100) {
            character.style.backgroundImage = "url('https://www.survivaloffice.com/images/goal.png')";            
            showPopup("축하합니다. 자유입니다.");
            clearInterval(timeInterval); // 타이머 정지
        }
    }

// saveScore 함수 (v9 모듈 방식)
    async function saveScore(nickname, score) {
    console.log("Firestore에 점수 저장 시도:", nickname, score);
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // UTC+9 (밀리초)
    const kstDate = new Date(now.getTime() + kstOffset);
    const date = kstDate.toISOString().slice(0, 19).replace("T", " ");

    const scoresRef = collection(db, 'scores');
    const q = query(scoresRef, where('nickname', '==', nickname || 'Unknown'));

    try {
        console.log("쿼리 시작");
        const querySnapshot = await getDocs(q);
        console.log("쿼리 결과 개수:", querySnapshot.size); 

        if (!querySnapshot.empty) {
            console.log("기존 기록 발견, 업데이트 시도 중...");
            for (const document of querySnapshot.docs) {
                const existingRecord = document.data();
                console.log("기존 기록:", existingRecord);

                if (score > existingRecord.score) {
                    await updateDoc(doc(db, 'scores', document.id), {
                        score: score,
                        date: date
                    });
                    alert('기록이 업데이트되었습니다.');
                    console.log("기록 업데이트 성공");
                    setTimeout(() => {
                        window.location.reload(); // 업데이트 후 새로고침
                    }, 100);
                } else {
                    alert('기록이 업데이트되지 않았습니다. 기존 점수가 더 높습니다.');
                    console.log("기존 점수가 더 높음");
                    setTimeout(() => {
                        window.location.reload(); // 새로고침
                    }, 100);
                }
            }
        } else {
            console.log("기존 기록이 없음, 새로운 문서 추가 중...");
            await addDoc(scoresRef, {
                nickname: nickname || 'Unknown',
                score: score,
                date: date
            });
            alert('점수가 성공적으로 저장되었습니다.');
            console.log("새로운 문서 추가 성공");
                                setTimeout(() => {
                        window.location.reload(); // 새로고침
                    }, 100);
        }
    } catch (error) {
        console.error("Error adding data:", error);
        alert('점수 저장 중 오류가 발생했습니다.');
    }
}
    // 닫기 버튼이 존재할 경우에만 이벤트 리스너 등록
    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            console.log("닫기 버튼 클릭됨, 새로고침 수행");
            window.location.reload();
        });
    } else {
        console.error("closePopupButton 요소를 찾을 수 없습니다.");
    }

    // 점수 저장 버튼 이벤트 리스너
    document.getElementById('saveScoreButton').addEventListener('click', async (event) => {
        event.preventDefault();
        const nickname = document.getElementById('nicknameInput').value;
        if (nickname.trim() === "") {
            alert("닉네임을 입력해주세요.");
            return;
        }
        await saveScore(nickname, score);
    });
});
