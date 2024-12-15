// 모듈 방식으로 Firebase와 Firestore 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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

// Planck.js 초기 설정 및 공통 변수 설정
const pl = planck, Vec2 = pl.Vec2;
const world = pl.World(Vec2(0, -10));
const planetArea = document.getElementById("planet-area");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
planetArea.appendChild(canvas);
canvas.width = 360;
canvas.height = 450;

// 행성 데이터 (10개)
const planets = [
    { name: "명왕성", url: "https://survivaloffice.com/images/1.png", score: 10, baseSize: 0.10 },
    { name: "수성", url: "https://survivaloffice.com/images/2.png", score: 20, baseSize: 0.12 },
    { name: "화성", url: "https://survivaloffice.com/images/3.png", score: 40, baseSize: 0.20 },
    { name: "금성", url: "https://survivaloffice.com/images/4.png", score: 80, baseSize: 0.22 },
    { name: "지구", url: "https://survivaloffice.com/images/5.png", score: 120, baseSize: 0.30 },
    { name: "천왕성", url: "https://survivaloffice.com/images/6.png", score: 200, baseSize: 0.35 },
    { name: "해왕성", url: "https://survivaloffice.com/images/7.png", score: 400, baseSize: 0.41 },
    { name: "토성", url: "https://survivaloffice.com/images/8.png", score: 600, baseSize: 0.47 },
    { name: "목성", url: "https://survivaloffice.com/images/9.png", score: 1000, baseSize: 0.52 },
    { name: "태양", url: "https://survivaloffice.com/images/10.png", score: 2000, baseSize: 0.65 }
];

// 랭킹 보기 버튼과 컨테이너 요소 가져오기
const top10RankButton = document.getElementById('top10-rank');
const rankingContainer = document.getElementById('ranking-container');

// 버튼과 컨테이너가 존재하는지 확인
if (top10RankButton && rankingContainer) {
    // 랭킹 보기 버튼 클릭 이벤트 등록
    top10RankButton.addEventListener('click', () => {
        console.log("랭킹 보기 버튼 클릭됨");
        rankingContainer.style.display = 'block'; // 랭킹 컨테이너 표시
        rankingContainer.innerHTML = '<p>로딩 중...</p>'; // 로딩 중 메시지
        loadTop10Rankings(); // Firestore에서 랭킹 데이터 로드
    });
} else {
    console.error("top10-rank 버튼 또는 ranking-container 요소를 찾을 수 없습니다.");
}

// Firestore에서 Top 10 랭킹 데이터 가져오기
async function loadTop10Rankings() {
    const scoresRef = collection(db, 'planet'); // 'planet' 컬렉션 사용
    const q = query(scoresRef, orderBy('score', 'desc'), orderBy('date', 'desc'), limit(10));

    try {
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            rankingContainer.innerHTML = '<p>랭킹 데이터가 없습니다.</p>';
            return;
        }

        let rankingsHTML = '<h2>Top 10 랭킹</h2><ul>';
        let rank = 1;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const nickname = data.nickname || 'Unknown'; // 닉네임 기본값
            const score = data.score || 0; // 점수 기본값
            let formattedDate;

            // 날짜 필드 처리
            if (typeof data.date === 'string') {
                formattedDate = data.date.slice(0, 10); // "YYYY-MM-DD" 형식
            } else {
                formattedDate = '날짜 없음';
            }

            // 순위에 따른 메달 이모지 추가
            let medalEmoji = '';
            if (rank === 1) medalEmoji = '🥇';
            else if (rank === 2) medalEmoji = '🥈';
            else if (rank === 3) medalEmoji = '🥉';

            // HTML 리스트 아이템 생성
            rankingsHTML += `
                <li class="ranking-item">
                    ${medalEmoji} ${rank}위 - ${nickname}, ${score}점 <span class="date">${formattedDate}</span>
                </li>
            `;
            rank++;
        });

        rankingsHTML += '<h4 style="color: red;">📢 랭킹은 매주 월요일 초기화됩니다.</h4></ul>';
        rankingContainer.innerHTML = rankingsHTML; // HTML 업데이트

        // 순차적으로 나타나는 애니메이션
        const rankingItems = document.querySelectorAll('.ranking-item');
        rankingItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, index * 500); // 0.3초 간격
        });

    } catch (error) {
        console.error('Firestore에서 랭킹 데이터를 가져오는 중 오류 발생:', error);
        rankingContainer.innerHTML = '<p>랭킹 데이터를 불러오지 못했습니다.</p>';
    }
}

// 랭킹 컨테이너 클릭 시 닫기 이벤트 등록
if (rankingContainer) {
    rankingContainer.addEventListener('click', () => {
        rankingContainer.style.display = 'none'; // 컨테이너 닫기
    });
} else {
    console.error("ranking-container 요소를 찾을 수 없습니다.");
}

// 점수 저장 함수
async function saveScore(nickname, score) {
    console.log("Firestore에 점수 저장 시도:", nickname, score);
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000; // UTC+9 (밀리초)
    const kstDate = new Date(now.getTime() + kstOffset);
    const date = kstDate.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식

    const scoresRef = collection(db, 'planet');
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
                    await updateDoc(doc(db, 'planet', document.id), {
                        score: score,
                        date: date
                    });
                    alert('기록이 업데이트되었습니다.');
                } else {
                    alert('기록이 업데이트되지 않았습니다. 기존 점수가 더 높습니다.');
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
        }
    } catch (error) {
        console.error("Error adding data:", error);
        alert('점수 저장 중 오류가 발생했습니다.');
    };
}

// 팝업 닫기 및 다시 시작 버튼
document.getElementById('closePopupButton').addEventListener('click', () => {
    console.log("닫기 버튼 클릭됨");
    window.location.reload();
});

// 점수 저장 버튼
document.getElementById('saveScoreButton').addEventListener('click', async (event) => {
    event.preventDefault();
    const nickname = document.getElementById('nicknameInput').value;
    
    // 글자 수 제한 (5글자)
    if (nickname.length === 0) {
        alert("닉네임을 입력해주세요.");
        return;
    } else if (nickname.length > 5) {
        alert("닉네임은 5글자 이하로 입력해주세요.");
        return;
    }
    await saveScore(nickname, score);
});

// 게임 종료 팝업 표시 함수
function showGameOverPopup() {
    const popup = document.getElementById('result-popup');
    popup.style.display = 'block';
}

// 점수 표시
let score = 0;
const scoreDisplay = document.getElementById("score");

// 화면 크기에 맞게 행성 크기 계산
function getPlanetSize(baseSize) {
    const maxSize = Math.min(canvas.width, canvas.height);
    return baseSize * maxSize * 0.05;
}

// 이미지 로딩 함수
function loadImage(url, fallbackUrl = "default.png") {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;

        img.onload = () => {
            resolve(img); // 이미지 로드 성공 시 반환
        };

     img.onerror = () => {
            console.error(`Failed to load image: ${url}. Using fallback image.`);
            const fallbackImg = new Image();
            fallbackImg.src = fallbackUrl;

            fallbackImg.onload = () => {
                resolve(fallbackImg); // 기본 이미지도 로드 성공 시 반환
            };

            fallbackImg.onerror = () => {
                reject(new Error(`Failed to load fallback image: ${fallbackUrl}`));
            };
        };
    });
}

function drawRotatingPlanet(planet) {
    const pos = planet.getPosition();
    const canvasPos = {
        x: pos.x * 30,
        y: canvas.height - pos.y * 30
    };

    const radius = planet.radius * 30;

    if (planet.image) {
        ctx.save();

        // 원형 마스크 설정
        ctx.beginPath();
        ctx.arc(canvasPos.x, canvasPos.y, radius, 0, 2 * Math.PI);
        ctx.clip();

        // 중심으로 이동하여 회전
        ctx.translate(canvasPos.x, canvasPos.y);
        ctx.rotate(planet.rotationAngle);

        // 이미지 그리기 (중심 기준으로 회전)
        ctx.drawImage(
            planet.image,
            -radius, // 중심 기준 위치
            -radius,
            radius * 2.07,
            radius * 2.07
        );

        ctx.restore();

        // 회전 각도 업데이트
        if (planet.rotationAngle < 2 * Math.PI) { // 360도 이하일 때만 회전
            planet.rotationAngle += 0.05; // 회전 속도
        }
    } else {
        // 이미지가 없을 경우 기본 원으로 표시
        ctx.beginPath();
        ctx.arc(canvasPos.x, canvasPos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "gray";
        ctx.fill();
    }
}

let planetDropCount = 0; // 행성이 떨어진 횟수

function getNextPlanetIndex() {
    if (planetDropCount < 20) {
        planetDropCount++;
        return 0; // 명왕성
    }

    const random = Math.random() * 100;
    if (random < 60) return 0;
    if (random < 90) return 1;
    return 2;
}

// 점수 업데이트 함수
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

function createPlanet(index, x, y = canvas.height / 30) {
    const planetData = planets[index];
    const radius = getPlanetSize(planetData.baseSize) / 3.2;

    const minX = radius / 30;
    const maxX = (canvas.width / 30) - (radius / 30);
    x = Math.max(minX, Math.min(x, maxX));

    const planet = world.createBody({
        type: 'dynamic',
        position: Vec2(x, y)
    });

    planet.createFixture(pl.Circle(radius), {
        density: 3.0,
        friction: 0.2,
        restitution: 0.1
    });

    planet.radius = radius;
    planet.label = `planet-${index}`;
    planet.rotationAngle = 0; // 초기 회전 각도

    // 기존 createPlanet에서 로드 방식 변경
    loadImage(planetData.url)
    .then((img) => {
        planet.image = img; // 로드 완료 후 이미지 설정
    })
    .catch((error) => {
        console.error(error.message);
    });

    planet.setLinearVelocity(Vec2(0, -30));
    return planet;
}
world.m_tolerance = 0.001;

function toCanvasCoords(planckPos) {
    return {
        x: planckPos.x * 30,
        y: canvas.height - planckPos.y * 30
    };
}

function createWalls() {
    const canvasWidth = canvas.width / 30;
    const canvasHeight = canvas.height / 30;

    if (world.walls) {
        world.walls.forEach((wall) => world.destroyBody(wall));
    }

    const walls = [];

    const leftWall = world.createBody();
    leftWall.createFixture(pl.Edge(Vec2(0, 0), Vec2(0, canvasHeight)), {
        friction: 0.2,
        restitution: 0.1
    });
    walls.push(leftWall);

    const rightWall = world.createBody();
    rightWall.createFixture(pl.Edge(Vec2(canvasWidth, 0), Vec2(canvasWidth, canvasHeight)), {
        friction: 0.2,
        restitution: 0.1
    });
    walls.push(rightWall);

    const ground = world.createBody();
    ground.createFixture(pl.Edge(Vec2(0, 0), Vec2(canvasWidth, 0)), {
        friction: 0.2,
        restitution: 0.1
    });
    walls.push(ground);

    world.walls = walls;
}

createWalls();

window.addEventListener("resize", () => {
    canvas.width = 360;
    canvas.height = 450;
    createWalls();
});

function drawPlanet(planet) {
    const pos = planet.getPosition();
    const canvasPos = {
        x: pos.x * 30,
        y: canvas.height - pos.y * 30
    };

    const radius = planet.radius * 30;

    if (planet.image) {
        ctx.drawImage(
            planet.image,
            canvasPos.x - radius, // 이미지 중심 위치 맞춤
            canvasPos.y - radius,
            radius * 2.07, // 이미지 크기를 충돌 범위와 동일하게 설정
            radius * 2.07
        );
    } else {
        ctx.beginPath();
        ctx.arc(canvasPos.x, canvasPos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "gray";
        ctx.fill();
    }
}

function resizeCanvas() {
    canvas.width = planetArea.clientWidth;
    canvas.height = planetArea.clientHeight;
    createWalls();
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    planetsList.forEach((planet) => {
        drawRotatingPlanet(planet); // 원형 유지 회전
    });

    requestAnimationFrame(render);
}

function applyImpulse(planet, forceMultiplier = 20) {
    const pos = planet.getPosition();
    planetsList.forEach((otherPlanet) => {
        if (otherPlanet === planet) return;

        const otherPos = otherPlanet.getPosition();
        const dx = otherPos.x - pos.x;
        const dy = otherPos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < planet.radius + otherPlanet.radius) {
            const forceX = (dx / distance) * forceMultiplier;
            const forceY = (dy / distance) * forceMultiplier;
            otherPlanet.applyLinearImpulse(Vec2(forceX, forceY), otherPlanet.getWorldCenter());
        }
    });
}
let lastPlanetDropTime = 0; // 마지막으로 행성이 떨어진 시간
const planetDropDelay = 200; // 행성이 떨어질 딜레이 (1초)

let currentPlanetIndex; // 선언
currentPlanetIndex = getNextPlanetIndex(); // 초기화
updateNextPlanetPreview(); // 초기 미리보기 업데이트

function updateNextPlanetPreview() {
    const nextPlanetPreview = document.getElementById("next-planet-preview");
    nextPlanetPreview.innerHTML = ""; // 기존 내용을 제거

    const nextPlanetData = planets[currentPlanetIndex];

    const nextPlanetImg = document.createElement("img");
    nextPlanetImg.src = nextPlanetData.url;
    nextPlanetImg.alt = nextPlanetData.name;

    nextPlanetPreview.appendChild(nextPlanetImg);
}

planetArea.addEventListener("click", (event) => {
    // 게임 종료 시 클릭 무시
    if (isGameOver) return;
    const currentTime = Date.now();

    if (currentTime - lastPlanetDropTime < planetDropDelay) {
        return; // 딜레이 시간 내에 클릭 무시
    }

    const x = (event.clientX - planetArea.getBoundingClientRect().left) / 30;

    planetsList.push(createPlanet(currentPlanetIndex, x, canvas.height / 30));

    // 다음 행성 인덱스 업데이트
    currentPlanetIndex = getNextPlanetIndex();

    // 다음 행성 미리보기 업데이트
    updateNextPlanetPreview();

    lastPlanetDropTime = currentTime; // 마지막 드랍 시간 갱신
});


// 합쳐진 행성이 주변을 밀어내도록 수정
function mergePlanets(planetA, planetB, nextIndex) {
    const position = planetA.getPosition();

    // 충돌한 행성 제거
    world.destroyBody(planetA);
    world.destroyBody(planetB);
    planetsList.splice(planetsList.indexOf(planetA), 1);
    planetsList.splice(planetsList.indexOf(planetB), 1);

    // 충돌 이펙트 생성
    const canvasPos = toCanvasCoords(position);
    createEffect(canvasPos.x, canvasPos.y);
    
    // 태양끼리 합쳐졌는지 확인
    if (nextIndex === null) {
        // 점수 추가 (예: 태양 합성 시 5000점 추가)
        updateScore(5000);

        // 효과 (선택 사항)
        const canvasPos = toCanvasCoords(position);
        createEffect(canvasPos.x, canvasPos.y);
    }    
    // 딜레이 후 새 행성 생성
    setTimeout(() => {
        if (nextIndex !== null) {
            const newPlanet = createPlanet(nextIndex, position.x, position.y);
            planetsList.push(newPlanet);

            // 주변 행성을 밀어내는 충격 적용
            applyImpulse(newPlanet);

            // 점수 업데이트
            updateScore(planets[nextIndex].score);
        }
    }, 100); // 1초 딜레이
}

function createEffect(x, y) {
    const effectDuration = 500; // 0.5초 지속
    const startTime = Date.now();

    function renderEffect() {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > effectDuration) return;

        ctx.save();
        ctx.globalAlpha = 1 - elapsedTime / effectDuration; // 점점 사라지는 효과
        ctx.beginPath();
        ctx.arc(x, y, 30 + elapsedTime / 10, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255, 255, 0, 0.8)"; // 노란색 빛 효과
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(renderEffect);
    }

    renderEffect();
}


// 태양 이미지 추가 함수
function addSunToNextContainer() {
    const nextPlanetContainer = document.getElementById("next-planet-container");
    const sunImg = document.createElement("img");
    sunImg.src = planets[planets.length - 1].url; // 태양 이미지
    sunImg.alt = "태양";
    sunImg.style.maxWidth = "50px"; // 크기를 축소
    sunImg.style.margin = "5px";

    nextPlanetContainer.appendChild(sunImg);
}


// 게임 오버 조건 수정 (전체가 넘어갔는지 판단)
function checkGameOver() {
    const gameOverLine = canvas.height; // 게임 오버 라인 (캔버스 상단)
    planetsList.forEach((planet) => {
        const pos = planet.getPosition();
        const canvasPos = toCanvasCoords(pos);
        const radius = planet.radius * 30;

        // 행성의 전체가 넘어갔는지 확인
        if (canvasPos.y + radius <= 0) {
            endGame();
        }
    });
}

// 충돌 핸들러 수정 (큐에 합쳐질 행성 추가)
const mergeQueue = [];
world.on('pre-solve', (contact) => {
    const bodyA = contact.getFixtureA().getBody();
    const bodyB = contact.getFixtureB().getBody();

    if (bodyA.isDynamic() && bodyB.isDynamic()) {
        const planetA = bodyA;
        const planetB = bodyB;

         // 이미 합성 중인 행성은 무시
         if (planetA.isMerging || planetB.isMerging) return;

         if (planetA.label === planetB.label) {
             const index = parseInt(planetA.label.split('-')[1], 10);
 
             // 플래그 설정 (합성 중 표시)
             planetA.isMerging = true;
             planetB.isMerging = true;
 
             if (index === planets.length - 1) {
                 mergeQueue.push({ planetA, planetB, nextIndex: null });
             } else if (index < planets.length - 1) {
                 mergeQueue.push({ planetA, planetB, nextIndex: index + 1 });
             }
         }
     }
 });

// 업데이트 함수 수정 (합쳐질 행성 처리)
function update() {
    world.step(1 / 60);

    while (mergeQueue.length > 0) {
        const { planetA, planetB, nextIndex } = mergeQueue.shift();

        if (nextIndex === null) {
            world.destroyBody(planetA);
            world.destroyBody(planetB);

            planetsList.splice(planetsList.indexOf(planetA), 1);
            planetsList.splice(planetsList.indexOf(planetB), 1);

        } else {
            mergePlanets(planetA, planetB, nextIndex);
        }
                // 플래그 해제 (합성 완료)
                planetA.isMerging = false;
                planetB.isMerging = false;
    }

    planetsList.forEach((planet) => {
        if (planet.getPosition().y < 0) {
            world.destroyBody(planet);
        }
    });

    checkGameOver(); // 게임 오버 조건 체크

    requestAnimationFrame(update);
}

const planetsList = [];

let isGameOver = false;

function endGame() {
    if (isGameOver) return;
    isGameOver = true;

    // 점수 저장 팝업 표시
    showGameOverPopup();
}

// 초기화 및 렌더링 시작
updateScore(0);
render();
update();
