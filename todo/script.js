document.addEventListener("DOMContentLoaded", function () {
    const calendarBody = document.getElementById('calendar-body');
    const pageButtons = document.querySelectorAll('.page-btn');
    const dayTypeInput = document.getElementById('dayTypeInput');

    // 페이지 로드 시 저장된 상태 로드
    let currentPage = localStorage.getItem('currentPage') || '1';
    loadPage(currentPage);

    // 페이지 버튼 클릭 시 페이지 변경
    pageButtons.forEach(button => {
        button.addEventListener('click', function () {
            const selectedPage = this.getAttribute('data-page');
            loadPage(selectedPage);
        });
    });

    function loadPage(page) {
        currentPage = page;
        localStorage.setItem('currentPage', currentPage);

        // 활성화된 버튼 강조
        pageButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.page-btn[data-page="${currentPage}"]`).classList.add('active');

        // 해당 페이지의 상태를 로드
        loadState(currentPage);
    }

    // 상태 저장 및 불러오기 함수
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
                row.appendChild(cell);
            }
            calendarBody.appendChild(row);
        }

        // 한날, 안한날 상태 로드
        const dayTypeKey = `page_${page}_dayType`;
        const savedDayType = localStorage.getItem(dayTypeKey) || '';
        dayTypeInput.value = savedDayType; // 입력된 값만 로드 (옆에 텍스트 없음)
    }

    // 한날, 안한날 상태 저장
    dayTypeInput.addEventListener('input', function () {
        const dayTypeKey = `page_${currentPage}_dayType`;
        localStorage.setItem(dayTypeKey, this.value);
    });

    // 초기 로드
    loadState(currentPage);
});
