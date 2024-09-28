let currentStep = 'step-1';  // 현재 화면 단계
let searchType = '';         // 검색 유형(음식명/가격)
let selectedDistrict = '';   // 사용자가 입력한 구를 저장할 변수

// 화면 전환 함수
function goToStep(step, type) {
    document.getElementById(currentStep).classList.remove('active');
    document.getElementById(step).classList.add('active');
    currentStep = step; // 현재 화면을 업데이트

    if (type) {
        searchType = type;  // 검색 유형(음식명 또는 가격)을 설정
    }
}

// 뒤로가기 함수
function goBack(step) {
    document.getElementById(currentStep).classList.remove('active');
    document.getElementById(step).classList.add('active');
    currentStep = step; // 이전 화면으로 돌아감
}

// 입력값 없으면 버튼 비활성화, 있으면 활성화
function toggleButton(buttonId, input) {
    const button = document.getElementById(buttonId);
    if (input.value.trim() === '') {
        button.disabled = true; // 입력값이 없으면 버튼 비활성화
    } else {
        button.disabled = false; // 입력값이 있으면 버튼 활성화
    }
}

// 사용자가 입력한 구 저장 함수
function saveDistrict() {
    selectedDistrict = document.getElementById('district').value.trim(); // 사용자가 입력한 구를 저장
    if (selectedDistrict !== '') { // 구가 입력된 경우에만 다음 단계로 이동
        goToStep('step-2');
    }
}

// 검색 결과 보여주는 함수
function showResult(type) {
    let searchValue;

    if (type === 'food') {
        searchValue = document.getElementById('food-name').value.trim(); // 음식명으로 검색
    } else if (type === 'price') {
        searchValue = parseInt(document.getElementById('price').value); // 가격으로 검색
    }

    // data.json 파일에서 데이터를 가져와서 필터링
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            let filteredStores;

            // 사용자가 입력한 구에 해당하는 가게만 필터링
            let districtStores = data.filter(store => store.address.includes(selectedDistrict));

            if (type === 'food') {
                // 음식명에 해당하는 가게 필터링
                filteredStores = districtStores.filter(store =>
                    store.foods.some(food => food.foodName === searchValue)
                );
            } else if (type === 'price') {
                // 가격 이하의 가게 필터링
                filteredStores = districtStores.filter(store =>
                    store.foods.some(food => food.price <= searchValue)
                );
            }

            // 검색된 결과가 없을 경우 처리
            if (filteredStores.length === 0) {
                document.getElementById('result-content').innerHTML = "해당 조건에 맞는 결과가 없습니다.";
            } else {
                // 검색된 결과를 화면에 출력
                document.getElementById('result-content').innerHTML = filteredStores.map(store => `
                    <div class="result-item">
                        <p><strong>가게명:</strong> ${store.storeName}</p>
                        <p><strong>주소:</strong> ${store.address}</p>
                        ${store.foods.filter(food => (type === 'food' ? food.foodName === searchValue : food.price <= searchValue)).map(food => `
                            <p><strong>음식명:</strong> ${food.foodName}</p>
                            <p><strong>가격:</strong> ${food.price}원</p>
                        `).join('')}
                    </div>
                `).join('');
            }

            // 결과 화면으로 이동
            goToStep('result');
        })
        .catch(error => console.error('Error fetching data:', error)); // 오류 처리
}

// 첫 질문 화면을 처음부터 보여주기 위해 설정
document.getElementById('step-1').classList.add('active');
