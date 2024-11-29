// Planck.js 초기 설정 및 공통 변수 설정
const pl = planck, Vec2 = pl.Vec2;
const world = pl.World(Vec2(0, -10));
const planetArea = document.getElementById("planet-area");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
planetArea.appendChild(canvas);
canvas.width = planetArea.clientWidth;
canvas.height = planetArea.clientHeight;

// 행성 데이터 (10개)
const planets = [
    { name: "명왕성", url: "https://survivaloffice.com/images/10.png", score: 10, baseSize: 0.1 },
    { name: "수성", url: "https://survivaloffice.com/images/2.png", score: 20, baseSize: 0.15 },
    { name: "화성", url: "https://survivaloffice.com/images/3.png", score: 40, baseSize: 0.25 },
    { name: "금성", url: "https://survivaloffice.com/images/4.png", score: 80, baseSize: 0.3 },
    { name: "지구", url: "https://survivaloffice.com/images/5.png", score: 120, baseSize: 0.4 },
    { name: "천왕성", url: "https://survivaloffice.com/images/6.png", score: 200, baseSize: 0.45 },
    { name: "해왕성", url: "https://survivaloffice.com/images/7.png", score: 400, baseSize: 0.5 },
    { name: "토성", url: "https://survivaloffice.com/images/8.png", score: 600, baseSize: 0.6 },
    { name: "목성", url: "https://survivaloffice.com/images/9.png", score: 1000, baseSize: 0.7 },
    { name: "태양", url: "https://survivaloffice.com/images/10.png", score: 2000, baseSize: 0.8 }
];

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
    if (random < 90) return 0;
    if (random < 100) return 1;
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
        density: 2.0,
        friction: 0.1,
        restitution: 0.3
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
        friction: 0.1,
        restitution: 0.1
    });
    walls.push(leftWall);

    const rightWall = world.createBody();
    rightWall.createFixture(pl.Edge(Vec2(canvasWidth, 0), Vec2(canvasWidth, canvasHeight)), {
        friction: 0.1,
        restitution: 0.1
    });
    walls.push(rightWall);

    const ground = world.createBody();
    ground.createFixture(pl.Edge(Vec2(0, 0), Vec2(canvasWidth, 0)), {
        friction: 0.1,
        restitution: 0.1
    });
    walls.push(ground);

    world.walls = walls;
}

createWalls();

window.addEventListener("resize", () => {
    canvas.width = planetArea.clientWidth;
    canvas.height = planetArea.clientHeight;
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

function applyImpulse(planet, forceMultiplier = 50) {
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
const planetDropDelay = 1000; // 행성이 떨어질 딜레이 (1초)

// 클릭 이벤트 수정
planetArea.addEventListener("click", (event) => {
    const currentTime = Date.now();

    if (currentTime - lastPlanetDropTime < planetDropDelay) {
        return; // 딜레이 시간 내에 클릭 무시
    }

    const x = (event.clientX - planetArea.getBoundingClientRect().left) / 30;
    const index = getNextPlanetIndex(); // 첫 20번은 명왕성, 이후 확률에 따라 결정
    planetsList.push(createPlanet(index, x, canvas.height / 30));

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

            addSunToNextContainer(); // 태양 이미지를 next-planet-container에 추가

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
    alert("Game Over! 행성이 캔버스 상단을 넘었습니다.");
}

// 초기화 및 렌더링 시작
updateScore(0);
render();
update();
