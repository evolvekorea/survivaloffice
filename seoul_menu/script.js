const menus = {
    종로구: {
        mon: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["육개장", "흑미밥", "생선까스", "두부구이", "고추지무침", "깍두기", "그린샐러드", "미숫가루"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["비빔국수", "유부장국", "후리가께밥", "데리야끼닭강정", "단무지", "그린샐러드", "미숫가루"] }
        ],
        wed: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["간장불고기", "차조밥", "홍합무국", "깐풍두부강정", "물만두", "치커리야채무침", "무맛김치", "한라봉당근주스", "그린샐러드"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["짜장면", "홍합무국", "물만두", "깐풍두부강정", "치커리야채무침", "무맛김치", "한라봉당근주스", "그린샐러드"] }       
        ],
        fri: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["돼지고기고추장찌개", "귀리밥", "야채커틀렛&케찹", "스크램블에그", "청경채유자청무침", "배추겉절이", "그린샐러드", "그린샐러드","복숭아홍차"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["치킨데리마요덮밥", "가쓰오맑은국", "야채커틀렛&케찹", "떡볶이", "단무지", "그린샐러드", "복숭아홍차"] }        
        ]
    },  
    중구: {
        mon: [
            { name: "롯데카드 구내식당", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", menu: ["육개장", "흑미밥", "생선까스", "두부구이", "고추지무침", "깍두기"] },
            { name: "강남구 구내식당 B", address: "서울 강남구", price: "₩9,000", menu: ["칼국수", "제육볶음", "냉면", "볶음밥"] }
        ],
        tue: [
            { name: "강남구 구내식당 A", address: "서울 강남구", price: "₩10,000", menu: ["된장찌개", "라면", "김밥", "돈까스"] }
        ]
    },
    강남구: {
        mon: [
            { name: "강남구 구내식당 A", address: "서울 강남구", price: "₩10,000", menu: ["김치찌개", "불고기", "비빔밥", "돈까스"] },
            { name: "강남구 구내식당 B", address: "서울 강남구", price: "₩9,000", menu: ["칼국수", "제육볶음", "냉면", "볶음밥"] }
        ],
        tue: [
            { name: "강남구 구내식당 A", address: "서울 강남구", price: "₩10,000", menu: ["된장찌개", "라면", "김밥", "돈까스"] }
        ]
    }
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
            name.textContent = `${cafeteria.name}`;

            const address = document.createElement('p');
            address.textContent = `주소: ${cafeteria.address}`;

            const price = document.createElement('p');
            price.textContent = `금액: ${cafeteria.price}`;

            const menuList = document.createElement('ul');
            cafeteria.menu.forEach(menu => {
                const menuItem = document.createElement('li');
                menuItem.textContent = menu;  // 숫자 없이 메뉴명만 표시
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
