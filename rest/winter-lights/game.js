"use strict";
const el = id => document.getElementById(id);
const board = el("board"), intro = el("intro"), play = el("play"), result = el("result");
let lights = [], original = [], remaining = new Set(), initialSolution = [], moves = 0, hint = -1, solved = false;
function flip(array, index) {
  const row = Math.floor(index / 5), col = index % 5;
  [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dr,dc]) => {
    const r = row + dr, c = col + dc;
    if (r >= 0 && r < 5 && c >= 0 && c < 5) array[r * 5 + c] = !array[r * 5 + c];
  });
}
function render(focusIndex = -1) {
  board.replaceChildren();
  lights.forEach((lit, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "bulb " + (lit ? "lit" : "dark") + (hint === i ? " hinted" : "");
    b.setAttribute("aria-label", `${Math.floor(i/5)+1}행 ${i%5+1}열 전구 ${lit ? "켜짐" : "꺼짐"}`);
    b.setAttribute("aria-pressed", String(lit)); b.addEventListener("click", () => choose(i)); board.append(b);
  });
  el("moves").textContent = moves;
  if (focusIndex >= 0) board.children[focusIndex].focus({preventScroll:true});
}
function setup() {
  original = Array(25).fill(true); initialSolution = [];
  const pool = Array.from({length:25}, (_,i) => i);
  for (let i=0;i<7;i++) { const pick = Math.floor(Math.random()*pool.length); const index = pool.splice(pick,1)[0]; initialSolution.push(index); flip(original,index); }
  reset();
}
function reset() {
  lights = [...original]; remaining = new Set(initialSolution); moves = 0; hint = -1; solved = false;
  play.hidden = false; result.hidden = true; el("status").textContent = "불빛을 누르면 이웃한 불빛도 함께 바뀌어요."; render();
}
function choose(i) {
  if (solved) return;
  flip(lights,i); remaining.has(i) ? remaining.delete(i) : remaining.add(i); moves++; hint = -1;
  solved = lights.every(Boolean); render(i);
  if (solved) { el("status").textContent = "모든 불빛을 켰어요!"; el("result-text").textContent = `${moves}번 만에 반짝이는 트리를 완성했어요.`; result.hidden = false; }
}
el("start").addEventListener("click", () => { intro.hidden = true; setup(); play.scrollIntoView({block:"start"}); });
el("hint").addEventListener("click", () => { if(solved) return; hint = remaining.values().next().value; el("status").textContent = "반짝이는 전구를 눌러 보세요."; render(); });
el("reset").addEventListener("click",reset); el("new").addEventListener("click",setup);
el("again").addEventListener("click",() => { setup(); play.scrollIntoView({block:"start"}); });
el("share").addEventListener("click",async () => { const data={title:"크리스마스 트리 불빛 켜기",text:`${moves}번 만에 트리를 밝혔어요!`,url:"https://survivaloffice.com/rest/winter-lights/"}; try {if(navigator.share) await navigator.share(data); else {await navigator.clipboard.writeText(`${data.text} ${data.url}`); el("share-status").textContent="링크를 복사했어요.";} } catch(e) {if(e.name!=="AbortError") el("share-status").textContent="주소창의 링크를 복사해 공유해 주세요.";} });
