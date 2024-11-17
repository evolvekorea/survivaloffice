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
    { name: "수성", url: "https://survivaloffice.com/images/2.png", score: 20, baseSize: 0.12 },
    { name: "화성", url: "https://survivaloffice.com/images/3.png", score: 30, baseSize: 0.14 },
    { name: "금성", url: "https://survivaloffice.com/images/4.png", score: 40, baseSize: 0.16 },
    { name: "지구", url: "https://survivaloffice.com/images/5.png", score: 50, baseSize: 0.18 },
    { name: "천왕성", url: "https://survivaloffice.com/images/6.png", score: 60, baseSize: 0.2 },
    { name: "해왕성", url: "https://survivaloffice.com/images/7.png", score: 70, baseSize: 0.22 },
    { name: "토성", url: "https://survivaloffice.com/images/8.png", score: 80, baseSize: 0.24 },
    { name: "목성", url: "https://survivaloffice.com/images/9.png", score: 90, baseSize: 0.26 },
    { name: "태양", url: "https://survivaloffice.com/images/10.png", score: 100, baseSize: 0.28 }
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
    if (random < 90) return 0;
    if (random < 110) return 1;
    if (random < 120) return 2;
    if (random < 130) return 3;
    if (random < 140) return 4;
    if (random < 150) return 5;
    if (random < 160) return 6;
    if (random < 170) return 7;
    if (random < 180) return 8;
    return 9;
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
    const radius = getPlanetSize(planetData.baseSize) / 3;
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

// 좌표 변환 함수 (y 좌표 반전)
function toCanvasCoords(planckPos) {
    return {
        x: planckPos.x * 30,
        y: canvas.height - planckPos.y * 30
    };
}

// 바닥 생성
const ground = world.createBody();
ground.createFixture(pl.Edge(Vec2(-10, 0), Vec2(10, 0)), {
    friction: 0.5,
    restitution: 0.3
});

// 행성 리스트
const planetsList = [];
planetsList.push(createPlanet(0, canvas.width / 60, 15));

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

// 클릭으로 행성 생성 (화면 맨 위에서 시작)
planetArea.addEventListener("click", (event) => {
    const x = (event.clientX - planetArea.getBoundingClientRect().left) / 30;
    planetsList.push(createPlanet(0, x, canvas.height / 30));
});

// 초기화 및 렌더링 시작
updateScore(0);
updateNextPlanetDisplay();
render();
update();
