import { useState, useEffect, useRef, useCallback } from "react";

// ==================== CONSTANTS & HELPERS ====================
const C = {
  red: "#CF142B",
  gold: "#D4A017",
  cream: "#FDF0D5",
  brown: "#5C3D11",
  green: "#2A9D59",
  paper: "#FFFBF5",
  bg: "#FEF3E2",
  prestige: "#7C3AED",
  shadow: "rgba(92,61,17,0.15)",
};

const fmt = (n) => {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + "Qd";
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "k";
  return n < 10 ? n.toFixed(2) : Math.round(n) + "";
};
const fmtTime = (s) => {
  if (s < 60) return Math.ceil(s) + "s";
  if (s < 3600) return Math.ceil(s / 60) + "m";
  return (s / 3600).toFixed(1) + "h";
};

// ==================== SCENE COMPONENTS ====================
const CustomerIcon = ({ x, y, color, isWalking }) => {
  const bobClass = isWalking ? "bob-animation" : "";
  return (
    <div className={bobClass} style={{ position: "absolute", left: x, top: y, width: 24, height: 32, pointerEvents: "none" }}>
      <svg width="24" height="32" viewBox="0 0 24 32">
        <circle cx="12" cy="10" r="6" fill="#FDBCB4" />
        <rect x="6" y="16" width="12" height="14" fill={color} rx="2" />
        <rect x="4" y="24" width="4" height="8" fill="#5C3D11" />
        <rect x="16" y="24" width="4" height="8" fill="#5C3D11" />
      </svg>
    </div>
  );
};

const StaffIcon = ({ x, y, isWorking, role }) => {
  const pulseClass = isWorking ? "pulse-animation" : "";
  const hatColor = role === "cook" ? C.red : C.gold;
  return (
    <div className={pulseClass} style={{ position: "absolute", left: x, top: y, width: 28, height: 36, pointerEvents: "none" }}>
      <svg width="28" height="36" viewBox="0 0 28 36">
        <circle cx="14" cy="12" r="7" fill="#FDBCB4" />
        <rect x="8" y="19" width="12" height="15" fill="#FFFFFF" rx="2" />
        <rect x="5" y="10" width="18" height="5" fill={hatColor} rx="1" />
        <rect x="10" y="28" width="8" height="8" fill="#5C3D11" />
      </svg>
    </div>
  );
};

const PastizziItem = ({ x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, fontSize: 18, pointerEvents: "none" }}>🥐</div>
);

// ==================== MODAL COMPONENTS (outside main) ====================
const GdprBanner = ({ showGdpr, acceptAllGdpr, acceptEssentialOnly, C }) => {
  if (!showGdpr) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#2a1200", borderRadius: 20, border: "2px solid " + C.gold, padding: 22, maxWidth: 380 }}>
        <h3 style={{ color: C.gold }}>Before We Start Baking...</h3>
        <p style={{ color: "white", fontSize: 12 }}>Il-Pastizzar uses cookies for saving and ads. Essential cookies are always on.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          <button onClick={acceptAllGdpr} style={{ padding: 12, background: "linear-gradient(135deg," + C.gold + ",#8B6914)", border: "none", borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>Accept All</button>
          <button onClick={acceptEssentialOnly} style={{ padding: 10, background: "transparent", border: "1px solid white", color: "white", borderRadius: 10, cursor: "pointer" }}>Essential Only</button>
        </div>
      </div>
    </div>
  );
};

const DailyLoginModal = ({ showLogin, loginReward, setShowLogin, fmt, C }) => {
  if (!showLogin || !loginReward) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#0d1b0a", borderRadius: 24, padding: 20, border: "2px solid " + C.green, textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>🎁</div>
        <h2 style={{ color: "#90EE90" }}>Daily Login Reward!</h2>
        <div style={{ fontSize: 18, fontWeight: 800, margin: 12 }}>+EUR {fmt(loginReward.value)}</div>
        <button onClick={() => setShowLogin(false)} style={{ background: C.green, border: "none", padding: "8px 20px", borderRadius: 12, fontWeight: 800, cursor: "pointer" }}>Claim</button>
      </div>
    </div>
  );
};

// ==================== UPGRADE PANEL (outside main) ====================
const UpgradePanel = ({ stations, setStations, money, setMoney, gelat, setGelat, vault, setVault, vaultCards, upgradeVault, pets, buyPet, totalMult, addToast, C, fmt }) => {
  const [activeTab, setActiveTab] = useState("shop");
  const stationNames = { oven: "Pastizzi Oven", counter: "Display Counter", cashier: "Cashier Desk" };
  const stationEmojis = { oven: "🔥", counter: "🥐", cashier: "💰" };

  const upgradeStation = (id) => {
    const station = stations[id];
    const cost = Math.floor(50 * Math.pow(2.2, station.level));
    if (money < cost) { addToast("Not enough money!", "warn"); return; }
    setMoney(money - cost);
    setStations((prev) => ({ ...prev, [id]: { ...prev[id], level: prev[id].level + 1 } }));
    addToast(stationNames[id] + " upgraded to level " + (station.level + 1), "shop");
  };

  const upgradeWorker = (id) => {
    const station = stations[id];
    const cost = Math.floor(30 * Math.pow(1.8, station.workerLevel));
    if (money < cost) { addToast("Not enough money!", "warn"); return; }
    setMoney(money - cost);
    setStations((prev) => ({ ...prev, [id]: { ...prev[id], workerLevel: prev[id].workerLevel + 1 } }));
    addToast(stationNames[id] + " worker upgraded", "shop");
  };

  return (
    <div style={{ background: C.paper, borderRadius: 16, padding: 10, marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {["shop", "vault", "pets", "ranks"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: 6, borderRadius: 8, border: "1px solid " + C.gold + "44",
            background: activeTab === tab ? C.red : "transparent", color: activeTab === tab ? "white" : C.brown,
            fontSize: 11, fontWeight: 800, cursor: "pointer"
          }}>{tab === "shop" ? "🏪 Shop" : tab === "vault" ? "🍨 Vault" : tab === "pets" ? "🐾 Pets" : "🏆 Ranks"}</button>
        ))}
      </div>
      {activeTab === "shop" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["oven", "counter", "cashier"].map((id) => {
            const station = stations[id];
            const upgradeCost = Math.floor(50 * Math.pow(2.2, station.level));
            const workerCost = Math.floor(30 * Math.pow(1.8, station.workerLevel));
            const prod = (id === "oven" ? 0.5 : id === "counter" ? 0.8 : 1.2) * station.level;
            return (
              <div key={id} style={{ background: C.cream, borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><span style={{ fontSize: 20 }}>{stationEmojis[id]}</span> <strong>{stationNames[id]}</strong> Lv {station.level}</div>
                  <div style={{ fontSize: 12, color: C.green }}>EUR {fmt(prod * totalMult)}/s</div>
                </div>
                <div style={{ height: 6, background: "#ddd", borderRadius: 3, margin: "8px 0" }}>
                  <div style={{ width: ((station.level % 10) / 10) * 100 + "%", height: 6, background: C.gold, borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => upgradeStation(id)} disabled={money < upgradeCost} style={{ flex: 1, padding: 6, borderRadius: 8, background: money >= upgradeCost ? C.gold : "#ccc", border: "none", fontWeight: 700, fontSize: 11, cursor: money >= upgradeCost ? "pointer" : "default" }}>Upgrade — EUR {fmt(upgradeCost)}</button>
                  <button onClick={() => upgradeWorker(id)} disabled={money < workerCost} style={{ flex: 1, padding: 6, borderRadius: 8, background: money >= workerCost ? C.red : "#ccc", border: "none", color: "white", fontWeight: 700, fontSize: 11, cursor: money >= workerCost ? "pointer" : "default" }}>Worker Lv {station.workerLevel} — EUR {fmt(workerCost)}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {activeTab === "vault" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>🍨 Ġelat: {gelat}</div>
          {vaultCards.map((card) => {
            const level = vault[card.id];
            const cost = Math.floor(card.baseCost * Math.pow(card.costMult, level));
            return (
              <div key={card.id} style={{ background: C.cream, borderRadius: 10, padding: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{card.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{card.name}</div>
                  <div style={{ fontSize: 9, opacity: 0.6 }}>{card.effect}</div>
                  <div>Level {level}/{card.max}</div>
                </div>
                <button onClick={() => upgradeVault(card.id)} disabled={gelat < cost} style={{ background: gelat >= cost ? C.gold : "#ccc", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer" }}>🍨 {cost}</button>
              </div>
            );
          })}
        </div>
      )}
      {activeTab === "pets" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: C.cream, borderRadius: 10, padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>🐇</span>
              <div><strong>Il-Fenek</strong><br />Auto-tip every 60 sec</div>
              {pets.fenek ? <span style={{ color: C.green }}>✅ Active</span> : <button onClick={() => buyPet("fenek", 5000)} style={{ background: C.gold, border: "none", borderRadius: 6, padding: "4px 8px" }}>Buy EUR 5,000</button>}
            </div>
          </div>
          <div style={{ background: C.cream, borderRadius: 10, padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>🐈</span>
              <div><strong>Il-Qattus</strong><br />+15% income</div>
              {pets.qattus ? <span style={{ color: C.green }}>✅ Active</span> : <span style={{ fontSize: 11, opacity: 0.5 }}>🔒 Unlock at 25 milestones</span>}
            </div>
          </div>
          <div style={{ background: C.cream, borderRadius: 10, padding: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 24 }}>🐕</span>
              <div><strong>Il-Kelb</strong><br />Double offline cap</div>
              {pets.kelb ? <span style={{ color: C.green }}>✅ Active</span> : <span style={{ fontSize: 11, opacity: 0.5 }}>🔒 Unlock at 40 milestones</span>}
            </div>
          </div>
        </div>
      )}
      {activeTab === "ranks" && (
        <div style={{ textAlign: "center", padding: 20, opacity: 0.6 }}>
          Leaderboard coming soon — play to earn your spot!
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function IlPastizzar() {
  const [money, setMoney] = useState(0);
  const [allTime, setAllTime] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [clickMult, setClickMult] = useState(1);
  const [locShops, setLocShops] = useState({});
  const [totalMilest, setTotalMilest] = useState(0);
  const [iap, setIap] = useState({ x5: false, noAds: false, premiumClick: false, starterPack: false });
  const [adBoost, setAdBoost] = useState({ active: false, endsAt: 0 });
  const [tutDone, setTutDone] = useState(true);
  const [gdprDone, setGdprDone] = useState(false);
  const [showGdpr, setShowGdpr] = useState(false);
  const [gdprConsent, setGdprConsent] = useState({ essential: true, analytics: false, personalised: false, functional: false });
  const [gdprExpanded, setGdprExpanded] = useState(false);
  const [loginStreak, setLoginStreak] = useState(0);
  const [lastLoginDay, setLastLoginDay] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [loginReward, setLoginReward] = useState(null);
  const [starterExpiry, setStarterExpiry] = useState(0);
  const [showStarter, setShowStarter] = useState(false);
  const [pets, setPets] = useState({ fenek: false, qattus: false, kelb: false });
  const [gelat, setGelat] = useState(0);
  const [vault, setVault] = useState({ ftira: 0, armar: 0, berqa: 0, ilma: 0, karrozza: 0 });
  const [festa, setFesta] = useState({ active: false, name: "", endTime: 0, progress: 0, goal: 0, badge: null, eventId: "" });
  const [festaHistory, setFestaHistory] = useState([]);
  const [lastEventStart, setLastEventStart] = useState(null);
  const [locationStars, setLocationStars] = useState({});
  const [lbNickname, setLbNickname] = useState("");
  const [lbRegistered, setLbRegistered] = useState(false);
  const [lbData, setLbData] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbLastFetch, setLbLastFetch] = useState(0);
  const [lbMyRank, setLbMyRank] = useState(null);
  const [lbTab, setLbTab] = useState("global");
  const [lbSubmitting, setLbSubmitting] = useState(false);
  const [lbError, setLbError] = useState(null);
  const [lbNicknameInput, setLbNicknameInput] = useState("");
  const lbKeyRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [newsIdx, setNewsIdx] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const [stations, setStations] = useState({
    oven: { level: 1, workerLevel: 1 },
    counter: { level: 1, workerLevel: 1 },
    cashier: { level: 1, workerLevel: 1 },
  });
  const [tier, setTier] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [customers, setCustomers] = useState([]);
  const [cookX, setCookX] = useState(80);
  const [cookState, setCookState] = useState("idle");
  const [cookTarget, setCookTarget] = useState(null);
  const [cashierX, setCashierX] = useState(320);
  const [cashierState, setCashierState] = useState("idle");
  const [cashierTarget, setCashierTarget] = useState(null);
  const [counterStock, setCounterStock] = useState(0);
  const [floatCoins, setFloatCoins] = useState([]);
  const [nextCustomerTimer, setNextCustomerTimer] = useState(0);
  const [toasts, setToasts] = useState([]);

  const customersRef = useRef(customers);
  const cookXRef = useRef(cookX);
  const cookStateRef = useRef(cookState);
  const cookTargetRef = useRef(cookTarget);
  const cookPhaseRef = useRef("toCounter");
  const cashierXRef = useRef(cashierX);
  const cashierStateRef = useRef(cashierState);
  const cashierTargetRef = useRef(cashierTarget);
  const counterStockRef = useRef(counterStock);
  const nextCustomerTimerRef = useRef(nextCustomerTimer);
  const stationsRef = useRef(stations);
  const totalMultRef = useRef(1);
  const frameIdRef = useRef(null);

  useEffect(() => { customersRef.current = customers; }, [customers]);
  useEffect(() => { cookXRef.current = cookX; }, [cookX]);
  useEffect(() => { cookStateRef.current = cookState; cookTargetRef.current = cookTarget; }, [cookState, cookTarget]);
  useEffect(() => { cashierXRef.current = cashierX; }, [cashierX]);
  useEffect(() => { cashierStateRef.current = cashierState; cashierTargetRef.current = cashierTarget; }, [cashierState, cashierTarget]);
  useEffect(() => { counterStockRef.current = counterStock; }, [counterStock]);
  useEffect(() => { nextCustomerTimerRef.current = nextCustomerTimer; }, [nextCustomerTimer]);
  useEffect(() => { stationsRef.current = stations; }, [stations]);

  const adActive = adBoost.active && Date.now() < adBoost.endsAt;
  const vaultMult = 1 + vault.ftira * 0.03;
  const totalMult = (adActive ? 2 : 1) * (iap.x5 ? 5 : 1) * vaultMult;
  const baseProd = (stations.oven.level * 0.5) + (stations.counter.level * 0.8) + (stations.cashier.level * 1.2);
  const mps = baseProd * totalMult * (tier === 2 ? 1.5 : tier === 3 ? 2.5 : 1);
  const clickPow = clickMult * (iap.premiumClick ? 3 : 1) * (1 + vault.armar * 0.02);

  useEffect(() => {
    totalMultRef.current = (adActive ? 2 : 1) * (iap.x5 ? 5 : 1) * (1 + vault.ftira * 0.03);
  }, [adActive, iap.x5, vault.ftira]);

  const addToast = useCallback((msg, type) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type: type || "info" }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const playSound = useCallback(() => {}, []);

  const vaultCards = [
    { id: "ftira", emoji: "🫓", name: "Ftira Card", effect: "+3% income per level", max: 10, baseCost: 5, costMult: 1.4 },
    { id: "armar", emoji: "🎨", name: "Armar Card", effect: "+2% click power per level", max: 10, baseCost: 4, costMult: 1.3 },
    { id: "berqa", emoji: "⚡", name: "Berqa Card", effect: "+2 min ad boost per level", max: 15, baseCost: 8, costMult: 1.5 },
    { id: "ilma", emoji: "💧", name: "Ilma Card", effect: "+10% offline earnings per level", max: 10, baseCost: 6, costMult: 1.4 },
    { id: "karrozza", emoji: "🛒", name: "Karrozza Card", effect: "+5% starting cash per level", max: 20, baseCost: 3, costMult: 1.25 },
  ];

  const upgradeVault = (id) => {
    const card = vaultCards.find((c) => c.id === id);
    const current = vault[id];
    if (current >= card.max) { addToast("Max level reached!", "warn"); return; }
    const cost = Math.floor(card.baseCost * Math.pow(card.costMult, current));
    if (gelat < cost) { addToast("Need " + cost + " Ġelat!", "warn"); return; }
    setGelat((g) => g - cost);
    setVault((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    addToast(card.name + " upgraded to level " + (current + 1), "bonus");
  };

  const buyPet = (petId, cost) => {
    if (petId === "fenek" && money >= cost) {
      setMoney((m) => m - cost);
      setPets((p) => ({ ...p, fenek: true }));
      addToast("🐇 Il-Fenek is now helping!", "bonus");
    } else {
      addToast("Not enough money or pet already owned", "warn");
    }
  };

  useEffect(() => {
    if (!loaded || !pets.fenek) return;
    const interval = setInterval(() => {
      const tip = Math.floor(mps * 5);
      setMoney((m) => m + tip);
      setAllTime((a) => a + tip);
      addToast("🐇 Il-Fenek left a tip: EUR " + fmt(tip), "bonus");
    }, 60000);
    return () => clearInterval(interval);
  }, [pets.fenek, mps, loaded]);

  useEffect(() => {
    (async () => {
      let d = null;
      try {
        if (typeof window.storage !== "undefined") {
          const r = await window.storage.get("ilp7");
          if (r) d = JSON.parse(r.value);
        }
      } catch (e) {}
      if (!d) { try { const s = localStorage.getItem("ilp7"); if (s) d = JSON.parse(s); } catch (e) {} }
      if (d) {
        setMoney(d.money !== undefined ? d.money : 0);
        setAllTime(d.allTime !== undefined ? d.allTime : 0);
        setTotalClicks(d.totalClicks !== undefined ? d.totalClicks : 0);
        setClickMult(d.clickMult !== undefined ? d.clickMult : 1);
        setLocShops(d.locShops || {});
        setTotalMilest(d.totalMilest !== undefined ? d.totalMilest : 0);
        setIap(d.iap || { x5: false, noAds: false, premiumClick: false, starterPack: false });
        setAdBoost(d.adBoost || { active: false, endsAt: 0 });
        setTutDone(d.tutDone !== undefined ? d.tutDone : true);
        setGdprDone(d.gdprDone !== undefined ? d.gdprDone : false);
        setGdprConsent(d.gdprConsent || { essential: true, analytics: false, personalised: false, functional: false });
        setLoginStreak(d.loginStreak !== undefined ? d.loginStreak : 0);
        setLastLoginDay(d.lastLoginDay || null);
        setLoginHistory(d.loginHistory || []);
        setStarterExpiry(d.starterExpiry !== undefined ? d.starterExpiry : 0);
        setPets(d.pets || { fenek: false, qattus: false, kelb: false });
        setGelat(d.gelat !== undefined ? d.gelat : 0);
        setVault(d.vault || { ftira: 0, armar: 0, berqa: 0, ilma: 0, karrozza: 0 });
        setFesta(d.festa || { active: false, name: "", endTime: 0, progress: 0, goal: 0, badge: null, eventId: "" });
        setFestaHistory(d.festaHistory || []);
        setLastEventStart(d.lastEventStart || null);
        setLocationStars(d.locationStars || {});
        setLbNickname(d.lbNickname || "");
        setLbRegistered(d.lbRegistered || false);
        if (d.lbKey) lbKeyRef.current = d.lbKey;
        if (d.stations) setStations(d.stations);
        if (d.tier !== undefined) setTier(d.tier);
        if (d.totalCustomers !== undefined) setTotalCustomers(d.totalCustomers);
        const away = (Date.now() - (d.lastActive || Date.now())) / 1000;
        if (away > 60 && (d.mps || 0) > 0) {
          const savedPets = d.pets || { kelb: false };
          const savedVault = d.vault || { ilma: 0 };
          const cap = savedPets.kelb ? 16 * 3600 : 8 * 3600;
          const gain = (d.mps || 0) * Math.min(away, cap) * (1 + savedVault.ilma * 0.1);
          setMoney((m) => m + gain);
          setAllTime((a) => a + gain);
          addToast("💤 Offline: +EUR " + fmt(gain), "info");
        }
      }
      setLoaded(true);
      const wasConsented = d && d.gdprDone;
      if (!wasConsented) setTimeout(() => setShowGdpr(true), 600);
      else setTimeout(() => checkDailyLogin(), 1200);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const id = setInterval(() => {
      const saveObj = {
        money, allTime, totalClicks, clickMult, locShops, totalMilest, iap, adBoost,
        tutDone, gdprDone, gdprConsent, loginStreak, lastLoginDay, loginHistory,
        starterExpiry, pets, gelat, vault, festa, festaHistory, lastEventStart,
        locationStars, lbNickname, lbRegistered, lbKey: lbKeyRef.current,
        stations, tier, totalCustomers, mps, lastActive: Date.now(),
      };
      try {
        if (typeof window.storage !== "undefined") window.storage.set("ilp7", JSON.stringify(saveObj));
        localStorage.setItem("ilp7", JSON.stringify(saveObj));
      } catch (e) {}
    }, 30000);
    return () => clearInterval(id);
  }, [loaded, money, allTime, stations, tier, totalCustomers, mps, pets, vault, gelat]);

  const checkDailyLogin = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (lastLoginDay === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newStreak = lastLoginDay === yesterday ? loginStreak + 1 : 1;
    const reward = { type: "money", value: 50 * (1 + Math.floor((newStreak - 1) / 7) * 0.5) };
    if (reward.type === "money") { setMoney((m) => m + reward.value); setAllTime((a) => a + reward.value); }
    setLoginStreak(newStreak);
    setLastLoginDay(today);
    setLoginReward(reward);
    setShowLogin(true);
  }, [lastLoginDay, loginStreak]);

  const acceptAllGdpr = useCallback(() => {
    setGdprConsent({ essential: true, analytics: true, personalised: true, functional: true });
    setGdprDone(true); setShowGdpr(false);
    setTimeout(() => checkDailyLogin(), 800);
  }, [checkDailyLogin]);

  const acceptEssentialOnly = useCallback(() => {
    setGdprConsent({ essential: true, analytics: false, personalised: false, functional: false });
    setGdprDone(true); setShowGdpr(false);
    setTimeout(() => checkDailyLogin(), 800);
  }, [checkDailyLogin]);

  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      const earn = mps;
      setMoney((m) => m + earn);
      setAllTime((prev) => {
        const newAllTime = prev + earn;
        if (tier === 1 && newAllTime >= 50000) setTier(2);
        if (tier === 2 && newAllTime >= 5000000) setTier(3);
        return newAllTime;
      });
      const totalUpgrades = stations.oven.level + stations.counter.level + stations.cashier.level;
      const milestones = Math.floor(totalUpgrades / 10);
      if (milestones > totalMilest) {
        setTotalMilest(milestones);
        setGelat((g) => g + (milestones - totalMilest));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [loaded, mps, tier, stations, totalMilest]);

  useEffect(() => {
    if (!loaded) return;
    const stepMs = 60;
    let lastTimestamp = 0;

    const animate = (now) => {
      if (!lastTimestamp) lastTimestamp = now;
      const delta = now - lastTimestamp;
      if (delta >= stepMs) {
        const currentCustomers = customersRef.current;
        const updatedCustomers = currentCustomers
          .map((c, index) => {
            let newX = c.x;
            let newState = c.state;
            if (c.state === "entering") {
              newX = Math.max(c.x - 2, 200);
              if (newX <= 200) newState = "waiting";
            } else if (c.state === "leaving") {
              newX = c.x + 2;
              if (newX > 450) return null;
            }
            return { ...c, x: newX, state: newState, queueIndex: (newState === "waiting") ? index : 0 };
          })
          .filter(Boolean);
        setCustomers(updatedCustomers);

        let newCookX = cookXRef.current;
        let newCookState = cookStateRef.current;
        let newCookTarget = cookTargetRef.current;
        let newCookPhase = cookPhaseRef.current;
        const currentStock = counterStockRef.current;
        const stationsNow = stationsRef.current;

        if (newCookState === "idle" && currentStock < 3 && stationsNow.oven.level > 0) {
          newCookState = "walking";
          newCookTarget = 180;
          newCookPhase = "toCounter";
        }
        if (newCookState === "walking" && newCookTarget !== null) {
          if (newCookX < newCookTarget) newCookX = Math.min(newCookX + 3, newCookTarget);
          else newCookX = Math.max(newCookX - 3, newCookTarget);
          if (Math.abs(newCookX - newCookTarget) < 1) {
            if (newCookPhase === "toCounter") {
              newCookState = "working";
              cookStateRef.current = "working";
              setTimeout(() => {
                setCounterStock((s) => Math.min(s + 1, 5));
                cookPhaseRef.current = "toOven";
                cookStateRef.current = "walking";
                cookTargetRef.current = 80;
                setCookState("walking");
                setCookTarget(80);
              }, 600);
            } else {
              newCookState = "idle";
              newCookTarget = null;
              newCookPhase = "toCounter";
              cookStateRef.current = "idle";
              cookTargetRef.current = null;
            }
          }
        }
        setCookX(newCookX);
        setCookState(newCookState);
        setCookTarget(newCookTarget);
        cookPhaseRef.current = newCookPhase;

        let newCashierX = cashierXRef.current;
        let newCashierState = cashierStateRef.current;
        let newCashierTarget = cashierTargetRef.current;
        const waitingCustomer = updatedCustomers.find((c) => c.state === "waiting");
        if (newCashierState === "idle" && waitingCustomer && currentStock > 0) {
          newCashierState = "walking";
          newCashierTarget = 360;
        }
        if (newCashierState === "walking" && newCashierTarget !== null) {
          if (newCashierX < newCashierTarget) newCashierX = Math.min(newCashierX + 3, newCashierTarget);
          else newCashierX = Math.max(newCashierX - 3, newCashierTarget);
          if (Math.abs(newCashierX - newCashierTarget) < 1) {
            newCashierX = newCashierTarget;
            newCashierState = "working";
            cashierStateRef.current = "working";
            const earnAmt = 5 * stationsNow.cashier.level * totalMultRef.current;
            setTimeout(() => {
              setMoney((m) => m + earnAmt);
              setAllTime((a) => a + earnAmt);
              setCounterStock((s) => Math.max(0, s - 1));
              setTotalCustomers((t) => t + 1);
              setCustomers((prev) => {
                const idx = prev.findIndex((c) => c.state === "waiting");
                if (idx !== -1) {
                  const served = prev[idx];
                  return [...prev.slice(0, idx), { ...served, state: "leaving", x: served.x + 2 }, ...prev.slice(idx + 1)];
                }
                return prev;
              });
              cashierStateRef.current = "idle";
              cashierTargetRef.current = null;
              setCashierState("idle");
              setCashierTarget(null);
              setCashierX(320);
              const coinId = Date.now() + Math.random();
              setFloatCoins((f) => [...f, { id: coinId, x: 360, y: 200, value: earnAmt }]);
              setTimeout(() => setFloatCoins((f) => f.filter((c) => c.id !== coinId)), 1200);
            }, 500);
          }
        }
        setCashierX(newCashierX);
        setCashierState(newCashierState);
        setCashierTarget(newCashierTarget);

        let newTimer = nextCustomerTimerRef.current;
        if (newTimer <= 0) {
          if (updatedCustomers.length < 5) {
            const colors = ["#CF142B", "#D4A017", "#FFFFFF", "#5C3D11"];
            const newCustomer = {
              id: Date.now() + Math.random(),
              x: 420, state: "entering",
              color: colors[Math.floor(Math.random() * colors.length)],
              queueIndex: 0,
            };
            setCustomers((prev) => [...prev, newCustomer]);
            newTimer = 60 + Math.random() * 90;
          } else {
            newTimer = 0;
          }
        } else {
          newTimer = newTimer - 1;
        }
        setNextCustomerTimer(newTimer);
        lastTimestamp = now;
      }
      frameIdRef.current = requestAnimationFrame(animate);
    };
    frameIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [loaded]);

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg }}>Loading Il-Pastizzar...</div>;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", background: C.bg, minHeight: "100vh", fontFamily: "sans-serif", paddingBottom: 16 }}>
      <div style={{ background: "linear-gradient(135deg," + C.red + ",#9B0F20)", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Il-Pastizzar!</div>
          <div style={{ fontSize: 10, opacity: 0.8 }}>Maltese Idle Empire</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>EUR {fmt(money)}</div>
          <div style={{ fontSize: 11 }}>🍨 {gelat} | {fmt(mps)}/s</div>
        </div>
      </div>

      <div style={{ position: "relative", background: tier === 1 ? "#FFF3E0" : tier === 2 ? "#FFE0B5" : "#FFD9A0", height: 300, marginTop: 8, borderRadius: 16, overflow: "hidden", border: "2px solid " + C.gold }}>
        <div style={{ position: "absolute", top: 10, right: 10, width: 80, height: 60, background: "#87CEEB", borderRadius: 8, opacity: 0.4 }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, width: 50, height: 50, background: "#8B4513", borderRadius: 8, textAlign: "center", lineHeight: "50px", fontSize: 24 }}>🔥</div>
        <div style={{ position: "absolute", bottom: 20, left: 160, width: 50, height: 50, background: "#D2B48C", borderRadius: 8, textAlign: "center", lineHeight: "50px", fontSize: 24 }}>🥐</div>
        <div style={{ position: "absolute", bottom: 20, left: 300, width: 50, height: 50, background: "#A0522D", borderRadius: 8, textAlign: "center", lineHeight: "50px", fontSize: 24 }}>💰</div>
        <StaffIcon x={cookX} y={220} isWorking={cookState === "working"} role="cook" />
        <StaffIcon x={cashierX} y={220} isWorking={cashierState === "working"} role="cashier" />
        {customers.map((cust) => (
          <CustomerIcon
            key={cust.id}
            x={cust.x + (cust.state === "waiting" ? (cust.queueIndex || 0) * 20 : 0)}
            y={230}
            color={cust.color}
            isWalking={cust.state === "entering" || cust.state === "leaving"}
          />
        ))}
        {floatCoins.map((coin) => (
          <div key={coin.id} style={{ position: "absolute", left: coin.x, top: coin.y, color: C.gold, fontWeight: 900, fontSize: 14, animation: "floatUp 1.2s ease forwards", pointerEvents: "none" }}>+EUR {fmt(coin.value)}</div>
        ))}
        {[...Array(counterStock)].map((_, i) => (
          <PastizziItem key={i} x={170 + i * 12} y={190} />
        ))}
      </div>

      <UpgradePanel
        stations={stations} setStations={setStations}
        money={money} setMoney={setMoney}
        gelat={gelat} setGelat={setGelat}
        vault={vault} setVault={setVault}
        vaultCards={vaultCards} upgradeVault={upgradeVault}
        pets={pets} buyPet={buyPet}
        totalMult={totalMult} addToast={addToast}
        C={C} fmt={fmt}
      />

      <div style={{ position: "fixed", bottom: 20, right: 10, zIndex: 200 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: t.type === "warn" ? C.red : t.type === "shop" ? C.green : t.type === "bonus" ? C.gold : "#333", color: "white", padding: "6px 12px", borderRadius: 8, marginTop: 4, fontSize: 12, animation: "slideIn 0.2s ease" }}>{t.msg}</div>
        ))}
      </div>

      <GdprBanner showGdpr={showGdpr} acceptAllGdpr={acceptAllGdpr} acceptEssentialOnly={acceptEssentialOnly} C={C} />
      <DailyLoginModal showLogin={showLogin} loginReward={loginReward} setShowLogin={setShowLogin} fmt={fmt} C={C} />

      <style>{`
        @keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-40px); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .bob-animation { animation: bob 0.6s ease-in-out infinite; }
        .pulse-animation { animation: pulse 0.4s ease-in-out 2; }
      `}</style>
    </div>
  );
}
