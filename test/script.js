console.log("Firebase 앱 초기화됨:", app);
console.log("Firestore 데이터베이스 초기화됨:", db)


// 페이지 로드 시 콘솔에 메시지 출력
document.addEventListener('DOMContentLoaded', () => {
    console.log("Survival Office 웹사이트가 로드되었습니다.");
    
    // 각 블로그 섹션의 추천순 상위 5개 글 불러오기
    loadTopPosts('one', 'oneTopPosts');  // 블로그 섹션 1 (One)
    loadTopPosts('two', 'twoTopPosts');  // 블로그 섹션 2 (Two)
    loadTopPosts('three', 'threeTopPosts');  // 블로그 섹션 3 (Three)
});

// Firestore에서 추천순으로 상위 5개의 글 불러오기
function loadTopPosts(section, elementId) {
    const postsDiv = document.getElementById(elementId);
    postsDiv.innerHTML = '';

    db.collection(section).orderBy('likes', 'desc').limit(5).get()
        .then(snapshot => {
            if (snapshot.empty) {
                console.log(`컬렉션 ${section}에 데이터가 없습니다.`);
            } else {
                snapshot.forEach(doc => {
                    const post = doc.data();
                    console.log(`불러온 데이터:`, post);
                    postsDiv.innerHTML += `<div class="post">
                        <h3>${post.title}</h3>
                        <p>${post.content}</p>
                        <small>추천 수: ${post.likes}</small><br>
                        <small>작성자: ${post.author}</small><br>
                        <small>${post.timestamp?.toDate()}</small>
                    </div>`;
                });
            }
        })
        .catch(error => {
            console.error('Firestore 불러오기 오류:', error);
        });
}

// Firestore에서 전체 글 불러오기
function loadPosts(section, elementId) {
    const postsDiv = document.getElementById(elementId);
    postsDiv.innerHTML = '';

    db.collection(section).orderBy('timestamp', 'desc').get().then(snapshot => {
        snapshot.forEach(doc => {
            const post = doc.data();
            postsDiv.innerHTML += `<div class="post">
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <small>작성자: ${post.author}</small><br>
                <small>${post.timestamp?.toDate()}</small>
            </div>`;
        });
    }).catch(error => {
        console.error('Firestore 불러오기 오류:', error);
    });
}

// 섹션별로 전체 글을 불러오는 버튼 이벤트
document.getElementById('blogSection1').addEventListener('click', () => {
    loadPosts('one', 'blogSection1Posts');
});

document.getElementById('blogSection2').addEventListener('click', () => {
    loadPosts('two', 'blogSection2Posts');
});

document.getElementById('blogSection3').addEventListener('click', () => {
    loadPosts('three', 'blogSection3Posts');
});

// 글 작성 폼 처리
postForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    db.collection('one').add({
        title: title,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser.email
    }).then(() => {
        alert('글이 성공적으로 작성되었습니다!');
        postForm.reset();
        loadPosts('one');  // 새로운 글을 반영하기 위해 다시 불러옴
    });
});

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("로그인된 사용자:", user.email);
        // 로그인된 상태에서 글 작성 폼 보이기
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        postForm.style.display = 'block';
    } else {
        console.log("로그인되지 않음");
        loginBtn.style.display = 'inline';
        logoutBtn.style.display = 'none';
        postForm.style.display = 'none';
    }
});