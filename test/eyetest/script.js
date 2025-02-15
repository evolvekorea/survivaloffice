document.addEventListener("DOMContentLoaded", () => {
    // 요소들 가져오기
    const startScreen = document.getElementById("start-screen");
    const startBtn = document.getElementById("start-btn");
    const timerEl = document.getElementById("timer");
    const gameContainer = document.getElementById("game-container");
    const gameArea = document.getElementById("game-area");
    const choiceScreen = document.getElementById("choice-screen");
    const resultContainer = document.getElementById("result");
  
    let timerCount = 5;         // 카운트다운용 변수
    let stage = 1;              // 현재 스테이지 (1~3)
    let countdownInterval;      // 카운트다운 setInterval
    let animationFrameId;       // 공 움직임 requestAnimationFrame
    let stageTimeoutId;         // 스테이지 종료 타이머
    let splitTimeoutId;         // 공 분열 타이머
    let balls = [];             // 공 정보 배열
    let hasSplit = false;       // 분열 이벤트 단 한 번 실행 체크
    let correctAnswer = 0;      // 스테이지 정답(최종 공 개수)
    const ballSize = 20;        // 공 크기 (px)
  
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
  
    // 5초 카운트다운 (게임 시작 전)
    function countdown() {
        console.log("countdown() 시작");
        timerCount = 5;
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
    
        const displayTime = (stage === 3) ? 10000 : 15000;
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
        message.id = "result-message"; 
        message.style.position = "fixed";
        message.style.top = "50%";
        message.style.left = "50%";
        message.style.transform = "translate(-50%, -50%)";
        message.style.fontSize = "40px";
        message.style.fontWeight = "bold";
        message.style.color = "white";
        message.style.padding = "20px";
        message.style.borderRadius = "10px";
        message.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        message.style.zIndex = "1000";
        message.style.textAlign = "center";
    
        if (answer === correctAnswer) {
            message.textContent = "정답입니다!";
            document.body.appendChild(message);
            stage++;
            setTimeout(() => {
                message.remove();
                if (stage > 3) {
                    showResult();
                } else {
                    choiceScreen.classList.add("hidden");
                    gameContainer.classList.remove("hidden");
                    countdown();
                }
            }, 1500);
        } else {
            message.textContent = "오답입니다. 다시 도전하세요!";
            document.body.appendChild(message);
            setTimeout(() => {
                message.remove();
                location.reload();
            }, 2000);
        }
    }
    
  
    // 결과 화면 표시
    function showResult() {
      console.log("showResult() 호출됨");
      gameContainer.classList.add("hidden");
      choiceScreen.classList.add("hidden");
      resultContainer.classList.remove("hidden");
    }
  });
  