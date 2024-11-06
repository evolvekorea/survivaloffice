document.addEventListener("DOMContentLoaded", function () {
    const calendarBody = document.getElementById('calendar-body');
    const yearInput = document.getElementById('yearInput'); // 연도 입력 필드
    const dayTypeInput = document.getElementById('dayTypeInput'); // 한날 입력 필드
    const monthDays = {
        1: 31,
        2: 29, // February with 29 days
        3: 31,
        4: 30, // April with 30 days
        5: 31,
        6: 30, // June with 30 days
        7: 31,
        8: 31,
        9: 30, // September with 30 days
        10: 31,
        11: 30, // November with 30 days
        12: 31
    };

    // 페이지 로드 시 저장된 연도 및 상태 로드
    let currentPage = localStorage.getItem('currentPage') || '1';
    loadPage(currentPage);

    // 페이지 버튼 클릭 시 페이지 변경
    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', function () {
            const selectedPage = this.getAttribute('data-page');
            loadPage(selectedPage);
        });
    });

    // 연도 입력 시 로컬 스토리지에 페이지별로 저장
    yearInput.addEventListener('input', function () {
        const enteredYear = yearInput.value;
        localStorage.setItem(`savedYear_${currentPage}`, enteredYear); // 페이지별 연도 저장
    });

    // 한날 입력 시 로컬 스토리지에 페이지별로 저장
    dayTypeInput.addEventListener('input', function () {
        const enteredDayType = dayTypeInput.value;
        localStorage.setItem(`savedDayType_${currentPage}`, enteredDayType); // 페이지별 한날 저장
    });

    function loadPage(page) {
        currentPage = page;
        localStorage.setItem('currentPage', currentPage);

        // 페이지별 저장된 연도 및 한날 불러오기
        const savedYear = localStorage.getItem(`savedYear_${page}`) || '';
        yearInput.value = savedYear; // 입력 필드에 저장된 연도 표시

        const savedDayType = localStorage.getItem(`savedDayType_${page}`) || '';
        dayTypeInput.value = savedDayType; // 입력 필드에 저장된 한날 표시

        // 해당 페이지의 상태를 로드
        loadState(currentPage);
    }

    function saveState(day, month, isChecked) {
        const key = `page_${currentPage}_circle_${month}_${day}`;
        localStorage.setItem(key, isChecked ? 'checked' : 'unchecked');
    }

    function loadState(page) {
        calendarBody.innerHTML = ''; // 기존 테이블 내용 초기화
        
        // 테이블 생성
        for (let day = 1; day <= 31; day++) {
            const row = document.createElement('tr');
            const dayCell = document.createElement('td');
            dayCell.textContent = day;
            row.appendChild(dayCell);

            for (let month = 1; month <= 12; month++) {
                const cell = document.createElement('td');
                const circle = document.createElement('div');
                circle.classList.add('circle');

                // 30일 또는 29일까지 있는 달 처리
                if (day > monthDays[month]) {
                    cell.textContent = ''; // 빈 셀로 처리
                } else {
                    // 클릭 시 색상 전환 및 상태 저장
                    circle.addEventListener('click', function () {
                        this.classList.toggle('clicked');
                        saveState(day, month, this.classList.contains('clicked'));
                    });

                    // 이전에 저장된 상태 불러오기
                    const key = `page_${page}_circle_${month}_${day}`;
                    const isChecked = localStorage.getItem(key) === 'checked';
                    if (isChecked) {
                        circle.classList.add('clicked');
                    }

                    cell.appendChild(circle);
                }

                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }
    }

    // 초기 로드
    loadState(currentPage);
});
