/* =========================================================
   Boris Djiogho, Portfolio-Spielwelt / portfolio game world
   Engine komplett selbst geschrieben. Grafiken: eigene
   Codezeichnung als Fallback, Sprites aus dem "Pixel Crawler
   Free Pack" von Anokolisa (frei nutzbar, Credit erwünscht).
   ========================================================= */
(function(){
"use strict";

/* ---------- Sprache ---------- */
let sprache = null;
try{ sprache = localStorage.getItem("bd-sprache"); }catch(e){}
sprache = sprache
  || ((navigator.language||"en").toLowerCase().startsWith("de") ? "de" : "en");

const UI = {
  de:{
    sub:"Wirtschaftsinformatik · KI · Operations Research<br>Portfolio",
    tag:"EINE REISE VON DOUALA NACH FREIBURG",
    escape:'Keine Zeit zu erkunden? <a href="portfolio-de.html">Klassisches Portfolio →</a>',
    hilfe:"Pfeiltasten / WASD: laufen · Stationen betreten öffnet die Karte · ENTER schließt · Grüne Marker = Engagement · Sammle alle Stationen!",
    klassisch:"Klassische Ansicht", klassischHref:"portfolio-de.html",
    weiter:"WEITER [ENTER]",
    zaehler:(n,g)=>"STATIONEN "+n+" / "+g,
    fertig:(g)=>"ALLE "+g+" STATIONEN!",
    finaleOrt:"Geschafft!", finaleTitel:"Danke fürs Erkunden!",
    finaleHtml:(g)=>"<p>Du hast alle "+g+" Stationen meiner Reise entdeckt, von Douala bis Freiburg. Genau so arbeite ich auch: neugierig, gründlich und mit Freude am Weg.</p>"+
      "<p>Lass uns in Kontakt kommen:</p>"+
      "<p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br>"+
      "<a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br>"+
      "<a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br>"+
      "<a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank'>Lebenslauf (PDF)</a><br>"+
      "<a href='portfolio-de.html'>Zur klassischen Ansicht</a></p>",
    toggle:"EN",
  },
  en:{
    sub:"Business Informatics · AI · Operations Research<br>Portfolio",
    tag:"A JOURNEY FROM DOUALA TO FREIBURG",
    escape:'No time to explore? <a href="portfolio-en.html">Classic portfolio →</a>',
    hilfe:"Arrow keys / WASD: walk · Enter a station to open its card · ENTER closes · Green markers = community work · Collect all stations!",
    klassisch:"Classic view", klassischHref:"portfolio-en.html",
    weiter:"CONTINUE [ENTER]",
    zaehler:(n,g)=>"STATIONS "+n+" / "+g,
    fertig:(g)=>"ALL "+g+" STATIONS!",
    finaleOrt:"Well done!", finaleTitel:"Thanks for exploring!",
    finaleHtml:(g)=>"<p>You found all "+g+" stations of my journey, from Douala to Freiburg. That is how I work, too: curious, thorough and enjoying the road.</p>"+
      "<p>Let's get in touch:</p>"+
      "<p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br>"+
      "<a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br>"+
      "<a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br>"+
      "<a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank'>Resume (PDF)</a><br>"+
      "<a href='portfolio-en.html'>Classic view</a></p>",
    toggle:"DE",
  },
};
const T = ()=>UI[sprache];

/* ---------- Grundlagen ---------- */
const TILE = 16;
const W = 48, H = 34;
const canvas = document.getElementById("spiel");
const ctx = canvas.getContext("2d");
let SCALE = 3;

function passeGroesseAn(){
  SCALE = window.innerWidth < 700 ? 2 : 3;
  canvas.width  = Math.ceil(window.innerWidth  / SCALE);
  canvas.height = Math.ceil(window.innerHeight / SCALE);
  canvas.style.width  = canvas.width  * SCALE + "px";
  canvas.style.height = canvas.height * SCALE + "px";
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener("resize", passeGroesseAn);
passeGroesseAn();

/* ---------- Sprite-Atlas (Pixel Crawler von Anokolisa) ----------
   Lädt asynchron; bis dahin (oder wenn er fehlt) zeichnet die
   Engine alles wie bisher selbst. */
const atlasBild = new Image();
let atlasMeta = null;
let atlasBereit = false;
fetch("assets/spiel/atlas.json")
  .then(r => r.ok ? r.json() : null)
  .then(meta => {
    if(!meta) return;
    atlasBild.onload = () => { atlasMeta = meta; atlasBereit = true; };
    atlasBild.src = "assets/spiel/atlas.png";
  })
  .catch(()=>{});

/* Kachelt eine 16x16-Atlas-Textur über ein Rechteck (für Böden und Gebäude) */
function fuelleTextur(name, x, y, w, h){
  const frames = atlasMeta[name];
  if(!frames) return false;
  const f = frames[0];
  const x0 = Math.round(x), y0 = Math.round(y);
  for(let yy=0; yy<h; yy+=16){
    const th = Math.min(16, h-yy);
    for(let xx=0; xx<w; xx+=16){
      const tw = Math.min(16, w-xx);
      ctx.drawImage(atlasBild, f[0], f[1], tw, th, x0+xx, y0+yy, tw, th);
    }
  }
  return true;
}

/* Anker = Fußpunkt (Mitte unten). flip spiegelt horizontal um den Anker. */
function zeichneSprite(name, frame, ax, ay, flip){
  const frames = atlasMeta[name];
  if(!frames) return;
  const f = frames[frame % frames.length];
  const dx = Math.round(ax), dy = Math.round(ay);
  if(flip){
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(atlasBild, f[0], f[1], f[2], f[3], -(f[4]+f[2]), f[5], f[2], f[3]);
    ctx.restore();
  } else {
    ctx.drawImage(atlasBild, f[0], f[1], f[2], f[3], dx+f[4], dy+f[5], f[2], f[3]);
  }
}

/* ---------- Kacheln ---------- */
const GRAS=0, GRAS2=1, SAND=2, PLAZA=3, WEG=4, WASSER=5, BAUM=6, PALME=7, BLUME=8, TANNE=9, SCHNEE=10;
const SOLID = new Set([WASSER, BAUM, PALME, TANNE]);

/* Oberharz-Schneezone rund um TU und Kirche */
function imSchnee(tx,ty){ return tx>=19 && tx<=35 && ty>=6 && ty<=17; }

const karte = new Array(W*H).fill(GRAS);
const at  = (x,y)=> karte[y*W+x];
const set = (x,y,t)=>{ if(x>=0&&x<W&&y>=0&&y<H) karte[y*W+x]=t; };
function rect(x,y,w,h,t){ for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) set(i,j,t); }
/* nur: optionale Liste von Kacheltypen, die überschrieben werden dürfen.
   Verhindert, dass Streu-Deko Wege, Plaza oder Wasser durchlöchert. */
function streu(x,y,w,h,t,anzahl,rnd,nur){
  for(let n=0;n<anzahl;n++){
    const gx = x+Math.floor(rnd()*w), gy = y+Math.floor(rnd()*h);
    if(!nur || nur.includes(at(gx,gy))) set(gx,gy,t);
  }
}

let seed = 7;
const rnd = ()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };

/* ---------- Weltaufbau ---------- */
rect(0,0,3,H,WASSER); rect(0,H-3,16,3,WASSER);
rect(3,22,14,9,SAND);
streu(4,23,12,7,PALME,7,rnd,[SAND]);
rect(5,3,15,9,PLAZA);
rect(20,7,16,15,GRAS);
streu(20,7,16,4,TANNE,18,rnd,[GRAS,GRAS2]);
streu(20,17,16,5,TANNE,14,rnd,[GRAS,GRAS2]);
streu(21,11,3,6,TANNE,6,rnd,[GRAS,GRAS2]);
rect(30,14,4,3,WASSER);
rect(37,22,9,8,GRAS2);
rect(36,3,10,9,PLAZA);
rect(20,25,14,7,GRAS);
rect(11,10,2,14,WEG);
rect(11,22,2,3,WEG);
rect(13,16,14,2,WEG);
rect(25,12,2,14,WEG);
rect(27,16,14,2,WEG);
rect(39,10,2,8,WEG);
rect(39,18,2,6,WEG);
rect(13,6,10,2,WEG);
rect(20,6,22,2,WEG);
streu(13,12,10,10,BLUME,8,rnd,[GRAS,GRAS2]);
streu(36,12,8,8,BLUME,5,rnd,[GRAS,GRAS2]);
streu(4,4,40,26,GRAS2,60,rnd,[GRAS]);
[[15,13],[19,20],[34,24],[43,20]].forEach(([bx,by])=>set(bx,by,BAUM));

/* Oberharz: Schnee statt Wiese (Bäume bleiben stehen und werden gefroren gezeichnet) */
for(let sy=6; sy<=17; sy++)
  for(let sxx=19; sxx<=35; sxx++){
    const t = at(sxx,sy);
    if(t===GRAS || t===GRAS2 || t===BLUME) set(sxx,sy,SCHNEE);
  }

/* Littoral: mehr Tropenbäume am Strand von Douala */
[[4,26],[9,26],[15,27],[6,30],[14,30],[16,24]].forEach(([px,py])=>{
  if(at(px,py)===SAND) set(px,py,PALME);
});

/* Lagerfeuer (Deko, aber solide: man läuft nicht durchs Feuer).
   Das zweite brennt auf dem Engagement-Platz, wo gefeiert wird. */
const feuerstellen = [[6,23],[33,22]];
const feuerSolid = new Set(feuerstellen.map(([fx,fy]) => fy*W+fx));

/* ---------- Gebäude ---------- */
const gebaeude = [
  {x:6, y:24, w:3,h:2, koerper:"#e8e3d8", dach:"#3f7d4e", schild:"+"},
  {x:12,y:24, w:3,h:2, koerper:"#d9c9a3", dach:"#a3552f", schild:"U"},
  {x:7, y:5,  w:3,h:2, koerper:"#e8d478", dach:"#c2543a", schild:"K"},
  {x:14,y:5,  w:4,h:2, koerper:"#9db4d0", dach:"#2f3c56", schild:"M"},
  {x:26,y:9,  w:4,h:2, koerper:"#cfd4dc", dach:"#5a3f30", schild:"TU"},
  {x:22,y:13, w:3,h:2, koerper:"#f0f0f4", dach:"#7a4f9e", schild:"AR"},
  {x:15,y:19, w:4,h:2, koerper:"#8f9aa8", dach:"#4a525e", schild:"D"},
  {x:40,y:24, w:3,h:2, koerper:"#c0392b", dach:"#8e1e12", schild:"中"},
  {x:38,y:5,  w:2,h:3, koerper:"#a0522d", dach:"#6e3a1e", schild:"FR"},
  {x:31,y:8,  w:2,h:2, koerper:"#6b90b8", dach:"#2f3c56", schild:"", turm:true},
  {x:42,y:6,  w:3,h:2, koerper:"#e8e3d8", dach:"#c2543a", schild:"BD"},
  {x:36,y:9,  w:2,h:2, koerper:"#bfe6cd", dach:"#2f7d4e", schild:"RE"},
  {x:21,y:26, w:2,h:2, koerper:"#d8dce6", dach:"#f5b301", schild:"1"},
  {x:24,y:26, w:2,h:2, koerper:"#d8dce6", dach:"#4cd07d", schild:"2"},
  {x:27,y:26, w:2,h:2, koerper:"#d8dce6", dach:"#e2574c", schild:"3"},
  {x:30,y:26, w:2,h:2, koerper:"#d8dce6", dach:"#7a4f9e", schild:"4"},
  {x:31,y:19, w:3,h:2, koerper:"#e8d478", dach:"#3f7d4e", schild:"MM"},
  {x:21,y:29, w:2,h:2, koerper:"#d8dce6", dach:"#08abd4", schild:"5"},
  {x:24,y:29, w:2,h:2, koerper:"#d8dce6", dach:"#c2543a", schild:"6"},
];
function gebaeudeSolid(px,py){
  return gebaeude.some(g => px>=g.x && px<g.x+g.w && py>=g.y && py<g.y+g.h);
}
/* Kein Baum darf unter oder aus einem Gebäude wachsen */
gebaeude.forEach(g=>{
  for(let j=g.y;j<g.y+g.h;j++)
    for(let i=g.x;i<g.x+g.w;i++){
      const t = at(i,j);
      if(t===TANNE || t===BAUM || t===PALME) set(i,j,GRAS);
    }
});

/* ---------- Deko (nicht solide) ---------- */
const baenke   = [[9,10],[17,10],[38,11],[43,11],[28,18],[30,22],[34,21]];
const laternen = [[11,14],[11,20],[26,14],[26,22],[39,13],[39,20],[21,17],[33,17]];
/* Vegetation und Steine aus dem Atlas, machen die Welt einheitlicher */
const straeucher = [[7,14,"busch1"],[9,19,"busch2"],[18,13,"busch1"],[23,23,"busch2"],
  [35,13,"busch1"],[42,12,"busch2"],[44,22,"busch1"],[19,30,"busch2"],[34,27,"busch1"],
  [22,9,"farn"],[30,9,"farn"],[34,22,"farn"],[24,19,"farn"],
  [5,29,"stein1"],[10,24,"stein3"],[15,29,"stein2"],[29,17,"stein3"],
  [36,15,"stein1"],[44,17,"stein3"],[21,24,"stein2"]];
/* Wegweiser zu den drei Vierteln plus Projekte-Dorf, zweisprachig */
const wegweiser = [
  {x:13, y:12, text:{de:"BERUF",      en:"CAREER"}},
  {x:27, y:25, text:{de:"PROJEKTE",   en:"PROJECTS"}},
  {x:27, y:20, text:{de:"ENGAGEMENT", en:"COMMUNITY"}},
  {x:10, y:21, text:{de:"MEIN WEG",   en:"MY JOURNEY"}},
];

/* Große Büsche, große Felsen und Wegweiser sind solide */
const dekoSolid = new Set();
straeucher.forEach(([bx,by,name])=>{
  if(name==="busch1"||name==="busch2"||name==="stein1"||name==="stein2")
    dekoSolid.add(by*W+bx);
});
wegweiser.forEach(w=>dekoSolid.add(w.y*W+w.x));

/* ---------- NPCs ---------- */
const npcFarben = [
  {hemd:"#e2a1a1", haut:"#8d5524", haar:"#2b1b10"},
  {hemd:"#a1c8e2", haut:"#c68642", haar:"#3d2314"},
  {hemd:"#b8e2a1", haut:"#e0ac69", haar:"#1a1a1a"},
  {hemd:"#e2d3a1", haut:"#6b4226", haar:"#0f0a05"},
];
const npcs = [
  {x:10*TILE, y:6*TILE,  dir:[1,0],  t:0, f:0, sprite:"npc_knight", name:"Lea",
   zeile:{de:"Nicht vergessen: StuPa-Sitzung heute um 18 Uhr! Wir brauchen deine Stimme.",
          en:"Don't forget: student parliament meeting today at 6 pm! We need your vote."}},
  {x:40*TILE, y:7*TILE,  dir:[0,1],  t:0, f:1, sprite:"npc_tavern_a", name:"Tom",
   zeile:{de:"Wir gehen am Wochenende zum Weinfest in der Freiburger Altstadt. Kommst du mit?",
          en:"We are going to the wine festival in Freiburg's old town this weekend. Want to join?"}},
  {x:29*TILE, y:22*TILE, dir:[-1,0], t:0, f:2, sprite:"npc_peasant", name:"Amina",
   zeile:{de:"Samstag ist kamerunischer Abend im Mokele Mbembe. Das ganze CSK kommt!",
          en:"Saturday is Cameroonian night at Mokele Mbembe. The whole CSK crew is coming!"}},
  {x:31*TILE, y:22*TILE, dir:[0,-1], t:0, f:3, sprite:"npc_tavern_a", name:"Fatou",
   zeile:{de:"Das Kulturfest war großartig, Präsident! Ohne deine Sponsoren wäre daraus nichts geworden.",
          en:"The culture festival was amazing, President! Without your sponsors it would never have happened."}},
  {x:30*TILE, y:20*TILE, dir:[1,0],  t:0, f:1, sprite:"npc_tavern_b", name:"David",
   zeile:{de:"Danke für die Studienberatung beim CSK! Ohne dein Mentoring hätte ich mich nie beworben.",
          en:"Thanks for the CSK study guidance! Without your mentoring I would never have applied."}},
  {x:8*TILE,  y:29*TILE, dir:[0,-1], t:0, f:3, sprite:"npc_tavern_b", name:"Michel",
   zeile:{de:"Wir kochen morgen zusammen Ndole. Du bringst die Kochbananen mit, ja?",
          en:"We are cooking ndole together tomorrow. You bring the plantains, right?"}},
  {x:26*TILE, y:15*TILE, dir:[0,1],  t:0, f:1, sprite:"npc_wizzard", name:"Jonas",
   zeile:{de:"Nach der Vorlesung Kaffee in der Bibliothek? Ich muss dir was zu Gurobi zeigen.",
          en:"Coffee at the library after the lecture? I have to show you something about Gurobi."}},
  {x:25*TILE, y:20*TILE, dir:[1,0],  t:0, f:0, sprite:"npc_rogue", name:"Karla",
   zeile:{de:"Lust auf eine Wanderung am Wochenende? Der Wald ruft, wie damals im Oberharz!",
          en:"Fancy a hike this weekend? The forest is calling, just like back in the Harz!"}},
];
window.__npcs = npcs;   // Debug-Zugriff
function npcBlockiert(px,py){
  const punkte = [[px,py],[px+10,py],[px,py+12],[px+10,py+12]];
  return punkte.some(([qx,qy])=>{
    const tx = Math.floor(qx/TILE), ty = Math.floor(qy/TILE);
    if(tx<0||tx>=W||ty<0||ty>=H) return true;
    return SOLID.has(at(tx,ty)) || gebaeudeSolid(tx,ty) || feuerSolid.has(ty*W+tx) || dekoSolid.has(ty*W+tx);
  });
}
function bewegeNpcs(){
  npcs.forEach(n=>{
    if(n===aktiverNpc){ n.dir=[0,0]; return; }   // spricht gerade
    n.t--;
    if(n.t<=0){
      const optionen = [[1,0],[-1,0],[0,1],[0,-1],[0,0],[0,0]];
      n.dir = optionen[Math.floor(Math.random()*optionen.length)];
      n.t = 60 + Math.random()*120;
    }
    const nx = n.x + n.dir[0]*0.6, ny = n.y + n.dir[1]*0.6;
    if(!npcBlockiert(nx,ny)){ n.x=nx; n.y=ny; } else n.t=0;
  });
}

/* ---------- Stationen (zweisprachig) ---------- */
const stationen = [
  {key:"apotheke", x:7, y:27,
   ort:{de:"Douala · 2015 bis 2017", en:"Douala · 2015 to 2017"},
   titel:{de:"Apotheken-Assistent", en:"Pharmacy assistant"},
   html:{
    de:"<p>Zweieinhalb Jahre in der <b>Pharmacie du Marché</b> in Douala, mein erster Job, mitten im Viertel. Hier lernte ich, was Verantwortung heißt: Menschen beraten, Vertrauen aufbauen, genau arbeiten.</p><p>Damals war mein Traum, <b>Medizin</b> zu studieren.</p>",
    en:"<p>Two and a half years at the <b>Pharmacie du Marché</b> in Douala, my first job, right in the neighborhood. This is where I learned what responsibility means: advising people, building trust, working precisely.</p><p>Back then my dream was to study <b>medicine</b>.</p>"}},
  {key:"bio", x:13,y:27,
   ort:{de:"Douala · 2016 bis 2017", en:"Douala · 2016 to 2017"},
   titel:{de:"Biologie und Deutsch", en:"Biology and German"},
   html:{
    de:"<p>Biologie-Studium an der <b>Université de Douala</b> und parallel Deutschkurse am Sprachlernzentrum. Zwei Gleise, ein Ziel: raus in die Welt.</p><p>Der Medizin-Traum platzte später in Deutschland. Aber das Thema Gesundheit sollte zurückkommen.</p>",
    en:"<p>Biology studies at the <b>Université de Douala</b> and German classes at the language center on the side. Two tracks, one goal: out into the world.</p><p>The medical school dream later fell through in Germany. But healthcare would come back.</p>"}},
  {key:"berlin", x:8, y:8,
   ort:{de:"Berlin · Nov. 2017", en:"Berlin · Nov. 2017"},
   titel:{de:"Ankunft in Deutschland", en:"Arriving in Germany"},
   html:{
    de:"<p>Neustart in Berlin, wo ein Teil meiner Familie lebt. Neben der Sprachvorbereitung habe ich <b>ehrenamtlich im Kindergarten</b> mitgearbeitet, meine erste Schule für Kommunikation auf Deutsch.</p><p>2018 folgte die Sprachausbildung und eine Entscheidung, die alles änderte: der Oberharz.</p>",
    en:"<p>A fresh start in Berlin, where part of my family lives. Alongside language preparation I <b>volunteered at a kindergarten</b>, my first school of communication in German.</p><p>In 2018 came language school and a decision that changed everything: the Harz mountains.</p>"}},
  {key:"mazars", x:15,y:8,
   ort:{de:"Berlin/Remote · 2022 bis 2026", en:"Berlin/remote · 2022 to 2026"},
   titel:{de:"Forvis Mazars, Digital Solutions", en:"Forvis Mazars, Digital Solutions"},
   html:{
    de:"<p><b>Fast vier Jahre Werkstudent</b>: Geschäftsanwendungen auf Low-Code-Plattformen, Anforderungsanalyse mit Fachbereichen, Coaching von Citizen Developern.</p><p>Hier habe ich mein Handwerk gelernt: <b>zwischen Business und IT übersetzen</b>.</p>",
    en:"<p><b>Almost four years as a working student</b>: business applications on low-code platforms, requirements analysis with business departments, coaching citizen developers.</p><p>This is where I learned my craft: <b>translating between business and IT</b>.</p>"}},
  {key:"tu", x:27,y:12,
   ort:{de:"Clausthal-Zellerfeld · 2018 bis 2026", en:"Clausthal-Zellerfeld · 2018 to 2026"},
   titel:{de:"TU Clausthal, meine Uni", en:"TU Clausthal, my university"},
   html:{
    de:"<p>Wald, eine kleine familiäre Uni, herzliche Menschen. Der Oberharz ließ mich nicht mehr los.</p><p><b>B.Sc. Wirtschaftsinformatik</b>, dann <b>M.Sc. Wirtschaftsinformatik</b> und parallel <b>B.Sc. Digitales Management</b>. Masterarbeit über die Tourenplanung für Elektrofahrzeuge.</p>",
    en:"<p>Forest, a small close-knit university, warm-hearted people. The Upper Harz never let go of me.</p><p><b>B.Sc. in Business Informatics</b>, then an <b>M.Sc. in Business Informatics</b> with a parallel <b>B.Sc. in Digital Management</b>. Master's thesis on route planning for electric vehicles.</p>"}},
  {key:"pflegebrille", x:23,y:16,
   ort:{de:"TU Clausthal · 2021 bis 2022", en:"TU Clausthal · 2021 to 2022"},
   titel:{de:"Lehrstuhl Human-Centered Information Systems", en:"Chair of Human-Centered Information Systems"},
   html:{
    de:"<p>Im Projekt <b>Pflegebrille</b> (AR-Brillen für die Pflege) habe ich an Workflows und der nutzerfreundlichen Darstellung von Patienteninformationen mitgewirkt und die <b>Nutzungsdaten aus Pflegeheimen</b> eigenständig analysiert, mit einem selbst konzipierten Dashboard.</p><p>Daneben entwickelte ich <b>Android-Apps für Seminare und Roboter-Experimente</b>. Die Kommunikation mit den Robotern lief über MQTT.</p>",
    en:"<p>In the <b>Pflegebrille</b> project (AR glasses for nursing care) I worked on workflows and the user-friendly presentation of patient information, and independently analyzed <b>usage data from nursing homes</b> in a purpose-built dashboard.</p><p>On the side I developed <b>Android apps for seminars and robot experiments</b>, with robot communication via MQTT.</p>"}},
  {key:"daimler", x:16,y:22,
   ort:{de:"Rastatt · Sommer 2019", en:"Rastatt · summer 2019"},
   titel:{de:"Daimler, am Fließband", en:"Daimler, on the assembly line"},
   html:{
    de:"<p>Zwei Monate Ferienarbeit in der Produktion. Kurz, aber prägend: Seitdem weiß ich, wie Fertigung wirklich funktioniert und was <b>Prozessoptimierung</b> am Band konkret bedeutet.</p>",
    en:"<p>Two months of summer work in production. Short but formative: it taught me how manufacturing really works and what <b>process optimization</b> means on the line.</p>"}},
  {key:"chengdu", x:41,y:27,
   ort:{de:"Chengdu · Sommer 2024", en:"Chengdu · summer 2024"},
   titel:{de:"Sichuan University", en:"Sichuan University"},
   html:{
    de:"<p>Sommerschule in China: Wirtschaft, Sprache und vor allem <b>interkulturelle Erfahrung</b>. Nach Kamerun, Deutschland und Frankreich mein viertes kulturelles Zuhause auf Zeit.</p>",
    en:"<p>Summer school in China: business, language and above all <b>intercultural experience</b>. After Cameroon, Germany and France my fourth cultural home for a while.</p>"}},
  {key:"nachhaltigkeit", x:37,y:12, gruen:true,
   ort:{de:"Roter Faden", en:"Common thread"},
   titel:{de:"Nachhaltigkeit", en:"Sustainability"},
   html:{
    de:"<p><b>Der Antrieb:</b> E-Schrott-Kippen in Afrika, auf denen Kinder, statt zur Schule zu gehen, nach Metallen suchen.</p><p><b>Bachelorarbeit:</b> Rückgabe von Elektroaltgeräten in Deutschland, quantitativ analysiert.</p><p><b>Masterarbeit:</b> Tourenplanung für Elektrofahrzeuge. E-Mobilität soll nicht nur sauber sein, sondern auch effizient.</p>",
    en:"<p><b>The motivation:</b> e-waste dumps in Africa, where children search for metals instead of going to school.</p><p><b>Bachelor's thesis:</b> a quantitative analysis of e-waste return options in Germany.</p><p><b>Master's thesis:</b> route planning for electric vehicles. E-mobility should be efficient, not just clean.</p>"}},
  {key:"freiburg", x:39,y:9,
   ort:{de:"Freiburg · seit 2026", en:"Freiburg · since 2026"},
   titel:{de:"Angekommen im Breisgau", en:"Home in the Breisgau"},
   html:{
    de:"<p>Schon aus Clausthaler Zeiten kannte und liebte ich Freiburg: Schwarzwald vor der Tür, Sonne, Lebensfreude. <b>2026 bin ich ganz hierhergezogen.</b></p><p>Hier beginnt das nächste Kapitel: der Berufseinstieg an der Schnittstelle von KI, Daten und Geschäftsprozessen.</p>",
    en:"<p>I knew and loved Freiburg from my Clausthal years: the Black Forest on my doorstep, sunshine, joie de vivre. <b>In 2026 I moved here for good.</b></p><p>This is where the next chapter begins: starting my career at the intersection of AI, data and business processes.</p>"}},
  {key:"kontakt", x:43,y:9,
   ort:{de:"Freiburg", en:"Freiburg"},
   titel:{de:"Kontakt", en:"Contact"},
   html:{
    de:"<p>Ich freue mich über Nachrichten, ob Jobangebot, Projekt oder einfach ein Hallo.</p><p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br><a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br><a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br><a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank'>Lebenslauf (PDF)</a></p>",
    en:"<p>Whether it is a job opportunity, a project or just a hello, I would love to hear from you.</p><p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br><a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br><a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br><a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank'>Resume (PDF)</a></p>"}},
  {key:"oberharz", x:21,y:7,
   ort:{de:"Oberharz · 2018", en:"Harz mountains · 2018"},
   titel:{de:"Der Wald ruft", en:"The forest calls"},
   html:{
    de:"<p>Nach der Sprachschule zog es mich nach <b>Clausthal-Zellerfeld</b>, obwohl Berlin gerufen hätte. Manchmal trifft man die besten Entscheidungen mit dem Bauch.</p>",
    en:"<p>After language school I moved to <b>Clausthal-Zellerfeld</b>, even though Berlin was calling. Sometimes the best decisions are gut decisions.</p>"}},
  /* Projekte-Dorf */
  {key:"p1", x:22,y:28,
   ort:{de:"Projekte-Dorf · Haus 1", en:"Project village · house 1"},
   titel:{de:"LV2CAD", en:"LV2CAD"},
   html:{
    de:"<p>Bau-Leistungsverzeichnisse von Hand in CAD zu übertragen kostet Stunden. LV2CAD nimmt diese Arbeit ab: Eine KI (Mistral, EU-gehostet) liest die Parameter aus dem Dokument, eine deterministische Python-Pipeline erzeugt daraus fertigungsreife CAD-Dateien.</p><p>Stack: Python, FastAPI, React.<br><a href='https://github.com/Boris-djiogho/lv2cad' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Transferring construction tender documents into CAD by hand takes hours. LV2CAD does the job: an AI (Mistral, EU-hosted) reads the parameters from the document, a deterministic Python pipeline turns them into production-ready CAD files.</p><p>Stack: Python, FastAPI, React.<br><a href='https://github.com/Boris-djiogho/lv2cad' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p2", x:25,y:28,
   ort:{de:"Projekte-Dorf · Haus 2", en:"Project village · house 2"},
   titel:{de:"Kurare (HealthHack 2026)", en:"Kurare (HealthHack 2026)"},
   html:{
    de:"<p>Internationale Pflegeschüler:innen müssen Fachwissen und Sprache gleichzeitig lernen. Kurare hilft beim Üben: per Voice-to-Voice-Dialog mit einer KI, mit Einstufungstest und Fortschritts-Dashboard. Entstanden in einem Hackathon-Wochenende, vom Konzept bis zur Demo.</p><p>Stack: Flask, LLM-APIs, Qdrant.<br><a href='https://github.com/Boris-djiogho/kurare-healthhack-2026' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>International nursing students have to learn technical knowledge and language at the same time. Kurare helps them practice: in voice-to-voice dialogue with an AI, with a placement test and a progress dashboard. Built in one hackathon weekend, from concept to demo.</p><p>Stack: Flask, LLM APIs, Qdrant.<br><a href='https://github.com/Boris-djiogho/kurare-healthhack-2026' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p3", x:28,y:28,
   ort:{de:"Projekte-Dorf · Haus 3", en:"Project village · house 3"},
   titel:{de:"Masterarbeit: E-Auto-Routing", en:"Master's thesis: EV routing"},
   html:{
    de:"<p>Wie plant man Touren für Elektro-Lieferfahrzeuge, wenn Laden nicht linear verläuft und die Beladung den Verbrauch verändert? Meine Antwort: ein MILP-Modell, exakt gelöst mit Gurobi, plus eine selbst entwickelte ALNS-Metaheuristik für große Instanzen.</p><p>Stack: Python, Gurobi.<br><a href='https://github.com/Boris-djiogho/evrp-spd-thesis' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>How do you plan routes for electric delivery vehicles when charging is nonlinear and the load changes consumption? My answer: a MILP model, solved exactly with Gurobi, plus a custom ALNS metaheuristic for large instances.</p><p>Stack: Python, Gurobi.<br><a href='https://github.com/Boris-djiogho/evrp-spd-thesis' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p4", x:31,y:28,
   ort:{de:"Projekte-Dorf · Haus 4", en:"Project village · house 4"},
   titel:{de:"LLM-Datenpipeline", en:"LLM data pipeline"},
   html:{
    de:"<p>Rohdaten sind selten sauber. Diese Streamlit-Anwendung nutzt ein LLM für die Vorverarbeitung und baut darauf eine Analyse- und ML-Strecke in einer Drei-Ebenen-Architektur auf. Entstanden im Big-Data-Projekt an der TU Clausthal.</p><p>Stack: Python, Streamlit, Pandas.<br><a href='https://github.com/Boris-djiogho/llm-data-pipeline' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Raw data is rarely clean. This Streamlit application uses an LLM for preprocessing and builds an analytics and ML pipeline on top, in a three-layer architecture. Built during the big data project at TU Clausthal.</p><p>Stack: Python, Streamlit, Pandas.<br><a href='https://github.com/Boris-djiogho/llm-data-pipeline' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p5", x:22,y:31,
   ort:{de:"Projekte-Dorf · Haus 5", en:"Project village · house 5"},
   titel:{de:"Taxi-Simulation", en:"Taxi simulation"},
   html:{
    de:"<p>Drei Spring-Boot-Services, die sich über Eureka finden: Das Backend berechnet mit GraphHopper Routen auf echten New-York-Kartendaten, das Frontend animiert die Taxifahrt auf einer Leaflet-Karte, inklusive Tacho und Fahrpreis.</p><p>Stack: Java, Spring Boot, Microservices.<br><a href='https://github.com/Boris-djiogho/taxi-microservices' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Three Spring Boot services that find each other via Eureka: the backend computes routes on real New York map data with GraphHopper, the frontend animates the taxi ride on a Leaflet map, including speedometer and fare.</p><p>Stack: Java, Spring Boot, microservices.<br><a href='https://github.com/Boris-djiogho/taxi-microservices' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p6", x:25,y:31,
   ort:{de:"Projekte-Dorf · Haus 6", en:"Project village · house 6"},
   titel:{de:"PC-TSP-Heuristiken", en:"PC-TSP heuristics"},
   html:{
    de:"<p>Beim Prize-Collecting TSP muss eine Tour nicht alle Orte besuchen: Jeder Ort bringt einen Preis, jeder ausgelassene kostet Strafe. Ich habe dafür eine Multi-Start-Hill-Climbing-Heuristik entworfen, implementiert und auf Testinstanzen ausgewertet.</p><p>Stack: Python, Jupyter.<br><a href='https://github.com/Boris-djiogho/pctsp-heuristics' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>In the prize-collecting TSP a tour does not have to visit every location: each one collects a prize, each one skipped costs a penalty. I designed a multi-start hill-climbing heuristic for it, implemented it and evaluated it on test instances.</p><p>Stack: Python, Jupyter.<br><a href='https://github.com/Boris-djiogho/pctsp-heuristics' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  /* Engagement */
  {key:"kindergarten", x:8,y:7, gruen:true,
   ort:{de:"Berlin · Nov. 2017 bis Mai 2020", en:"Berlin · Nov. 2017 to May 2020"},
   titel:{de:"Ehrenamt im Kindergarten", en:"Volunteering at a kindergarten"},
   html:{
    de:"<p>Zweieinhalb Jahre ehrenamtliche pädagogische Mitarbeit im <b>Evangelischen Kindergarten Gustav Adolf</b> in Berlin, parallel zur Sprachvorbereitung.</p><p>Mit Kindern gibt es keine Ausreden: Entweder man macht sich verständlich, oder man wird nicht verstanden. Die beste Kommunikationsschule, die ich je hatte.</p>",
    en:"<p>Two and a half years of volunteer educational work at the <b>Gustav Adolf Protestant kindergarten</b> in Berlin, alongside my language preparation.</p><p>With children there are no excuses: either you make yourself understood or you are not understood. The best communication school I ever had.</p>"}},
  {key:"gremien", x:29,y:21, gruen:true,
   ort:{de:"TU Clausthal · seit März 2023", en:"TU Clausthal · since March 2023"},
   titel:{de:"Fachschaftsrat und Studierendenparlament", en:"Student council and student parliament"},
   html:{
    de:"<p>Mitglied im <b>Fachschaftsrat Mathematik/Informatik</b> und im <b>Studierendenparlament</b>: studentische Interessen vertreten, in Gremien verhandeln, zwischen Hochschule und Studierenden vermitteln.</p><p>Hier habe ich gelernt, Sitzungen zu überstehen und trotzdem etwas zu bewegen.</p>",
    en:"<p>Member of the <b>student council for mathematics and computer science</b> and of the <b>student parliament</b>: representing student interests, negotiating in committees, mediating between university and students.</p><p>This is where I learned to survive meetings and still get things done.</p>"}},
  {key:"vereine", x:32,y:21, gruen:true,
   ort:{de:"Clausthal · seit Mai 2022", en:"Clausthal · since May 2022"},
   titel:{de:"Vereinsleben: Kulturverein und CSK", en:"Community life: cultural association and CSK"},
   html:{
    de:"<p>Als <b>Präsident des Afrikanischen Kulturvereins Clausthal</b> (seit Mai 2022) verantworte ich Budget, Sponsorenakquise und Veranstaltungen, vom kamerunischen Abend im Mokele Mbembe bis zum interkulturellen Fest.</p><p>Seit April 2026 außerdem <b>Beauftragter für pädagogische Angelegenheiten der Clausthaler Studenten aus Kamerun (CSK)</b>: Mentoring und Studienberatung für Studierende, die denselben Weg gehen wie ich damals.</p><p>Angefangen hat dieses Engagement übrigens früher: mit zweieinhalb Jahren Ehrenamt im Berliner Kindergarten, im Nordwesten der Karte.</p>",
    en:"<p>As <b>president of the African Cultural Association Clausthal</b> (since May 2022) I am responsible for budget, sponsorship and events, from Cameroonian nights at Mokele Mbembe to intercultural festivals.</p><p>Since April 2026 I am also <b>officer for educational affairs of the Cameroonian Students of Clausthal (CSK)</b>: mentoring and guidance for students walking the same path I once did.</p><p>This engagement started earlier, by the way: with two and a half years of kindergarten volunteering in Berlin, in the northwest of the map.</p>"}},
];
const besucht = new Set();

/* ---------- Spieler ---------- */
const spieler = {
  x: 10*TILE, y: 28*TILE,
  b: 10, h: 12,
  richtung: "unten", schritt: 0, laeuft: false,
};
const geschwindigkeit = 1.6;
window.__spieler = spieler;

/* ---------- Eingabe ---------- */
const tasten = {};
window.__tasten = tasten;
window.addEventListener("keydown", e=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key)) e.preventDefault();
  tasten[e.key.toLowerCase()] = true;
  if(e.key === "Enter" || e.key === "Escape"){
    if(aktiverNpc) schliesseNpcDialog(); else schliesseModal();
  }
});
window.addEventListener("keyup", e=>{ tasten[e.key.toLowerCase()] = false; });
document.querySelectorAll("#dpad button").forEach(b=>{
  const r = b.dataset.r;
  const mapKey = {up:"arrowup",down:"arrowdown",left:"arrowleft",right:"arrowright"}[r];
  const anAus = v => e => { e.preventDefault(); tasten[mapKey]=v; };
  b.addEventListener("touchstart", anAus(true), {passive:false});
  b.addEventListener("touchend",   anAus(false));
  b.addEventListener("mousedown",  anAus(true));
  b.addEventListener("mouseup",    anAus(false));
});

/* ---------- Kollision ---------- */
function blockiert(px,py){
  const punkte = [[px,py],[px+spieler.b,py],[px,py+spieler.h],[px+spieler.b,py+spieler.h]];
  return punkte.some(([qx,qy])=>{
    const tx = Math.floor(qx/TILE), ty = Math.floor(qy/TILE);
    if(tx<0||tx>=W||ty<0||ty>=H) return true;
    return SOLID.has(at(tx,ty)) || gebaeudeSolid(tx,ty) || feuerSolid.has(ty*W+tx) || dekoSolid.has(ty*W+tx);
  });
}

/* ---------- Sprach-UI ---------- */
function wendeSpracheAn(){
  const t = T();
  document.getElementById("titelSub").innerHTML = t.sub;
  document.getElementById("titelTag").textContent = t.tag;
  document.getElementById("titelEscape").innerHTML = t.escape;
  document.getElementById("hilfe").textContent = t.hilfe;
  const kl = document.getElementById("klassischLink");
  kl.textContent = t.klassisch; kl.href = t.klassischHref;
  document.getElementById("modalZu").textContent = t.weiter;
  document.getElementById("sprachBtn").textContent = t.toggle;
  document.getElementById("sprachBtnSpiel").textContent = t.toggle;
  aktualisiereZaehler();
}
function wechsleSprache(){
  sprache = sprache==="de" ? "en" : "de";
  try{ localStorage.setItem("bd-sprache", sprache); }catch(e){}
  wendeSpracheAn();
  /* Offener NPC-Dialog wird direkt mitübersetzt */
  if(aktiverNpc) document.getElementById("npcText").textContent = aktiverNpc.zeile[sprache];
}
document.getElementById("sprachBtn").addEventListener("click", wechsleSprache);
document.getElementById("sprachBtnSpiel").addEventListener("click", wechsleSprache);

/* ---------- NPC-Dialog ---------- */
let aktiverNpc = null;
let letzterNpc = null;
const npcDialogEl = document.getElementById("npcDialog");

function zeigeNpcDialog(n){
  aktiverNpc = n;
  document.getElementById("npcName").textContent = n.name;
  document.getElementById("npcText").textContent = n.zeile[sprache];
  npcDialogEl.classList.add("an");
}
function schliesseNpcDialog(){
  if(aktiverNpc){ letzterNpc = aktiverNpc; aktiverNpc = null; }
  npcDialogEl.classList.remove("an");
}
npcDialogEl.addEventListener("click", schliesseNpcDialog);
window.__pruefeNpcs = ()=>pruefeNpcs();   // Debug

function pruefeNpcs(){
  if(modalOffen) return;
  const px = spieler.x + spieler.b/2, py = spieler.y + spieler.h/2;
  let naechster = null, nDist = 1e9;
  npcs.forEach(n=>{
    const d = Math.hypot(n.x+5-px, n.y+6-py);
    if(d < nDist){ nDist = d; naechster = n; }
  });
  if(naechster && nDist < 26){
    if(!aktiverNpc && naechster !== letzterNpc) zeigeNpcDialog(naechster);
  } else {
    if(aktiverNpc) schliesseNpcDialog();
    if(nDist > 40) letzterNpc = null;
  }
}

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalKarte = document.getElementById("modalKarte");
const zaehlerEl = document.getElementById("zaehler");
let modalOffen = false;
let finaleGezeigt = false;

function oeffneKarte(ort, titel, html, gruen){
  document.getElementById("modalOrt").textContent = ort;
  document.getElementById("modalTitel").textContent = titel;
  document.getElementById("modalText").innerHTML = html;
  modalKarte.classList.toggle("gruen", !!gruen);
  modal.classList.add("an");
  modalOffen = true;
}
function oeffneStation(s){
  oeffneKarte(s.ort[sprache], s.titel[sprache], s.html[sprache], s.gruen);
  besucht.add(s.key);
  aktualisiereZaehler();
}
function aktualisiereZaehler(){
  const t = T();
  if(besucht.size === stationen.length){
    zaehlerEl.textContent = t.fertig(stationen.length);
    zaehlerEl.classList.add("fertig");
  } else {
    zaehlerEl.textContent = t.zaehler(besucht.size, stationen.length);
  }
}
function schliesseModal(){
  modal.classList.remove("an");
  modalOffen = false;
  if(!finaleGezeigt && besucht.size === stationen.length){
    finaleGezeigt = true;
    const t = T();
    setTimeout(()=>{ oeffneKarte(t.finaleOrt, t.finaleTitel, t.finaleHtml(stationen.length), false); }, 250);
  }
}
document.getElementById("modalZu").addEventListener("click", schliesseModal);
modal.addEventListener("click", e=>{ if(e.target===modal) schliesseModal(); });

let letzteStation = null;
function pruefeStationen(){
  const tx = Math.floor((spieler.x+spieler.b/2)/TILE);
  const ty = Math.floor((spieler.y+spieler.h/2)/TILE);
  const s = stationen.find(s => s.x===tx && s.y===ty);
  if(s && s!==letzteStation && !modalOffen){ letzteStation = s; oeffneStation(s); }
  if(!s) letzteStation = null;
}

/* ---------- Zeichnen ---------- */
let zeit = 0;
function zeichneKachel(t, sx, sy, tx, ty){
  switch(t){
    case SCHNEE: ctx.fillStyle="#e7edf3"; ctx.fillRect(sx,sy,TILE,TILE);
                 ctx.fillStyle="#d9e2ea"; ctx.fillRect(sx+4,sy+5,2,1); ctx.fillRect(sx+11,sy+10,2,1);
                 break;
    case GRAS:   ctx.fillStyle="#3e7c47"; ctx.fillRect(sx,sy,TILE,TILE); break;
    case GRAS2:  ctx.fillStyle="#3e7c47"; ctx.fillRect(sx,sy,TILE,TILE);
                 if(atlasBereit){ zeichneSprite("tuft", 0, sx+TILE/2, sy+13, false); }
                 else { ctx.fillStyle="#356e3e"; ctx.fillRect(sx+3,sy+4,2,2); ctx.fillRect(sx+10,sy+9,2,2); }
                 break;
    case SAND:   ctx.fillStyle="#dfc98a"; ctx.fillRect(sx,sy,TILE,TILE);
                 ctx.fillStyle="#d1b978"; ctx.fillRect(sx+6,sy+6,2,1); ctx.fillRect(sx+11,sy+11,2,1); break;
    case PLAZA:  if(atlasBereit && fuelleTextur("boden_plaza", sx, sy, TILE, TILE)) break;
                 ctx.fillStyle="#b9b9c4"; ctx.fillRect(sx,sy,TILE,TILE);
                 ctx.strokeStyle="#a5a5b2"; ctx.lineWidth=1;
                 ctx.strokeRect(sx+0.5,sy+0.5,TILE-1,TILE-1); break;
    case WEG:    if(atlasBereit && fuelleTextur("boden_weg", sx, sy, TILE, TILE)) break;
                 ctx.fillStyle="#c9a06a"; ctx.fillRect(sx,sy,TILE,TILE);
                 ctx.fillStyle="#ba9159"; ctx.fillRect(sx+4,sy+5,2,2); ctx.fillRect(sx+10,sy+11,2,2); break;
    case WASSER: {
      const ph = Math.floor(zeit/40)%2;
      if(atlasBereit && atlasMeta["wasser1"]){
        const name = ((tx+ty+ph)%2===0) ? "wasser1" : "wasser2";
        fuelleTextur(name, sx, sy, TILE, TILE);
        /* Uferschaum an Kanten zu Land */
        if(tx!==undefined){
          ctx.fillStyle="rgba(232,244,250,0.75)";
          if(ty>0   && at(tx,ty-1)!==WASSER) ctx.fillRect(sx, sy, TILE, 2);
          if(ty<H-1 && at(tx,ty+1)!==WASSER) ctx.fillRect(sx, sy+TILE-2, TILE, 2);
          if(tx>0   && at(tx-1,ty)!==WASSER) ctx.fillRect(sx, sy, 2, TILE);
          if(tx<W-1 && at(tx+1,ty)!==WASSER) ctx.fillRect(sx+TILE-2, sy, 2, TILE);
        }
        break;
      }
      ctx.fillStyle="#2f7fae"; ctx.fillRect(sx,sy,TILE,TILE);
      ctx.fillStyle="#3c92c4";
      if(ph===0){ ctx.fillRect(sx+2,sy+4,4,1); ctx.fillRect(sx+9,sy+10,4,1); }
      else      { ctx.fillRect(sx+4,sy+9,4,1); ctx.fillRect(sx+10,sy+3,4,1); }
      break; }
    case BLUME:  ctx.fillStyle="#3e7c47"; ctx.fillRect(sx,sy,TILE,TILE);
                 ctx.fillStyle="#e2574c"; ctx.fillRect(sx+4,sy+5,2,2);
                 ctx.fillStyle="#f5b301"; ctx.fillRect(sx+10,sy+9,2,2); break;
    case TANNE:  ctx.fillStyle = (tx!==undefined && imSchnee(tx,ty)) ? "#e7edf3" : "#3e7c47";
                 ctx.fillRect(sx,sy,TILE,TILE);
                 if(!atlasBereit){
                   ctx.fillStyle="#5a3a22"; ctx.fillRect(sx+7,sy+11,2,4);
                   ctx.fillStyle="#1e5631";
                   ctx.fillRect(sx+3,sy+7,10,4); ctx.fillRect(sx+5,sy+3,6,4); ctx.fillRect(sx+7,sy+1,2,2);
                 }
                 break;
    case PALME:  ctx.fillStyle="#dfc98a"; ctx.fillRect(sx,sy,TILE,TILE);
                 if(!atlasBereit){
                   ctx.fillStyle="#8a6236"; ctx.fillRect(sx+7,sy+6,2,9);
                   ctx.fillStyle="#3f9147";
                   ctx.fillRect(sx+2,sy+3,5,2); ctx.fillRect(sx+9,sy+3,5,2);
                   ctx.fillRect(sx+4,sy+1,8,2); ctx.fillRect(sx+6,sy+5,4,2);
                 }
                 break;
    case BAUM:   ctx.fillStyle="#3e7c47"; ctx.fillRect(sx,sy,TILE,TILE);
                 if(!atlasBereit){
                   ctx.fillStyle="#5a3a22"; ctx.fillRect(sx+7,sy+10,2,5);
                   ctx.fillStyle="#2c7a3a"; ctx.fillRect(sx+3,sy+2,10,9);
                 }
                 break;
  }
}

function zeichneGebaeude(g, ox, oy){
  const sx = g.x*TILE-ox, sy = g.y*TILE-oy;
  const bw = g.w*TILE, bh = g.h*TILE;
  if(atlasBereit && atlasMeta["wand_"+g.koerper.slice(1)]){
    fuelleTextur("wand_"+g.koerper.slice(1), sx, sy+4, bw, bh-4);
    fuelleTextur("dach_"+g.dach.slice(1), sx-2, sy-7, bw+4, 12);
    ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fillRect(sx-2, sy+5, bw+4, 2);
  } else {
    ctx.fillStyle = g.koerper; ctx.fillRect(sx, sy+4, bw, bh-4);
    ctx.fillStyle = g.dach; ctx.fillRect(sx-2, sy-4, bw+4, 9);
    ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(sx-2, sy+3, bw+4, 2);
  }
  const tx = sx + Math.floor(bw/2)-3;
  ctx.fillStyle="#4a3220"; ctx.fillRect(tx, sy+bh-8, 6, 8);
  ctx.fillStyle="#9ecbe8";
  if(bw>=40){ ctx.fillRect(sx+5, sy+9, 6, 5); ctx.fillRect(sx+bw-11, sy+9, 6, 5); }
  else { ctx.fillRect(sx+4, sy+9, 5, 5); }
  const mitte = sx + Math.floor(bw/2);
  if(g.turm){
    /* Holzkirchturm mit Spitze und Kreuz */
    if(atlasBereit && atlasMeta["wand_"+g.koerper.slice(1)]){
      fuelleTextur("wand_"+g.koerper.slice(1), mitte-5, sy-21, 10, 15);
    } else {
      ctx.fillStyle = g.koerper; ctx.fillRect(mitte-5, sy-21, 10, 15);
    }
    ctx.fillStyle = g.dach;
    ctx.fillRect(mitte-7, sy-25, 14, 5);
    ctx.fillRect(mitte-5, sy-28, 10, 3);
    ctx.fillRect(mitte-3, sy-31, 6, 3);
    ctx.fillStyle="#f0ede2";
    ctx.fillRect(mitte-1, sy-38, 2, 7);
    ctx.fillRect(mitte-4, sy-35, 8, 2);
    ctx.fillStyle="#2b3247"; ctx.fillRect(mitte-2, sy-18, 4, 5);
  }
  if(g.schild){
    ctx.fillStyle="#141824"; ctx.fillRect(mitte-10, sy-4, 20, 11);
    ctx.strokeStyle="#f5b301"; ctx.lineWidth=1; ctx.strokeRect(mitte-9.5, sy-3.5, 19, 10);
    ctx.fillStyle="#ffffff"; ctx.font="bold 8px monospace";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(g.schild, mitte, sy+2);
    ctx.textAlign="left"; ctx.textBaseline="alphabetic";
  }
}

function zeichneMarker(s, ox, oy){
  const sx = s.x*TILE-ox+TILE/2, sy = s.y*TILE-oy + Math.sin(zeit/14)*2;
  const istBesucht = besucht.has(s.key);
  const farbe = istBesucht ? "#6b7688" : (s.gruen ? "#4cd07d" : "#f5b301");
  ctx.fillStyle="#141824";
  ctx.fillRect(sx-4, sy-16, 8, 14);
  ctx.fillStyle=farbe;
  ctx.fillRect(sx-2, sy-14, 4, 7);
  ctx.fillRect(sx-2, sy-5, 4, 2);
}

function zeichneSpieler(ox, oy){
  const sx = Math.round(spieler.x-ox)-3, sy = Math.round(spieler.y-oy)-8;
  const frame = spieler.laeuft ? Math.floor(zeit/8)%2 : 0;
  ctx.fillStyle="rgba(0,0,0,0.25)"; ctx.fillRect(sx+3, sy+18, 10, 3);
  ctx.fillStyle="#2a3550";
  if(frame===0){ ctx.fillRect(sx+4, sy+14, 3, 5); ctx.fillRect(sx+9, sy+14, 3, 5); }
  else         { ctx.fillRect(sx+3, sy+14, 3, 4); ctx.fillRect(sx+10, sy+14, 3, 5); }
  ctx.fillStyle="#cfe0f0"; ctx.fillRect(sx+3, sy+8, 10, 7);
  ctx.fillRect(sx+1, sy+9, 2, 5); ctx.fillRect(sx+13, sy+9, 2, 5);
  ctx.fillStyle="#6b4226"; ctx.fillRect(sx+4, sy, 8, 8);
  ctx.fillStyle="#1c1008"; ctx.fillRect(sx+3, sy-1, 10, 3);
  ctx.fillStyle="#120b06";
  if(spieler.richtung!=="oben"){
    const dx = spieler.richtung==="links" ? -1 : spieler.richtung==="rechts" ? 1 : 0;
    ctx.fillRect(sx+5+dx, sy+3, 2, 2); ctx.fillRect(sx+9+dx, sy+3, 2, 2);
  }
}

function zeichneDeko(ox, oy){
  baenke.forEach(([bx,by])=>{
    const sx=bx*TILE-ox, sy=by*TILE-oy;
    ctx.fillStyle="#8a6236"; ctx.fillRect(sx+1, sy+6, 14, 4);
    ctx.fillStyle="#6e4c26"; ctx.fillRect(sx+2, sy+10, 2, 4); ctx.fillRect(sx+12, sy+10, 2, 4);
    ctx.fillStyle="#9c7442"; ctx.fillRect(sx+1, sy+3, 14, 2);
  });
  laternen.forEach(([lx,ly])=>{
    const sx=lx*TILE-ox, sy=ly*TILE-oy;
    ctx.fillStyle="#3a4152"; ctx.fillRect(sx+7, sy+2, 2, 13);
    const an = Math.floor(zeit/90)%2===0;
    ctx.fillStyle= an ? "#ffe28a" : "#c9cdd6"; ctx.fillRect(sx+5, sy-2, 6, 5);
    ctx.fillStyle="#3a4152"; ctx.fillRect(sx+5, sy-4, 6, 2);
  });
  /* Fallback-Lagerfeuer, falls der Atlas (noch) nicht geladen ist */
  if(!atlasBereit) feuerstellen.forEach(([fx,fy])=>{
    const sx=fx*TILE-ox, sy=fy*TILE-oy;
    ctx.fillStyle="#4a3220"; ctx.fillRect(sx+3, sy+10, 10, 4);
    const ph = Math.floor(zeit/10)%2;
    ctx.fillStyle="#e2574c"; ctx.fillRect(sx+5, sy+4+ph, 6, 7-ph);
    ctx.fillStyle="#f5b301"; ctx.fillRect(sx+6, sy+6+ph, 4, 5-ph);
  });
}

/* ---------- Sprite-Varianten (wenn der Atlas geladen ist) ---------- */
function zeichneSpielerSprite(ox, oy){
  const ax = spieler.x + spieler.b/2 - ox;
  const ay = spieler.y + spieler.h + 2 - oy;
  ctx.fillStyle="rgba(0,0,0,0.25)";
  ctx.fillRect(Math.round(ax)-5, Math.round(ay)-2, 10, 3);
  const name = "spieler_" + (spieler.laeuft ? "walk" : "idle") + "_" +
    (spieler.richtung==="oben" ? "up" : spieler.richtung==="unten" ? "down" : "side");
  const frame = spieler.laeuft ? Math.floor(zeit/6) : Math.floor(zeit/20);
  zeichneSprite(name, frame, ax, ay, spieler.richtung==="links");
}

function zeichneNpcSprite(n, ox, oy){
  const ax = n.x + 5 - ox, ay = n.y + 14 - oy;
  ctx.fillStyle="rgba(0,0,0,0.22)";
  ctx.fillRect(Math.round(ax)-5, Math.round(ay)-2, 10, 3);
  if(n.dir[0]<0) n.blickLinks = true;
  else if(n.dir[0]>0) n.blickLinks = false;
  const laeuft = n.dir[0]!==0 || n.dir[1]!==0;
  const name = laeuft ? n.sprite+"_lauf" : n.sprite;
  const frame = laeuft ? Math.floor(zeit/7) : Math.floor((zeit+n.f*13)/16);
  /* Alle Sheets im Atlas schauen nach rechts, gespiegelt wird nur nach links */
  zeichneSprite(name, frame, ax, ay, !!n.blickLinks);
}

function zeichneNpc(n, ox, oy){
  const f = npcFarben[n.f];
  const sx = Math.round(n.x-ox)-3, sy = Math.round(n.y-oy)-8;
  const laeuft = n.dir[0]!==0 || n.dir[1]!==0;
  const frame = laeuft ? Math.floor(zeit/9)%2 : 0;
  ctx.fillStyle="rgba(0,0,0,0.22)"; ctx.fillRect(sx+3, sy+18, 10, 3);
  ctx.fillStyle="#3a3f4d";
  if(frame===0){ ctx.fillRect(sx+4, sy+14, 3, 5); ctx.fillRect(sx+9, sy+14, 3, 5); }
  else         { ctx.fillRect(sx+3, sy+14, 3, 4); ctx.fillRect(sx+10, sy+14, 3, 5); }
  ctx.fillStyle=f.hemd; ctx.fillRect(sx+3, sy+8, 10, 7);
  ctx.fillRect(sx+1, sy+9, 2, 5); ctx.fillRect(sx+13, sy+9, 2, 5);
  ctx.fillStyle=f.haut; ctx.fillRect(sx+4, sy, 8, 8);
  ctx.fillStyle=f.haar; ctx.fillRect(sx+3, sy-1, 10, 3);
}

function zeichneWegweiser(w, ox, oy){
  const text = w.text[sprache] || w.text.de;
  const sx = Math.round(w.x*TILE-ox+TILE/2), sy = Math.round((w.y+1)*TILE-oy);
  const breite = text.length*5 + 8;
  ctx.fillStyle="#6e4c26"; ctx.fillRect(sx-1, sy-14, 3, 14);
  ctx.fillStyle="#141824"; ctx.fillRect(sx-Math.floor(breite/2), sy-26, breite, 13);
  ctx.strokeStyle="#f5b301"; ctx.lineWidth=1;
  ctx.strokeRect(sx-Math.floor(breite/2)+0.5, sy-25.5, breite-1, 12);
  ctx.fillStyle="#ffffff"; ctx.font="bold 7px monospace";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(text, sx, sy-19);
  ctx.textAlign="left"; ctx.textBaseline="alphabetic";
}

function zeichneEnte(ox, oy){
  const ex = 31.5*TILE-ox + Math.sin(zeit/60)*6;
  const ey = 15*TILE-oy + Math.cos(zeit/45)*3;
  ctx.fillStyle="#f0eee6"; ctx.fillRect(ex, ey, 8, 5);
  ctx.fillRect(ex+5, ey-4, 4, 5);
  ctx.fillStyle="#f5a623"; ctx.fillRect(ex+9, ey-2, 3, 2);
  ctx.fillStyle="#1a1a1a"; ctx.fillRect(ex+7, ey-3, 1, 1);
}

/* ---------- Kamera & Loop ---------- */
let gestartet = false;
let kameraDemo = 0;
let kamX = null, kamY = null;

function render(){
  zeit++;
  bewegeNpcs();

  if(gestartet && !modalOffen){
    let dx=0, dy=0;
    if(tasten["arrowup"]||tasten["w"]) dy=-1;
    if(tasten["arrowdown"]||tasten["s"]) dy=1;
    if(tasten["arrowleft"]||tasten["a"]) dx=-1;
    if(tasten["arrowright"]||tasten["d"]) dx=1;
    spieler.laeuft = (dx!==0||dy!==0);
    if(dx<0) spieler.richtung="links"; else if(dx>0) spieler.richtung="rechts";
    else if(dy<0) spieler.richtung="oben"; else if(dy>0) spieler.richtung="unten";
    const nx = spieler.x + dx*geschwindigkeit;
    const ny = spieler.y + dy*geschwindigkeit;
    if(!blockiert(nx, spieler.y)) spieler.x = nx;
    if(!blockiert(spieler.x, ny)) spieler.y = ny;
    pruefeStationen();
    pruefeNpcs();
  }

  let ox, oy;
  if(gestartet){
    const zielX = spieler.x - canvas.width/2;
    const zielY = spieler.y - canvas.height/2;
    if(kamX===null){ kamX=zielX; kamY=zielY; }
    kamX += (zielX-kamX)*0.10;
    kamY += (zielY-kamY)*0.10;
    ox = kamX; oy = kamY;
  } else {
    kameraDemo += 0.15;
    ox = (W*TILE-canvas.width)/2 + Math.sin(kameraDemo/50)*60;
    oy = (H*TILE-canvas.height)/2 + Math.cos(kameraDemo/70)*40;
  }
  /* Ganzzahlige Kamera: alle Zeichnungen landen auf vollen Pixeln,
     sonst schimmern 1px-Nähte zwischen Textur-Kacheln und fillRects. */
  ox = Math.round(Math.max(0, Math.min(W*TILE-canvas.width,  ox)));
  oy = Math.round(Math.max(0, Math.min(H*TILE-canvas.height, oy)));

  const x0 = Math.floor(ox/TILE), y0 = Math.floor(oy/TILE);
  const x1 = Math.min(W-1, x0 + Math.ceil(canvas.width/TILE)+1);
  const y1 = Math.min(H-1, y0 + Math.ceil(canvas.height/TILE)+1);
  for(let ty=y0;ty<=y1;ty++)
    for(let tx=x0;tx<=x1;tx++)
      zeichneKachel(at(tx,ty), tx*TILE-ox, ty*TILE-oy, tx, ty);

  zeichneEnte(ox, oy);
  zeichneDeko(ox, oy);

  if(atlasBereit){
    /* Tiefensortierung: alles am Fußpunkt einsortieren, von hinten nach vorn.
       Baum-Scan mit größerem Rand, weil die Kronen über die Kachel hinausragen. */
    const liste = [];
    const bx0 = Math.max(0, x0-2), bx1 = Math.min(W-1, x1+2);
    const by1 = Math.min(H-1, y1+5);
    for(let ty=y0;ty<=by1;ty++)
      for(let tx=bx0;tx<=bx1;tx++){
        const t = at(tx,ty);
        if(t===TANNE || t===BAUM || t===PALME){
          const name = t===BAUM ? "baum"
            : t===PALME ? (((tx*7+ty)%2===0) ? "palme" : "palme2")
            : (imSchnee(tx,ty) ? "tanne_schnee" : "tanne");
          const ax = tx*TILE-ox+TILE/2, ay = (ty+1)*TILE-oy;
          liste.push({y:(ty+1)*TILE, zeichne:()=>zeichneSprite(name, 0, ax, ay, false)});
        }
      }
    feuerstellen.forEach(([fx,fy])=>{
      const ax = fx*TILE-ox+TILE/2, ay = (fy+1)*TILE-oy;
      liste.push({y:(fy+1)*TILE, zeichne:()=>zeichneSprite("feuer", Math.floor(zeit/9), ax, ay, false)});
    });
    straeucher.forEach(([bx,by,name])=>{
      const ax = bx*TILE-ox+TILE/2, ay = (by+1)*TILE-oy;
      liste.push({y:(by+1)*TILE, zeichne:()=>zeichneSprite(name, 0, ax, ay, false)});
    });
    wegweiser.forEach(w=>liste.push({y:(w.y+1)*TILE, zeichne:()=>zeichneWegweiser(w, ox, oy)}));
    gebaeude.forEach(g=>liste.push({y:(g.y+g.h)*TILE, zeichne:()=>zeichneGebaeude(g, ox, oy)}));
    npcs.forEach(n=>liste.push({y:n.y+14, zeichne:()=>zeichneNpcSprite(n, ox, oy)}));
    if(gestartet) liste.push({y:spieler.y+spieler.h+2, zeichne:()=>zeichneSpielerSprite(ox, oy)});
    liste.sort((a,b)=>a.y-b.y);
    liste.forEach(e=>e.zeichne());
  } else {
    gebaeude.forEach(g=>zeichneGebaeude(g, ox, oy));
    wegweiser.forEach(w=>zeichneWegweiser(w, ox, oy));
    npcs.forEach(n=>zeichneNpc(n, ox, oy));
    if(gestartet) zeichneSpieler(ox, oy);
  }
  stationen.forEach(s=>zeichneMarker(s, ox, oy));
}
function loop(){
  render();
  requestAnimationFrame(loop);
}
window.__render = render;   // Debug-Zugriff

/* Erst rendern, wenn der Atlas geladen ist, damit nie die alte
   Codezeichnung aufblitzt. Nach 1,5 s notfalls ohne Atlas starten. */
let loopGestartet = false;
function starteLoop(){ if(loopGestartet) return; loopGestartet = true; loop(); }
const atlasWarter = setInterval(()=>{ if(atlasBereit){ clearInterval(atlasWarter); starteLoop(); } }, 40);
setTimeout(()=>{ clearInterval(atlasWarter); starteLoop(); }, 1500);

/* ---------- Start ---------- */
wendeSpracheAn();
document.getElementById("playBtn").addEventListener("click", ()=>{
  document.getElementById("titel").classList.add("aus");
  document.getElementById("hud").style.display="flex";
  document.getElementById("hilfe").style.display="block";
  document.getElementById("klassischLink").style.display="block";
  document.getElementById("sprachBtnSpiel").style.display="block";
  document.getElementById("dpad").classList.add("an");
  gestartet = true;
  aktualisiereZaehler();
});
})();
