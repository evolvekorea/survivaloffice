const menus = {
    강남구: {
        mon: [
            { name: "강남구 구내식당 A", address: "서울 강남구", price: "₩10,000", menu: ["김치찌개", "불고기", "비빔밥", "돈까스"] },
            { name: "강남구 구내식당 B", address: "서울 강남구", price: "₩9,000", menu: ["칼국수", "제육볶음", "냉면", "볶음밥"] }
        ],
        tue: [
            { name: "강남구 구내식당 A", address: "서울 강남구", price: "₩10,000", menu: ["된장찌개", "라면", "김밥", "돈까스"] }
        ]
        // 더 많은 요일별 데이터 추가
    },
    종로구: {
        mon: [
            { name: "종로구 구내식당 A", address: "서울 종로구", price: "₩8,500", menu: ["불고기", "짬뽕", "제육볶음", "오므라이스"] }
        ]
        // 요일별 데이터 추가
    },
    // 다른 구별 데이터 추가
};

let selectedDistrict = "";
let currentDayIndex = 0;
const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
const dayNames = {
    mon: '월요일',
    tue: '화요일',
    wed: '수요일',
    thu: '목요일',
    fri: '금요일'
};

// 구 선택 시 구내식당 메뉴를 표시할 수 있도록 구를 저장
function selectDistrict(district) {
    selectedDistrict = district;
    document.getElementById("selected-district").textContent = district + " 구내식당 메뉴";
    showMenu(days[currentDayIndex]);  // 현재 선택된 요일의 메뉴를 표시
}

// 이전 요일로 이동
function prevDay() {
    currentDayIndex = (currentDayIndex - 1 + days.length) % days.length;
    showMenu(days[currentDayIndex]);
}

// 다음 요일로 이동
function nextDay() {
    currentDayIndex = (currentDayIndex + 1) % days.length;
    showMenu(days[currentDayIndex]);
}

// 요일별 메뉴를 선택하여 표시
function showMenu(day) {
    const cafeteriaList = document.getElementById('cafeteria-list');
    const currentDay = document.getElementById('current-day');
    currentDay.textContent = dayNames[day];  // 현재 요일 표시
    cafeteriaList.innerHTML = "";  // 기존 메뉴 초기화

    if (selectedDistrict && menus[selectedDistrict] && menus[selectedDistrict][day]) {
        menus[selectedDistrict][day].forEach(cafeteria => {
            const menuItem = document.createElement('div');
            menuItem.classList.add('menu-item');

            const name = document.createElement('h3');
            name.textContent = `구내식당명: ${cafeteria.name}`;

            const address = document.createElement('p');
            address.textContent = `주소: ${cafeteria.address}`;

            const price = document.createElement('p');
            price.textContent = `금액: ${cafeteria.price}`;

            const menuList = document.createElement('ul');
            cafeteria.menu.forEach((menu, index) => {
                const menuItem = document.createElement('li');
                menuItem.textContent = `${index + 1}. ${menu}`;
                menuList.appendChild(menuItem);
            });

            menuItem.appendChild(name);
            menuItem.appendChild(address);
            menuItem.appendChild(price);
            menuItem.appendChild(menuList);

            cafeteriaList.appendChild(menuItem);
        });
    } else {
        cafeteriaList.innerHTML = "<p>해당 요일의 구내식당 정보가 없습니다.</p>";
    }
}
