(function(){
  const dpr = Math.min(window.devicePixelRatio||1, 2);
  function rnd(seed){ let s=seed; return ()=> (s = (s*16807)%2147483647)/2147483647; }
  function fit(c){ const r=c.getBoundingClientRect(); c.width=Math.max(1,r.width*dpr); c.height=Math.max(1,r.height*dpr); const x=c.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); return [x,r.width,r.height]; }
  function bean(x,cx,cy,len,ang,tone){
    x.save(); x.translate(cx,cy); x.rotate(ang);
    const g=x.createRadialGradient(-len*.2,-len*.2,1,0,0,len);
    g.addColorStop(0,tone[0]); g.addColorStop(1,tone[1]);
    x.fillStyle=g; x.beginPath(); x.ellipse(0,0,len,len*.68,0,0,Math.PI*2); x.fill();
    x.strokeStyle='rgba(25,10,3,.75)'; x.lineWidth=Math.max(1,len*.13); x.lineCap='round';
    x.beginPath(); x.moveTo(-len*.8,0); x.bezierCurveTo(-len*.3,-len*.3,len*.3,len*.3,len*.8,0); x.stroke();
    x.restore();
  }
  const tones=[['#8a4a22','#3a1a08'],['#7a3f1c','#2c1305'],['#9a5a2c','#4a230d']];
  function scatter(c, opts){
    const [x,w,h]=fit(c); x.clearRect(0,0,w,h); const r=rnd(opts.seed);
    for(let i=0;i<opts.n;i++){
      let px,py;
      if(opts.zone==='hero'){ px = w*(.28+r()*.5); py = h*(.62+r()*.33); }
      else { px = r()*w; py = r()*h; }
      bean(x,px,py,opts.min+r()*(opts.max-opts.min),r()*Math.PI*2,tones[i%3]);
    }
  }
  function skyline(c){
    const [x,w,h]=fit(c); const r=rnd(7);
    const sky=x.createLinearGradient(0,0,0,h); sky.addColorStop(0,'#f6cf98'); sky.addColorStop(.6,'#eea56a'); sky.addColorStop(1,'#c9733f');
    x.fillStyle=sky; x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,236,200,.9)'; x.beginPath(); x.arc(w*.72,h*.42,Math.min(w,h)*.09,0,Math.PI*2); x.fill();
    // Galata-like tower silhouette (generic stone tower)
    const tx=w*.3, base=h*.78;
    x.fillStyle='#7a4122';
    x.fillRect(tx-14,base-h*.42,28,h*.42);
    x.beginPath(); x.moveTo(tx-18,base-h*.42); x.lineTo(tx,base-h*.55); x.lineTo(tx+18,base-h*.42); x.fill();
    // roofs layers
    [['#8f4c27',.72],['#6e3517',.8],['#4f240e',.9]].forEach(([col,lvl],li)=>{
      x.fillStyle=col; let px=0;
      while(px<w){ const bw=30+r()*60, bh=h*(.06+r()*.12); const y=h*lvl-bh;
        x.fillRect(px,y,bw,h-y);
        x.beginPath(); x.moveTo(px-2,y); x.lineTo(px+bw/2,y-bh*.35); x.lineTo(px+bw+2,y); x.fill();
        if(li>0){ x.fillStyle='rgba(255,214,150,.85)';
          for(let k=0;k<3;k++){ if(r()>.45) x.fillRect(px+8+k*14,y+10+r()*bh*.4,6,8);} x.fillStyle=col; }
        px+=bw+2; }
    });
    // terrace railing foreground
    x.fillStyle='#1f2d57'; x.fillRect(0,h*.9,w,h*.1);
    x.fillRect(0,h*.84,w,5);
    for(let i=0;i<w;i+=18){ x.fillRect(i,h*.84,4,h*.06); }
    // cup on railing
    x.fillStyle='#fbf1e3'; const cx=w*.82, cy=h*.84;
    x.beginPath(); x.moveTo(cx-18,cy-30); x.lineTo(cx+18,cy-30); x.lineTo(cx+13,cy); x.lineTo(cx-13,cy); x.fill();
    x.strokeStyle='#fbf1e3'; x.lineWidth=4; x.beginPath(); x.arc(cx+20,cy-18,7,-1.3,1.3); x.stroke();
  }
  function drawAll(){
    const hb=document.getElementById('beansHero'); if(hb) scatter(hb,{seed:11,n:34,min:5,max:9,zone:'hero'});
    const nb=document.getElementById('beansNews'); if(nb) scatter(nb,{seed:5,n:150,min:10,max:18});
    document.querySelectorAll('.mbeans').forEach((c,i)=>scatter(c,{seed:20+i,n:40,min:7,max:12}));
    const s=document.getElementById('skyline'); if(s){ s.style.width='100%'; s.style.height='100%'; s.style.position='absolute'; s.style.inset='0'; skyline(s); }
  }
  let t; window.addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(drawAll,120)});
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(drawAll)} drawAll();

  const nav=document.getElementById('nav'), tg=document.getElementById('menuToggle');
  tg.addEventListener('click',()=>{const o=nav.classList.toggle('open'); tg.setAttribute('aria-expanded',o)});
  nav.querySelectorAll('ul a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');tg.setAttribute('aria-expanded','false')}));

  document.getElementById('copyPhone').addEventListener('click',e=>{
    const b=e.currentTarget, txt=document.getElementById('phone').textContent;
    const done=()=>{b.textContent='Kopyalandı'; setTimeout(()=>b.textContent='Kopyala',1600)};
    try{ navigator.clipboard.writeText(txt).then(done).catch(sel); }catch(_){ sel(); }
    function sel(){ const r=document.createRange(); r.selectNodeContents(document.getElementById('phone')); const s=getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent='Seçildi'; }
  });

  document.getElementById('newsForm').addEventListener('submit',e=>{
    e.preventDefault(); const i=document.getElementById('email'), m=document.getElementById('newsMsg');
    if(!/^\S+@\S+\.\S+$/.test(i.value.trim())){ m.textContent='Geçerli bir e-posta adresi yazın (ör. ad@ornek.com).'; i.focus(); return; }
    m.textContent='Teşekkürler! Bu demo sayfada kayıt alınmaz; yayına alırken bülten servisinizi bağlayın.'; i.value='';
  });
})();
