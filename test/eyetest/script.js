document.addEventListener("DOMContentLoaded", () => {
    // 요소들 가져오기
    const startScreen = document.getElementById("start-screen");
    const startBtn = document.getElementById("start-btn");
    const timerEl = document.getElementById("timer");
    const gameContainer = document.getElementById("game-container");
    const gameArea = document.getElementById("game-area");
    const choiceScreen = document.getElementById("choice-screen");
    const resultContainer = document.getElementById("result");
  
    let timerCount = 3;         // 카운트다운용 변수
    let stage = 1;              // 현재 스테이지 (1~3)
    let countdownInterval;      // 카운트다운 setInterval
    let animationFrameId;       // 공 움직임 requestAnimationFrame
    let stageTimeoutId;         // 스테이지 종료 타이머
    let splitTimeoutId;         // 공 분열 타이머
    let balls = [];             // 공 정보 배열
    let hasSplit = false;       // 분열 이벤트 단 한 번 실행 체크
    let correctAnswer = 0;      // 스테이지 정답(최종 공 개수)
    const ballSize = 20;        // 공 크기 (px)

    // ✅ 처음에는 결과 화면 숨기기
    resultContainer.classList.add("hidden");

    // ✅ 카카오 SDK 로드 및 초기화
    async function loadKakaoSDK() {
        return new Promise((resolve, reject) => {
            if (window.Kakao && Kakao.isInitialized()) {
                console.log("✅ 카카오 SDK 이미 초기화됨");
                resolve();
                return;
            }

            let script = document.createElement("script");
            script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
            script.onload = () => {
                if (!window.Kakao) {
                    reject("❌ Kakao 객체가 로드되지 않음");
                    return;
                }

                Kakao.init("eee6c2e01641161de9f217ba99c6a0da");
                console.log("✅ 카카오 SDK 로드 및 초기화 완료");
                resolve();
            };
            script.onerror = () => reject("❌ Kakao SDK 로드 실패");
            document.head.appendChild(script);
        });
    }

    // ✅ SDK가 먼저 로드되도록 실행
    loadKakaoSDK().then(() => {
        console.log("✅ 카카오 SDK 사용 준비 완료!");
    }).catch(error => {
        console.error("❌ 카카오 SDK 로딩 오류:", error);
    });


    // "게임 시작" 버튼 클릭 시
    startBtn.addEventListener("click", startGame);
  
    function startGame() {
        console.log("startGame() 호출됨, stage:", stage);
        stage = 1;
        startScreen.classList.add("hidden");
        choiceScreen.classList.add("hidden");
        resultContainer.classList.add("hidden");
    
        gameContainer.classList.remove("hidden");
        gameContainer.style.display = "flex";  
        gameContainer.style.backgroundImage = "none";
        gameContainer.style.backgroundColor = "black";
    
        timerEl.classList.remove("hidden");  // 🔥 숨김 해제
        timerEl.style.display = "block";  // 🔥 강제 표시
        timerEl.style.color = "white";    // 🔥 글자색 설정 (배경과 대비)
    
        document.getElementById("start-container").classList.add("hidden");
    
        countdown();
    }
  
    // 3초 카운트다운 (게임 시작 전)
    function countdown() {
        console.log("countdown() 시작");
        timerCount = 3;
        timerEl.textContent = timerCount;
        timerEl.style.display = "block"; // 카운트다운 시작 시 표시
    
        // 🔥 기존 공 숨기기
        gameArea.style.display = "none";  
    
        countdownInterval = setInterval(() => {
            timerCount--;
            timerEl.textContent = timerCount;
            console.log("타이머:", timerCount);
            if (timerCount <= 0) {
                clearInterval(countdownInterval);
                console.log("카운트다운 종료, startStage() 호출");
                timerEl.style.display = "none"; // 🔥 카운트다운 끝나면 숨기기
                startStage();
            }
        }, 1000);
    }
    
    
  
    // 스테이지 시작 (공 생성 및 애니메이션 시작)
    function startStage() {
        console.log("startStage() 호출됨, stage:", stage);
    
        // 🔥 이전 공 삭제 및 게임 영역 다시 표시
        gameArea.innerHTML = "";
        balls = [];
        hasSplit = false;  // ✅ 분열 상태 초기화 (Stage 3에서도 분열 가능)
    
        gameArea.style.display = "block";
        timerEl.textContent = "";
    
        const initialBallCount = Math.floor(Math.random() * 6) + 5;
        console.log("생성할 공 개수:", initialBallCount);
        createBalls(initialBallCount);
    
        // ✅ Stage 2, 3에서 분열 이벤트 실행
        if (stage >= 2) {
            splitTimeoutId = setTimeout(() => {
                console.log("splitBalls() 호출됨");
                splitBalls();
            }, 2000);
        }
    
        const stageTimes = {
            1: 15000, // Stage 1 → 15초
            2: 12000, // Stage 2 → 12초
            3: 10000   // Stage 3 → 10초
        };
        
        const displayTime = stageTimes[stage];
        animateBalls();
    
        stageTimeoutId = setTimeout(() => {
            endStage();
        }, displayTime);
    }
    
    
  
    // 공 생성 함수
    function createBalls(count) {
        console.log("createBalls() 호출됨, count:", count);
        const areaWidth = gameArea.offsetWidth;
        const areaHeight = gameArea.offsetHeight;
    
        if (areaWidth === 0 || areaHeight === 0) {
            console.warn("gameArea 크기가 0입니다. 스타일 확인 필요");
        }
    
        for (let i = 0; i < count; i++) {
            const ball = document.createElement("div");
            ball.classList.add("ball");
    
            const x = Math.random() * (areaWidth - ballSize);
            const y = Math.random() * (areaHeight - ballSize);
            let vx = Math.random() * 4 - 2;
            let vy = Math.random() * 4 - 2;
            if (vx === 0) vx = 1;
            if (vy === 0) vy = 1;
    
            ball.style.left = x + "px";
            ball.style.top = y + "px";
            gameArea.appendChild(ball);
    
            balls.push({ x, y, vx, vy, element: ball });
        }
    
        console.log("생성된 공 개수:", balls.length);
    }
  
    // 공 움직임 애니메이션 함수
    function animateBalls() {
      const areaWidth = gameArea.offsetWidth;
      const areaHeight = gameArea.offsetHeight;
  
      balls.forEach((ballObj) => {
        ballObj.x += ballObj.vx;
        ballObj.y += ballObj.vy;
        // 좌우 벽 충돌
        if (ballObj.x <= 0 || ballObj.x >= areaWidth - ballSize) {
          ballObj.vx *= -1;
          ballObj.x = Math.max(0, Math.min(ballObj.x, areaWidth - ballSize));
        }
        // 상하 벽 충돌
        if (ballObj.y <= 0 || ballObj.y >= areaHeight - ballSize) {
          ballObj.vy *= -1;
          ballObj.y = Math.max(0, Math.min(ballObj.y, areaHeight - ballSize));
        }
        ballObj.element.style.left = ballObj.x + "px";
        ballObj.element.style.top = ballObj.y + "px";
      });
      animationFrameId = requestAnimationFrame(animateBalls);
    }
  
    // 분열 이벤트: 일부 공이 분열하여 새 공 생성 (Stage 2,3에서만)
    function splitBalls() {
      if (hasSplit) return;
      hasSplit = true;
      const currentBalls = [...balls];
      currentBalls.forEach((ballObj) => {
        if (Math.random() < 0.4) {
          const newBall = document.createElement("div");
          newBall.classList.add("ball");
          const x = ballObj.x + 5;
          const y = ballObj.y + 5;
          let vx = Math.random() * 4 - 2;
          let vy = Math.random() * 4 - 2;
          if (vx === 0) vx = 1;
          if (vy === 0) vy = 1;
          newBall.style.left = x + "px";
          newBall.style.top = y + "px";
          gameArea.appendChild(newBall);
          balls.push({ x, y, vx, vy, element: newBall });
        }
      });
    }
  
    // 스테이지 종료 및 선택지 화면으로 전환
    function endStage() {
      console.log("endStage() 호출됨, stage:", stage);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(splitTimeoutId);
      correctAnswer = balls.length;
      console.log("정답(공 개수):", correctAnswer);
      // 배경 이미지를 제거하고 배경색을 검은색으로 설정
      gameContainer.style.background = "black"; // shorthand로 전체 배경 적용
      // 0.5초 후 선택지 화면으로 전환
      setTimeout(() => {
        gameContainer.classList.add("hidden");
        choiceScreen.classList.remove("hidden");
        showChoices();
      }, 500);
    }
  
    // 선택지 화면에 정답과 오답(±2 범위 내) 3개를 무작위로 배치
    function showChoices() {
        console.log("showChoices() 호출됨");
    
        choiceScreen.classList.remove("hidden");
        choiceScreen.style.display = "block"; 
    
        let choices = new Set();
        choices.add(correctAnswer);
    
        while (choices.size < 3) {
            let randomOffset = Math.floor(Math.random() * 5) - 2;
            let wrongAnswer = correctAnswer + randomOffset;
            if (wrongAnswer !== correctAnswer && wrongAnswer > 0) {
                choices.add(wrongAnswer);
            }
        }
    
        let choicesArray = Array.from(choices);
        console.log("선택지:", choicesArray);
    
        const choiceButtons = document.querySelectorAll(".choice-btn");
        choiceButtons.forEach((btn, index) => {
            btn.style.display = "inline-block"; 
            btn.textContent = choicesArray[index];
            btn.onclick = () => checkAnswer(choicesArray[index]);
        });
    }
    
  
    // 선택지 버튼 클릭 시 정답 체크 및 다음 스테이지 진행/결과 화면 전환
    function checkAnswer(answer) {
        console.log("선택된 답:", answer, "정답:", correctAnswer);
    
        // 기존 메시지가 있으면 삭제
        const oldMessage = document.getElementById("result-message");
        if (oldMessage) oldMessage.remove();
    
        // 메시지 생성
        const message = document.createElement("div");
        message.id = "result-message";  // ✅ CSS에서 스타일 적용됨
    
        // 정답 또는 오답 메시지 설정
        if (answer === correctAnswer) {
            message.innerHTML = "정답입니다😃";
        } else {
            message.innerHTML = "오답입니다😢<br>다시 도전하세요!";
        }
    
        document.body.appendChild(message);
    
        // 일정 시간 후 메시지 제거 및 다음 단계 처리
        setTimeout(() => {
            message.remove();
            if (answer === correctAnswer) {
                stage++;
                if (stage > 3) {
                    showResult();
                } else {
                    choiceScreen.classList.add("hidden");
                    gameContainer.classList.remove("hidden");
                    countdown();
                }
            } else {
                resetGame();
            }
        }, 2000);
    }
    
    function resetGame() {
    console.log("🔁 resetGame() 호출됨");

    // 상태 초기화
    stage = 1;
    balls = [];
    hasSplit = false;
    correctAnswer = 0;
    clearTimeout(stageTimeoutId);
    clearTimeout(splitTimeoutId);
    cancelAnimationFrame(animationFrameId);

    // UI 초기화
    gameArea.innerHTML = "";
    gameArea.style.display = "none";
    choiceScreen.classList.add("hidden");
    resultContainer.classList.add("hidden");
    timerEl.classList.add("hidden");

    // 시작 화면으로 복귀
    startScreen.classList.remove("hidden");
    startBtn.style.display = "inline-block";
    document.getElementById("start-container").classList.remove("hidden");  // 🔥 추가된 줄
}
  
    // ✅ 게임 종료 후 결과 화면 표시
    function showResult() {
        console.log("showResult() 호출됨");

        gameContainer.classList.add("hidden");
        choiceScreen.classList.add("hidden");
        resultContainer.classList.remove("hidden"); // ✅ 결과 화면 표시

        // ✅ 결과 화면 내용을 추가
        resultContainer.innerHTML = `
            <img id="result-image" src="https://www.survivaloffice.com/images/eyetestchoend.png" alt="수료증">
            <div id="result-buttons">
                <button id="share-kakao">카카오톡 공유하기</button>
                <button id="save-image">이미지 저장하기</button>
            </div>
        `;

        // ✅ 버튼 이벤트 추가
        document.getElementById("share-kakao").addEventListener("click", shareKakao);
        document.getElementById("save-image").addEventListener("click", saveImage);
    }

        // ✅ 카카오톡 공유하기 버튼 이벤트
        async function shareKakao() {
            try {
                await loadKakaoSDK(); // SDK가 로드될 때까지 기다림

                if (!window.Kakao || !Kakao.isInitialized()) {
                    alert("⚠️ 카카오 SDK가 초기화되지 않았습니다. 다시 시도해 주세요.");
                    return;
                }

                Kakao.Link.sendDefault({
                    objectType: "feed",
                    content: {
                        title: "동체시력 테스트 수료증",
                        description: "나의 동체시력 테스트 결과를 확인해보세요!",
                        imageUrl: "https://www.survivaloffice.com/images/eyetestchoend.png",
                        link: {
                            mobileWebUrl: "https://www.survivaloffice.com/test/eyetest",
                            webUrl: "https://www.survivaloffice.com/test/eyetest"
                        }
                    },
                    buttons: [
                        {
                            title: "테스트 결과 보기",
                            link: {
                                mobileWebUrl: "https://www.survivaloffice.com/test/eyetest",
                                webUrl: "https://www.survivaloffice.com/test/eyetest"
                            }
                        }
                    ]
                });

                console.log("✅ 카카오톡 공유 성공!");
            } catch (error) {
                console.error("❌ 카카오톡 공유 오류:", error);
                alert("⚠️ 카카오톡 공유 중 오류가 발생했습니다. 다시 시도해 주세요.");
            }
        }

        // ✅ 버튼 이벤트 리스너 추가
        document.addEventListener("DOMContentLoaded", () => {
            document.getElementById("share-kakao").addEventListener("click", shareKakao);
        });

    // ✅ 이미지 저장하기
    function saveImage() {
        const imgElement = document.getElementById("result-image");
        const imgURL = imgElement.src;
    
        // 🔥 이미지 다운로드 링크 생성
        const link = document.createElement("a");
        link.href = imgURL;
        link.setAttribute("download", "eyetest_result.png"); // 🔥 다운로드 파일명 지정
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});