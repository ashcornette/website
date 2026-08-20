/* shared scripts — hamburger menu + topbar scroll */
(function(){
  var btn=document.getElementById("menuToggle");
  var menu=document.getElementById("topbarMenu");
  if(!btn||!menu) return;
  function closeMenu(){menu.classList.remove("open");document.body.style.overflow="";document.documentElement.style.overflow="";document.body.style.position="";document.body.style.width="";btn.textContent="=";}
  function openMenu(){menu.classList.add("open");document.body.style.overflow="hidden";document.documentElement.style.overflow="hidden";document.body.style.position="fixed";document.body.style.width="100%";var tc=document.getElementById("themeColor");if(tc)tc.content="#eeedea";btn.textContent="✕";}
  btn.addEventListener("click",function(e){e.stopPropagation();menu.classList.contains("open")?closeMenu():openMenu();});
  document.addEventListener("click",function(e){if(menu.classList.contains("open")&&!menu.contains(e.target)&&e.target!==btn){closeMenu();}});
})();

(function(){
  var bar=document.querySelector(".topbar");
  if(!bar)return;
  var threshold=60;if(window.innerWidth<=600)return;
  window.addEventListener("scroll",function(){
    if(window.scrollY>threshold){bar.classList.add("scrolled");}
    else{bar.classList.remove("scrolled");}
  },{passive:true});
})();
