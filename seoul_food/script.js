let currentStep = 'step-1'; // 현재 화면 단계
let selectedDistrict = ''; // 사용자가 입력한 구 정보
let minPrice = 1000; // 최소 가격 초기값
let maxPrice = 50000; // 최대 가격 초기값
let searchType = ''; // 검색 유형 (음식명 or 가격)

// 화면 전환 함수
function goToStep(step, type) {
    console.log(`Navigating to step: ${step}`); // 현재 단계 로그
    document.querySelectorAll('.question-step').forEach(element => {
        element.classList.remove('active');
    });
    document.getElementById(step).classList.add('active');
    currentStep = step;

    if (type) {
        searchType = type; // 음식명 또는 가격 검색 유형 설정
        console.log(`Search type set to: ${searchType}`);
    }
}

// 뒤로가기 함수
function goBack(step) {
    console.log(`Going back to step: ${step}`);
    document.querySelectorAll('.question-step').forEach(element => {
        element.classList.remove('active');
    });
    document.getElementById(step).classList.add('active');
    currentStep = step;
}

// 버튼 활성화/비활성화 함수 (입력값에 따라 버튼을 활성화)
function toggleButton(buttonId, input) {
    const button = document.getElementById(buttonId);
    const inputValue = input.value.trim();
    console.log(`Input value: ${inputValue}`); // 입력값 로그

    // 입력값이 공백이 아닌지 확인하여 버튼 활성화
    if (inputValue !== '') {
        button.disabled = false;  // 입력값이 있으면 버튼 활성화
        console.log(`${buttonId} is enabled`);
    } else {
        button.disabled = true;   // 입력값이 없으면 버튼 비활성화
        console.log(`${buttonId} is disabled`);
    }
}

// 사용자가 입력한 구 저장 함수
function saveDistrict() {
    selectedDistrict = document.getElementById('district').value.trim();
    console.log(`Selected district: ${selectedDistrict}`); // 선택된 구 로그
    if (selectedDistrict !== '') {
        goToStep('step-2'); // 구가 입력된 경우에만 다음 단계로 이동
    } else {
        alert("구를 입력해 주세요!"); // 구가 입력되지 않았을 때 경고
    }
}

// 슬라이더 값 업데이트 함수 (최소 가격 업데이트)
function updateMinPrice(value) {
    minPrice = parseInt(value, 10);
    document.getElementById('selected-min-price').innerText = minPrice.toLocaleString();
    console.log(`Min price set to: ${minPrice}`);
}

// 슬라이더 값 업데이트 함수 (최대 가격 업데이트)
function updateMaxPrice(value) {
    maxPrice = parseInt(value, 10);
    document.getElementById('selected-max-price').innerText = maxPrice.toLocaleString();
    console.log(`Max price set to: ${maxPrice}`);
}

// 검색 결과를 보여주는 함수
function showResult(type) {
    console.log(`Showing result for: ${type}`); // 결과 검색 유형 로그
    let searchValue;

    if (type === 'food') {
        searchValue = document.getElementById('food-name').value.trim(); // 음식명 검색
        console.log(`Search value (food): ${searchValue}`);
    } else if (type === 'price') {
        searchValue = { min: minPrice, max: maxPrice }; // 가격 구간 검색
        console.log(`Search value (price range): min ${minPrice}, max ${maxPrice}`);
    }

    fetch('data.json') // 데이터 파일을 불러옴
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let filteredStores = [];

            // 사용자가 입력한 구에 해당하는 가게만 필터링
            const districtStores = data.filter(store => store.address.includes(selectedDistrict));
            console.log(`Filtered stores by district:`, districtStores);

            if (type === 'food') {
                filteredStores = districtStores.filter(store => store.foodName.includes(searchValue)); // 음식명 필터링
                console.log(`Filtered stores by food:`, filteredStores);
            } else if (type === 'price') {
                filteredStores = districtStores.filter(store => store.price >= searchValue.min && store.price <= searchValue.max); // 가격 필터링
                console.log(`Filtered stores by price:`, filteredStores);
            }

            // 결과가 없는 경우 처리
            if (filteredStores.length === 0) {
                document.getElementById('result-content').innerHTML = "해당 조건에 맞는 결과가 없습니다.";
            } else {
                // 가게별로 그룹화하여 중복 제거 및 음식 목록을 함께 출력
                const groupedStores = filteredStores.reduce((acc, store) => {
                    const existingStore = acc.find(s => s.storeName === store.storeName && s.address === store.address);
                    if (existingStore) {
                        // 이미 존재하는 가게라면 음식 목록만 추가
                        existingStore.foods.push({ foodName: store.foodName, price: store.price });
                    } else {
                        // 새로운 가게라면 가게 정보와 음식을 추가
                        acc.push({
                            storeName: store.storeName,
                            address: store.address,
                            foods: [{ foodName: store.foodName, price: store.price }]
                        });
                    }
                    return acc;
                }, []);

                // 결과를 HTML로 변환하여 출력
                document.getElementById('result-content').innerHTML = groupedStores.map(store => `
                    <div class="result-item">
                        <p><strong>가게명:</strong> ${store.storeName}</p>
                        <p><strong>주소:</strong> ${store.address}</p>
                        ${store.foods.map(food => `
                            <p><strong>음식명:</strong> ${food.foodName}</p>
                            <p><strong>가격:</strong> ${food.price.toLocaleString()}원</p>
                        `).join('')}
                    </div>
                `).join('');
            }

            // 결과 페이지로 이동
            console.log("Navigating to result page");
            goToStep('result');
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('result-content').innerHTML = "데이터를 불러오는 중 오류가 발생했습니다.";
        });
}

// 페이지 첫 로드 시 첫 번째 질문을 활성화
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('step-1').classList.add('active');
    console.log("Page loaded and step-1 activated");
});
