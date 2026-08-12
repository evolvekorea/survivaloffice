document.addEventListener('DOMContentLoaded',()=>{
  const result=document.getElementById('result');
  const image=document.getElementById('resultLeafImage');
  const name=document.getElementById('resultName');
  if(!result||!image||!name)return;
  const files={'선명한 붉은 단풍':'red','밝은 주황 단풍':'orange','황금빛 은행잎':'gold','깊은 자주 단풍':'burgundy','차분한 갈색 잎':'brown','포근한 베이지 잎':'beige'};
  const update=()=>{const key=files[name.textContent];if(!key)return;image.src=`/images/leaf-color/leaf-${key}.webp`;image.alt=`${name.textContent} 실제 단풍잎`};
  new MutationObserver(update).observe(name,{childList:true,subtree:true});
  new MutationObserver(update).observe(result,{attributes:true,attributeFilter:['hidden']});
});
