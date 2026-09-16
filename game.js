/* =========================================================
   Boris Djiogho, Portfolio-Spielwelt / portfolio game world
   Grafiken: Sprites aus dem "Pixel Crawler Free Pack" von
   Anokolisa (frei nutzbar, Credit erwünscht), Rest per Code.
   Aufbau: Umgebung · Sprache · Sprites · Pixelschrift · Welt ·
   Gebäude · Stationen · NPCs · Spieler · UI · Zeichnen · Loop
   ========================================================= */
(function(){
"use strict";

/* ---------- Umgebung & Parameter ---------- */
const params = new URLSearchParams(location.search);
const DEBUG = params.has("debug");
const touchGeraet = params.get("touch")==="1" || window.matchMedia("(pointer: coarse)").matches;
const reduziert = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if(touchGeraet) document.documentElement.classList.add("touch");

const speicher = {
  get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } },
  set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} },
};
const $ = id => document.getElementById(id);

/* Cookieloser Zähler, nur aktiv wenn index.html window.BD_ZAEHLER setzt */
function verfolge(ereignis){
  const z = window.BD_ZAEHLER;
  if(!z) return;
  try{
    const u = z + "?p=" + encodeURIComponent("/spiel/" + ereignis) + "&r=" + encodeURIComponent(document.referrer || "");
    const bild = new Image(); bild.src = u;
  }catch(e){}
}

/* ---------- Sprache ---------- */
let sprache = params.get("lang");
if(sprache==="de" || sprache==="en") speicher.set("bd-sprache", sprache);
else sprache = speicher.get("bd-sprache");
if(sprache!=="de" && sprache!=="en")
  sprache = (navigator.language||"en").toLowerCase().startsWith("de") ? "de" : "en";

const UI = {
  de:{
    sub:"Wirtschaftsinformatik · KI · Operations Research",
    tag:"EINE REISE VON DOUALA NACH FREIBURG",
    profil:"<b>M.Sc. Wirtschaftsinformatik</b> · Berufseinstieg an der Schnittstelle von KI, Daten und Geschäftsprozessen · Freiburg, hybrid oder remote",
    lebenslauf:"LEBENSLAUF LESEN", lebenslaufHref:"portfolio-de.html?direkt=1", pdf:"Lebenslauf (PDF)",
    hinweisTastatur:(n)=>"3 KERNSTATIONEN IN 2 MINUTEN<br>"+n+" STATIONEN FÜR DIE GANZE GESCHICHTE<br>PFEILTASTEN ODER KLICK: LAUFEN · ENTER: ÖFFNEN",
    hinweisTouch:(n)=>"3 KERNSTATIONEN IN 2 MINUTEN<br>"+n+" STATIONEN FÜR DIE GANZE GESCHICHTE<br>TIPPEN: LAUFEN · MARKER ANTIPPEN: ÖFFNEN",
    play:"PLAY", weiterspielen:(n,g)=>"WEITER ("+n+"/"+g+")", neuStart:"Neu starten",
    seitentitel:"Boris Djiogho · Wirtschaftsinformatiker (M.Sc.) · Portfolio-Spielwelt",
    canvasLabel:"Spielwelt: eine Pixel-Karte von Douala über Berlin und den Oberharz nach Freiburg. Mit den Pfeiltasten läuft man zu den Stationen, ENTER öffnet die Karte einer Station. Alle Inhalte stehen auch in der Zeitungsausgabe.",
    karteLabel:"Übersichtskarte der Spielwelt", dpadLabel:"Steuerkreuz", aktionLabel:"Aktion: Karte öffnen oder sprechen", sprachLabel:"Sprache, aktuell Deutsch",
    impressum:"Impressum · Datenschutz · Credits",
    hilfe:"Pfeile / Klick: laufen · ENTER: öffnen · M: Karte · C: Kontakt",
    klassisch:"ZEITUNG", klassischHref:"portfolio-de.html?direkt=1",
    karte:"KARTE", kontakt:"KONTAKT", tonAn:"♪ AN", tonAus:"♪ AUS",
    weiter:"WEITER", schliessen:"SCHLIESSEN", reset:"FORTSCHRITT ZURÜCKSETZEN", resetFrage:"Alle besuchten Stationen vergessen und von vorn beginnen?",
    uebersicht:"ÜBERSICHT", stand:(n,g)=>n+" / "+g+" BESUCHT",
    legende:"○ noch offen · ● besucht (auf der Karte grau) · ✚ du · ★ Kernstation. Gelb: Weg und Beruf, Blau: Projekte, Grün: Engagement, Rot: Kontakt und Werkzeugkiste.",
    gruppen:{weg:"WEG UND BERUF", projekte:"PROJEKTE-DORF", engagement:"ENGAGEMENT", extra:"KONTAKT UND WERKZEUGE"},
    zaehler:(n,g)=>"STATIONEN "+n+" / "+g,
    fertig:(g)=>"ALLE "+g+" STATIONEN!",
    promptSprechen:(n)=>"Mit "+n+" sprechen",
    toastStart:"Lauf zum gelben Marker vor der Apotheke. Dort beginnt die Geschichte.",
    toastTouch:"Tippe auf einen Marker oder irgendwohin in die Welt, die Figur läuft hin.",
    toastTon:"Ton ist aus. Der ♪-Knopf oben schaltet ihn ein.",
    toastGenug:'Genug gesehen? <a href="cv/Lebenslauf_Boris_Djiogho.pdf" target="_blank" rel="noopener">Lebenslauf (PDF)</a> · <a href="#" data-aktion="kontakt">Kontakt</a>',
    toastProjekte:"Projekte-Dorf komplett! Das Dorf hisst die Fahne.",
    toastEngagement:"Engagement-Viertel komplett! Am Lagerfeuer wird gefeiert.",
    toastWeg:"Der ganze Weg von Douala nach Freiburg ist erkundet.",
    toastZurueck:(n,g)=>"Willkommen zurück: "+n+" von "+g+" Stationen sind schon besucht.",
    finaleOrt:"Geschafft!", finaleTitel:"Danke fürs Erkunden!",
    finaleHtml:(g)=>"<p>Du hast alle "+g+" Stationen meiner Reise entdeckt, von Douala bis Freiburg. Genau so arbeite ich auch: neugierig, gründlich und mit Freude am Weg.</p>"+
      "<p class='steckbrief'><b>Gesucht:</b> Berufseinstieg an der Schnittstelle von KI, Daten und Geschäftsprozessen<br><b>Verfügbar:</b> ab sofort · Freiburg, hybrid oder remote<br><b>Sprachen:</b> Französisch (Muttersprache) · Deutsch · Englisch (C1)</p>"+
      "<p>Lass uns in Kontakt kommen:</p>"+
      "<p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br>"+
      "<a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br>"+
      "<a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br>"+
      "<a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank' rel='noopener'>Lebenslauf (PDF)</a><br>"+
      "<a href='portfolio-de.html?direkt=1'>Zur Zeitungsausgabe</a></p>",
    impressumOrt:"Rechtliches", impressumTitel:"Impressum, Datenschutz, Credits",
    impressumHtml:"<h3>IMPRESSUM</h3><p>Angaben gemäß § 5 DDG<br>Boris Morgan Djiogho Keou · Berliner Allee 29b · 79110 Freiburg im Breisgau<br>E-Mail: <a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a></p>"+
      "<h3>DATENSCHUTZ (STAND: SEPTEMBER 2026)</h3><p class='fakt'>Diese Website ist eine statische Seite und wird bei GitHub Pages (GitHub Inc., USA) gehostet. Beim Aufruf verarbeitet GitHub technisch notwendige Verbindungsdaten (IP-Adresse, Zeitpunkt, aufgerufene Datei) in Server-Logs, Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; Details in der <a href='https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement' target='_blank' rel='noopener'>Datenschutzerklärung von GitHub</a>. Die Seite setzt keine Cookies, nutzt keine Analyse-Tools und lädt alle Schriften vom eigenen Server. Im Browser werden nur lokale Einstellungen (Sprache, Ton, Spielfortschritt) gespeichert, die nicht übertragen werden. Bei Kontakt per E-Mail werden die Daten nur zur Bearbeitung der Anfrage verwendet.</p>"+
      "<h3>CREDITS</h3><p class='fakt'>Sprites: <a href='https://anokolisa.itch.io' target='_blank' rel='noopener'>Pixel Crawler Free Pack von Anokolisa</a>. Schrift: Press Start 2P (SIL Open Font License), selbst gehostet. Inspiration: <a href='https://peteroravec.com' target='_blank' rel='noopener'>peteroravec.com</a>. Engine, Karte und alle weiteren Grafiken: eigene Arbeit.</p>",
    fahne:"PROJEKTE", schneemann:"",
  },
  en:{
    sub:"Business Informatics · AI · Operations Research",
    tag:"A JOURNEY FROM DOUALA TO FREIBURG",
    profil:"<b>M.Sc. Business Informatics</b> · seeking an entry-level role at the intersection of AI, data and business processes · Freiburg, hybrid or remote",
    lebenslauf:"READ THE RESUME", lebenslaufHref:"portfolio-en.html?direkt=1", pdf:"Resume (PDF)",
    hinweisTastatur:(n)=>"3 CORE STATIONS IN 2 MINUTES<br>"+n+" STATIONS FOR THE WHOLE STORY<br>ARROW KEYS OR CLICK: WALK · ENTER: OPEN",
    hinweisTouch:(n)=>"3 CORE STATIONS IN 2 MINUTES<br>"+n+" STATIONS FOR THE WHOLE STORY<br>TAP: WALK · TAP A MARKER: OPEN",
    play:"PLAY", weiterspielen:(n,g)=>"CONTINUE ("+n+"/"+g+")", neuStart:"Start over",
    seitentitel:"Boris Djiogho · Business Informatics (M.Sc.) · Portfolio Game World",
    canvasLabel:"Game world: a pixel map from Douala via Berlin and the Upper Harz to Freiburg. Use the arrow keys to walk to the stations, ENTER opens a station's card. All content is also available in the newspaper edition.",
    karteLabel:"Overview map of the game world", dpadLabel:"D-pad", aktionLabel:"Action: open card or talk", sprachLabel:"Language, currently English",
    impressum:"Legal notice · Privacy · Credits",
    hilfe:"Arrows / click: walk · ENTER: open · M: map · C: contact",
    klassisch:"NEWSPAPER", klassischHref:"portfolio-en.html?direkt=1",
    karte:"MAP", kontakt:"CONTACT", tonAn:"♪ ON", tonAus:"♪ OFF",
    weiter:"CONTINUE", schliessen:"CLOSE", reset:"RESET PROGRESS", resetFrage:"Forget all visited stations and start over?",
    uebersicht:"OVERVIEW", stand:(n,g)=>n+" / "+g+" VISITED",
    legende:"○ still open · ● visited (grey on the map) · ✚ you · ★ core station. Yellow: journey and career, blue: projects, green: community, red: contact and toolbox.",
    gruppen:{weg:"JOURNEY AND CAREER", projekte:"PROJECT VILLAGE", engagement:"COMMUNITY", extra:"CONTACT AND TOOLBOX"},
    zaehler:(n,g)=>"STATIONS "+n+" / "+g,
    fertig:(g)=>"ALL "+g+" STATIONS!",
    promptSprechen:(n)=>"Talk to "+n,
    toastStart:"Walk to the yellow marker in front of the pharmacy. That is where the story starts.",
    toastTouch:"Tap a marker or anywhere in the world and the character walks there.",
    toastTon:"Sound is off. The ♪ button at the top turns it on.",
    toastGenug:'Seen enough? <a href="cv/Lebenslauf_Boris_Djiogho.pdf" target="_blank" rel="noopener">Resume (PDF)</a> · <a href="#" data-aktion="kontakt">Contact</a>',
    toastProjekte:"Project village complete! The village raises its flag.",
    toastEngagement:"Community quarter complete! There is a party at the campfire.",
    toastWeg:"The whole journey from Douala to Freiburg is explored.",
    toastZurueck:(n,g)=>"Welcome back: "+n+" of "+g+" stations already visited.",
    finaleOrt:"Well done!", finaleTitel:"Thanks for exploring!",
    finaleHtml:(g)=>"<p>You found all "+g+" stations of my journey, from Douala to Freiburg. That is how I work, too: curious, thorough and enjoying the road.</p>"+
      "<p class='steckbrief'><b>Seeking:</b> an entry-level role at the intersection of AI, data and business processes<br><b>Available:</b> immediately · Freiburg, hybrid or remote<br><b>Languages:</b> French (native) · German · English (C1)</p>"+
      "<p>Let's get in touch:</p>"+
      "<p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br>"+
      "<a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br>"+
      "<a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br>"+
      "<a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank' rel='noopener'>Resume (PDF)</a><br>"+
      "<a href='portfolio-en.html?direkt=1'>Newspaper edition</a></p>",
    impressumOrt:"Legal", impressumTitel:"Legal notice, privacy, credits",
    impressumHtml:"<h3>LEGAL NOTICE</h3><p>Information according to § 5 DDG (German Digital Services Act)<br>Boris Morgan Djiogho Keou · Berliner Allee 29b · 79110 Freiburg im Breisgau, Germany<br>E-mail: <a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a></p>"+
      "<h3>PRIVACY (LAST UPDATED: SEPTEMBER 2026)</h3><p class='fakt'>This is a static website hosted on GitHub Pages (GitHub Inc., USA). When you open it, GitHub processes technically necessary connection data (IP address, time, requested file) in server logs, legal basis Art. 6 (1) (f) GDPR; see the <a href='https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement' target='_blank' rel='noopener'>GitHub privacy statement</a>. The site sets no cookies, uses no analytics and serves all fonts from its own server. Only local settings (language, sound, game progress) are stored in your browser and never transmitted. If you contact me by e-mail, your data is used only to handle your request.</p>"+
      "<h3>CREDITS</h3><p class='fakt'>Sprites: <a href='https://anokolisa.itch.io' target='_blank' rel='noopener'>Pixel Crawler Free Pack by Anokolisa</a>. Font: Press Start 2P (SIL Open Font License), self-hosted. Inspiration: <a href='https://peteroravec.com' target='_blank' rel='noopener'>peteroravec.com</a>. Engine, map and all other graphics: my own work.</p>",
    fahne:"PROJECTS", schneemann:"",
  },
};
const T = ()=>UI[sprache];
const L = (obj)=> (obj && typeof obj==="object") ? (obj[sprache] || obj.de) : obj;

/* ---------- Grundlagen: Canvas & Skalierung ---------- */
const TILE = 16, W = 48, H = 34;
const canvas = $("spiel");
const ctx = canvas.getContext("2d");
let SCALE = 3;      // CSS-Pixel pro Weltpixel (bei krummer DPR gebrochen)
let PHYS = 3;       // Gerätepixel pro Weltpixel, immer ganzzahlig: keine ungleich breiten Pixel

function passeGroesseAn(){
  const dpr = window.devicePixelRatio || 1;
  const bw = window.innerWidth, bh = window.innerHeight;
  let basis = Math.min(bw, bh) < 700 ? 2 : 3;
  if(bw >= 2400) basis = 5; else if(bw >= 1600) basis = 4;
  let phys = Math.max(2, Math.round(basis * dpr));
  /* Der Canvas darf nie größer als die Welt sein, sonst bleibt ein leerer Rand */
  phys = Math.max(phys, Math.ceil(bw*dpr/(W*TILE)), Math.ceil(bh*dpr/(H*TILE)));
  PHYS = phys; SCALE = phys/dpr;
  canvas.width  = Math.ceil(bw*dpr/phys);
  canvas.height = Math.ceil(bh*dpr/phys);
  canvas.style.width  = (canvas.width*SCALE) + "px";
  canvas.style.height = (canvas.height*SCALE) + "px";
  ctx.imageSmoothingEnabled = false;
}
function beobachteDpr(){
  try{
    const mq = window.matchMedia("(resolution: " + (window.devicePixelRatio||1) + "dppx)");
    mq.addEventListener("change", ()=>{ passeGroesseAn(); beobachteDpr(); }, {once:true});
  }catch(e){}
}
window.addEventListener("resize", passeGroesseAn);
passeGroesseAn(); beobachteDpr();

/* ---------- Sprites: Atlas + abgeleitete und prozedurale Sprites ---------- */
const SPR = {};            // name -> {img, frames:[[sx,sy,w,h,ox,oy], ...]}
let atlasBereit = false;
const atlasBild = new Image();

function ladeAtlas(){
  /* Metadaten kommen bevorzugt aus atlas.js (funktioniert auch von file:// ohne Server), sonst per fetch */
  const meta0 = window.BD_ATLAS
    ? Promise.resolve(window.BD_ATLAS)
    : fetch("assets/spiel/atlas.json").then(r => r.ok ? r.json() : Promise.reject(new Error("atlas.json " + r.status)));
  return meta0
    .then(meta => new Promise((ok, nein)=>{
      atlasBild.onload = ()=>ok(meta);
      atlasBild.onerror = ()=>nein(new Error("atlas.png"));
      atlasBild.src = "assets/spiel/atlas.png";
    }))
    .then(meta => {
      for(const k in meta) SPR[k] = {img: atlasBild, frames: meta[k]};
      erzeugeAbgeleiteteSprites();
      atlasBereit = true;
    })
    .catch(err => { console.warn("Sprite-Atlas nicht geladen, Fallback-Grafik:", err.message); });
}

function neuesCanvas(w,h){ const c = document.createElement("canvas"); c.width=w; c.height=h; return c; }

/* Kachelt eine 16x16-Textur über ein Rechteck (Böden, Wände, Dächer) */
function fuelleTextur(name, x, y, w, h, g){
  const s = SPR[name]; if(!s) return false;
  g = g || ctx;
  const f = s.frames[0];
  const x0 = Math.round(x), y0 = Math.round(y);
  for(let yy=0; yy<h; yy+=16){
    const th = Math.min(16, h-yy);
    for(let xx=0; xx<w; xx+=16){
      const tw = Math.min(16, w-xx);
      g.drawImage(s.img, f[0], f[1], tw, th, x0+xx, y0+yy, tw, th);
    }
  }
  return true;
}

/* Anker = Fußpunkt (Mitte unten). flip spiegelt horizontal um den Anker. */
function zeichneSprite(name, frame, ax, ay, flip, g){
  const s = SPR[name]; if(!s) return false;
  g = g || ctx;
  const f = s.frames[frame % s.frames.length];
  const dx = Math.round(ax), dy = Math.round(ay);
  if(flip){
    g.save(); g.translate(dx, dy); g.scale(-1, 1);
    g.drawImage(s.img, f[0], f[1], f[2], f[3], -(f[4]+f[2]), f[5], f[2], f[3]);
    g.restore();
  } else {
    g.drawImage(s.img, f[0], f[1], f[2], f[3], dx+f[4], dy+f[5], f[2], f[3]);
  }
  return true;
}

/* Kleine Pixelzeichner für prozedurale Sprites */
function px(g, farbe, x, y, w, h){ g.fillStyle = farbe; g.fillRect(x, y, w||1, h||1); }
function pxLinie(g, farbe, x0, y0, x1, y1, dicke){
  const n = Math.max(Math.abs(x1-x0), Math.abs(y1-y0), 1);
  for(let i=0;i<=n;i++){
    const x = Math.round(x0 + (x1-x0)*i/n), y = Math.round(y0 + (y1-y0)*i/n);
    px(g, farbe, x, y, dicke||1, dicke||1);
  }
}

/* Aus der Atlas-Tanne eine verschneite Tanne ableiten: weiße Hauben auf jede Oberkante */
function erzeugeWinterTanne(){
  const s = SPR["tanne"]; if(!s) return;
  const f = s.frames[0], w = f[2], h = f[3];
  const c = neuesCanvas(w, h), g = c.getContext("2d");
  g.drawImage(atlasBild, f[0], f[1], w, h, 0, 0, w, h);
  const id = g.getImageData(0,0,w,h), d = id.data;
  const a = (x,y)=> (x<0||y<0||x>=w||y>=h) ? 0 : d[(y*w+x)*4+3];
  const setze = (x,y,r,gg,b)=>{ const i=(y*w+x)*4; d[i]=r; d[i+1]=gg; d[i+2]=b; d[i+3]=255; };
  const oben = [];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){
    if(a(x,y)>0 && a(x,y-1)===0) oben.push([x,y]);
  }
  oben.forEach(([x,y])=>{
    setze(x,y,238,243,248);
    if(a(x,y+1)>0 && ((x*3+y)%4!==0)) setze(x,y+1,214,226,236);
  });
  /* Kronen insgesamt etwas kühler */
  for(let i=0;i<d.length;i+=4){
    if(d[i+3]>0){ d[i]=Math.min(255,d[i]+18); d[i+1]=Math.min(255,d[i+1]+14); d[i+2]=Math.min(255,d[i+2]+30); }
  }
  g.putImageData(id,0,0);
  SPR["tanne_winter"] = {img:c, frames:[[0,0,w,h,f[4],f[5]]]};
}

/* Echte Palme (24x44): gebogener Stamm, sechs Wedel, zwei Kokosnüsse */
function erzeugePalme(variante){
  const w=28, h=46, c = neuesCanvas(w,h), g = c.getContext("2d");
  const sx = variante ? -1 : 1;
  const fx = 14 + sx*6, fy = 10;                 // Kronenzentrum
  pxLinie(g, "#5c3a1a", 14, 45, fx, fy+2, 3);   // Stamm dunkel (Kontur)
  pxLinie(g, "#8a5a2b", 14, 45, fx, fy+2, 2);   // Stamm
  for(let i=0;i<9;i++){ const t=i/9; px(g, "#a9743a", Math.round(14+(fx-14)*t), Math.round(45+(fy+2-45)*t), 1, 1); }
  const wedel = [[-11,-2],[-9,6],[-4,-7],[4,-7],[9,5],[11,-2]];
  wedel.forEach(([dx,dy])=>{
    const ex = fx+dx, ey = fy+dy;
    pxLinie(g, "#1c3d22", fx, fy, ex, ey, 3);
  });
  wedel.forEach(([dx,dy])=>{
    const ex = fx+dx, ey = fy+dy;
    pxLinie(g, "#3f9147", fx, fy, ex, ey, 2);
    pxLinie(g, "#63b85c", fx, fy-1, Math.round(fx+dx*0.6), Math.round(fy-1+dy*0.6), 1);
  });
  px(g, "#5c3a1a", fx-2, fy+1, 2, 2); px(g, "#5c3a1a", fx+1, fy+2, 2, 2);
  px(g, "#8a5a2b", fx-2, fy+1, 1, 1); px(g, "#8a5a2b", fx+1, fy+2, 1, 1);
  SPR[variante ? "palme_b" : "palme_a"] = {img:c, frames:[[0,0,w,h,-14,-h]]};
}

/* Schneemann (14x20) und Dorffahne (10x26) */
function erzeugeKleinkram(){
  let c = neuesCanvas(14,20), g = c.getContext("2d");
  px(g,"#1c1a20",2,10,10,10); px(g,"#1c1a20",4,3,6,8);
  px(g,"#eef3f8",3,11,8,8); px(g,"#eef3f8",5,4,4,6);
  px(g,"#d6e2ec",3,17,8,1); px(g,"#d6e2ec",5,9,4,1);
  px(g,"#1c1a20",5,6,1,1); px(g,"#1c1a20",8,6,1,1); px(g,"#f5a623",6,7,2,1);
  px(g,"#1c1a20",4,2,6,1); px(g,"#1c1a20",5,0,4,2); px(g,"#e2574c",4,3,6,1);
  px(g,"#5c3a1a",0,13,3,1); px(g,"#5c3a1a",11,12,3,1);
  SPR["schneemann"] = {img:c, frames:[[0,0,14,20,-7,-20]]};
  c = neuesCanvas(12,26); g = c.getContext("2d");
  px(g,"#5c3a1a",1,0,2,26); px(g,"#f5b301",3,1,9,6); px(g,"#e2574c",3,3,9,2); px(g,"#1c1a20",3,7,9,1);
  SPR["fahne"] = {img:c, frames:[[0,0,12,26,-2,-26]]};
  c = neuesCanvas(8,14); g = c.getContext("2d");
  px(g,"#1c1a20",3,0,2,14); px(g,"#e2574c",1,2,6,7); px(g,"#f5b301",1,4,6,1); px(g,"#8e1e12",1,2,6,1); px(g,"#f5b301",3,9,2,3);
  SPR["laterne_rot"] = {img:c, frames:[[0,0,8,14,-4,-14]]};
}

function erzeugeAbgeleiteteSprites(){
  erzeugeWinterTanne();
  if(SPR["palme"])  SPR["laub_a"] = SPR["palme"];   // die Atlas-"Palmen" sind Laubbäume: passen nach Freiburg
  if(SPR["palme2"]) SPR["laub_b"] = SPR["palme2"];
}
erzeugePalme(false); erzeugePalme(true); erzeugeKleinkram();

/* ---------- Pixelschrift 3x5 für Schilder und Wegweiser ---------- */
const PIX = {
  A:"010101111101101",B:"110101110101110",C:"011100100100011",D:"110101101101110",E:"111100110100111",
  F:"111100110100100",G:"111100101101111",H:"101101111101101",I:"111010010010111",J:"001001001101010",
  K:"101101110101101",L:"100100100100111",M:"101111111101101",N:"110101101101101",O:"111101101101111",
  P:"111101111100100",Q:"111101101111001",R:"110101110101101",S:"011100010001110",T:"111010010010010",
  U:"101101101101111",V:"101101101101010",W:"101101111111101",X:"101101010101101",Y:"101101010010010",
  Z:"111001010100111","0":"010101101101010","1":"010110010010111","2":"110001010100111","3":"111001011001111",
  "4":"101101111001001","5":"111100110001110","6":"011100111101111","7":"111001010010010","8":"111101111101111",
  "9":"111101111001110","-":"000000111000000",".":"000000000000010","·":"000000010000000","/":"001001010100100",
  "+":"000010111010000","!":"010010010000010","?":"111001011000010",":":"000010000010000"," ":"000000000000000",
  "▲":"010111010010010","▼":"010010010111010","◀":"001011111011001","▶":"100110111110100",
  "Ü":"101000101101111","Ä":"101010101111101","Ö":"101111101101111","É":"111100110100111","È":"111100110100111",
};
function textBreite(t){ return t.length*4 - 1; }
function zeichneText(g, text, x, y, farbe){
  g.fillStyle = farbe;
  let cx = x;
  for(const ch of text.toUpperCase()){
    const gl = PIX[ch] || PIX["?"];
    for(let i=0;i<15;i++) if(gl[i]==="1") g.fillRect(cx + (i%3), y + Math.floor(i/3), 1, 1);
    cx += 4;
  }
}
/* Fertige Schildchen (dunkler Kasten, gelber Rahmen, weiße Schrift), gecacht pro Text */
const schildCache = new Map();
function schild(text){
  let c = schildCache.get(text);
  if(c) return c;
  const b = textBreite(text) + 8, h = 11;
  c = neuesCanvas(b, h); const g = c.getContext("2d");
  px(g, "#141824", 0, 0, b, h);
  g.strokeStyle = "#f5b301"; g.lineWidth = 1; g.strokeRect(0.5, 0.5, b-1, h-1);
  zeichneText(g, text, 4, 3, "#ffffff");
  schildCache.set(text, c);
  return c;
}

/* ---------- Kacheln & Welt ---------- */
const GRAS=0, GRAS2=1, SAND=2, PLAZA=3, WEG=4, WASSER=5, BAUM=6, PALME=7, BLUME=8, TANNE=9, SCHNEE=10, ERDE=11, LAUB=12, EIS=13;
const SOLID = new Set([WASSER, BAUM, PALME, TANNE, LAUB, EIS]);
const BODEN_FAMILIE = {[GRAS]:"gras",[GRAS2]:"gras",[BLUME]:"gras",[BAUM]:"gras",[TANNE]:"gras",[LAUB]:"gras",
  [SAND]:"sand",[PALME]:"sand",[PLAZA]:"plaza",[WEG]:"weg",[WASSER]:"wasser",[SCHNEE]:"schnee",[ERDE]:"erde",[EIS]:"eis"};

const karte = new Array(W*H).fill(GRAS);
const schneeMaske = new Uint8Array(W*H);   // 1 = Oberharz-Winterzone (auch unter Bäumen und Wegen)
const at  = (x,y)=> (x<0||y<0||x>=W||y>=H) ? WASSER : karte[y*W+x];
const set = (x,y,t)=>{ if(x>=0&&x<W&&y>=0&&y<H) karte[y*W+x]=t; };
const imSchnee = (x,y)=> x>=0&&y>=0&&x<W&&y<H && schneeMaske[y*W+x]===1;
function rect(x,y,w,h,t){ for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++) set(i,j,t); }
function streu(x,y,w,h,t,anzahl,rnd,nur){
  for(let n=0;n<anzahl;n++){
    const gx = x+Math.floor(rnd()*w), gy = y+Math.floor(rnd()*h);
    if(!nur || nur.includes(at(gx,gy))) set(gx,gy,t);
  }
}
let seed = 7;
const rnd = ()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
const hash = (x,y)=> ((x*73856093) ^ (y*19349663)) >>> 0;

/* Zonen (für Ortsbanner, Übersichtskarte und Grundfarbe beim Aufräumen) */
const zonen = [
  {key:"douala",     x:3, y:22, w:14, h:9,  name:{de:"DOUALA", en:"DOUALA"},           sub:{de:"Kamerun · 2015 bis 2017", en:"Cameroon · 2015 to 2017"}},
  {key:"berlin",     x:5, y:3,  w:15, h:9,  name:{de:"BERLIN", en:"BERLIN"},           sub:{de:"Ankunft in Deutschland · 2017", en:"Arrival in Germany · 2017"}},
  {key:"harz",       x:20,y:6,  w:16, h:12, name:{de:"OBERHARZ", en:"UPPER HARZ"},     sub:{de:"TU Clausthal · 2018 bis 2026", en:"TU Clausthal · 2018 to 2026"}},
  {key:"rastatt",    x:14,y:18, w:6,  h:4,  name:{de:"RASTATT", en:"RASTATT"},         sub:{de:"Daimler · Sommer 2019", en:"Daimler · summer 2019"}},
  {key:"freiburg",   x:36,y:3,  w:11, h:9,  name:{de:"FREIBURG", en:"FREIBURG"},       sub:{de:"Zuhause · seit 2026", en:"Home · since 2026"}},
  {key:"engagement", x:20,y:18, w:16, h:7,  name:{de:"ENGAGEMENT-PLATZ", en:"COMMUNITY SQUARE"}, sub:{de:"Verein · Gremien · Mentoring", en:"Club · committees · mentoring"}},
  {key:"projekte",   x:20,y:25, w:16, h:9,  name:{de:"PROJEKTE-DORF", en:"PROJECT VILLAGE"}, sub:{de:"Sieben Projekte und eine Werkzeugkiste", en:"Seven projects and a toolbox"}},
  {key:"chengdu",    x:37,y:22, w:10, h:9,  name:{de:"CHENGDU", en:"CHENGDU"},         sub:{de:"Sichuan University · 2024", en:"Sichuan University · 2024"}},
];
function zoneBei(tx,ty){ return zonen.find(z => tx>=z.x && tx<z.x+z.w && ty>=z.y && ty<z.y+z.h) || null; }

/* ---------- Weltaufbau ---------- */
rect(0,0,3,H,WASSER); rect(0,H-3,16,3,WASSER);
/* Douala: rote Lateriterde, Sand nur am Wasser */
rect(3,22,14,9,ERDE); rect(3,22,2,9,SAND); rect(3,29,14,2,SAND);
/* Berlin */
rect(5,3,15,9,PLAZA);
/* Oberharz */
rect(20,7,16,15,GRAS);
streu(20,7,16,4,TANNE,18,rnd,[GRAS,GRAS2]);
streu(21,11,3,6,TANNE,6,rnd,[GRAS,GRAS2]);
rect(30,14,4,3,WASSER);
/* Chengdu-Wiese, Freiburg-Plaza, Projekte-Dorf */
rect(37,22,9,8,GRAS); streu(37,22,9,8,GRAS2,22,rnd,[GRAS]);
rect(36,3,10,9,PLAZA);
rect(20,25,16,8,GRAS);
/* Wege */
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
[[15,13],[43,20]].forEach(([bx,by])=>set(bx,by,BAUM));
/* Laubbäume (die gelb-grünen Atlas-Bäume) ins Badische und nach Chengdu */
[[42,13],[44,15],[37,14],[45,26],[38,28]].forEach(([bx,by])=>{ if(BODEN_FAMILIE[at(bx,by)]==="gras") set(bx,by,LAUB); });
/* Engagement-Platz: Tannen als Rahmen, Mitte frei */
for(let x=20;x<=35;x+=2){ if(x<24||x>27){ if(at(x,18)===GRAS||at(x,18)===GRAS2) set(x,18,TANNE); if(at(x,24)===GRAS||at(x,24)===GRAS2) set(x,24,TANNE); } }
for(let y=19;y<=23;y+=2){ if(at(20,y)===GRAS||at(20,y)===GRAS2) set(20,y,TANNE); if(at(35,y)===GRAS||at(35,y)===GRAS2) set(35,y,TANNE); }
/* Palmen: am Sandstreifen und vereinzelt im Ort */
[[3,23],[4,25],[3,27],[4,28],[7,30],[11,30],[15,30],[16,23],[9,22]].forEach(([px_,py_])=>{
  const t = at(px_,py_); if(t===SAND||t===ERDE) set(px_,py_,PALME);
});

/* Oberharz-Winterzone mit unregelmäßigem Rand */
for(let sy=6; sy<=17; sy++)
  for(let sx=19; sx<=35; sx++){
    const rand = (sy===6||sy===17||sx===19||sx===35);
    if(rand && hash(sx,sy)%3===0) continue;
    schneeMaske[sy*W+sx] = 1;
    const t = at(sx,sy);
    if(t===GRAS || t===GRAS2 || t===BLUME) set(sx,sy,SCHNEE);
    if(t===WASSER) set(sx,sy,EIS);
  }

/* Lagerfeuer: eins am Strand von Douala, eins auf dem Engagement-Platz */
const feuerstellen = [[6,29],[33,22]];
const feuerSolid = new Set(feuerstellen.map(([fx,fy]) => fy*W+fx));

/* ---------- Gebäude ---------- */
/* typ: haus (Giebeldach) · halle (Flachdach, Fensterband) · kirche · muenster · fernsehturm · pagode · stand */
const gebaeude = [
  {x:6, y:24, w:3,h:2, typ:"haus",  wand:"e8e3d8", dach:"3f7d4e", schild:{de:"APOTHEKE",en:"PHARMACY"}, kreuz:true},
  {x:12,y:24, w:3,h:2, typ:"haus",  wand:"d9c9a3", dach:"a3552f", schild:"UNI DOUALA"},
  {x:15,y:27, w:2,h:1, typ:"stand", schild:{de:"MARKT",en:"MARKET"}},
  {x:7, y:5,  w:3,h:2, typ:"haus",  wand:"e8d478", dach:"c2543a", schild:{de:"KITA",en:"KINDERGARTEN"}},
  {x:14,y:5,  w:4,h:2, typ:"halle", wand:"9db4d0", dach:"2f3c56", schild:"MAZARS"},
  {x:11,y:4,  w:1,h:1, typ:"fernsehturm", schild:"BERLIN"},
  {x:26,y:9,  w:4,h:2, typ:"halle", wand:"cfd4dc", dach:"5a3f30", schild:"TU CLAUSTHAL"},
  {x:22,y:13, w:3,h:2, typ:"haus",  wand:"f0f0f4", dach:"7a4f9e", schild:"PFLEGEBRILLE"},
  {x:31,y:8,  w:2,h:2, typ:"kirche",wand:"6b90b8", dach:"2f3c56", schild:{de:"KIRCHE",en:"CHURCH"}},
  {x:15,y:19, w:4,h:2, typ:"halle", wand:"8f9aa8", dach:"4a525e", schild:"DAIMLER"},
  {x:40,y:24, w:3,h:2, typ:"pagode",wand:"c0392b", dach:"8e1e12", schild:"CHENGDU"},
  {x:40,y:3,  w:3,h:3, typ:"muenster", wand:"a0522d", dach:"8e1e12", schild:{de:"MÜNSTER",en:"MINSTER"}},
  {x:36,y:4,  w:2,h:2, typ:"haus",  wand:"e8e3d8", dach:"c2543a", schild:{de:"ZUHAUSE",en:"HOME"}},
  {x:44,y:4,  w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"f5b301", schild:{de:"KONTAKT",en:"CONTACT"}, briefkasten:true},
  {x:36,y:8,  w:2,h:2, typ:"haus",  wand:"bfe6cd", dach:"2f7d4e", schild:{de:"NACHHALTIG",en:"SUSTAINABLE"}},
  {x:31,y:19, w:3,h:2, typ:"haus",  wand:"e8d478", dach:"3f7d4e", schild:{de:"KULTURVEREIN",en:"CULTURE CLUB"}},
  {x:20,y:26, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"f5b301", schild:"LV2CAD"},
  {x:24,y:26, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"4cd07d", schild:"KURARE"},
  {x:28,y:26, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"e2574c", schild:"EVRP"},
  {x:32,y:26, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"7a4f9e", schild:{de:"LLM-DATEN",en:"LLM DATA"}},
  {x:20,y:30, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"08abd4", schild:"TAXI"},
  {x:24,y:30, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"c2543a", schild:"PC-TSP"},
  {x:28,y:30, w:2,h:2, typ:"haus",  wand:"d8dce6", dach:"2f3c56", schild:"JOB-SHOP"},
  {x:32,y:30, w:2,h:2, typ:"haus",  wand:"d9c9a3", dach:"5a3f30", schild:{de:"WERKZEUGE",en:"TOOLBOX"}, werkzeug:true},
];
gebaeude.forEach(g => { g.tuerX = g.x + Math.floor(g.w/2); g.tuerY = g.y + g.h; });
function gebaeudeSolid(px_,py_){
  return gebaeude.some(g => px_>=g.x && px_<g.x+g.w && py_>=g.y && py_<g.y+g.h);
}

/* ---------- Deko ---------- */
const baenke   = [[9,10],[17,10],[38,11],[43,11],[28,20],[30,23],[34,21]];
const laternen = [[11,14],[11,20],[26,14],[26,22],[39,13],[39,20],[21,17],[33,17],[38,3],[45,10]];
const straeucher = [[7,14,"busch1"],[9,19,"busch2"],[18,13,"busch1"],[23,23,"busch2"],
  [35,13,"busch1"],[42,12,"busch2"],[44,22,"busch1"],[19,30,"busch2"],[34,27,"busch1"],
  [22,9,"farn"],[30,9,"farn"],[34,22,"farn"],[24,19,"farn"],
  [5,29,"stein1"],[10,24,"stein3"],[15,29,"stein2"],[29,17,"stein3"],
  [36,15,"stein1"],[44,17,"stein3"],[21,24,"stein2"],[31,15,"schneemann"],[39,26,"laterne_rot"],[43,26,"laterne_rot"]];
/* Wegweiser mit Richtungspfeilen, mehrzeilig, zweisprachig */
/* seite: Bretter hängen vom Weg weg (1 = rechts vom Pfosten, -1 = links), damit sie keine Figur auf dem Weg verdecken */
const wegweiser = [
  {x:13, y:15, seite:1,  zeilen:[{de:"▲ BERLIN",en:"▲ BERLIN"},{de:"▶ OBERHARZ",en:"▶ UPPER HARZ"},{de:"▼ DOUALA",en:"▼ DOUALA"}]},
  {x:27, y:15, seite:1,  zeilen:[{de:"▲ TU CLAUSTHAL",en:"▲ TU CLAUSTHAL"},{de:"▶ FREIBURG",en:"▶ FREIBURG"},{de:"▼ ENGAGEMENT",en:"▼ COMMUNITY"}]},
  {x:27, y:24, seite:1,  zeilen:[{de:"▲ ENGAGEMENT",en:"▲ COMMUNITY"},{de:"▼ PROJEKTE",en:"▼ PROJECTS"}]},
  {x:41, y:15, seite:1,  zeilen:[{de:"▲ FREIBURG",en:"▲ FREIBURG"},{de:"▼ CHENGDU",en:"▼ CHENGDU"}]},
  {x:10, y:21, seite:-1, zeilen:[{de:"▲ BERLIN",en:"▲ BERLIN"},{de:"▼ DOUALA",en:"▼ DOUALA"}]},
];
const dekoSolid = new Set();
straeucher.forEach(([bx,by,name])=>{
  if(["busch1","busch2","stein1","stein2","schneemann","laterne_rot"].includes(name)) dekoSolid.add(by*W+bx);
});
wegweiser.forEach(w=>dekoSolid.add(w.y*W+w.x));

/* ---------- NPCs: Bekannte mit Rolle, Heimatradius und ein bis zwei Sätzen ---------- */
const npcs = [
  {name:"Lea",   rolle:{de:"StuPa",en:"student parliament"}, heim:[24,10], radius:3, sprite:"npc_knight", f:0,
   zeilen:[{de:"StuPa-Sitzung heute um 18 Uhr, ich schalte dich online dazu. Die Tagesordnung liegt schon im Ordner.",
            en:"Student parliament meets at 6 pm today, I'll dial you in online. The agenda is already in the folder."},
           {de:"Die TU ist gleich hier oben im Schnee. Folg dem Weg nach Norden.",
            en:"The university is right up here in the snow. Follow the path north."}]},
  {name:"Tom",   rolle:{de:"Freiburg",en:"Freiburg"}, heim:[40,8], radius:3, sprite:"npc_tavern_a", f:1,
   zeilen:[{de:"Am Wochenende ist Weinfest in der Altstadt. Kommst du mit?",
            en:"Wine festival in the old town this weekend. Are you in?"},
           {de:"Der Briefkasten für Nachrichten an Boris hängt am Kontakt-Haus rechts vom Münster.",
            en:"The mailbox for messages to Boris is on the contact house, right of the minster."}]},
  {name:"Amina", rolle:{de:"CSK",en:"CSK"}, heim:[29,22], radius:2, sprite:"npc_peasant", f:2,
   zeilen:[{de:"Samstag ist kamerunischer Abend im Mokele Mbembe, das ganze CSK kommt. Bringst du wieder die Musik mit?",
            en:"Saturday is Cameroonian night at Mokele Mbembe, the whole CSK crew is coming. Will you bring the music again?"}]},
  {name:"Fatou", rolle:{de:"Kulturverein",en:"culture club"}, heim:[32,22], radius:2, sprite:"npc_tavern_a", f:3,
   zeilen:[{de:"Das Kulturfest war großartig! Ohne die Sponsoren, die du an Land gezogen hast, hätten wir das nie gestemmt.",
            en:"The culture festival was amazing! Without the sponsors you brought on board we could never have pulled it off."}]},
  {name:"David", rolle:{de:"Erstsemester",en:"first-year student"}, heim:[30,20], radius:2, sprite:"npc_tavern_b", f:1,
   zeilen:[{de:"Hast du nächste Woche Zeit, mit mir die Bewerbung fürs Studienkolleg durchzugehen?",
            en:"Do you have time next week to go through my application for the preparatory college with me?"}]},
  {name:"Michel",rolle:{de:"Douala",en:"Douala"}, heim:[8,30], radius:2, sprite:"npc_tavern_b", f:3,
   zeilen:[{de:"Wir kochen morgen Ndolé. Du bringst die Kochbananen mit, ja?",
            en:"We're cooking ndolé tomorrow. You bring the plantains, right?"},
           {de:"Die Marker vor den Häusern öffnen Boris' Geschichte. Fang gleich hier in Douala an.",
            en:"The markers in front of the houses open Boris' story. Start right here in Douala."}]},
  {name:"Jonas", rolle:{de:"TU Clausthal",en:"TU Clausthal"}, heim:[26,13], radius:3, sprite:"npc_wizzard", f:1,
   zeilen:[{de:"Kaffee in der Bibliothek nach der Vorlesung? Ich hab eine Frage zu deinem ALNS-Code.",
            en:"Coffee at the library after the lecture? I have a question about your ALNS code."}]},
  {name:"Karla", rolle:{de:"Freiburg",en:"Freiburg"}, heim:[42,9], radius:3, sprite:"npc_rogue", f:0,
   zeilen:[{de:"Lust auf eine Wanderung im Schwarzwald am Wochenende? Fast wie damals im Oberharz.",
            en:"Fancy a hike in the Black Forest this weekend? Almost like back in the Upper Harz."}]},
];
npcs.forEach(n => { n.x = n.heim[0]*TILE + 3; n.y = n.heim[1]*TILE + 2; n.dir=[0,0]; n.t=0; n.gesagt=0; });

/* ---------- Stationen (zweisprachig) ---------- */
/* typ: reise | beruf | projekt | engagement | kontakt | steckbrief · jahr: Kapitelschild unter dem Marker */
const stationen = [
  {key:"apotheke", x:7, y:26, typ:"reise", jahr:"2015",
   ort:{de:"Douala · Apotheken-Assistent · 2015 bis 2017", en:"Douala · Pharmacy assistant · 2015 to 2017"},
   titel:{de:"Pharmacie du Marché", en:"Pharmacie du Marché"},
   html:{
    de:"<p>Zweieinhalb Jahre in der <b>Pharmacie du Marché</b> in Douala, mein erster Job, mitten im Viertel. Hier lernte ich, was Verantwortung heißt: Menschen beraten, Vertrauen aufbauen, genau arbeiten.</p><p>Damals war mein Traum, <b>Medizin</b> zu studieren.</p>",
    en:"<p>Two and a half years at the <b>Pharmacie du Marché</b> in Douala, my first job, right in the neighborhood. This is where I learned what responsibility means: advising people, building trust, working precisely.</p><p>Back then my dream was to study <b>medicine</b>.</p>"}},
  {key:"bio", x:13,y:26, typ:"reise", jahr:"2016",
   ort:{de:"Douala · Studium · 2016 bis 2017", en:"Douala · Studies · 2016 to 2017"},
   titel:{de:"Biologie und Deutsch", en:"Biology and German"},
   html:{
    de:"<p>Biologie-Studium an der <b>Université de Douala</b> und parallel Deutschkurse am Sprachlernzentrum. Zwei Gleise, ein Ziel: raus in die Welt.</p><p>Aus Medizin wurde in Deutschland nichts. Aber das Thema Gesundheit kam zurück.</p>",
    en:"<p>Biology studies at the <b>Université de Douala</b> and German classes at the language center on the side. Two tracks, one goal: out into the world.</p><p>Medical school did not work out in Germany. But healthcare came back.</p>"}},
  {key:"berlin", x:11, y:5, typ:"reise", jahr:"2017",
   ort:{de:"Berlin · Nov. 2017", en:"Berlin · Nov. 2017"},
   titel:{de:"Ankunft in Deutschland", en:"Arriving in Germany"},
   html:{
    de:"<p>Neustart in Berlin, wo ein Teil meiner Familie lebt: neue Stadt, neue Sprache, Sprachvorbereitung fürs Studium. Deutsch im Alltag habe ich nebenan gelernt, im Kindergarten (grüner Marker).</p><p>2018 folgte eine Entscheidung, die alles änderte: der Oberharz.</p>",
    en:"<p>A fresh start in Berlin, where part of my family lives: new city, new language, language preparation for university. Everyday German I learned next door, at the kindergarten (green marker).</p><p>In 2018 came a decision that changed everything: the Upper Harz.</p>"}},
  {key:"mazars", x:16,y:7, typ:"beruf", jahr:"2022", kern:true,
   ort:{de:"Berlin/Remote · Werkstudent · 2022 bis 2026", en:"Berlin/remote · Working student · 2022 to 2026"},
   titel:{de:"Forvis Mazars, Digital Solutions", en:"Forvis Mazars, Digital Solutions"},
   html:{
    de:"<p><b>Fast vier Jahre Werkstudent</b>: Geschäftsanwendungen auf Low-Code-Plattformen, Anforderungsanalyse mit Fachbereichen, Coaching von Citizen Developern.</p><p>Hier habe ich mein Handwerk gelernt: <b>zwischen Business und IT übersetzen</b>.</p>",
    en:"<p><b>Almost four years as a working student</b>: business applications on low-code platforms, requirements analysis with business departments, coaching citizen developers.</p><p>This is where I learned my craft: <b>translating between business and IT</b>.</p>"}},
  {key:"tu", x:28,y:11, typ:"reise", jahr:"2018", kern:true,
   ort:{de:"Clausthal-Zellerfeld · Studium · 2018 bis 2026", en:"Clausthal-Zellerfeld · Studies · 2018 to 2026"},
   titel:{de:"TU Clausthal, meine Uni", en:"TU Clausthal, my university"},
   html:{
    de:"<p>Wald, eine kleine familiäre Uni, herzliche Menschen. Der Oberharz ließ mich nicht mehr los.</p><p><b>B.Sc. Wirtschaftsinformatik</b>, dann <b>M.Sc. Wirtschaftsinformatik</b> und parallel <b>B.Sc. Digitales Management</b>. Die Masterarbeit steht im Projekte-Dorf (Haus EVRP).</p>",
    en:"<p>Forest, a small close-knit university, warm-hearted people. The Upper Harz never let go of me.</p><p><b>B.Sc. in Business Informatics</b>, then an <b>M.Sc. in Business Informatics</b> with a parallel <b>B.Sc. in Digital Management</b>. The master's thesis lives in the project village (house EVRP).</p>"}},
  {key:"pflegebrille", x:23,y:15, typ:"beruf", jahr:"2021",
   ort:{de:"TU Clausthal · Wissenschaftliche Hilfskraft · 2021 bis 2022", en:"TU Clausthal · Research assistant · 2021 to 2022"},
   titel:{de:"Lehrstuhl Human-Centered Information Systems", en:"Chair of Human-Centered Information Systems"},
   html:{
    de:"<p>Im Projekt <b>Pflegebrille</b> (AR-Brillen für die Pflege) habe ich an Workflows und der nutzerfreundlichen Darstellung von Patienteninformationen mitgewirkt und die <b>Nutzungsdaten aus Pflegeheimen</b> eigenständig analysiert, mit einem selbst konzipierten Dashboard.</p><p>Daneben entwickelte ich <b>Android-Apps für Seminare und Roboter-Experimente</b>. Die Kommunikation mit den Robotern lief über MQTT.</p>",
    en:"<p>In the <b>Pflegebrille</b> project (AR glasses for nursing care) I worked on workflows and the user-friendly presentation of patient information, and independently analyzed <b>usage data from nursing homes</b> in a purpose-built dashboard.</p><p>On the side I developed <b>Android apps for seminars and robot experiments</b>, with robot communication via MQTT.</p>"}},
  {key:"daimler", x:17,y:21, typ:"beruf", jahr:"2019",
   ort:{de:"Rastatt · Ferienarbeit · Sommer 2019", en:"Rastatt · Summer job · summer 2019"},
   titel:{de:"Daimler, am Fließband", en:"Daimler, on the assembly line"},
   html:{
    de:"<p>Zwei Monate Ferienarbeit in der Produktion. Kurz, aber prägend: Seitdem weiß ich, wie Fertigung wirklich funktioniert und was <b>Prozessoptimierung</b> am Band konkret bedeutet.</p>",
    en:"<p>Two months of summer work in production. Short but formative: it taught me how manufacturing really works and what <b>process optimization</b> means on the line.</p>"}},
  {key:"chengdu", x:41,y:26, typ:"reise", jahr:"2024",
   ort:{de:"Chengdu · Sommerschule · 2024", en:"Chengdu · Summer school · 2024"},
   titel:{de:"Sichuan University", en:"Sichuan University"},
   html:{
    de:"<p>Sommerschule in China: Wirtschaft, Sprache und vor allem <b>interkulturelle Erfahrung</b>. Nach Kamerun und Deutschland mein drittes Zuhause auf Zeit, mit Französisch, Deutsch und Englisch im Gepäck.</p>",
    en:"<p>Summer school in China: business, language and above all <b>intercultural experience</b>. After Cameroon and Germany my third home away from home, with French, German and English in my luggage.</p>"}},
  {key:"nachhaltigkeit", x:37,y:10, typ:"reise",
   ort:{de:"Roter Faden", en:"Common thread"},
   titel:{de:"Nachhaltigkeit", en:"Sustainability"},
   html:{
    de:"<p><b>Der Antrieb:</b> E-Schrott-Kippen in Afrika, auf denen Kinder nach Metallen suchen, statt zur Schule zu gehen.</p><p><b>Bachelorarbeit:</b> Rückgabe von Elektroaltgeräten in Deutschland, quantitativ analysiert.</p><p><b>Masterarbeit:</b> Tourenplanung für Elektrofahrzeuge, damit E-Mobilität nicht nur sauber, sondern auch effizient ist (Projekte-Dorf, Haus EVRP).</p>",
    en:"<p><b>The motivation:</b> e-waste dumps in Africa, where children search for metals instead of going to school.</p><p><b>Bachelor's thesis:</b> a quantitative analysis of e-waste return options in Germany.</p><p><b>Master's thesis:</b> route planning for electric vehicles, so that e-mobility is efficient and not just clean (project village, house EVRP).</p>"}},
  {key:"freiburg", x:37,y:6, typ:"reise", jahr:"2026",
   ort:{de:"Freiburg · seit 2026", en:"Freiburg · since 2026"},
   titel:{de:"Angekommen im Breisgau", en:"Home in the Breisgau"},
   html:{
    de:"<p>Schon aus Clausthaler Zeiten kannte und liebte ich Freiburg: Schwarzwald vor der Tür, Sonne, Lebensfreude. <b>2026 bin ich ganz hierhergezogen.</b></p><p>Hier beginnt das nächste Kapitel: der Berufseinstieg an der Schnittstelle von KI, Daten und Geschäftsprozessen.</p>",
    en:"<p>I knew and loved Freiburg from my Clausthal years: the Black Forest on my doorstep, sunshine, joie de vivre. <b>In 2026 I moved here for good.</b></p><p>This is where the next chapter begins: an entry-level role at the intersection of AI, data and business processes.</p>"}},
  {key:"kontakt", x:45,y:6, typ:"kontakt",
   ort:{de:"Freiburg · Briefkasten", en:"Freiburg · Mailbox"},
   titel:{de:"Kontakt", en:"Contact"},
   html:{
    de:"<p>Ich freue mich über Nachrichten, ob Jobangebot, Projekt oder einfach ein Hallo.</p><p class='steckbrief'><b>Gesucht:</b> Berufseinstieg an der Schnittstelle von KI, Daten und Geschäftsprozessen<br><b>Verfügbar:</b> ab sofort · Freiburg, hybrid oder remote<br><b>Sprachen:</b> Französisch (Muttersprache) · Deutsch · Englisch (C1)</p><p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br><a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br><a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br><a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank' rel='noopener'>Lebenslauf (PDF)</a></p>",
    en:"<p>Whether it is a job opportunity, a project or just a hello, I would love to hear from you.</p><p class='steckbrief'><b>Seeking:</b> an entry-level role at the intersection of AI, data and business processes<br><b>Available:</b> immediately · Freiburg, hybrid or remote<br><b>Languages:</b> French (native) · German · English (C1)</p><p><a href='mailto:djioghomorgan@yahoo.com'>djioghomorgan@yahoo.com</a><br><a href='https://www.linkedin.com/in/boris-morgan-djiogho-9a6396157/' target='_blank' rel='noopener'>LinkedIn</a><br><a href='https://github.com/Boris-djiogho' target='_blank' rel='noopener'>GitHub</a><br><a href='cv/Lebenslauf_Boris_Djiogho.pdf' target='_blank' rel='noopener'>Resume (PDF)</a></p>"}},
  {key:"oberharz", x:21,y:9, typ:"reise", jahr:"2018",
   ort:{de:"Oberharz · 2018", en:"Upper Harz · 2018"},
   titel:{de:"Der Wald ruft", en:"The forest calls"},
   html:{
    de:"<p>Nach der Sprachschule zog es mich nach <b>Clausthal-Zellerfeld</b>, obwohl Berlin gerufen hätte. Manchmal trifft man die besten Entscheidungen mit dem Bauch.</p>",
    en:"<p>After language school I moved to <b>Clausthal-Zellerfeld</b>, even though Berlin was calling. Sometimes the best decisions are gut decisions.</p>"}},
  /* Projekte-Dorf */
  {key:"p1", x:21,y:28, typ:"projekt",
   ort:{de:"Projekte-Dorf · Haus LV2CAD", en:"Project village · house LV2CAD"},
   titel:{de:"LV2CAD", en:"LV2CAD"},
   html:{
    de:"<p>Bau-Leistungsverzeichnisse von Hand in CAD zu übertragen kostet Stunden. LV2CAD nimmt diese Arbeit ab: Eine KI (Mistral, EU-gehostet) liest die Parameter aus dem Dokument, eine deterministische Python-Pipeline erzeugt daraus DXF-Dateien für CAD.</p><p class='fakt'><b>Stand:</b> lauffähiger Prototyp (v0.1.0) mit fünf parametrischen Bauteiltypen, DXF-Export und 19 Tests; IFC/STEP-Export geplant. <b>Rolle:</b> eigenes Projekt.</p><p>Stack: Python, FastAPI, React.<br><a href='https://github.com/Boris-djiogho/lv2cad' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Transferring construction tender documents into CAD by hand takes hours. LV2CAD does the job: an AI (Mistral, EU-hosted) reads the parameters from the document, a deterministic Python pipeline turns them into DXF files for CAD.</p><p class='fakt'><b>Status:</b> working prototype (v0.1.0) with five parametric component types, DXF export and 19 tests; IFC/STEP export planned. <b>Role:</b> own project.</p><p>Stack: Python, FastAPI, React.<br><a href='https://github.com/Boris-djiogho/lv2cad' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p2", x:25,y:28, typ:"projekt",
   ort:{de:"Projekte-Dorf · Haus Kurare", en:"Project village · house Kurare"},
   titel:{de:"Kurare (HealthHack 2026)", en:"Kurare (HealthHack 2026)"},
   html:{
    de:"<p>Internationale Pflegeschüler:innen müssen Fachwissen und Sprache gleichzeitig lernen. Kurare hilft beim Üben: per Voice-to-Voice-Dialog mit einer KI, mit Einstufungstest und Fortschritts-Dashboard.</p><p class='fakt'><b>Stand:</b> Hackathon-Prototyp aus drei Services (Flask-UI, RAG-API mit Qdrant, LLM-API), End-to-End-Demo. <b>Rolle:</b> Teamprojekt beim HealthHack 2026 (Challenge „AI Learning Support“) mit Leuten aus Pflege, Design und Technik.</p><p>Stack: Flask, FastAPI, LLM-APIs, Qdrant.<br><a href='https://github.com/Boris-djiogho/kurare-healthhack-2026' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>International nursing students have to learn technical knowledge and language at the same time. Kurare helps them practice: in voice-to-voice dialogue with an AI, with a placement test and a progress dashboard.</p><p class='fakt'><b>Status:</b> hackathon prototype of three services (Flask UI, RAG API with Qdrant, LLM API), end-to-end demo. <b>Role:</b> team project at HealthHack 2026 (challenge “AI Learning Support”) with people from nursing, design and tech.</p><p>Stack: Flask, FastAPI, LLM APIs, Qdrant.<br><a href='https://github.com/Boris-djiogho/kurare-healthhack-2026' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p3", x:29,y:28, typ:"projekt", kern:true,
   ort:{de:"Projekte-Dorf · Haus EVRP", en:"Project village · house EVRP"},
   titel:{de:"Masterarbeit: E-Auto-Routing", en:"Master's thesis: EV routing"},
   html:{
    de:"<p>Wie plant man Touren für Elektro-Lieferfahrzeuge, wenn Laden nicht linear verläuft und die Beladung den Verbrauch verändert? Meine Antwort: ein MILP-Modell, exakt gelöst mit Gurobi, plus eine selbst entwickelte ALNS-Metaheuristik für große Instanzen.</p><p class='fakt'><b>Ergebnis:</b> Auf 60 Benchmark-Instanzen (10 bis 80 Kunden) liefert die ALNS in allen 500 Läufen zulässige Lösungen, liegt bei 10 Kunden im Mittel 1 % über Gurobi bei 97-fach kürzerer Rechenzeit und schlägt den exakten Solver ab 20 Kunden; bei 40 Kunden findet Gurobi in 8 von 10 Fällen keine zulässige Lösung mehr. <b>Rolle:</b> Masterarbeit (solo), abgeschlossen im April 2026.</p><p>Stack: Python, Gurobi.<br><a href='https://github.com/Boris-djiogho/evrp-spd-thesis' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>How do you plan routes for electric delivery vehicles when charging is nonlinear and the load changes consumption? My answer: a MILP model, solved exactly with Gurobi, plus a custom ALNS metaheuristic for large instances.</p><p class='fakt'><b>Result:</b> On 60 benchmark instances (10 to 80 customers) the ALNS returns feasible solutions in all 500 runs, stays within 1 % of Gurobi at 10 customers with a 97x shorter runtime and beats the exact solver from 20 customers on; at 40 customers Gurobi fails to find a feasible solution in 8 of 10 cases. <b>Role:</b> master's thesis (solo), completed in April 2026.</p><p>Stack: Python, Gurobi.<br><a href='https://github.com/Boris-djiogho/evrp-spd-thesis' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p4", x:33,y:28, typ:"projekt",
   ort:{de:"Projekte-Dorf · Haus LLM-Daten", en:"Project village · house LLM data"},
   titel:{de:"LLM-Datenpipeline", en:"LLM data pipeline"},
   html:{
    de:"<p>Rohdaten sind selten sauber. Diese Streamlit-Anwendung nutzt ein LLM für die Vorverarbeitung und baut darauf eine Analyse- und ML-Strecke in einer Vier-Level-Architektur auf; mein eigener Beitrag ist das vorgeschaltete Profiling-Level.</p><p class='fakt'><b>Ergebnis:</b> Auf drei öffentlichen Datensätzen erreichten fünf Klassifikatoren mit 5-facher Kreuzvalidierung Accuracy-Werte von 0,77 bis 1,00. <b>Rolle:</b> Einzelarbeit im Projekt Big Data Management, TU Clausthal, Sommer 2025.</p><p>Stack: Python, Streamlit, Pandas, LangChain.<br><a href='https://github.com/Boris-djiogho/llm-data-pipeline' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Raw data is rarely clean. This Streamlit application uses an LLM for preprocessing and builds an analytics and ML pipeline on top, in a four-level architecture; my own contribution is the profiling level in front of the LLM stages.</p><p class='fakt'><b>Result:</b> On three public datasets, five classifiers with 5-fold cross-validation reached accuracies of 0.77 to 1.00. <b>Role:</b> individual work in the Big Data Management project, TU Clausthal, summer 2025.</p><p>Stack: Python, Streamlit, Pandas, LangChain.<br><a href='https://github.com/Boris-djiogho/llm-data-pipeline' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p5", x:21,y:32, typ:"projekt",
   ort:{de:"Projekte-Dorf · Haus Taxi", en:"Project village · house Taxi"},
   titel:{de:"Taxi-Simulation", en:"Taxi simulation"},
   html:{
    de:"<p>Drei Spring-Boot-Services, die sich über Eureka finden: Das Backend berechnet mit GraphHopper Routen auf echten New-York-Kartendaten, das Frontend animiert die Taxifahrt auf einer Leaflet-Karte, inklusive Tacho und Fahrpreis.</p><p class='fakt'><b>Stand:</b> lauffähige Demo für bis zu zwei Taxis, Studienprojekt an der TU Clausthal. <b>Rolle:</b> Microservice-Architektur, Routing und Oberfläche.</p><p>Stack: Java, Spring Boot, Microservices.<br><a href='https://github.com/Boris-djiogho/taxi-microservices' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Three Spring Boot services that find each other via Eureka: the backend computes routes on real New York map data with GraphHopper, the frontend animates the taxi ride on a Leaflet map, including speedometer and fare.</p><p class='fakt'><b>Status:</b> working demo for up to two taxis, study project at TU Clausthal. <b>Role:</b> microservice architecture, routing and user interface.</p><p>Stack: Java, Spring Boot, microservices.<br><a href='https://github.com/Boris-djiogho/taxi-microservices' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p6", x:25,y:32, typ:"projekt",
   ort:{de:"Projekte-Dorf · Haus PC-TSP", en:"Project village · house PC-TSP"},
   titel:{de:"PC-TSP-Heuristiken", en:"PC-TSP heuristics"},
   html:{
    de:"<p>Beim Prize-Collecting TSP muss eine Tour nicht alle Orte besuchen: Jeder Ort bringt einen Preis, jeder ausgelassene kostet Strafe. Ich habe dafür eine Multi-Start-Hill-Climbing-Heuristik entworfen, implementiert und ausgewertet.</p><p class='fakt'><b>Ergebnis:</b> 357 Testläufe auf 13 Instanzen mit 8 bis 501 Städten; die parallele Multi-Start-Variante fand durchweg günstigere Touren und erreichte in jedem Lauf den Mindestpreis. <b>Rolle:</b> Seminararbeit (solo) im Modul Optimierungsheuristiken, TU Clausthal, Sommer 2025.</p><p>Stack: Python, Jupyter.<br><a href='https://github.com/Boris-djiogho/pctsp-heuristics' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>In the prize-collecting TSP a tour does not have to visit every location: each one collects a prize, each one skipped costs a penalty. I designed, implemented and evaluated a multi-start hill-climbing heuristic for it.</p><p class='fakt'><b>Result:</b> 357 test runs on 13 instances with 8 to 501 cities; the parallel multi-start variant consistently found cheaper tours and met the prize target in every run. <b>Role:</b> seminar paper (solo) in the optimization heuristics module, TU Clausthal, summer 2025.</p><p>Stack: Python, Jupyter.<br><a href='https://github.com/Boris-djiogho/pctsp-heuristics' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"p7", x:29,y:32, typ:"projekt",
   ort:{de:"Projekte-Dorf · Haus Job-Shop", en:"Project village · house Job-Shop"},
   titel:{de:"Job-Shop-Scheduling mit FICO Xpress", en:"Job-shop scheduling with FICO Xpress"},
   html:{
    de:"<p>Aufträge so auf Maschinen einplanen, dass die Gesamtdauer minimal wird: das klassische Job-Shop-Problem, als MILP modelliert und exakt gelöst, in zwei Formulierungen (klassisch und TSP-basiert).</p><p class='fakt'><b>Ergebnis:</b> Die klassische Formulierung löste 8 von 10 Instanzen (7 bis 18 Aufträge, 4 Maschinen) in 0,1 bis 3,3 Sekunden nachweislich optimal, die TSP-Formulierung nur 4 von 10 im 60-Sekunden-Limit. <b>Rolle:</b> Zweierteam mit Nephthali Eli Akonde, Modul Rechnergestützte Modellierung und Optimierung, TU Clausthal, Winter 2024/25.</p><p>Stack: FICO Xpress (Mosel).<br><a href='https://github.com/Boris-djiogho/jssp-fico-xpress' target='_blank' rel='noopener'>Code auf GitHub</a></p>",
    en:"<p>Scheduling jobs on machines so that the total makespan is minimal: the classic job-shop problem, modelled as a MILP and solved exactly, in two formulations (classical and TSP-based).</p><p class='fakt'><b>Result:</b> The classical formulation solved 8 of 10 instances (7 to 18 jobs, 4 machines) to proven optimality in 0.1 to 3.3 seconds, the TSP-based one only 4 of 10 within the 60-second limit. <b>Role:</b> two-person team with Nephthali Eli Akonde, module Computer-Aided Modelling and Optimisation, TU Clausthal, winter 2024/25.</p><p>Stack: FICO Xpress (Mosel).<br><a href='https://github.com/Boris-djiogho/jssp-fico-xpress' target='_blank' rel='noopener'>Code on GitHub</a></p>"}},
  {key:"werkzeuge", x:33,y:32, typ:"steckbrief",
   ort:{de:"Projekte-Dorf · Werkzeugkiste", en:"Project village · Toolbox"},
   titel:{de:"Werkzeugkiste", en:"Toolbox"},
   html:{
    de:"<p><b>Täglich:</b> Python (Pandas, NumPy) · SQL · LLM-Anwendungen · Low-Code (Betty Blocks, Power Automate, Copilot Studio)</p><p><b>Sicher im Umgang:</b> Gurobi und FICO Xpress (MILP) · Java, Spring Boot · JavaScript, React · R, Tableau, SPSS · Machine Learning · Git</p><p><b>Zertifikate:</b> Google Data Analytics (2021) · Analyze Data with R (2022)</p><p><b>Sprachen:</b> Französisch (Muttersprache) · Deutsch (verhandlungssicher, gesamtes Studium auf Deutsch) · Englisch (C1)</p><p><b>Außerdem:</b> Praktikum Online-Marketing bei Unicorn Factory Media (Content, SEO).</p>",
    en:"<p><b>Daily:</b> Python (Pandas, NumPy) · SQL · LLM applications · low-code (Betty Blocks, Power Automate, Copilot Studio)</p><p><b>Confident with:</b> Gurobi and FICO Xpress (MILP) · Java, Spring Boot · JavaScript, React · R, Tableau, SPSS · machine learning · Git</p><p><b>Certificates:</b> Google Data Analytics (2021) · Analyze Data with R (2022)</p><p><b>Languages:</b> French (native) · German (business fluent, entire degree in German) · English (C1)</p><p><b>Also:</b> internship in online marketing at Unicorn Factory Media (content, SEO).</p>"}},
  /* Engagement */
  {key:"kindergarten", x:8,y:7, typ:"engagement", jahr:"2017",
   ort:{de:"Berlin · Ehrenamt · Nov. 2017 bis Mai 2020", en:"Berlin · Volunteering · Nov. 2017 to May 2020"},
   titel:{de:"Ehrenamt im Kindergarten", en:"Volunteering at a kindergarten"},
   html:{
    de:"<p>Zweieinhalb Jahre ehrenamtliche pädagogische Mitarbeit im <b>Evangelischen Kindergarten Gustav Adolf</b> in Berlin, parallel zur Sprachvorbereitung.</p><p>Mit Kindern gibt es keine Ausreden: Entweder man macht sich verständlich, oder man wird nicht verstanden. Die beste Kommunikationsschule, die ich je hatte.</p>",
    en:"<p>Two and a half years of volunteer educational work at the <b>Gustav Adolf Protestant kindergarten</b> in Berlin, alongside my language preparation.</p><p>With children there are no excuses: either you make yourself understood or you are not understood. The best communication school I ever had.</p>"}},
  {key:"gremien", x:29,y:21, typ:"engagement", jahr:"2023",
   ort:{de:"TU Clausthal · März 2023 bis März 2027", en:"TU Clausthal · March 2023 to March 2027"},
   titel:{de:"Fachschaftsrat und Studierendenparlament", en:"Student council and student parliament"},
   html:{
    de:"<p>Mitglied im <b>Fachschaftsrat Mathematik/Informatik</b> und im <b>Studierendenparlament</b>: studentische Interessen vertreten, in Gremien verhandeln, zwischen Hochschule und Studierenden vermitteln. Seit dem Umzug nach Freiburg nehme ich an den meisten Sitzungen online teil.</p><p>Hier habe ich gelernt, Sitzungen zu überstehen und trotzdem etwas zu bewegen.</p>",
    en:"<p>Member of the <b>student council for mathematics and computer science</b> and of the <b>student parliament</b>: representing student interests, negotiating in committees, mediating between university and students. Since moving to Freiburg I attend most meetings online.</p><p>This is where I learned to survive meetings and still get things done.</p>"}},
  {key:"vereine", x:32,y:21, typ:"engagement", jahr:"2022",
   ort:{de:"Clausthal · seit Mai 2022", en:"Clausthal · since May 2022"},
   titel:{de:"Vereinsleben: Kulturverein und CSK", en:"Community life: cultural association and CSK"},
   html:{
    de:"<p>Als <b>Präsident des Afrikanischen Kulturvereins Clausthal</b> (seit Mai 2022) verantworte ich Budget, Sponsorenakquise und Veranstaltungen, vom kamerunischen Abend bis zum interkulturellen Fest.</p><p>Seit April 2026 außerdem <b>Beauftragter für pädagogische Angelegenheiten der Clausthaler Studenten aus Kamerun (CSK)</b>: Mentoring und Studienberatung für Studierende, die denselben Weg gehen wie ich damals.</p>",
    en:"<p>As <b>president of the African Cultural Association Clausthal</b> (since May 2022) I am responsible for budget, sponsorship and events, from Cameroonian nights to intercultural festivals.</p><p>Since April 2026 I am also <b>officer for educational affairs of the Cameroonian Students of Clausthal (CSK)</b>: mentoring and guidance for students walking the same path I once did.</p>"}},
];
const stationVon = key => stationen.find(s => s.key===key);
stationen.forEach(s => {
  s.gebaeude = gebaeude.find(g => g.tuerX===s.x && g.tuerY===s.y) || null;
  if(s.gebaeude) s.gebaeude.station = s;
  s.gruppe = (s.typ==="projekt") ? "projekte" : (s.typ==="engagement") ? "engagement" : (s.typ==="reise"||s.typ==="beruf") ? "weg" : "extra";
});
const GRUPPEN = ["weg","projekte","engagement","extra"];
const MARKER_FARBE = {weg:"#f5b301", projekte:"#4fb3ff", engagement:"#4cd07d", extra:"#e2574c"};
/* Chronologische Reihenfolge für den Kompass */
const reihenfolge = ["apotheke","bio","berlin","kindergarten","oberharz","tu","daimler","pflegebrille","mazars","vereine","gremien","chengdu","nachhaltigkeit","p3","freiburg","p1","p2","p4","p5","p6","p7","werkzeuge","kontakt"];

/* Aufräumen: kein Baum in einem 1-Kachel-Ring um Gebäude, Stationen, Wegweiser, Feuer und NPC-Heimat */
function grundKachel(x,y){
  if(imSchnee(x,y)) return SCHNEE;
  const t = at(x,y);
  if(t===PALME){ return (x<=4 || y>=29) ? SAND : ERDE; }
  return GRAS;
}
function raeumeRing(x0,y0,x1,y1){
  for(let j=y0;j<=y1;j++) for(let i=x0;i<=x1;i++){
    const t = at(i,j);
    if(t===TANNE || t===BAUM || t===PALME || t===LAUB) set(i,j,grundKachel(i,j));
  }
}
gebaeude.forEach(g => raeumeRing(g.x-1, g.y-1, g.x+g.w, g.y+g.h+1));   // Kronen ragen zwei Zeilen hoch: auch die Zeile unter der Tür freihalten
stationen.forEach(s => raeumeRing(s.x-1, s.y-1, s.x+1, s.y+2));
wegweiser.forEach(w => raeumeRing(w.x-1, w.y-1, w.x+1, w.y+1));
feuerstellen.forEach(([fx,fy]) => raeumeRing(fx-1, fy-1, fx+1, fy+1));
npcs.forEach(n => raeumeRing(n.heim[0]-1, n.heim[1]-1, n.heim[0]+1, n.heim[1]+2));
baenke.forEach(([bx,by]) => raeumeRing(bx-1, by, bx+1, by+1));
straeucher.forEach(([bx,by]) => { const t = at(bx,by); if(t===TANNE||t===BAUM||t===PALME||t===LAUB) set(bx,by,grundKachel(bx,by)); });

/* ---------- Spieler, Kollision, Fortschritt ---------- */
const spieler = { x: 10*TILE+3, y: 28*TILE+2, b: 10, h: 12, richtung:"unten", laeuft:false, bewegt:false };
const GESCHWINDIGKEIT = 1.6;   // Weltpixel pro 60-Hz-Frame, wird mit dt skaliert
const besucht = new Set();
let finaleGezeigt = false;
function ladeFortschritt(){
  try{
    const roh = JSON.parse(speicher.get("bd-besucht") || "[]");
    roh.forEach(k => { if(stationVon(k)) besucht.add(k); });
  }catch(e){}
  finaleGezeigt = speicher.get("bd-finale")==="1";
}
function speichereFortschritt(){ speicher.set("bd-besucht", JSON.stringify([...besucht])); }
ladeFortschritt();

function blockiert(px_,py_, breite, hoehe){
  const b = breite||spieler.b, h = hoehe||spieler.h;
  const punkte = [[px_,py_],[px_+b,py_],[px_,py_+h],[px_+b,py_+h]];
  return punkte.some(([qx,qy])=>{
    const tx = Math.floor(qx/TILE), ty = Math.floor(qy/TILE);
    if(tx<0||tx>=W||ty<0||ty>=H) return true;
    return SOLID.has(at(tx,ty)) || gebaeudeSolid(tx,ty) || feuerSolid.has(ty*W+tx) || dekoSolid.has(ty*W+tx);
  });
}
const kachelFrei = (tx,ty)=> !blockiert(tx*TILE+3, ty*TILE+2);
const spielerKachel = ()=> [Math.floor((spieler.x+spieler.b/2)/TILE), Math.floor((spieler.y+spieler.h/2)/TILE)];

/* ---------- Eingabe: Tastatur, Steuerkreuz, Tippen ---------- */
const tasten = {};
let pfad = null, pfadZiel = null;     // Tap-to-walk: Liste von Kacheln, Ziel-Aktion
let ersteBewegung = false;
function alleTastenLos(){ for(const k in tasten) tasten[k]=false; document.querySelectorAll("#dpad button").forEach(b=>b.classList.remove("gedrueckt")); }
window.addEventListener("blur", alleTastenLos);
document.addEventListener("visibilitychange", ()=>{ if(document.hidden) alleTastenLos(); });
window.addEventListener("mouseup", ()=>{ ["arrowup","arrowdown","arrowleft","arrowright"].forEach(k=>{ if(tasten["dpad_"+k]){ tasten["dpad_"+k]=false; tasten[k]=false; } }); });

function brichPfadAb(){ pfad = null; pfadZiel = null; tippMarke = null; }
window.addEventListener("keydown", e=>{
  const ziel = e.target;
  const inSteuerelement = ziel && (ziel.tagName==="BUTTON" || ziel.tagName==="A" || ziel.tagName==="INPUT" || ziel.tagName==="TEXTAREA");
  const key = e.key.toLowerCase();
  const pfeil = ["arrowup","arrowdown","arrowleft","arrowright"].includes(key);
  const imSpiel = gestartet && !modalOffen && !karteOffen;
  if(imSpiel && (pfeil || (key===" " && !inSteuerelement))) e.preventDefault();
  if(e.repeat) return;
  if(key==="escape"){ if(modalOffen||karteOffen||aktiverNpc||pfad){ e.preventDefault(); abbrechen(); } return; }
  if(!gestartet) return;
  if(karteOffen){ if(key==="m") schliesseKarte(); return; }
  if(modalOffen){ if((key==="enter"||key===" ") && !inSteuerelement){ e.preventDefault(); schliesseModal(); } return; }
  if(key==="enter" || key===" " || key==="e"){ if(!inSteuerelement){ e.preventDefault(); aktion(); } return; }
  if(key==="m"){ oeffneKarte(); return; }
  if(key==="c"){ oeffneStationDirekt("kontakt"); return; }
  if(pfeil || ["w","a","s","d"].includes(key)){ tasten[key]=true; brichPfadAb(); }
});
window.addEventListener("keyup", e=>{ tasten[e.key.toLowerCase()] = false; });

document.querySelectorAll("#dpad button").forEach(b=>{
  const mapKey = {up:"arrowup",down:"arrowdown",left:"arrowleft",right:"arrowright"}[b.dataset.r];
  const an = e => { e.preventDefault(); tasten[mapKey]=true; tasten["dpad_"+mapKey]=true; b.classList.add("gedrueckt"); brichPfadAb(); if(aktiverNpc) schliesseNpcDialog(); };
  const aus = e => { if(e) e.preventDefault(); tasten[mapKey]=false; tasten["dpad_"+mapKey]=false; b.classList.remove("gedrueckt"); };
  b.addEventListener("pointerdown", an);
  b.addEventListener("pointerup", aus); b.addEventListener("pointercancel", aus); b.addEventListener("pointerleave", aus);
  b.addEventListener("contextmenu", e=>e.preventDefault());
});
$("aktionBtn").addEventListener("pointerdown", e=>{ e.preventDefault(); if(modalOffen) schliesseModal(); else aktion(); });

/* Tippen/Klicken in die Welt: Station, NPC oder Ziel-Kachel */
let kamOx = 0, kamOy = 0;
let tippMarke = null;   // {x,y,t} kleine Zielmarkierung
canvas.addEventListener("pointerdown", e=>{
  if(!gestartet || modalOffen || karteOffen) return;
  if(e.pointerType==="mouse" && e.button!==0) return;
  e.preventDefault();
  canvas.focus({preventScroll:true});
  const r = canvas.getBoundingClientRect();
  const wx = (e.clientX - r.left)/SCALE + kamOx, wy = (e.clientY - r.top)/SCALE + kamOy;
  tippeAuf(wx, wy);
});
function tippeAuf(wx, wy){
  const tx = Math.floor(wx/TILE), ty = Math.floor(wy/TILE);
  let ziel = null, zielAktion = null, best = 1.6;
  /* Tipp auf ein Haus führt zu dessen Tür (und öffnet die zugehörige Station) */
  const geb = gebaeude.find(g => tx>=g.x && tx<g.x+g.w && ty>=g.y-1 && ty<g.y+g.h);
  if(geb){ ziel = [geb.tuerX, geb.tuerY]; zielAktion = geb.station ? {station:geb.station} : null; }
  else stationen.forEach(s => {
    const d = Math.hypot(s.x+0.5 - wx/TILE, s.y+0.5 - (wy-8)/TILE);
    if(d < best){ best = d; ziel = [s.x, s.y]; zielAktion = {station:s}; }
  });
  if(!ziel){
    best = 1.4;
    npcs.forEach(n => {
      const d = Math.hypot((n.x+5)/TILE - wx/TILE, (n.y+8)/TILE - wy/TILE);
      if(d < best){ best = d; ziel = [Math.floor((n.x+5)/TILE), Math.floor((n.y+8)/TILE)]; zielAktion = {npc:n}; }
    });
  }
  if(!ziel){ ziel = [tx,ty]; zielAktion = null; }
  if(aktiverNpc) schliesseNpcDialog();
  if(zielAktion && zielAktion.npc){
    /* Direkt neben dem NPC stehen reicht */
    const [sx,sy] = spielerKachel();
    if(Math.abs(sx-ziel[0])<=1 && Math.abs(sy-ziel[1])<=1){ zeigeNpcDialog(zielAktion.npc); return; }
  }
  const p = findePfad(ziel[0], ziel[1]);
  if(p){ pfad = p; pfadZiel = zielAktion; tippMarke = {x:ziel[0], y:ziel[1], t:0}; alleTastenLos(); }
  else if(zielAktion && zielAktion.station && aktiveStation===zielAktion.station){ oeffneStation(zielAktion.station); }
}
/* Breitensuche auf dem Kachelraster mit der echten Kollisionsfunktion */
function findePfad(zx, zy){
  if(zx<0||zy<0||zx>=W||zy>=H) return null;
  if(!kachelFrei(zx,zy)){
    /* Nächste freie Nachbarkachel nehmen (z. B. bei Tipp auf ein Haus oder einen Baum) */
    let ersatz = null, d0 = 9;
    for(let j=-2;j<=2;j++) for(let i=-2;i<=2;i++){
      const nx=zx+i, ny=zy+j;
      if(nx<0||ny<0||nx>=W||ny>=H||!kachelFrei(nx,ny)) continue;
      const d = Math.abs(i)+Math.abs(j)+(j<0?0.5:0);
      if(d<d0){ d0=d; ersatz=[nx,ny]; }
    }
    if(!ersatz) return null;
    zx = ersatz[0]; zy = ersatz[1];
  }
  let [sx,sy] = spielerKachel();
  if(!kachelFrei(sx,sy)){
    const kand = [[sx,sy-1],[sx,sy+1],[sx-1,sy],[sx+1,sy]].find(([a,b])=>a>=0&&b>=0&&a<W&&b<H&&kachelFrei(a,b));
    if(!kand) return null; sx=kand[0]; sy=kand[1];
  }
  if(sx===zx && sy===zy) return [[zx,zy]];
  const vor = new Int32Array(W*H).fill(-1);
  const queue = [sy*W+sx]; vor[sy*W+sx] = sy*W+sx;
  let gefunden = false;
  for(let qi=0; qi<queue.length && !gefunden; qi++){
    const cur = queue[qi], cx = cur%W, cy = Math.floor(cur/W);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=cx+dx, ny=cy+dy;
      if(nx<0||ny<0||nx>=W||ny>=H) continue;
      const ni = ny*W+nx;
      if(vor[ni]!==-1 || !kachelFrei(nx,ny)) continue;
      vor[ni] = cur; queue.push(ni);
      if(nx===zx && ny===zy){ gefunden = true; break; }
    }
  }
  if(!gefunden) return null;
  const weg = [];
  let i = zy*W+zx;
  while(i !== sy*W+sx){ weg.push([i%W, Math.floor(i/W)]); i = vor[i]; }
  weg.push([sx,sy]);
  weg.reverse();
  return weg;
}

/* ---------- Ton (WebAudio, ohne Dateien) ---------- */
const audio = { ctx:null, an: speicher.get("bd-ton")==="1" };
function audioStart(){
  if(!audio.an) return;
  if(!audio.ctx){ try{ audio.ctx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  if(audio.ctx && audio.ctx.state==="suspended") audio.ctx.resume();
}
function piep(freq, dauer, typ, lautst, wann){
  if(!audio.an || !audio.ctx) return;
  try{
    const t = audio.ctx.currentTime + (wann||0);
    const o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
    o.type = typ||"square"; o.frequency.value = freq;
    g.gain.setValueAtTime(lautst||0.04, t); g.gain.exponentialRampToValueAtTime(0.0001, t+dauer);
    o.connect(g).connect(audio.ctx.destination); o.start(t); o.stop(t+dauer+0.02);
  }catch(e){}
}
const klang = {
  sammeln(){ piep(523,0.12,"square",0.05,0); piep(659,0.12,"square",0.05,0.09); piep(784,0.22,"square",0.05,0.18); },
  blip(){ piep(440,0.06,"square",0.035,0); piep(660,0.07,"square",0.035,0.06); },
  schritt(n){ piep(n%2?150:125,0.03,"triangle",0.012,0); },
  karte(){ piep(392,0.08,"square",0.035,0); piep(523,0.1,"square",0.035,0.08); },
  fanfare(){ [523,659,784,1047,784,1047].forEach((f,i)=>piep(f,0.22,"square",0.05,i*0.14)); },
  knall(){ piep(90,0.25,"sawtooth",0.04,0); },
};
function setzeTon(an){
  audio.an = an; speicher.set("bd-ton", an?"1":"0");
  $("tonBtnText").textContent = an ? T().tonAn : T().tonAus;
  $("tonBtn").setAttribute("aria-pressed", an?"true":"false");
  if(an){ audioStart(); klang.blip(); }
}
$("tonBtn").addEventListener("click", e=>{ setzeTon(!audio.an); if(e.detail>0 && gestartet) canvas.focus({preventScroll:true}); });

/* ---------- UI: Sprache, HUD, Toast, Banner ---------- */
let gestartet = false;
function wendeSpracheAn(){
  const t = T();
  document.documentElement.lang = sprache;
  $("titelSub").textContent = t.sub;
  $("titelTag").textContent = t.tag;
  $("titelProfil").innerHTML = t.profil;
  $("lebenslaufBtn").textContent = t.lebenslauf; $("lebenslaufBtn").href = t.lebenslaufHref;
  $("titelPdf").textContent = t.pdf;
  $("titelHinweis").innerHTML = touchGeraet ? t.hinweisTouch(stationen.length) : t.hinweisTastatur(stationen.length);
  $("impressumBtn").textContent = t.impressum;
  $("hilfe").textContent = t.hilfe;
  const kl = $("klassischLink"); kl.textContent = t.klassisch; kl.href = t.klassischHref;
  $("karteBtnText").textContent = t.karte; $("kontaktBtnText").textContent = t.kontakt;
  $("tonBtnText").textContent = audio.an ? t.tonAn : t.tonAus;
  $("modalZuText").textContent = t.weiter;
  $("karteTitel").textContent = t.uebersicht; $("karteZuText").textContent = t.schliessen;
  $("karteReset").textContent = t.reset; $("karteImpressum").textContent = t.impressum.toUpperCase();
  $("karteLegende").textContent = t.legende;
  document.querySelectorAll(".sprach-toggle span[data-l]").forEach(sp => sp.classList.toggle("aktiv", sp.dataset.l===sprache));
  document.querySelectorAll(".sprach-toggle").forEach(b => b.setAttribute("aria-label", t.sprachLabel));
  document.title = t.seitentitel;
  canvas.setAttribute("aria-label", t.canvasLabel);
  $("karteCanvas").setAttribute("aria-label", t.karteLabel);
  $("dpad").setAttribute("aria-label", t.dpadLabel);
  $("aktionBtn").setAttribute("aria-label", t.aktionLabel);
  $("playBtn").textContent = (besucht.size>0 && besucht.size<stationen.length) ? t.weiterspielen(besucht.size, stationen.length) : t.play;
  $("neuStartBtn").textContent = t.neuStart; $("neuStartBtn").hidden = besucht.size===0;
  aktualisiereZaehler();
  if(karteOffen) fuelleKarteListe();
  if(aktiverNpc) fuelleNpcDialog(aktiverNpc);
  if(promptStation || promptNpc) zeigePrompt(promptStation, promptNpc);
}
function wechsleSprache(){
  sprache = sprache==="de" ? "en" : "de";
  speicher.set("bd-sprache", sprache);
  schildCache.clear();
  wendeSpracheAn();
}
$("sprachBtn").addEventListener("click", wechsleSprache);
$("sprachBtnSpiel").addEventListener("click", e=>{ wechsleSprache(); if(e.detail>0 && gestartet) canvas.focus({preventScroll:true}); });

let toastTimer = null;
function zeigeToast(html, ms){
  const el = $("toast");
  el.innerHTML = html; el.classList.add("an");
  if(touchGeraet){ el.style.top = Math.round($("hud").getBoundingClientRect().bottom + 10) + "px"; }
  else el.style.top = "";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove("an"), ms||4500);
}
$("toast").addEventListener("click", e=>{
  const a = e.target.closest("a[data-aktion]");
  if(a){ e.preventDefault(); if(a.dataset.aktion==="kontakt") oeffneStationDirekt("kontakt"); $("toast").classList.remove("an"); }
});
let bannerTimer = null;
const gezeigteZonen = new Set();
let aktuelleZone = null;
function zeigeBanner(zone){
  $("ortName").textContent = L(zone.name); $("ortSub").textContent = L(zone.sub);
  const el = $("ortBanner"); el.classList.add("an");
  clearTimeout(bannerTimer); bannerTimer = setTimeout(()=>el.classList.remove("an"), reduziert ? 1800 : 2400);
}

/* HUD-Zähler mit Gruppenbalken */
function gruppenStand(){
  const st = {};
  GRUPPEN.forEach(g => st[g] = {n:0, g:0});
  stationen.forEach(s => { st[s.gruppe].g++; if(besucht.has(s.key)) st[s.gruppe].n++; });
  return st;
}
function aktualisiereZaehler(bump){
  const t = T(), z = $("zaehler"), txt = $("zaehlerText");
  if(besucht.size === stationen.length){ txt.textContent = t.fertig(stationen.length); z.classList.add("fertig"); }
  else { txt.textContent = t.zaehler(besucht.size, stationen.length); z.classList.remove("fertig"); }
  const st = gruppenStand();
  GRUPPEN.forEach(g => { const i = z.querySelector(".hud-balken ."+g+" i"); if(i) i.style.setProperty("--anteil", Math.round(100*st[g].n/Math.max(1,st[g].g))+"%"); });
  if(bump && !reduziert){ z.classList.remove("bump"); void z.offsetWidth; z.classList.add("bump"); }
}

/* ---------- Prompt über der Figur ---------- */
let aktiveStation = null, npcInNaehe = null;
let promptStation = null, promptNpc = null;
function zeigePrompt(s, n){
  promptStation = s||null; promptNpc = n||null;
  $("promptText").textContent = s ? L(s.titel) : T().promptSprechen(n.name);
  $("prompt").classList.add("an");
}
function versteckePrompt(){ promptStation = null; promptNpc = null; $("prompt").classList.remove("an"); }
$("prompt").addEventListener("pointerdown", e=>{ e.preventDefault(); aktion(); });
function positionierePrompt(){
  if(!promptStation && !promptNpc) return;
  const r = canvas.getBoundingClientRect(), el = $("prompt"), hud = $("hud");
  const x = r.left + (spieler.x + spieler.b/2 - kamOx) * SCALE;
  let y = r.top + (spieler.y - 24 - kamOy) * SCALE;
  const minY = (hud.classList.contains("an") ? hud.getBoundingClientRect().bottom : 0) + el.offsetHeight + 8;
  let unten = false;
  if(y < minY){ y = r.top + (spieler.y + spieler.h + 8 - kamOy) * SCALE; unten = true; }   // kein Platz oben: unter die Figur
  const halb = el.offsetWidth/2 + 8;
  const cx = Math.max(halb, Math.min(window.innerWidth - halb, x));
  el.style.transform = "translate(" + Math.round(cx) + "px," + Math.round(y) + "px) translate(-50%," + (unten ? "0" : "-100%") + ")";
}
function aktion(){
  if(karteOffen){ schliesseKarte(); return; }
  if(modalOffen){ schliesseModal(); return; }
  if(aktiverNpc){ naechsteNpcZeile(); return; }
  if(aktiveStation){ oeffneStation(aktiveStation); return; }
  if(npcInNaehe){ zeigeNpcDialog(npcInNaehe); return; }
}
function abbrechen(){
  if(karteOffen) schliesseKarte();
  else if(modalOffen) schliesseModal();
  else if(aktiverNpc) schliesseNpcDialog();
  else brichPfadAb();
}

/* ---------- NPC-Dialog ---------- */
let aktiverNpc = null;
const npcDialogEl = $("npcDialog");
function fuelleNpcDialog(n){
  $("npcName").textContent = n.name + " · " + L(n.rolle);
  $("npcText").textContent = L(n.zeilen[n.gesagt % n.zeilen.length]);
}
function zeigeNpcDialog(n){
  aktiverNpc = n; n.dir=[0,0]; n.blickLinks = (spieler.x < n.x);
  fuelleNpcDialog(n);
  npcDialogEl.classList.add("an"); npcDialogEl.setAttribute("aria-hidden","false");
  versteckePrompt();
  klang.blip();
}
function naechsteNpcZeile(){
  const n = aktiverNpc; if(!n) return;
  if(n.zeilen.length > 1 && (n.gesagt % n.zeilen.length) < n.zeilen.length-1){ n.gesagt++; fuelleNpcDialog(n); klang.blip(); }
  else { n.gesagt++; schliesseNpcDialog(); }
}
function schliesseNpcDialog(){
  if(aktiverNpc){ aktiverNpc.letzteZeit = zeit; aktiverNpc = null; }
  npcDialogEl.classList.remove("an"); npcDialogEl.setAttribute("aria-hidden","true");
}
$("npcZu").addEventListener("click", schliesseNpcDialog);
npcDialogEl.addEventListener("click", e=>{ if(e.target.id!=="npcZu") naechsteNpcZeile(); });

/* ---------- Modal (Stationskarte) ---------- */
const modal = $("modal"), modalKarte = $("modalKarte");
let modalOffen = false, fokusVorher = null, modalSchliesstNach = null;
const partikel = [];
function oeffneKarteHtml(ort, titel, html, farbe){
  $("modalOrt").textContent = ort; $("modalTitel").textContent = titel; $("modalText").innerHTML = html;
  modalKarte.className = "modal-karte" + (farbe ? " "+farbe : "");
  fokusVorher = document.activeElement;
  modal.hidden = false; modalOffen = true;
  requestAnimationFrame(()=>{ modal.classList.add("sichtbar"); $("modalZu").focus({preventScroll:true}); });
  modalKarte.scrollTop = 0;
}
function oeffneStation(s){
  const neu = !besucht.has(s.key);
  const farbe = s.gruppe==="engagement" ? "gruen" : s.gruppe==="projekte" ? "blau" : s.gruppe==="extra" ? "rot" : "";
  oeffneKarteHtml(L(s.ort), L(s.titel), L(s.html), farbe);
  verfolge("station-" + s.key);
  const [ptx,pty] = spielerKachel(); speicher.set("bd-position", ptx+","+pty);
  if(neu){
    besucht.add(s.key); speichereFortschritt();
    aktualisiereZaehler(true); klang.sammeln();
    if(!reduziert) for(let i=0;i<14;i++) partikel.push({x:s.x*TILE+8, y:s.y*TILE+4, vx:(Math.random()-0.5)*1.8, vy:-1.5-Math.random()*1.4, leben:36+Math.random()*20, farbe: i%3===0 ? "#ffffff" : MARKER_FARBE[s.gruppe]});
    modalSchliesstNach = pruefeMeilensteine(s);
  }
  versteckePrompt();
}
function oeffneStationDirekt(key){ const s = stationVon(key); if(s){ if(karteOffen) schliesseKarte(); verfolge("hud-"+key); oeffneStation(s); } }
function schliesseModal(){
  modal.classList.remove("sichtbar"); modal.hidden = true; modalOffen = false;
  if(fokusVorher && fokusVorher.focus && fokusVorher!==document.body && !fokusVorher.closest("#hud")) fokusVorher.focus({preventScroll:true}); else canvas.focus({preventScroll:true});
  const danach = modalSchliesstNach; modalSchliesstNach = null;
  if(danach) danach();
  if(!finaleGezeigt && besucht.size === stationen.length){
    if(danach) setTimeout(()=>{ if(!modalOffen && !finaleGezeigt) starteFinale(); }, 2500);
    else starteFinale();
  }
}
$("modalZu").addEventListener("click", schliesseModal);
modal.addEventListener("click", e=>{ if(e.target===modal) schliesseModal(); });
/* Fokus bleibt im Dialog (Tab-Falle), für Stationskarte und Übersichtskarte */
function fokusFalle(container, innen){
  container.addEventListener("keydown", e=>{
    if(e.key!=="Tab") return;
    const f = innen.querySelectorAll("a[href], button:not([disabled])");
    if(!f.length) return;
    const erst = f[0], letzt = f[f.length-1];
    if(e.shiftKey && document.activeElement===erst){ e.preventDefault(); letzt.focus(); }
    else if(!e.shiftKey && document.activeElement===letzt){ e.preventDefault(); erst.focus(); }
  });
}
fokusFalle(modal, modalKarte);
fokusFalle($("karte"), $("karte").querySelector(".karte-kasten"));
function zeigeImpressum(){ const t = T(); oeffneKarteHtml(t.impressumOrt, t.impressumTitel, t.impressumHtml, ""); }
$("impressumBtn").addEventListener("click", zeigeImpressum);

/* Meilensteine: Viertel komplett, Zwischenhinweis nach drei Stationen; aus gespeichertem Fortschritt abgeleitet */
const meilensteine = new Set();
let fahneGehisst = false, festAmFeuer = false;
npcs.forEach(n => { n.heim0 = n.heim.slice(); n.radius0 = n.radius; });
function verlegeNpcsAnsFeuer(){
  festAmFeuer = true;
  npcs.filter(n=>["Amina","Fatou","David"].includes(n.name)).forEach((n,i)=>{ n.heim=[31+i, 23]; n.radius=1; });
}
function pruefeMeilensteine(s){
  const st = gruppenStand(), t = T();
  if(st.projekte.n===st.projekte.g && !meilensteine.has("projekte")){ meilensteine.add("projekte"); fahneGehisst = true; return ()=>{ zeigeToast(t.toastProjekte, 5000); klang.fanfare(); }; }
  if(st.engagement.n===st.engagement.g && !meilensteine.has("engagement")){ meilensteine.add("engagement"); verlegeNpcsAnsFeuer(); return ()=>{ zeigeToast(t.toastEngagement, 5000); klang.fanfare(); }; }
  if(st.weg.n===st.weg.g && !meilensteine.has("weg")){ meilensteine.add("weg"); return ()=>{ zeigeToast(t.toastWeg, 5000); klang.fanfare(); }; }
  if(besucht.size>=3 && !meilensteine.has("genug")){ meilensteine.add("genug"); return ()=>zeigeToast(t.toastGenug, 9000); }
  return null;
}
function leiteMeilensteineAb(){
  const st = gruppenStand();
  if(st.projekte.g && st.projekte.n===st.projekte.g){ meilensteine.add("projekte"); fahneGehisst = true; }
  if(st.engagement.g && st.engagement.n===st.engagement.g){ meilensteine.add("engagement"); verlegeNpcsAnsFeuer(); }
  if(st.weg.g && st.weg.n===st.weg.g) meilensteine.add("weg");
  if(besucht.size>=3) meilensteine.add("genug");
}
leiteMeilensteineAb();
function setzeFortschrittZurueck(){
  besucht.clear(); speicher.del("bd-besucht"); speicher.del("bd-finale"); speicher.del("bd-position");
  finaleGezeigt=false; meilensteine.clear(); fahneGehisst=false; festAmFeuer=false;
  npcs.forEach(n => { n.heim = n.heim0.slice(); n.radius = n.radius0; });
  feuerwerk.length = 0; feuerwerkBis = 0;
  aktualisiereZaehler(); wendeSpracheAn();
  if(karteOffen){ fuelleKarteListe(); zeichneUebersicht(); }
}

/* ---------- Übersichtskarte ---------- */
let karteOffen = false, karteFokusVorher = null;
const karteCanvas = $("karteCanvas"), kctx = karteCanvas.getContext("2d");
function oeffneKarte(){
  if(modalOffen) return;
  karteOffen = true; karteFokusVorher = null; $("karte").hidden = false; $("karteBtn").classList.add("an");
  fuelleKarteListe(); zeichneUebersicht(); klang.karte(); verfolge("karte");
  $("karteZu").focus({preventScroll:true});
}
function schliesseKarte(){
  karteOffen = false; $("karte").hidden = true; $("karteBtn").classList.remove("an");
  if(karteFokusVorher) karteFokusVorher.focus({preventScroll:true}); else canvas.focus({preventScroll:true});
}
$("karteBtn").addEventListener("click", e=>{ if(karteOffen){ schliesseKarte(); } else { oeffneKarte(); if(e.detail===0) karteFokusVorher = $("karteBtn"); } });
$("karteZu").addEventListener("click", schliesseKarte);
$("karte").addEventListener("click", e=>{ if(e.target===$("karte")) schliesseKarte(); });
$("kontaktBtn").addEventListener("click", e=>{ if(e.detail>0) canvas.focus({preventScroll:true}); oeffneStationDirekt("kontakt"); });
$("karteImpressum").addEventListener("click", ()=>{ schliesseKarte(); zeigeImpressum(); });
$("karteReset").addEventListener("click", ()=>{ if(window.confirm(T().resetFrage)) setzeFortschrittZurueck(); });
$("neuStartBtn").addEventListener("click", ()=>{ if(window.confirm(T().resetFrage)) setzeFortschrittZurueck(); });
function fuelleKarteListe(){
  const t = T(), st = gruppenStand();
  $("karteStand").textContent = t.stand(besucht.size, stationen.length);
  let html = "";
  GRUPPEN.forEach(g => {
    html += "<h3 class='"+g+"'>"+t.gruppen[g]+" · "+st[g].n+"/"+st[g].g+"</h3><ul>";
    stationen.filter(s=>s.gruppe===g).forEach(s => { html += "<li class='"+(besucht.has(s.key)?"":"offen")+"'>"+L(s.titel)+(s.kern?" ★":"")+"</li>"; });
    html += "</ul>";
  });
  $("karteListe").innerHTML = html;
}
const KARTENFARBE = {[GRAS]:"#3e7c47",[GRAS2]:"#3a7442",[BLUME]:"#4a8a50",[SAND]:"#dfc98a",[ERDE]:"#a8563a",[PLAZA]:"#a9a9b6",[WEG]:"#c9a06a",
  [WASSER]:"#2f7fae",[EIS]:"#bcd6ea",[SCHNEE]:"#e7edf3",[TANNE]:"#1e5631",[BAUM]:"#2c7a3a",[LAUB]:"#7c9a2e",[PALME]:"#3f9147"};
function zeichneUebersicht(){
  const g = kctx, k = 4;
  g.imageSmoothingEnabled = false;
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const t = at(x,y);
    g.fillStyle = (t===TANNE && imSchnee(x,y)) ? "#8fb3a3" : (KARTENFARBE[t] || "#3e7c47");
    g.fillRect(x*k, y*k, k, k);
  }
  gebaeude.forEach(b => { g.fillStyle = "#"+(b.dach||"555555"); g.fillRect(b.x*k, b.y*k, b.w*k, b.h*k); g.fillStyle="rgba(0,0,0,0.35)"; g.fillRect(b.x*k, (b.y+b.h)*k-1, b.w*k, 1); });
  zonen.forEach(z => {
    if(z.key==="rastatt") return;
    const name = L(z.name), bw = textBreite(name)+4;
    const zx = Math.round(Math.min(W*k-bw-1, Math.max(1, (z.x+z.w/2)*k - bw/2))), zy = Math.max(1, z.y*k - 8);
    g.fillStyle="rgba(15,20,32,0.8)"; g.fillRect(zx, zy, bw, 7);
    zeichneText(g, name, zx+2, zy+1, "#ffffff");
  });
  stationen.forEach(s => {
    const b = besucht.has(s.key);
    g.fillStyle = "#141824"; g.fillRect(s.x*k-1, s.y*k-1, k+2, k+2);
    g.fillStyle = b ? "#6b7688" : MARKER_FARBE[s.gruppe]; g.fillRect(s.x*k, s.y*k, k, k);
    if(s.kern && !b){ g.fillStyle = "#ffffff"; g.fillRect(s.x*k+1, s.y*k+1, 2, 2); }
  });
  const [sx,sy] = spielerKachel();
  g.fillStyle = "#ffffff"; g.fillRect(sx*k-2, sy*k+1, k+4, 2); g.fillRect(sx*k+1, sy*k-2, 2, k+4);
  g.fillStyle = "#e2574c"; g.fillRect(sx*k-1, sy*k+1, k+2, 2); g.fillRect(sx*k+1, sy*k-1, 2, k+2);
}

/* ---------- Finale: Nacht, Feuerwerk, Dankeskarte ---------- */
let nacht = 0, feuerwerkBis = 0;
const feuerwerk = [];
function starteFinale(){
  finaleGezeigt = true; speicher.set("bd-finale","1"); verfolge("finale");
  if(reduziert){ const t=T(); oeffneKarteHtml(t.finaleOrt, t.finaleTitel, t.finaleHtml(stationen.length), ""); return; }
  feuerwerkBis = zeit + 300;
  klang.fanfare();
  setTimeout(()=>{ const t=T(); oeffneKarteHtml(t.finaleOrt, t.finaleTitel, t.finaleHtml(stationen.length), ""); }, 4200);
}
function feuerwerkTick(dt){
  if(zeit < feuerwerkBis){
    nacht = Math.min(1, nacht + 0.02*dt);
    if(Math.random() < 0.06*dt){
      const cx = spieler.x + (Math.random()-0.5)*canvas.width*0.8, cy = spieler.y - 40 - Math.random()*60;
      const farbe = ["#f5b301","#e2574c","#4fb3ff","#4cd07d","#ffffff"][Math.floor(Math.random()*5)];
      for(let i=0;i<26;i++){ const a = Math.random()*Math.PI*2, v = 0.6+Math.random()*1.6; feuerwerk.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,leben:40+Math.random()*30,farbe}); }
      klang.knall();
    }
  } else if(nacht>0 && feuerwerkBis>0 && !modalOffen){ nacht = Math.max(0, nacht - 0.01*dt); }
  for(let i=feuerwerk.length-1;i>=0;i--){ const p=feuerwerk[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=0.03*dt; p.leben-=dt; if(p.leben<=0) feuerwerk.splice(i,1); }
}

/* ---------- Bodenschicht: einmal in zwei Offscreen-Canvases (Wasserphase 0/1) gebacken ---------- */
let zeit = 0;
const bodenCanvas = [null, null];
const BAECHLE_Y = 7, BAECHLE_X0 = 36, BAECHLE_X1 = 45;   // Freiburger Bächle, nicht solide

function zeichneKachelIn(g, t, tx, ty, ph){
  const sx = tx*TILE, sy = ty*TILE;
  const schnee = imSchnee(tx,ty);
  switch(t){
    case SCHNEE:
      px(g,"#e7edf3",sx,sy,TILE,TILE);
      if(hash(tx,ty)%3===0){ px(g,"#d9e2ea",sx+(hash(tx,ty)%9)+2,sy+(hash(ty,tx)%9)+3,2,1); }
      if(hash(tx+1,ty)%5===0){ px(g,"#ffffff",sx+(hash(ty,tx+3)%12)+1,sy+(hash(tx,ty+5)%12)+1,1,1); }
      break;
    case GRAS: case GRAS2: case BLUME: case BAUM: case TANNE: case LAUB:
      px(g, schnee ? "#e7edf3" : "#3e7c47", sx,sy,TILE,TILE);
      if(t===GRAS2 && !schnee){ if(!zeichneSprite("tuft", 0, sx+TILE/2, sy+13, false, g)){ px(g,"#356e3e",sx+3,sy+4,2,2); px(g,"#356e3e",sx+10,sy+9,2,2); } }
      if(t===BLUME){ px(g,"#e2574c",sx+4,sy+5,2,2); px(g,"#f5b301",sx+10,sy+9,2,2); px(g,"#ffffff",sx+7,sy+11,1,1); }
      break;
    case SAND: case PALME:
      px(g,"#dfc98a",sx,sy,TILE,TILE); px(g,"#d1b978",sx+6,sy+6,2,1); px(g,"#d1b978",sx+11,sy+11,2,1);
      if(hash(tx,ty)%4===0) px(g,"#ecdba6",sx+(hash(ty,tx)%10)+2,sy+(hash(tx,ty+1)%10)+2,1,1);
      break;
    case ERDE:
      px(g,"#a8563a",sx,sy,TILE,TILE); px(g,"#9a4a30",sx+3,sy+4,3,1); px(g,"#9a4a30",sx+10,sy+11,3,1);
      if(hash(tx,ty)%3===0) px(g,"#b8674a",sx+(hash(ty,tx)%11)+2,sy+(hash(tx,ty+2)%11)+2,2,1);
      break;
    case PLAZA:
      if(!fuelleTextur("boden_plaza", sx, sy, TILE, TILE, g)){ px(g,"#b9b9c4",sx,sy,TILE,TILE); g.strokeStyle="#a5a5b2"; g.lineWidth=1; g.strokeRect(sx+0.5,sy+0.5,TILE-1,TILE-1); }
      break;
    case WEG:
      if(!fuelleTextur("boden_weg", sx, sy, TILE, TILE, g)){ px(g,"#c9a06a",sx,sy,TILE,TILE); px(g,"#ba9159",sx+4,sy+5,2,2); px(g,"#ba9159",sx+10,sy+11,2,2); }
      if(schnee){ /* Schneematsch und Fußspuren auf dem Weg zur TU */
        g.fillStyle="rgba(231,237,243,0.55)"; g.fillRect(sx,sy,TILE,TILE);
        px(g,"#b8a27e",sx+4,sy+2,2,3); px(g,"#b8a27e",sx+9,sy+9,2,3);
      }
      break;
    case EIS:
      px(g,"#bcd6ea",sx,sy,TILE,TILE); px(g,"#a7c4dc",sx+2,sy+9,6,1); px(g,"#a7c4dc",sx+7,sy+4,1,5); px(g,"#dfeefb",sx+10,sy+12,4,1);
      break;
    case WASSER: {
      const name = ((tx+ty+ph)%2===0) ? "wasser1" : "wasser2";
      if(!fuelleTextur(name, sx, sy, TILE, TILE, g)){
        px(g,"#2f7fae",sx,sy,TILE,TILE); px(g,"#3c92c4",sx+2+ph*2,sy+4+ph*5,4,1); px(g,"#3c92c4",sx+9,sy+10-ph*7,4,1);
      }
      g.fillStyle="rgba(232,244,250,0.75)";
      if(at(tx,ty-1)!==WASSER && ty>0) g.fillRect(sx, sy, TILE, 2);
      if(at(tx,ty+1)!==WASSER && ty<H-1) g.fillRect(sx, sy+TILE-2, TILE, 2);
      if(at(tx-1,ty)!==WASSER && tx>0) g.fillRect(sx, sy, 2, TILE);
      if(at(tx+1,ty)!==WASSER && tx<W-1) g.fillRect(sx+TILE-2, sy, 2, TILE);
      break; }
  }
}
/* Übergänge: gezackter Schneerand, Sandrand, Erdlinie am Weg, Steinkante an der Plaza */
function zeichneKanten(g, tx, ty){
  const t = at(tx,ty), fam = BODEN_FAMILIE[t];
  const sx = tx*TILE, sy = ty*TILE;
  const nachbarn = [[0,-1],[1,0],[0,1],[-1,0]];
  nachbarn.forEach(([dx,dy],ri)=>{
    const nt = at(tx+dx,ty+dy), nf = BODEN_FAMILIE[nt];
    if(nf===fam || nf==="wasser" || fam==="wasser" || fam==="eis") return;
    const rand = (x,y,w,h)=>g.fillRect(x,y,w,h);
    const kante = (farbe, dicke, muster)=>{
      g.fillStyle = farbe;
      for(let i=0;i<TILE;i+=2){
        const d = muster ? (hash(tx*16+i, ty*16+ri)%3===0 ? dicke+1 : dicke) : dicke;
        if(ri===0) rand(sx+i, sy, 2, d); else if(ri===2) rand(sx+i, sy+TILE-d, 2, d);
        else if(ri===3) rand(sx, sy+i, d, 2); else rand(sx+TILE-d, sy+i, d, 2);
      }
    };
    if(nf==="schnee") kante("#e7edf3", 2, true);
    else if(fam==="sand" && nf==="gras") kante("#c9b476", 1, true);
    else if(fam==="gras" && nf==="sand") kante("#dfc98a", 1, true);
    else if(fam==="erde" && (nf==="gras"||nf==="sand")) kante("#8e4128", 1, true);
    else if(fam==="gras" && nf==="erde") kante("#a8563a", 1, true);
    else if(fam==="weg" && (nf==="gras"||nf==="schnee")) kante("#8f6a3c", 1, false);
    else if(fam==="gras" && nf==="weg") kante("#2f6a3a", 1, true);
    else if(fam==="plaza" && nf!=="plaza") kante("#8d8d9c", 1, false);
  });
}
function zoneTint(g){
  /* Nur die Plaza-Kacheln einfärben, damit Wege ohne Naht weiterlaufen: Berlin kühl, Freiburg warm */
  g.globalCompositeOperation = "multiply";
  for(let ty=0;ty<H;ty++) for(let tx=0;tx<W;tx++){
    if(at(tx,ty)!==PLAZA) continue;
    const z = zoneBei(tx,ty);
    if(!z) continue;
    if(z.key==="berlin") g.fillStyle = "#c9cfdc"; else if(z.key==="freiburg") g.fillStyle = "#e6d2b8"; else continue;
    g.fillRect(tx*TILE, ty*TILE, TILE, TILE);
  }
  g.globalCompositeOperation = "source-over";
}
function zeichneBaechle(g, ph){
  const y = BAECHLE_Y*TILE + 5;
  for(let x=BAECHLE_X0; x<=BAECHLE_X1; x++){
    const sx = x*TILE;
    px(g,"#8d8d9c",sx,y-1,TILE,8); px(g,"#2f7fae",sx,y,TILE,6);
    px(g,"#3c92c4",sx+((x+ph)%2)*6+1,y+1,4,1); px(g,"#5fb0dc",sx+((x+ph+1)%2)*7+2,y+4,3,1);
    px(g,"#dfeefb",sx+(hash(x,ph)%10)+2,y+2,1,1);
  }
}
function baueBoden(){
  for(let ph=0; ph<2; ph++){
    const c = neuesCanvas(W*TILE, H*TILE), g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    for(let ty=0;ty<H;ty++) for(let tx=0;tx<W;tx++) zeichneKachelIn(g, at(tx,ty), tx, ty, ph);
    for(let ty=0;ty<H;ty++) for(let tx=0;tx<W;tx++) zeichneKanten(g, tx, ty);
    zoneTint(g);
    zeichneBaechle(g, ph);
    /* Bänke gehören zur Bodenschicht */
    baenke.forEach(([bx,by])=>{
      const sx=bx*TILE, sy=by*TILE;
      px(g,"#1c1a20",sx,sy+2,16,13);
      px(g,"#8a6236",sx+1,sy+6,14,4); px(g,"#6e4c26",sx+2,sy+10,2,4); px(g,"#6e4c26",sx+12,sy+10,2,4); px(g,"#9c7442",sx+1,sy+3,14,2);
    });
    bodenCanvas[ph] = c;
  }
}

/* ---------- Gebäude nach Typ ---------- */
function wandFuellen(g, ox, oy){
  return (x,y,w,h)=>{ if(!(g.wand && fuelleTextur("wand_"+g.wand, x, y, w, h))){ ctx.fillStyle = "#"+(g.wand||"cfd4dc"); ctx.fillRect(x,y,w,h); } };
}
function dachFuellen(g){
  return (x,y,w,h)=>{ if(!(g.dach && fuelleTextur("dach_"+g.dach, x, y, w, h))){ ctx.fillStyle = "#"+(g.dach||"5a3f30"); ctx.fillRect(x,y,w,h); } };
}
function zeichneTuer(x, y){ px(ctx,"#1c1a20",x-1,y-1,8,9); px(ctx,"#4a3220",x,y,6,8); px(ctx,"#f5b301",x+4,y+4,1,1); }
function zeichneFenster(x, y, w, h){ px(ctx,"#1c1a20",x-1,y-1,w+2,h+2); px(ctx,"#9ecbe8",x,y,w,h); px(ctx,"#e9f6ff",x+1,y+1,1,1); }
function zeichneSchildText(text, mitte, y){
  const c = schild(text);
  ctx.drawImage(c, Math.round(mitte - c.width/2), Math.round(y));
}
function zeichneGebaeude(g, ox, oy){
  const sx = g.x*TILE-ox, sy = g.y*TILE-oy, bw = g.w*TILE, bh = g.h*TILE;
  const mitte = sx + Math.floor(bw/2);
  const wand = wandFuellen(g), dach = dachFuellen(g);
  let text = L(g.schild);
  if(g.station && g.station.jahr) text += " · " + g.station.jahr;
  if(g.typ==="stand"){
    px(ctx,"#1c1a20",sx+1,sy-8,bw-2,bh+8);
    px(ctx,"#5c3a1a",sx+2,sy-6,2,bh+5); px(ctx,"#5c3a1a",sx+bw-4,sy-6,2,bh+5);
    for(let i=0;i<bw-4;i+=4) px(ctx, (i/4)%2 ? "#f0eee6" : "#e2574c", sx+2+i, sy-8, 4, 6);
    px(ctx,"#8a6236",sx+2,sy+bh-7,bw-4,5); px(ctx,"#f5b301",sx+4,sy+bh-6,3,2); px(ctx,"#4cd07d",sx+9,sy+bh-6,3,2); px(ctx,"#e2574c",sx+14,sy+bh-6,3,2);
    if(text) zeichneSchildText(text, mitte, sy-19);
    return;
  }
  if(g.typ==="fernsehturm"){
    const fx = mitte;   /* oberster Pixel bei sy-62, damit der Turm bei y=4 nicht über den Weltrand ragt */
    px(ctx,"#1c1a20",fx-3,sy-54,7,70);
    px(ctx,"#b9bcc6",fx-2,sy-52,5,68); px(ctx,"#e3e5ec",fx-1,sy-52,1,68);
    px(ctx,"#1c1a20",fx-7,sy-40,15,14); px(ctx,"#c9ccd6",fx-6,sy-39,13,12); px(ctx,"#8e93a3",fx-6,sy-33,13,2); px(ctx,"#e3e5ec",fx-4,sy-37,3,2);
    px(ctx,"#1c1a20",fx-1,sy-62,3,9); px(ctx,"#e2574c",fx,sy-62,1,2);
    px(ctx,"#1c1a20",fx-6,sy+8,13,8); px(ctx,"#9ea3b3",fx-5,sy+9,11,6); zeichneTuer(fx-3, sy+8);
    if(text) zeichneSchildText(text, mitte, sy-30);
    return;
  }
  if(g.typ==="pagode"){
    wand(sx, sy+4, bw, bh-4);
    px(ctx,"#1c1a20",sx-3,sy+2,bw+6,1);
    dach(sx-3, sy-6, bw+6, 9); dach(sx+2, sy-14, bw-4, 7);
    px(ctx,"#1c1a20",sx-4,sy-7,3,3); px(ctx,"#1c1a20",sx+bw+1,sy-7,3,3); px(ctx,"#8e1e12",sx-4,sy-8,2,2); px(ctx,"#8e1e12",sx+bw+2,sy-8,2,2);
    px(ctx,"#1c1a20",sx+1,sy-15,3,3); px(ctx,"#1c1a20",sx+bw-4,sy-15,3,3);
    px(ctx,"#f5b301",sx-3,sy+3,bw+6,1); px(ctx,"#f5b301",sx+2,sy-6,bw-4,1);
    zeichneFenster(sx+4, sy+9, 5, 5); zeichneFenster(sx+bw-9, sy+9, 5, 5); zeichneTuer(mitte-3, sy+bh-8);
    if(text) zeichneSchildText(text, mitte, sy-26);
    return;
  }
  if(g.typ==="muenster"){
    wand(sx, sy+4, bw, bh-4);
    dach(sx-2, sy-4, bw+4, 10); px(ctx,"#1c1a20",sx-2,sy+5,bw+4,1);
    const tx = sx+6;            // Turm links, Rosette rechts; oberster Pixel bei sy-46 (Münster steht bei y=3)
    wand(tx-4, sy-20, 12, 26); px(ctx,"#1c1a20",tx-5,sy-21,14,1); px(ctx,"#1c1a20",tx-5,sy-20,1,26); px(ctx,"#1c1a20",tx+8,sy-20,1,26);
    px(ctx,"#8e1e12",tx-6,sy-24,16,4); px(ctx,"#8e1e12",tx-4,sy-28,12,4); px(ctx,"#8e1e12",tx-2,sy-32,8,4); px(ctx,"#8e1e12",tx,sy-36,4,4); px(ctx,"#8e1e12",tx+1,sy-40,2,4);
    px(ctx,"#f0ede2",tx+1,sy-46,2,6); px(ctx,"#f0ede2",tx-1,sy-44,6,2);
    px(ctx,"#1c1a20",tx,sy-16,4,7); px(ctx,"#1c1a20",tx,sy-6,4,5); px(ctx,"#9ecbe8",tx+1,sy-15,2,5); px(ctx,"#9ecbe8",tx+1,sy-5,2,3);
    px(ctx,"#1c1a20",sx+bw-16,sy+8,10,10); px(ctx,"#9ecbe8",sx+bw-15,sy+9,8,8); px(ctx,"#e2574c",sx+bw-12,sy+12,2,2); px(ctx,"#f5b301",sx+bw-14,sy+10,6,1); px(ctx,"#f5b301",sx+bw-14,sy+15,6,1);
    zeichneTuer(mitte-3, sy+bh-8);
    if(text) zeichneSchildText(text, mitte+6, sy+bh-24);
    return;
  }
  if(g.typ==="halle"){
    wand(sx, sy+4, bw, bh-4);
    dach(sx-2, sy-6, bw+4, 10); px(ctx,"#1c1a20",sx-2,sy-7,bw+4,1); px(ctx,"#1c1a20",sx-2,sy+4,bw+4,1);
    px(ctx,"rgba(0,0,0,0.25)",sx-2,sy+5,bw+4,2);
    px(ctx,"#1c1a20",sx+3,sy+8,bw-6,7); px(ctx,"#9ecbe8",sx+4,sy+9,bw-8,5);
    for(let i=sx+4+6;i<sx+bw-4;i+=6) px(ctx,"#1c1a20",i,sy+9,1,5);
    zeichneTuer(mitte-3, sy+bh-8);
    if(text) zeichneSchildText(text, mitte, sy-18);
    return;
  }
  /* haus (Giebeldach), kirche */
  wand(sx, sy+4, bw, bh-4);
  for(let r=0;r<10;r++){ const ein = Math.floor(r*0.6); dach(sx-2+ein, sy-8+r, bw+4-2*ein, 1); }
  px(ctx,"#1c1a20",sx-2,sy+2,bw+4,1); px(ctx,"rgba(0,0,0,0.22)",sx-2,sy+3,bw+4,2);
  px(ctx,"#1c1a20",sx+Math.floor(bw/2)-1,sy-10,3,3); px(ctx,"#e9e6dc",sx+Math.floor(bw/2),sy-9,1,2);
  if(bw>=40){ zeichneFenster(sx+5, sy+9, 6, 5); zeichneFenster(sx+bw-11, sy+9, 6, 5); } else { zeichneFenster(sx+4, sy+9, 5, 5); }
  zeichneTuer(mitte-3, sy+bh-8);
  if(g.kreuz){ px(ctx,"#1c1a20",sx+bw-11,sy+8,7,7); px(ctx,"#4cd07d",sx+bw-9,sy+9,3,5); px(ctx,"#4cd07d",sx+bw-10,sy+10,5,3); }
  if(g.briefkasten){ px(ctx,"#1c1a20",sx+bw-2,sy+bh-9,6,9); px(ctx,"#f5b301",sx+bw-1,sy+bh-8,4,5); px(ctx,"#1c1a20",sx+bw,sy+bh-6,2,1); px(ctx,"#5c3a1a",sx+bw,sy+bh-3,2,3); }
  if(g.werkzeug){ px(ctx,"#1c1a20",sx+bw-10,sy+7,6,8); px(ctx,"#8a6236",sx+bw-9,sy+8,4,6); px(ctx,"#c9cdd6",sx+bw-8,sy+9,2,2); }
  if(g.typ==="kirche"){
    const m = mitte;
    wand(m-5, sy-21, 10, 15); px(ctx,"#1c1a20",m-6,sy-21,1,15); px(ctx,"#1c1a20",m+5,sy-21,1,15);
    ctx.fillStyle = "#"+g.dach; ctx.fillRect(m-7, sy-25, 14, 5); ctx.fillRect(m-5, sy-28, 10, 3); ctx.fillRect(m-3, sy-31, 6, 3);
    px(ctx,"#f0ede2",m-1,sy-38,2,7); px(ctx,"#f0ede2",m-4,sy-35,8,2); px(ctx,"#2b3247",m-2,sy-18,4,5);
    if(imSchnee(g.x,g.y)){ px(ctx,"#eef3f8",m-7,sy-26,14,2); px(ctx,"#eef3f8",m-5,sy-29,10,1); }
  }
  if(text) zeichneSchildText(text, g.typ==="kirche" ? mitte+12 : mitte, g.typ==="kirche" ? sy+bh-24 : sy-17);
}

/* ---------- Marker, Wegweiser, Deko, Figuren ---------- */
function zeichneMarkerBoden(s, ox, oy){
  const sx = s.x*TILE-ox, sy = s.y*TILE-oy;
  const b = besucht.has(s.key), farbe = b ? "#6b7688" : MARKER_FARBE[s.gruppe];
  if(s.gebaeude){ px(ctx,"#1c1a20",sx+1,sy+1,14,5); px(ctx,farbe,sx+2,sy+2,12,3); px(ctx,"rgba(255,255,255,0.35)",sx+3,sy+2,10,1); }
  else { px(ctx,"#1c1a20",sx+3,sy+7,10,7); px(ctx,"#8f96a6",sx+4,sy+8,8,5); px(ctx,"#b9bfcc",sx+5,sy+8,3,1); px(ctx,farbe,sx+7,sy+9,2,3); }
}
function zeichneHaken(x, y){ px(ctx,"#ffffff",x,y+2,1,1); px(ctx,"#ffffff",x+1,y+3,1,1); px(ctx,"#ffffff",x+2,y+2,1,1); px(ctx,"#ffffff",x+3,y+1,1,1); px(ctx,"#ffffff",x+4,y,1,1); }
function zeichneMarker(s, ox, oy){
  const sx = s.x*TILE-ox+TILE/2, sy = s.y*TILE-oy + (reduziert ? 0 : Math.sin(zeit/14)*2);
  const b = besucht.has(s.key), farbe = b ? "#6b7688" : MARKER_FARBE[s.gruppe];
  const puls = (s.kern && !b && !reduziert && Math.floor(zeit/20)%2===0) ? 1 : 0;   // Kernstationen pulsieren
  if(s.gebaeude){
    /* Haus-Station: schwebende Raute über der Tür, die Tür selbst leuchtet warm; besucht = grauer Haken */
    const ty = sy - 13;
    px(ctx,"#141824",sx-4-puls,ty-1-puls,8+2*puls,8+2*puls);
    px(ctx,farbe,sx-3,ty,6,6); px(ctx,"#141824",sx-3,ty,1,1); px(ctx,"#141824",sx+2,ty,1,1); px(ctx,"#141824",sx-3,ty+5,1,1); px(ctx,"#141824",sx+2,ty+5,1,1);
    if(b) zeichneHaken(sx-2, ty+1); else px(ctx,"#ffffff",sx-1,ty+1,1,1);
    if(s.typ==="kontakt" && !b){ px(ctx,"#141824",sx-2,ty+2,4,1); }
    if(!b){ px(ctx,"rgba(255,220,120,0.55)", sx-3, s.y*TILE-oy-8, 6, 8); }
    return;
  }
  px(ctx,"#141824",sx-4-puls,sy-18-puls,8+2*puls,12+2*puls);
  px(ctx,farbe,sx-2,sy-16,4,8);
  if(b) zeichneHaken(sx-2, sy-14);
  else if(!reduziert && Math.floor(zeit/30)%2===0) px(ctx,"#ffffff",sx-1,sy-15,1,2);
  if(s.jahr){ const c = schild(s.jahr); ctx.drawImage(c, Math.round(sx - c.width/2), Math.round(sy - 32)); }
}
function zeichneWegweiser(w, ox, oy){
  const sx = Math.round(w.x*TILE-ox+TILE/2), sy = Math.round((w.y+1)*TILE-oy);
  const zeilen = w.zeilen.map(z => L(z));
  const hoehe = zeilen.length*12;
  px(ctx,"#1c1a20",sx-2,sy-hoehe-16,5,hoehe+16); px(ctx,"#6e4c26",sx-1,sy-hoehe-15,3,hoehe+15);
  const seite = w.seite || 1;   // Bretter hängen vom Weg weg
  zeilen.forEach((z,i)=>{ const c = schild(z); const bx = seite>0 ? sx+2-(i%2?0:2) : sx-2-c.width+(i%2?0:2); ctx.drawImage(c, Math.round(bx), sy-hoehe-14+i*12); });
}
function zeichneLaternen(ox, oy){
  laternen.forEach(([lx,ly])=>{
    const sx=lx*TILE-ox, sy=ly*TILE-oy;
    px(ctx,"#1c1a20",sx+6,sy-5,4,21); px(ctx,"#3a4152",sx+7,sy+2,2,13);
    const hell = reduziert ? 0.5 : (Math.sin(zeit/9 + lx)*0.5+0.5);
    const farbe = "rgb(255," + Math.round(214+hell*30) + "," + Math.round(120+hell*60) + ")";
    px(ctx,"#1c1a20",sx+4,sy-4,8,8); px(ctx,farbe,sx+5,sy-2,6,5); px(ctx,"#3a4152",sx+5,sy-4,6,2);
  });
}
function zeichneEnte(ox, oy){
  const ex = Math.round((BAECHLE_X0+3)*TILE-ox + (reduziert ? 0 : Math.sin(zeit/60)*32)), ey = Math.round(BAECHLE_Y*TILE-oy + 4);
  px(ctx,"#1c1a20",ex-1,ey-5,11,8); px(ctx,"#f0eee6",ex,ey,8,3); px(ctx,"#f0eee6",ex+5,ey-4,4,5); px(ctx,"#f5a623",ex+9,ey-2,2,2); px(ctx,"#1a1a1a",ex+7,ey-3,1,1);
}
function zeichneSpielerSprite(ox, oy){
  const ax = spieler.x + spieler.b/2 - ox, ay = spieler.y + spieler.h + 2 - oy;
  ctx.fillStyle="rgba(0,0,0,0.25)"; ctx.fillRect(Math.round(ax)-5, Math.round(ay)-2, 10, 3);
  const name = "spieler_" + (spieler.laeuft ? "walk" : "idle") + "_" + (spieler.richtung==="oben" ? "up" : spieler.richtung==="unten" ? "down" : "side");
  const frame = Math.floor(spieler.laeuft ? zeit/6 : zeit/20);
  if(!zeichneSprite(name, frame, ax, ay, spieler.richtung==="links")){
    px(ctx,"#2a3550",Math.round(ax)-5,Math.round(ay)-16,10,14); px(ctx,"#6b4226",Math.round(ax)-4,Math.round(ay)-24,8,8);
  }
}
function zeichneNpcSprite(n, ox, oy){
  const ax = n.x + 5 - ox, ay = n.y + 14 - oy;
  ctx.fillStyle="rgba(0,0,0,0.22)"; ctx.fillRect(Math.round(ax)-5, Math.round(ay)-2, 10, 3);
  if(n.dir[0]<0) n.blickLinks = true; else if(n.dir[0]>0) n.blickLinks = false;
  const laeuft = n.dir[0]!==0 || n.dir[1]!==0;
  const frame = Math.floor(laeuft ? zeit/7 : (zeit+n.f*13)/16);
  if(!zeichneSprite(laeuft ? n.sprite+"_lauf" : n.sprite, frame, ax, ay, !!n.blickLinks)){
    px(ctx,"#3a3f4d",Math.round(ax)-5,Math.round(ay)-16,10,14); px(ctx,"#c68642",Math.round(ax)-4,Math.round(ay)-24,8,8);
  }
  if(n===npcInNaehe && !aktiverNpc){ const bx = Math.round(ax)-4, by = Math.round(ay)-40 + (reduziert?0:Math.round(Math.sin(zeit/10))); px(ctx,"#141824",bx,by,9,8); px(ctx,"#ffffff",bx+1,by+1,7,6); px(ctx,"#141824",bx+2,by+3,1,1); px(ctx,"#141824",bx+4,by+3,1,1); px(ctx,"#141824",bx+6,by+3,1,1); px(ctx,"#141824",bx+3,by+7,2,2); }
}
function zeichneKompass(ox, oy){
  const ziel = reihenfolge.map(stationVon).find(s => s && !besucht.has(s.key));
  if(!ziel) return;
  const zx = ziel.x*TILE+8, zy = ziel.y*TILE+8, px0 = spieler.x+spieler.b/2, py0 = spieler.y+spieler.h/2;
  const d = Math.hypot(zx-px0, zy-py0);
  if(d < 6*TILE) return;
  const a = Math.atan2(zy-py0, zx-px0);
  const cx = Math.round(px0 - ox + Math.cos(a)*20), cy = Math.round(py0 - oy + Math.sin(a)*20);
  const sp = [Math.cos(a), Math.sin(a)], se = [-Math.sin(a), Math.cos(a)];
  const p = (u,v)=>[Math.round(cx + sp[0]*u + se[0]*v), Math.round(cy + sp[1]*u + se[1]*v)];
  [[4,0],[3,0],[2,0],[1,0],[0,0],[-1,0],[2,1],[2,-1],[0,2],[0,-2],[1,1],[1,-1]].forEach(([u,v])=>{ const [x,y]=p(u,v); px(ctx,"#141824",x-1,y-1,3,3); });
  [[4,0],[3,0],[2,0],[1,0],[0,0],[-1,0],[2,1],[2,-1],[0,2],[0,-2],[1,1],[1,-1]].forEach(([u,v])=>{ const [x,y]=p(u,v); px(ctx, MARKER_FARBE[ziel.gruppe], x,y,1,1); });
}
function zeichnePiktogramm(ox, oy){
  if(ersteBewegung) return;
  const x = Math.round(spieler.x + spieler.b/2 - ox), y = Math.round(spieler.y - oy - 30 + (reduziert?0:Math.sin(zeit/12)*2));
  if(touchGeraet){
    px(ctx,"#141824",x-9,y-8,19,17); px(ctx,"#ffffff",x-8,y-7,17,15); px(ctx,"#141824",x-1,y-4,3,7); px(ctx,"#141824",x-4,y-1,9,3);
    px(ctx,"#f5b301",x-1,y+2,3,4);
  } else {
    const taste = (tx,ty,z)=>{ px(ctx,"#141824",tx-1,ty-1,9,9); px(ctx,"#ffffff",tx,ty,7,7); zeichneText(ctx, z, tx+2, ty+1, "#141824"); };
    taste(x-4,y-9,"▲"); taste(x-14,y+1,"◀"); taste(x-4,y+1,"▼"); taste(x+6,y+1,"▶");
  }
}
function zeichneTippMarke(ox, oy){
  if(!tippMarke) return;
  const sx = tippMarke.x*TILE-ox, sy = tippMarke.y*TILE-oy, f = Math.floor(tippMarke.t/6)%2;
  ctx.strokeStyle = f ? "#ffffff" : "#f5b301"; ctx.lineWidth = 1; ctx.strokeRect(sx+2.5, sy+2.5, 11, 11);
}

/* ---------- Bewegung: Spieler, Pfad, NPCs ---------- */
let schrittZaehler = 0;
function bewegeSpieler(dt){
  let dx=0, dy=0;
  if(tasten["arrowup"]||tasten["w"]) dy=-1;
  if(tasten["arrowdown"]||tasten["s"]) dy=1;
  if(tasten["arrowleft"]||tasten["a"]) dx=-1;
  if(tasten["arrowright"]||tasten["d"]) dx=1;
  if(dx===0 && dy===0 && pfad && pfad.length){
    const [zx,zy] = pfad[0];
    const zielX = zx*TILE+3, zielY = zy*TILE+2;
    const ddx = zielX - spieler.x, ddy = zielY - spieler.y;
    if(Math.abs(ddx) < 0.9 && Math.abs(ddy) < 0.9){
      spieler.x = zielX; spieler.y = zielY; pfad.shift();
      if(!pfad.length){
        const ziel = pfadZiel;
        pfad = null; tippMarke = null; pfadZiel = null;
        if(ziel && ziel.station){ pruefeUmgebung(); if(aktiveStation===ziel.station) oeffneStation(ziel.station); }
        else if(ziel && ziel.npc){
          const n = ziel.npc, d = Math.hypot(n.x+5-(spieler.x+spieler.b/2), n.y+8-(spieler.y+spieler.h/2));
          if(d < 40) zeigeNpcDialog(n);
          else if(!ziel.wiederholt){   // NPC ist weitergelaufen: einmal nachplanen
            const p2 = findePfad(Math.floor((n.x+5)/TILE), Math.floor((n.y+8)/TILE));
            if(p2 && p2.length>1){ pfad = p2; pfadZiel = {npc:n, wiederholt:true}; }
          }
        }
      }
    } else {
      if(Math.abs(ddx) >= 0.9) dx = Math.sign(ddx); else dy = Math.sign(ddy);
    }
  }
  spieler.laeuft = (dx!==0||dy!==0);
  if(!spieler.laeuft) return;
  ersteBewegung = true;
  if(dx<0) spieler.richtung="links"; else if(dx>0) spieler.richtung="rechts";
  else if(dy<0) spieler.richtung="oben"; else if(dy>0) spieler.richtung="unten";
  let v = GESCHWINDIGKEIT*dt;
  if(dx!==0 && dy!==0) v *= Math.SQRT1_2;
  let nx = spieler.x + dx*v, ny = spieler.y + dy*v;
  if(pfad){ /* nicht über das Ziel hinausschießen */
    const [zx,zy] = pfad[0]; const zielX = zx*TILE+3, zielY = zy*TILE+2;
    if(dx!==0 && Math.sign(zielX-nx)!==Math.sign(dx) ) nx = zielX;
    if(dy!==0 && Math.sign(zielY-ny)!==Math.sign(dy) ) ny = zielY;
  }
  if(!blockiert(nx, spieler.y)) spieler.x = nx; else if(pfad) brichPfadAb();
  if(!blockiert(spieler.x, ny)) spieler.y = ny; else if(pfad) brichPfadAb();
  schrittZaehler += dt;
  if(schrittZaehler >= 14){ schrittZaehler = 0; klang.schritt(Math.floor(zeit/14)); }
}
function npcBlockiert(px_,py_){ return blockiert(px_,py_,10,12); }
function bewegeNpcs(dt){
  npcs.forEach(n=>{
    if(n===aktiverNpc){ n.dir=[0,0]; return; }
    n.t -= dt;
    if(n.t<=0){
      const hx = n.heim[0]*TILE+3, hy = n.heim[1]*TILE+2;
      const weit = Math.hypot(n.x-hx, n.y-hy) > n.radius*TILE;
      if(weit){ n.dir = Math.abs(hx-n.x) > Math.abs(hy-n.y) ? [Math.sign(hx-n.x),0] : [0,Math.sign(hy-n.y)]; }
      else { const optionen = [[1,0],[-1,0],[0,1],[0,-1],[0,0],[0,0],[0,0]]; n.dir = optionen[Math.floor(Math.random()*optionen.length)]; }
      n.t = 50 + Math.random()*110;
    }
    const nx = n.x + n.dir[0]*0.6*dt, ny = n.y + n.dir[1]*0.6*dt;
    const nahAmSpieler = Math.hypot(nx-spieler.x, ny-spieler.y) < 14;
    const hx = n.heim[0]*TILE+3, hy = n.heim[1]*TILE+2;
    const dNeu = Math.hypot(nx-hx, ny-hy), dAlt = Math.hypot(n.x-hx, n.y-hy);
    const zuWeit = dNeu > n.radius*TILE && dNeu > dAlt;       // Leine: nicht weiter vom Heim weg
    if(!npcBlockiert(nx,ny) && !nahAmSpieler && !zuWeit){ n.x=nx; n.y=ny; }
    else if(zuWeit){ n.t = 0; }
    else {   // Hindernis: quer ausweichen, dann neu entscheiden
      const s = Math.random()<0.5 ? 1 : -1;
      n.dir = (n.dir[0]||n.dir[1]) ? [s*n.dir[1], s*n.dir[0]] : [0,0];
      n.t = 15 + Math.random()*25;
    }
  });
}
/* Station unter der Figur, NPC in Reichweite, Zonenwechsel */
function pruefeUmgebung(){
  const [tx,ty] = spielerKachel();
  const s = stationen.find(s => s.x===tx && s.y===ty) || null;
  const pxm = spieler.x+spieler.b/2, pym = spieler.y+spieler.h/2;
  let naechster = null, nDist = 1e9;
  npcs.forEach(n=>{ const d = Math.hypot(n.x+5-pxm, n.y+8-pym); if(d<nDist){ nDist=d; naechster=n; } });
  npcInNaehe = (naechster && nDist < 24) ? naechster : null;
  if(aktiverNpc && Math.hypot(aktiverNpc.x+5-pxm, aktiverNpc.y+8-pym) > 44) schliesseNpcDialog();
  aktiveStation = s;
  if(modalOffen || karteOffen || aktiverNpc){ if(promptStation||promptNpc) versteckePrompt(); }
  else if(s){ if(promptStation!==s) zeigePrompt(s, null); }
  else if(npcInNaehe){ if(promptNpc!==npcInNaehe) zeigePrompt(null, npcInNaehe); }
  else if(promptStation||promptNpc) versteckePrompt();
  const z = zoneBei(tx,ty);
  if(z !== aktuelleZone){
    aktuelleZone = z;
    if(z && !gezeigteZonen.has(z.key)){ gezeigteZonen.add(z.key); zeigeBanner(z); }
  }
}

/* ---------- Kamera & Render ---------- */
let kamX = null, kamY = null, kameraDemo = 0;
function render(dt){
  zeit += dt;
  if(gestartet && !modalOffen && !karteOffen){ bewegeSpieler(dt); pruefeUmgebung(); }
  bewegeNpcs(dt);
  if(tippMarke){ tippMarke.t += dt; }
  feuerwerkTick(dt);
  for(let i=partikel.length-1;i>=0;i--){ const p=partikel[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=0.06*dt; p.leben-=dt; if(p.leben<=0) partikel.splice(i,1); }

  let ox, oy;
  if(gestartet){
    const zielX = spieler.x - canvas.width/2, zielY = spieler.y - canvas.height/2;
    if(kamX===null){ kamX=zielX; kamY=zielY; }
    const f = reduziert ? 1 : 1 - Math.pow(0.9, dt);
    kamX += (zielX-kamX)*f; kamY += (zielY-kamY)*f;
    ox = kamX; oy = kamY;
  } else {
    kameraDemo += reduziert ? 0 : 0.15*dt;
    ox = 9*TILE - canvas.width/2 + Math.sin(kameraDemo/60)*40 + 40;
    oy = 26*TILE - canvas.height/2 + Math.cos(kameraDemo/80)*24;
  }
  ox = Math.round(Math.max(0, Math.min(W*TILE-canvas.width,  ox)));
  oy = Math.round(Math.max(0, Math.min(H*TILE-canvas.height, oy)));
  kamOx = ox; kamOy = oy;

  const ph = Math.floor(zeit/40)%2;
  if(bodenCanvas[ph]) ctx.drawImage(bodenCanvas[ph], ox, oy, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
  else { ctx.fillStyle="#3e7c47"; ctx.fillRect(0,0,canvas.width,canvas.height); }

  const x0 = Math.floor(ox/TILE), y0 = Math.floor(oy/TILE);
  const x1 = Math.min(W-1, x0 + Math.ceil(canvas.width/TILE)+1), y1 = Math.min(H-1, y0 + Math.ceil(canvas.height/TILE)+1);
  const sichtbar = (wx, wy, rand)=> wx > ox-(rand||48) && wx < ox+canvas.width+(rand||48) && wy > oy-(rand||80) && wy < oy+canvas.height+(rand||48);

  stationen.forEach(s => { if(sichtbar(s.x*TILE, s.y*TILE)) zeichneMarkerBoden(s, ox, oy); });
  zeichneTippMarke(ox, oy);
  zeichneEnte(ox, oy);
  zeichneLaternen(ox, oy);

  /* Tiefensortierung nach Fußpunkt */
  const liste = [];
  const bx0 = Math.max(0, x0-2), bx1 = Math.min(W-1, x1+2), by1 = Math.min(H-1, y1+5);
  for(let ty=y0;ty<=by1;ty++) for(let tx=bx0;tx<=bx1;tx++){
    const t = at(tx,ty);
    if(t===TANNE || t===BAUM || t===PALME || t===LAUB){
      const name = t===BAUM ? "baum" : t===LAUB ? (((tx*7+ty)%2===0) ? "laub_a" : "laub_b")
        : t===PALME ? (((tx*5+ty)%2===0) ? "palme_a" : "palme_b") : (imSchnee(tx,ty) ? "tanne_winter" : "tanne");
      const ax = tx*TILE-ox+TILE/2, ay = (ty+1)*TILE-oy;
      liste.push({y:(ty+1)*TILE, zeichne:()=>{ if(!zeichneSprite(name, 0, ax, ay, false)){ px(ctx,"#5a3a22",ax-1,ay-6,2,6); px(ctx, t===PALME?"#3f9147":"#1e5631", ax-5,ay-14,10,9); } }});
    }
  }
  feuerstellen.forEach(([fx,fy])=>{ if(!sichtbar(fx*TILE, fy*TILE)) return;
    const ax = fx*TILE-ox+TILE/2, ay = (fy+1)*TILE-oy;
    liste.push({y:(fy+1)*TILE, zeichne:()=>{ if(!zeichneSprite("feuer", Math.floor(zeit/9), ax, ay, false)){ px(ctx,"#4a3220",ax-5,ay-6,10,4); px(ctx,"#e2574c",ax-3,ay-12,6,7); px(ctx,"#f5b301",ax-2,ay-10,4,5); } }});
  });
  straeucher.forEach(([bx,by,name])=>{ if(!sichtbar(bx*TILE, by*TILE)) return;
    const ax = bx*TILE-ox+TILE/2, ay = (by+1)*TILE-oy;
    liste.push({y:(by+1)*TILE, zeichne:()=>zeichneSprite(name, 0, ax, ay, false)});
  });
  wegweiser.forEach(w=>{ if(sichtbar(w.x*TILE, w.y*TILE)) liste.push({y:(w.y+1)*TILE, zeichne:()=>zeichneWegweiser(w, ox, oy)}); });
  gebaeude.forEach(g=>{ if(sichtbar(g.x*TILE, g.y*TILE, 96)) liste.push({y:(g.y+g.h)*TILE, zeichne:()=>zeichneGebaeude(g, ox, oy)}); });
  if(fahneGehisst) liste.push({y:26*TILE, zeichne:()=>zeichneSprite("fahne", 0, 27*TILE-ox+8, 26*TILE-oy, false)});
  npcs.forEach(n=>{ if(sichtbar(n.x, n.y)) liste.push({y:n.y+14, zeichne:()=>zeichneNpcSprite(n, ox, oy)}); });
  stationen.forEach(s=>{ if(sichtbar(s.x*TILE, s.y*TILE)) liste.push({y:(s.y+1)*TILE - 4, zeichne:()=>zeichneMarker(s, ox, oy)}); });
  if(gestartet) liste.push({y:spieler.y+spieler.h+2, zeichne:()=>zeichneSpielerSprite(ox, oy)});
  liste.sort((a,b)=>a.y-b.y);
  liste.forEach(e=>e.zeichne());

  partikel.forEach(p=>{ px(ctx, p.farbe, Math.round(p.x-ox), Math.round(p.y-oy), 2, 2); });
  if(nacht>0){
    ctx.fillStyle = "rgba(8,14,40," + (0.5*nacht).toFixed(3) + ")"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = "lighter";
    laternen.forEach(([lx,ly])=>{ const sx=lx*TILE-ox+8, sy=ly*TILE-oy; if(sx<-40||sx>canvas.width+40||sy<-40||sy>canvas.height+40) return;
      const gr = ctx.createRadialGradient(sx,sy,2,sx,sy,26); gr.addColorStop(0,"rgba(255,220,120,"+(0.45*nacht).toFixed(3)+")"); gr.addColorStop(1,"rgba(255,220,120,0)");
      ctx.fillStyle = gr; ctx.fillRect(sx-26,sy-26,52,52); });
    feuerwerk.forEach(p=>{ px(ctx, p.farbe, Math.round(p.x-ox), Math.round(p.y-oy), 2, 2); });
    ctx.globalCompositeOperation = "source-over";
  }
  if(gestartet && !modalOffen && !karteOffen){ zeichneKompass(ox, oy); zeichnePiktogramm(ox, oy); positionierePrompt(); }
}

/* ---------- Loop mit Delta-Time, Drosselung bei Titel/Dialogen, Pause bei verstecktem Tab ---------- */
let letzterTs = null, rafId = null, drossel = 0, loopGestartet = false;
function loop(ts){
  let dt = 1;
  if(letzterTs !== null) dt = Math.min(3, Math.max(0.25, (ts - letzterTs)/16.667));
  letzterTs = ts;
  const schritt = (modalOffen || karteOffen) ? 3 : (!gestartet ? 2 : 0);
  if(schritt){ drossel += dt; if(drossel < schritt){ rafId = requestAnimationFrame(loop); return; } dt = drossel; drossel = 0; }
  render(dt);
  rafId = requestAnimationFrame(loop);
}
document.addEventListener("visibilitychange", ()=>{
  if(document.hidden){ if(rafId){ cancelAnimationFrame(rafId); rafId=null; } }
  else if(loopGestartet && !rafId){ letzterTs = null; rafId = requestAnimationFrame(loop); }
});

/* ---------- Start ---------- */
function starteLoop(){ if(loopGestartet) return; loopGestartet = true; baueBoden(); if(!document.hidden && !rafId) rafId = requestAnimationFrame(loop); }
const atlasLaden = ladeAtlas();
const frist = new Promise(ok => setTimeout(ok, 1500));
const bereit = Promise.race([atlasLaden, frist]).then(()=>{ starteLoop(); atlasLaden.then(()=>{ if(atlasBereit) baueBoden(); }); });
window.addEventListener("pagehide", ()=>{ if(gestartet){ const [tx,ty] = spielerKachel(); speicher.set("bd-position", tx+","+ty); } });

wendeSpracheAn();

function starteSpiel(){
  if(gestartet) return;
  if(!loopGestartet){ bereit.then(starteSpiel); return; }   // PLAY wartet auf Atlas oder Frist
  audioStart();
  const titel = $("titel");
  titel.classList.add("aus"); setTimeout(()=>{ titel.hidden = true; }, 520);
  $("hud").classList.add("an"); $("hilfe").classList.add("an");
  $("dpad").classList.add("an"); $("aktionBtn").classList.add("an");
  if(besucht.size>0){   // Wiederkehrer starten dort, wo sie zuletzt eine Karte geöffnet haben
    const pos = (speicher.get("bd-position")||"").split(",").map(Number);
    if(pos.length===2 && !isNaN(pos[0]) && !isNaN(pos[1]) && pos[0]>=0 && pos[1]>=0 && pos[0]<W && pos[1]<H && kachelFrei(pos[0],pos[1])){ spieler.x = pos[0]*TILE+3; spieler.y = pos[1]*TILE+2; }
  }
  gestartet = true; kamX = null;
  aktualisiereZaehler(); canvas.focus({preventScroll:true});
  verfolge("play");
  const t = T();
  if(besucht.size===0) setTimeout(()=>zeigeToast(touchGeraet ? t.toastTouch : t.toastStart, 6000), 900);
  else setTimeout(()=>zeigeToast(t.toastZurueck(besucht.size, stationen.length), 5000), 900);
  if(!audio.an) setTimeout(()=>{ if(!$("toast").classList.contains("an")) zeigeToast(t.toastTon, 3500); }, 8000);
  pruefeUmgebung();
}
$("playBtn").addEventListener("click", starteSpiel);
$("klassischLink").addEventListener("click", ()=>verfolge("klassik"));
$("lebenslaufBtn").addEventListener("click", ()=>verfolge("lebenslauf"));

/* Debug-Zugriff nur mit ?debug=1 (und ?start=x,y zum Teleportieren) */
if(DEBUG){
  window.__spiel = { spieler, npcs, stationen, besucht, teleport(x,y){ spieler.x=x*TILE+3; spieler.y=y*TILE+2; kamX=null; }, start: starteSpiel, oeffneStation, render };
  const st = params.get("start");
  if(st){ const [x,y] = st.split(",").map(Number); if(!isNaN(x)&&!isNaN(y)) window.__spiel.teleport(x,y); setTimeout(starteSpiel, 1700); }
  const of = params.get("open");
  if(of) setTimeout(()=>{ if(of==="karte") oeffneKarte(); else if(of==="finale"){ stationen.forEach(s=>besucht.add(s.key)); aktualisiereZaehler(); starteFinale(); } else if(stationVon(of)) oeffneStation(stationVon(of)); }, 2200);
}
})();
