const defaults = [
  ['절임배추', 'kg', 20], ['무', '개', 2], ['고춧가루', 'kg', 1],
  ['마늘', 'g', 500], ['생강', 'g', 100], ['쪽파', '단', 1],
  ['액젓', 'ml', 500], ['새우젓', 'g', 300]
];
const key = 'survivaloffice-kimjang-planner-v1';
const list = document.querySelector('#items');
const sum = document.querySelector('#total');
const count = document.querySelector('#count');
const announce = document.querySelector('#notice');
let items;
try {
  const saved = JSON.parse(localStorage.getItem(key));
  items = Array.isArray(saved) && saved.length && saved.every(item => typeof item.name === 'string' && typeof item.unit === 'string') ? saved : null;
} catch { items = null; }
if (!items) items = defaults.map(([name, unit, quantity]) => ({name, unit, quantity, price: '', checked: false}));

function save() {
  try { localStorage.setItem(key, JSON.stringify(items)); }
  catch { announce.textContent = '이 기기에서 저장할 수 없습니다. 화면을 닫으면 입력한 내용이 사라질 수 있어요.'; }
}
function updateSummary() {
  const total = items.reduce((value, item) => value + (Number(item.price) || 0), 0);
  sum.textContent = total.toLocaleString('ko-KR') + '원';
  count.textContent = items.filter(item => item.checked).length + ' / ' + items.length + '개 준비';
}
function render() {
  list.replaceChildren();
  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'item';
    const check = document.createElement('input');
    check.type = 'checkbox'; check.checked = !!item.checked;
    check.setAttribute('aria-label', item.name + ' 준비 완료');
    check.addEventListener('change', () => { item.checked = check.checked; row.classList.toggle('done', item.checked); save(); updateSummary(); });
    const name = document.createElement('strong'); name.textContent = item.name;
    const qtyLabel = document.createElement('label'); qtyLabel.textContent = '수량 (' + item.unit + ')';
    const qty = document.createElement('input'); qty.type = 'number'; qty.min = '0'; qty.max = '99999'; qty.step = 'any'; qty.inputMode = 'decimal'; qty.value = item.quantity;
    qty.addEventListener('input', () => { item.quantity = qty.value; save(); });
    qtyLabel.append(qty);
    const priceLabel = document.createElement('label'); priceLabel.textContent = '총 가격 (원)';
    const price = document.createElement('input'); price.type = 'number'; price.min = '0'; price.max = '99999999'; price.step = '1'; price.inputMode = 'numeric'; price.placeholder = '직접 입력'; price.value = item.price;
    price.addEventListener('input', () => { item.price = Math.max(0, Math.min(99999999, Number(price.value) || 0)); save(); updateSummary(); });
    priceLabel.append(price);
    row.classList.toggle('done', item.checked); row.append(check, name, qtyLabel, priceLabel); list.append(row);
  });
  updateSummary();
}
document.querySelector('#reset').addEventListener('click', () => {
  if (!window.confirm('입력한 수량과 가격을 모두 지우고 처음 상태로 되돌릴까요?')) return;
  items = defaults.map(([name, unit, quantity]) => ({name, unit, quantity, price: '', checked: false}));
  save(); render(); announce.textContent = '목록을 처음 상태로 되돌렸어요.';
});
document.querySelector('#copy').addEventListener('click', async () => {
  const lines = items.map(item => (item.checked ? '☑ ' : '☐ ') + item.name + ' ' + item.quantity + item.unit + (item.price ? ' · ' + Number(item.price).toLocaleString('ko-KR') + '원' : ''));
  const text = ['김장 장보기 목록', ...lines, '합계 ' + sum.textContent, 'https://survivaloffice.com/work/kimjang-planner/'].join('\n');
  try { await navigator.clipboard.writeText(text); announce.textContent = '장보기 목록을 복사했어요.'; }
  catch { announce.textContent = '복사할 수 없습니다. 브라우저의 복사 권한을 확인해 주세요.'; }
});
render();
