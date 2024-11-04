
// Firestore에서 글 불러오기
document.addEventListener('DOMContentLoaded', () => {
    console.log("게시판 페이지 로드 완료");


    // Firestore에서 'one' 컬렉션의 글 불러오기
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';

    db.collection('one').orderBy('timestamp', 'desc').get().then(snapshot => {
        snapshot.forEach(doc => {
            const post = doc.data();
            postsDiv.innerHTML += `
                <div class="post" onclick="viewFullPost('${doc.id}')">
                    <a class="post-title" href="#">${post.title}</a>
                    <div class="post-details">
                        <span>추천: ${post.likes}</span>
                        <span>${post.author}</span>
                        <span>${post.timestamp ? post.timestamp.toDate().toLocaleDateString() : ''}</span>
                    </div>
                </div>
            `;
        });
    }).catch(error => {
        console.error('Firestore에서 불러오기 오류:', error);
    });
});

// 특정 게시물 전체 보기
function viewFullPost(postId) {
    db.collection('one').doc(postId).get().then(doc => {
        if (doc.exists) {
            const post = doc.data();
            alert(`제목: ${post.title}\n내용: ${post.content}\n작성자: ${post.author}\n추천 수: ${post.likes}`);
        } else {
            console.log('해당 게시물을 찾을 수 없습니다.');
        }
    }).catch(error => {
        console.error('게시물 불러오기 오류:', error);
    });
}

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
        document.getElementById('post-form').style.display = 'block';
    })
    .catch((error) => {
        console.error('로그인 실패:', error);
    });
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        console.log('로그아웃 성공');
        loginBtn.style.display = 'inline';
        logoutBtn.style.display = 'none';
        document.getElementById('login-status').innerText = '';
        document.getElementById('post-form').style.display = 'none';
    }).catch((error) => {
        console.error('로그아웃 실패:', error);
    });
});

// 글 작성 폼 처리
const postForm = document.getElementById('post-form');
postForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    db.collection('one').add({
        title: title,
        content: content,
        likes: 0,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser.email
    }).then(() => {
        alert('글이 성공적으로 작성되었습니다!');
        postForm.reset();
        location.reload(); // 페이지 새로고침하여 새로운 글 목록 반영
    }).catch(error => {
        console.error('글 작성 오류:', error);
    });
});
