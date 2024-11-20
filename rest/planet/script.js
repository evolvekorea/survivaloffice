// Planck.js 초기 설정
const pl = planck, Vec2 = pl.Vec2;
const world = pl.World(Vec2(0, -10)); // 중력 방향을 아래로 설정 (위에서 아래로 떨어짐)

const planetArea = document.getElementById("planet-area");
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
planetArea.appendChild(canvas);
canvas.width = planetArea.clientWidth;
canvas.height = planetArea.clientHeight;

// 행성 데이터 (10개)
const planets = [
    { name: "명왕성", url: "https://survivaloffice.com/images/1.png", score: 10, baseSize: 0.1 },
    { name: "수성", url: "https://survivaloffice.com/images/1.png", score: 20, baseSize: 0.3 },
    { name: "화성", url: "https://survivaloffice.com/images/1.png", score: 30, baseSize: 0.5 },
    { name: "금성", url: "https://survivaloffice.com/images/1.png", score: 40, baseSize: 0.7 },
    { name: "지구", url: "https://survivaloffice.com/images/1.png", score: 50, baseSize: 0.9 },
    { name: "천왕성", url: "https://survivaloffice.com/images/1.png", score: 60, baseSize: 1.1 },
    { name: "해왕성", url: "https://survivaloffice.com/images/1.png", score: 70, baseSize: 1.3 },
    { name: "토성", url: "https://survivaloffice.com/images/1.png", score: 80, baseSize: 1.5 },
    { name: "목성", url: "https://survivaloffice.com/images/1.png", score: 90, baseSize: 1.7 },
    { name: "태양", url: "https://survivaloffice.com/images/1.png", score: 100, baseSize: 2.0 }
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
function loadImage(url, callback) {
    const img = new Image();
    img.src = url;
    img.onload = () => {
        if (typeof callback === 'function') {
            callback(img); // 유효한 콜백일 때만 호출
        } else {
            console.error(`Callback is not a function for image: ${url}`);
        }
    };
    img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        // 기본 이미지 사용
        const fallbackImg = new Image();
        fallbackImg.src = "default.png"; // 기본 이미지 경로
        if (typeof callback === 'function') {
            callback(fallbackImg);
        }
    };
}

let planetDropCount = 0; // 행성이 떨어진 횟수

function getNextPlanetIndex() {
    // 첫 20번까지는 명왕성만 반환
    if (planetDropCount < 20) {
        planetDropCount++; // 행성 생성 횟수 증가
        return 0; // 명왕성
    }

    // 확률에 따라 행성 결정
    const random = Math.random() * 100;
    if (random < 90) return 0; // 90% 확률로 명왕성
    if (random < 100) return 1; // 10% 확률로 수성
    return 2; // 5% 확률로 화성
}

// 점수 업데이트 함수
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

function createPlanet(index, x, y = canvas.height / 30) {
    const planetData = planets[index];
    const radius = getPlanetSize(planetData.baseSize) / 3.0;

    // 화면 경계 내에서 생성되도록 x 좌표 조정
    const minX = radius / 30; // 최소 x 좌표
    const maxX = (canvas.width / 30) - (radius / 30); // 최대 x 좌표
    x = Math.max(minX, Math.min(x, maxX));

    const planet = world.createBody({
        type: 'dynamic',
        position: Vec2(x, y)
    });

    planet.createFixture(pl.Circle(radius), {
        density: 2.0,
        friction: 0.1,
        restitution: 0.0
    });

    planet.radius = radius;
    planet.label = `planet-${index}`;

    // 이미지 로드
    loadImage(planetData.url, (img) => {
        planet.image = img; // 이미지 로드 완료 후 설정
    });

    // 초기 속도 설정
    planet.setLinearVelocity(Vec2(0, -30)); // 아래 방향으로 이동
    return planet;
}

world.m_tolerance = 0.001;

// 좌표 변환 함수 (y 좌표 반전)
function toCanvasCoords(planckPos) {
    return {
        x: planckPos.x * 30,
        y: canvas.height - planckPos.y * 30
    };
}

// 캔버스의 크기에 맞춰 4면 벽 생성 함수 (좌상단 원점 기준)
function createWalls() {
    const canvasWidth = canvas.width / 30;
    const canvasHeight = canvas.height / 30;

    // 이전에 생성된 벽 제거
    if (world.walls) {
        world.walls.forEach((wall) => world.destroyBody(wall));
    }

    // 새로운 벽 생성
    const walls = [];

    // 왼쪽 벽
    const leftWall = world.createBody();
    leftWall.createFixture(pl.Edge(Vec2(0, 0), Vec2(0, canvasHeight)), {
        friction: 0.3,
        restitution: 0.0
    });
    walls.push(leftWall);

    // 오른쪽 벽
    const rightWall = world.createBody();
    rightWall.createFixture(pl.Edge(Vec2(canvasWidth, 0), Vec2(canvasWidth, canvasHeight)), {
        friction: 0.3,
        restitution: 0.0
    });
    walls.push(rightWall);

    // 바닥
    const ground = world.createBody();
    ground.createFixture(pl.Edge(Vec2(0, 0), Vec2(canvasWidth, 0)), {
        friction: 0.1,
        restitution: 0.0
    });
    walls.push(ground);

    // 생성된 벽 저장
    world.walls = walls;
}

// 초기 벽 생성
createWalls();

// 화면 크기 변경 시 벽 재생성
window.addEventListener("resize", () => {
    canvas.width = planetArea.clientWidth;
    canvas.height = planetArea.clientHeight;
    createWalls();
});

// 행성 그리기 함수
function drawPlanet(planet) {
    const pos = planet.getPosition();
    const canvasPos = {
        x: pos.x * 30,
        y: canvas.height - pos.y * 30
    };

    const radius = planet.radius * 30;

    // 이미지 로드 여부 확인
    if (planet.image) {
        ctx.drawImage(
            planet.image,
            canvasPos.x - radius,
            canvasPos.y - radius,
            radius * 2,
            radius * 2
        );
    } else {
        console.warn(`Image not loaded for planet: ${planet.label}`);
        // 기본 동작: 원을 그려주는 코드 (대체 렌더링)
        ctx.beginPath();
        ctx.arc(canvasPos.x, canvasPos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "gray";
        ctx.fill();
    }
}

function resizeCanvas() {
    canvas.width = planetArea.clientWidth;
    canvas.height = planetArea.clientHeight;
    createWalls(); // 벽 크기 재조정
}

// 화면 크기 변경 시 동기화
window.addEventListener("resize", resizeCanvas);

// 초기화 시 호출
resizeCanvas();

// 캔버스 렌더링 함수
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 모든 행성 그리기
    planetsList.forEach(drawPlanet);

    requestAnimationFrame(render);
}

// 시뮬레이션 업데이트 함수
function update() {
    world.step(1 / 60);

    // 행성 리스트 업데이트 (디버그용)
    planetsList.forEach((planet) => {
        if (planet.getPosition().y < 0) {
            world.destroyBody(planet);
        }
    });

    requestAnimationFrame(update);
}

// 합쳐질 행성들을 저장할 큐
const mergeQueue = [];

// 충돌 핸들러 수정 (큐에 합쳐질 행성 추가)
world.on('pre-solve', (contact) => {
    const bodyA = contact.getFixtureA().getBody();
    const bodyB = contact.getFixtureB().getBody();

    if (bodyA.isDynamic() && bodyB.isDynamic()) {
        const planetA = bodyA;
        const planetB = bodyB;

        // 같은 행성인지 확인 (라벨을 사용)
        if (planetA.label === planetB.label) {
            const index = parseInt(planetA.label.split('-')[1], 10);

            // 태양끼리 합쳐질 경우 별도로 처리
            if (index === planets.length - 1) { // 태양의 인덱스
                mergeQueue.push({ planetA, planetB, nextIndex: null });
            } else if (index < planets.length - 1) {
                // 태양이 아닌 경우 합치기 처리
                mergeQueue.push({ planetA, planetB, nextIndex: index + 1 });
            }
        }
    }
});

// 업데이트 함수 수정 (합쳐질 행성 처리)
function update() {
    world.step(1 / 60);

    // 큐에 있는 행성 합치기
    while (mergeQueue.length > 0) {
        const { planetA, planetB, nextIndex } = mergeQueue.shift();

        if (nextIndex === null) {
            // 태양끼리 합쳐진 경우
            // 기존 태양 제거
            world.destroyBody(planetA);
            world.destroyBody(planetB);

            // 행성 리스트에서 제거
            planetsList.splice(planetsList.indexOf(planetA), 1);
            planetsList.splice(planetsList.indexOf(planetB), 1);

            // next-planet-container에 태양 추가
            const nextPlanetContainer = document.getElementById("next-planet-container");
            if (!nextPlanetContainer) {
                console.error("next-planet-container not found in the DOM");
                continue;
            }
            const sunImg = document.createElement("img");
            sunImg.src = planets[planets.length - 1].url;
            sunImg.alt = "태양";
            sunImg.style.width = "50px";
            sunImg.style.height = "50px";
            nextPlanetContainer.appendChild(sunImg);
        } else {
            // 기존 합성 처리
            const position = planetA.getPosition();

            // 새로운 행성 생성
            const newPlanet = createPlanet(nextIndex, position.x, position.y);

            // 기존 행성 제거
            world.destroyBody(planetA);
            world.destroyBody(planetB);

            // 행성 리스트에서 제거
            planetsList.splice(planetsList.indexOf(planetA), 1);
            planetsList.splice(planetsList.indexOf(planetB), 1);

            // 새 행성 추가
            planetsList.push(newPlanet);

            // 점수 업데이트
            updateScore(planets[nextIndex].score);
        }
    }

    // 행성 리스트 업데이트 (디버깅)
    planetsList.forEach((planet) => {
        if (planet.getPosition().y < 0) {
            world.destroyBody(planet);
        }
    });

    requestAnimationFrame(update);
}

// 행성 리스트 초기화
const planetsList = [];

// 클릭으로 행성 생성 (화면 맨 위에서 시작)
planetArea.addEventListener("click", (event) => {
    const x = (event.clientX - planetArea.getBoundingClientRect().left) / 30;
    const index = getNextPlanetIndex(); // 첫 20번은 명왕성, 이후 확률에 따라 결정
    planetsList.push(createPlanet(index, x, canvas.height / 30));
});

let isGameOver = false;

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    alert("Game Over! 행성이 캔버스 상단을 넘었습니다.");
}

function checkGameOver() {
    planetsList.forEach((planet) => {
        const pos = planet.getPosition();
        // 행성의 y 좌표가 0 이하인 경우 게임 오버
        if (pos.y <= 0) {
            endGame();
        }
    });
}

// 초기화 및 렌더링 시작
updateScore(0);
render();
update();
