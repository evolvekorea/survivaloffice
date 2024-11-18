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
    { name: "수성", url: "https://survivaloffice.com/images/1.png", score: 20, baseSize: 0.2 },
    { name: "화성", url: "https://survivaloffice.com/images/1.png", score: 30, baseSize: 0.3 },
    { name: "금성", url: "https://survivaloffice.com/images/1.png", score: 40, baseSize: 0.4 },
    { name: "지구", url: "https://survivaloffice.com/images/1.png", score: 50, baseSize: 0.5 },
    { name: "천왕성", url: "https://survivaloffice.com/images/1.png", score: 60, baseSize: 0.6 },
    { name: "해왕성", url: "https://survivaloffice.com/images/1.png", score: 70, baseSize: 0.7 },
    { name: "토성", url: "https://survivaloffice.com/images/1.png", score: 80, baseSize: 0.8 },
    { name: "목성", url: "https://survivaloffice.com/images/1.png", score: 90, baseSize: 0.9 },
    { name: "태양", url: "https://survivaloffice.com/images/1.png", score: 100, baseSize: 1.0 }
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
function loadImage(url) {
    const img = new Image();
    img.src = url;
    return img;
}

// 점수 업데이트 함수
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

// 다음 행성 결정 함수
function getNextPlanetIndex() {
    const random = Math.random() * 100;
    if (random < 80) return 0;   // 80% 확률로 0번 (명왕성)
    if (random < 90) return 1;   // 10% 확률로 1번 (수성)
    if (random < 95) return 2;   // 5% 확률로 2번 (화성)
    return 4;                    // 2% 확률로 3번 (금성)
}

// 다음 행성 미리보기 업데이트
function updateNextPlanetDisplay() {
    const index = getNextPlanetIndex();
    const size = getPlanetSize(planets[index].baseSize);
    const nextPlanetDisplay = document.getElementById("next-planet");
    nextPlanetDisplay.src = planets[index].url;
    nextPlanetDisplay.style.width = `${size / 2}px`;
    nextPlanetDisplay.style.height = `${size / 2}px`;
}

// 행성 생성 함수
function createPlanet(index, x, y = canvas.height / 30) {
    const planetData = planets[index];
    const radius = getPlanetSize(planetData.baseSize) / 3.0;
    const img = loadImage(planetData.url);

    const planet = world.createBody({
        type: 'dynamic',
        position: Vec2(x, y)
    });

    planet.createFixture(pl.Circle(radius), {
        density: 1.0,
        friction: 0.5,
        restitution: 0.6
    });

    planet.radius = radius;
    planet.image = img;
    planet.label = `planet-${index}`;
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
        friction: 0.5,
        restitution: 0.3
    });
    walls.push(leftWall);

    // 오른쪽 벽
    const rightWall = world.createBody();
    rightWall.createFixture(pl.Edge(Vec2(canvasWidth, 0), Vec2(canvasWidth, canvasHeight)), {
        friction: 0.5,
        restitution: 0.3
    });
    walls.push(rightWall);

    // 바닥
    const ground = world.createBody();
    ground.createFixture(pl.Edge(Vec2(0, 0), Vec2(canvasWidth, 0)), {
        friction: 0.5,
        restitution: 0.3
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
    const img = planet.image;

    ctx.drawImage(img, canvasPos.x - radius, canvasPos.y - radius, radius * 2, radius * 2);
}

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

            // 마지막 행성 (태양)이 아닌 경우에만 합침
            if (index < planets.length - 1) {
                // 큐에 합쳐질 행성 추가
                mergeQueue.push({ planetA, planetB, nextIndex: index + 1 });
            }
        }
    }
});

// 업데이트 함수 수정 (합쳐질 행성 처리)
function update() {
    world.step(1 / 60);
    
        // 게임 오버 조건 체크
        checkGameOver();

    // 큐에 있는 행성 합치기
    while (mergeQueue.length > 0) {
        const { planetA, planetB, nextIndex } = mergeQueue.shift();
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

    // 행성 리스트 업데이트 (디버그용)
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
    planetsList.push(createPlanet(0, x, canvas.height / 30));
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
updateNextPlanetDisplay();
render();
update();
