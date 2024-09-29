let minPrice = 1000; // 최소 가격 초기값
let maxPrice = 50000; // 최대 가격 초기값

// 최소 가격 슬라이더 값 업데이트 함수
function updateMinPrice(value) {
    minPrice = parseInt(value, 10);
    document.getElementById('selected-min-price').innerText = minPrice.toLocaleString(); // 선택된 최소 가격 표시

    // 최소 가격이 최대 가격보다 크면 최대 가격도 최소 가격으로 맞춤
    if (minPrice > maxPrice) {
        maxPrice = minPrice;
        document.getElementById('max-price-range').value = minPrice;
        document.getElementById('selected-max-price').innerText = maxPrice.toLocaleString();
    }
}

// 최대 가격 슬라이더 값 업데이트 함수
function updateMaxPrice(value) {
    maxPrice = parseInt(value, 10);
    document.getElementById('selected-max-price').innerText = maxPrice.toLocaleString(); // 선택된 최대 가격 표시

    // 최대 가격이 최소 가격보다 작으면 최소 가격도 최대 가격으로 맞춤
    if (maxPrice < minPrice) {
        minPrice = maxPrice;
        document.getElementById('min-price-range').value = maxPrice;
        document.getElementById('selected-min-price').innerText = minPrice.toLocaleString();
    }
}

// 검색 결과 보여주는 함수
function showResult(type) {
    let searchValue;

    if (type === 'food') {
        searchValue = document.getElementById('food-name').value.trim();
    } else if (type === 'price') {
        searchValue = { min: minPrice, max: maxPrice };
    }

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            let filteredStores = [];

            // 사용자가 입력한 구에 해당하는 가게만 필터링
            const districtStores = data.filter(store => store.address.includes(selectedDistrict));
            
            if (type === 'food') {
                // 음식명을 기준으로 필터링
                filteredStores = districtStores
                    .map(store => {
                        const filteredFoods = store.foods.filter(food => food.foodName.includes(searchValue));
                        if (filteredFoods.length > 0) {
                            return {
                                storeName: store.storeName,
                                address: store.address,
                                foods: filteredFoods // 해당 음식만 포함
                            };
                        }
                        return null; // 해당 가게에 조건에 맞는 음식이 없으면 null로 반환
                    })
                    .filter(store => store); // null인 가게 제거

            } else if (type === 'price') {
                // 가격 범위로 필터링
                filteredStores = districtStores
                    .map(store => {
                        const filteredFoods = store.foods.filter(food => food.price >= searchValue.min && food.price <= searchValue.max);
                        if (filteredFoods.length > 0) {
                            return {
                                storeName: store.storeName,
                                address: store.address,
                                foods: filteredFoods // 해당 가격 구간에 맞는 음식만 포함
                            };
                        }
                        return null; // 해당 가게에 조건에 맞는 음식이 없으면 null로 반환
                    })
                    .filter(store => store); // null인 가게 제거
            }

            // 필터링된 결과가 없는 경우 처리
            if (filteredStores.length === 0) {
                document.getElementById('result-content').innerHTML = "해당 조건에 맞는 결과가 없습니다.";
            } else {
                // 필터링된 결과를 화면에 출력
                document.getElementById('result-content').innerHTML = filteredStores.map(store => `
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

            goToStep('result');  // 결과 화면으로 이동
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('result-content').innerHTML = "데이터를 불러오는 중 오류가 발생했습니다.";
        });
}
