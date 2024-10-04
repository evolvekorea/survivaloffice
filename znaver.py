from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
from bs4 import BeautifulSoup

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
    search_box.send_keys(Keys.RETURN)
except Exception as e:
    print(f"검색창을 찾는 중 오류 발생: {e}")
    driver.quit()

# searchIframe으로 전환하여 음식점 목록을 탐색 및 첫 번째 음식점 선택
try:
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'searchIframe')))
    
    # 새로운 CSS 셀렉터를 사용하여 첫 번째 음식점 클릭
    first_restaurant = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '#_pcmap_list_scroll_container > ul > li:nth-child(1) > div.CHC5F > a.tzwk0 > div > div > span.place_bluelink.TYaxT')))
    first_restaurant.click()
    print("음식점 선택 완료")
except Exception as e:
    print(f"음식점 선택 중 오류 발생: {e}")
    driver.quit()

# entryIframe으로 전환하여 세부 정보 크롤링
try:
    # 음식점 세부 정보가 표시되는 iframe으로 전환
    driver.switch_to.default_content()  # 기본 페이지로 돌아가기
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, 'entryIframe')))
    
    # 음식점 이름과 주소 가져오기
    restaurant_name = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.place_section_header h2'))).text
    address = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '.address'))).text

    print(f"음식점 이름: {restaurant_name}, 주소: {address}")

except Exception as e:
    print(f"음식점 정보 가져오는 중 오류 발생: {e}")
    driver.quit()

# 메뉴 정보 추출
try:
    menu_button = driver.find_element(By.CSS_SELECTOR, '._3U7S1')
    menu_button.click()
    time.sleep(2)

    # BeautifulSoup으로 메뉴 파싱
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
