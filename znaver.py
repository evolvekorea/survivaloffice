import requests
import json

# 발급받은 Client ID와 Client Secret
client_id = '4mu8HhRbZgqEM7bNbTRn'  # 여기에 발급받은 Client ID를 입력
client_secret = 'b5h8e3bE7R'  # 여기에 발급받은 Client Secret을 입력

# 요청 헤더 설정
headers = {
    'X-Naver-Client-Id': client_id,
    'X-Naver-Client-Secret': client_secret
}

# 네이버 지역 검색 API URL 및 파라미터 설정
url = 'https://openapi.naver.com/v1/search/local.json'
params = {
    'query': '서울 강남구 음식점',  # 검색 키워드
    'display': 5,  # 가져올 검색 결과 수
    'start': 1,  # 검색 시작 위치
    'sort': 'random'  # 정렬 방식
}

# API 요청 보내기
response = requests.get(url, headers=headers, params=params)

# 상태 코드 확인 및 에러 처리
if response.status_code == 200:
    # 응답 데이터 JSON 파싱
    data = response.json()

    # 결과를 저장할 리스트
    store_data = []

    # API에서 가져온 검색 결과를 파싱해서 원하는 형식으로 저장
    for item in data['items']:
        store = {
            "storeName": item['title'].replace('<b>', '').replace('</b>', ''),  # HTML 태그 제거
            "address": item['roadAddress'],
        }

        # 샘플 음식 데이터를 추가 (API에는 음식 이름과 가격이 없으므로 임의로 추가)
        food_list = [
            {"foodName": "김밥", "price": 2000},
            {"foodName": "참치김밥", "price": 3000},
            {"foodName": "치즈김밥", "price": 3500}
        ]

        # 음식 정보를 store 데이터에 추가
        for food in food_list:
            store_entry = store.copy()  # 매번 독립적인 딕셔너리를 저장하기 위해 복사
            store_entry.update(food)
            store_data.append(store_entry)

    # 결과 출력
    print(json.dumps(store_data, indent=2, ensure_ascii=False))

    # 데이터를 파일로 저장 (naver.json)
    with open('naver.json', 'w', encoding='utf-8') as f:
        json.dump(store_data, f, ensure_ascii=False, indent=2)

    print("데이터가 naver.json 파일에 저장되었습니다.")
else:
    print(f"Error: API 요청에 실패했습니다. 상태 코드: {response.status_code}")
