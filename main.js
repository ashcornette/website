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
  if(!bar||window.innerWidth<=600)return;

  var start=20,end=200;
  var range=end-start;

  // collapsed values
  var maxInset=Math.max(0,(window.innerWidth/2)-240);
  var ticking=false;

  function lerp(a,b,t){return a+(b-a)*t;}

  function update(){
    var y=window.scrollY;
    var t=Math.min(Math.max((y-start)/range,0),1);
    // ease-out curve for smoother feel
    t=1-Math.pow(1-t,2.5);

    if(t<=0){
      bar.classList.remove("scrolled");
      bar.style.cssText="";
      ticking=false;
      return;
    }

    bar.classList.toggle("scrolled",t>=1);

    var inset=lerp(0,maxInset,t);
    var top=lerp(0,12,t);
    var padV=lerp(20,10,t);
    var padH=lerp(40,28,t);
    var radius=lerp(0,980,t);
    var blur=lerp(0,30,t);
    var bgAlpha=lerp(0,0.35,t);
    var shadow=lerp(0,0.04,t);

    bar.style.left=inset+"px";
    bar.style.right=inset+"px";
    bar.style.top=top+"px";
    bar.style.padding=padV+"px "+padH+"px";
    bar.style.borderRadius=radius+"px";
    bar.style.background=t>0.01?"rgba(255,255,255,"+bgAlpha+")":"";
    bar.style.WebkitBackdropFilter=t>0.01?"saturate(200%) blur("+blur+"px)":"";
    bar.style.backdropFilter=t>0.01?"saturate(200%) blur("+blur+"px)":"";
    bar.style.boxShadow=t>0.01?"0 1px 12px rgba(0,0,0,"+shadow+"), 0 0 0 "+lerp(0,0.5,t)+"px rgba(255,255,255,"+lerp(0,0.5,t)+") inset":"";

    ticking=false;
  }

  window.addEventListener("scroll",function(){
    if(!ticking){ticking=true;requestAnimationFrame(update);}
  },{passive:true});

  window.addEventListener("resize",function(){
    maxInset=Math.max(0,(window.innerWidth/2)-240);
  });

  update();
})();

/* section reveal — case study pages */
(function(){
  var sections = [].slice.call(document.querySelectorAll('.doc .section, .doc .case-nav, .doc .meta, .doc .stats, .doc .app-gallery, .doc .gallery-nav, .doc .testimonial-band, .doc > .pill, .doc > .role, .doc > h1, .doc > p.role'));
  if (!sections.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach(function(el) { el.classList.add('s-visible'); });
    return;
  }
  sections.forEach(function(el) { el.classList.add('s-reveal'); });
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('s-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  sections.forEach(function(el) { obs.observe(el); });
})();

/* cb-gallery reveal — Complex Breaks asset images */
(function(){
  var rows = [].slice.call(document.querySelectorAll('.cb-gallery .cb-row'));
  if (!rows.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  rows.forEach(function(row) { row.classList.add('cb-reveal'); });
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('cb-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  rows.forEach(function(row) { obs.observe(row); });
})();
