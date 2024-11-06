document.addEventListener('DOMContentLoaded', function() {
    // 버튼 클릭 시 카드 스크롤 시작
    const showFortuneBtn = document.getElementById('showFortuneBtn');
    const cardScroll = document.getElementById('cardScroll');
    const selectedCard = document.getElementById('selectedCard');
    const fortuneDescription = document.getElementById('fortuneDescription');

    showFortuneBtn.addEventListener('click', startCardScroll);

    function startCardScroll() {
        
        // '오늘의 운세보기' 버튼 숨김
        showFortuneBtn.style.display = 'none';        
        
        // 화면 전체를 tarot.jpg로 채움
        document.body.style.backgroundImage = "url('images/tarot.jpg')";
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        
        // 3초 후 무작위 카드 선택
        setTimeout(selectRandomCard, 3000);
    }
    
    function selectRandomCard() {
        // 무작위 카드 선택
        const randomCard = Math.floor(Math.random() * 22) + 1;
    
        // 선택된 카드 표시
        selectedCard.style.display = 'flex';
        selectedCard.innerHTML = `<img src="images/${getCardFileName(randomCard)}.jpg" alt="Tarot Card ${randomCard}">`;
    
        // 카드명과 설명 표시
        fortuneDescription.style.display = 'block';
        fortuneDescription.innerHTML = `<h2>${cardNames[randomCard]}</h2><p>${fortunes[randomCard]}</p>`;
    
        // 배경 이미지 제거
        document.body.style.backgroundImage = ''; // 배경을 제거하여 카드만 보이게 함
    }
    
    // 파일명 반환 함수
    function getCardFileName(cardNumber) {
        const fileNames = [
            '1. thefool', '2. the magician', '3. high prestess', '4. the empress', '5. the emperor',
            '6. the tierophant', '7. the lovers', '8. The Chariot', '9. Strength', '10. The Hermit',
            '11. Wheel of Fortune', '12. Justice', '13. The Hanged Man', '14. Death', '15. Temperance',
            '16. The Devil', '17. The Tower', '18. The Star', '19. The Moon', '20. The Sun',
            '21. JUDGEMENT', '22. The World'
        ];
        return fileNames[cardNumber - 1];
    }
    
    // 카드명과 설명 데이터
    const cardNames = {
        1: "The Fool (바보)",
        2: "The Magician (마법사)",
        3: "The High Priestess (여사제)",
        4: "The Empress (여황제)",
        5: "The Emperor (황제)",
        6: "The Hierophant (교황)",
        7: "The Lovers (연인)",
        8: "The Chariot (전차)",
        9: "Strength (힘)",
        10: "The Hermit (은둔자)",
        11: "Wheel of Fortune (운명의 수레바퀴)",
        12: "Justice (정의)",
        13: "The Hanged Man (매달린 남자)",
        14: "Death (죽음)",
        15: "Temperance (절제)",
        16: "The Devil (악마)",
        17: "The Tower (탑)",
        18: "The Star (별)",
        19: "The Moon (달)",
        20: "The Sun (태양)",
        21: "Judgement (심판)",
        22: "The World (세계)"
    };

    const fortunes = {
        1: "새로운 시작이 너를 부르고 있어! 무모하게 보여도 용기를 내면 멋진 모험이 펼쳐질 거야. 가끔은 뛰어보는 게 필요하지, 시바!",
        2: "오늘은 네가 마법사처럼 능력을 펼칠 날! 창의력과 의지가 폭발할 거니까 원하는 걸 꼭 이뤄내 봐. 네 안의 힘을 믿어봐, 시바!",
        3: "이성은 잠깐 쉬어가고, 오늘은 직관을 믿어봐! 네 마음속 깊은 곳에서 답이 속삭이고 있을 거야. 마음의 소리에 귀 기울여, 시바!",
        4: "풍요로움이 넘치는 하루가 될 거야! 무언가를 창조하고, 새로운 아이디어가 쑥쑥 자라나는 시간이니까 주변 사람들과 나누어봐, 시바!",
        5: "오늘은 질서와 규율이 중요한 날! 네가 계획한 대로 착착 움직여보는 건 어때? 카리스마 있게 리더십을 발휘할 시간이야, 시바!",
        6: "전통적인 방식이 오늘은 가장 현명한 선택일 거야. 멘토나 선배의 조언을 귀담아듣고, 배울 점을 찾아보는 하루가 되겠어, 시바!",
        7: "사랑과 선택의 갈림길에 서 있는 오늘! 중요한 결정을 내려야 할 수도 있지만, 마음속 진실을 따라가면 후회 없을 거야. 사랑이 피어나는 하루가 될지도 몰라, 시바!",
        8: "오늘은 의지를 다지고 목표를 향해 돌진할 시간! 네가 원하던 것들이 눈앞에 있으니 힘을 모아 전진해봐. 승리가 너를 기다리고 있어, 시바!",
        9: "부드럽게, 그러나 강하게! 오늘은 인내와 용기로 어려움을 극복할 수 있어. 내면의 힘을 믿고, 차분하게 행동해보자구, 시바!",
        10: "혼자만의 시간이 필요할지도 몰라. 스스로를 돌아보고 진짜 원하는 게 뭔지 생각해봐. 고독이 가끔은 최고의 스승이 되기도 하거든, 시바!",
        11: "변화의 바람이 불어오고 있어! 예상치 못한 일이 생길 수 있지만, 긍정적으로 받아들여. 운명의 흐름이 너를 좋은 방향으로 이끌고 있을 거야, 시바!",
        12: "오늘은 공정함이 중요해! 모든 일에 균형을 잡고, 자신이 하는 선택이 옳은지 한번 더 생각해봐. 정의로운 결정이 너를 돕게 될 거야, 시바!",
        13: "오늘은 멈춰서 새로운 시각을 가져보는 게 좋겠어. 모든 걸 다르게 볼 때 더 큰 깨달음이 찾아올 거야. 잠시 여유를 가지는 것도 괜찮아, 시바!",
        14: "과거를 정리하고 새로운 시작을 맞이할 시간! 변화가 두렵겠지만, 새롭게 펼쳐질 길에 설레는 마음을 가져봐. 끝은 새로운 시작이니까, 시바!",
        15: "균형과 절제가 필요한 하루! 너무 급하게 움직이지 말고, 차분히 모든 걸 조화롭게 이끌어가봐. 인내심이 오늘의 키포인트야, 시바!",
        16: "유혹이 슬슬 다가오지만, 너는 강한 시바! 욕망에 휘둘리지 말고, 자신을 자유롭게 만들어봐. 자유로운 정신이 진짜 행복을 준다구, 시바!",
        17: "갑작스러운 변화가 올 수 있어! 당황하지 말고 그 속에서 새로운 기회를 찾아봐. 변화 속에서 강해지는 너를 발견할 거야, 시바!",
        18: "희망과 영감이 너를 밝게 비추는 하루! 미래에 대한 긍정적인 에너지가 넘쳐흐를 테니, 꿈을 크게 그려봐. 별처럼 반짝이는 하루가 될 거야, 시바!",
        19: "혼란스럽거나 불확실한 일이 있을 수 있지만, 네 직관을 믿어봐! 내면의 목소리가 진실을 말해줄 거야. 가끔은 숨겨진 감정이 드러날 수도 있어, 시바!",
        20: "오늘은 태양처럼 밝고 성공적인 하루가 될 거야! 모든 일이 술술 풀리고, 행복과 기쁨이 넘치는 시간이니까, 활짝 웃어봐, 시바!",
        21: "과거를 돌아보고, 새로운 결정을 내릴 시간이야! 스스로를 다시 평가하고 더 나은 방향으로 나아가봐. 부활의 에너지가 가득한 하루가 될 거야, 시바!",
        22: "완성의 기운이 가득한 날! 그동안의 노력이 결실을 맺고, 새로운 주기로 나아갈 준비가 된 너를 축하해. 성취감이 너를 가득 채울 거야, 시바!"
    };
});
