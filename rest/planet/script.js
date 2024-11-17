// Matter.js 초기 설정
const Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Events = Matter.Events;

const engine = Engine.create();
const planetArea = document.getElementById("planet-area");

// Matter.js 렌더 설정
const render = Render.create({
    element: planetArea,
    engine: engine,
    options: {
        width: planetArea.clientWidth,
        height: planetArea.clientHeight,
        wireframes: false,
        background: '#fafafa',
    }
});

// 화면 크기 동기화 함수
function resizeRender() {
    render.canvas.width = planetArea.clientWidth;
    render.canvas.height = planetArea.clientHeight;
    Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: planetArea.clientWidth, y: planetArea.clientHeight }
    });
}

// 행성 데이터
const planets = [
    { name: "명왕성", url: "https://survivaloffice.com/images/1.png", score: 10, baseSize: 0.1 },
    { name: "수성", url: "https://survivaloffice.com/images/1.png", score: 20, baseSize: 0.12 },
    { name: "화성", url: "https://survivaloffice.com/images/1.png", score: 30, baseSize: 0.14 },
    { name: "금성", url: "https://survivaloffice.com/images/1.png", score: 40, baseSize: 0.16 },
    { name: "지구", url: "https://survivaloffice.com/images/1.png", score: 50, baseSize: 0.18 },
    { name: "천왕성", url: "https://survivaloffice.com/images/1.png", score: 60, baseSize: 0.2 },
    { name: "해왕성", url: "https://survivaloffice.com/images/1.png", score: 70, baseSize: 0.22 },
    { name: "토성", url: "https://survivaloffice.com/images/1.png", score: 80, baseSize: 0.24 },
    { name: "목성", url: "https://survivaloffice.com/images/1.png", score: 90, baseSize: 0.26 },
    { name: "태양", url: "https://survivaloffice.com/images/1.png", score: 100, baseSize: 0.28 }
];

let score = 0;
let currentPlanetIndex = 0;
let dropCount = 0;
const maxInitialDrops = 20;
const scoreDisplay = document.getElementById("score");
const nextPlanetDisplay = document.getElementById("next-planet");

// 화면 크기에 맞게 행성 크기 계산
function getPlanetSize(baseSize) {
    const maxSize = Math.min(planetArea.clientWidth, planetArea.clientHeight);
    const size = baseSize * maxSize * 0.05;
    return Math.min(Math.max(size, 20), 50);
}

// 점수 업데이트 함수
function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
}

// 다음 행성 결정 함수
function getNextPlanetIndex() {
    if (dropCount < maxInitialDrops) {
        return 0;
    }
    const random = Math.random() * 100;
    if (random < 90) return 0;
    if (random < 110) return 1;
    if (random < 120) return 2;
    return 3;
}

// 다음 행성 미리보기 업데이트
function updateNextPlanetDisplay() {
    const index = getNextPlanetIndex();
    currentPlanetIndex = index;
    const size = getPlanetSize(planets[index].baseSize);
    nextPlanetDisplay.src = planets[index].url;
    nextPlanetDisplay.style.width = `${size / 2}px`;
    nextPlanetDisplay.style.height = `${size / 2}px`;
}

// 행성 생성 함수
function createPlanet(index, x, y = 0) {
    const planetData = planets[index];
    const radius = getPlanetSize(planetData.baseSize) / 20;

    const planet = Bodies.circle(
        x,
        y + radius,
        radius,
        {
            restitution: 0.3,
            friction: 0.2,
            render: {
                sprite: {
                    texture: planetData.url,
                    xScale: (radius * 2) / 100,
                    yScale: (radius * 2) / 100,
                }
            },
            label: `planet-${index}`
        }
    );

    World.add(engine.world, planet);
    dropCount++;
    updateNextPlanetDisplay();
}

// 충돌 이벤트 처리
Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (bodyA.label.startsWith("planet") && bodyB.label.startsWith("planet")) {
            const indexA = parseInt(bodyA.label.split('-')[1]);
            const indexB = parseInt(bodyB.label.split('-')[1]);

            if (indexA === indexB) {
                mergePlanets(bodyA, bodyB, indexA);
            }
        }
    });
});

// 행성 합체 함수
function mergePlanets(bodyA, bodyB, index) {
    const nextIndex = index + 1;
    const x = (bodyA.position.x + bodyB.position.x) / 2;
    const y = (bodyA.position.y + bodyB.position.y) / 2;

    updateScore(planets[nextIndex].score);

    World.remove(engine.world, bodyA);
    World.remove(engine.world, bodyB);

    if (nextIndex < planets.length) {
        createPlanet(nextIndex, x, y);
    }
}

// 바닥 생성
const groundHeight = 40;
const ground = Bodies.rectangle(
    planetArea.clientWidth / 2,
    planetArea.clientHeight - groundHeight / 2,
    planetArea.clientWidth,
    groundHeight,
    {
        isStatic: true,
        isSensor: false, // 센서가 아니도록 설정 (물리적 충돌 발생)
        render: {
            fillStyle: '#0000ff',
        }
    }
);
World.add(engine.world, ground);

// 창 크기 변경 시 렌더 및 바닥 업데이트
window.addEventListener('resize', () => {
    resizeRender();
    Body.setPosition(ground, {
        x: planetArea.clientWidth / 2,
        y: planetArea.clientHeight - groundHeight / 2
    });
});

// Matter.js 엔진 실행
const runner = Matter.Runner.create();
Matter.Runner.run(runner, engine);
Render.run(render);

// 클릭으로 행성 생성
planetArea.addEventListener("click", (event) => {
    const x = event.clientX - planetArea.getBoundingClientRect().left;
    createPlanet(currentPlanetIndex, x);
});

// 초기화
resizeRender();
updateScore(0);
updateNextPlanetDisplay();
createPlanet(currentPlanetIndex, planetArea.clientWidth / 2);
