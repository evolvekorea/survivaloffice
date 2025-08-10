document.addEventListener("DOMContentLoaded", () => {

  console.log("✅ DOM fully loaded");
  
  const startScreen = document.getElementById("start-screen");
  const genderScreen = document.getElementById("gender-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");

  const startBtn = document.getElementById("start-btn");
  const maleBtn = document.getElementById("male-btn");
  const femaleBtn = document.getElementById("female-btn");

  const questionText = document.getElementById("question-text");
  const choiceA = document.getElementById("choice-a");
  const choiceB = document.getElementById("choice-b");
  const resultImage = document.getElementById("result-image");

  let currentIndex = 0;
  let egenScore = 0;
  let tetoScore = 0;
  let selectedGender = "male";


// 테스트 데이터
const questions = [
  {
    question: "오랜만에 만난 친구가 갑자기 힘들었다며 눈물을 보인다. 무슨 일인지 자세히 묻기도 전에 감정이 터져버린 것 같다.",
    options: [
      {
        text: '당황스럽지만 친구 마음이 다칠까봐 먼저 위로부터 한다. "괜찮아, 나한테 다 얘기해도 돼"라며 진정할 때까지 곁을 지킨다.',
        type: "egen"
      },
      {
        text: '감정보다 상황을 파악하는 게 먼저라고 생각한다. “무슨 일이 있었는데? 정확히 말해봐야 도와줄 수 있어”라며 문제 해결부터 하려고 한다.',
        type: "teto"
      }
    ]
  },
  {
    question: "팀 프로젝트에서 한 명이 정해진 일을 계속 미루고 아무 피드백도 하지 않는다. 점점 다른 팀원들까지 지쳐간다.",
    options: [
      {
        text: "얘기는 하지만 싫은 소리를 잘 못 하겠다. 결국 그 사람이 안 해도 어쩔 수 없이 내가 맡아서 마무리한다.",
        type: "egen"
      },
      {
        text: '직접 찾아가서 왜 안 하냐고 따지고, 분위기 망쳐도 상관 없다. "안 할 거면 나가"라고 확실하게 선을 긋는다.',
        type: "teto"
      }
    ]
  },
  {
    question: "호감 가던 사람이 갑자기 연락이 뜸해졌다. 예전처럼 먼저 연락하지도 않고, 대화도 건성건성이다.",
    options: [
      {
        text: "혹시 내가 뭔가 실수했나 자책하면서도, 그 사람 기분을 상하게 할까봐 그냥 기다린다.",
        type: "egen"
      },
      {
        text: "이런 태도면 더 이상 의미 없다고 판단한다. 정리할 생각으로 먼저 물어보거나, 연락을 끊는다.",
        type: "teto"
      }
    ]
  },
  {
    question: "회사(또는 학교)에서 큰 실수를 저질러 전체에 피해를 줬고, 상사(또는 교수)의 눈치가 심하게 보인다.",
    options: [
      {
        text: "주변 사람들에게 미안한 마음이 크다. 사과부터 하고, 잘 보이려고 애쓰며 조심조심 행동한다.",
        type: "egen"
      },
      {
        text: "실수는 실수일 뿐, 실용적으로 복구할 방법부터 생각한다. 감정 소모는 의미 없다고 느낀다.",
        type: "teto"
      }
    ]
  },
  {
    question: "모임이나 회식 자리에서 모두가 조용하고 어색한 분위기가 이어진다. 아무도 분위기를 풀려 하지 않는다.",
    options: [
      {
        text: "다들 불편할까봐 나라도 먼저 말 걸고 웃겨보려 한다. 민망한 분위기를 못 견디기 때문이다.",
        type: "egen"
      },
      {
        text: "나까지 애쓸 필요 없다고 생각한다. 굳이 억지로 맞춰주기보다 조용한 분위기면 그대로 둔다.",
        type: "teto"
      }
    ]
  },
  {
    question: '친구가 "나 유튜버로 성공할 거야!"라며 현실과 거리가 먼 계획을 들려준다. 구체적인 실행계획은 없다.',
    options: [
      {
        text: "진심으로 응원해주고, 혹시 도와줄 수 있는 부분은 없는지 고민한다. 꿈을 함부로 평가하지 않는다.",
        type: "egen"
      },
      {
        text: '현실성 없는 말이라고 생각하고, “일단 기획이나 하고 와”라며 차갑게 말해버린다.',
        type: "teto"
      }
    ]
  },
  {
    question: '연인이 “요즘 나한테 너무 무관심한 것 같아…”라고 말한다. 상대는 진지해 보인다.',
    options: [
      {
        text: "어떤 부분이 서운했는지 자세히 듣고 공감하며, 눈치를 못 챈 내 자신을 자책한다.",
        type: "egen"
      },
      {
        text: '감정적인 말보다는 구체적으로 얘기하라고 한다. “그럼 앞으로 어떻게 해줬으면 좋겠어?”라고 대처한다.',
        type: "teto"
      }
    ]
  },
  {
    question: "모르는 사람이 길을 물어보는데, 시간이 애매하게 빠듯한 상황이다.",
    options: [
      {
        text: "바쁘지만 미안해서 친절하게 알려주고, 혹시 헷갈릴까봐 지도까지 찾아준다.",
        type: "egen"
      },
      {
        text: "간단하게 위치만 말해주고 바로 떠난다. 내가 늦으면 안 되니까 그게 우선이다.",
        type: "teto"
      }
    ]
  },
  {
    question: "일이나 학업 스트레스로 지치고 감정이 폭발할 것 같은 날이 있다. 그날따라 모든 게 짜증난다.",
    options: [
      {
        text: "눈물 날 정도로 힘들면 일단 쉬어야 한다고 생각한다. 감정을 누르지 않고 충분히 토닥여준다.",
        type: "egen"
      },
      {
        text: "그런 날일수록 더 참고 끝내야 한다고 느낀다. 감정에 무너지면 내 패배라고 생각한다.",
        type: "teto"
      }
    ]
  },
  {
    question: "친구가 누군가에게 상처를 받았다며 힘들어한다. 그 사람을 욕하고 싶을 만큼 화가 난다고 한다.",
    options: [
      {
        text: "친구 감정에 완전히 이입해서 같이 욕해주고, 화도 같이 내준다. 감정적으로 공감해주는 것이 중요하다고 느낀다.",
        type: "egen"
      },
      {
        text: '감정에 휘둘리지 말고 상황을 분석해보자고 한다. "왜 그 사람이 그런 말을 했는지 생각해봤어?"라고 물으며 정리해주려 한다.',
        type: "teto"
      }
    ]
  }
];

startBtn.addEventListener("click", () => {
    console.log("▶ 테스트 시작 버튼 클릭됨");
    startScreen.classList.remove("active");
    genderScreen.classList.add("active");
  });

  maleBtn.addEventListener("click", () => {
    selectedGender = "male";
    console.log("👨 남자 선택");
    genderScreen.classList.remove("active");
    quizScreen.classList.add("active");
    showQuestion();
  });

  femaleBtn.addEventListener("click", () => {
    selectedGender = "female";
    console.log("👩 여자 선택");
    genderScreen.classList.remove("active");
    quizScreen.classList.add("active");
    showQuestion();
  });

  function showQuestion() {
    const q = questions[currentIndex];
    if (!q) return;

    console.log(`❓ 문제 ${currentIndex + 1} 표시`);

    questionText.textContent = q.question;
    choiceA.textContent = q.options[0].text;
    choiceB.textContent = q.options[1].text;
  }

  choiceA.addEventListener("click", () => handleChoice(0));
  choiceB.addEventListener("click", () => handleChoice(1));

  function handleChoice(index) {
    const selected = questions[currentIndex].options[index];

    console.log(`👉 선택: ${selected.type}`);

    if (selected.type === "egen") egenScore += 10;
    else tetoScore += 10;

    currentIndex++;
    if (currentIndex < questions.length) {
      showQuestion();
    } else {
      showResult();
    }
  }

  function showResult() {

    console.log("🏁 테스트 종료 - 결과 계산");
    console.log(`총 에겐 점수: ${egenScore}, 테토 점수: ${tetoScore}`);

    quizScreen.classList.remove("active");
    resultScreen.classList.add("active");

    let imageUrl = "";

    if (selectedGender === "male") {
      if (tetoScore <= 29) imageUrl = "https://www.survivaloffice.com/images/egennam1.png";
      else if (tetoScore <= 49) imageUrl = "https://www.survivaloffice.com/images/2.png";
      else if (tetoScore === 50) imageUrl = "https://www.survivaloffice.com/images/3.png";
      else if (tetoScore <= 79) imageUrl = "https://www.survivaloffice.com/images/4.png";
      else imageUrl = "https://www.survivaloffice.com/images/5.png";
    } else {
      if (tetoScore <= 29) imageUrl = "https://www.survivaloffice.com/images/1.png";
      else if (tetoScore <= 49) imageUrl = "https://www.survivaloffice.com/images/2.png";
      else if (tetoScore === 50) imageUrl = "https://www.survivaloffice.com/images/3.png";
      else if (tetoScore <= 79) imageUrl = "https://www.survivaloffice.com/images/4.png";
      else imageUrl = "https://www.survivaloffice.com/images/5.png";
    }

    console.log(`🖼 결과 이미지 URL: ${imageUrl}`);
    resultImage.src = imageUrl;
  }
});