// 현재 질문 단계를 저장하는 변수
let currentStep = 1;
let searchType = '';

// 화면 전환 함수
function goToStep(step, type) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    if (type) {
        searchType = type;
    }

    if (step === 3) {
        if (searchType === 'food') {
            document.getElementById('step-3-food').classList.add('active');
        } else {
            document.getElementById('step-3-price').classList.add('active');
        }
    } else {
        document.getElementById(`step-${step}`).classList.add('active');
    }

    currentStep = step;
}

// 결과를 보여주는 함수
function showResult() {
    let resultText = '';
    
    if (searchType === 'food') {
        const foodName = document.getElementById('food-name').value;
        resultText = `${foodName}를 검색했습니다.`;
    } else {
        const price = document.getElementById('price').value;
        resultText = `${price}원 이하의 음식을 검색했습니다.`;
    }

    document.getElementById('result-text').textContent = resultText;
    goToStep('result');
}

// 첫 질문 화면을 처음부터 보여주기 위해 설정
document.getElementById('step-1').classList.add('active');
