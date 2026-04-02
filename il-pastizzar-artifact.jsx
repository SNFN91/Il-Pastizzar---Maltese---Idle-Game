import { useState, useEffect, useRef, useCallback } from "react";
const SHOP_TYPES = [
  { id:"oven",    name:"Pastizzi Oven",    emoji:"🔥", prod:0.5,    cost:25,      milestone:800,     unlocksAt:0,  desc:"Rickety oven pumping out rikotta and pizelli pastizzi" },
  { id:"qassata", name:"Qassata Counter",  emoji:"🧆", prod:3,      cost:200,     milestone:6000,    unlocksAt:4,  desc:"Fresh qassatat oozing with pizelli filling" },
  { id:"sausage", name:"Sausage Cart",     emoji:"🌭", prod:18,     cost:1800,    milestone:40000,   unlocksAt:10, desc:"Golden sausage rolls, crispy straight from the fryer" },
  { id:"pie",     name:"Meat Pie Stall",   emoji:"🥧", prod:90,     cost:15000,   milestone:300000,  unlocksAt:20, desc:"Thick gravy meat pies, il-klassiku ta kull Malti" },
  { id:"pizza",   name:"Pizza Corner",     emoji:"🍕", prod:450,    cost:120000,  milestone:2500000, unlocksAt:33, desc:"Maltese-style pizza slapped on a greasy tray" },
  { id:"ftira",   name:"Ftira Bakery",     emoji:"🫓", prod:2200,   cost:1000000, milestone:20000000,unlocksAt:50, desc:"Ftira bl-azzar u kappar — heritage Maltese recipe" },
];
const MALTA = [
  { id:"valletta",   name:"Valletta",    emoji:"🏛️", diff:1.0  },
  { id:"sliema",     name:"Sliema",      emoji:"🌊", diff:1.5  },
  { id:"stjulians",  name:"St Julian's", emoji:"🎰", diff:2.2  },
  { id:"birkirkara", name:"Birkirkara",  emoji:"⛪", diff:3.2  },
  { id:"qormi",      name:"Qormi",       emoji:"🍞", diff:4.5  },
  { id:"hamrun",     name:"Hamrun",      emoji:"🏘️", diff:6.5  },
  { id:"mosta",      name:"Mosta",       emoji:"⛩️", diff:9.0  },
  { id:"rabat",      name:"Rabat",       emoji:"🏰", diff:13.0 },
  { id:"marsaxlokk", name:"Marsaxlokk",  emoji:"⚓", diff:18.0 },
  { id:"zebbug",     name:"Zebbug",      emoji:"🌿", diff:25.0 },
];
const GOZO = [
  { id:"victoria",   name:"Victoria",   emoji:"👑", diff:35.0 },
  { id:"marsalforn", name:"Marsalforn", emoji:"🏖️", diff:50.0 },
  { id:"xlendi",     name:"Xlendi",     emoji:"🌊", diff:70.0 },
  { id:"xaghra",     name:"Xaghra",     emoji:"🪨", diff:95.0 },
  { id:"nadur",      name:"Nadur",      emoji:"🌄", diff:130.0},
];
const ALL_LOCS = [...MALTA, ...GOZO];
const NEWS = [
  "BREAKING: Valletta pastizzeria wins best in Malta for 3rd year running!",
  "Sliema qassata shortage — prices hit 50 cents each!",
  "Scientists confirm pastizzi cures everything except obesity",
  "Mosta rotunda now smells of fresh ftira after nearby bakery opens!",
  "EU wants to standardise pastizzi size — Malta says absolutely not!",
  "New Nutella pastizzi flavour divides the entire nation",
  "Nanna's secret rikotta recipe leaked on Facebook!",
  "Traffic jam in Hamrun after sausage roll truck overturns",
  "Record broken: 27 pastizzi eaten in one sitting in Birzebbuga!",
  "Government to make pastizzi the official national currency",
];
const TUT_STEPS = [
  { id:"welcome", title:"Merħba! Welcome to Il-Pastizzar! 🥐", body:"You're about to build Malta's greatest pastizzi empire — from a single rickety oven in Valletta all the way to Gozo!", emoji:"🇲🇹", tip:null, highlight:null, btnLabel:"Let's Go!" },
  { id:"click", title:"Step 1 — Tap the Pastizzi! 👆", body:"Tap the pastizzi to earn euros manually. Build up enough to buy your first oven!", emoji:"👆", tip:"💡 Tip: There's a 5% chance of a 10× critical click — keep tapping!", highlight:"clicker", btnLabel:"Got it — I'll start tapping!" },
  { id:"buy", title:"Step 2 — Open Your First Shop 🔥", body:"Once you have EUR 25, go to the 🗺️ Map → tap Valletta → open a Pastizzi Oven. It bakes automatically — even offline!", emoji:"🏪", tip:"💡 Tip: The harder the location, the higher the income!", highlight:"map", btnLabel:"Show me the map!" },
  { id:"milestone", title:"Step 3 — Hit Milestones 🎯", body:"Every shop has a milestone bar. When it fills up, your shop LEVELS UP — more income, harder next target. That's the game!", emoji:"🎯", tip:"💡 Tip: You can pay to skip a milestone — but only before 75% progress!", highlight:"location", btnLabel:"Understood!" },
  { id:"expand", title:"Step 4 — Expand Across Malta 🗺️", body:"Open 3 shops in Valletta to unlock Sliema. Complete all Malta locations and you'll sail to Gozo!", emoji:"🗺️", tip:"💡 Tip: Every 3 shops gives you a permanent +5% franchise bonus!", highlight:"map", btnLabel:"Time to expand!" },
  { id:"done", title:"You're Ready, Pastizzar! 🏆", body:"Ikklikkja, bieg u kber! Click, sell and grow! Build your empire from Valletta to Victoria in Gozo.", emoji:"🏆", tip:null, highlight:null, reward:50, btnLabel:"Start My Empire! 🥐" },
];
const fmt = n => { if(n>=1e15) return (n/1e15).toFixed(2)+"Qd"; if(n>=1e12) return (n/1e12).toFixed(2)+"T"; if(n>=1e9) return (n/1e9).toFixed(2)+"B"; if(n>=1e6) return (n/1e6).toFixed(2)+"M"; if(n>=1e3) return (n/1e3).toFixed(2)+"k"; return n<10?n.toFixed(2):Math.round(n)+""; };
const fmtTime = s => s<60?`${Math.ceil(s)}s`:s<3600?`${Math.ceil(s/60)}m`:`${(s/3600).toFixed(1)}h`;
const shopProd = (type,level,diff) => type.prod*Math.pow(1.6,level)*Math.sqrt(diff);
const shopTarget = (type,level,diff) => Math.ceil(type.milestone*Math.pow(2.5,level)*Math.sqrt(diff));
const shopOpenCost = (type,numInLoc,diff) => Math.ceil(type.cost*Math.pow(2.3,numInLoc)*diff);

const PastizziIcon = ({ size=130, premium=false, animated=true }) => {
  const gold1=premium?"#FFD700":"#C87008", gold2=premium?"#FFE566":"#E09020", gold4=premium?"#FFFBD0":"#F8C96A", dark=premium?"#B08010":"#8A4802", seam=premium?"#806010":"#5A2C01";
  const w=180,h=110;
  const body=`M ${w*.5},${h*.08} C ${w*.72},${h*.05} ${w*.95},${h*.28} ${w*.98},${h*.5} C ${w*.95},${h*.72} ${w*.72},${h*.93} ${w*.5},${h*.95} C ${w*.28},${h*.93} ${w*.05},${h*.72} ${w*.02},${h*.5} C ${w*.05},${h*.28} ${w*.28},${h*.05} ${w*.5},${h*.08} Z`;
  const inner=`M ${w*.5},${h*.14} C ${w*.69},${h*.12} ${w*.9},${h*.3} ${w*.92},${h*.5} C ${w*.9},${h*.7} ${w*.69},${h*.88} ${w*.5},${h*.86} C ${w*.31},${h*.88} ${w*.1},${h*.7} ${w*.08},${h*.5} C ${w*.1},${h*.3} ${w*.31},${h*.12} ${w*.5},${h*.14} Z`;
  const seamPath=`M ${w*.05},${h*.48} C ${w*.2},${h*.18} ${w*.38},${h*.10} ${w*.5},${h*.09} C ${w*.62},${h*.10} ${w*.8},${h*.18} ${w*.95},${h*.48}`;
  const seamPath2=`M ${w*.06},${h*.52} C ${w*.21},${h*.24} ${w*.39},${h*.16} ${w*.5},${h*.15} C ${w*.61},${h*.16} ${w*.79},${h*.24} ${w*.94},${h*.52}`;
  const layers=[0.32,0.42,0.52,0.62,0.70].map(t=>{const yc=h*t,xSpread=Math.sin(((t-.1)/.7)*Math.PI),xl=w*(.5-xSpread*.44),xr=w*(.5+xSpread*.44);return `M ${xl},${yc} C ${w*.5-xSpread*w*.1},${yc-h*.04} ${w*.5+xSpread*w*.1},${yc-h*.04} ${xr},${yc}`;});
  const crimpDots=[0.15,0.25,0.35,0.45,0.5,0.55,0.65,0.75,0.85].map(tx=>{const bx=w*tx,dt=(tx-.05)/.9,by=h*(.48-Math.sin(dt*Math.PI)*.35);return{bx,by};});
  return (
    <svg width={size} height={size*(h/w)} viewBox={`0 0 ${w} ${h}`} style={{display:"block",filter:`drop-shadow(0 5px 12px rgba(0,0,0,0.42))`,animation:animated?"pastPulse 2.8s ease-in-out infinite":"none"}}>
      <ellipse cx={w*.5} cy={h*.97} rx={w*.38} ry={h*.05} fill="rgba(0,0,0,0.22)"/>
      <path d={body} fill={gold1}/><path d={inner} fill={gold2}/>
      <ellipse cx={w*.5} cy={h*.52} rx={w*.22} ry={h*.22} fill={gold4} opacity="0.6"/>
      {layers.map((d,i)=><path key={i} d={d} fill="none" stroke={dark} strokeWidth={1.4-i*.15} opacity={0.55+i*.05} strokeLinecap="round"/>)}
      <path d={seamPath} fill="none" stroke={dark} strokeWidth="3.5" strokeLinecap="round" opacity="0.9"/>
      <path d={seamPath2} fill="none" stroke={seam} strokeWidth="2.2" strokeLinecap="round" opacity="0.85"/>
      <path d={`M ${w*.07},${h*.50} C ${w*.22},${h*.21} ${w*.4},${h*.13} ${w*.5},${h*.12} C ${w*.6},${h*.13} ${w*.78},${h*.21} ${w*.93},${h*.50}`} fill="none" stroke="rgba(255,245,200,0.55)" strokeWidth="1.8" strokeLinecap="round"/>
      {crimpDots.map(({bx,by},i)=><ellipse key={i} cx={bx} cy={by} rx="3.4" ry="2.0" fill={seam} transform={`rotate(-30 ${bx} ${by})`} opacity="0.85"/>)}
      {crimpDots.map(({bx,by},i)=><ellipse key={"r2"+i} cx={bx+2} cy={by+5} rx="2.2" ry="1.3" fill={dark} transform={`rotate(-30 ${bx+2} ${by+5})`} opacity="0.55"/>)}
      <path d={`M ${w*.25},${h*.35} C ${w*.38},${h*.25} ${w*.55},${h*.27} ${w*.65},${h*.38}`} fill="none" stroke="rgba(255,255,240,0.45)" strokeWidth="6" strokeLinecap="round"/>
      {premium&&<path d={body} fill="none" stroke="#FFD700" strokeWidth="2.5" opacity="0.7"/>}
    </svg>
  );
};

export default function IlPastizzar() {
  // ----- core state (unchanged) -----
  const [money,setMoney]=useState(0);
  const [allTime,setAllTime]=useState(0);
  const [totalClicks,setTotalClicks]=useState(0);
  const [clickMult,setClickMult]=useState(1);
  const [locShops,setLocShops]=useState(()=>Object.fromEntries(ALL_LOCS.map(l=>[l.id,[]])));
  const [totalMilest,setTotalMilest]=useState(0);
  const [selectedLoc,setSelectedLoc]=useState("valletta");
  const [island,setIsland]=useState("malta");
  const [tab,setTab]=useState("map");
  const [isMobile,setIsMobile]=useState(false);
  const [toasts,setToasts]=useState([]);
  const [clickFx,setClickFx]=useState([]);
  const [isJiggling,setIsJiggling]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [newsIdx,setNewsIdx]=useState(0);
  const [adBoost,setAdBoost]=useState({active:false,endsAt:0});
  const [iap,setIap]=useState({x5:false,noAds:false,premiumClick:false,starterPack:false});
  const [tutDone,setTutDone]=useState(false);
  const [tutStep,setTutStep]=useState(0);
  const [tutVisible,setTutVisible]=useState(true);
  const [showStarter,setShowStarter]=useState(false);
  const [starterExpiry,setStarterExpiry]=useState(0);
  const [loginStreak,setLoginStreak]=useState(0);
  const [lastLoginDay,setLastLoginDay]=useState(null);
  const [loginHistory,setLoginHistory]=useState([]);
  const [showLogin,setShowLogin]=useState(false);
  const [loginReward,setLoginReward]=useState(null);
  const [muted,setMuted]=useState(false);
  const [volume,setVolume]=useState(0.5);
  const [musicPlaying,setMusicPlaying]=useState(false);
  const [showVolume,setShowVolume]=useState(false);
  const [gdprDone,setGdprDone]=useState(false);
  const [showGdpr,setShowGdpr]=useState(false);
  const [gdprConsent,setGdprConsent]=useState({essential:true,analytics:false,personalised:false,functional:false});
  const [gdprExpanded,setGdprExpanded]=useState(false);
  const [lbNickname,setLbNickname]=useState("");
  const [lbRegistered,setLbRegistered]=useState(false);
  const [lbData,setLbData]=useState([]);
  const [lbLoading,setLbLoading]=useState(false);
  const [lbLastFetch,setLbLastFetch]=useState(0);
  const [lbMyRank,setLbMyRank]=useState(null);
  const [lbTab,setLbTab]=useState("global");
  const [lbSubmitting,setLbSubmitting]=useState(false);
  const [lbError,setLbError]=useState(null);
  const [lbNicknameInput,setLbNicknameInput]=useState("");
  const lbKeyRef=useRef(null);
  const toastIdRef=useRef(0);
  const audioCtxRef=useRef(null);
  const bgNodesRef=useRef({gain:null});
  const mutedRef=useRef(false);
  const volumeRef=useRef(0.5);
  const clickIdRef=useRef(0);
  const locShopsRef=useRef(locShops);
  const stateRef=useRef({});
  const moneyAccRef=useRef(0);
  const allTimeAccRef=useRef(0);
  const pendingHitsRef=useRef(0);

  // ----- new state for features -----
  const [negozjantVisible, setNegozjantVisible] = useState(false);
  const [negozjantAmount, setNegozjantAmount] = useState(0);
  const [negozjantName, setNegozjantName] = useState("");
  const negozjantTimerRef = useRef(null);
  const [pets, setPets] = useState({ fenek: false, qattus: false, kelb: false });
  const [gelat, setGelat] = useState(0);
  const [vault, setVault] = useState({ ftira:0, armar:0, berqa:0, ilma:0, karrozza:0 });
  const [festa, setFesta] = useState({ active: false, name: "", endTime: 0, progress: 0, goal: 0, badge: null });
  const [festaHistory, setFestaHistory] = useState([]);
  const [lastEventStart, setLastEventStart] = useState(null);
  const [locationStars, setLocationStars] = useState(()=>Object.fromEntries(ALL_LOCS.map(l=>[l.id,0]))); // 0-3 stars

  // helper: earn Gelat
  const addGelat = (amount) => { setGelat(g=>g+amount); playSound('coin'); addToast(`🍨 +${amount} Ġelat!`, "bonus"); };

  // apply vault bonuses to totalMult and clickPow
  const vaultMult = (1 + vault.ftira * 0.03);
  const vaultClickMult = (1 + vault.armar * 0.02);
  const vaultAdExtra = vault.berqa * 120; // seconds
  const vaultOfflineMult = (1 + vault.ilma * 0.10);
  const karrozzaBonus = (firstShopCost) => firstShopCost * 0.05 * vault.karrozza;

  // update totalMult and clickPow with vault
  const franchiseMult = 1+Math.floor(totalShops/3)*.05;
  const adActive = adBoost.active && Date.now()<adBoost.endsAt;
  const adTimeLeft = adActive?Math.ceil((adBoost.endsAt-Date.now())/1000):0;
  const baseTotalMult = franchiseMult * (adActive?2:1) * (iap.x5?5:1);
  const totalMult = baseTotalMult * vaultMult;
  const clickPowBase = clickMult * (iap.premiumClick?3:1);
  const clickPow = clickPowBase * vaultClickMult;

  const baseMPS = ALL_LOCS.reduce((tot,loc)=>(locShops[loc.id]||[]).reduce((s,sh)=>{const t=SHOP_TYPES.find(x=>x.id===sh.typeId); return t?s+shopProd(t,sh.level,loc.diff):s;},0)+tot,0);
  const mps = baseMPS * totalMult;
  const maltaDone = MALTA.filter(l=>(locShops[l.id]||[]).length>=3).length;
  const gozoDone = GOZO.filter(l=>(locShops[l.id]||[]).length>=3).length;
  const maltaUnlocked=MALTA.map((l,i)=>i===0||(locShops[MALTA[i-1].id]||[]).length>=3);
  const gozoReady=MALTA.every(l=>(locShops[l.id]||[]).length>=3);
  const gozoUnlocked=GOZO.map((l,i)=>i===0?gozoReady:gozoReady&&(locShops[GOZO[i-1].id]||[]).length>=3);
  const totalShops=ALL_LOCS.reduce((s,l)=>s+(locShops[l.id]||[]).length,0);
  const unlockedTypes=SHOP_TYPES.filter(t=>totalMilest>=t.unlocksAt);

  // pet effects
  useEffect(() => {
    if (!loaded) return;
    if (pets.fenek) {
      const interval = setInterval(() => {
        const tip = Math.floor(mps * 5);
        setMoney(m=>m+tip);
        setAllTime(a=>a+tip);
        addToast(`🐇 Il-Fenek left a tip: EUR ${fmt(tip)}!`, "bonus");
        playSound('coin');
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [pets.fenek, mps, loaded]);

  // update offline cap with kelb
  useEffect(() => {
    if (!loaded) return;
    // the offline cap is used during load; we'll adjust in load effect
  }, [pets.kelb]);

  // ad boost duration extension from berqa card
  useEffect(() => {
    if (!adBoost.active) return;
    // already extended on creation? we extend when adBoost is set
  }, [adBoost, vaultAdExtra]);

  // ---- Negozjant spawn timer ----
  const startNegozjantTimer = useCallback(() => {
    if (negozjantTimerRef.current) clearTimeout(negozjantTimerRef.current);
    const delay = 90000 + Math.random() * 90000; // 90-180 sec
    negozjantTimerRef.current = setTimeout(() => {
      if (!loaded || showGdpr || tutVisible || showLogin) return;
      const names = ["Pawlu", "Karlu", "Salvu", "Ġorġ"];
      const name = names[Math.floor(Math.random()*names.length)];
      const amount = Math.floor(mps * 120);
      setNegozjantName(name);
      setNegozjantAmount(amount);
      setNegozjantVisible(true);
      // auto-hide after 30 sec
      setTimeout(() => setNegozjantVisible(false), 30000);
      startNegozjantTimer();
    }, delay);
  }, [loaded, showGdpr, tutVisible, showLogin, mps]);
  useEffect(() => { if (loaded && !showGdpr && !tutVisible && !showLogin) startNegozjantTimer(); return () => clearTimeout(negozjantTimerRef.current); }, [loaded, showGdpr, tutVisible, showLogin]);

  // ---- Gelat earnings from milestones and location completion ----
  useEffect(() => {
    // called when totalMilest increases (in display sync)
    // we will integrate inside the milestone effect later
  }, []);
  // location star rating and Gelat reward
  const updateLocationStars = useCallback(() => {
    let updated = false;
    ALL_LOCS.forEach(loc => {
      const shops = locShops[loc.id] || [];
      if (shops.length >= 5) {
        const allLevel1 = shops.every(s => s.level >= 1);
        let newStars = 0;
        if (shops.length >= 3) newStars = 1;
        if (shops.length >= 4) newStars = 2;
        if (shops.length >= 5 && allLevel1) newStars = 3;
        if (newStars > (locationStars[loc.id] || 0)) {
          setLocationStars(prev => ({...prev, [loc.id]: newStars}));
          if (newStars === 3) {
            addGelat(2);
            addToast(`🌟 ${loc.name} reached 3 stars! +2 Ġelat`, "bonus");
          }
          updated = true;
        }
      }
    });
  }, [locShops, locationStars]);
  // call updateLocationStars after shops change
  useEffect(() => { updateLocationStars(); }, [locShops]);

  // ---- Festa (weekend event) ----
  const eventTypes = [
    { id: "pastizzi", name: "🎉 Festa tal-Pastizzi", goalKey: "earn", reward: { gelat: 10, badge: "🥇 Festa Champion" } },
    { id: "expansion", name: "🏪 Expansion Weekend", goalKey: "shops", reward: { gelat: 8, boost: { type: "income", duration: 7200 } } },
    { id: "milestone", name: "🎯 Milestone Marathon", goalKey: "milestones", reward: { gelat: 12, badge: "🏆 Marathon Master" } }
  ];
  let eventRotationIndex = 0;
  const startFesta = () => {
    const event = eventTypes[eventRotationIndex % eventTypes.length];
    let goal = 0;
    if (event.goalKey === "earn") goal = Math.max(10000, allTime * 0.1);
    else if (event.goalKey === "shops") goal = 5;
    else goal = 15;
    setFesta({
      active: true,
      name: event.name,
      endTime: Date.now() + 48 * 3600 * 1000,
      progress: 0,
      goal: goal,
      badge: null,
      eventId: event.id
    });
    setLastEventStart(Date.now());
  };
  // check for event trigger in daily login effect (7 days)
  useEffect(() => {
    if (!loaded) return;
    if (!lastEventStart) {
      setLastEventStart(Date.now() - 7*24*3600*1000); // trigger soon
      return;
    }
    if (!festa.active && (Date.now() - lastEventStart) > 7*24*3600*1000) {
      startFesta();
    }
  }, [loaded, lastEventStart, festa.active]);
  // update festa progress in display sync (500ms)
  // we'll integrate inside the existing display sync effect

  // ---- Vault upgrades ----
  const vaultCards = [
    { id: "ftira", emoji: "🫓", name: "Ftira Card", effect: "+3% income per level", max: 10, baseCost: 5, costMult: 1.4 },
    { id: "armar", emoji: "🎨", name: "Armar Card", effect: "+2% click power per level", max: 10, baseCost: 4, costMult: 1.3 },
    { id: "berqa", emoji: "⚡", name: "Berqa Card", effect: "+2 min ad boost per level", max: 15, baseCost: 8, costMult: 1.5 },
    { id: "ilma", emoji: "💧", name: "Ilma Card", effect: "+10% offline earnings per level", max: 10, baseCost: 6, costMult: 1.4 },
    { id: "karrozza", emoji: "🛒", name: "Karrozza Card", effect: "+5% starting cash per level", max: 20, baseCost: 3, costMult: 1.25 }
  ];
  const upgradeVault = (id) => {
    const card = vaultCards.find(c=>c.id===id);
    const current = vault[id];
    if (current >= card.max) { addToast("Max level reached!", "warn"); return; }
    let cost = Math.floor(card.baseCost * Math.pow(card.costMult, current));
    if (gelat < cost) { addToast(`Need ${cost} Ġelat!`, "warn"); return; }
    setGelat(g=>g-cost);
    setVault(prev => ({...prev, [id]: prev[id]+1}));
    addToast(`✨ ${card.name} upgraded to level ${current+1}!`, "bonus");
    playSound('unlock');
  };

  // ----- existing refs and effects (unchanged) -----
  useEffect(()=>{locShopsRef.current=locShops;},[locShops]);
  useEffect(()=>{mutedRef.current=muted;},[muted]);
  useEffect(()=>{
    volumeRef.current=volume;
    const g=bgNodesRef.current.gain;
    if(g&&!mutedRef.current){try{g.gain.setTargetAtTime(volume*.14,g.context.currentTime,.1);}catch(e){}}
  },[volume]);

  function getAudioCtx(){if(!audioCtxRef.current){try{audioCtxRef.current=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}}return audioCtxRef.current;}
  function playSound(type){
    if(mutedRef.current)return;const ctx=getAudioCtx();if(!ctx)return;
    if(ctx.state==='suspended')ctx.resume();
    const now=ctx.currentTime,master=ctx.createGain();master.connect(ctx.destination);
    if(type==='click'){const buf=ctx.createBuffer(1,ctx.sampleRate*.08,ctx.sampleRate),data=buf.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,4);const src=ctx.createBufferSource();src.buffer=buf;const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=1800;src.connect(flt);flt.connect(master);master.gain.setValueAtTime(.28,now);src.start(now);src.stop(now+.08);}
    else if(type==='crit'){[523.25,783.99,1046.5].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(.18,now+i*.06);g.gain.exponentialRampToValueAtTime(.001,now+i*.06+.5);o.connect(g);g.connect(master);o.start(now+i*.06);o.stop(now+i*.06+.5);});master.gain.setValueAtTime(.7,now);}
    else if(type==='coin'){[880,1320].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.22,now+i*.1);g.gain.exponentialRampToValueAtTime(.001,now+i*.1+.8);o.connect(g);g.connect(master);o.start(now+i*.1);o.stop(now+i*.1+.8);});master.gain.setValueAtTime(.7,now);}
    else if(type==='shop'){const notes=[220,261.63,329.63,440];notes.forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();flt.type='lowpass';flt.frequency.value=1200;o.type='sawtooth';o.frequency.value=freq;g.gain.setValueAtTime(0,now+i*.11);g.gain.linearRampToValueAtTime(.15,now+i*.11+.02);g.gain.exponentialRampToValueAtTime(.001,now+i*.11+.35);o.connect(flt);flt.connect(g);g.connect(master);o.start(now+i*.11);o.stop(now+i*.11+.35);});master.gain.setValueAtTime(.8,now);}
    else if(type==='milestone'){[392,523.25,659.25,783.99].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=i===3?'square':'triangle';o.frequency.value=freq;g.gain.setValueAtTime(0,now+i*.13);g.gain.linearRampToValueAtTime(.2,now+i*.13+.03);g.gain.exponentialRampToValueAtTime(.001,now+i*.13+.55);o.connect(g);g.connect(master);o.start(now+i*.13);o.stop(now+i*.13+.55);});master.gain.setValueAtTime(.7,now);}
    else if(type==='jackpot'||type==='login'){[261.63,329.63,392,523.25].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(0,now+i*.08);g.gain.linearRampToValueAtTime(.18,now+i*.08+.03);g.gain.exponentialRampToValueAtTime(.001,now+i*.08+1.0);o.connect(g);g.connect(master);o.start(now+i*.08);o.stop(now+i*.08+1.0);});master.gain.setValueAtTime(.7,now);}
    else if(type==='unlock'){[261.63,329.63,392,523.25].forEach((freq,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(0,now+i*.05);g.gain.linearRampToValueAtTime(.18,now+i*.05+.04);g.gain.exponentialRampToValueAtTime(.001,now+i*.05+1.2);o.connect(g);g.connect(master);o.start(now+i*.05);o.stop(now+i*.05+1.2);});master.gain.setValueAtTime(.7,now);}
  }

  function startBgMusic(){
    if(mutedRef.current)return;const ctx=getAudioCtx();if(!ctx)return;if(ctx.state==='suspended')ctx.resume();
    stopBgMusic();
    const masterGain=ctx.createGain();masterGain.gain.setValueAtTime(0,ctx.currentTime);masterGain.gain.linearRampToValueAtTime(volumeRef.current*.12,ctx.currentTime+3);masterGain.connect(ctx.destination);bgNodesRef.current.gain=masterGain;
    const chords=[[110,130.81,164.81],[98,123.47,146.83],[87.31,110,130.81],[82.41,103.83,130.81]];
    let ci=0,stopped=false;
    function playChord(freqs,t,dur){if(stopped)return;freqs.forEach(f=>{const o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();flt.type='lowpass';flt.frequency.value=600;o.type='sawtooth';o.frequency.value=f;g.gain.setValueAtTime(.05,t);g.gain.linearRampToValueAtTime(.07,t+.2);g.gain.linearRampToValueAtTime(.001,t+dur-.1);o.connect(flt);flt.connect(g);g.connect(masterGain);o.start(t);o.stop(t+dur);});}
    const barDur=3.2;let t=ctx.currentTime+.5;
    function loop(){if(stopped)return;for(let r=0;r<4;r++){playChord(chords[(ci+r)%4],t+r*barDur,barDur);}ci=(ci+4)%4;t+=barDur*4;if(!stopped)setTimeout(loop,(barDur*3)*1000);}
    loop();bgNodesRef.current.stopped=()=>{stopped=true;};
  }
  function stopBgMusic(){const{gain,stopped}=bgNodesRef.current;if(stopped)stopped();if(gain){try{gain.gain.linearRampToValueAtTime(0,gain.context.currentTime+.5);}catch(e){}}bgNodesRef.current={gain:null};}
  function ensureMusic(){if(!mutedRef.current&&!bgNodesRef.current.gain){startBgMusic();setMusicPlaying(true);}}
  function togglePlay(){if(mutedRef.current||!bgNodesRef.current.gain){mutedRef.current=false;setMuted(false);startBgMusic();setMusicPlaying(true);}else{stopBgMusic();setMusicPlaying(false);}}
  function toggleMute(){const nm=!mutedRef.current;mutedRef.current=nm;setMuted(nm);if(nm){stopBgMusic();setMusicPlaying(false);}else{startBgMusic();setMusicPlaying(true);}}

  // ----- load save (extended) -----
  useEffect(()=>{const check=()=>setIsMobile(window.innerWidth<768);check();window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check);},[]);
  useEffect(()=>{(async()=>{
    let d=null;
    try{if(typeof window.storage!=="undefined"){const r=await window.storage.get("ilp7");if(r)d=JSON.parse(r.value);}}catch(e){}
    if(!d){try{const s=localStorage.getItem("ilp7");if(s)d=JSON.parse(s);}catch(e){}}
    if(d){
      const ap=(set,k)=>{if(d[k]!==undefined)set(d[k]);};
      ap(setMoney,"money");ap(setAllTime,"allTime");ap(setTotalClicks,"totalClicks");ap(setClickMult,"clickMult");ap(setLocShops,"locShops");ap(setTotalMilest,"totalMilest");ap(setIap,"iap");ap(setAdBoost,"adBoost");ap(setTutDone,"tutDone");ap(setGdprDone,"gdprDone");ap(setGdprConsent,"gdprConsent");ap(setLbNickname,"lbNickname");ap(setLbRegistered,"lbRegistered");if(d.lbKey)lbKeyRef.current=d.lbKey;ap(setLoginStreak,"loginStreak");ap(setLastLoginDay,"lastLoginDay");ap(setLoginHistory,"loginHistory");ap(setStarterExpiry,"starterExpiry");
      // new state
      if(d.gelat !== undefined) setGelat(d.gelat);
      if(d.pets) setPets(d.pets);
      if(d.vault) setVault(d.vault);
      if(d.festa) setFesta(d.festa);
      if(d.festaHistory) setFestaHistory(d.festaHistory);
      if(d.lastEventStart) setLastEventStart(d.lastEventStart);
      if(d.locationStars) setLocationStars(d.locationStars);
      if(d.negozjantVisible) setNegozjantVisible(false); // do not restore visible
      if(d.tutDone)setTutVisible(false);
      if(d.iap&&!d.iap.starterPack&&d.starterExpiry&&Date.now()<d.starterExpiry)setShowStarter(true);
      const away=(Date.now()-(d.lastActive||Date.now()))/1000;
      let offlineMult = 1;
      if (d.pets && d.pets.kelb) offlineMult = 2; // 16h instead of 8h
      const cap = (d.pets && d.pets.kelb) ? 16*3600 : 8*3600;
      if(away>60&&(d.mps||0)>0){const gain=(d.mps||0)*Math.min(away,cap)* (d.vault?.ilma ? (1+d.vault.ilma*0.10) : 1); setMoney(m=>m+gain); setAllTime(a=>a+gain); setTimeout(()=>addToast(`💤 Offline: +EUR ${fmt(gain)}!`,"info"),500);}
    }
    setLoaded(true);
    const alreadyConsented=d&&d.gdprDone;
    if(!alreadyConsented){setTimeout(()=>setShowGdpr(true),600);}
    else{setTimeout(()=>checkDailyLogin(),1200);}
  })();},[]);

  // autosave (extended)
  useEffect(()=>{if(!loaded)return;const id=setInterval(async()=>{const s=stateRef.current; const sd={...s, gelat, pets, vault, festa, festaHistory, lastEventStart, locationStars, negozjantVisible:false, lastActive:Date.now()}; try{if(typeof window.storage!=="undefined")await window.storage.set("ilp7",JSON.stringify(sd));}catch(e){} try{localStorage.setItem("ilp7",JSON.stringify(sd));}catch(e){}},30000); return()=>clearInterval(id);},[loaded, gelat, pets, vault, festa, festaHistory, lastEventStart, locationStars]);

  // tick loops (modified for Bug 2)
  useEffect(()=>{if(!loaded)return;const id=setInterval(()=>{const dt=.1,shops=locShopsRef.current,tm=stateRef.current.totalMult||1;let gain=0,hits=0;const next={};ALL_LOCS.forEach(loc=>{const list=shops[loc.id]||[];next[loc.id]=list.map(shop=>{const type=SHOP_TYPES.find(t=>t.id===shop.typeId);if(!type)return shop;const prod=shopProd(type,shop.level,loc.diff);gain+=prod*tm*dt;const earned=(shop.earned||0)+prod*dt,target=shopTarget(type,shop.level,loc.diff);if(earned>=target){hits++;return{...shop,level:shop.level+1,earned:0};}return{...shop,earned};});});locShopsRef.current=next;moneyAccRef.current+=gain;allTimeAccRef.current+=gain;if(hits>0)pendingHitsRef.current+=hits;},100);return()=>clearInterval(id);},[loaded]);

  // display sync (500ms) – modified for Bug 4 and Bug 5
  useEffect(()=>{if(!loaded)return;const id=setInterval(()=>{
    const gain=moneyAccRef.current;
    if(gain>0){setMoney(m=>m+gain);setAllTime(a=>a+allTimeAccRef.current);moneyAccRef.current=0;allTimeAccRef.current=0;}
    setLocShops({...locShopsRef.current});
    const hits=pendingHitsRef.current;
    if(hits>0){
      pendingHitsRef.current=0;
      setTotalMilest(prev=>{
        const nxt=prev+hits;
        const unlocked=SHOP_TYPES.find(t=>t.unlocksAt>prev&&t.unlocksAt<=nxt);
        if(unlocked)setTimeout(()=>{addToast(`🆕 NEW: ${unlocked.name} unlocked!`,"unlock");playSound('unlock');},50);
        return nxt;
      });
      // Bug 4: replace loop with setGelat(g=>g+hits)
      setGelat(g=>g+hits);
      setTimeout(()=>{addToast(`🎯 Milestone! Shop leveled up!`,"milestone");playSound('milestone');},50);
    }
    // update festa progress
    if(festa.active && Date.now() < festa.endTime) {
      let newProgress = 0;
      if (festa.eventId === "pastizzi") newProgress = allTime;
      else if (festa.eventId === "expansion") newProgress = totalShops;
      else newProgress = totalMilest;
      const goal = festa.goal;
      let progressPct = Math.min(100, Math.floor(newProgress / goal * 100));
      setFesta(prev => ({...prev, progress: newProgress, badge: progressPct >= 100 ? prev.badge || "🥇" : null}));
      if (progressPct >= 100 && !festa.badge) {
        addToast(`🎉 ${festa.name} completed! Reward claimed!`, "unlock");
        // Bug 5: replace broken reward logic
        const _gr = { pastizzi:10, expansion:8, milestone:12 }[festa.eventId] || 0;
        if(_gr){ setGelat(g=>g+_gr); addToast(`🍨 +${_gr} Ġelat!`,"bonus"); }
        const _gb = { pastizzi:"🥇 Festa Champion", milestone:"🏆 Marathon Master" }[festa.eventId];
        if(_gb) setFestaHistory(h=>[...h,{date:new Date().toISOString(), event:festa.name, badge:_gb}]);
        if(festa.eventId === "expansion") setAdBoost({active:true, endsAt:Date.now()+7200000});
        setFesta(prev => ({...prev, active: false}));
      }
    } else if (festa.active && Date.now() >= festa.endTime) {
      setFesta(prev => ({...prev, active: false}));
    }
  },500); return()=>clearInterval(id);},[loaded, festa, allTime, totalShops, totalMilest]);

  // news ticker
  useEffect(()=>{const id=setInterval(()=>setNewsIdx(n=>(n+1)%NEWS.length),8000);return()=>clearInterval(id);},[]);
  useEffect(()=>{if(!adBoost.active)return;const rem=adBoost.endsAt-Date.now();if(rem<=0){setAdBoost(a=>({...a,active:false}));return;}const t=setTimeout(()=>setAdBoost(a=>({...a,active:false})),rem);return()=>clearTimeout(t);},[adBoost.active,adBoost.endsAt]);

  const addToast=useCallback((msg,type="info")=>{const id=++toastIdRef.current;setToasts(t=>[...t,{id,msg,type}]);setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4200);if(type==="warn")playSound('toast');},[]);
  const handleClick=useCallback((e)=>{const crit=Math.random()<.05,earn=clickPow*(crit?10:1);setMoney(m=>m+earn);setAllTime(a=>a+earn);setTotalClicks(c=>c+1);playSound(crit?'crit':'click');ensureMusic();setIsJiggling(true);setTimeout(()=>setIsJiggling(false),150);const rect=e.currentTarget.getBoundingClientRect(),id=++clickIdRef.current;setClickFx(c=>[...c,{id,x:e.clientX-rect.left,y:e.clientY-rect.top,val:earn,crit}]);setTimeout(()=>setClickFx(c=>c.filter(x=>x.id!==id)),1000);},[clickPow]);

  function openShop(locId,typeId){const loc=ALL_LOCS.find(l=>l.id===locId);if(!loc)return;const existing=locShops[locId]||[];if(existing.length>=5){addToast("Max 5 shops per location!","warn");return;}const type=SHOP_TYPES.find(t=>t.id===typeId);if(!type)return;let cost=shopOpenCost(type,existing.length,loc.diff); // apply karrozza bonus? Karrozza gives starting cash when opening new location? Actually effect: "starting cash bonus when opening new location (+5% of first shop cost per level)". We'll apply after purchase? Better: when opening first shop in a location, give cash bonus.
    if(money<cost){addToast("Not enough money! Keep baking...","warn");return;}
    setMoney(m=>m-cost);
    const newShop={typeId,level:0,earned:0},updated={...locShops,[locId]:[...existing,newShop]};setLocShops(updated);locShopsRef.current=updated;playSound('shop');addToast(`${type.emoji} ${type.name} opened in ${loc.name}!`,"shop");
    const ns=totalShops+1;if(ns%3===0){setTimeout(()=>addToast(`🏬 Franchise Bonus! +${Math.floor(ns/3)*5}% all income!`,"bonus"),200);setTimeout(()=>playSound('coin'),210);}
    if(ns===MALTA.length*3)setTimeout(()=>addToast(`⛵ ALL MALTA DONE! Gozo unlocked!`,"unlock"),400);
    // karrozza bonus: when first shop opened in a location, give cash
    if(existing.length === 0) {
      const bonus = Math.floor(cost * 0.05 * vault.karrozza);
      if(bonus > 0) { setMoney(m=>m+bonus); addToast(`🛒 Karrozza card gave +EUR ${fmt(bonus)} starting cash!`, "bonus"); }
    }
  }

  const C={red:"#CF142B",gold:"#D4A017",amber:"#F4A261",brown:"#5C3D11",cream:"#FDF0D5",paper:"#FFFBF5",bg:"#FEF3E2",green:"#2A9D59",blue:"#0A7FC9",prestige:"#7C3AED",shadow:"rgba(92,61,17,0.15)"};

  // ----- tutorial, login, gdpr, leaderboard functions (unchanged) -----
  function advanceTutorial(){const step=TUT_STEPS[tutStep];if(step.reward){setMoney(m=>m+step.reward);setAllTime(a=>a+step.reward);playSound('coin');addToast(`🎁 Tutorial reward: +EUR ${step.reward}!`,"bonus");}if(tutStep>=TUT_STEPS.length-1){setTutDone(true);setTutVisible(false);const expiry=Date.now()+24*60*60*1000;setStarterExpiry(expiry);if(!iap.starterPack)setTimeout(()=>setShowStarter(true),800);}else{const next=tutStep+1;setTutStep(next);const ns=TUT_STEPS[next];if(ns.highlight==="map")setTab("map");if(ns.highlight==="clicker")setTab("clicker");if(ns.highlight==="location")setTab("location");}}
  function skipTutorial(){setTutDone(true);setTutVisible(false);const expiry=Date.now()+24*60*60*1000;setStarterExpiry(expiry);if(!iap.starterPack)setTimeout(()=>setShowStarter(true),800);}
  function getLoginReward(streak){const day=((streak-1)%7)+1,week=Math.floor((streak-1)/7),weekMult=1+week*.5;const base=[{day:1,label:"Starter Bonus",emoji:"🥐",type:"money",value:50},{day:2,label:"Click Boost",emoji:"👆",type:"clickmult",value:1.2},{day:3,label:"Income Boost",emoji:"⚡",type:"adboost",value:30},{day:4,label:"Big Cash Drop",emoji:"💰",type:"money",value:200},{day:5,label:"Double Click",emoji:"✌️",type:"clickmult",value:1.5},{day:6,label:"Mega Boost",emoji:"🚀",type:"adboost",value:60},{day:7,label:"WEEKLY JACKPOT!",emoji:"👑",type:"money",value:1000}][day-1];return{...base,value:Math.round(base.value*(base.type==="money"?weekMult:1)),day,week:week+1,streak};}
  function checkDailyLogin(){const today=new Date().toISOString().split("T")[0];if(lastLoginDay===today)return;const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];const newStreak=lastLoginDay===yesterday?loginStreak+1:1;const reward=getLoginReward(newStreak);if(reward.type==="money"){setMoney(m=>m+reward.value);setAllTime(a=>a+reward.value);}if(reward.type==="clickmult")setClickMult(c=>parseFloat((c*reward.value).toFixed(4)));if(reward.type==="adboost")setAdBoost({active:true,endsAt:Date.now()+reward.value*60*1000});const entry={date:today,streak:newStreak,reward};setLoginHistory(h=>[entry,...h].slice(0,30));setLoginStreak(newStreak);setLastLoginDay(today);setLoginReward(reward);setShowLogin(true);setTimeout(()=>playSound(reward.day===7?'jackpot':'login'),400);}
  function acceptAllGdpr(){setGdprConsent({essential:true,analytics:true,personalised:true,functional:true});setGdprDone(true);setShowGdpr(false);setTimeout(()=>checkDailyLogin(),800);}
  function acceptEssentialOnly(){setGdprConsent({essential:true,analytics:false,personalised:false,functional:false});setGdprDone(true);setShowGdpr(false);setTimeout(()=>checkDailyLogin(),800);}
  function saveCustomGdpr(){setGdprDone(true);setShowGdpr(false);setTimeout(()=>checkDailyLogin(),800);}
  function openGdprSettings(){setShowGdpr(true);setGdprExpanded(true);}
  function makeLbKey(){if(lbKeyRef.current)return lbKeyRef.current;const key="plr_"+Math.random().toString(36).slice(2,10)+Date.now().toString(36);lbKeyRef.current=key;return key;}
  async function submitScore(nickname){if(!gdprConsent.functional){addToast("Enable Functional cookies to join!","warn");return;}if(!nickname||nickname.trim().length<2){addToast("Nickname must be 2+ characters!","warn");return;}const clean=nickname.trim().slice(0,20).replace(/[^a-zA-Z0-9 ._-]/g,"");setLbSubmitting(true);setLbError(null);const key=makeLbKey(),entry={key,nickname:clean,score:Math.floor(stateRef.current.allTime||0),shops:totalShops,milestones:totalMilest,mps:Math.floor(mps),maltaDone,gozoDone,ts:Date.now()};try{if(typeof window.storage!=="undefined"){await window.storage.set("lb_"+key,JSON.stringify(entry),true);setLbNickname(clean);setLbRegistered(true);lbKeyRef.current=key;addToast("🏆 You're on the leaderboard, "+clean+"!","bonus");await fetchLeaderboard();}else throw new Error("Storage unavailable");}catch(e){setLbError("Could not submit. Try again.");}setLbSubmitting(false);}
  async function updateScore(){if(!lbRegistered||!lbKeyRef.current)return;const key=lbKeyRef.current,entry={key,nickname:lbNickname,score:Math.floor(allTime),shops:totalShops,milestones:totalMilest,mps:Math.floor(mps),maltaDone,gozoDone,ts:Date.now()};try{if(typeof window.storage!=="undefined")await window.storage.set("lb_"+key,JSON.stringify(entry),true);}catch(e){}}
  async function fetchLeaderboard(){if(Date.now()-lbLastFetch<30000)return;setLbLoading(true);try{if(typeof window.storage!=="undefined"){const result=await window.storage.list("lb_",true),keys=(result&&result.keys)||[],entries=[];for(let ki=0;ki<Math.min(keys.length,100);ki++){try{const r=await window.storage.get(keys[ki],true);if(r&&r.value){const e=JSON.parse(r.value);if(e.nickname&&e.score>=0)entries.push(e);}}catch(_){}}entries.sort((a,b)=>b.score-a.score);setLbData(entries);if(lbKeyRef.current){const rank=entries.findIndex(e=>e.key===lbKeyRef.current);setLbMyRank(rank>=0?rank+1:null);}setLbLastFetch(Date.now());}}catch(e){setLbError("Could not load leaderboard.");}setLbLoading(false);}
  useEffect(()=>{if(!lbRegistered)return;const id=setInterval(()=>updateScore(),5*60*1000);return()=>clearInterval(id);},[lbRegistered]);
  function buyStarterPack(){setIap(p=>({...p,starterPack:true,premiumClick:true}));setMoney(m=>m+500);setAllTime(a=>a+500);setAdBoost({active:true,endsAt:Date.now()+60*60*1000});setShowStarter(false);playSound('jackpot');addToast("🎁 Starter Pack activated!","bonus");}

  // ----- Bug 3: add missing fields to stateRef -----
  stateRef.current={money,allTime,mps,clickPow,locShops,totalMilest,iap,adBoost,totalMult,franchiseMult,totalShops,loginStreak,lastLoginDay,loginHistory,lbNickname,lbRegistered,lbKey:lbKeyRef.current,tutDone,gdprDone,gdprConsent,starterExpiry, gelat, pets, vault, festa, festaHistory, lastEventStart, locationStars};

  // ----- SUB-COMPONENTS (with Bug 1 fixed) -----
  const LocCard=({loc,unlocked,selected})=>{const shops=locShops[loc.id]||[],cnt=shops.length,done=cnt>=3; const stars = locationStars[loc.id]||0; return(<div className="loc-card" onClick={()=>{if(unlocked){setSelectedLoc(loc.id);if(isMobile)setTab("location");}}} style={{borderRadius:12,padding:"8px 10px",cursor:unlocked?"pointer":"default",background:selected?C.cream:unlocked?"white":"#f4f4f4",border:`2px solid ${selected?C.red:done?C.green:unlocked?C.gold+"55":"#ddd"}`,opacity:unlocked?1:.45,transition:"all 0.14s",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:22,flexShrink:0}}>{loc.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{loc.name}</div><div style={{display:"flex",gap:2,marginTop:3}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:13,height:13,borderRadius:3,background:i<cnt?(i<3?C.gold:C.green):"#e0e0e0",border:`1px solid ${i<cnt?"rgba(0,0,0,0.2)":"#ccc"}`}}/>)}</div><div style={{fontSize:9,opacity:.45,marginTop:2}}>{cnt>=5?"Full":cnt>=3?"3+ open — qualifying!":cnt>0?`${cnt}/3 to qualify`:"No shops yet"}</div></div><div style={{display:"flex",gap:2,alignItems:"center"}}>{stars>0 && <span style={{fontSize:12}}>{"⭐".repeat(stars)}</span>}{done&&<span style={{fontSize:14,flexShrink:0}}>✅</span>}{!unlocked&&<span style={{fontSize:14,flexShrink:0}}>🔒</span>}</div></div>);};

  const MapPanel=()=>{const locs=island==="malta"?MALTA:GOZO,unl=island==="malta"?maltaUnlocked:gozoUnlocked;return(<div style={{padding:8,display:"flex",flexDirection:"column",gap:5}}><div style={{display:"flex",gap:4,marginBottom:4}}>{["malta","gozo"].map(isl=>{const locked=isl==="gozo"&&!gozoReady;return(<button key={isl} onClick={()=>{if(!locked)setIsland(isl);}} style={{flex:1,padding:"7px 4px",borderRadius:8,border:`2px solid ${island===isl?C.red:C.gold+"55"}`,background:island===isl?C.red:"transparent",color:island===isl?"white":C.brown,fontWeight:800,fontSize:11,cursor:locked?"default":"pointer",opacity:locked?0.5:1}}>{isl==="malta"?"🇲🇹 Malta":"⛵ Gozo"}{locked?" 🔒":""}</button>);})}</div>{island==="gozo"&&!gozoReady&&<div style={{padding:10,textAlign:"center",background:C.cream,borderRadius:10,fontSize:11,opacity:.7}}>🔒 Complete ALL Malta locations (3 shops each) to sail to Gozo!<br/><strong style={{color:C.red}}>{maltaDone}/{MALTA.length} done</strong></div>}<div style={{background:island==="malta"?"#fff5e6":"#e6f4ff",borderRadius:10,padding:"7px 10px",border:`1px solid ${C.gold}44`}}><div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700}}><span>{island==="malta"?`Malta: ${maltaDone}/${MALTA.length}`:`Gozo: ${gozoDone}/${GOZO.length}`} locations done</span><span style={{color:C.green,fontSize:10}}>{island==="malta"&&maltaDone===MALTA.length?"✅ Complete!":island==="gozo"&&gozoDone===GOZO.length?"🏆 COMPLETE!":""}</span></div><div style={{height:6,background:"#e0e0e0",borderRadius:4,marginTop:5,overflow:"hidden"}}><div style={{height:"100%",borderRadius:4,transition:"width 0.5s",background:`linear-gradient(90deg,${island==="malta"?C.red+","+C.amber:"#0077B6,#00B4D8"})`,width:`${((island==="malta"?maltaDone:gozoDone)/(island==="malta"?MALTA.length:GOZO.length))*100}%`}}/></div></div>{festa.active && <div style={{background:C.gold+"22", borderRadius:8, padding:"8px", marginTop:5, fontSize:11, fontWeight:700, display:"flex", justifyContent:"space-between", alignItems:"center"}}><span>{festa.name}</span><span>{Math.min(100,Math.floor(festa.progress/festa.goal*100))}%</span><span>{fmtTime((festa.endTime-Date.now())/1000)}</span></div>}{locs.map((loc,i)=><LocCard key={loc.id} loc={loc} unlocked={unl[i]} selected={selectedLoc===loc.id}/>)}</div>);};

  const LocationDetail=()=>{const loc=ALL_LOCS.find(l=>l.id===selectedLoc);if(!loc)return null;const maltaIdx=MALTA.indexOf(loc),gozoIdx=GOZO.indexOf(loc),locUnlocked=maltaIdx>=0?maltaUnlocked[maltaIdx]:gozoUnlocked[gozoIdx],shops=locShops[selectedLoc]||[],locMPS=shops.reduce((s,sh)=>{const t=SHOP_TYPES.find(x=>x.id===sh.typeId);return t?s+shopProd(t,sh.level,loc.diff):s;},0)*totalMult;
  if(!locUnlocked)return(<div style={{padding:24,textAlign:"center"}}><div style={{fontSize:44}}>🔒</div><div style={{fontWeight:700,fontSize:15,marginTop:8,color:C.brown}}>Locked</div><div style={{fontSize:12,opacity:.55,marginTop:6,lineHeight:1.6}}>{maltaIdx>0?`Open 3 shops in ${MALTA[maltaIdx-1]?.name} first`:gozoIdx===0?`Complete all Malta locations first`:`Open 3 shops in ${GOZO[gozoIdx-1]?.name} first`}</div></div>);
  return(<div><div style={{padding:"10px 12px",background:C.cream,borderBottom:`1px solid ${C.gold}33`,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:28}}>{loc.emoji}</span><div style={{flex:1}}><div style={{fontWeight:800,fontSize:15}}>{loc.name}</div><div style={{fontSize:10,opacity:.5}}>{shops.length}/5 shops · ×{loc.diff} diff · EUR {fmt(locMPS)}/s</div></div><div style={{textAlign:"right"}}><div style={{display:"flex",gap:2}}>{[0,1,2].map(i=><div key={i} style={{width:14,height:14,borderRadius:4,background:i<shops.length?C.gold:"#e0e0e0",border:`1px solid ${i<shops.length?C.amber:"#ccc"}`}}/>)}</div><div style={{fontSize:9,opacity:.45,marginTop:2}}>{shops.length<3?`${3-shops.length} more for Gozo`:"✅ Qualifies!"}</div></div></div>
  <div style={{padding:"6px 12px",background:"#FFF9EE",borderBottom:`1px solid ${C.gold}22`,fontSize:10,fontWeight:700,opacity:.6}}>ALL SHOP TYPES ({SHOP_TYPES.length} — {unlockedTypes.length} UNLOCKED)</div>
  <div style={{display:"flex",overflowX:"auto",padding:"6px 10px",borderBottom:`1px solid ${C.gold}22`,background:"#FFFDF6"}}>{SHOP_TYPES.map(t=>{const u=totalMilest>=t.unlocksAt;return(<div key={t.id} style={{flexShrink:0,textAlign:"center",padding:"4px 8px",borderRadius:8,background:u?C.cream:"#f0f0f0",border:`1px solid ${u?C.gold+"66":"#ddd"}`,marginRight:4,opacity:u?1:.45,minWidth:60}}><div style={{fontSize:18}}>{u?t.emoji:"🔒"}</div><div style={{fontSize:8,fontWeight:700,color:u?C.brown:"#999",marginTop:1}}>{t.name.split(" ")[0]}</div><div style={{fontSize:7,opacity:.5}}>{u?`Lv ${(locShops[selectedLoc]||[]).find(s=>s.typeId===t.id)?.level??"-"}`:`@${t.unlocksAt}ms`}</div></div>);})}</div>
  {shops.length===0&&<div style={{padding:16,textAlign:"center",opacity:.4,fontSize:12}}>No shops yet. Open one below! 🥐</div>}
  {shops.map((shop,idx)=>{const type=SHOP_TYPES.find(t=>t.id===shop.typeId);if(!type)return null;const prod=shopProd(type,shop.level,loc.diff),target=shopTarget(type,shop.level,loc.diff),pct=Math.min(((shop.earned||0)/target)*100,100),eta=prod>0?(target-(shop.earned||0))/prod:Infinity;return(<div key={idx} style={{padding:"10px 12px",borderBottom:`1px solid ${C.gold}22`}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:22,flexShrink:0}}>{type.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontWeight:800,fontSize:12}}>{type.name}</span><span style={{background:C.prestige,color:"white",fontSize:9,fontWeight:800,borderRadius:5,padding:"1px 5px"}}>Lv {shop.level}</span></div><div style={{fontSize:9,opacity:.45,marginTop:1}}>{type.desc}</div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:11,fontWeight:800,color:C.green}}>EUR {fmt(prod*totalMult)}/s</div><div style={{fontSize:9,opacity:.45}}>×{(prod/type.prod).toFixed(1)} base</div></div></div><div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,opacity:.55,marginBottom:2}}><span>🎯 Milestone {shop.level+1}: EUR {fmt(shop.earned||0)} / EUR {fmt(target)}</span><span style={{color:C.amber,fontWeight:700}}>{pct.toFixed(0)}%{prod>0?` · ${fmtTime(eta)}`:""}</span></div><div style={{height:8,background:"#EEE",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,borderRadius:5,transition:"width 0.4s",background:`linear-gradient(90deg,${C.amber},${C.gold})`}}/></div><div style={{fontSize:8,opacity:.35,marginTop:2}}>Milestone complete → Level {shop.level+1}: ×1.6 income, ×2.5 harder target</div></div>{(()=>{const skipCost=Math.ceil(shopTarget(type,shop.level,loc.diff)*.25),pctDone=((shop.earned||0)/shopTarget(type,shop.level,loc.diff))*100,canSkip=shop.level>=1&&pctDone<75&&money>=skipCost,whyNot=shop.level<1?"Reach Level 1 first":pctDone>=75?"Too close! Finish it 😏":money<skipCost?`Need EUR ${fmt(skipCost)}`:"";return(<div style={{marginTop:6,display:"flex",gap:4}}><div style={{flex:1,display:"flex",flexDirection:"column",gap:2}}><button onClick={()=>{if(!canSkip){addToast(whyNot||"Cannot skip","warn");return;}setMoney(m=>m-skipCost);const u={...locShopsRef.current};u[loc.id]=[...u[loc.id]];u[loc.id][idx]={...u[loc.id][idx],level:shop.level+1,earned:0};setLocShops(u);locShopsRef.current=u;addToast(`⚡ ${type.name} leveled up!`,"bonus");}} style={{padding:"4px",fontSize:9,borderRadius:6,border:`1px solid ${canSkip?C.blue:"#ccc"}`,background:canSkip?"#EEF6FF":"#f5f5f5",cursor:canSkip?"pointer":"default",color:canSkip?C.blue:"#aaa",fontWeight:700}}>⚡ Skip — EUR {fmt(skipCost)}</button>{!canSkip&&whyNot&&<div style={{fontSize:8,color:C.red,textAlign:"center",opacity:.7}}>🔒 {whyNot}</div>}</div><button onClick={()=>addToast("📺 2× boost (ad system coming)!","ad")} style={{padding:"4px 8px",fontSize:9,borderRadius:6,border:"1px solid #555",background:"#1a1a2e",cursor:"pointer",color:"#FFE566",fontWeight:700,flexShrink:0}}>📺 2×</button></div>);})()}</div>);})}
  {shops.length<5&&<div style={{padding:"10px 12px",borderTop:`2px dashed ${C.gold}44`,marginTop:2}}><div style={{fontWeight:800,fontSize:11,opacity:.5,marginBottom:8}}>OPEN NEW SHOP — SLOT {shops.length+1}/5</div>{unlockedTypes.length===0&&<div style={{fontSize:11,opacity:.45,textAlign:"center",paddingBottom:8}}>Keep baking to unlock shop types!</div>}{unlockedTypes.map(type=>{const cost=shopOpenCost(type,shops.length,loc.diff),can=money>=cost,tta=!can&&mps>0?(cost-money)/mps:0;return(<div key={type.id} className="shop-buy" onClick={()=>openShop(selectedLoc,type.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 9px",marginBottom:5,borderRadius:9,border:`2px solid ${can?C.gold+"77":"#ddd"}`,background:can?"#FFFDF0":"#fafafa",cursor:can?"pointer":"default",opacity:can?1:.5}}><span style={{fontSize:22,flexShrink:0}}>{type.emoji}</span><div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:12}}>{type.name}</div><div style={{fontSize:9,opacity:.5}}>{type.desc}</div><div style={{fontSize:9,color:C.green,fontWeight:600}}>EUR {fmt(shopProd(type,0,loc.diff)*totalMult)}/s base</div>{!can&&mps>0&&<div style={{fontSize:8,opacity:.4}}>⏱ {fmtTime(tta)}</div>}</div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:900,fontSize:13,color:can?C.red:C.brown}}>EUR {fmt(cost)}</div></div></div>);})}{unlockedTypes.length<SHOP_TYPES.length&&<div style={{fontSize:9,opacity:.4,textAlign:"center",marginTop:4}}>🔒 {SHOP_TYPES.length-unlockedTypes.length} more types unlock at future milestones</div>}</div>}
  {shops.length>=5&&<div style={{padding:12,textAlign:"center",fontSize:11,opacity:.45}}>All 5 slots filled! Expand to more locations.</div>}</div>);};

  // FIX: ProgressPanel now uses explicit return to avoid parsing ambiguity
  const ProgressPanel=()=>{return (<div style={{padding:10,display:"flex",flexDirection:"column",gap:8}}><div style={{background:C.cream,borderRadius:12,padding:10}}><div style={{fontWeight:800,fontSize:13,marginBottom:6}}>🇲🇹 Malta — {maltaDone}/{MALTA.length} done</div><div style={{height:8,background:"#ddd",borderRadius:5,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${(maltaDone/MALTA.length)*100}%`,background:`linear-gradient(90deg,${C.red},${C.amber})`,borderRadius:5,transition:"width 0.5s"}}/></div><div style={{fontSize:11,opacity:.6}}>3 shops per location · {MALTA.length*3} total to unlock Gozo</div>{gozoReady&&<div style={{fontSize:11,color:C.green,fontWeight:700,marginTop:4}}>✅ Gozo Unlocked!</div>}</div><div style={{background:"#EEF8FF",borderRadius:12,padding:10,opacity:gozoReady?1:.5,border:"1px solid #b0d4f5"}}><div style={{fontWeight:800,fontSize:13,marginBottom:6}}>{gozoReady?"⛵ Gozo":"🔒 Gozo"} — {gozoDone}/{GOZO.length}</div>{gozoReady?(<div style={{height:8,background:"#ddd",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${(gozoDone/GOZO.length)*100}%`,background:"linear-gradient(90deg,#0077B6,#00B4D8)",borderRadius:5,transition:"width 0.5s"}}/></div>):<div style={{fontSize:11,opacity:.55}}>Complete all Malta locations first</div>}{gozoDone===GOZO.length&&<div style={{fontSize:11,color:C.green,fontWeight:700,marginTop:4}}>🏆 GOZO COMPLETE!</div>}</div><div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",borderRadius:12,padding:10,color:"white"}}><div style={{fontWeight:800,fontSize:13}}>🏬 Franchise Bonus</div><div style={{fontSize:12,color:"#FFE566",marginTop:4}}>{totalShops} shops → ×{franchiseMult.toFixed(2)} ({Math.floor(totalShops/3)*5}%)</div><div style={{height:5,background:"rgba(255,255,255,0.15)",borderRadius:3,marginTop:6,overflow:"hidden"}}><div style={{height:"100%",width:`${((totalShops%3)/3)*100}%`,background:"#FFE566",borderRadius:3,transition:"width 0.4s"}}/></div><div style={{fontSize:9,opacity:.4,marginTop:2}}>Next +5%: {3-(totalShops%3)} more shops</div></div><div style={{background:C.cream,borderRadius:12,padding:10}}><div style={{fontWeight:800,fontSize:12,marginBottom:6}}>🆕 Shop Types ({unlockedTypes.length}/{SHOP_TYPES.length} Unlocked)</div>{SHOP_TYPES.map(t=>{const u=totalMilest>=t.unlocksAt;return(<div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:`1px solid ${C.gold}22`,opacity:u?1:.4}}><span style={{fontSize:18,flexShrink:0}}>{u?t.emoji:"🔒"}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:11}}>{t.name}</div><div style={{fontSize:9,opacity:.5}}>{u?`Unlocked · ${fmt(t.prod)}/s base`:`Requires ${t.unlocksAt} milestones`}</div></div>{u&&<span style={{color:C.green,fontSize:11,fontWeight:800}}>✓</span>}</div>);})}<div style={{fontSize:9,opacity:.4,marginTop:6,textAlign:"center"}}>Total milestones: {totalMilest}</div></div></div>);};

  const StorePanel=()=>(<div style={{padding:10,display:"flex",flexDirection:"column",gap:10}}><div style={{fontWeight:900,fontSize:14,textAlign:"center",color:C.red}}>💎 Premium & Boosts</div><button onClick={openGdprSettings} style={{width:"100%",padding:"8px",borderRadius:9,border:`1px solid rgba(207,20,43,0.3)`,background:"rgba(207,20,43,0.06)",color:C.red,fontSize:11,fontWeight:700,cursor:"pointer"}}> 🍪 Privacy & Cookie Settings (GDPR)</button><div style={{background:gdprDone?`${C.green}18`:`${C.red}18`,borderRadius:9,padding:"6px 10px",border:`1px solid ${gdprDone?C.green:C.red}33`,display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{gdprDone?"✅":"⚠️"}</span><div style={{flex:1}}><div style={{fontSize:10,fontWeight:800,color:gdprDone?C.green:C.red}}>{gdprDone?"Privacy Consent Given":"Consent Required"}</div><div style={{fontSize:9,opacity:.55}}>{gdprConsent.personalised?"Personalised ads: ON":"Personalised ads: OFF"} · {gdprConsent.analytics?"Analytics: ON":"Analytics: OFF"}</div></div></div>{!iap.noAds&&<div style={{background:"linear-gradient(135deg,#1a1a2e,#16213e)",borderRadius:12,padding:12,color:"white"}}><div style={{fontWeight:800,fontSize:13}}>📺 Watch Ad — 2× Income (30 min)</div>{adActive?<div style={{color:"#FFE566",fontSize:12,marginTop:6}}>✅ Active! {fmtTime(adTimeLeft)} remaining</div>:<button onClick={()=>{setAdBoost({active:true,endsAt:Date.now()+30*60*1000 + vaultAdExtra*1000});addToast("📺 2× income for 30 minutes!","ad");}} style={{marginTop:8,padding:"6px 14px",borderRadius:8,border:"none",background:"#FFE566",color:"#1a1a2e",fontWeight:800,cursor:"pointer",fontSize:12}}>Watch Now (Free)</button>}</div>}{[{key:"x5",label:"🚀 5× Permanent Income",sub:"Multiply ALL income permanently × 5!",price:"EUR 3.99",color:["#9B1C1C","#7B1A10"]},{key:"premiumClick",label:"🌟 Premium Clicker 3×",sub:"3× click power + golden pastizzi",price:"EUR 2.99",color:["#B8860B","#7A5000"]},{key:"noAds",label:"🚫 Remove Ads + Bonus",sub:"Ad-free + 10% income boost",price:"EUR 4.99",color:["#2C3E50","#1a252f"]}].map(item=><div key={item.key} style={{background:`linear-gradient(135deg,${item.color[0]},${item.color[1]})`,borderRadius:12,padding:12,color:"white"}}><div style={{fontWeight:800,fontSize:13}}>{item.label}</div><div style={{fontSize:11,opacity:.65,marginTop:2}}>{item.sub}</div>{iap[item.key]?<div style={{color:"#90EE90",fontSize:12,marginTop:6}}>✅ Active — Grazzi hafna!</div>:<button onClick={()=>{setIap(p=>({...p,[item.key]:true}));addToast(`${item.label} activated!`,"ad");}} style={{marginTop:8,padding:"6px 14px",borderRadius:8,border:"none",background:"#FFE566",color:item.color[1],fontWeight:800,cursor:"pointer",fontSize:12}}>{item.price}</button>}</div>)}<div style={{borderTop:`2px solid ${C.gold}33`, marginTop:8, paddingTop:8}}><div style={{fontWeight:800, fontSize:12, marginBottom:6, display:"flex", alignItems:"center", gap:6}}><span style={{fontSize:18}}>🍨</span> Ġelat Currency: {gelat}</div><div style={{fontWeight:800, fontSize:12, marginBottom:6}}>🐾 Maltese Pets</div>{[{id:"fenek", name:"Il-Fenek", emoji:"🐇", desc:"Auto-tip every 60 sec", cost:5000, unlockMilestone:10, iapPrice:"€1.99", bonus:"mps×5"},{id:"qattus", name:"Il-Qattus", emoji:"🐈", desc:"+15% permanent income", cost:0, unlockMilestone:25, iapPrice:"€2.49", bonus:"totalMult +15%"},{id:"kelb", name:"Il-Kelb", emoji:"🐕", desc:"Double offline earnings", cost:0, unlockMilestone:40, iapPrice:"€2.99", bonus:"offline cap 16h"}].map(p=>{const unlocked = totalMilest >= p.unlockMilestone; const owned = pets[p.id]; return(<div key={p.id} style={{marginBottom:6, background:C.cream, borderRadius:8, padding:8, opacity:unlocked?1:0.4}}><div style={{display:"flex", alignItems:"center", gap:8}}><span style={{fontSize:20}}>{p.emoji}</span><div style={{flex:1}}><div style={{fontWeight:700}}>{p.name}</div><div style={{fontSize:9, opacity:.6}}>{p.desc}</div></div>{owned?<span style={{color:C.green}}>✅ Active</span>:<>{unlocked?<><button onClick={()=>{if(p.id==="fenek"){if(money>=p.cost){setMoney(m=>m-p.cost); setPets(prev=>({...prev, fenek:true})); addToast(`🐇 ${p.name} is now helping you!`,"bonus");} else addToast(`Need EUR ${fmt(p.cost)}`,"warn");} else {addToast(`Buy ${p.name} via IAP (${p.iapPrice}) – demo mode`, "ad"); setPets(prev=>({...prev, [p.id]:true}));}} style={{background:C.gold, border:"none", borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer"}}>{p.id==="fenek"?`EUR ${fmt(p.cost)}`:p.iapPrice}</button></>:<span style={{fontSize:9}}>🔒 {p.unlockMilestone} milestones</span>}</>}</div></div></div>);})}</div><div style={{borderTop:`2px solid ${C.gold}33`, marginTop:8, paddingTop:8}}><div style={{fontWeight:800, fontSize:12, marginBottom:6}}>🏦 The Vault (Skill Tree)</div>{vaultCards.map(card=>{const level=vault[card.id]; const cost = Math.floor(card.baseCost * Math.pow(card.costMult, level)); const maxed = level >= card.max; return(<div key={card.id} style={{marginBottom:6, background:C.cream, borderRadius:8, padding:8}}><div style={{display:"flex", alignItems:"center", gap:8}}><span style={{fontSize:20}}>{card.emoji}</span><div style={{flex:1}}><div style={{fontWeight:700}}>{card.name}</div><div style={{fontSize:9, opacity:.6}}>{card.effect}</div><div style={{fontSize:9}}>Level {level}/{card.max}</div></div>{maxed?<span style={{color:C.green}}>MAX</span>:<button onClick={()=>upgradeVault(card.id)} disabled={gelat<cost} style={{background:gelat>=cost?C.gold:"#ccc", border:"none", borderRadius:5, padding:"2px 8px", fontSize:10, cursor:"pointer"}}>🍨 {cost}</button>}</div></div>);})}</div></div>);

  const ClickerBox=()=>(<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"14px 12px",gap:10}}><div style={{textAlign:"center"}}><div style={{fontSize:isMobile?20:28,fontWeight:900,color:C.brown}}>EUR {fmt(money)}</div><div style={{fontSize:12,opacity:.6}}>EUR {fmt(mps)}/sec{adActive&&<span style={{color:C.red,marginLeft:5,fontWeight:700}}>⚡×2 {fmtTime(adTimeLeft)}</span>}{iap.x5&&<span style={{color:C.green,marginLeft:5,fontWeight:700}}>🚀×5</span>}<span style={{color:"#FF6B9D", marginLeft:5}}>🍨 {gelat}</span></div><div style={{fontSize:10,opacity:.35}}>Franchise ×{franchiseMult.toFixed(2)} · {totalShops} shops · {totalMilest} milestones</div></div><div style={{position:"relative",cursor:"pointer"}} onClick={handleClick}><div style={{animation:isJiggling?"jiggle 0.15s ease":"none"}}><PastizziIcon size={isMobile?110:140} premium={iap.premiumClick}/></div>{clickFx.map(cf=><div key={cf.id} style={{position:"absolute",left:cf.x,top:cf.y,pointerEvents:"none",animation:"floatUp 1s ease forwards",fontSize:cf.crit?17:12,fontWeight:900,color:cf.crit?"#FFD700":C.red,whiteSpace:"nowrap",textShadow:"0 1px 4px rgba(0,0,0,0.4)",zIndex:10}}>{cf.crit?"✨ CRIT! ":"+EUR "}{fmt(cf.val)}</div>)}</div><div style={{fontSize:10,opacity:.4,textAlign:"center"}}>Ikklikkja l-pastizzi! 🇲🇹 +EUR {fmt(clickPow)}/click{iap.premiumClick?" 🌟":""}<br/><span style={{fontSize:9}}>5% chance of 10× critical click</span></div><div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"center"}}>{[["EUR "+fmt(allTime),"all time"],["EUR "+fmt(mps)+"/s","per sec"],[totalShops+" shops","open"],[totalMilest,"milestones"]].map(([v,l])=><div key={l} style={{background:C.cream,border:`1px solid ${C.gold}44`,borderRadius:8,padding:"4px 8px",textAlign:"center",minWidth:56}}><div style={{fontWeight:900,fontSize:12,color:C.red}}>{v}</div><div style={{fontSize:8,opacity:.5}}>{l}</div></div>)}</div>{!musicPlaying&&<button onClick={()=>{togglePlay();ensureMusic();}} style={{width:"100%",padding:"8px",borderRadius:10,background:"linear-gradient(135deg,#1a1a2e,#2a2040)",border:"1px solid rgba(255,229,102,0.3)",color:"#FFE566",fontSize:11,fontWeight:800,cursor:"pointer",animation:"subtlePulse 2s ease-in-out infinite"}}>▶️ Tap to preview Maltese background music</button>}{musicPlaying&&<div style={{width:"100%",padding:"7px",borderRadius:10,background:"linear-gradient(135deg,#0d1b0a,#1a3a14)",border:"1px solid rgba(80,200,80,0.3)",color:"#90EE90",fontSize:10,fontWeight:700,textAlign:"center"}}>🎵 Għana-inspired music playing</div>}<div style={{width:"100%",background:"#1a1a2e",borderRadius:10,padding:"6px 10px",color:"white"}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10}}><span>🏬 Franchise Bonus</span><span style={{color:"#FFE566",fontWeight:700}}>×{franchiseMult.toFixed(2)}</span></div><div style={{height:4,background:"rgba(255,255,255,0.15)",borderRadius:3,marginTop:4,overflow:"hidden"}}><div style={{height:"100%",width:`${((totalShops%3)/3)*100}%`,background:"#FFE566",borderRadius:3,transition:"width 0.5s"}}/></div><div style={{fontSize:8,opacity:.4,marginTop:2}}>Next +5%: {3-(totalShops%3)} more shops</div></div></div>);

  // ----- GDPR, Tutorial, Starter, Login, Leaderboard modals (with Bug 1 fixed in GdprBanner) -----
  const GdprBanner=()=>{if(!showGdpr)return null;const Toggle=({label,sub,val,onChange,locked})=>(<div style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.08)"}}><div style={{flex:1}}><div style={{fontWeight:700,fontSize:12,color:"white"}}>{label}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:2,lineHeight:1.4}}>{sub}</div></div><button onClick={()=>!locked&&onChange(!val)} style={{width:44,height:24,borderRadius:12,border:"none",background:val?"#2A9D59":"rgba(255,255,255,0.15)",cursor:locked?"default":"pointer",position:"relative",flexShrink:0,opacity:locked?0.5:1}}><div style={{width:18,height:18,borderRadius:9,background:"white",position:"absolute",top:3,left:val?23:3,transition:"left 0.2s"}}/></button></div>);
  return(<div onClick={e=>{if(e.target===e.currentTarget)acceptEssentialOnly();}} style={{position:"fixed",top:0,right:0,bottom:0,left:0,background:"rgba(0,0,0,0.65)",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px",boxSizing:"border-box"}}><div style={{background:"linear-gradient(180deg,#2a1200,#180900)",borderRadius:20,border:`2px solid ${C.gold}88`,padding:"22px 20px 24px",width:"100%",maxWidth:440,boxShadow:"0 8px 60px rgba(0,0,0,0.9)",maxHeight:"calc(100vh - 80px)",overflowY:"auto"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{fontSize:28}}>🍪</span><div><div style={{fontWeight:900,fontSize:17,color:C.gold}}>Before We Start Baking...</div><div style={{fontSize:10,color:"rgba(255,229,102,0.5)",marginTop:1}}>Privacy choices — required by EU law (GDPR)</div></div></div><p style={{fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.65,marginBottom:14}}>Il-Pastizzar uses cookies to save your game, show ads, and improve your experience. <span style={{color:C.gold,fontWeight:700}}>Essential cookies are always on.</span></p>{gdprExpanded?(<div style={{marginBottom:14}}><div style={{fontWeight:800,fontSize:10,color:C.gold,letterSpacing:1,marginBottom:6}}>MANAGE PREFERENCES</div><Toggle label="Essential (Always On)" sub="Saves your game. Cannot be disabled." val={true} locked={true} onChange={()=>{}}/><Toggle label="Personalised Ads" sub="AdMob tailored ads using your ad ID." val={gdprConsent.personalised} onChange={v=>setGdprConsent(p=>({...p,personalised:v}))}/><Toggle label="Analytics" sub="Anonymous gameplay stats to improve the game." val={gdprConsent.analytics} onChange={v=>setGdprConsent(p=>({...p,analytics:v}))}/><Toggle label="Functional" sub="Powers leaderboards and daily login streaks." val={gdprConsent.functional} onChange={v=>setGdprConsent(p=>({...p,functional:v}))}/><button onClick={saveCustomGdpr} style={{width:"100%",marginTop:14,padding:"11px",borderRadius:10,border:`1px solid ${C.gold}66`,background:"rgba(255,229,102,0.1)",color:C.gold,fontWeight:800,fontSize:12,cursor:"pointer"}}>Save My Choices</button></div>):(<button onClick={()=>setGdprExpanded(true)} style={{width:"100%",marginBottom:10,padding:"8px",borderRadius:8,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer",fontWeight:600}}>⚙️ Manage Preferences</button>)}<div style={{display:"flex",flexDirection:"column",gap:8}}><button onClick={acceptAllGdpr} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${C.gold},#8B6914)`,color:"#2D1800",fontWeight:900,fontSize:15,cursor:"pointer"}}>✅ Accept All & Start Playing!</button><button onClick={acceptEssentialOnly} style={{width:"100%",padding:"11px",borderRadius:11,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.6)",fontWeight:700,fontSize:12,cursor:"pointer"}}>Essential Only (no personalised ads)</button></div><p style={{fontSize:9,color:"rgba(255,255,255,0.2)",textAlign:"center",marginTop:12}}>GDPR compliant · Malta 🇲🇹 · IDPC registered</p></div></div>);};

  const TutorialOverlay=()=>{if(tutDone||!tutVisible||showGdpr)return null;const step=TUT_STEPS[tutStep],progress=tutStep/(TUT_STEPS.length-1);return(<div style={{position:"fixed",top:0,right:0,bottom:0,left:0,background:"rgba(0,0,0,0.78)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><button onClick={skipTutorial} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.3)",color:"rgba(255,255,255,0.6)",borderRadius:8,padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:600}}>Skip Tutorial</button><div style={{background:C.paper,borderRadius:22,padding:"24px 20px",maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)",border:`3px solid ${C.gold}`,animation:"fadeInUp 0.35s ease"}}><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>{TUT_STEPS.map((_,i)=><div key={i} style={{width:i===tutStep?20:8,height:8,borderRadius:4,background:i<=tutStep?C.red:"#ddd",transition:"all 0.3s"}}/>)}</div><div style={{fontSize:52,textAlign:"center",marginBottom:10,animation:"tutBounce 1s ease infinite"}}>{step.emoji}</div><h2 style={{textAlign:"center",fontSize:17,fontWeight:900,color:C.brown,margin:"0 0 10px",lineHeight:1.3}}>{step.title}</h2><p style={{fontSize:13,color:C.brown,opacity:.75,lineHeight:1.65,textAlign:"center",margin:"0 0 12px"}}>{step.body}</p>{step.tip&&<div style={{background:`${C.gold}22`,border:`1px solid ${C.gold}55`,borderRadius:10,padding:"8px 12px",marginBottom:14,fontSize:11,color:C.brown,opacity:.85}}>{step.tip}</div>}{step.reward&&<div style={{background:"linear-gradient(135deg,#2A9D59,#1a6e3d)",borderRadius:10,padding:"8px 12px",marginBottom:14,color:"white",textAlign:"center",fontWeight:700,fontSize:13}}>🎁 Tutorial reward: +EUR {step.reward}!</div>}<div style={{height:4,background:"#e0e0e0",borderRadius:3,marginBottom:16,overflow:"hidden"}}><div style={{height:"100%",width:`${progress*100}%`,background:`linear-gradient(90deg,${C.red},${C.gold})`,borderRadius:3,transition:"width 0.4s"}}/></div><button onClick={advanceTutorial} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.red},#9B0F20)`,color:"white",fontWeight:900,fontSize:14,cursor:"pointer"}}>{step.btnLabel}</button><div style={{textAlign:"center",marginTop:8,fontSize:10,opacity:.35}}>Step {tutStep+1} of {TUT_STEPS.length}</div></div></div>);};

  const StarterPackModal=()=>{const[timeLeft,setTimeLeft]=useState(Math.max(0,starterExpiry-Date.now()));useEffect(()=>{const id=setInterval(()=>{const rem=Math.max(0,starterExpiry-Date.now());setTimeLeft(rem);if(rem===0){setShowStarter(false);clearInterval(id);}},1000);return()=>clearInterval(id);},[]);if(!showStarter||iap.starterPack||showGdpr)return null;const hrs=Math.floor(timeLeft/3600000),mins=Math.floor((timeLeft%3600000)/60000),secs=Math.floor((timeLeft%60000)/1000);return(<div style={{position:"fixed",top:0,right:0,bottom:0,left:0,background:"rgba(0,0,0,0.82)",zIndex:490,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:"linear-gradient(160deg,#1a0a00,#3D1A00)",borderRadius:24,padding:"26px 22px",maxWidth:380,width:"100%",border:`3px solid ${C.gold}`,animation:"fadeInUp 0.4s ease",textAlign:"center"}}><div style={{background:`linear-gradient(135deg,${C.gold},#8B6914)`,borderRadius:50,display:"inline-block",padding:"4px 16px",fontSize:11,fontWeight:900,color:"#3D1A00",marginBottom:12}}>⚡ ONE-TIME OFFER</div><div style={{fontSize:44,marginBottom:6}}>🎁</div><h2 style={{color:C.gold,fontSize:22,fontWeight:900,margin:"0 0 4px"}}>Starter Pack</h2><div style={{background:"rgba(255,255,255,0.07)",borderRadius:14,padding:"12px 16px",marginBottom:16,textAlign:"left",display:"flex",flexDirection:"column",gap:8}}>{[["🌟","Premium Clicker","3× click power"],["💰","EUR 500 Head Start","Instant cash"],["⚡","2× Income Boost","1 hour doubled income"],["🎯","Milestone XP","First 3 milestones done"]].map(([ico,name,sub])=><div key={name} style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22,flexShrink:0}}>{ico}</span><div><div style={{fontWeight:700,fontSize:12,color:"white"}}>{name}</div><div style={{fontSize:10,color:"rgba(255,229,102,0.6)"}}>{sub}</div></div><span style={{marginLeft:"auto",color:C.green,fontWeight:900}}>✓</span></div>)}</div><div style={{background:"rgba(207,20,43,0.3)",border:`1px solid ${C.red}`,borderRadius:10,padding:"7px 12px",marginBottom:16,color:"white"}}><div style={{fontSize:10,opacity:.7,marginBottom:2}}>⏱️ Expires in:</div><div style={{fontSize:22,fontWeight:900,letterSpacing:3,color:"#FFE566"}}>{String(hrs).padStart(2,"0")}:{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div></div><button onClick={buyStarterPack} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${C.gold},#8B6914)`,color:"#3D1A00",fontWeight:900,fontSize:15,cursor:"pointer",marginBottom:8}}>🎁 Get Starter Pack — EUR 4.99</button><button onClick={()=>setShowStarter(false)} style={{width:"100%",padding:"9px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.4)",fontSize:11,cursor:"pointer"}}>No thanks</button></div></div>);};

  const DailyLoginModal=()=>{if(!showLogin||!loginReward||showGdpr)return null;const r=loginReward,isJackpot=r.day===7,rewardText=r.type==="money"?`+EUR ${fmt(r.value)} cash!`:r.type==="clickmult"?`Click power x${r.value}!`:`${r.value}min 2x boost!`;return(<div style={{position:"fixed",top:0,right:0,bottom:0,left:0,background:"rgba(0,0,0,0.80)",zIndex:480,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:isJackpot?"linear-gradient(160deg,#2D1B00,#5C3800)":`linear-gradient(160deg,#0d1b0a,#1a3a14)`,borderRadius:24,padding:"26px 20px",maxWidth:370,width:"100%",border:`3px solid ${isJackpot?C.gold:C.green}`,animation:"fadeInUp 0.4s ease",textAlign:"center"}}><div style={{background:isJackpot?`linear-gradient(135deg,${C.gold},#8B6914)`:`linear-gradient(135deg,${C.green},#1a6e3d)`,borderRadius:50,display:"inline-block",padding:"4px 16px",fontSize:11,fontWeight:900,color:"white",marginBottom:14}}>🔥 {loginStreak} DAY STREAK!</div><div style={{fontSize:isJackpot?64:52,marginBottom:8,animation:"tutBounce 0.8s ease infinite"}}>{r.emoji}</div><h2 style={{color:isJackpot?C.gold:"#90EE90",fontSize:isJackpot?22:19,fontWeight:900,margin:"0 0 6px"}}>{isJackpot?"🎉 WEEKLY JACKPOT!":"Daily Login Reward!"}</h2><div style={{background:"rgba(255,255,255,0.08)",borderRadius:14,padding:"16px",marginBottom:16}}><div style={{fontSize:isJackpot?32:26,fontWeight:900,color:isJackpot?C.gold:"#90EE90"}}>{rewardText}</div></div><div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:16}}>{[1,2,3,4,5,6,7].map(d=>{const done=d<=r.day,today=d===r.day,rewards=["🥐","👆","⚡","💰","✌️","🚀","👑"];return(<div key={d} style={{width:36,height:44,borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,background:today?"rgba(255,215,0,0.25)":done?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)",border:`2px solid ${today?C.gold:done?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)"}`}}><span style={{fontSize:14}}>{done?rewards[d-1]:"🔒"}</span><span style={{fontSize:8,color:today?C.gold:"rgba(255,255,255,0.4)",fontWeight:700}}>D{d}</span></div>);})}</div><button onClick={()=>setShowLogin(false)} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:isJackpot?`linear-gradient(135deg,${C.gold},#8B6914)`:`linear-gradient(135deg,${C.green},#1a6e3d)`,color:isJackpot?"#3D1A00":"white",fontWeight:900,fontSize:14,cursor:"pointer"}}>Claim & Play! 🥐</button></div></div>);};

  const LoginHistoryPanel=()=>{const today=new Date().toISOString().split("T")[0],claimedToday=lastLoginDay===today;return(<div style={{padding:10,display:"flex",flexDirection:"column",gap:8}}><div style={{background:"linear-gradient(135deg,#0d1b0a,#1a3a14)",borderRadius:14,padding:14,color:"white",textAlign:"center"}}><div style={{fontSize:36,fontWeight:900,color:C.green}}>🔥 {loginStreak}</div><div style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>Day Streak</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:3}}>{claimedToday?"✅ Claimed today!":"⚠️ Log in daily to keep your streak!"}</div>{!claimedToday&&<button onClick={checkDailyLogin} style={{marginTop:8,padding:"7px 18px",borderRadius:8,border:"none",background:C.green,color:"white",fontWeight:800,fontSize:12,cursor:"pointer"}}>🎁 Claim Today's Reward</button>}</div><div style={{background:C.cream,borderRadius:12,padding:10}}><div style={{fontWeight:800,fontSize:11,marginBottom:8,opacity:.6}}>THIS WEEK'S REWARDS</div>{[1,2,3,4,5,6,7].map(d=>{const r=getLoginReward(Math.floor((loginStreak-1)/7)*7+d),cycleDay=((loginStreak-1)%7)+1,done=d<cycleDay||(d===cycleDay&&claimedToday),isToday=d===cycleDay&&!claimedToday;return(<div key={d} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 6px",borderRadius:8,marginBottom:3,background:isToday?`${C.green}22`:done?"#f0fff4":"transparent",border:`1px solid ${isToday?C.green:done?C.green+"44":"transparent"}`}}><span style={{fontSize:18,flexShrink:0}}>{r.emoji}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:11,color:done||isToday?C.brown:"#aaa"}}>{r.label}</div><div style={{fontSize:9,opacity:.5}}>{r.type==="money"?`EUR ${fmt(r.value)}`:r.type==="clickmult"?`x${r.value} click`:`${r.value}min boost`}</div></div><span style={{fontSize:12}}>{done?"✅":isToday?"👈":""}</span></div>);})}</div>{loginHistory.length>0&&<div style={{background:C.cream,borderRadius:12,padding:10}}><div style={{fontWeight:800,fontSize:11,marginBottom:6,opacity:.6}}>HISTORY</div>{loginHistory.slice(0,10).map((entry,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:`1px solid ${C.gold}22`}}><span style={{fontSize:14,flexShrink:0}}>{entry.reward.emoji}</span><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700}}>{entry.date}</div><div style={{fontSize:9,opacity:.5}}>{entry.reward.label}</div></div><div style={{fontSize:10,fontWeight:800,color:C.green}}>🔥{entry.streak}</div></div>)}</div>}</div>);};

  const LeaderboardPanel=()=>{const nicknameInput=lbNicknameInput,setNicknameInput=setLbNicknameInput,myKey=lbKeyRef.current,filteredData=lbTab==="gozo"?lbData.filter(e=>e.gozoDone>0):lbTab==="malta"?lbData.filter(e=>e.maltaDone>=MALTA.length):lbData,myEntry=lbData.find(e=>e.key===myKey),myFilteredRank=myEntry?filteredData.findIndex(e=>e.key===myKey)+1:null,medalFor=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":null,fmtScore=n=>n>=1e9?(n/1e9).toFixed(1)+"B":n>=1e6?(n/1e6).toFixed(1)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":String(n);
  return(<div style={{padding:10,display:"flex",flexDirection:"column",gap:8}}>{!gdprConsent.functional&&<div style={{background:"#FFF8E6",borderRadius:12,padding:14,border:`1px solid ${C.gold}55`,textAlign:"center"}}><div style={{fontSize:22,marginBottom:6}}>🔒</div><div style={{fontWeight:800,fontSize:13,color:C.brown}}>Leaderboard Requires Consent</div><div style={{fontSize:11,opacity:.6,marginTop:4,marginBottom:10}}>Enable Functional cookies to join!</div><button onClick={openGdprSettings} style={{padding:"8px 18px",borderRadius:8,border:"none",background:C.red,color:"white",fontWeight:800,fontSize:11,cursor:"pointer"}}>⚙️ Update Privacy Settings</button></div>}{lbRegistered&&myEntry&&<div style={{background:"linear-gradient(135deg,#1a0a00,#3D1A00)",borderRadius:14,padding:12,border:`2px solid ${C.gold}`,color:"white"}}><div style={{fontSize:10,color:C.gold,fontWeight:800,marginBottom:6}}>YOUR RANKING</div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:32,fontWeight:900,color:C.gold,minWidth:44,textAlign:"center"}}>{myFilteredRank?`#${myFilteredRank}`:"—"}</div><div style={{flex:1}}><div style={{fontWeight:900,fontSize:15}}>{myEntry.nickname}</div><div style={{fontSize:10,opacity:.6}}>EUR {fmtScore(myEntry.score)} · {myEntry.shops} shops</div></div><button onClick={updateScore} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${C.gold}55`,background:"rgba(255,215,0,0.1)",color:C.gold,fontSize:10,fontWeight:700,cursor:"pointer"}}>↑ Update</button></div></div>}{!lbRegistered&&gdprConsent.functional&&<div style={{background:C.cream,borderRadius:12,padding:12,border:`1px solid ${C.gold}44`}}><div style={{fontWeight:800,fontSize:13,marginBottom:4,color:C.brown}}>🏆 Join the Leaderboard!</div><div style={{display:"flex",gap:6}}><input value={nicknameInput} onChange={e=>setNicknameInput(e.target.value.slice(0,20))} placeholder="Your nickname..." onKeyDown={e=>e.key==="Enter"&&submitScore(nicknameInput)} style={{flex:1,padding:"8px 10px",borderRadius:8,border:`2px solid ${C.gold}66`,background:"white",fontSize:12,outline:"none",color:C.brown}}/><button onClick={()=>submitScore(nicknameInput)} disabled={lbSubmitting||nicknameInput.trim().length<2} style={{padding:"8px 14px",borderRadius:8,border:"none",background:lbSubmitting||nicknameInput.trim().length<2?C.gold+"44":C.red,color:"white",fontWeight:800,fontSize:12,cursor:"pointer"}}>{lbSubmitting?"...":"Join!"}</button></div>{lbError&&<div style={{fontSize:10,color:C.red,marginTop:6}}>{lbError}</div>}</div>}<div style={{display:"flex",gap:4}}>{[["global","🌍 Global"],["malta","🇲🇹 Malta"],["gozo","⛵ Gozo"]].map(([id,label])=><button key={id} onClick={()=>setLbTab(id)} style={{flex:1,padding:"6px 4px",borderRadius:8,border:`1px solid ${lbTab===id?C.red:C.gold+"33"}`,background:lbTab===id?C.red:"transparent",color:lbTab===id?"white":C.brown,fontSize:9,fontWeight:800,cursor:"pointer"}}>{label}</button>)}</div><button onClick={fetchLeaderboard} disabled={lbLoading} style={{width:"100%",padding:"7px",borderRadius:8,border:`1px solid ${C.gold}44`,background:C.cream,color:C.brown,fontSize:10,fontWeight:700,cursor:"pointer",opacity:lbLoading?0.5:1}}>{lbLoading?"⏳ Loading...":"🔄 Refresh Leaderboard"}</button>{filteredData.length===0&&!lbLoading&&<div style={{textAlign:"center",padding:20,opacity:.4,fontSize:12}}>{lbLastFetch===0?"Hit Refresh to load!":"No players yet. Be the first!"}</div>}{filteredData.slice(0,50).map((entry,i)=>{const isMe=entry.key===myKey,medal=medalFor(i);return(<div key={entry.key||i} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:11,background:isMe?"linear-gradient(135deg,#1a0a00,#3D1A00)":i<3?"#FFF9EE":"white",border:`2px solid ${isMe?C.gold:i===0?C.gold:i===1?"#C0C0C0":i===2?"#CD7F32":C.gold+"22"}`}}><div style={{minWidth:32,textAlign:"center",flexShrink:0}}>{medal?<span style={{fontSize:22}}>{medal}</span>:<span style={{fontWeight:900,fontSize:13,color:isMe?C.gold:C.brown}}>#{i+1}</span>}</div><div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontWeight:800,fontSize:12,color:isMe?"#FFE566":C.brown,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.nickname}</span>{isMe&&<span style={{fontSize:8,background:C.gold,color:"#2D1800",borderRadius:4,padding:"1px 4px",fontWeight:900}}>YOU</span>}</div><div style={{fontSize:9,opacity:.4,marginTop:1}}>{entry.shops} shops · {entry.milestones} milestones</div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontWeight:900,fontSize:12,color:isMe?C.gold:C.red}}>EUR {fmtScore(entry.score)}</div></div></div>);})}</div>};

  // ----- Negozjant floating card -----
  const NegozjantCard = () => {
    if (!negozjantVisible) return null;
    const handleCollect = () => {
      setMoney(m => m + negozjantAmount);
      setAllTime(a => a + negozjantAmount);
      addToast(`💼 ${negozjantName} invested EUR ${fmt(negozjantAmount)}!`, "bonus");
      playSound('coin');
      setNegozjantVisible(false);
    };
    return (
      <div style={{position:"fixed", bottom:20, left:20, zIndex:200, background:"linear-gradient(135deg,#1a0a00,#3D1A00)", border:`2px solid ${C.gold}`, borderRadius:16, padding:"8px 12px", display:"flex", alignItems:"center", gap:8, boxShadow:"0 4px 20px rgba(0,0,0,0.5)", animation:"slideIn 0.3s ease"}}>
        <span style={{fontSize:28}}>🧳👔</span>
        <div>
          <div style={{fontWeight:800, fontSize:12, color:C.gold}}>{negozjantName}</div>
          <div style={{fontSize:10, color:"white"}}>💰 EUR {fmt(negozjantAmount)}</div>
        </div>
        <button onClick={handleCollect} style={{background:C.gold, border:"none", borderRadius:8, padding:"4px 10px", fontWeight:700, fontSize:10, cursor:"pointer"}}>Collect</button>
      </div>
    );
  };

  const LEFT_TABS=[{id:"map",label:"🗺️ Map"},{id:"progress",label:"📊 Goals"},{id:"store",label:"💎 Store"},{id:"login",label:"🔥 Streak"},{id:"leaderboard",label:"🏆 Ranks"}];
  const renderLeft=()=>{if(tab==="map")return<MapPanel/>;if(tab==="progress")return<ProgressPanel/>;if(tab==="store")return<StorePanel/>;if(tab==="login")return<LoginHistoryPanel/>;if(tab==="leaderboard")return<LeaderboardPanel/>;return<StorePanel/>;};
  const boxSt={background:C.paper,borderRadius:16,border:`2px solid ${C.gold}44`,boxShadow:`0 4px 20px ${C.shadow}`,overflow:"hidden",display:"flex",flexDirection:"column"};

  if(!loaded)return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:C.bg,gap:12,color:C.brown}}><PastizziIcon size={90} animated={false}/><div style={{fontWeight:700,fontSize:18,marginTop:8}}>Loading Il-Pastizzar...</div></div>);

  return(
    <div style={{fontFamily:"'Trebuchet MS','Segoe UI',sans-serif",background:`radial-gradient(ellipse at top,${C.bg},#F9E4C8)`,minHeight:"100vh",color:C.brown,paddingBottom:isMobile?68:0}}>
      <style>{`
        @keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-90px) scale(1.5)}}
        @keyframes slideIn{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes jiggle{0%,100%{transform:scale(1)}30%{transform:scale(0.88) rotate(-6deg)}70%{transform:scale(0.93) rotate(5deg)}}
        @keyframes pastPulse{0%,100%{filter:drop-shadow(0 6px 14px rgba(0,0,0,0.38))}50%{filter:drop-shadow(0 6px 24px rgba(244,162,97,0.85))}}
        @keyframes newsscr{0%{transform:translateX(100%)}100%{transform:translateX(-150%)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes subtlePulse{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:1;transform:scale(1.01)}}
        @keyframes tutBounce{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:${C.gold}88;border-radius:4px}
        .loc-card:hover{background:#FFF3DC !important;border-color:${C.gold} !important}
        .shop-buy:hover{background:#FFFBEE !important}
        .left-tab:hover{opacity:0.8}
      `}</style>
      <div style={{background:`linear-gradient(135deg,${C.red},#9B0F20)`,padding:`10px ${isMobile?"10px":"18px"}`,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{transform:"scale(0.5)",transformOrigin:"left center",marginRight:-20,flexShrink:0}}><PastizziIcon size={80} animated={false}/></div>
          <div><div style={{color:"#FFE566",fontSize:isMobile?15:21,fontWeight:900,lineHeight:1.1}}>Il-Pastizzar!</div><div style={{color:"rgba(255,229,102,0.6)",fontSize:9,letterSpacing:1}}>MALTESE IDLE EMPIRE</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {adActive&&<div style={{background:"rgba(255,215,0,0.22)",borderRadius:7,padding:"3px 8px",color:"#FFE566",fontSize:10,fontWeight:800}}>⚡×2 {fmtTime(adTimeLeft)}</div>}
          <div style={{position:"relative",display:"flex",alignItems:"center",gap:4}}>
            <button onClick={togglePlay} style={{background:"rgba(0,0,0,0.28)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,padding:"5px 9px",color:musicPlaying?"#FFE566":"rgba(255,229,102,0.45)",fontSize:15,cursor:"pointer",lineHeight:1}}>{musicPlaying?"⏸":"▶️"}</button>
            <button onClick={()=>setShowVolume(v=>!v)} style={{background:"rgba(0,0,0,0.28)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,padding:"5px 9px",color:muted?"rgba(255,229,102,0.3)":"#FFE566",fontSize:15,cursor:"pointer",lineHeight:1}}>{muted||volume===0?"🔇":volume<.4?"🔉":"🔊"}</button>
            {showVolume&&<div style={{position:"absolute",top:38,right:0,background:"rgba(20,10,0,0.95)",border:"1px solid rgba(255,229,102,0.3)",borderRadius:12,padding:"10px 14px",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:130}}><div style={{color:"#FFE566",fontSize:10,fontWeight:700}}>🎵 VOLUME</div><input type="range" min="0" max="1" step="0.05" value={muted?0:volume} onChange={e=>{const v=parseFloat(e.target.value);setVolume(v);if(v===0)toggleMute();else if(muted){mutedRef.current=false;setMuted(false);startBgMusic();setMusicPlaying(true);}}} style={{width:100,accentColor:"#FFE566",cursor:"pointer"}}/><div style={{color:"rgba(255,229,102,0.6)",fontSize:9}}>{muted||volume===0?"Muted":Math.round(volume*100)+"%"}</div></div>}
          </div>
          <div style={{background:"rgba(0,0,0,0.25)",borderRadius:10,padding:"5px 12px",textAlign:"right"}}>
            <div style={{color:"#FFE566",fontSize:isMobile?13:19,fontWeight:900}}>EUR {fmt(money)}</div>
            <div style={{color:"rgba(255,229,102,0.7)",fontSize:10}}>EUR {fmt(mps)}/s</div>
          </div>
        </div>
      </div>
      {!isMobile&&(<div style={{display:"grid",gridTemplateColumns:"240px 1fr 290px",gap:10,padding:10,maxWidth:1100,margin:"0 auto"}}>
        <div style={boxSt}><div style={{display:"flex",gap:2,padding:4,background:C.cream,borderBottom:`1px solid ${C.gold}33`,flexShrink:0}}>{LEFT_TABS.map(t=><button key={t.id} className="left-tab" onClick={()=>setTab(t.id)} style={{flex:1,padding:"5px 2px",borderRadius:6,border:"none",background:tab===t.id?C.red:"transparent",color:tab===t.id?"white":C.brown,fontWeight:700,fontSize:9,cursor:"pointer"}}>{t.label}</button>)}</div><div style={{overflowY:"auto",flex:1}}>{renderLeft()}</div></div>
        <div style={boxSt}><ClickerBox/></div>
        <div style={boxSt}><div style={{overflowY:"auto",flex:1}}><LocationDetail/></div></div>
      </div>)}
      {isMobile&&(<div style={{padding:8}}>
        {tab==="map"&&<div style={boxSt}><MapPanel/></div>}
        {tab==="clicker"&&<div style={boxSt}><ClickerBox/></div>}
        {tab==="location"&&<div style={boxSt}><LocationDetail/></div>}
        {tab==="progress"&&<div style={boxSt}><ProgressPanel/></div>}
        {tab==="store"&&<div style={boxSt}><StorePanel/></div>}
        {tab==="login"&&<div style={boxSt}><LoginHistoryPanel/></div>}
        {tab==="leaderboard"&&<div style={boxSt}><LeaderboardPanel/></div>}
      </div>)}
      <div style={{background:`linear-gradient(90deg,${C.red},#9B0F20)`,padding:"5px 0",overflow:"hidden",marginTop:4}}>
        <div style={{display:"flex",alignItems:"center"}}><div style={{background:"#FFE566",color:C.red,fontWeight:900,fontSize:9,padding:"2px 8px",flexShrink:0,marginRight:8}}>📰 NEWS</div><div style={{color:"white",fontSize:11,whiteSpace:"nowrap",animation:"newsscr 24s linear infinite"}}>{NEWS[newsIdx]}</div></div>
      </div>
      <div style={{position:"fixed",bottom:isMobile?74:16,right:12,display:"flex",flexDirection:"column",gap:6,zIndex:250,maxWidth:295}}>{toasts.map(t=><div key={t.id} style={{padding:"9px 14px",borderRadius:12,color:"white",fontWeight:700,fontSize:12,animation:"slideIn 0.3s ease",background:t.type==="shop"?`linear-gradient(135deg,${C.green},#1a6e3d)`:t.type==="unlock"?`linear-gradient(135deg,#7C3AED,#4C1D95)`:t.type==="milestone"?`linear-gradient(135deg,${C.gold},#8B6914)`:t.type==="bonus"?`linear-gradient(135deg,#D4A017,#7A5000)`:t.type==="warn"?`linear-gradient(135deg,${C.red},#7B0000)`:`linear-gradient(135deg,#444,#222)`}}>{t.msg}</div>)}</div>
      <NegozjantCard />
      <GdprBanner/>
      <DailyLoginModal/>
      <TutorialOverlay/>
      <StarterPackModal/>
      {isMobile&&(<div style={{position:"fixed",bottom:0,left:0,right:0,background:C.paper,borderTop:`2px solid ${C.gold}44`,display:"flex",zIndex:100}}>{[["map","🗺️","Map"],["clicker","🥐","Click"],["location","🏪","Shops"],["leaderboard","🏆","Ranks"],["store","💎","Store"]].map(([t,ic,lb])=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"7px 2px 5px",border:"none",background:tab===t?C.cream:"transparent",color:tab===t?C.red:C.brown,fontSize:8,fontWeight:800,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}><span style={{fontSize:20}}>{ic}</span>{lb}</button>)}</div>)}
    </div>
  );
      }
