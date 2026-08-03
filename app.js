const exhibits = [
  {
    title: "The Shape",
    subtitle: "A finite window into infinite geometric recursion.",
    category: "GEOMETRY",
    score: 98.2,
    body: "This exhibit visualizes a recursively transformed field: points become lines, lines become nested structures, and those structures feed their own output back into the next scale. It is not literally the single most complicated possible shape; it is a candidate chosen to represent geometric complexity through self-similarity, non-linearity, density, and scale.",
    stats: { Information: 96, Structure: 99, Computation: 94, Perception: 100 },
    type: "fractal"
  },
  {
    title: "The Color",
    subtitle: "A color that never occupies just one place in color space.",
    category: "PERCEPTION",
    score: 91.4,
    body: "Human color perception is already a compression system. This exhibit continuously moves through hue, saturation, luminance and local contrast so that the experienced color depends on its neighbors and on time. The 'complexity' is perceptual: the object cannot be summarized by a single hexadecimal value.",
    stats: { Information: 84, Structure: 88, Computation: 82, Perception: 99 },
    type: "color"
  },
  {
    title: "The Pattern",
    subtitle: "Order that continually approaches noise without becoming random.",
    category: "INFORMATION",
    score: 95.8,
    body: "Pure repetition is simple. Pure randomness is difficult to compress but contains little reusable structure. Interesting complexity often lives between them. This pattern mixes deterministic waves, recursion, interference and perturbation to occupy that narrow region.",
    stats: { Information: 98, Structure: 97, Computation: 91, Perception: 97 },
    type: "pattern"
  },
  {
    title: "The Number",
    subtitle: "A glimpse of numerical objects too large to write down.",
    category: "MATHEMATICS",
    score: 96.6,
    body: "Some important numbers are not difficult because their digits look unusual, but because their definitions encode gigantic combinatorial spaces. This exhibit represents the idea of a number whose concise definition points toward a quantity that could never be expanded physically within the observable universe.",
    stats: { Information: 89, Structure: 96, Computation: 100, Perception: 97 },
    type: "number"
  },
  {
    title: "The Machine",
    subtitle: "A network whose global behavior cannot be inferred from any one part.",
    category: "COMPUTATION",
    score: 97.3,
    body: "Complex machines become difficult to understand when feedback loops, distributed state and emergent behavior dominate their operation. This synthetic network models a system in which local rules remain simple while global motion becomes difficult to predict.",
    stats: { Information: 97, Structure: 100, Computation: 99, Perception: 93 },
    type: "network"
  },
  {
    title: "The Language",
    subtitle: "A sentence that describes rules for describing itself.",
    category: "LANGUAGE",
    score: 90.7,
    body: "Natural language can create nested references, ambiguity, recursion, context sensitivity and self-description. This exhibit treats language as a dynamic graph, where each concept inherits meaning from the concepts surrounding it.",
    stats: { Information: 91, Structure: 95, Computation: 83, Perception: 94 },
    type: "language"
  }
];

const grid = document.querySelector("#exhibit-grid");

exhibits.forEach((item, index) => {
  const article = document.createElement("article");
  article.className = "exhibit card";
  article.innerHTML = `
    <div class="exhibit-visual"><canvas width="800" height="450"></canvas></div>
    <div class="exhibit-topline"><span>${String(index + 1).padStart(3,"0")} / ${item.category}</span><span>${item.score.toFixed(1)}</span></div>
    <h3>${item.title}</h3>
    <p>${item.subtitle}</p>
  `;
  article.addEventListener("click", () => openExhibit(index));
  grid.appendChild(article);
  animateCanvas(article.querySelector("canvas"), item.type, index * 73);
});

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h, dpr };
}

function animateCanvas(canvas, type, seed = 1) {
  const ctx = canvas.getContext("2d");
  let raf;
  const draw = (time) => {
    const { w, h } = fitCanvas(canvas);
    const t = time * 0.0005 + seed;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = "#08080b";
    ctx.fillRect(0,0,w,h);

    if (type === "fractal") drawFractal(ctx,w,h,t);
    if (type === "color") drawColor(ctx,w,h,t);
    if (type === "pattern") drawPattern(ctx,w,h,t);
    if (type === "number") drawNumber(ctx,w,h,t);
    if (type === "network") drawNetwork(ctx,w,h,t);
    if (type === "language") drawLanguage(ctx,w,h,t);
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(raf);
}

function drawFractal(ctx,w,h,t){
  ctx.save();
  ctx.translate(w/2,h/2);
  const layers = 44;
  for(let i=0;i<layers;i++){
    const p=i/layers, r=p*Math.min(w,h)*.46;
    const sides=5+(i%4);
    ctx.beginPath();
    for(let j=0;j<=sides;j++){
      const a=j/sides*Math.PI*2 + t*(.18+p*.22) + Math.sin(i*.7+t)*.08;
      const rr=r*(.76+.24*Math.sin(j*2.31+i*.42+t));
      const x=Math.cos(a)*rr, y=Math.sin(a)*rr;
      j===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.strokeStyle=`hsla(${190+i*4+t*30},85%,${55+p*22}%,${.12+p*.36})`;
    ctx.lineWidth=1+(1-p)*1.2;
    ctx.stroke();
  }
  ctx.restore();
}
function drawColor(ctx,w,h,t){
  const g=ctx.createLinearGradient(0,0,w,h);
  for(let i=0;i<=12;i++){
    const h1=(i*37+t*90+Math.sin(i+t)*80)%360;
    g.addColorStop(i/12,`hsl(${h1} 92% ${42+20*Math.sin(i*.9+t)}%)`);
  }
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation="screen";
  for(let i=0;i<12;i++){
    const x=w*(.5+.42*Math.sin(t*(.7+i*.02)+i));
    const y=h*(.5+.42*Math.cos(t*(.9+i*.03)+i*1.7));
    const rg=ctx.createRadialGradient(x,y,0,x,y,Math.min(w,h)*.35);
    rg.addColorStop(0,`hsla(${(t*120+i*41)%360},100%,65%,.28)`);
    rg.addColorStop(1,"transparent");
    ctx.fillStyle=rg; ctx.fillRect(0,0,w,h);
  }
  ctx.globalCompositeOperation="source-over";
}
function drawPattern(ctx,w,h,t){
  const step=Math.max(8, Math.min(w,h)/31);
  for(let y=0;y<h;y+=step){
    for(let x=0;x<w;x+=step){
      const v=Math.sin(x*.021+t*3)+Math.cos(y*.026-t*2)+Math.sin((x+y)*.013+t);
      const hue=220+v*38;
      const size=step*(.12+.22*(v+3)/6);
      ctx.fillStyle=`hsla(${hue},85%,68%,${.25+.45*(v+3)/6})`;
      ctx.beginPath(); ctx.arc(x+step/2,y+step/2,size,0,Math.PI*2); ctx.fill();
    }
  }
}
function drawNumber(ctx,w,h,t){
  ctx.font=`${Math.max(10,w/55)}px "Space Mono", monospace`;
  ctx.textBaseline="top";
  const cols=Math.ceil(w/(w/22));
  for(let c=0;c<cols;c++){
    const x=(c/(cols-1))*w;
    const len=9+((c*7)%19);
    const text=Array.from({length:len},(_,i)=>Math.floor(Math.abs(Math.sin(c*11+i*19+t))*10)).join("");
    ctx.save();
    ctx.translate(x,(h/2)+Math.sin(c*.6+t)*h*.3);
    ctx.rotate(Math.sin(c*.22+t)*.35);
    ctx.fillStyle=`hsla(${90+c*8+t*20},90%,70%,${.2+(c%5)*.1})`;
    ctx.fillText(text,0,0);
    ctx.restore();
  }
}
function drawNetwork(ctx,w,h,t){
  const nodes=48;
  const pts=[];
  for(let i=0;i<nodes;i++){
    pts.push({
      x:w*(.5+.43*Math.sin(i*2.399+t*(.07+(i%5)*.01))),
      y:h*(.5+.43*Math.cos(i*1.717-t*(.08+(i%7)*.01)))
    });
  }
  ctx.lineWidth=1;
  for(let i=0;i<nodes;i++){
    for(let j=i+1;j<nodes;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.hypot(dx,dy);
      if(d<Math.min(w,h)*.18){
        ctx.strokeStyle=`rgba(150,175,255,${.22*(1-d/(Math.min(w,h)*.18))})`;
        ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();
      }
    }
  }
  pts.forEach((p,i)=>{
    ctx.fillStyle=`hsl(${190+i*5+t*20} 85% 68%)`;
    ctx.beginPath();ctx.arc(p.x,p.y,2+(i%4),0,Math.PI*2);ctx.fill();
  });
}
function drawLanguage(ctx,w,h,t){
  const words=["SELF","MEANING","IF","THEN","RECURSE","CONTEXT","SYNTAX","OBJECT","REFER","AGAIN","MAP","SIGN"];
  ctx.textAlign="center";
  for(let i=0;i<words.length;i++){
    const a=i/words.length*Math.PI*2+t*.18;
    const r=Math.min(w,h)*(.18+.12*Math.sin(i*.9+t));
    const x=w/2+Math.cos(a)*r*1.7,y=h/2+Math.sin(a)*r;
    ctx.fillStyle=`hsla(${65+i*18},75%,72%,.85)`;
    ctx.font=`${Math.max(10,w/52)}px "Space Mono"`;
    ctx.fillText(words[i],x,y);
    const j=(i*5+3)%words.length;
    const a2=j/words.length*Math.PI*2+t*.18;
    const r2=Math.min(w,h)*(.18+.12*Math.sin(j*.9+t));
    const x2=w/2+Math.cos(a2)*r2*1.7,y2=h/2+Math.sin(a2)*r2;
    ctx.strokeStyle="rgba(255,255,255,.08)";
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();
  }
}

const dialog = document.querySelector("#exhibit-dialog");
const dialogCanvas = document.querySelector("#dialog-canvas");
let stopDialogAnimation = null;
function openExhibit(index){
  const e=exhibits[index];
  document.querySelector("#dialog-index").textContent=`EXHIBIT ${String(index+1).padStart(3,"0")} / ${e.category}`;
  document.querySelector("#dialog-title").textContent=e.title;
  document.querySelector("#dialog-subtitle").textContent=e.subtitle;
  document.querySelector("#dialog-body").textContent=e.body;
  document.querySelector("#dialog-stats").innerHTML=Object.entries(e.stats).map(([k,v])=>`<div class="stat"><span>${k}</span><strong>${v}</strong></div>`).join("");
  dialog.showModal();
  if(stopDialogAnimation) stopDialogAnimation();
  stopDialogAnimation=animateCanvas(dialogCanvas,e.type,index*101);
}
document.querySelector("#dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener("close",()=>{if(stopDialogAnimation) stopDialogAnimation(); stopDialogAnimation=null;});

document.querySelector("#random-exhibit").addEventListener("click",()=>{
  openExhibit(Math.floor(Math.random()*exhibits.length));
});

const pressure=document.querySelector("#pressure");
const pressureValue=document.querySelector("#pressure-value");
pressure.addEventListener("input",()=>pressureValue.textContent=pressure.value);

const namesA=["Recursive","Hyperdimensional","Self-Referential","Entangled","Emergent","Nonlinear","Fractal","Paradoxical"];
const namesB=["Semantic","Chromatic","Topological","Algorithmic","Acoustic","Biomorphic","Symbolic","Probabilistic"];
const namesC=["Polytope","Lattice","Engine","Field","Grammar","Manifold","Organism","Cipher"];

let machineStop=null;
function generate(){
  const a=document.querySelector("#domain-a").value;
  const b=document.querySelector("#domain-b").value;
  const p=Number(pressure.value);
  const seed=Math.random()*1000;
  const title=`${namesA[Math.floor(Math.random()*namesA.length)]} ${namesB[Math.floor(Math.random()*namesB.length)]} ${namesC[Math.floor(Math.random()*namesC.length)]}`;
  const score=Math.min(99.9, 58+p*.38+Math.random()*5);
  document.querySelector("#generated-title").textContent=title;
  document.querySelector("#generated-score").textContent=score.toFixed(1);
  document.querySelector("#generated-kicker").textContent=`SYNTHETIC EXHIBIT ${String(Math.floor(seed)%999).padStart(3,"0")} · ${a.toUpperCase()} × ${b.toUpperCase()}`;
  document.querySelector("#generated-description").textContent=
    `A generated conceptual object combining ${a.toLowerCase()} and ${b.toLowerCase()}. At ${p}% complexity pressure, the system increases recursion, interaction density, ambiguity and feedback until the object becomes difficult to summarize without losing important structure.`;
  const canvas=document.querySelector("#machine-canvas");
  if(machineStop) machineStop();
  const types=["fractal","color","pattern","number","network","language"];
  machineStop=animateCanvas(canvas,types[Math.floor(Math.random()*types.length)],seed);
}
document.querySelector("#generate-object").addEventListener("click",generate);
generate();

const ambient=document.querySelector("#ambient-canvas");
const actx=ambient.getContext("2d");
function drawAmbient(time){
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=innerWidth*dpr,h=innerHeight*dpr;
  if(ambient.width!==w||ambient.height!==h){ambient.width=w;ambient.height=h;}
  actx.clearRect(0,0,w,h);
  for(let i=0;i<70;i++){
    const x=(Math.sin(i*991+time*.00005*(1+i%3))*.5+.5)*w;
    const y=(Math.cos(i*431-time*.00004*(1+i%4))*.5+.5)*h;
    actx.fillStyle=`rgba(255,255,255,${.05+(i%5)*.012})`;
    actx.fillRect(x,y,1.2*dpr,1.2*dpr);
  }
  requestAnimationFrame(drawAmbient);
}
requestAnimationFrame(drawAmbient);

const orb=document.querySelector("#hero-orb");
const orbCtx=orb.getContext("2d");
const orbWrap=orb.closest(".orb-wrap");
const heroComplexity=document.querySelector("#hero-complexity");
let orbPointer={x:0,y:0,tx:0,ty:0,active:false};
let orbLastScoreUpdate=0;

function organicPoint(angle,time,radius,pressure=1){
  const wave=
    Math.sin(angle*3 + time*1.15)*.075 +
    Math.sin(angle*5 - time*.72)*.045 +
    Math.sin(angle*7 + time*.47)*.025 +
    Math.sin(angle*2 - time*.31)*.035;
  const pointerBias=(Math.cos(angle)*orbPointer.x + Math.sin(angle)*orbPointer.y)*.07;
  return radius*(1+(wave*pressure)+pointerBias);
}

function makeBlobPath(ctx,cx,cy,r,time,pressure=1){
  const count=72;
  ctx.beginPath();
  for(let i=0;i<=count;i++){
    const a=(i%count)/count*Math.PI*2;
    const rr=organicPoint(a,time,r,pressure);
    const x=cx+Math.cos(a)*rr;
    const y=cy+Math.sin(a)*rr;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
}

function drawHeroOrb(ms){
  const rect=orb.getBoundingClientRect();
  const dpr=Math.min(devicePixelRatio||1,2);
  const w=Math.max(2,Math.round(rect.width*dpr));
  const h=Math.max(2,Math.round(rect.height*dpr));
  if(orb.width!==w||orb.height!==h){orb.width=w;orb.height=h;}
  const t=ms*.001;
  const cx=w*.5,cy=h*.5,r=Math.min(w,h)*.275;

  orbPointer.x+=(orbPointer.tx-orbPointer.x)*.055;
  orbPointer.y+=(orbPointer.ty-orbPointer.y)*.055;
  orbCtx.clearRect(0,0,w,h);

  // atmospheric glow
  orbCtx.save();
  makeBlobPath(orbCtx,cx,cy,r*1.05,t,.72);
  orbCtx.shadowBlur=r*.48;
  orbCtx.shadowColor=`hsla(${255+Math.sin(t*.35)*45},88%,66%,.48)`;
  orbCtx.fillStyle="rgba(132,89,255,.12)";
  orbCtx.fill();
  orbCtx.restore();

  // Main organic silhouette
  orbCtx.save();
  makeBlobPath(orbCtx,cx,cy,r,t,1);
  orbCtx.clip();

  const bg=orbCtx.createRadialGradient(
    cx-r*.34+orbPointer.x*r*.22,cy-r*.45+orbPointer.y*r*.18,r*.06,
    cx,cy,r*1.3
  );
  bg.addColorStop(0,"rgba(255,255,255,.98)");
  bg.addColorStop(.09,`hsl(${188+Math.sin(t*.44)*24} 96% 76%)`);
  bg.addColorStop(.32,`hsl(${255+Math.sin(t*.31)*36} 91% 65%)`);
  bg.addColorStop(.55,`hsl(${326+Math.sin(t*.38)*28} 92% 66%)`);
  bg.addColorStop(.74,`hsl(${49+Math.sin(t*.27)*35} 97% 68%)`);
  bg.addColorStop(1,`hsl(${158+Math.sin(t*.36)*42} 92% 58%)`);
  orbCtx.fillStyle=bg;
  orbCtx.fillRect(0,0,w,h);

  // Moving internal color bodies
  const lobes=[
    [0.23,0.18,.42,190, .52],
    [0.73,0.28,.48,282, .50],
    [0.67,0.74,.44,332, .44],
    [0.28,0.75,.42,55, .42],
    [0.47,0.50,.32,155, .28]
  ];
  lobes.forEach((l,i)=>{
    const ox=Math.sin(t*(.33+i*.037)+i*1.7)*r*.28;
    const oy=Math.cos(t*(.28+i*.041)+i*2.1)*r*.25;
    const x=w*l[0]+ox, y=h*l[1]+oy;
    const gr=orbCtx.createRadialGradient(x,y,0,x,y,r*l[2]);
    gr.addColorStop(0,`hsla(${l[3]+Math.sin(t*.5+i)*40},100%,68%,${l[4]})`);
    gr.addColorStop(1,`hsla(${l[3]+80},100%,50%,0)`);
    orbCtx.globalCompositeOperation="screen";
    orbCtx.fillStyle=gr;
    orbCtx.fillRect(0,0,w,h);
  });

  // Liquid contour filaments
  orbCtx.globalCompositeOperation="soft-light";
  orbCtx.lineWidth=Math.max(1,dpr*.7);
  for(let j=0;j<9;j++){
    orbCtx.beginPath();
    for(let i=0;i<=80;i++){
      const a=i/80*Math.PI*2;
      const rr=r*(.2+j*.073)+Math.sin(a*(2+j%4)+t*(.55+j*.04)+j)*r*.055;
      const x=cx+Math.cos(a+t*.035*(j%2?1:-1))*rr;
      const y=cy+Math.sin(a+t*.035*(j%2?1:-1))*rr*.92;
      if(i===0)orbCtx.moveTo(x,y);else orbCtx.lineTo(x,y);
    }
    orbCtx.strokeStyle=`hsla(${185+j*23+t*6},100%,88%,${.11+j*.015})`;
    orbCtx.stroke();
  }

  // Specular depth
  orbCtx.globalCompositeOperation="screen";
  const shine=orbCtx.createRadialGradient(cx-r*.4,cy-r*.52,0,cx-r*.32,cy-r*.43,r*.48);
  shine.addColorStop(0,"rgba(255,255,255,.88)");
  shine.addColorStop(.12,"rgba(255,255,255,.32)");
  shine.addColorStop(.52,"rgba(255,255,255,.04)");
  shine.addColorStop(1,"rgba(255,255,255,0)");
  orbCtx.fillStyle=shine; orbCtx.fillRect(0,0,w,h);

  const shade=orbCtx.createRadialGradient(cx+r*.36,cy+r*.48,0,cx+r*.25,cy+r*.3,r*.72);
  shade.addColorStop(0,"rgba(0,0,12,.42)");
  shade.addColorStop(1,"rgba(0,0,0,0)");
  orbCtx.globalCompositeOperation="multiply";
  orbCtx.fillStyle=shade;orbCtx.fillRect(0,0,w,h);
  orbCtx.restore();

  // Glass rim
  orbCtx.save();
  makeBlobPath(orbCtx,cx,cy,r,t,1);
  orbCtx.lineWidth=Math.max(1.2,dpr);
  const rim=orbCtx.createLinearGradient(cx-r,cy-r,cx+r,cy+r);
  rim.addColorStop(0,"rgba(255,255,255,.72)");
  rim.addColorStop(.32,"rgba(255,255,255,.06)");
  rim.addColorStop(.72,"rgba(255,255,255,.2)");
  rim.addColorStop(1,"rgba(255,255,255,.56)");
  orbCtx.strokeStyle=rim;
  orbCtx.stroke();
  orbCtx.restore();

  // Wide generative particle field: dots drift on independent elliptical paths
  // rather than following visible orbital rings. The larger canvas keeps the
  // full particle choreography in view instead of clipping it at the orb edge.
  for(let i=0;i<22;i++){
    const phase=i*2.399;
    const speed=.075+(i%5)*.014;
    const a=t*speed+phase;
    const band=1.24+(i%6)*.105;
    const wobble=1+Math.sin(t*.21+i*1.73)*.07;
    const rr=r*band*wobble;
    const squash=.54+(i%4)*.075;
    const driftX=Math.sin(t*.11+i)*r*.065;
    const driftY=Math.cos(t*.09+i*1.4)*r*.05;
    const px=cx+Math.cos(a)*rr+driftX;
    const py=cy+Math.sin(a)*rr*squash+driftY;
    const depth=(Math.sin(a)+1)*.5;
    const s=(1.05+(i%4)*.48+depth*.7)*dpr;
    const alpha=.20+depth*.34+(i%3)*.035;
    orbCtx.save();
    orbCtx.shadowBlur=(5+depth*9)*dpr;
    orbCtx.shadowColor=`hsla(${178+i*23+t*7},96%,72%,${alpha*.8})`;
    orbCtx.beginPath();orbCtx.arc(px,py,s,0,Math.PI*2);
    orbCtx.fillStyle=`hsla(${178+i*23+t*7},96%,76%,${alpha})`;
    orbCtx.fill();
    if(i%5===0){
      orbCtx.beginPath();
      orbCtx.arc(px,py,s*2.8,0,Math.PI*2);
      orbCtx.fillStyle=`hsla(${190+i*19},95%,70%,.035)`;
      orbCtx.fill();
    }
    orbCtx.restore();
  }

  const tiltX=orbPointer.y*-7;
  const tiltY=orbPointer.x*8;
  orb.style.transform=`rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${1+Math.sin(t*.72)*.018})`;

  if(ms-orbLastScoreUpdate>900){
    const score=94.7+Math.sin(t*.41)*1.7+Math.sin(t*.13)*.8;
    heroComplexity.textContent=`${score.toFixed(1)} / 100`;
    orbLastScoreUpdate=ms;
  }
  requestAnimationFrame(drawHeroOrb);
}
requestAnimationFrame(drawHeroOrb);

orbWrap.addEventListener("pointermove",(e)=>{
  const r=orbWrap.getBoundingClientRect();
  orbPointer.tx=((e.clientX-r.left)/r.width-.5)*2;
  orbPointer.ty=((e.clientY-r.top)/r.height-.5)*2;
  orbPointer.active=true;
},{passive:true});
orbWrap.addEventListener("pointerleave",()=>{
  orbPointer.tx=0;orbPointer.ty=0;orbPointer.active=false;
},{passive:true});
