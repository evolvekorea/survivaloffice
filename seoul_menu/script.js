const menus = {
    종로구: {
        mon: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["육개장", "흑미밥", "생선까스", "두부구이", "고추지무침", "깍두기", "그린샐러드", "미숫가루"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["비빔국수", "유부장국", "후리가께밥", "데리야끼닭강정", "단무지", "그린샐러드", "미숫가루"] }
        ],
        tue: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["부대찌개", "흑미밥", "계란찜", "깐풍만두강정", "숙주나물", "건파래볶음", "배추겉절이", "레몬에이드"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["카레라이스&고구마까스토핑", "가쓰오맑은국", "깐풍만두강정", "모닝롤&딸기잼", "수제무피클", "그린샐러드", "레몬에이드"] }
        ],
        wed: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["맑은소고기국밥", "기장밥", "떡잡채", "매운두부조림", "맥적채소무침", "깍두기", "다크체리아이스티", "알새우칩"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["뚝배기토마토미트스파게티", "단호박크림스프", "함박스테이크", "감자튀김", "수제모듬채소피클", "다크체리아이스티", "알새우칩"] }       
        ],
        thu: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["춘천닭갈비", "귀리밥", "미역국", "비엔나떡야채볶음", "명엽채볶음", "마늘종지무침", "무맛김치", "그린샐러드", "헛개차"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["중국식잡채덮밥", "짬뽕국", "탕수육", "비엔나떡야채볶음", "짜샤이무침", "헛개차", "그린샐러드"] }        
        ],
        fri: [
            { name: "롯데카드 구내식당(올반)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["제육볶음", "차조밥", "열무된장국", "맛살옥수수전", "미역줄기볶음", "양배추쌈", "배추걸절이", "그린샐러드","매실차"] },
            { name: "롯데카드 구내식당(고메)", address: "서울 중구 새문안로 76 콘코디언 빌딩", price: "₩9,000", 
                menu: ["불고기나물비빔밥", "열무된장국", "떡갈비구이", "맛살옥수수전", "배추겉절이", "그린샐러드", "매실차"] }        
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
