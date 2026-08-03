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
window.addEventListener("pointermove",(e)=>{
  const x=(e.clientX/innerWidth-.5)*12;
  const y=(e.clientY/innerHeight-.5)*-12;
  orb.style.transform=`rotateX(${y}deg) rotateY(${x}deg)`;
},{passive:true});
