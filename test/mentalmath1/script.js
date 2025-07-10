    // 요소 참조
    const loadingMessage = document.getElementById("loading-message");
    const startButton = document.getElementById("start-btn");
    const startScreen = document.getElementById("start-screen");
    const gamearea = document.getElementById("game-area");
    const countdownContainer = document.getElementById("countdown-container");
    const questionContainer = document.getElementById("question-container");
    const choicesContainer = document.getElementById("choices-container");
    const feedback = document.getElementById("feedback");

    let currentProblem = 0;
    const totalProblems = 5;
    let currentAnswer = 0;
    let score = 0;
    let isGameOver = false;
    let choiceTimeout = null;

    // 이미지 미리 로드
    function preloadImages(imageUrls, callback) {
        let loadedCount = 0;
        const totalImages = imageUrls.length;
        imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
            img.onload = img.onerror = () => {
                loadedCount++;
                loadingMessage.textContent = `이미지 로드 중... (${loadedCount}/${totalImages})`;
                if (loadedCount === totalImages) callback();
            };
        });
    }

    preloadImages([
        "https://www.survivaloffice.com/images/mentalmath1.png",
        "https://www.survivaloffice.com/images/mentalmath1main.png"
    ], () => {
        loadingMessage.textContent = "";
        startButton.style.display = "block";
    });

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

    function shareKakao() {
        if (!window.Kakao || !Kakao.isInitialized()) {
            alert("⚠️ 카카오톡 공유 기능을 사용할 수 없습니다.");
            return;
        }

        Kakao.Link.sendDefault({
            objectType: "feed",
            content: {
                title: "암산 능력 평가 결과",
                description: "🎉 모든 문제를 맞췄어요! 당신도 도전해보세요!",
                imageUrl: "https://www.survivaloffice.com/images/mentalmath1main_a.png", // 썸네일용
                link: {
                    mobileWebUrl: "https://www.survivaloffice.com/test/mentalmath1",
                    webUrl: "https://www.survivaloffice.com/test/mentalmath1"
                }
            },
            buttons: [
                {
                    title: "테스트 하러 가기",
                    link: {
                        mobileWebUrl: "https://www.survivaloffice.com/test/mentalmath1",
                        webUrl: "https://www.survivaloffice.com/test/mentalmath1"
                    }
                }
            ]
        });
    }

    // 시작 버튼
    startButton.addEventListener("click", () => {
        startScreen.style.display = "none";
        startCountdown();
    });

    // 카운트다운
    function startCountdown() {
        countdownContainer.style.display = "block";
        let countdown = 3;
        countdownContainer.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            if (countdown < 0) {
                clearInterval(interval);
                countdownContainer.style.display = "none";
                showGameUI();
            } else {
                countdownContainer.textContent = countdown;
            }
        }, 1000);
    }

    // 게임 UI 표시
    function showGameUI() {
        gamearea.style.display = 'block';
        isGameOver = false;
        score = 0;
        currentProblem = 0;
        showProblem();
    }

    // 문제 생성
    function generateProblem(index) {
        const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        let parts = [];

        switch (index) {
            case 0: {
                parts = [rand(1, 9), Math.random() < 0.5 ? "+" : "-", rand(1, 9)];
                break;
            }
            case 1: {
                parts = [rand(1, 9)];
                for (let i = 0; i < 2; i++) {
                    parts.push(Math.random() < 0.5 ? "+" : "-");
                    parts.push(rand(1, 9));
                }
                break;
            }
            case 2: {
                const a = rand(10, 99);
                const b = rand(10, 99);
                const c = rand(2, 9);
                const op1 = Math.random() < 0.5 ? "+" : "-";
                const op2 = Math.random() < 0.5 ? "*" : "/";
                if (op2 === "/") {
                    const product = b * c;
                    parts = [a, op1, product, "/", c];
                } else {
                    parts = [a, op1, b, "*", c];
                }
                break;
            }
            case 3: {
                const a = rand(10, 99);
                const b = rand(1, 9);
                const c = rand(1, 9);
                const op1 = Math.random() < 0.5 ? "+" : "-";
                const op2 = Math.random() < 0.5 ? "*" : "/";
                if (op2 === "/") {
                    const product = b * c;
                    parts = [a, op1, product, "/", c];
                } else {
                    parts = [a, op1, b, "*", c];
                }
                break;
            }
            case 4: {
                const a = rand(1, 9);
                const b = rand(10, 99);
                const c = rand(10, 99);
                const op1 = Math.random() < 0.5 ? "*" : "/";
                const op2 = Math.random() < 0.5 ? "*" : "/";
                if (op1 === "/" && op2 === "*") {
                    const product = b * c;
                    parts = [a * product, "/", b, "*", c];
                } else if (op1 === "/" && op2 === "/") {
                    const div1 = a * b;
                    const div2 = div1 * c;
                    parts = [div2, "/", b, "/", c];
                } else if (op1 === "*" && op2 === "/") {
                    const product = b * c;
                    parts = [a, "*", product, "/", c];
                } else {
                    parts = [a, "*", b, "*", c];
                }
                break;
            }
        }

        const displayQuestion = parts.map(p => {
            if (p === "*") return "×";
            if (p === "/") return "÷";
            return p;
        }).join(" ");

        const answer = evaluateSequential(parts.map(p => p.toString().replace("×", "*").replace("÷", "/")));

        return {
            question: displayQuestion,
            answer: answer
        };
    }

    // 문제 애니메이션
    function animateQuestionDisplay(parts, callback) {
        let index = 0;
        questionContainer.textContent = "";

        function showNext() {
            if (index >= parts.length) {
                questionContainer.textContent = "";
                setTimeout(callback, 300);
                return;
            }

            questionContainer.textContent = parts[index];
            setTimeout(() => {
                questionContainer.textContent = "";
                index++;
                setTimeout(showNext, 200);
            }, 800);
        }

        showNext();
    }

    // 순차계산 함수
    function evaluateSequential(parts) {
        let result = parseFloat(parts[0]);
        for (let i = 1; i < parts.length; i += 2) {
            const op = parts[i];
            const num = parseFloat(parts[i + 1]);
            if (op === "+") result += num;
            else if (op === "-") result -= num;
            else if (op === "*") result *= num;
            else if (op === "/") result = result / num;
        }
        return Math.round(result);
    }

    // 선택지 생성
    function generateChoices(answer) {
        const choices = [answer];
        while (choices.length < 3) {
            const fake = answer + Math.floor(Math.random() * 21 - 10);
            if (!choices.includes(fake)) {
                choices.push(fake);
            }
        }
        return choices.sort(() => Math.random() - 0.5);
    }

    // 문제 표시
    function showProblem() {
        const { question, answer } = generateProblem(currentProblem);
        currentAnswer = answer;
        const parts = question.split(" ");
        animateQuestionDisplay(parts, () => {
            showChoices(generateChoices(answer));
        });
    }

    // 선택지 표시 및 시간 제한
    function showChoices(choices) {
        choicesContainer.innerHTML = "";

        console.log("정답:", currentAnswer); // ✅ 정답 로그

        const timerDisplay = document.getElementById("choice-timer");
        let timeLeft = 3;
        timerDisplay.textContent = timeLeft;
        timerDisplay.style.display = "block";

        const timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.style.display = "none";
            } else {
                timerDisplay.textContent = timeLeft;
            }
        }, 1000);

        choices.forEach(choice => {
            const btn = document.createElement("button");
            btn.textContent = choice;
            btn.onclick = () => {
                clearTimeout(choiceTimeout);
                clearInterval(timerInterval);
                timerDisplay.style.display = "none";
                handleAnswer(choice, currentAnswer);
            };
            choicesContainer.appendChild(btn);
        });

        // 3초 동안 선택 안 하면 오답 처리
        choiceTimeout = setTimeout(() => {
            clearInterval(timerInterval);
            timerDisplay.style.display = "none";
            handleAnswer(null, currentAnswer);
        }, 3000);
    }

    // 정답 처리
    function handleAnswer(selected, correct) {
        disableChoices();
        clearTimeout(choiceTimeout);

        if (selected === correct) {
            score++;
            feedback.textContent = "정답입니다!";
        } else {
            feedback.textContent = "틀렸습니다!";
        }

        // ✅ 디버깅 로그: 여기 추가!
        console.log("selected:", selected, "correct:", correct, "score:", score, "currentProblem:", currentProblem);


        setTimeout(() => {
            questionContainer.textContent = "";
            choicesContainer.innerHTML = "";
            feedback.textContent = "";

        if (selected !== correct) {
            showGameOverPopup();
        } else if (score === totalProblems) {
            showResult(); // 정답 5개 맞췄을 때 결과 화면 표시
        } else {
            currentProblem++;
            startNextProblemCountdown();
        }
        }, 800);
    }

    // 선택지 비활성화
    function disableChoices() {
        const buttons = choicesContainer.querySelectorAll("button");
        buttons.forEach(button => {
            button.disabled = true;
            button.style.cursor = "not-allowed";
            button.style.opacity = "0.5";
        });
    }

    // 다음 문제 카운트다운
    function startNextProblemCountdown() {
        let countdown = 3;
        countdownContainer.style.display = "block";
        countdownContainer.textContent = countdown;

        const interval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(interval);
                countdownContainer.style.display = "none";
                showProblem();
            } else {
                countdownContainer.textContent = countdown;
            }
        }, 1000);
    }

    function resetGame() {
        // 상태 초기화
        score = 0;
        currentProblem = 0;
        isGameOver = false;
        clearTimeout(choiceTimeout);

        // UI 초기화
        countdownContainer.style.display = "none";
        questionContainer.textContent = "";
        choicesContainer.innerHTML = "";
        feedback.textContent = "";
        gamearea.style.display = "none";
        document.getElementById("custom-gameover").style.display = "none";
        document.getElementById("result-container").style.display = "none";

        // 시작화면 보여주기
        startScreen.style.display = "block";
        startButton.style.display = "block"; // 혹시 사라졌을 경우 대비
    }

    // 게임오버 화면 표시
    function showGameOverPopup() {
        document.getElementById("custom-gameover").style.display = "flex";
    }

    function showResult() {
        gamearea.style.display = "none";

        const resultContainer = document.getElementById("result-container");
        resultContainer.style.display = "flex"; // 결과화면 보이기

        const shareBtn = document.getElementById("share-kakao");
        shareBtn.onclick = shareKakao; // 공유 버튼에 이벤트 부착
    }

    document.getElementById("retry-button").addEventListener("click", resetGame);

