document.getElementById('spin-btn').addEventListener('click', function() {
    const roulette = document.querySelector('.roulette');
    const sections = document.querySelectorAll('.section');
    const resultMessage = document.getElementById('result-message');
    
    // 기존 선택된 섹션에서 효과 제거
    sections.forEach(section => section.classList.remove('selected-section'));
    
    const randomDegree = Math.floor(Math.random() * 360 + 720);  // 랜덤 각도로 룰렛 회전
    roulette.style.transform = `rotate(${randomDegree}deg)`;
    
    setTimeout(() => {
      const selectedIndex = Math.floor(((randomDegree % 360) / 45)); // 45도 단위로 선택된 섹션 계산
      const selectedSection = sections[selectedIndex];  // 선택된 섹션 가져오기
      selectedSection.classList.add('selected-section');  // 선택된 섹션에 강조 효과 추가
      
      const selectedFood = selectedSection.textContent; // 선택된 음식명 가져오기
      resultMessage.textContent = `${selectedFood} 당첨!`;  // 결과 메시지 표시
      resultMessage.style.display = 'block';  // 결과 메시지 표시
    }, 4000); // 룰렛이 멈출 때까지 대기한 후 결과 표시
  });
  