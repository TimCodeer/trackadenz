import { useState, useEffect, useRef } from "react";
import {
  MultiFormatReader, BarcodeFormat, DecodeHintType,
  RGBLuminanceSource, BinaryBitmap, HybridBinarizer,
} from "@zxing/library";

const K = { USER:"trackadenz_user",LOG:"trackadenz_log",GOALS:"trackadenz_goals",STEPS:"trackadenz_steps",WORKOUT_PLANS:"trackadenz_workout_plans",WORKOUT_LOG:"trackadenz_workout_log",FAVS:"trackadenz_favorites" };

const C = {
  bg:"#eef8f7", surface:"#ffffff", card:"#ffffff", border:"#cce8e4", borderStrong:"#99d6cf",
  accent:"#1fb5a5", accent2:"#178f82", accentSoft:"#dff5f2",
  blue:"#3a86d4", blueSoft:"#deedf9",
  olive:"#5d8a50", oliveSoft:"#e5f2e1",
  pink:"#d4547a", pinkSoft:"#fce8f0",
  yellow:"#b8860b", yellowSoft:"#fdf3d8",
  text:"#162826", textSec:"#3d6460", muted:"#6e9994", dim:"#aacdc9",
  shadow:"0 2px 10px rgba(31,181,165,0.09)", shadowMd:"0 4px 24px rgba(31,181,165,0.15)",
};

const FOOD_DB = [
  {name:"Hühnchenbrust (gegrillt)",calories:165,protein:31,carbs:0,fat:3.6,emoji:"🍗"},
  {name:"Hühnchen (allgemein)",calories:239,protein:27,carbs:0,fat:14,emoji:"🍗"},
  {name:"Hähnchenbrust (roh)",calories:120,protein:22,carbs:0,fat:2.6,emoji:"🍗"},
  {name:"Hähnchenschenkel",calories:209,protein:26,carbs:0,fat:11,emoji:"🍗"},
  {name:"Lachs",calories:208,protein:20,carbs:0,fat:13,emoji:"🐟"},
  {name:"Thunfisch (Dose)",calories:116,protein:26,carbs:0,fat:1,emoji:"🐟"},
  {name:"Rindfleisch (mager)",calories:217,protein:26,carbs:0,fat:12,emoji:"🥩"},
  {name:"Schweinefleisch (mager)",calories:242,protein:27,carbs:0,fat:14,emoji:"🥩"},
  {name:"Eier",calories:155,protein:13,carbs:1.1,fat:11,emoji:"🥚"},
  {name:"Milch (3,5%)",calories:61,protein:3.4,carbs:4.8,fat:3.5,emoji:"🥛"},
  {name:"Joghurt (griechisch)",calories:97,protein:9,carbs:3.6,fat:5,emoji:"🥛"},
  {name:"Quark (Magerquark)",calories:67,protein:12,carbs:3.7,fat:0.2,emoji:"🥛"},
  {name:"Hüttenkäse",calories:98,protein:11,carbs:3.4,fat:4.3,emoji:"🧀"},
  {name:"Mozzarella",calories:280,protein:28,carbs:2.2,fat:17,emoji:"🧀"},
  {name:"Reis (gekocht)",calories:130,protein:2.7,carbs:28,fat:0.3,emoji:"🍚"},
  {name:"Reis (roh)",calories:350,protein:7,carbs:77,fat:0.7,emoji:"🍚"},
  {name:"Nudeln (gekocht)",calories:131,protein:5,carbs:25,fat:1.1,emoji:"🍝"},
  {name:"Nudeln (roh)",calories:371,protein:13,carbs:74,fat:1.5,emoji:"🍝"},
  {name:"Haferflocken",calories:389,protein:17,carbs:66,fat:7,emoji:"🥣"},
  {name:"Brot (Vollkorn)",calories:247,protein:13,carbs:41,fat:3.4,emoji:"🍞"},
  {name:"Toastbrot",calories:265,protein:8,carbs:49,fat:3.4,emoji:"🍞"},
  {name:"Kartoffeln",calories:77,protein:2,carbs:17,fat:0.1,emoji:"🥔"},
  {name:"Süßkartoffel",calories:86,protein:1.6,carbs:20,fat:0.1,emoji:"🍠"},
  {name:"Brokkoli",calories:34,protein:2.8,carbs:7,fat:0.4,emoji:"🥦"},
  {name:"Spinat",calories:23,protein:2.9,carbs:3.6,fat:0.4,emoji:"🥬"},
  {name:"Tomaten",calories:18,protein:0.9,carbs:3.9,fat:0.2,emoji:"🍅"},
  {name:"Banane",calories:89,protein:1.1,carbs:23,fat:0.3,emoji:"🍌"},
  {name:"Apfel",calories:52,protein:0.3,carbs:14,fat:0.2,emoji:"🍎"},
  {name:"Avocado",calories:160,protein:2,carbs:9,fat:15,emoji:"🥑"},
  {name:"Nüsse (Mandeln)",calories:579,protein:21,carbs:22,fat:50,emoji:"🥜"},
  {name:"Erdnussbutter",calories:588,protein:25,carbs:20,fat:50,emoji:"🥜"},
  {name:"Olivenöl",calories:884,protein:0,carbs:0,fat:100,emoji:"🫙"},
  {name:"Protein-Pulver (Whey)",calories:380,protein:75,carbs:10,fat:5,emoji:"💪"},
  {name:"Linsen (gekocht)",calories:116,protein:9,carbs:20,fat:0.4,emoji:"🫘"},
  {name:"Kichererbsen (gekocht)",calories:164,protein:8.9,carbs:27,fat:2.6,emoji:"🫘"},
  {name:"Tofu",calories:76,protein:8,carbs:1.9,fat:4.8,emoji:"🟩"},
  {name:"Käse (Gouda)",calories:356,protein:25,carbs:2.2,fat:27,emoji:"🧀"},
  {name:"Schinken (mager)",calories:145,protein:22,carbs:1.5,fat:5.5,emoji:"🥩"},
  {name:"Butter",calories:717,protein:0.9,carbs:0.1,fat:81,emoji:"🧈"},
  {name:"Frischkäse",calories:342,protein:7.5,carbs:4.1,fat:33,emoji:"🧀"},
];
const MEAL_TYPES=[{id:"breakfast",label:"Frühstück",emoji:"☀️"},{id:"lunch",label:"Mittagessen",emoji:"🌤️"},{id:"dinner",label:"Abendessen",emoji:"🌙"},{id:"snack",label:"Snack",emoji:"🍎"}];

function calcTDEE(u){if(!u.weight||!u.height||!u.age)return null;let bmr=u.gender==="male"?10*u.weight+6.25*u.height-5*u.age+5:10*u.weight+6.25*u.height-5*u.age-161;const m={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};let t=bmr*(m[u.activity]||1.55);if(u.goal==="lose")t-=500;else if(u.goal==="gain")t+=300;return Math.round(t);}
function calcProt(u){if(!u?.weight)return 150;return u.goal==="gain"?Math.round(u.weight*2.2):u.goal==="lose"?Math.round(u.weight*2):Math.round(u.weight*1.8);}
function todayKey(){return new Date().toDateString();}
function dateKey(d){return d.toDateString();}
function ls(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
function lsSet(k,v){localStorage.setItem(k,JSON.stringify(v));}
function searchFoods(q){if(!q||q.length<2)return[];const lq=q.toLowerCase();return FOOD_DB.filter(f=>f.name.toLowerCase().includes(lq)).slice(0,7);}

const sInput=(extra={})=>({width:"100%",background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:12,padding:"12px 14px",color:C.text,fontSize:16,WebkitAppearance:"none",fontFamily:"inherit",...extra});
const sBtn=(variant="primary",extra={})=>{const b={borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:"pointer",border:"none",width:"100%",fontFamily:"inherit",...extra};if(variant==="primary")return{...b,background:`linear-gradient(135deg,${C.accent},${C.accent2})`,color:"#fff",boxShadow:`0 4px 16px ${C.accent}33`};if(variant==="ghost")return{...b,background:C.surface,color:C.textSec,border:`1.5px solid ${C.border}`};if(variant==="danger")return{...b,background:"#fff0f2",color:"#c0392b",border:"1.5px solid #f5b8c0"};return b;};
const sCard=(extra={})=>({background:C.card,borderRadius:16,padding:"14px 16px",border:`1px solid ${C.border}`,boxShadow:C.shadow,...extra});
const sPill=(active,color=C.accent)=>({flex:1,padding:"9px 4px",borderRadius:10,fontSize:12,fontWeight:700,background:active?color:C.surface,color:active?"#fff":C.muted,border:`1.5px solid ${active?color:C.border}`,cursor:"pointer",transition:"all .15s"});

export default function TrackadenZ(){
  const[user,setUser]=useState(null);
  const[onboarding,setOnboarding]=useState(false);
  const[tab,setTab]=useState("dashboard");
  const[tabTransition,setTabTransition]=useState(false);
  const[log,setLog]=useState({});
  const[goals,setGoals]=useState({calories:2000,protein:150});
  const[stepsData,setStepsData]=useState({});
  const[stepsPerm,setStepsPerm]=useState(null);
  const[workoutPlans,setWorkoutPlans]=useState([]);
  const[workoutLog,setWorkoutLog]=useState({});
  const[favorites,setFavorites]=useState([]);
  const[notif,setNotif]=useState(null);
  const[addModal,setAddModal]=useState(null);
  const[addMode,setAddMode]=useState("search");
  const[camPerm,setCamPerm]=useState(null);
  const[camModal,setCamModal]=useState(false);
  const[pendingCam,setPendingCam]=useState(null);
  const[scanning,setScanning]=useState(false);
  const[scannedCode,setScannedCode]=useState("");
  const[searchQ,setSearchQ]=useState("");
  const[searchRes,setSearchRes]=useState([]);
  const[selFood,setSelFood]=useState(null);
  const[grams,setGrams]=useState(100);
  const[aiInput,setAiInput]=useState("");
  const[aiLoading,setAiLoading]=useState(false);
  const[aiResult,setAiResult]=useState(null);
  const[imgFile,setImgFile]=useState(null);
  const[imgPreview,setImgPreview]=useState(null);
  const[kbUp,setKbUp]=useState(false);
  const[ob,setOb]=useState({step:0,name:"",gender:"male",age:"",weight:"",height:"",activity:"moderate",goal:"maintain",sport:"none"});
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const streamRef=useRef(null);
  const scanLoopRef=useRef(null);
  const scanActiveRef=useRef(false);
  const fileRef=useRef();
  const barcodeInputRef=useRef();
  const searchInputRef=useRef();
  const modalBodyRef=useRef();
  const tabAnimRef=useRef(null);

  useEffect(()=>{
    const u=ls(K.USER,null);
    if(u){setUser(u);setGoals(ls(K.GOALS,{calories:calcTDEE(u)||2000,protein:calcProt(u)}));}
    else setOnboarding(true);
    setLog(ls(K.LOG,{}));setStepsData(ls(K.STEPS,{}));
    setStepsPerm(ls("tz_steps_perm",null));setCamPerm(ls("tz_cam_perm",null));
    setWorkoutPlans(ls(K.WORKOUT_PLANS,[]));setWorkoutLog(ls(K.WORKOUT_LOG,{}));
    setFavorites(ls(K.FAVS,[]));
  },[]);

  // Prevent iOS zoom gestures
  useEffect(()=>{
    const prevent = e => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    let lastTouch = 0;
    const preventDoubleTap = e => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    };
    document.addEventListener("touchstart", prevent, { passive: false });
    document.addEventListener("touchend", preventDoubleTap, { passive: false });
    const preventGesture = e => e.preventDefault();
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    return () => {
      document.removeEventListener("touchstart", prevent);
      document.removeEventListener("touchend", preventDoubleTap);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
    };
  },[]);

  useEffect(()=>{
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement("meta"); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  },[]);

  useEffect(()=>{
    const onResize=()=>setKbUp(window.innerHeight/window.screen.height<0.72);
    window.addEventListener("resize",onResize);
    return()=>window.removeEventListener("resize",onResize);
  },[]);

  useEffect(()=>{
    const check=()=>{const td=todayKey();if(ls("tz_reset","")!==td)lsSet("tz_reset",td);};
    check();const t=setInterval(check,60000);return()=>clearInterval(t);
  },[]);

  function showNotif(msg,type="ok"){setNotif({msg,type});setTimeout(()=>setNotif(null),2600);}

  function switchTab(newTab){
    if (newTab === tab) return;
    setTabTransition(true);
    clearTimeout(tabAnimRef.current);
    setTab(newTab);
    tabAnimRef.current = setTimeout(() => setTabTransition(false), 950);
  }

  function requestCamera(action){
    if(camPerm==="granted"){action==="barcode"?startScanner():setAddMode("image");return;}
    setPendingCam(action);setCamModal(true);
  }
  async function grantCamera(){
    setCamModal(false);
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
      s.getTracks().forEach(t=>t.stop());
      setCamPerm("granted");lsSet("tz_cam_perm","granted");showNotif("📷 Kamerazugriff erteilt!");
      if(pendingCam==="barcode")setTimeout(startScanner,300);else setAddMode("image");
    }catch{setCamPerm("denied");lsSet("tz_cam_perm","denied");showNotif("❌ Kamerazugriff verweigert","err");}
    setPendingCam(null);
  }
  function denyCamera(){setCamModal(false);setCamPerm("denied");lsSet("tz_cam_perm","denied");setPendingCam(null);}

  // ── GTIN/EAN Barcode Scanner – canvas loop with low-level ZXing API ─────────
  // Uses MultiFormatReader directly on canvas frames – works on iOS Safari.
  // The trick: we crop only the center 60% of the frame before decoding,
  // giving ZXing a larger effective barcode size and faster recognition.
  async function startScanner() {
    setScanning(true); setScannedCode(""); setAiResult(null);
    scanActiveRef.current = true;

    // Build ZXing reader once
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,  BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.ITF,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const zxReader = new MultiFormatReader();
    zxReader.setHints(hints);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      const vid = videoRef.current;
      if (!vid) { stopScanner(); return; }
      vid.srcObject = stream;
      vid.setAttribute("playsinline", "true");
      await vid.play();

      // Wait for video to have real dimensions
      await new Promise(res => {
        if (vid.videoWidth > 0) { res(); return; }
        vid.addEventListener("loadedmetadata", res, { once: true });
      });

      const canvas = canvasRef.current;

      const tick = () => {
        if (!scanActiveRef.current) return;
        try {
          const vw = vid.videoWidth;
          const vh = vid.videoHeight;
          if (vw > 0 && vh > 0) {
            // Crop center 60% width × 40% height – the scan zone
            const cropW = Math.floor(vw * 0.6);
            const cropH = Math.floor(vh * 0.4);
            const cropX = Math.floor((vw - cropW) / 2);
            const cropY = Math.floor((vh - cropH) / 2);

            canvas.width  = cropW;
            canvas.height = cropH;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(vid, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

            const imgData = ctx.getImageData(0, 0, cropW, cropH);
            const len = cropW * cropH;
            // Convert RGBA → uint8 gray array for ZXing luminance source
            const gray = new Uint8ClampedArray(len);
            for (let i = 0; i < len; i++) {
              const j = i * 4;
              gray[i] = (imgData.data[j] * 77 + imgData.data[j+1] * 150 + imgData.data[j+2] * 29) >> 8;
            }
            const lum    = new RGBLuminanceSource(gray, cropW, cropH);
            const bitmap = new BinaryBitmap(new HybridBinarizer(lum));
            try {
              const result = zxReader.decode(bitmap);
              if (result) {
                const code = result.getText();
                if (code && code.length >= 6) {
                  stopScanner();
                  setScannedCode(code);
                  lookupGTIN(code);
                  return;
                }
              }
            } catch { /* NotFoundException – keep scanning */ }
          }
        } catch { /* frame not ready yet */ }
        scanLoopRef.current = setTimeout(tick, 200);
      };

      scanLoopRef.current = setTimeout(tick, 400);
    } catch {
      scanActiveRef.current = false;
      setScanning(false);
      showNotif("❌ Kamera nicht verfügbar", "err");
    }
  }

  function stopScanner() {
    scanActiveRef.current = false;
    setScanning(false);
    clearTimeout(scanLoopRef.current);
    if (streamRef.current) {
      try { streamRef.current.getTracks().forEach(t => t.stop()); } catch {}
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); } catch {}
      videoRef.current.srcObject = null;
    }
  }

  async function lookupGTIN(code){
    if(!code||code.length<6)return;
    setAiLoading(true);setAiResult(null);
    try{
      const r=await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const d=await r.json();
      if(d.status===1&&d.product){
        const p=d.product;const n=p.nutriments||{};
        setAiResult({items:[{name:p.product_name||p.generic_name||"Unbekannt",grams:100,calories:Math.round(n["energy-kcal_100g"]||n["energy-kcal"]||0),protein:+(n.proteins_100g||0).toFixed(1),carbs:+(n.carbohydrates_100g||0).toFixed(1),fat:+(n.fat_100g||0).toFixed(1),emoji:"🏪"}]});
        setAiLoading(false);return;
      }
    }catch{}
    try{
      const res=await callClaude(
        `Du bist eine Lebensmitteldatenbank. Identifiziere das Produkt anhand des GTIN/EAN Barcodes und gib Nährwerte zurück. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🏪"}]}`,
        `GTIN/EAN: ${code}`
      );
      setAiResult(res);
    }catch{showNotif("❌ Produkt nicht gefunden","err");}
    setAiLoading(false);
  }

  useEffect(()=>{if(!addModal)stopScanner();},[addModal]);

  const tk=todayKey();
  const todayE=log[tk]||[];
  const totals=todayE.reduce((a,e)=>({calories:a.calories+e.calories,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),{calories:0,protein:0,carbs:0,fat:0});
  const calPct=Math.min(100,(totals.calories/goals.calories)*100);
  const protPct=Math.min(100,(totals.protein/goals.protein)*100);

  function addEntry(entry){
    const nl={...log};if(!nl[tk])nl[tk]=[];
    nl[tk]=[...nl[tk],{...entry,id:Date.now(),time:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}];
    setLog(nl);lsSet(K.LOG,nl);

    const favKey = `${entry.emoji}|${entry.name}|${entry.grams}`;
    const existing = favorites.find(f => f.key === favKey);
    const newFavs = existing
      ? favorites.map(f => f.key === favKey ? {...f, count:f.count+1, lastUsed:Date.now()} : f)
      : [...favorites, {key:favKey,name:entry.name,emoji:entry.emoji,grams:entry.grams,calories:entry.calories,protein:entry.protein,carbs:entry.carbs,fat:entry.fat,count:1,lastUsed:Date.now()}];
    setFavorites(newFavs);lsSet(K.FAVS,newFavs);

    closeModal();showNotif("✅ Mahlzeit eingetragen!");
  }
  function addFromFavorite(fav){
    addEntry({name:fav.name,emoji:fav.emoji,grams:fav.grams,mealType:addModal?.mealType||"snack",calories:fav.calories,protein:fav.protein,carbs:fav.carbs,fat:fav.fat});
  }
  function removeFavorite(key){
    const newFavs = favorites.filter(f => f.key !== key);
    setFavorites(newFavs);lsSet(K.FAVS,newFavs);
    showNotif("🗑️ Favorit entfernt","err");
  }
  function removeEntry(id){const nl={...log,[tk]:(log[tk]||[]).filter(e=>e.id!==id)};setLog(nl);lsSet(K.LOG,nl);showNotif("🗑️ Entfernt","err");}
  function closeModal(){setAddModal(null);setSelFood(null);setSearchQ("");setSearchRes([]);setGrams(100);setAiInput("");setAiResult(null);setImgFile(null);setImgPreview(null);stopScanner();setScannedCode("");}
  function calcN(food,g){const r=g/100;return{calories:Math.round(food.calories*r),protein:+(food.protein*r).toFixed(1),carbs:+(food.carbs*r).toFixed(1),fat:+(food.fat*r).toFixed(1)};}
  function handleSearch(q){setSearchQ(q);setSelFood(null);setSearchRes(searchFoods(q));}
  function handleSelectFood(f){setSelFood(f);setSearchRes([]);setSearchQ(f.name);}
  function handleAddSearch(){if(!selFood)return;addEntry({name:selFood.name,emoji:selFood.emoji,grams,mealType:addModal?.mealType||"snack",...calcN(selFood,grams)});}

  async function callClaude(sys,userMsg,imgData){
    const content=imgData?[{type:"image",source:{type:"base64",media_type:imgData.type,data:imgData.data}},{type:"text",text:userMsg}]:userMsg;
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:sys,messages:[{role:"user",content}]})});
    const d=await r.json();
    return JSON.parse(d.content.map(c=>c.text||"").join("").replace(/```json|```/g,"").trim());
  }
  async function handleAiAnalyze(){if(!aiInput.trim())return;setAiLoading(true);setAiResult(null);try{setAiResult(await callClaude(`Du bist Ernährungsexperte. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🍽️"}]}`,`Analysiere: ${aiInput}`));}catch{showNotif("❌ Fehler","err");}setAiLoading(false);}
  async function handleImgAnalyze(){if(!imgFile)return;setAiLoading(true);setAiResult(null);try{const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(imgFile);});setAiResult(await callClaude(`Du bist Ernährungsexperte. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🍽️"}]}`,"Analysiere diese Mahlzeit.",{type:imgFile.type,data:b64}));}catch{showNotif("❌ Fehler","err");}setAiLoading(false);}
  function handleAddAiResult(){if(!aiResult?.items?.length)return;const t=aiResult.items.reduce((a,i)=>({calories:a.calories+i.calories,protein:a.protein+i.protein,carbs:a.carbs+(i.carbs||0),fat:a.fat+(i.fat||0)}),{calories:0,protein:0,carbs:0,fat:0});addEntry({name:aiResult.items.map(i=>i.name).join(", "),emoji:aiResult.items[0]?.emoji||"🍽️",grams:aiResult.items.reduce((s,i)=>s+(i.grams||0),0),mealType:addModal?.mealType||"snack",calories:Math.round(t.calories),protein:+t.protein.toFixed(1),carbs:+t.carbs.toFixed(1),fat:+t.fat.toFixed(1)});}

  function finishOnboarding(){const u={...ob,weight:Number(ob.weight),height:Number(ob.height),age:Number(ob.age),createdAt:new Date().toISOString()};const g={calories:calcTDEE(u)||2000,protein:calcProt(u)};setUser(u);setGoals(g);lsSet(K.USER,u);lsSet(K.GOALS,g);setOnboarding(false);showNotif(`🎉 Willkommen, ${u.name}!`);}

  const todaySteps=stepsData[tk]||0;
  function requestSteps(){if("DeviceMotionEvent" in window&&typeof DeviceMotionEvent.requestPermission==="function"){DeviceMotionEvent.requestPermission().then(res=>{const ok=res==="granted";setStepsPerm(ok?"granted":"denied");lsSet("tz_steps_perm",ok?"granted":"denied");if(ok)showNotif("✅ Schrittzähler aktiv!");});}else{setStepsPerm("granted");lsSet("tz_steps_perm","granted");showNotif("✅ Schrittzähler aktiv!");}}
  function logSteps(n){const s={...stepsData,[tk]:n};setStepsData(s);lsSet(K.STEPS,s);}

  const last7Days = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const key = dateKey(d);
    const entries = log[key] || [];
    return {
      date: d, key,
      label: d.toLocaleDateString("de-DE", { weekday: "short" }).slice(0,2),
      dayNum: d.getDate(),
      calories: Math.round(entries.reduce((s,e) => s+e.calories, 0)),
      protein: +entries.reduce((s,e) => s+e.protein, 0).toFixed(0),
      isToday: key === tk,
    };
  });
  const weekTotalCal = last7Days.reduce((s,d) => s+d.calories, 0);
  const weekAvgCal = Math.round(weekTotalCal/7);

  const historyDays=Object.entries(log).sort((a,b)=>new Date(b[0])-new Date(a[0])).slice(0,30).map(([dk,entries])=>({dk,calories:Math.round(entries.reduce((s,e)=>s+e.calories,0)),protein:+entries.reduce((s,e)=>s+e.protein,0).toFixed(1),carbs:+entries.reduce((s,e)=>s+e.carbs,0).toFixed(1),fat:+entries.reduce((s,e)=>s+e.fat,0).toFixed(1),isToday:dk===tk}));
  const mealsByType=MEAL_TYPES.map(mt=>({...mt,entries:todayE.filter(e=>e.mealType===mt.id)}));
  function saveWP(p){setWorkoutPlans(p);lsSet(K.WORKOUT_PLANS,p);}
  function saveWL(w){setWorkoutLog(w);lsSet(K.WORKOUT_LOG,w);}
  const bmi=user?.weight&&user?.height?(user.weight/((user.height/100)**2)).toFixed(1):null;
  const navItems=[{id:"dashboard",icon:"⚡",label:"Heute"},{id:"log",icon:"🍽️",label:"Mahlzeiten"},{id:"history",icon:"📊",label:"Verlauf"},{id:"workout",icon:"🏋️",label:"Training"},{id:"profile",icon:"👤",label:"Profil"}];
  const sprinterEmoji = user?.gender === "female" ? "🏃‍♀️" : "🏃";
  const topFavorites = [...favorites].sort((a,b) => b.count - a.count).slice(0,6);

  if(onboarding){
    const steps=[{title:"Hallo! 👋",sub:"Wie heißt du?"},{title:"Dein Körper 📏",sub:"Zur Kalorien-Berechnung"},{title:"Dein Ziel 🎯",sub:"Was möchtest du erreichen?"},{title:"Aktivität 🏃",sub:"Wie viel bewegst du dich?"}];
    const pct=((ob.step+1)/steps.length)*100;
    return(
      <div style={{fontFamily:"'DM Sans',sans-serif",background:`linear-gradient(150deg,${C.accentSoft} 0%,${C.bg} 50%,${C.blueSoft} 100%)`,minHeight:"100svh",maxWidth:480,margin:"0 auto",display:"flex",flexDirection:"column"}}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;touch-action:manipulation}html,body{overscroll-behavior:none;-webkit-user-select:none;user-select:none}input,textarea{-webkit-user-select:text;user-select:text;font-size:16px!important}input:focus,textarea:focus{outline:2px solid ${C.accent};outline-offset:1px;border-color:${C.accent}!important}button{cursor:pointer;border:none;font-family:inherit;-webkit-tap-highlight-color:transparent}@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
        <div style={{flex:1,overflowY:"auto",padding:"32px 22px 16px"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color:C.text}}>Trackaden<span style={{color:C.accent}}>Z</span></div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>Dein persönlicher Fitness-Tracker</div>
          </div>
          <div style={{height:5,background:C.border,borderRadius:3,marginBottom:24,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.accent},${C.blue})`,width:`${pct}%`,transition:"width .4s"}}/></div>
          <div style={{animation:"slideUp .3s ease"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.text,marginBottom:3}}>{steps[ob.step].title}</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>{steps[ob.step].sub}</div>
            {ob.step===0&&<div>
              <div style={{fontSize:12,color:C.textSec,fontWeight:600,marginBottom:5}}>Dein Name</div>
              <input style={{...sInput(),marginBottom:14}} placeholder="z.B. Max" value={ob.name} onChange={e=>setOb(o=>({...o,name:e.target.value}))} autoFocus/>
              <div style={{fontSize:12,color:C.textSec,fontWeight:600,marginBottom:8}}>Geschlecht</div>
              <div style={{display:"flex",gap:8}}>{[{id:"male",l:"♂ Männlich"},{id:"female",l:"♀ Weiblich"}].map(g=>(<button key={g.id} style={sPill(ob.gender===g.id)} onClick={()=>setOb(o=>({...o,gender:g.id}))}>{g.l}</button>))}</div>
            </div>}
            {ob.step===1&&<div>
              {[{k:"age",l:"Alter (Jahre)",p:"z.B. 25"},{k:"weight",l:"Gewicht (kg)",p:"z.B. 80"},{k:"height",l:"Körpergröße (cm)",p:"z.B. 178"}].map(f=><div key={f.k}><div style={{fontSize:12,color:C.textSec,fontWeight:600,marginBottom:5}}>{f.l}</div><input type="number" inputMode="decimal" style={{...sInput(),marginBottom:12}} placeholder={f.p} value={ob[f.k]} onChange={e=>setOb(o=>({...o,[f.k]:e.target.value}))}/></div>)}
              {ob.age&&ob.weight&&ob.height&&(()=>{const b=(ob.weight/((ob.height/100)**2)).toFixed(1);const cat=b<18.5?"Untergewicht":b<25?"Normalgewicht ✓":b<30?"Übergewicht":"Adipositas";return<div style={{background:C.accentSoft,borderRadius:12,padding:12,border:`1px solid ${C.border}`}}><div style={{fontSize:11,color:C.muted}}>Dein BMI</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:C.accent}}>{b}</div><div style={{fontSize:12,color:C.textSec}}>{cat}</div></div>})()}
            </div>}
            {ob.step===2&&<div>
              <div style={{fontSize:12,color:C.textSec,fontWeight:600,marginBottom:10}}>Dein Ziel</div>
              {[{id:"lose",l:"🔥 Abnehmen",s:"−500 kcal Defizit"},{id:"maintain",l:"⚖️ Gewicht halten",s:"Erhaltungskalorien"},{id:"gain",l:"💪 Muskeln aufbauen",s:"+300 kcal Überschuss"}].map(g=><button key={g.id} onClick={()=>setOb(o=>({...o,goal:g.id}))} style={{width:"100%",background:ob.goal===g.id?C.accentSoft:C.surface,border:`1.5px solid ${ob.goal===g.id?C.accent:C.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text}}><span style={{fontWeight:700,fontSize:14}}>{g.l}</span><span style={{fontSize:12,color:C.muted}}>{g.s}</span></button>)}
              <div style={{fontSize:12,color:C.textSec,fontWeight:600,margin:"12px 0 8px"}}>Sport pro Woche</div>
              <div style={{display:"flex",gap:6}}>{[{id:"none",l:"Kein"},{id:"light",l:"1–2×"},{id:"moderate",l:"3–4×"},{id:"heavy",l:"5+×"}].map(s=><button key={s.id} style={sPill(ob.sport===s.id)} onClick={()=>setOb(o=>({...o,sport:s.id}))}>{s.l}</button>)}</div>
            </div>}
            {ob.step===3&&<div>
              {[{id:"sedentary",l:"🪑 Hauptsächlich sitzend",s:"Bürojob"},{id:"light",l:"🚶 Leicht aktiv",s:"Wenig Sport"},{id:"moderate",l:"🚴 Moderat aktiv",s:"3–5×/Woche"},{id:"active",l:"🏃 Sehr aktiv",s:"Tägl. Training"},{id:"veryActive",l:"⚡ Extrem aktiv",s:"Körperl. Arbeit+Sport"}].map(a=><button key={a.id} onClick={()=>setOb(o=>({...o,activity:a.id}))} style={{width:"100%",background:ob.activity===a.id?C.accentSoft:C.surface,border:`1.5px solid ${ob.activity===a.id?C.accent:C.border}`,borderRadius:12,padding:"11px 14px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text}}><span style={{fontWeight:700,fontSize:13}}>{a.l}</span><span style={{fontSize:11,color:C.muted}}>{a.s}</span></button>)}
              {(()=>{const preview=calcTDEE({...ob,weight:Number(ob.weight),height:Number(ob.height),age:Number(ob.age)});return preview?<div style={{background:`linear-gradient(135deg,${C.accentSoft},${C.blueSoft})`,borderRadius:14,padding:14,border:`1px solid ${C.border}`,marginTop:8}}><div style={{fontSize:11,color:C.muted,marginBottom:2}}>Dein Tagesbedarf</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,color:C.accent}}>{preview}<span style={{fontSize:13,fontWeight:400,color:C.textSec}}> kcal</span></div><div style={{fontSize:12,color:C.textSec,marginTop:2}}>Protein: {calcProt({...ob,weight:Number(ob.weight)})}g täglich</div></div>:null;})()}
            </div>}
          </div>
        </div>
        <div style={{padding:"12px 22px 28px",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",gap:10}}>
          {ob.step>0&&<button onClick={()=>setOb(o=>({...o,step:o.step-1}))} style={sBtn("ghost",{flex:1})}>← Zurück</button>}
          <button onClick={()=>ob.step<3?setOb(o=>({...o,step:o.step+1})):finishOnboarding()} disabled={ob.step===0&&!ob.name.trim()} style={sBtn("primary",{flex:2,opacity:ob.step===0&&!ob.name.trim()?0.4:1})}>{ob.step<3?"Weiter →":"🚀 Loslegen!"}</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,minHeight:"100svh",maxWidth:480,margin:"0 auto",color:C.text,display:"flex",flexDirection:"column",position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%;touch-action:manipulation}
        html,body{overscroll-behavior:none;-webkit-user-select:none;user-select:none;overflow:hidden}
        input,textarea{-webkit-user-select:text;user-select:text;font-size:16px!important}
        input:focus,textarea:focus{outline:2px solid ${C.accent};outline-offset:1px;border-color:${C.accent}!important}
        button{cursor:pointer;border:none;font-family:inherit;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${C.dim};border-radius:2px}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes scanLine{0%,100%{transform:translateY(-28px);opacity:.3}50%{transform:translateY(28px);opacity:1}}
        @keyframes sprintAcross{0%{transform:translateX(120vw) scaleX(-1) scale(.9);opacity:0}10%{opacity:1}85%{opacity:1}100%{transform:translateX(-140%) scaleX(-1) scale(1.15);opacity:0}}
        @keyframes sprintTrail{0%{opacity:0;transform:translateX(120vw)}15%{opacity:.5}100%{opacity:0;transform:translateX(-140%)}}
        @keyframes tabFade{0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)}}
        .anim{animation:slideUp .22s ease}.fade{animation:fadeIn .22s ease}
        .tab-content{animation:tabFade .35s ease}
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
        textarea{resize:none;line-height:1.5}
      `}</style>

      {tabTransition && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,pointerEvents:"none",zIndex:500,overflow:"hidden"}}>
          <div style={{position:"absolute",top:"50%",left:0,right:0,transform:"translateY(-50%)",fontSize:80,animation:"sprintAcross .95s cubic-bezier(0.4, 0, 0.2, 1) forwards",filter:`drop-shadow(0 4px 16px ${C.accent}66)`,willChange:"transform",textAlign:"right",paddingRight:0}}>
            {sprinterEmoji}
          </div>
          <div style={{position:"absolute",top:"calc(50% + 8px)",right:0,left:0,transform:"translateY(-50%)",height:4,background:`linear-gradient(270deg,transparent,${C.accent},transparent)`,borderRadius:2,animation:"sprintTrail .95s cubic-bezier(0.4,0,0.2,1) forwards"}}/>
        </div>
      )}

      {notif&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:notif.type==="err"?"#fff0f2":"#e6faf7",border:`1px solid ${notif.type==="err"?"#f5b8c0":C.borderStrong}`,color:notif.type==="err"?"#c0392b":C.accent2,padding:"10px 20px",borderRadius:12,fontSize:13,fontWeight:700,zIndex:9999,whiteSpace:"nowrap",boxShadow:C.shadowMd,animation:"slideUp .2s ease"}}>{notif.msg}</div>}

      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"calc(env(safe-area-inset-top,0) + 10px) 18px 13px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,zIndex:100,boxShadow:"0 1px 8px rgba(31,181,165,0.07)"}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,color:C.text}}>Trackaden<span style={{color:C.accent}}>Z</span></div>
          <div style={{fontSize:11,color:C.muted}}>{new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
        {user&&<div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14,color:"#fff",boxShadow:`0 2px 8px ${C.accent}44`}}>{user.name?.[0]?.toUpperCase()}</div>}
      </div>

      <div key={tab} className="tab-content" style={{flex:1,overflowY:"auto",padding:"14px 14px 82px",WebkitOverflowScrolling:"touch"}}>

        {tab==="dashboard"&&<div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:16,fontWeight:700}}>Hey {user?.name} 👋</div>
            <div style={{fontSize:12,color:C.muted}}>{goals.calories-Math.round(totals.calories)>0?`Noch ${goals.calories-Math.round(totals.calories)} kcal verfügbar`:"🎉 Tagesziel erreicht!"}</div>
          </div>
          <div style={{...sCard({background:`linear-gradient(135deg,${C.accentSoft},${C.blueSoft})`,marginBottom:12})}}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{position:"relative",flexShrink:0}}>
                <svg width={92} height={92} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={46} cy={46} r={38} fill="none" stroke={C.border} strokeWidth={8}/>
                  <circle cx={46} cy={46} r={38} fill="none" stroke={calPct>=100?"#e05c5c":C.accent} strokeWidth={8} strokeLinecap="round" strokeDasharray={239} strokeDashoffset={239-(239*calPct)/100} style={{transition:"stroke-dashoffset .8s ease"}}/>
                </svg>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:C.text,lineHeight:1}}>{Math.round(totals.calories)}</div>
                  <div style={{fontSize:9,color:C.muted}}>kcal</div>
                </div>
              </div>
              <div style={{flex:1}}>
                {[{l:"Kalorien",cur:Math.round(totals.calories),goal:goals.calories,unit:"kcal",color:C.accent,pct:calPct},{l:"Protein",cur:totals.protein,goal:goals.protein,unit:"g",color:C.pink,pct:protPct}].map(s=>(
                  <div key={s.l} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}><span style={{color:C.muted,fontWeight:600}}>{s.l}</span><span style={{color:C.text,fontWeight:700}}>{s.cur}/{s.goal}{s.unit}</span></div>
                    <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:s.pct>=100?"#e05c5c":s.color,width:`${s.pct}%`,transition:"width .8s"}}/></div>
                  </div>
                ))}
                <div style={{display:"flex",gap:7}}>
                  {[{l:"Carbs",v:`${totals.carbs}g`,c:C.yellow},{l:"Fett",v:`${totals.fat}g`,c:C.olive}].map(s=><div key={s.l} style={{flex:1,background:"rgba(255,255,255,.7)",borderRadius:8,padding:"5px 8px",textAlign:"center"}}><div style={{fontSize:12,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,fontWeight:600}}>{s.l}</div></div>)}
                </div>
              </div>
            </div>
          </div>

          <div style={{...sCard({marginBottom:12})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div>
                <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5}}>DIESE WOCHE</div>
                <div style={{fontSize:11,color:C.textSec,marginTop:1}}>Ø {weekAvgCal} kcal/Tag</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.accent}}>{weekTotalCal.toLocaleString("de-DE")}</div>
                <div style={{fontSize:9,color:C.muted,fontWeight:600}}>kcal gesamt</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:72,marginBottom:6}}>
              {(() => {
                const maxCal = Math.max(goals.calories * 1.2, ...last7Days.map(d => d.calories), 100);
                return last7Days.map((d) => {
                  const h = Math.max(4, (d.calories/maxCal)*60);
                  const goalH = (goals.calories/maxCal)*60;
                  const over = d.calories > goals.calories;
                  return (
                    <div key={d.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
                      <div style={{position:"relative",width:"100%",height:60,display:"flex",alignItems:"flex-end"}}>
                        {d.calories > 0 && <div style={{position:"absolute",bottom:goalH,left:0,right:0,height:1,background:C.dim,zIndex:0,opacity:0.6}}/>}
                        <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:d.calories===0?C.border:over?"#e05c5c":d.isToday?`linear-gradient(180deg,${C.accent},${C.accent2})`:C.borderStrong,height:`${h}px`,transition:"height .5s",position:"relative",zIndex:1}}/>
                      </div>
                      <div style={{fontSize:10,fontWeight:d.isToday?800:600,color:d.isToday?C.accent:C.muted,textTransform:"uppercase"}}>{d.label}</div>
                      <div style={{fontSize:9,color:C.muted}}>{d.dayNum}</div>
                    </div>
                  );
                });
              })()}
            </div>
            <div style={{display:"flex",gap:10,fontSize:9,color:C.muted,marginTop:6,flexWrap:"wrap"}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.accent,display:"inline-block"}}/>Heute</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.borderStrong,display:"inline-block"}}/>Im Ziel</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:"#e05c5c",display:"inline-block"}}/>Über Ziel</span>
            </div>
          </div>

          <div style={{...sCard({marginBottom:12})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:C.oliveSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👟</div>
                <div><div style={{fontSize:13,fontWeight:700}}>Schrittzähler</div>{stepsPerm==="granted"&&<div style={{fontSize:11,color:C.muted}}>~{Math.round(todaySteps*.04)} kcal verbrannt</div>}</div>
              </div>
              {stepsPerm==="granted"?<div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,color:C.olive}}>{todaySteps.toLocaleString("de-DE")}</div>:<button onClick={requestSteps} style={{background:C.oliveSoft,border:`1px solid ${C.olive}44`,borderRadius:8,color:C.olive,padding:"6px 12px",fontSize:12,fontWeight:700}}>Aktivieren</button>}
            </div>
            {stepsPerm==="granted"&&<div style={{marginTop:10}}>
              <div style={{height:5,background:C.border,borderRadius:3,marginBottom:8,overflow:"hidden"}}><div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.olive},${C.accent})`,width:`${Math.min(100,(todaySteps/10000)*100)}%`,transition:"width .5s"}}/></div>
              <div style={{display:"flex",gap:6,marginBottom:8}}>{[2000,5000,8000,10000].map(n=><button key={n} onClick={()=>logSteps(n)} style={{flex:1,background:todaySteps===n?C.oliveSoft:C.bg,border:`1px solid ${todaySteps===n?C.olive:C.border}`,borderRadius:7,padding:"5px 0",fontSize:11,fontWeight:700,color:todaySteps===n?C.olive:C.muted}}>{n>=1000?`${n/1000}k`:n}</button>)}</div>
              <input type="number" inputMode="numeric" placeholder="Eigene Schrittzahl" onBlur={e=>{if(e.target.value){logSteps(Number(e.target.value));e.target.value="";}}} style={sInput({padding:"9px 12px"})}/>
            </div>}
          </div>

          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:8}}>SCHNELL HINZUFÜGEN</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
            {MEAL_TYPES.map(mt=><button key={mt.id} onClick={()=>{setAddModal({mealType:mt.id});setAddMode("search");}} style={{background:C.surface,border:`1.5px solid ${C.border}`,borderRadius:14,padding:"13px 14px",display:"flex",alignItems:"center",gap:10,color:C.text,fontSize:13,fontWeight:600,boxShadow:C.shadow,textAlign:"left"}}><span style={{fontSize:20}}>{mt.emoji}</span>{mt.label}</button>)}
          </div>
        </div>}

        {tab==="log"&&<div>
          {mealsByType.map(mt=><div key={mt.id} style={{marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:16}}>{mt.emoji}</span>
                <span style={{fontWeight:700,fontSize:14}}>{mt.label}</span>
                {mt.entries.length>0&&<span style={{background:C.accentSoft,color:C.accent2,borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:700}}>{Math.round(mt.entries.reduce((s,e)=>s+e.calories,0))} kcal</span>}
              </div>
              <button onClick={()=>{setAddModal({mealType:mt.id});setAddMode("search");}} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:8,color:C.accent,padding:"5px 11px",fontSize:12,fontWeight:700}}>+ Add</button>
            </div>
            {mt.entries.length===0?<div style={{background:C.surface,borderRadius:12,padding:14,color:C.dim,fontSize:12,textAlign:"center",border:`1.5px dashed ${C.border}`}}>Noch nichts eingetragen</div>:mt.entries.map(e=><div key={e.id} className="anim" style={{...sCard({marginBottom:7}),display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>{e.emoji}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name}</div><div style={{fontSize:11,color:C.muted}}>{e.grams}g · {e.time}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:800,color:C.accent}}>{e.calories} kcal</div><div style={{fontSize:10,color:C.pink,fontWeight:700}}>{e.protein}g P</div></div>
              <button onClick={()=>removeEntry(e.id)} style={{background:"none",color:C.dim,fontSize:16,padding:"3px 6px",borderRadius:6}}>✕</button>
            </div>)}
          </div>)}

          {topFavorites.length > 0 && (
            <div style={{marginTop:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.6}}>⭐ DEINE FAVORITEN</div>
                <div style={{fontSize:10,color:C.dim}}>{topFavorites.length} {topFavorites.length===1?"Eintrag":"Einträge"}</div>
              </div>
              <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Tippe zum schnellen Wiederholen</div>
              {topFavorites.map(fav => (
                <div key={fav.key} style={{...sCard({marginBottom:7,padding:"11px 14px"}),display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>{fav.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fav.name}</div>
                    <div style={{fontSize:10,color:C.muted}}>{fav.grams}g · {fav.count}× gegessen · {fav.calories} kcal</div>
                  </div>
                  <button onClick={() => {
                    if (addModal) addFromFavorite(fav);
                    else { setAddModal({mealType:"snack"}); setTimeout(() => addFromFavorite(fav), 50); }
                  }} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:8,color:C.accent,padding:"6px 12px",fontSize:12,fontWeight:700,flexShrink:0}}>+ Add</button>
                  <button onClick={() => removeFavorite(fav.key)} style={{background:"none",color:C.dim,fontSize:14,padding:"3px 5px",flexShrink:0}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>}

        {tab==="history"&&<div>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.6,marginBottom:12}}>LETZTE 30 TAGE</div>
          {historyDays.length===0?<div style={{...sCard(),textAlign:"center",padding:40,color:C.dim}}><div style={{fontSize:40,marginBottom:10}}>📊</div>Noch keine Daten</div>:<>
            {historyDays.length>=2&&(()=>{const avg={cal:Math.round(historyDays.reduce((s,d)=>s+d.calories,0)/historyDays.length),prot:+(historyDays.reduce((s,d)=>s+d.protein,0)/historyDays.length).toFixed(1)};return<div style={{...sCard({background:C.accentSoft,border:`1px solid ${C.borderStrong}`,marginBottom:12}),display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>Ø KALORIEN/TAG</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:21,fontWeight:800,color:C.accent}}>{avg.cal}<span style={{fontSize:11,fontWeight:400}}> kcal</span></div></div><div><div style={{fontSize:10,color:C.muted,fontWeight:700}}>Ø PROTEIN/TAG</div><div style={{fontFamily:"'Syne',sans-serif",fontSize:21,fontWeight:800,color:C.pink}}>{avg.prot}<span style={{fontSize:11,fontWeight:400}}>g</span></div></div></div>;})()}
            <div style={{...sCard({padding:0,overflow:"hidden"})}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr",padding:"9px 12px",background:C.bg,borderBottom:`1px solid ${C.border}`}}>{["Datum","Kcal","Prot.","Carbs","Fett"].map(h=><div key={h} style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.3}}>{h}</div>)}</div>
              {historyDays.map((d,i)=>{const pct=Math.min(100,(d.calories/goals.calories)*100);return<div key={d.dk} style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr",padding:"9px 12px",borderBottom:i<historyDays.length-1?`1px solid ${C.border}`:"none",background:d.isToday?C.accentSoft:"transparent"}}>
                <div><div style={{fontSize:12,fontWeight:d.isToday?700:500,color:d.isToday?C.accent:C.text}}>{d.isToday?"Heute":new Date(d.dk).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})}</div><div style={{height:3,background:C.border,borderRadius:2,marginTop:3,overflow:"hidden",width:40}}><div style={{height:"100%",borderRadius:2,background:pct>=100?"#e05c5c":C.accent,width:`${pct}%`}}/></div></div>
                <div style={{fontSize:12,fontWeight:700,color:C.accent}}>{d.calories}</div>
                <div style={{fontSize:12,color:C.pink,fontWeight:600}}>{d.protein}g</div>
                <div style={{fontSize:12,color:C.yellow}}>{d.carbs}g</div>
                <div style={{fontSize:12,color:C.olive}}>{d.fat}g</div>
              </div>;})}
            </div>
          </>}
        </div>}

        {tab==="workout"&&<WorkoutTab workoutPlans={workoutPlans} workoutLog={workoutLog} saveWorkoutPlans={saveWP} saveWorkoutLog={saveWL} showNotif={showNotif}/>}
        {tab==="profile"&&user&&<ProfileTab user={user} goals={goals} bmi={bmi} stepsPerm={stepsPerm} requestSteps={requestSteps} setGoals={setGoals} showNotif={showNotif}/>}
      </div>

      {!kbUp&&<div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"rgba(255,255,255,.97)",backdropFilter:"blur(12px)",borderTop:`1px solid ${C.border}`,display:"flex",padding:"6px 0 max(10px,env(safe-area-inset-bottom,10px))",zIndex:200}}>
        {navItems.map(n=><button key={n.id} onClick={()=>switchTab(n.id)} style={{flex:1,background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"3px 0"}}>
          <span style={{fontSize:20,opacity:tab===n.id?1:.3,transition:"opacity .15s",transform:tab===n.id?"scale(1.1)":"scale(1)"}}>{n.icon}</span>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:.3,color:tab===n.id?C.accent:C.muted}}>{n.label}</span>
          {tab===n.id&&<div style={{width:16,height:2.5,background:C.accent,borderRadius:2}}/>}
        </button>)}
      </div>}

      {addModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:1000,display:"flex",alignItems:"flex-end",animation:"fadeIn .15s ease"}} onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
        <div style={{width:"100%",maxWidth:480,margin:"0 auto",background:C.surface,borderRadius:"22px 22px 0 0",display:"flex",flexDirection:"column",maxHeight:"93svh",boxShadow:"0 -4px 32px rgba(31,181,165,0.14)",animation:"slideUp .22s ease"}}>
          <div style={{padding:"15px 16px 11px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:C.text}}>{MEAL_TYPES.find(m=>m.id===addModal.mealType)?.emoji} {MEAL_TYPES.find(m=>m.id===addModal.mealType)?.label}</div>
              <button onClick={closeModal} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,padding:"4px 10px",fontSize:14}}>✕</button>
            </div>
            <div style={{display:"flex",gap:6}}>
              {[{id:"search",l:"🔍 Suche"},{id:"favorites",l:"⭐ Fav"},{id:"ai",l:"🤖 KI"},{id:"image",l:"📸 Foto"},{id:"barcode",l:"▦ Scan"}].map(m=><button key={m.id} onClick={()=>{if((m.id==="image"||m.id==="barcode")&&camPerm!=="granted"){requestCamera(m.id);return;}setAddMode(m.id);setAiResult(null);if(m.id==="barcode"&&camPerm==="granted")startScanner();else stopScanner();}} style={{...sPill(addMode===m.id,C.accent),fontSize:10}}>{m.l}</button>)}
            </div>
          </div>

          <div ref={modalBodyRef} style={{overflowY:"auto",padding:"13px 16px 28px",flex:1,WebkitOverflowScrolling:"touch"}}>

            {addMode==="search"&&<div>
              <input ref={searchInputRef} autoFocus value={searchQ} onChange={e=>handleSearch(e.target.value)} placeholder="z.B. Hühnchen, Reis, Quark…" style={sInput({marginBottom:10})} onFocus={()=>setTimeout(()=>modalBodyRef.current?.scrollTo({top:0,behavior:"smooth"}),350)}/>
              {searchRes.map(food=><button key={food.name} onClick={()=>handleSelectFood(food)} style={{width:"100%",background:selFood?.name===food.name?C.accentSoft:C.bg,border:`1.5px solid ${selFood?.name===food.name?C.accent:C.border}`,borderRadius:11,padding:"10px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",color:C.text}}>
                <span style={{fontSize:13,fontWeight:600}}>{food.emoji} {food.name}</span>
                <span style={{fontSize:11,color:C.muted}}>{food.calories} kcal/100g</span>
              </button>)}
              {selFood&&(()=>{const n=calcN(selFood,grams);return<div style={{background:C.accentSoft,borderRadius:14,padding:14,border:`1px solid ${C.borderStrong}`,marginTop:6}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>{selFood.emoji} {selFood.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <label style={{fontSize:12,color:C.textSec,fontWeight:700,flexShrink:0}}>Menge (g):</label>
                  <input type="number" inputMode="decimal" value={grams} onChange={e=>setGrams(Number(e.target.value))} style={sInput({flex:1,fontWeight:700})}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:12}}>
                  {[{l:"Kcal",v:n.calories,c:C.accent},{l:"Prot.",v:`${n.protein}g`,c:C.pink},{l:"Carbs",v:`${n.carbs}g`,c:C.yellow},{l:"Fett",v:`${n.fat}g`,c:C.olive}].map(s=><div key={s.l} style={{background:C.surface,borderRadius:9,padding:"8px",textAlign:"center",border:`1px solid ${C.border}`}}><div style={{fontSize:14,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:C.muted,fontWeight:700}}>{s.l}</div></div>)}
                </div>
                <button onClick={handleAddSearch} style={sBtn("primary")}>✅ Hinzufügen</button>
              </div>;})()}
            </div>}

            {addMode==="favorites"&&<div>
              {topFavorites.length === 0 ? (
                <div style={{background:C.bg,borderRadius:14,padding:36,textAlign:"center",color:C.dim,border:`1.5px dashed ${C.border}`}}>
                  <div style={{fontSize:40,marginBottom:8}}>⭐</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.textSec,marginBottom:4}}>Noch keine Favoriten</div>
                  <div style={{fontSize:12,color:C.muted}}>Deine häufig eingetragenen Mahlzeiten erscheinen hier automatisch</div>
                </div>
              ) : (
                <>
                  <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Tippe für schnelles Hinzufügen</div>
                  {topFavorites.map(fav => (
                    <div key={fav.key} style={{background:C.bg,borderRadius:11,padding:"10px 14px",marginBottom:7,border:`1.5px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:22}}>{fav.emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fav.name}</div>
                        <div style={{fontSize:10,color:C.muted}}>{fav.grams}g · {fav.calories} kcal · {fav.count}×</div>
                      </div>
                      <button onClick={() => addFromFavorite(fav)} style={{background:`linear-gradient(135deg,${C.accent},${C.accent2})`,border:"none",borderRadius:9,color:"#fff",padding:"8px 14px",fontSize:12,fontWeight:700,flexShrink:0}}>+ Add</button>
                    </div>
                  ))}
                </>
              )}
            </div>}

            {addMode==="ai"&&<div>
              <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="z.B. 150g Hühnchenbrust, 50g Reis, 1 EL Olivenöl…" style={{...sInput(),minHeight:80,marginBottom:10}} onFocus={e=>setTimeout(()=>e.target.scrollIntoView({behavior:"smooth",block:"start"}),350)}/>
              <button onClick={handleAiAnalyze} disabled={aiLoading||!aiInput.trim()} style={sBtn("primary",{opacity:!aiInput.trim()||aiLoading?.5:1,marginBottom:10})}>{aiLoading?"⏳ Analysiere…":"🤖 KI analysieren"}</button>
              {aiResult?.items&&<div>
                {aiResult.items.map((item,i)=><div key={i} style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:7,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:600}}>{item.emoji} {item.name}</div><div style={{fontSize:10,color:C.muted}}>{item.grams}g</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:C.accent}}>{item.calories} kcal</div><div style={{fontSize:10,color:C.pink,fontWeight:700}}>{item.protein}g P</div></div></div>)}
                <button onClick={handleAddAiResult} style={sBtn("primary")}>✅ Alle hinzufügen</button>
              </div>}
            </div>}

            {addMode==="image"&&<div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e=>{const f=e.target.files[0];if(!f)return;setImgFile(f);const r=new FileReader();r.onload=ev=>setImgPreview(ev.target.result);r.readAsDataURL(f);}} style={{display:"none"}}/>
              {!imgPreview?<button onClick={()=>{if(camPerm!=="granted"){requestCamera("image");return;}fileRef.current.click();}} style={{width:"100%",background:C.bg,border:`2px dashed ${C.border}`,borderRadius:16,padding:"36px 20px",color:C.muted,fontSize:13,display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:10}}><span style={{fontSize:44}}>📸</span>Foto aufnehmen oder auswählen</button>:<div style={{marginBottom:10}}><img src={imgPreview} alt="meal" style={{width:"100%",borderRadius:14,maxHeight:200,objectFit:"cover",border:`1px solid ${C.border}`,display:"block"}}/><button onClick={()=>{setImgFile(null);setImgPreview(null);setAiResult(null);}} style={{marginTop:7,background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.textSec,padding:"5px 12px",fontSize:12}}>Anderes Bild</button></div>}
              {imgFile&&<button onClick={handleImgAnalyze} disabled={aiLoading} style={sBtn("primary",{background:`linear-gradient(135deg,${C.pink},#d4704a)`,marginBottom:10})}>{aiLoading?"⏳ Erkenne Mahlzeit…":"🔍 Mahlzeit erkennen"}</button>}
              {aiResult?.items&&<div>
                {aiResult.items.map((item,i)=><div key={i} style={{background:C.bg,borderRadius:10,padding:"10px 12px",marginBottom:7,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:13,fontWeight:600}}>{item.emoji} {item.name}</div><div style={{fontSize:10,color:C.muted}}>~{item.grams}g</div></div><div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:C.accent}}>{item.calories} kcal</div><div style={{fontSize:10,color:C.pink,fontWeight:700}}>{item.protein}g P</div></div></div>)}
                <button onClick={handleAddAiResult} style={sBtn("primary")}>✅ Hinzufügen</button>
              </div>}
            </div>}

            {addMode==="barcode"&&<div>
              <div style={{position:"relative",borderRadius:16,overflow:"hidden",background:"#111",marginBottom:12,aspectRatio:"4/3",maxHeight:"45svh"}}>
                <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover",display:scanning?"block":"none"}} playsInline muted autoPlay/>
                <canvas ref={canvasRef} style={{display:"none"}}/>
                {scanning&&<>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                    {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h],i)=><div key={i} style={{position:"absolute",width:28,height:28,[v]:18,[h]:18,borderTop:v==="top"?`3px solid ${C.accent}`:"none",borderBottom:v==="bottom"?`3px solid ${C.accent}`:"none",borderLeft:h==="left"?`3px solid ${C.accent}`:"none",borderRight:h==="right"?`3px solid ${C.accent}`:"none",borderRadius:3}}/>)}
                    <div style={{width:"65%",height:2,background:`linear-gradient(90deg,transparent,${C.accent},transparent)`,animation:"scanLine 1.8s ease-in-out infinite"}}/>
                  </div>
                  <div style={{position:"absolute",bottom:10,left:0,right:0,textAlign:"center"}}><span style={{background:"rgba(0,0,0,.55)",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 14px",borderRadius:20}}>EAN / GTIN in den Rahmen halten</span></div>
                </>}
                {!scanning&&!aiLoading&&!aiResult&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:50,marginBottom:8}}>▦</div><div style={{fontSize:13,color:"#999"}}>Scanner bereit</div></div>}
                {aiLoading&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#111"}}><div style={{fontSize:34,marginBottom:8,animation:"pulse 1s infinite"}}>🔍</div><div style={{fontSize:13,color:C.accent,fontWeight:700}}>Produkt wird gesucht…</div>{scannedCode&&<div style={{fontSize:10,color:"#aaa",marginTop:4}}>GTIN: {scannedCode}</div>}</div>}
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {!scanning?<button onClick={startScanner} style={sBtn("primary")}>📷 Scanner starten</button>:<button onClick={stopScanner} style={sBtn("danger")}>⏹ Stoppen</button>}
              </div>
              <div style={{background:C.bg,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.border}`,marginBottom:12}}>
                <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8,letterSpacing:.5}}>ODER GTIN / EAN MANUELL EINGEBEN</div>
                <div style={{display:"flex",gap:8}}>
                  <input ref={barcodeInputRef} type="number" inputMode="numeric" placeholder="z.B. 4008400401805" style={sInput({flex:1,padding:"10px 12px"})} onKeyDown={e=>{if(e.key==="Enter"&&barcodeInputRef.current?.value?.length>=6){setScannedCode(barcodeInputRef.current.value);lookupGTIN(barcodeInputRef.current.value);}}}/>
                  <button onClick={()=>{if(barcodeInputRef.current?.value?.length>=6){setScannedCode(barcodeInputRef.current.value);lookupGTIN(barcodeInputRef.current.value);}}} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:10,color:C.accent,padding:"0 14px",fontSize:13,fontWeight:700,flexShrink:0}}>Suchen</button>
                </div>
              </div>
              {aiResult?.items&&!aiLoading&&<div>
                {aiResult.items.map((item,i)=><div key={i} style={{background:C.accentSoft,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${C.borderStrong}`}}>
                  <div style={{fontSize:14,fontWeight:700}}>{item.emoji} {item.name}</div>
                  <div style={{display:"flex",gap:12,marginTop:5,flexWrap:"wrap"}}>{[{l:"Kcal",v:item.calories,c:C.accent},{l:"Prot.",v:`${item.protein}g`,c:C.pink},{l:"Carbs",v:`${item.carbs||0}g`,c:C.yellow},{l:"Fett",v:`${item.fat||0}g`,c:C.olive}].map(s=><span key={s.l} style={{fontSize:11,fontWeight:700,color:s.c}}>{s.l} {s.v}</span>)}</div>
                </div>)}
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <label style={{fontSize:12,color:C.textSec,fontWeight:700,flexShrink:0}}>Menge (g):</label>
                  <input type="number" inputMode="decimal" value={grams} onChange={e=>setGrams(Number(e.target.value))} style={sInput({flex:1,fontWeight:700})}/>
                </div>
                <button onClick={()=>{const item=aiResult.items[0];if(!item)return;const r=grams/100;addEntry({name:item.name,emoji:item.emoji||"🏪",grams,mealType:addModal?.mealType||"snack",calories:Math.round(item.calories*r),protein:+(item.protein*r).toFixed(1),carbs:+((item.carbs||0)*r).toFixed(1),fat:+((item.fat||0)*r).toFixed(1)});}} style={sBtn("primary")}>✅ Hinzufügen</button>
              </div>}
            </div>}
          </div>
        </div>
      </div>}

      {camModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:22,animation:"fadeIn .15s ease"}}>
        <div style={{background:C.surface,borderRadius:22,padding:26,width:"100%",maxWidth:340,boxShadow:C.shadowMd,textAlign:"center",animation:"slideUp .22s ease",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:50,marginBottom:14}}>📷</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:C.text,marginBottom:8}}>Kamerazugriff</div>
          <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:22}}>
            TrackadenZ möchte deine Kamera nutzen, um {pendingCam==="barcode"?"Barcodes / GTINs zu scannen.":"Mahlzeiten zu fotografieren."}
            <br/><span style={{fontSize:11,color:C.muted}}>Diese Abfrage erscheint nur einmalig.</span>
          </div>
          <button onClick={grantCamera} style={sBtn("primary",{marginBottom:10})}>📷 Zugriff erlauben</button>
          <button onClick={denyCamera} style={sBtn("ghost")}>Nicht jetzt</button>
        </div>
      </div>}
    </div>
  );
}

function WorkoutTab({workoutPlans,workoutLog,saveWorkoutPlans,saveWorkoutLog,showNotif}){
  const[view,setView]=useState("plans");
  const[sel,setSel]=useState(null);
  const[newPlan,setNewPlan]=useState({name:"",days:[{name:"Tag A",exercises:[]}]});
  const[newEx,setNewEx]=useState({name:"",sets:3,reps:"8–12",weight:"",note:"",emoji:"🏋️"});
  const[dayIdx,setDayIdx]=useState(0);
  const[sw,setSw]=useState({});
  const emos=["🏋️","💪","🦵","🔥","⚡","🎯","🤸","🏃","🚴","🧗","🥊","🤼"];
  const iS={width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:16,marginBottom:8,fontFamily:"'DM Sans',sans-serif"};

  const createPlan=()=>{if(!newPlan.name.trim())return;saveWorkoutPlans([...workoutPlans,{...newPlan,id:Date.now(),createdAt:new Date().toISOString()}]);setView("plans");setNewPlan({name:"",days:[{name:"Tag A",exercises:[]}]});showNotif("✅ Plan erstellt!");};
  const delPlan=id=>{saveWorkoutPlans(workoutPlans.filter(p=>p.id!==id));showNotif("🗑️ Gelöscht","err");};
  const addEx=()=>{if(!newEx.name.trim())return;const p=JSON.parse(JSON.stringify(sel));p.days[dayIdx].exercises=[...(p.days[dayIdx].exercises||[]),{...newEx,id:Date.now()}];saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));setSel(p);setNewEx({name:"",sets:3,reps:"8–12",weight:"",note:"",emoji:"🏋️"});showNotif("✅ Übung hinzugefügt!");};
  const remEx=(di,eid)=>{const p=JSON.parse(JSON.stringify(sel));p.days[di].exercises=p.days[di].exercises.filter(e=>e.id!==eid);saveWorkoutPlans(workoutPlans.map(wp=>wp.id===p.id?p:wp));setSel(p);};
  const logSession=()=>{const today=new Date().toDateString();const entry={planId:sel.id,planName:sel.name,dayName:sel.days[dayIdx].name,exercises:(sel.days[dayIdx].exercises||[]).map(ex=>({...ex,weight:sw[ex.id]||ex.weight||"–"})),date:today,timestamp:Date.now()};const wl={...workoutLog};if(!wl[today])wl[today]=[];wl[today].push(entry);saveWorkoutLog(wl);setSw({});showNotif("🎉 Training gespeichert!");setView("plans");};
  const last14=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));const key=d.toDateString();return{label:d.toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"}),count:(workoutLog[key]||[]).length};});
  const maxC=Math.max(1,...last14.map(d=>d.count));

  if(view==="create")return<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><button onClick={()=>setView("plans")} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,color:C.textSec,padding:"6px 12px",fontSize:13}}>← Zurück</button><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800}}>Neuer Plan</div></div>
    <input style={iS} placeholder="Planname (z.B. Push/Pull/Legs)" value={newPlan.name} onChange={e=>setNewPlan(p=>({...p,name:e.target.value}))} autoFocus/>
    <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:8}}>TRAININGSTAGE</div>
    {newPlan.days.map((day,di)=><div key={di} style={{display:"flex",gap:7,marginBottom:7}}><input style={{...iS,flex:1,marginBottom:0}} value={day.name} onChange={e=>{const days=[...newPlan.days];days[di].name=e.target.value;setNewPlan(p=>({...p,days}));}} placeholder={`Tag ${di+1}`}/>{newPlan.days.length>1&&<button onClick={()=>setNewPlan(p=>({...p,days:p.days.filter((_,i)=>i!==di)}))} style={{background:"#fff0f2",border:`1px solid #f5b8c0`,borderRadius:9,color:"#c0392b",padding:"0 10px",fontSize:14}}>✕</button>}</div>)}
    <button onClick={()=>setNewPlan(p=>({...p,days:[...p.days,{name:`Tag ${p.days.length+1}`,exercises:[]}]}))} style={{width:"100%",background:C.bg,border:`1.5px dashed ${C.border}`,borderRadius:10,color:C.muted,padding:10,fontSize:12,marginBottom:16}}>+ Tag hinzufügen</button>
    <button onClick={createPlan} disabled={!newPlan.name.trim()} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,borderRadius:12,padding:13,color:"#fff",fontSize:14,fontWeight:700,opacity:!newPlan.name.trim()?.5:1}}>✅ Plan erstellen</button>
  </div>;

  if(view==="detail"&&sel)return<div>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><button onClick={()=>{setView("plans");setSel(null);}} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,color:C.textSec,padding:"6px 12px",fontSize:13}}>← Zurück</button><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,flex:1}}>{sel.name}</div><button onClick={()=>setView("logSession")} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:9,color:C.accent,padding:"6px 12px",fontSize:12,fontWeight:700}}>▶ Start</button></div>
    <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto"}}>{sel.days.map((day,i)=><button key={i} onClick={()=>setDayIdx(i)} style={{flexShrink:0,padding:"6px 14px",borderRadius:9,fontSize:12,fontWeight:700,background:dayIdx===i?C.accent:C.bg,color:dayIdx===i?"#fff":C.muted,border:`1.5px solid ${dayIdx===i?C.accent:C.border}`}}>{day.name}</button>)}</div>
    {(sel.days[dayIdx].exercises||[]).map(ex=><div key={ex.id} style={{...sCard({marginBottom:8}),display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:22}}>{ex.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:C.muted}}>{ex.sets} Sätze × {ex.reps}{ex.weight?` · ${ex.weight}kg`:""}</div>{ex.note&&<div style={{fontSize:10,color:C.dim,marginTop:2}}>{ex.note}</div>}</div>
      <button onClick={()=>remEx(dayIdx,ex.id)} style={{background:"none",color:C.dim,fontSize:14,padding:4}}>✕</button>
    </div>)}
    <div style={{background:C.bg,borderRadius:14,padding:14,border:`1.5px dashed ${C.border}`,marginTop:4}}>
      <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:10}}>+ ÜBUNG HINZUFÜGEN</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{emos.map(em=><button key={em} onClick={()=>setNewEx(e=>({...e,emoji:em}))} style={{background:newEx.emoji===em?C.accentSoft:C.surface,border:`1.5px solid ${newEx.emoji===em?C.accent:C.border}`,borderRadius:7,padding:"5px 8px",fontSize:18}}>{em}</button>)}</div>
      <input style={iS} placeholder="Übungsname (z.B. Bankdrücken)" value={newEx.name} onChange={e=>setNewEx(x=>({...x,name:e.target.value}))}/>
      <div style={{display:"flex",gap:8}}><div style={{flex:1}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>SÄTZE</div><input type="number" style={iS} value={newEx.sets} onChange={e=>setNewEx(x=>({...x,sets:Number(e.target.value)}))}/></div><div style={{flex:1}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>WIEDERH.</div><input style={iS} value={newEx.reps} onChange={e=>setNewEx(x=>({...x,reps:e.target.value}))} placeholder="z.B. 8–12"/></div><div style={{flex:1}}><div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4}}>KG</div><input type="number" style={iS} value={newEx.weight} onChange={e=>setNewEx(x=>({...x,weight:e.target.value}))} placeholder="Opt."/></div></div>
      <input style={iS} placeholder="Notiz (optional)" value={newEx.note} onChange={e=>setNewEx(x=>({...x,note:e.target.value}))}/>
      <button onClick={addEx} disabled={!newEx.name.trim()} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,borderRadius:10,padding:11,color:"#fff",fontSize:13,fontWeight:700,opacity:!newEx.name.trim()?.5:1}}>+ Übung hinzufügen</button>
    </div>
  </div>;

  if(view==="logSession"&&sel){
    const dayEx=sel.days[dayIdx].exercises||[];
    return<div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><button onClick={()=>setView("detail")} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:9,color:C.textSec,padding:"6px 12px",fontSize:13}}>← Zurück</button><div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800}}>🏋️ Training</div></div>
      <div style={{background:C.accentSoft,borderRadius:12,padding:"12px 16px",marginBottom:12,border:`1px solid ${C.borderStrong}`}}><div style={{fontWeight:700,fontSize:14}}>{sel.name} · {sel.days[dayIdx].name}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{dayEx.length} Übungen</div></div>
      {dayEx.map(ex=><div key={ex.id} style={{...sCard({marginBottom:10})}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}><span style={{fontSize:22}}>{ex.emoji}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{ex.name}</div><div style={{fontSize:11,color:C.muted}}>{ex.sets} × {ex.reps}</div></div></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><label style={{fontSize:12,color:C.textSec,fontWeight:700,flexShrink:0}}>Gewicht (kg):</label><input type="number" inputMode="decimal" value={sw[ex.id]||ex.weight||""} onChange={e=>setSw(w=>({...w,[ex.id]:e.target.value}))} placeholder={ex.weight||"kg"} style={{flex:1,background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:16,fontWeight:700,fontFamily:"inherit"}}/></div>
      </div>)}
      <button onClick={logSession} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},${C.blue})`,borderRadius:12,padding:14,color:"#fff",fontSize:15,fontWeight:700,marginTop:4}}>🎉 Training abschließen</button>
    </div>;
  }

  return<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>🏋️ Training</div><button onClick={()=>setView("create")} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:9,color:C.accent,padding:"6px 14px",fontSize:12,fontWeight:700}}>+ Neuer Plan</button></div>
    {Object.keys(workoutLog).length>0&&<div style={{...sCard({marginBottom:14})}}>
      <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.5,marginBottom:10}}>TRAINING LETZTE 14 TAGE</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:3,height:48}}>{last14.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:"100%",borderRadius:"3px 3px 0 0",background:d.count>0?C.accent:C.border,height:`${(d.count/maxC)*40+(d.count>0?8:0)}px`,minHeight:4,transition:"height .4s"}}/>{i%4===0&&<div style={{fontSize:8,color:C.muted}}>{d.label.split(".")[0]}</div>}</div>)}</div>
    </div>}
    {workoutPlans.length===0?<div style={{...sCard({border:`1.5px dashed ${C.border}`}),textAlign:"center",padding:36,color:C.dim}}><div style={{fontSize:40,marginBottom:10}}>🏋️</div>Erstelle deinen ersten Plan</div>:workoutPlans.map(plan=><div key={plan.id} style={{...sCard({marginBottom:10})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1,cursor:"pointer",minWidth:0}} onClick={()=>{setSel(plan);setDayIdx(0);setView("detail");}}>
          <div style={{fontSize:14,fontWeight:700}}>{plan.name}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{plan.days.length} Tage · {plan.days.reduce((s,d)=>s+(d.exercises||[]).length,0)} Übungen</div>
          <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>{plan.days.map((d,i)=><span key={i} style={{background:C.bg,borderRadius:6,padding:"2px 8px",fontSize:10,color:C.textSec,border:`1px solid ${C.border}`,fontWeight:600}}>{d.name}</span>)}</div>
        </div>
        <div style={{display:"flex",gap:6,marginLeft:10,flexShrink:0}}>
          <button onClick={()=>{setSel(plan);setDayIdx(0);setView("detail");}} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:8,color:C.accent,padding:"6px 10px",fontSize:11,fontWeight:700}}>Öffnen</button>
          <button onClick={()=>delPlan(plan.id)} style={{background:"#fff0f2",border:`1px solid #f5b8c0`,borderRadius:8,color:"#c0392b",padding:"6px 9px",fontSize:13}}>🗑️</button>
        </div>
      </div>
    </div>)}
    {Object.keys(workoutLog).length>0&&<div style={{marginTop:16}}>
      <div style={{fontSize:10,color:C.muted,fontWeight:700,letterSpacing:.5,marginBottom:10}}>LETZTE EINHEITEN</div>
      {Object.entries(workoutLog).sort((a,b)=>new Date(b[0])-new Date(a[0])).slice(0,4).flatMap(([dk,sessions])=>sessions.map((s,i)=><div key={`${dk}-${i}`} style={{...sCard({marginBottom:8}),display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700}}>{s.planName} · {s.dayName}</div><div style={{fontSize:11,color:C.muted,marginTop:2}}>{dk===new Date().toDateString()?"Heute":new Date(dk).toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit"})} · {s.exercises.length} Übungen</div></div><span style={{fontSize:18}}>✅</span></div>))}
    </div>}
  </div>;
}

function ProfileTab({user,goals,bmi,stepsPerm,requestSteps,setGoals,showNotif}){
  const[editG,setEditG]=useState(goals);
  const[gOpen,setGOpen]=useState(false);
  const bmiCat=bmi<18.5?"Untergewicht":bmi<25?"Normalgewicht ✓":bmi<30?"Übergewicht":"Adipositas";
  const save=()=>{setGoals(editG);lsSet(K.GOALS,editG);setGOpen(false);showNotif("🎯 Ziele gespeichert!");};
  return<div>
    <div style={{background:`linear-gradient(135deg,${C.accentSoft},${C.blueSoft})`,borderRadius:18,padding:"22px 16px",marginBottom:12,textAlign:"center",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
      <div style={{width:58,height:58,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,color:"#fff",boxShadow:`0 4px 14px ${C.accent}44`}}>{user.name?.[0]?.toUpperCase()}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,color:C.text}}>{user.name}</div>
      <div style={{fontSize:12,color:C.muted,marginTop:3}}>{user.gender==="male"?"Männlich":"Weiblich"} · {user.age} Jahre</div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
      {[{l:"Gewicht",v:`${user.weight}kg`,c:C.accent},{l:"Größe",v:`${user.height}cm`,c:C.blue},{l:"BMI",v:bmi,c:bmi<25?C.olive:C.yellow}].map(s=><div key={s.l} style={{...sCard({textAlign:"center"})}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
        <div style={{fontSize:10,color:C.muted,marginTop:2,fontWeight:700}}>{s.l}</div>
      </div>)}
    </div>
    <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:12}}>BMI: <strong style={{color:C.text}}>{bmiCat}</strong></div>
    <div style={{...sCard({marginBottom:10})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5}}>TAGESZIELE</div><button onClick={()=>{setEditG(goals);setGOpen(g=>!g);}} style={{background:C.accentSoft,border:`1px solid ${C.accent}44`,borderRadius:7,color:C.accent,padding:"4px 10px",fontSize:11,fontWeight:700}}>Bearbeiten</button></div>
      {[{l:"Kalorien",v:`${goals.calories} kcal`,c:C.accent},{l:"Protein",v:`${goals.protein}g`,c:C.pink}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:C.textSec,fontWeight:500}}>{r.l}</span><span style={{fontSize:14,fontWeight:800,color:r.c}}>{r.v}</span></div>)}
      {gOpen&&<div style={{marginTop:12}}>
        {[{key:"calories",l:"Kalorien (kcal)"},{key:"protein",l:"Protein (g)"}].map(f=><div key={f.key} style={{marginBottom:10}}><div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:5}}>{f.l}</div><input type="number" inputMode="decimal" value={editG[f.key]} onChange={e=>setEditG(g=>({...g,[f.key]:Number(e.target.value)}))} style={{width:"100%",background:C.bg,border:`1.5px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:16,fontWeight:700,fontFamily:"inherit"}}/></div>)}
        <button onClick={save} style={{width:"100%",background:`linear-gradient(135deg,${C.accent},${C.accent2})`,borderRadius:10,padding:12,color:"#fff",fontSize:14,fontWeight:700}}>💾 Speichern</button>
      </div>}
    </div>
    <div style={{...sCard({marginBottom:10})}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:700}}>👟 Schrittzähler</div><div style={{fontSize:11,color:C.muted,marginTop:1}}>{stepsPerm==="granted"?"✅ Aktiviert":"Nicht aktiviert"}</div></div>{stepsPerm!=="granted"&&<button onClick={requestSteps} style={{background:C.oliveSoft,border:`1px solid ${C.olive}44`,borderRadius:8,color:C.olive,padding:"6px 12px",fontSize:12,fontWeight:700}}>Aktivieren</button>}</div>
    </div>
    <div style={{...sCard({marginBottom:24})}}>
      <div style={{fontSize:11,color:C.muted,fontWeight:700,marginBottom:6}}>ACCOUNT</div>
      <div style={{fontSize:12,color:C.muted}}>Mitglied seit</div>
      <div style={{fontSize:14,fontWeight:700,marginTop:2}}>{new Date(user.createdAt).toLocaleDateString("de-DE",{day:"numeric",month:"long",year:"numeric"})}</div>
    </div>
  </div>;
}
