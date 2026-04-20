import { useState, useEffect, useRef } from "react";

// ─── Storage Keys ────────────────────────────────────────────────────────────
const K = {
  USER: "trackadenz_user",
  LOG: "trackadenz_log",
  GOALS: "trackadenz_goals",
  STEPS: "trackadenz_steps",
  WORKOUT_PLANS: "trackadenz_workout_plans",
  WORKOUT_LOG: "trackadenz_workout_log",
};

// ─── Food Database (per 100g) ────────────────────────────────────────────────
const FOOD_DB = [
  { name: "Hühnchenbrust (gegrillt)", calories: 165, protein: 31, carbs: 0, fat: 3.6, emoji: "🍗" },
  { name: "Hühnchen (allgemein)", calories: 239, protein: 27, carbs: 0, fat: 14, emoji: "🍗" },
  { name: "Hähnchenbrust (roh)", calories: 120, protein: 22, carbs: 0, fat: 2.6, emoji: "🍗" },
  { name: "Hähnchenschenkel", calories: 209, protein: 26, carbs: 0, fat: 11, emoji: "🍗" },
  { name: "Lachs", calories: 208, protein: 20, carbs: 0, fat: 13, emoji: "🐟" },
  { name: "Thunfisch (Dose)", calories: 116, protein: 26, carbs: 0, fat: 1, emoji: "🐟" },
  { name: "Rindfleisch (mager)", calories: 217, protein: 26, carbs: 0, fat: 12, emoji: "🥩" },
  { name: "Schweinefleisch (mager)", calories: 242, protein: 27, carbs: 0, fat: 14, emoji: "🥩" },
  { name: "Eier", calories: 155, protein: 13, carbs: 1.1, fat: 11, emoji: "🥚" },
  { name: "Milch (3,5%)", calories: 61, protein: 3.4, carbs: 4.8, fat: 3.5, emoji: "🥛" },
  { name: "Joghurt (griechisch)", calories: 97, protein: 9, carbs: 3.6, fat: 5, emoji: "🥛" },
  { name: "Quark (Magerquark)", calories: 67, protein: 12, carbs: 3.7, fat: 0.2, emoji: "🥛" },
  { name: "Hüttenkäse", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, emoji: "🧀" },
  { name: "Mozzarella", calories: 280, protein: 28, carbs: 2.2, fat: 17, emoji: "🧀" },
  { name: "Reis (gekocht)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, emoji: "🍚" },
  { name: "Reis (roh)", calories: 350, protein: 7, carbs: 77, fat: 0.7, emoji: "🍚" },
  { name: "Nudeln (gekocht)", calories: 131, protein: 5, carbs: 25, fat: 1.1, emoji: "🍝" },
  { name: "Nudeln (roh)", calories: 371, protein: 13, carbs: 74, fat: 1.5, emoji: "🍝" },
  { name: "Haferflocken", calories: 389, protein: 17, carbs: 66, fat: 7, emoji: "🥣" },
  { name: "Brot (Vollkorn)", calories: 247, protein: 13, carbs: 41, fat: 3.4, emoji: "🍞" },
  { name: "Toastbrot", calories: 265, protein: 8, carbs: 49, fat: 3.4, emoji: "🍞" },
  { name: "Kartoffeln", calories: 77, protein: 2, carbs: 17, fat: 0.1, emoji: "🥔" },
  { name: "Süßkartoffel", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, emoji: "🍠" },
  { name: "Brokkoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, emoji: "🥦" },
  { name: "Spinat", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, emoji: "🥬" },
  { name: "Tomaten", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, emoji: "🍅" },
  { name: "Banane", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, emoji: "🍌" },
  { name: "Apfel", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, emoji: "🍎" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, emoji: "🥑" },
  { name: "Nüsse (Mandeln)", calories: 579, protein: 21, carbs: 22, fat: 50, emoji: "🥜" },
  { name: "Erdnussbutter", calories: 588, protein: 25, carbs: 20, fat: 50, emoji: "🥜" },
  { name: "Olivenöl", calories: 884, protein: 0, carbs: 0, fat: 100, emoji: "🫙" },
  { name: "Protein-Pulver (Whey)", calories: 380, protein: 75, carbs: 10, fat: 5, emoji: "💪" },
  { name: "Linsen (gekocht)", calories: 116, protein: 9, carbs: 20, fat: 0.4, emoji: "🫘" },
  { name: "Kichererbsen (gekocht)", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, emoji: "🫘" },
  { name: "Tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, emoji: "🟫" },
  { name: "Käse (Gouda)", calories: 356, protein: 25, carbs: 2.2, fat: 27, emoji: "🧀" },
  { name: "Schinken (mager)", calories: 145, protein: 22, carbs: 1.5, fat: 5.5, emoji: "🥩" },
  { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, emoji: "🧈" },
  { name: "Frischkäse", calories: 342, protein: 7.5, carbs: 4.1, fat: 33, emoji: "🧀" },
];

const MEAL_TYPES = [
  { id: "breakfast", label: "Frühstück", emoji: "☀️" },
  { id: "lunch", label: "Mittagessen", emoji: "🌤️" },
  { id: "dinner", label: "Abendessen", emoji: "🌙" },
  { id: "snack", label: "Snack", emoji: "🍎" },
];

// ─── BMR / TDEE Calculation ──────────────────────────────────────────────────
function calcTDEE(user) {
  const { weight, height, age, gender, activity, goal } = user;
  if (!weight || !height || !age) return null;
  // Mifflin-St Jeor
  let bmr = gender === "male"
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  const actMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
  let tdee = bmr * (actMult[activity] || 1.55);
  if (goal === "lose") tdee -= 500;
  else if (goal === "gain") tdee += 300;
  return Math.round(tdee);
}

function calcProteinGoal(user) {
  if (!user?.weight) return 150;
  if (user.goal === "gain") return Math.round(user.weight * 2.2);
  if (user.goal === "lose") return Math.round(user.weight * 2.0);
  return Math.round(user.weight * 1.8);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function todayKey() { return new Date().toDateString(); }
function ls(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function searchFoods(q) {
  if (!q || q.length < 2) return [];
  const lq = q.toLowerCase();
  return FOOD_DB.filter(f => f.name.toLowerCase().includes(lq)).slice(0, 8);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function TrackadenZ() {
  const [user, setUser] = useState(null);
  const [onboarding, setOnboarding] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [log, setLog] = useState({});
  const [goals, setGoals] = useState({ calories: 2000, protein: 150 });
  const [stepsData, setStepsData] = useState({});
  const [stepsPermission, setStepsPermission] = useState(null); // null|'granted'|'denied'
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [workoutLog, setWorkoutLog] = useState({});
  const [notification, setNotif] = useState(null);

  // Modals
  const [addModal, setAddModal] = useState(null);
  const [addMode, setAddMode] = useState("search");
  const [goalsModal, setGoalsModal] = useState(false);
  const [workoutModal, setWorkoutModal] = useState(null);
  const [activeWorkout, setActiveWorkout] = useState(null);

  // Camera permission (covers both photo analysis AND barcode scanner)
  const [cameraPermission, setCameraPermission] = useState(null); // null | 'granted' | 'denied'
  const [cameraPermModal, setCameraPermModal] = useState(false);
  const [pendingCameraAction, setPendingCameraAction] = useState(null); // 'image' | 'barcode'

  // Barcode scanner state
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // Add food state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams] = useState(100);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();
  const barcodeRef = useRef();

  // Onboarding state
  const [ob, setOb] = useState({
    step: 0,
    name: "", gender: "male", age: "", weight: "", height: "",
    activity: "moderate", goal: "maintain", sport: "none",
  });

  // Load everything
  useEffect(() => {
    const u = ls(K.USER, null);
    if (u) {
      setUser(u);
      const cal = calcTDEE(u) || 2000;
      const prot = calcProteinGoal(u);
      const savedGoals = ls(K.GOALS, { calories: cal, protein: prot });
      setGoals(savedGoals);
    } else {
      setOnboarding(true);
    }
    setLog(ls(K.LOG, {}));
    setStepsData(ls(K.STEPS, {}));
    setStepsPermission(ls("trackadenz_steps_perm", null));
    setCameraPermission(ls("trackadenz_cam_perm", null));
    setWorkoutPlans(ls(K.WORKOUT_PLANS, []));
    setWorkoutLog(ls(K.WORKOUT_LOG, {}));
  }, []);

  // Midnight reset
  useEffect(() => {
    const check = () => {
      const today = todayKey();
      if (ls("trackadenz_reset", "") !== today) lsSet("trackadenz_reset", today);
    };
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, []);

  function showNotif(msg, type = "success") {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 2800);
  }

  // ── Camera permission ────────────────────────────────────────────────────────
  function requestCameraAccess(action) {
    if (cameraPermission === "granted") {
      // Already granted – go straight to action
      if (action === "barcode") startBarcodeScanner();
      else setAddMode("image");
      return;
    }
    setPendingCameraAction(action);
    setCameraPermModal(true);
  }

  async function grantCameraPermission() {
    setCameraPermModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      stream.getTracks().forEach(t => t.stop()); // just testing – stop immediately
      setCameraPermission("granted");
      lsSet("trackadenz_cam_perm", "granted");
      showNotif("📷 Kamerazugriff erteilt!");
      if (pendingCameraAction === "barcode") setTimeout(startBarcodeScanner, 300);
      else setAddMode("image");
    } catch {
      setCameraPermission("denied");
      lsSet("trackadenz_cam_perm", "denied");
      showNotif("❌ Kamerazugriff verweigert", "error");
    }
    setPendingCameraAction(null);
  }

  function denyCameraPermission() {
    setCameraPermModal(false);
    setCameraPermission("denied");
    lsSet("trackadenz_cam_perm", "denied");
    setPendingCameraAction(null);
    showNotif("Kamerazugriff nicht erteilt", "error");
  }

  // ── Barcode scanner (real camera stream + BarcodeDetector API) ───────────────
  async function startBarcodeScanner() {
    setScanning(true);
    setScannedCode("");
    setAiResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // Use BarcodeDetector if available, else fallback to canvas snapshot + AI
      if ("BarcodeDetector" in window) {
        const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              stopBarcodeScanner();
              setScannedCode(code);
              handleBarcode(code);
            }
          } catch { /* still scanning */ }
        }, 400);
      } else {
        // Fallback: capture frame every 2s, send to AI as image for recognition
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || !canvasRef.current) return;
          const canvas = canvasRef.current;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          if (dataUrl.length < 1000) return;
          clearInterval(scanIntervalRef.current);
          stopBarcodeScanner();
          // send frame to AI as image
          const base64 = dataUrl.split(",")[1];
          setAiLoading(true);
          try {
            const res = await callClaude(
              `Du bist eine Barcode-Erkennungs-KI. Analysiere das Bild nach sichtbaren Barcodes/EAN-Codes. Wenn du einen Barcode erkennst, gib das Produkt zurück. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🏪"}]}`,
              "Erkenne den Barcode und gib das Produkt zurück.",
              { type: "image/jpeg", data: base64 }
            );
            setAiResult(res);
          } catch { showNotif("❌ Barcode nicht erkannt", "error"); }
          setAiLoading(false);
        }, 2500);
      }
    } catch (e) {
      setScanning(false);
      showNotif("❌ Kamera konnte nicht gestartet werden", "error");
    }
  }

  function stopBarcodeScanner() {
    setScanning(false);
    clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  // Stop camera when modal closes
  useEffect(() => {
    if (!addModal) stopBarcodeScanner();
  }, [addModal]);

  // ── Today totals ────────────────────────────────────────────────────────────
  const tk = todayKey();
  const todayEntries = log[tk] || [];
  const totals = todayEntries.reduce(
    (a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein, carbs: a.carbs + e.carbs, fat: a.fat + e.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const calPct = Math.min(100, (totals.calories / goals.calories) * 100);
  const protPct = Math.min(100, (totals.protein / goals.protein) * 100);

  // ── Steps ────────────────────────────────────────────────────────────────────
  const todaySteps = stepsData[tk] || 0;
  const stepsCal = Math.round(todaySteps * 0.04);

  function requestSteps() {
    // On mobile, DeviceMotionEvent / Health APIs would be used; here we simulate
    if ("DeviceMotionEvent" in window && typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission().then(res => {
        const granted = res === "granted";
        setStepsPermission(granted ? "granted" : "denied");
        lsSet("trackadenz_steps_perm", granted ? "granted" : "denied");
        if (granted) showNotif("✅ Schrittzähler aktiviert!");
        else showNotif("❌ Zugriff verweigert", "error");
      });
    } else {
      // Non-iOS or web – show manual entry
      setStepsPermission("granted");
      lsSet("trackadenz_steps_perm", "granted");
      showNotif("✅ Schrittzähler aktiviert (manuelle Eingabe)");
    }
  }

  function logSteps(count) {
    const newSD = { ...stepsData, [tk]: count };
    setStepsData(newSD);
    lsSet(K.STEPS, newSD);
  }

  // ── Food log ─────────────────────────────────────────────────────────────────
  function addEntry(entry) {
    const newLog = { ...log };
    if (!newLog[tk]) newLog[tk] = [];
    newLog[tk] = [...newLog[tk], { ...entry, id: Date.now(), time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }) }];
    setLog(newLog);
    lsSet(K.LOG, newLog);
    closeAddModal();
    showNotif("✅ Mahlzeit eingetragen!");
  }

  function removeEntry(id) {
    const newLog = { ...log, [tk]: (log[tk] || []).filter(e => e.id !== id) };
    setLog(newLog);
    lsSet(K.LOG, newLog);
    showNotif("🗑️ Eintrag entfernt", "error");
  }

  function closeAddModal() {
    setAddModal(null); setSelectedFood(null); setSearchQuery(""); setSearchResults([]);
    setGrams(100); setAiInput(""); setAiResult(null); setImageFile(null); setImagePreview(null);
    stopBarcodeScanner(); setScannedCode("");
  }

  function calcNutrients(food, g) {
    const r = g / 100;
    return { calories: Math.round(food.calories * r), protein: +(food.protein * r).toFixed(1), carbs: +(food.carbs * r).toFixed(1), fat: +(food.fat * r).toFixed(1) };
  }

  function handleSearch(q) { setSearchQuery(q); setSelectedFood(null); setSearchResults(searchFoods(q)); }
  function handleSelectFood(food) { setSelectedFood(food); setSearchResults([]); setSearchQuery(food.name); }

  function handleAddFromSearch() {
    if (!selectedFood) return;
    addEntry({ name: selectedFood.name, emoji: selectedFood.emoji, grams, mealType: addModal?.mealType || "snack", ...calcNutrients(selectedFood, grams) });
  }

  async function callClaude(system, userMsg, imageData) {
    const content = imageData
      ? [{ type: "image", source: { type: "base64", media_type: imageData.type, data: imageData.data } }, { type: "text", text: userMsg }]
      : userMsg;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
    });
    const d = await r.json();
    const txt = d.content.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
    return JSON.parse(txt);
  }

  async function handleAiAnalyze() {
    if (!aiInput.trim()) return;
    setAiLoading(true); setAiResult(null);
    try {
      const res = await callClaude(
        `Du bist Ernährungsexperte. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🍽️"}]}`,
        `Analysiere und gib Nährwerte: ${aiInput}`
      );
      setAiResult(res);
    } catch { showNotif("❌ Analysefehler", "error"); }
    setAiLoading(false);
  }

  async function handleImageAnalyze() {
    if (!imageFile) return;
    setAiLoading(true); setAiResult(null);
    try {
      const data64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(imageFile); });
      const res = await callClaude(
        `Du bist Ernährungsexperte der Mahlzeiten auf Bildern analysiert. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🍽️"}]}`,
        "Analysiere diese Mahlzeit und schätze alle Nährwerte realistisch.",
        { type: imageFile.type, data: data64 }
      );
      setAiResult(res);
    } catch { showNotif("❌ Bilderkennung fehlgeschlagen", "error"); }
    setAiLoading(false);
  }

  async function handleBarcode(code) {
    if (code.length < 8) return;
    setAiLoading(true); setAiResult(null);
    try {
      const res = await callClaude(
        `Du bist eine Lebensmitteldatenbank. Antworte NUR mit JSON: {"items":[{"name":"...","grams":100,"calories":0,"protein":0,"carbs":0,"fat":0,"emoji":"🏪"}]}`,
        `Barcode/EAN: ${code}`
      );
      setAiResult(res);
    } catch { showNotif("❌ Barcode nicht erkannt", "error"); }
    setAiLoading(false);
  }

  function handleAddAiResult() {
    if (!aiResult?.items?.length) return;
    const t = aiResult.items.reduce((a, i) => ({ calories: a.calories + i.calories, protein: a.protein + i.protein, carbs: a.carbs + (i.carbs || 0), fat: a.fat + (i.fat || 0) }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    addEntry({ name: aiResult.items.map(i => i.name).join(", "), emoji: aiResult.items[0]?.emoji || "🍽️", grams: aiResult.items.reduce((s, i) => s + (i.grams || 0), 0), mealType: addModal?.mealType || "snack", calories: Math.round(t.calories), protein: +t.protein.toFixed(1), carbs: +t.carbs.toFixed(1), fat: +t.fat.toFixed(1) });
  }

  // ── Onboarding ───────────────────────────────────────────────────────────────
  function finishOnboarding() {
    const newUser = { ...ob, createdAt: new Date().toISOString() };
    const cal = calcTDEE(newUser) || 2000;
    const prot = calcProteinGoal(newUser);
    const newGoals = { calories: cal, protein: prot };
    setUser(newUser);
    setGoals(newGoals);
    lsSet(K.USER, newUser);
    lsSet(K.GOALS, newGoals);
    setOnboarding(false);
    showNotif(`🎉 Willkommen, ${newUser.name}!`);
  }

  // ── History data ─────────────────────────────────────────────────────────────
  const historyDays = Object.entries(log)
    .sort((a, b) => new Date(b[0]) - new Date(a[0]))
    .slice(0, 30)
    .map(([dateKey, entries]) => ({
      dateKey,
      calories: Math.round(entries.reduce((s, e) => s + e.calories, 0)),
      protein: +entries.reduce((s, e) => s + e.protein, 0).toFixed(1),
      carbs: +entries.reduce((s, e) => s + e.carbs, 0).toFixed(1),
      fat: +entries.reduce((s, e) => s + e.fat, 0).toFixed(1),
      meals: entries.length,
      isToday: dateKey === tk,
    }));

  const mealsByType = MEAL_TYPES.map(mt => ({ ...mt, entries: todayEntries.filter(e => e.mealType === mt.id) }));

  // ── Workout helpers ───────────────────────────────────────────────────────────
  function saveWorkoutPlans(plans) { setWorkoutPlans(plans); lsSet(K.WORKOUT_PLANS, plans); }
  function saveWorkoutLog(wl) { setWorkoutLog(wl); lsSet(K.WORKOUT_LOG, wl); }

  // ── Render helpers ────────────────────────────────────────────────────────────
  const C = {
    bg: "#0f0f13", card: "#1a1a24", card2: "#1e1e2a", border: "#26263a",
    accent: "#7c6fff", accent2: "#a78bff", pink: "#ff6bae", yellow: "#ffd166",
    blue: "#7eb8ff", text: "#f0ede8", muted: "#6b6b80", dim: "#3d3d52",
  };

  const cardStyle = (extra = {}) => ({
    background: C.card2, borderRadius: 16, padding: "14px 16px",
    border: `1px solid ${C.border}`, ...extra,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ONBOARDING SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (onboarding) {
    const steps = [
      { title: "Hallo! 👋", subtitle: "Wie heißt du?" },
      { title: "Dein Körper 📏", subtitle: "Lass uns deinen Kalorienbedarf berechnen" },
      { title: "Dein Ziel 🎯", subtitle: "Was möchtest du erreichen?" },
      { title: "Aktivität 🏃", subtitle: "Wie aktiv bist du im Alltag?" },
    ];
    const curr = steps[ob.step];
    const pct = ((ob.step + 1) / steps.length) * 100;
    const inputS = {
      width: "100%", background: "#12121a", border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "12px 16px", color: C.text, fontSize: 16, marginBottom: 12,
    };
    const btnS = (active) => ({
      flex: 1, padding: "10px 8px", borderRadius: 10, fontSize: 13, fontWeight: 600,
      background: active ? C.accent : "#1e1e2a",
      color: active ? "#fff" : C.muted,
      border: active ? "none" : `1px solid ${C.border}`,
      cursor: "pointer",
    });

    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: "100vh", color: C.text, maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "center", padding: "32px 24px" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0} input:focus{outline:none} button{cursor:pointer;border:none;font-family:inherit} @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}} @keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Trackaden<span style={{ color: C.accent }}>Z</span>
          </div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Dein persönlicher Fitness-Tracker</div>
        </div>
        {/* Progress */}
        <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`, width: `${pct}%`, transition: "width 0.5s" }} />
        </div>
        <div style={{ animation: "slideUp 0.4s ease" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{curr.title}</div>
          <div style={{ fontSize: 14, color: C.muted, marginBottom: 24 }}>{curr.subtitle}</div>

          {ob.step === 0 && (
            <div>
              <input style={inputS} placeholder="Dein Name" value={ob.name} onChange={e => setOb(o => ({ ...o, name: e.target.value }))} autoFocus />
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Geschlecht</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button style={btnS(ob.gender === "male")} onClick={() => setOb(o => ({ ...o, gender: "male" }))}>♂ Männlich</button>
                <button style={btnS(ob.gender === "female")} onClick={() => setOb(o => ({ ...o, gender: "female" }))}>♀ Weiblich</button>
              </div>
            </div>
          )}
          {ob.step === 1 && (
            <div>
              {[
                { key: "age", label: "Alter (Jahre)", placeholder: "z.B. 25" },
                { key: "weight", label: "Gewicht (kg)", placeholder: "z.B. 80" },
                { key: "height", label: "Körpergröße (cm)", placeholder: "z.B. 178" },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{f.label}</div>
                  <input type="number" style={inputS} placeholder={f.placeholder} value={ob[f.key]} onChange={e => setOb(o => ({ ...o, [f.key]: e.target.value }))} />
                </div>
              ))}
              {ob.age && ob.weight && ob.height && (() => {
                const bmi = (ob.weight / ((ob.height / 100) ** 2)).toFixed(1);
                const cat = bmi < 18.5 ? "Untergewicht" : bmi < 25 ? "Normalgewicht" : bmi < 30 ? "Übergewicht" : "Adipositas";
                return (
                  <div style={{ background: "#12121a", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: C.muted }}>Dein BMI</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: C.accent }}>{bmi}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{cat}</div>
                  </div>
                );
              })()}
            </div>
          )}
          {ob.step === 2 && (
            <div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Dein Ziel</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {[
                  { id: "lose", label: "🔥 Abnehmen", sub: "−500 kcal Defizit" },
                  { id: "maintain", label: "⚖️ Gewicht halten", sub: "Erhaltungskalorien" },
                  { id: "gain", label: "💪 Muskeln aufbauen", sub: "+300 kcal Überschuss" },
                ].map(g => (
                  <button key={g.id} onClick={() => setOb(o => ({ ...o, goal: g.id }))} style={{
                    background: ob.goal === g.id ? `${C.accent}22` : "#1e1e2a",
                    border: `1px solid ${ob.goal === g.id ? C.accent : C.border}`,
                    borderRadius: 12, padding: "12px 16px", color: C.text,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontWeight: 600 }}>{g.label}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>{g.sub}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Zusätzlicher Sport pro Woche</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { id: "none", label: "Kein" },
                  { id: "light", label: "1–2×" },
                  { id: "moderate", label: "3–4×" },
                  { id: "heavy", label: "5+×" },
                ].map(s => (
                  <button key={s.id} style={btnS(ob.sport === s.id)} onClick={() => setOb(o => ({ ...o, sport: s.id }))}>{s.label}</button>
                ))}
              </div>
            </div>
          )}
          {ob.step === 3 && (
            <div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Aktivität im Alltag</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {[
                  { id: "sedentary", label: "🪑 Hauptsächlich sitzend", sub: "Bürojob, wenig Bewegung" },
                  { id: "light", label: "🚶 Leicht aktiv", sub: "Gelegentliche Spaziergänge" },
                  { id: "moderate", label: "🚴 Moderat aktiv", sub: "Bewegung 3–5×/Woche" },
                  { id: "active", label: "🏃 Sehr aktiv", sub: "Tägliches Training" },
                  { id: "veryActive", label: "⚡ Extrem aktiv", sub: "Körperliche Arbeit + Sport" },
                ].map(a => (
                  <button key={a.id} onClick={() => setOb(o => ({ ...o, activity: a.id }))} style={{
                    background: ob.activity === a.id ? `${C.accent}22` : "#1e1e2a",
                    border: `1px solid ${ob.activity === a.id ? C.accent : C.border}`,
                    borderRadius: 12, padding: "11px 14px", color: C.text,
                    display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13,
                  }}>
                    <span style={{ fontWeight: 600 }}>{a.label}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{a.sub}</span>
                  </button>
                ))}
              </div>
              {/* Preview result */}
              {(() => {
                const preview = calcTDEE({ ...ob, weight: Number(ob.weight), height: Number(ob.height), age: Number(ob.age) });
                return preview ? (
                  <div style={{ background: `${C.accent}15`, borderRadius: 14, padding: 16, border: `1px solid ${C.accent}44` }}>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Dein täglicher Kalorienbedarf</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: C.accent }}>{preview} <span style={{ fontSize: 14, fontWeight: 400 }}>kcal</span></div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Protein: {calcProteinGoal({ ...ob, weight: Number(ob.weight) })}g täglich</div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {ob.step > 0 && (
              <button onClick={() => setOb(o => ({ ...o, step: o.step - 1 }))} style={{
                flex: 1, background: "#1e1e2a", border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 14, color: C.muted, fontSize: 15, fontWeight: 600,
              }}>← Zurück</button>
            )}
            <button
              onClick={() => {
                if (ob.step < 3) setOb(o => ({ ...o, step: o.step + 1 }));
                else finishOnboarding();
              }}
              disabled={ob.step === 0 && !ob.name.trim()}
              style={{
                flex: 2, background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`,
                borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, fontWeight: 700,
                opacity: (ob.step === 0 && !ob.name.trim()) ? 0.4 : 1,
              }}
            >
              {ob.step < 3 ? "Weiter →" : "🚀 Loslegen!"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN APP
  // ─────────────────────────────────────────────────────────────────────────────
  const bmi = user?.weight && user?.height ? (user.weight / ((user.height / 100) ** 2)).toFixed(1) : null;
  const navItems = [
    { id: "dashboard", icon: "⚡", label: "Heute" },
    { id: "log", icon: "🍽️", label: "Mahlzeiten" },
    { id: "history", icon: "📊", label: "Verlauf" },
    { id: "workout", icon: "🏋️", label: "Training" },
    { id: "profile", icon: "👤", label: "Profil" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.bg, minHeight: "100vh", color: C.text, maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input:focus,textarea:focus{outline:none}
        button{cursor:pointer;border:none;font-family:inherit}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:#1a1a22} ::-webkit-scrollbar-thumb{background:#3d3d52;border-radius:2px}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .anim{animation:slideUp 0.3s ease}
        .fade{animation:fadeIn 0.3s ease}
      `}</style>

      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          background: notification.type === "error" ? "#3d1a1a" : "#1a3d2a",
          border: `1px solid ${notification.type === "error" ? "#7a3030" : "#2d7a50"}`,
          color: C.text, padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
          zIndex: 9999, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s ease",
        }}>{notification.msg}</div>
      )}

      {/* Header */}
      <div style={{ padding: "18px 20px 0", background: "linear-gradient(180deg,#16161f 0%,transparent 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
              Trackaden<span style={{ color: C.accent }}>Z</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>{new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}</div>
          </div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.accent}, ${C.pink})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14,
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 20px 90px", overflowY: "auto", maxHeight: "calc(100vh - 130px)" }}>

        {/* ── DASHBOARD ─────────────────────────────────────────────────────── */}
        {tab === "dashboard" && (
          <div className="fade">
            {/* Greeting */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Hey {user?.name} 👋</div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {goals.calories - Math.round(totals.calories) > 0
                  ? `Noch ${goals.calories - Math.round(totals.calories)} kcal verfügbar`
                  : "Tagesziel erreicht! 🎉"}
              </div>
            </div>

            {/* Calorie Ring Card */}
            <div style={{ ...cardStyle(), marginBottom: 12, background: "linear-gradient(135deg,#1a1a27,#1e1a2e)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg width={100} height={100} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={50} cy={50} r={42} fill="none" stroke={C.border} strokeWidth={8} />
                    <circle cx={50} cy={50} r={42} fill="none"
                      stroke={calPct >= 100 ? "#ff6b6b" : C.accent} strokeWidth={8} strokeLinecap="round"
                      strokeDasharray={264} strokeDashoffset={264 - (264 * calPct) / 100}
                      style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }} />
                  </svg>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{Math.round(totals.calories)}</div>
                    <div style={{ fontSize: 9, color: C.muted }}>kcal</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { label: "Kalorien", cur: Math.round(totals.calories), goal: goals.calories, unit: "kcal", color: C.accent, pct: calPct },
                    { label: "Protein", cur: totals.protein, goal: goals.protein, unit: "g", color: C.pink, pct: protPct },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginBottom: 3 }}>
                        <span>{s.label}</span><span style={{ color: C.text }}>{s.cur} / {s.goal}{s.unit}</span>
                      </div>
                      <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: s.pct >= 100 ? "#ff6b6b" : s.color, width: `${s.pct}%`, transition: "width 0.8s" }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, background: "#12121a", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.yellow }}>{totals.carbs}g</div>
                      <div style={{ fontSize: 9, color: C.muted }}>Carbs</div>
                    </div>
                    <div style={{ flex: 1, background: "#12121a", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{totals.fat}g</div>
                      <div style={{ fontSize: 9, color: C.muted }}>Fett</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Card */}
            <div style={{ ...cardStyle(), marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: stepsPermission === "granted" ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>👟</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Schrittzähler</div>
                    {stepsPermission === "granted" && <div style={{ fontSize: 11, color: C.muted }}>~{stepsCal} kcal verbrannt</div>}
                  </div>
                </div>
                {stepsPermission === "granted"
                  ? <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: C.accent }}>{todaySteps.toLocaleString("de-DE")}</div>
                  : <button onClick={requestSteps} style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 8, color: C.accent, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>Aktivieren</button>
                }
              </div>
              {stepsPermission === "granted" && (
                <div>
                  <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg,${C.accent},${C.blue})`, width: `${Math.min(100, (todaySteps / 10000) * 100)}%`, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[2000, 5000, 8000, 10000].map(n => (
                      <button key={n} onClick={() => logSteps(n)} style={{
                        flex: 1, background: todaySteps === n ? `${C.accent}22` : "#12121a",
                        border: `1px solid ${todaySteps === n ? C.accent : C.border}`,
                        borderRadius: 6, padding: "5px 0", fontSize: 11, color: todaySteps === n ? C.accent : C.muted,
                      }}>{n >= 1000 ? `${n / 1000}k` : n}</button>
                    ))}
                  </div>
                  <input type="number" placeholder="Eigene Schrittzahl eingeben" onBlur={e => { if (e.target.value) { logSteps(Number(e.target.value)); e.target.value = ""; } }}
                    style={{ width: "100%", background: "#12121a", border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px", color: C.text, fontSize: 13, marginTop: 8 }} />
                </div>
              )}
              {stepsPermission === null && (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Optionale Funktion – Zugriff auf Bewegungsdaten erforderlich</div>
              )}
            </div>

            {/* Quick Add */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>SCHNELL HINZUFÜGEN</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {MEAL_TYPES.map(mt => (
                  <button key={mt.id} onClick={() => { setAddModal({ mealType: mt.id }); setAddMode("search"); }} style={{
                    background: C.card2, border: `1px solid ${C.border}`, borderRadius: 12,
                    color: C.text, padding: "11px 14px", fontSize: 13, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{mt.emoji}</span>{mt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MAHLZEITEN LOG ──────────────────────────────────────────────────── */}
        {tab === "log" && (
          <div className="fade">
            {mealsByType.map(mt => (
              <div key={mt.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 16 }}>{mt.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{mt.label}</span>
                    {mt.entries.length > 0 && (
                      <span style={{ background: C.border, borderRadius: 5, padding: "1px 6px", fontSize: 10, color: C.muted }}>
                        {Math.round(mt.entries.reduce((s, e) => s + e.calories, 0))} kcal
                      </span>
                    )}
                  </div>
                  <button onClick={() => { setAddModal({ mealType: mt.id }); setAddMode("search"); }} style={{
                    background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 7,
                    color: C.accent, padding: "4px 10px", fontSize: 11, fontWeight: 600,
                  }}>+ Add</button>
                </div>
                {mt.entries.length === 0
                  ? <div style={{ background: C.card, borderRadius: 10, padding: 14, color: C.dim, fontSize: 12, textAlign: "center", border: `1px dashed ${C.border}` }}>Noch leer</div>
                  : mt.entries.map(e => (
                    <div key={e.id} className="anim" style={{ ...cardStyle(), display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                      <span style={{ fontSize: 22 }}>{e.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{e.grams}g · {e.time}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{e.calories} kcal</div>
                        <div style={{ fontSize: 10, color: C.pink }}>{e.protein}g P</div>
                      </div>
                      <button onClick={() => removeEntry(e.id)} style={{ background: "none", color: C.dim, fontSize: 14, padding: 4, borderRadius: 5 }}
                        onMouseEnter={ev => ev.target.style.color = "#ff6b6b"} onMouseLeave={ev => ev.target.style.color = C.dim}>✕</button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}

        {/* ── VERLAUF / HISTORY TABLE ─────────────────────────────────────────── */}
        {tab === "history" && (
          <div className="fade">
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: 0.5, marginBottom: 14 }}>LETZTE 30 TAGE</div>
            {historyDays.length === 0 ? (
              <div style={{ ...cardStyle(), textAlign: "center", padding: 40, color: C.dim }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                Noch keine Daten
              </div>
            ) : (
              <>
                {/* Summary row */}
                {historyDays.length >= 2 && (() => {
                  const avg = { cal: Math.round(historyDays.reduce((s, d) => s + d.calories, 0) / historyDays.length), prot: +(historyDays.reduce((s, d) => s + d.protein, 0) / historyDays.length).toFixed(1) };
                  return (
                    <div style={{ ...cardStyle({ background: `${C.accent}15`, border: `1px solid ${C.accent}33` }), marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: C.muted }}>Ø Kalorien/Tag</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: C.accent }}>{avg.cal} <span style={{ fontSize: 11, fontWeight: 400 }}>kcal</span></div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.muted }}>Ø Protein/Tag</div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: C.pink }}>{avg.prot}<span style={{ fontSize: 11, fontWeight: 400 }}>g</span></div>
                      </div>
                    </div>
                  );
                })()}
                {/* Table */}
                <div style={{ ...cardStyle({ padding: 0, overflow: "hidden" }) }}>
                  {/* Table Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr", padding: "9px 14px", background: "#12121a", borderBottom: `1px solid ${C.border}` }}>
                    {["Datum", "Kcal", "Prot.", "Carbs", "Fett"].map(h => (
                      <div key={h} style={{ fontSize: 10, color: C.muted, fontWeight: 600, letterSpacing: 0.3 }}>{h}</div>
                    ))}
                  </div>
                  {historyDays.map((d, i) => {
                    const pct = Math.min(100, (d.calories / goals.calories) * 100);
                    return (
                      <div key={d.dateKey} style={{
                        display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr",
                        padding: "9px 14px", borderBottom: i < historyDays.length - 1 ? `1px solid ${C.border}` : "none",
                        background: d.isToday ? `${C.accent}08` : "transparent",
                      }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: d.isToday ? 700 : 400, color: d.isToday ? C.accent : C.text }}>
                            {d.isToday ? "Heute" : new Date(d.dateKey).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                          </div>
                          <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 3, overflow: "hidden", width: 50 }}>
                            <div style={{ height: "100%", borderRadius: 2, background: pct >= 100 ? "#ff6b6b" : C.accent, width: `${pct}%` }} />
                          </div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>{d.calories}</div>
                        <div style={{ fontSize: 12, color: C.pink }}>{d.protein}g</div>
                        <div style={{ fontSize: 12, color: C.yellow }}>{d.carbs}g</div>
                        <div style={{ fontSize: 12, color: C.blue }}>{d.fat}g</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TRAINING ────────────────────────────────────────────────────────── */}
        {tab === "workout" && (
          <WorkoutTab
            workoutPlans={workoutPlans} workoutLog={workoutLog}
            saveWorkoutPlans={saveWorkoutPlans} saveWorkoutLog={saveWorkoutLog}
            showNotif={showNotif} C={C} cardStyle={cardStyle}
          />
        )}

        {/* ── PROFIL ──────────────────────────────────────────────────────────── */}
        {tab === "profile" && user && (
          <ProfileTab
            user={user} goals={goals} bmi={bmi} stepsPermission={stepsPermission}
            requestSteps={requestSteps} setGoals={setGoals} showNotif={showNotif} C={C} cardStyle={cardStyle}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "#12121acc", backdropFilter: "blur(20px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex", padding: "8px 0 12px",
      }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{
            flex: 1, background: "none", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2, padding: "4px 0",
          }}>
            <span style={{ fontSize: 20, opacity: tab === n.id ? 1 : 0.4 }}>{n.icon}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: tab === n.id ? C.accent : C.muted, letterSpacing: 0.3 }}>
              {n.label}
            </span>
          </button>
        ))}
      </div>

      {/* ADD FOOD MODAL */}
      {addModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", alignItems: "flex-end", animation: "fadeIn 0.2s ease" }}
          onClick={e => { if (e.target === e.currentTarget) closeAddModal(); }}>
          <div style={{
            width: "100%", maxWidth: 480, margin: "0 auto",
            background: "#14141e", borderRadius: "20px 20px 0 0", padding: "18px 18px 32px",
            maxHeight: "85vh", overflowY: "auto", border: `1px solid ${C.border}`,
            animation: "slideUp 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800 }}>
                {MEAL_TYPES.find(m => m.id === addModal.mealType)?.emoji} {MEAL_TYPES.find(m => m.id === addModal.mealType)?.label}
              </div>
              <button onClick={closeAddModal} style={{ background: C.border, borderRadius: 7, color: C.muted, padding: "3px 9px", fontSize: 14 }}>✕</button>
            </div>
            {/* Mode tabs */}
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {[{ id: "search", l: "🔍 Suche" }, { id: "ai", l: "🤖 KI-Text" }, { id: "image", l: "📸 Foto" }, { id: "barcode", l: "▦ Scan" }].map(m => (
                <button key={m.id} onClick={() => {
                  if ((m.id === "image" || m.id === "barcode") && cameraPermission !== "granted") {
                    requestCameraAccess(m.id);
                  } else {
                    setAddMode(m.id);
                    setAiResult(null);
                    if (m.id === "barcode" && cameraPermission === "granted") startBarcodeScanner();
                    if (m.id !== "barcode") stopBarcodeScanner();
                  }
                }} style={{
                  flex: 1, padding: "6px 0", borderRadius: 7, fontSize: 10, fontWeight: 600,
                  background: addMode === m.id ? C.accent : "#1e1e2a",
                  color: addMode === m.id ? "#fff" : C.muted,
                  border: addMode === m.id ? "none" : `1px solid ${C.border}`,
                }}>{m.l}</button>
              ))}
            </div>

            {/* SEARCH */}
            {addMode === "search" && (
              <div>
                <input autoFocus value={searchQuery} onChange={e => handleSearch(e.target.value)} placeholder="z.B. Hühnchen, Reis..."
                  style={{ width: "100%", background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 14, marginBottom: 8 }} />
                {searchResults.map(food => (
                  <button key={food.name} onClick={() => handleSelectFood(food)} style={{
                    width: "100%", background: selectedFood?.name === food.name ? `${C.accent}22` : "#1a1a22",
                    border: `1px solid ${selectedFood?.name === food.name ? C.accent : C.border}`,
                    borderRadius: 9, padding: "9px 12px", color: C.text, marginBottom: 5,
                    display: "flex", justifyContent: "space-between", fontSize: 12,
                  }}>
                    <span>{food.emoji} {food.name}</span>
                    <span style={{ color: C.muted }}>{food.calories} kcal/100g</span>
                  </button>
                ))}
                {selectedFood && (() => {
                  const n = calcNutrients(selectedFood, grams);
                  return (
                    <div style={{ background: "#1a1a27", borderRadius: 12, padding: 14, border: `1px solid ${C.accent}44`, marginTop: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>{selectedFood.emoji} {selectedFood.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <label style={{ fontSize: 12, color: C.muted }}>Menge (g):</label>
                        <input type="number" value={grams} onChange={e => setGrams(Number(e.target.value))}
                          style={{ flex: 1, background: "#12121a", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 15 }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                        {[{ l: "Kcal", v: n.calories, c: C.accent }, { l: "Prot", v: `${n.protein}g`, c: C.pink }, { l: "Carbs", v: `${n.carbs}g`, c: C.yellow }, { l: "Fett", v: `${n.fat}g`, c: C.blue }].map(s => (
                          <div key={s.l} style={{ background: "#12121a", borderRadius: 7, padding: "7px", textAlign: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: s.c }}>{s.v}</div>
                            <div style={{ fontSize: 9, color: C.muted }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleAddFromSearch} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, fontWeight: 700 }}>✅ Hinzufügen</button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* AI TEXT */}
            {addMode === "ai" && (
              <div>
                <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="z.B. 150g Hühnchenbrust, 50g Reis, 1 EL Olivenöl..."
                  style={{ width: "100%", background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13, minHeight: 80, resize: "none", marginBottom: 8 }} />
                <button onClick={handleAiAnalyze} disabled={aiLoading || !aiInput.trim()}
                  style={{ width: "100%", background: aiLoading ? "#3a3a4e" : `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 10, padding: 11, color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 10, opacity: !aiInput.trim() ? 0.5 : 1 }}>
                  {aiLoading ? "⏳ Analysiere..." : "🤖 KI analysieren"}
                </button>
                {aiResult?.items && (
                  <div>
                    {aiResult.items.map((item, i) => (
                      <div key={i} style={{ background: "#1a1a22", borderRadius: 9, padding: "9px 12px", marginBottom: 6, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontSize: 12, fontWeight: 500 }}>{item.emoji} {item.name}</div><div style={{ fontSize: 10, color: C.muted }}>{item.grams}g</div></div>
                        <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: C.accent }}>{item.calories} kcal</div><div style={{ fontSize: 10, color: C.pink }}>{item.protein}g P</div></div>
                      </div>
                    ))}
                    <button onClick={handleAddAiResult} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 4 }}>✅ Alle hinzufügen</button>
                  </div>
                )}
              </div>
            )}

            {/* IMAGE */}
            {addMode === "image" && (
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files[0]; if (!f) return; setImageFile(f); const r = new FileReader(); r.onload = ev => setImagePreview(ev.target.result); r.readAsDataURL(f); }} style={{ display: "none" }} />
                {!imagePreview
                  ? <button onClick={() => {
                      if (cameraPermission !== "granted") { requestCameraAccess("image"); return; }
                      fileInputRef.current.click();
                    }} style={{ width: "100%", background: "#1e1e2a", border: `2px dashed ${C.border}`, borderRadius: 14, padding: "36px 20px", color: C.muted, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 44 }}>📸</span>Foto aufnehmen oder auswählen
                  </button>
                  : <div style={{ marginBottom: 10 }}>
                    <img src={imagePreview} alt="meal" style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); setAiResult(null); }} style={{ marginTop: 6, background: "#2a2a3a", borderRadius: 7, color: C.muted, padding: "5px 10px", fontSize: 11 }}>Anderes Bild</button>
                  </div>
                }
                {imageFile && <button onClick={handleImageAnalyze} disabled={aiLoading} style={{ width: "100%", background: aiLoading ? "#3a3a4e" : `linear-gradient(135deg,${C.pink},#ff9d6b)`, borderRadius: 10, padding: 11, color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{aiLoading ? "⏳ Erkenne Mahlzeit..." : "🔍 Mahlzeit erkennen"}</button>}
                {aiResult?.items && (
                  <div>
                    {aiResult.items.map((item, i) => (
                      <div key={i} style={{ background: "#1a1a22", borderRadius: 9, padding: "9px 12px", marginBottom: 6, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
                        <div><div style={{ fontSize: 12, fontWeight: 500 }}>{item.emoji} {item.name}</div><div style={{ fontSize: 10, color: C.muted }}>~{item.grams}g</div></div>
                        <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: C.accent }}>{item.calories} kcal</div><div style={{ fontSize: 10, color: C.pink }}>{item.protein}g P</div></div>
                      </div>
                    ))}
                    <button onClick={handleAddAiResult} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 4 }}>✅ Hinzufügen</button>
                  </div>
                )}
              </div>
            )}

            {/* BARCODE - Real Camera Scanner */}
            {addMode === "barcode" && (
              <div>
                {/* Scanner viewfinder */}
                <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: "#000", marginBottom: 12, aspectRatio: "16/9" }}>
                  <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", display: scanning ? "block" : "none" }} playsInline muted />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                  {/* Scan overlay */}
                  {scanning && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      {/* Corner brackets */}
                      {[{t:16,l:16,bt:"border-top",bl:"border-left"},{t:16,r:16,bt:"border-top",bl:"border-right"},{b:16,l:16,bt:"border-bottom",bl:"border-left"},{b:16,r:16,bt:"border-bottom",bl:"border-right"}].map((pos, i) => (
                        <div key={i} style={{ position: "absolute", width: 30, height: 30, top: pos.t, bottom: pos.b, left: pos.l, right: pos.r, borderTop: pos.bt ? "3px solid #7c6fff" : "none", borderBottom: pos.bt ? "none" : "3px solid #7c6fff", borderLeft: pos.bl === "border-left" ? "3px solid #7c6fff" : "none", borderRight: pos.bl === "border-right" ? "3px solid #7c6fff" : "none", borderRadius: 2 }} />
                      ))}
                      {/* Scanning line */}
                      <div style={{ width: "70%", height: 2, background: "linear-gradient(90deg, transparent, #7c6fff, transparent)", animation: "scanLine 1.8s ease-in-out infinite" }} />
                      <div style={{ color: "#fff", fontSize: 12, marginTop: 16, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>Barcode in den Rahmen halten</div>
                    </div>
                  )}
                  {!scanning && !aiLoading && !aiResult && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#12121a" }}>
                      <div style={{ fontSize: 48, marginBottom: 10 }}>▦</div>
                      <div style={{ fontSize: 13, color: C.muted }}>Kamera bereit</div>
                    </div>
                  )}
                  {aiLoading && !scanning && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#12121a" }}>
                      <div style={{ fontSize: 32, marginBottom: 8, animation: "pulse 1s infinite" }}>🔍</div>
                      <div style={{ fontSize: 13, color: C.accent }}>Produkt wird gesucht...</div>
                      {scannedCode && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>EAN: {scannedCode}</div>}
                    </div>
                  )}
                </div>

                <style>{`
                  @keyframes scanLine { 0%,100%{transform:translateY(-30px);opacity:0.4} 50%{transform:translateY(30px);opacity:1} }
                `}</style>

                {/* Controls */}
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  {!scanning
                    ? <button onClick={startBarcodeScanner} style={{ flex: 1, background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 10, padding: 12, color: "#fff", fontSize: 14, fontWeight: 700 }}>📷 Kamera starten</button>
                    : <button onClick={stopBarcodeScanner} style={{ flex: 1, background: "#3a1a1a", border: `1px solid #7a3030`, borderRadius: 10, padding: 12, color: "#ff6b6b", fontSize: 14, fontWeight: 700 }}>⏹ Stoppen</button>
                  }
                </div>

                {/* Manual fallback */}
                <div style={{ background: "#12121a", borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Oder EAN manuell eingeben:</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input ref={barcodeRef} type="number" placeholder="z.B. 4008400401805"
                      style={{ flex: 1, background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text, fontSize: 13 }} />
                    <button onClick={() => { if (barcodeRef.current?.value?.length >= 8) { setScannedCode(barcodeRef.current.value); handleBarcode(barcodeRef.current.value); }}}
                      style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 7, color: C.accent, padding: "7px 12px", fontSize: 12, fontWeight: 700 }}>Suchen</button>
                  </div>
                </div>

                {/* Result */}
                {aiResult?.items && !aiLoading && (
                  <div style={{ marginTop: 10 }}>
                    {aiResult.items.map((item, i) => (
                      <div key={i} style={{ background: "#1a1a22", borderRadius: 9, padding: "10px 12px", marginBottom: 8, border: `1px solid ${C.accent}44` }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.emoji} {item.name}</div>
                        <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
                          <span style={{ fontSize: 11, color: C.accent }}>{item.calories} kcal/100g</span>
                          <span style={{ fontSize: 11, color: C.pink }}>{item.protein}g P</span>
                          <span style={{ fontSize: 11, color: C.yellow }}>{item.carbs || 0}g C</span>
                          <span style={{ fontSize: 11, color: C.blue }}>{item.fat || 0}g F</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input type="number" value={grams} onChange={e => setGrams(Number(e.target.value))}
                        style={{ flex: 1, background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 10px", color: C.text }} placeholder="Gramm" />
                      <button onClick={() => {
                        const item = aiResult.items[0]; if (!item) return;
                        const r = grams / 100;
                        addEntry({ name: item.name, emoji: item.emoji || "🏪", grams, mealType: addModal?.mealType || "snack", calories: Math.round(item.calories * r), protein: +(item.protein * r).toFixed(1), carbs: +((item.carbs || 0) * r).toFixed(1), fat: +((item.fat || 0) * r).toFixed(1) });
                      }} style={{ background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 9, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700 }}>✅ Add</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CAMERA PERMISSION MODAL */}
      {cameraPermModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: "#16161f", borderRadius: 22, padding: 28, width: "100%", maxWidth: 360, border: `1px solid ${C.border}`, animation: "slideUp 0.3s ease", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📷</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Kamerazugriff</div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
              TrackadenZ möchte auf deine Kamera zugreifen, um{" "}
              {pendingCameraAction === "barcode"
                ? "Barcodes von Lebensmitteln zu scannen."
                : "Fotos deiner Mahlzeiten zu analysieren."
              }
              <br /><br />
              <span style={{ color: C.dim, fontSize: 11 }}>Diese Abfrage erscheint nur einmalig. Du kannst den Zugriff jederzeit in den Einstellungen deines Browsers widerrufen.</span>
            </div>
            <button onClick={grantCameraPermission} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 12, padding: "14px", color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
              📷 Kamerazugriff erlauben
            </button>
            <button onClick={denyCameraPermission} style={{ width: "100%", background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px", color: C.muted, fontSize: 14, fontWeight: 600 }}>
              Nicht jetzt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// WORKOUT TAB COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function WorkoutTab({ workoutPlans, workoutLog, saveWorkoutPlans, saveWorkoutLog, showNotif, C, cardStyle }) {
  const [view, setView] = useState("plans"); // plans | create | detail | logSession
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newPlan, setNewPlan] = useState({ name: "", days: [{ name: "Tag A", exercises: [] }] });
  const [newEx, setNewEx] = useState({ name: "", sets: 3, reps: "8–12", weight: "", note: "", emoji: "🏋️" });
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [sessionWeights, setSessionWeights] = useState({});
  const [logView, setLogView] = useState("week"); // week | month

  const exerciseEmojis = ["🏋️","💪","🦵","🔥","⚡","🎯","🤸","🏃","🚴","🧗"];

  function createPlan() {
    if (!newPlan.name.trim()) return;
    const plan = { ...newPlan, id: Date.now(), createdAt: new Date().toISOString() };
    saveWorkoutPlans([...workoutPlans, plan]);
    setView("plans"); setNewPlan({ name: "", days: [{ name: "Tag A", exercises: [] }] });
    showNotif("✅ Trainingsplan erstellt!");
  }

  function deletePlan(id) {
    saveWorkoutPlans(workoutPlans.filter(p => p.id !== id));
    showNotif("🗑️ Plan gelöscht", "error");
  }

  function addExercise() {
    if (!newEx.name.trim()) return;
    const plan = { ...selectedPlan };
    plan.days[activeDayIdx].exercises = [...(plan.days[activeDayIdx].exercises || []), { ...newEx, id: Date.now() }];
    const updated = workoutPlans.map(p => p.id === plan.id ? plan : p);
    saveWorkoutPlans(updated);
    setSelectedPlan(plan);
    setNewEx({ name: "", sets: 3, reps: "8–12", weight: "", note: "", emoji: "🏋️" });
    showNotif("✅ Übung hinzugefügt!");
  }

  function removeExercise(dayIdx, exId) {
    const plan = { ...selectedPlan };
    plan.days[dayIdx].exercises = plan.days[dayIdx].exercises.filter(e => e.id !== exId);
    const updated = workoutPlans.map(p => p.id === plan.id ? plan : p);
    saveWorkoutPlans(updated); setSelectedPlan(plan);
  }

  function logSession() {
    const today = new Date().toDateString();
    const entry = {
      planId: selectedPlan.id, planName: selectedPlan.name,
      dayName: selectedPlan.days[activeDayIdx].name,
      exercises: (selectedPlan.days[activeDayIdx].exercises || []).map(ex => ({
        name: ex.name, sets: ex.sets, reps: ex.reps,
        weight: sessionWeights[ex.id] || ex.weight || "–", emoji: ex.emoji,
      })),
      date: today, timestamp: Date.now(),
    };
    const wl = { ...workoutLog };
    if (!wl[today]) wl[today] = [];
    wl[today].push(entry);
    saveWorkoutLog(wl);
    setSessionWeights({});
    showNotif("🎉 Training eingetragen!");
    setView("plans");
  }

  // Build chart data for workout history
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    return { label: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }), count: (workoutLog[key] || []).length };
  });
  const maxCount = Math.max(1, ...last14.map(d => d.count));

  const inputS = { width: "100%", background: "#12121a", border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 12px", color: C.text, fontSize: 13, marginBottom: 8 };

  if (view === "create") return (
    <div className="fade">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <button onClick={() => setView("plans")} style={{ background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, padding: "5px 10px", fontSize: 13 }}>← Zurück</button>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800 }}>Neuer Plan</div>
      </div>
      <input style={inputS} placeholder="Planname (z.B. Push/Pull/Legs)" value={newPlan.name} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))} autoFocus />
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Trainingstage</div>
      {newPlan.days.map((day, di) => (
        <div key={di} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input style={{ ...inputS, flex: 1, marginBottom: 0 }} value={day.name} onChange={e => { const days = [...newPlan.days]; days[di].name = e.target.value; setNewPlan(p => ({ ...p, days })); }} placeholder={`Tag ${di + 1}`} />
          {newPlan.days.length > 1 && <button onClick={() => setNewPlan(p => ({ ...p, days: p.days.filter((_, i) => i !== di) }))} style={{ background: "#2a1a1a", border: `1px solid ${C.border}`, borderRadius: 7, color: "#ff6b6b", padding: "0 10px", fontSize: 13 }}>✕</button>}
        </div>
      ))}
      <button onClick={() => setNewPlan(p => ({ ...p, days: [...p.days, { name: `Tag ${p.days.length + 1}`, exercises: [] }] }))}
        style={{ background: "#1e1e2a", border: `1px dashed ${C.border}`, borderRadius: 9, color: C.muted, padding: "8px", width: "100%", fontSize: 12, marginBottom: 16 }}>+ Tag hinzufügen</button>
      <button onClick={createPlan} disabled={!newPlan.name.trim()} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 10, padding: 13, color: "#fff", fontSize: 14, fontWeight: 700, opacity: !newPlan.name.trim() ? 0.5 : 1 }}>✅ Plan erstellen</button>
    </div>
  );

  if (view === "detail" && selectedPlan) return (
    <div className="fade">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button onClick={() => { setView("plans"); setSelectedPlan(null); }} style={{ background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, padding: "5px 10px", fontSize: 13 }}>← Zurück</button>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, flex: 1 }}>{selectedPlan.name}</div>
        <button onClick={() => setView("logSession")} style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 8, color: C.accent, padding: "5px 10px", fontSize: 11, fontWeight: 600 }}>▶ Start</button>
      </div>
      {/* Day tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {selectedPlan.days.map((day, i) => (
          <button key={i} onClick={() => setActiveDayIdx(i)} style={{
            flexShrink: 0, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: activeDayIdx === i ? C.accent : "#1e1e2a",
            color: activeDayIdx === i ? "#fff" : C.muted,
            border: activeDayIdx === i ? "none" : `1px solid ${C.border}`,
          }}>{day.name}</button>
        ))}
      </div>
      {/* Exercises */}
      {(selectedPlan.days[activeDayIdx].exercises || []).map(ex => (
        <div key={ex.id} style={{ ...cardStyle(), marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>{ex.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{ex.sets} Sätze × {ex.reps} Wdh{ex.weight ? ` · ${ex.weight} kg` : ""}</div>
            {ex.note && <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{ex.note}</div>}
          </div>
          <button onClick={() => removeExercise(activeDayIdx, ex.id)} style={{ background: "none", color: C.dim, fontSize: 13, padding: 4 }}
            onMouseEnter={e => e.target.style.color = "#ff6b6b"} onMouseLeave={e => e.target.style.color = C.dim}>✕</button>
        </div>
      ))}
      {/* Add exercise */}
      <div style={{ background: "#12121a", borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, marginTop: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 10 }}>+ Übung hinzufügen</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {exerciseEmojis.map(em => (
            <button key={em} onClick={() => setNewEx(e => ({ ...e, emoji: em }))} style={{
              background: newEx.emoji === em ? `${C.accent}22` : "#1e1e2a",
              border: `1px solid ${newEx.emoji === em ? C.accent : C.border}`,
              borderRadius: 6, padding: "4px 7px", fontSize: 16,
            }}>{em}</button>
          ))}
        </div>
        <input style={inputS} placeholder="Übungsname (z.B. Bankdrücken)" value={newEx.name} onChange={e => setNewEx(x => ({ ...x, name: e.target.value }))} />
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Sätze</div>
            <input type="number" style={{ ...inputS }} value={newEx.sets} onChange={e => setNewEx(x => ({ ...x, sets: Number(e.target.value) }))} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Wdh</div>
            <input style={{ ...inputS }} value={newEx.reps} onChange={e => setNewEx(x => ({ ...x, reps: e.target.value }))} placeholder="z.B. 8–12" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>kg</div>
            <input type="number" style={{ ...inputS }} value={newEx.weight} onChange={e => setNewEx(x => ({ ...x, weight: e.target.value }))} placeholder="Optional" />
          </div>
        </div>
        <input style={inputS} placeholder="Notiz (optional)" value={newEx.note} onChange={e => setNewEx(x => ({ ...x, note: e.target.value }))} />
        <button onClick={addExercise} disabled={!newEx.name.trim()} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 9, padding: 11, color: "#fff", fontSize: 13, fontWeight: 700, opacity: !newEx.name.trim() ? 0.5 : 1 }}>+ Übung hinzufügen</button>
      </div>
    </div>
  );

  if (view === "logSession" && selectedPlan) {
    const dayEx = selectedPlan.days[activeDayIdx].exercises || [];
    return (
      <div className="fade">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button onClick={() => setView("detail")} style={{ background: "#1e1e2a", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, padding: "5px 10px", fontSize: 13 }}>← Zurück</button>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800 }}>🏋️ Training starten</div>
        </div>
        <div style={{ ...cardStyle({ background: `${C.accent}12`, border: `1px solid ${C.accent}44` }), marginBottom: 14 }}>
          <div style={{ fontWeight: 600 }}>{selectedPlan.name} · {selectedPlan.days[activeDayIdx].name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{dayEx.length} Übungen</div>
        </div>
        {dayEx.map(ex => (
          <div key={ex.id} style={{ ...cardStyle(), marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{ex.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{ex.sets} × {ex.reps}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>Gewicht (kg):</label>
              <input type="number" value={sessionWeights[ex.id] || ex.weight || ""} onChange={e => setSessionWeights(w => ({ ...w, [ex.id]: e.target.value }))}
                placeholder={ex.weight || "kg"} style={{ flex: 1, background: "#12121a", border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 10px", color: C.text, fontSize: 14 }} />
            </div>
          </div>
        ))}
        <button onClick={logSession} style={{ width: "100%", background: `linear-gradient(135deg,${C.pink},#ff9d6b)`, borderRadius: 12, padding: 14, color: "#fff", fontSize: 15, fontWeight: 700, marginTop: 8 }}>🎉 Training abschließen</button>
      </div>
    );
  }

  // Plans overview
  return (
    <div className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800 }}>🏋️ Training</div>
        <button onClick={() => setView("create")} style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 8, color: C.accent, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>+ Neuer Plan</button>
      </div>

      {/* Workout frequency chart */}
      {Object.keys(workoutLog).length > 0 && (
        <div style={{ ...cardStyle(), marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 10 }}>TRAINING LETZTE 14 TAGE</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 60 }}>
            {last14.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: d.count > 0 ? C.accent : C.border, height: `${(d.count / maxCount) * 52 + (d.count > 0 ? 8 : 0)}px`, minHeight: 4, transition: "height 0.5s" }} />
                {i % 4 === 0 && <div style={{ fontSize: 8, color: C.dim }}>{d.label.split(".")[0]}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan cards */}
      {workoutPlans.length === 0
        ? <div style={{ ...cardStyle({ border: `1px dashed ${C.border}` }), textAlign: "center", padding: 40, color: C.dim }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
          <div>Erstelle deinen ersten Trainingsplan</div>
        </div>
        : workoutPlans.map(plan => (
          <div key={plan.id} style={{ ...cardStyle(), marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }} onClick={() => { setSelectedPlan(plan); setActiveDayIdx(0); setView("detail"); }} role="button" style={{ cursor: "pointer", flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{plan.name}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                  {plan.days.length} Tag{plan.days.length !== 1 ? "e" : ""} · {plan.days.reduce((s, d) => s + (d.exercises || []).length, 0)} Übungen
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                  {plan.days.map((d, i) => (
                    <span key={i} style={{ background: C.border, borderRadius: 5, padding: "2px 7px", fontSize: 10, color: C.muted }}>{d.name}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setSelectedPlan(plan); setActiveDayIdx(0); setView("detail"); }} style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 7, color: C.accent, padding: "6px 10px", fontSize: 11, fontWeight: 600 }}>Öffnen</button>
                <button onClick={() => deletePlan(plan.id)} style={{ background: "#2a1a1a", border: `1px solid ${C.border}`, borderRadius: 7, color: "#ff6b6b", padding: "6px 8px", fontSize: 11 }}>🗑️</button>
              </div>
            </div>
          </div>
        ))
      }

      {/* Recent sessions */}
      {Object.keys(workoutLog).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 10 }}>LETZTE EINHEITEN</div>
          {Object.entries(workoutLog).sort((a, b) => new Date(b[0]) - new Date(a[0])).slice(0, 5).flatMap(([dateKey, sessions]) =>
            sessions.map((s, i) => (
              <div key={`${dateKey}-${i}`} style={{ ...cardStyle(), marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.planName} · {s.dayName}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                      {dateKey === new Date().toDateString() ? "Heute" : new Date(dateKey).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} · {s.exercises.length} Übungen
                    </div>
                  </div>
                  <span style={{ fontSize: 20 }}>✅</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE TAB COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function ProfileTab({ user, goals, bmi, stepsPermission, requestSteps, setGoals, showNotif, C, cardStyle }) {
  const [editGoals, setEditGoals] = useState(goals);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const bmiCat = bmi < 18.5 ? "Untergewicht" : bmi < 25 ? "Normalgewicht 🎯" : bmi < 30 ? "Übergewicht" : "Adipositas";
  const actLabels = { sedentary: "Hauptsächlich sitzend", light: "Leicht aktiv", moderate: "Moderat aktiv", active: "Sehr aktiv", veryActive: "Extrem aktiv" };
  const goalLabels = { lose: "🔥 Abnehmen", maintain: "⚖️ Halten", gain: "💪 Aufbauen" };

  function saveGoals() {
    setGoals(editGoals);
    localStorage.setItem("trackadenz_goals", JSON.stringify(editGoals));
    setGoalsOpen(false);
    showNotif("🎯 Ziele gespeichert!");
  }

  return (
    <div className="fade">
      {/* User card */}
      <div style={{ ...cardStyle({ background: "linear-gradient(135deg,#1a1a27,#1e1a2e)" }), marginBottom: 14, textAlign: "center", padding: "24px 16px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},#ff6bae)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28 }}>
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{user.gender === "male" ? "Männlich" : "Weiblich"} · {user.age} Jahre</div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { l: "Gewicht", v: `${user.weight} kg`, c: C.accent },
          { l: "Größe", v: `${user.height} cm`, c: C.pink },
          { l: "BMI", v: bmi, c: bmi < 25 ? "#6bffb8" : "#ffd166" },
        ].map(s => (
          <div key={s.l} style={{ background: C.card2, borderRadius: 12, padding: "12px 10px", border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, textAlign: "center" }}>BMI-Kategorie: <span style={{ color: C.text, fontWeight: 600 }}>{bmiCat}</span></div>

      {/* Goal & Activity */}
      <div style={{ ...cardStyle(), marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 10 }}>DEIN ZIEL & AKTIVITÄT</div>
        {[
          { l: "Ziel", v: goalLabels[user.goal] || user.goal },
          { l: "Alltag", v: actLabels[user.activity] || user.activity },
          { l: "Sport/Woche", v: { none: "Kein Sport", light: "1–2×", moderate: "3–4×", heavy: "5+×" }[user.sport] || "–" },
        ].map(r => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.muted }}>{r.l}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{r.v}</span>
          </div>
        ))}
      </div>

      {/* Current goals */}
      <div style={{ ...cardStyle(), marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>TAGESZIELE</div>
          <button onClick={() => { setEditGoals(goals); setGoalsOpen(g => !g); }} style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 6, color: C.accent, padding: "3px 8px", fontSize: 11 }}>Bearbeiten</button>
        </div>
        {[
          { l: "Kalorien", v: `${goals.calories} kcal`, c: C.accent },
          { l: "Protein", v: `${goals.protein}g`, c: C.pink },
        ].map(r => (
          <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.muted }}>{r.l}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: r.c }}>{r.v}</span>
          </div>
        ))}
        {goalsOpen && (
          <div style={{ marginTop: 12 }}>
            {[{ key: "calories", label: "Kalorien (kcal)", c: C.accent }, { key: "protein", label: "Protein (g)", c: C.pink }].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{f.label}</div>
                <input type="number" value={editGoals[f.key]} onChange={e => setEditGoals(g => ({ ...g, [f.key]: Number(e.target.value) }))}
                  style={{ width: "100%", background: "#12121a", border: `1px solid ${f.c}44`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 15 }} />
              </div>
            ))}
            <button onClick={saveGoals} style={{ width: "100%", background: `linear-gradient(135deg,${C.accent},${C.accent2})`, borderRadius: 9, padding: 11, color: "#fff", fontSize: 13, fontWeight: 700 }}>💾 Speichern</button>
          </div>
        )}
      </div>

      {/* Steps permission */}
      <div style={{ ...cardStyle(), marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>👟 Schrittzähler</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{stepsPermission === "granted" ? "✅ Aktiviert" : "Noch nicht aktiviert"}</div>
          </div>
          {stepsPermission !== "granted" && (
            <button onClick={requestSteps} style={{ background: `${C.accent}22`, border: `1px solid ${C.accent}44`, borderRadius: 8, color: C.accent, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>Aktivieren</button>
          )}
        </div>
      </div>

      {/* Account info */}
      <div style={{ ...cardStyle(), marginBottom: 30 }}>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8 }}>ACCOUNT</div>
        <div style={{ fontSize: 12, color: C.muted }}>Mitglied seit</div>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{new Date(user.createdAt).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
    </div>
  );
}
