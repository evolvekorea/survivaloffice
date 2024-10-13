// 페이지가 로드되었을 때 기본 UI 로드 확인
document.addEventListener('DOMContentLoaded', () => {
    console.log("Survival Office 웹사이트가 로드되었습니다.");
});

// 블로그 섹션별 글 불러오기
function loadPosts(section, elementId) {
    const postsDiv = document.getElementById(elementId);
    postsDiv.innerHTML = ''; // 이전 내용을 지움

    // Firestore에서 섹션별로 글 불러오기
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

// 블로그 섹션 1의 글 불러오기
document.getElementById('blogSection1').addEventListener('click', () => {
    loadPosts('blogSection1', 'blogSection1Posts');
});

// 블로그 섹션 2의 글 불러오기
document.getElementById('blogSection2').addEventListener('click', () => {
    loadPosts('blogSection2', 'blogSection2Posts');
});

// 블로그 섹션 3의 글 불러오기
document.getElementById('blogSection3').addEventListener('click', () => {
    loadPosts('blogSection3', 'blogSection3Posts');
});

// 글 작성 폼 처리
postForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    // Firestore에 현재 블로그 섹션에 글 저장
    db.collection('blogSection1').add({
        title: title,
        content: content,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        author: auth.currentUser.email // 작성자 이메일 저장
    }).then(() => {
        alert('글이 성공적으로 작성되었습니다!');
        postForm.reset();
        loadPosts('blogSection1'); // 새로 작성한 글을 반영하기 위해 다시 불러옴
    });
});
