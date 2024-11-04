// Firestore에서 글 불러오기
document.addEventListener('DOMContentLoaded', () => {
    console.log("블로그 섹션 2 로드 완료");

    // Firestore에서 'two' 컬렉션의 글 불러오기
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';

    db.collection('two').orderBy('timestamp', 'desc').get().then(snapshot => {
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
        console.error('Firestore에서 불러오기 오류:', error);
    });
});

// 로그인/로그아웃 처리
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
    .then((result) => {
        console.log('로그인 성공:', result.user);
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        document.getElementById('login-status').innerText = `로그인 된 이메일: ${result.user.email}`;
    })
    .catch((error) => {
        console.error('로그인 실패:', error);
    });
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('로그아웃 성공');
    }).catch((error) => {
        console.error('로그아웃 실패:', error);
    });
});
