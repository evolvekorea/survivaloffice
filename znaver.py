from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys  # Keys 클래스 임포트
import time

# 크롬 드라이버 설정 (사용자의 드라이버 경로 설정)
service = Service('C:\\Users\\ohno4\\Desktop\\Evolve\\기타자료\\chromedriver-win64\\chromedriver.exe')
driver = webdriver.Chrome(service=service)

# 네이버 지도 접속
driver.get('https://map.naver.com/')

# Explicit Wait 설정
wait = WebDriverWait(driver, 20)

# 검색창 대기 후 검색어 입력
try:
    search_box = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input.input_search')))
    search_box.send_keys('서울시 종로구 음식점')
    search_box.send_keys(Keys.RETURN)  # Enter 키 입력
except Exception as e:
    print(f"검색창을 찾는 중 오류 발생: {e}")
    driver.quit()

# searchIframe으로 전환하여 음식점 목록을 탐색 및 첫 번째 음식점 선택
try:
    # iframe 전환 (검색 결과가 나오는 프레임)
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'searchIframe')))
    
    # 음식점명 클릭
    first_restaurant = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#_pcmap_list_scroll_container > ul > li:nth-child(1) > div.CHC5F > a.tzwk0 > div > div > span.place_bluelink.TYaxT')))
    print("음식점 요소 찾음")
    first_restaurant.click()  # 음식점 클릭
    print("음식점 클릭 완료")
    
except Exception as e:
    print(f"음식점 선택 중 오류 발생: {e}")
    driver.quit()


# 메뉴 정보 추출
try:
    menu_button = driver.find_element(By.CSS_SELECTOR, '._3U7S1')
    menu_button.click()
    time.sleep(2)

    # BeautifulSoup으로 메뉴 파싱
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    menu_items = soup.select('.menu_item')

    food_name = menu_items[0].select_one('.name').text
    price = menu_items[0].select_one('.price').text

    # JSON 형식으로 데이터 저장
    restaurant_data = {
        "storeName": restaurant_name,
        "address": address,
        "foodName": food_name,
        "price": price
    }

    # 결과를 JSON 파일에 저장
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(restaurant_data, f, ensure_ascii=False, indent=4)

except Exception as e:
    print(f"메뉴 정보를 가져오는 중 오류 발생: {e}")

# 브라우저 종료
driver.quit()

print("크롤링이 완료되었습니다.")
