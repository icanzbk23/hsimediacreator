import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Camera, Calendar, Mail, Copy, Sparkles, Plus, Trash2, ChartColumn,
  Check, AlertTriangle, Pencil, X, Search, Phone, Lock, FileText,
  User, Eye, EyeOff, RefreshCw, TrendingUp, Send, Clock,
  CircleCheck, CircleX, Archive, NotebookPen, ChevronRight, Star,
  Layers, MessageSquare, Users, LayoutDashboard, Share2, ClipboardList,
  Lightbulb, ShieldCheck, Megaphone
} from "lucide-react";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const COLORS = ["#E8503A","#7B68EE","#34C759","#FF9500","#48BFAB","#E8A0BF","#8B1A2F","#5C7A4E","#2C3E6B","#D4871E","#C0392B","#9B7FBA","#E67E22","#4A7C8E"];
const DAYS   = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma"];

const STATUS = {
  taslak:     { label:"Taslak",     color:"#555",    bg:"#55555518", border:"#55555533", icon:"⬜" },
  aranıyor:   { label:"Aranıyor",   color:"#FF9500", bg:"#FF950018", border:"#FF950033", icon:"📞" },
  onaylandi:  { label:"Onaylandı",  color:"#34C759", bg:"#34C75918", border:"#34C75933", icon:"✅" },
  ertelendi:  { label:"Ertelendi",  color:"#FF3B30", bg:"#FF3B3018", border:"#FF3B3033", icon:"❌" },
  kesinlesti: { label:"Kesinleşti", color:"#7B68EE", bg:"#7B68EE18", border:"#7B68EE33", icon:"🔒" },
};

const PASSWORDS = {
  admin: import.meta.env.VITE_ADMIN_PASSWORD||"admin2026",
  ekip:  import.meta.env.VITE_EKIP_PASSWORD ||"ekip2026",
  mudur: import.meta.env.VITE_MUDUR_PASSWORD||"eserdeniz",
};

const INITIAL_VENUES = [
  { id:1,  name:"Mikado Restaurant",   concept:"", stock:7,  color:"#E8503A", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:2,  name:"Harvey Burger",       concept:"", stock:3,  color:"#7B68EE", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:3,  name:"Sinan Özdemir", concept:"", stock:11, color:"#34C759", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:5,  name:"Sultan Sofrası",      concept:"Hatay yöresel yemekler", stock:5, color:"#C0392B", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:6,  name:"Ege Döner",           concept:"", stock:8,  color:"#48BFAB", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:7,  name:"Kuban Kuruyemiş",     concept:"", stock:1,  color:"#E8A0BF", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:8,  name:"Şenöz",                concept:"", stock:6,  color:"#D4871E", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:9,  name:"YSANTOCHİA",      concept:"", stock:4,  color:"#9B7FBA", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:10, name:"Sütlü Kavurma",       concept:"", stock:9,  color:"#2C3E6B", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:11, name:"Süleyman Usta Döner", concept:"", stock:2,  color:"#8B4513", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:12, name:"İSTE Çiftlik",        concept:"Hatay yöresel ürünler", stock:10, color:"#5C7A4E", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:13, name:"Sezai Usta",          concept:"Kebap mangal", stock:3, color:"#E67E22", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:14, name:"Musta Döner",         concept:"", stock:6,  color:"#4A7C8E", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:15, name:"Saudade",             concept:"", stock:0,  color:"#8B1A2F", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
  { id:16, name:"Ege Büfe",            concept:"", stock:0,  color:"#00CED1", phone:"", instagram:"", introVideos:[], referenceLinks:[], venueAnalysis:"", instagramData:null, ideas:[] },
];

// Electron'da file:// protokolüyle yüklendiğinde /api/ URL'leri çalışmaz,
// doğrudan server.py portuna yönlendiririz.
const API_BASE = (typeof window !== "undefined" && window.location.protocol === "file:")
  ? "http://localhost:8765"
  : "";

// ── SUPABASE SHARED STATE ──────────────────────────────────────────────────────
// app_state tablosu: key/value çiftleri olarak tüm paylaşılan state'i tutar.
// Admin localhost'tan, Ekip/Patron Vercel'den bağlanır; Supabase ortak veri katmanıdır.
const _SURL = import.meta.env.VITE_SUPABASE_URL;
const _SKEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const _supa = (_SURL && _SKEY) ? createClient(_SURL, _SKEY) : null;

const _supaSet = async (key, value) => {
  if (!_supa) return;
  try { await _supa.from("app_state").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" }); } catch {}
};

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day===0?-6:1);
  const monday = new Date(today); monday.setDate(diff);
  return DAYS.map((d,i) => {
    const date = new Date(monday); date.setDate(monday.getDate()+i);
    return { day:d, date:date.toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit"}) };
  });
}

// ── VENUE CATEGORY DETECTION ──────────────────────────────────────────────────
function detectCategory(venue) {
  const t = (venue.name + " " + (venue.concept||"")).toLowerCase();
  if(/döner|doner/.test(t)) return "doner";
  if(/burger/.test(t)) return "burger";
  if(/pizza|pide/.test(t)) return "pizza";
  if(/baklava|tatlı|tatli|pasta|börek/.test(t)) return "dessert";
  if(/fırın|firin|unlu|ekmek/.test(t)) return "bakery";
  if(/kuruyemiş|kuruyemis|fındık/.test(t)) return "nuts";
  if(/çiftlik|ciftlik|organik|yöresel/.test(t)) return "farm";
  if(/cafe|kahve|coffee/.test(t)) return "cafe";
  if(/kebap|kebab|mangal|ızgara/.test(t)) return "kebap";
  if(/hatay|sofrası|sofra/.test(t)) return "turkish";
  return "restaurant";
}
const CATEGORY_HASHTAGS = {
  doner:      ["donerkebab","doner","streetfoodturkey","turkishstreetfood","lavaşdöner"],
  burger:     ["smashburger","craftburger","gourmetburger","burgerstagram","burgerofinstagram"],
  pizza:      ["pizzareels","neopolitanpizza","woodfiredpizza","pizzatime","italianpizza"],
  dessert:    ["baklava","turkishdessert","dessertsofinstagram","sweetsofinstagram","orientaldessert"],
  bakery:     ["artisanbread","freshbread","sourdoughbread","bakerylife","pastryreels"],
  nuts:       ["driedfruits","healthysnacks","nutlover","snacktime","premiumnuts"],
  farm:       ["farmfresh","organicfood","localfood","farmtotable","yoreselfood"],
  cafe:       ["coffeereels","cafevibes","coffeelovers","specialtycoffee","cafeaesthetic"],
  kebap:      ["kebablovers","turkishbbq","grillmaster","turkishkebab","mangal"],
  turkish:    ["turkishfood","turkishcuisine","hataymutfagi","anatolianfood","turkishrecipe"],
  restaurant: ["foodreels","restaurantfood","cheflife","plating","finedining"],
};

// ── LOCAL INSTAGRAM IDEA GENERATOR ───────────────────────────────────────────
function generateIdeasFromInstagram(venue) {
  const data = venue.instagramData || [];
  if (!data.length) return [];
  const sorted = [...data].sort((a,b) => b.views - a.views);

  const musicCount = {};
  data.forEach(r => { if(r.music) musicCount[r.music] = (musicCount[r.music]||0)+1; });
  const topMusic = Object.entries(musicCount).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);

  const tagCount = {};
  data.forEach(r => {
    if(r.hashtags){ const tags=(r.hashtags+" ").split(/[\s,#]+/).filter(t=>t.length>1); tags.forEach(t=>{tagCount[t.toLowerCase()]=(tagCount[t.toLowerCase()]||0)+1;}); }
  });
  const topTags = Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,5).map(e=>"#"+e[0]);

  const topReel   = sorted[0];
  const top2      = sorted[1]||sorted[0];
  const top3      = sorted[2]||sorted[0];
  const highSave  = [...data].sort((a,b)=>(b.saves||0)-(a.saves||0))[0];
  const highCmt   = [...data].sort((a,b)=>(b.comments||0)-(a.comments||0))[0];
  const avgViews  = Math.round(data.reduce((a,r)=>a+r.views,0)/data.length);
  // Konsept kelimelerini virgülle ayır, yoksa mekan adını kullan
  const conceptRaw = venue.concept || "";
  const conceptKws = conceptRaw.split(/,|،/).map(k=>k.trim()).filter(Boolean);
  const hasConcept = conceptKws.length > 0;
  const concept    = hasConcept ? conceptKws.join(", ") : venue.name;
  // Her fikir farklı bir konsept kelimesine odaklansın
  const kw = (i) => hasConcept ? conceptKws[i % conceptKws.length] : venue.name;
  const cat       = detectCategory(venue);
  const catTags   = CATEGORY_HASHTAGS[cat]||CATEGORY_HASHTAGS.restaurant;

  // Seed for rotation — changes with each regeneration click (use Date.now mod)
  const seed = Math.floor(Date.now()/1000) % 7;

  // 12 idea templates, rotate by seed so each press gives different combo
  const pool = [
    {
      baslik: `${topReel.views>100000?"Milyon İzleme":"Viral"} Format Replikası — ${kw(0)}`,
      konsept: `Bu hesabın en viral içeriği: "${topReel.description?.slice(0,70)||"Ürün sunumu"}". ${topReel.views.toLocaleString()} görüntülenme. "${kw(0)}" temasıyla birebir aynı kamera açısı, ışık ve tempo ile yeni versiyon çek.`,
      cekim_tarzi: `${topReel.views>50000?"Hızlı 0.5–1sn kesimler, dinamik açılar":"Yavaş, akıcı kamera hareketi"}. İlk 1.5 saniyede hareket/ses sürprizi. Aynı renk tonu.`,
      viral_sebebi: `Algoritma bu formatı zaten onayladı — ${topReel.views.toLocaleString()} organik görüntülenme bunu kanıtlıyor.`,
      muzik_trendi: topMusic[0]||"Viral trending ses",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[0]}/`,
      ilham_google: `${kw(0)} viral reel format ${catTags[0]}`,
      ilham_tiktok: topTags[0]||catTags[0],
    },
    {
      baslik: `Slow-Motion Doku — ${kw(1)}`,
      konsept: `"${kw(1)}" — bu ürünün en iştah açıcı anını (kesim, servis, akış, buharlama) 120fps slow-motion ile çek. Ses efekti ekle.`,
      cekim_tarzi: `iPhone'da Slo-Mo modu veya kamera yavaş çekim. Yakın plan makro. Sıcak amber ışık. Çekim süresi 8-12 sn.`,
      viral_sebebi: `Gıda slow-motion videoları ortalama 3.2x daha fazla görüntülenme alır. "ASMR" etkisi yorumu ve kaydetmeyi tetikler.`,
      muzik_trendi: topMusic[1]||"Cinematic atmospheric",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[1]||catTags[0]}/`,
      ilham_google: `slow motion food reel ${cat}`,
      ilham_tiktok: `slowmo food reels`,
    },
    {
      baslik: `"Bunu Denediniz mi?" Soru Kancası`,
      konsept: `${highCmt.views>0?`En çok yorum alan video (${highCmt.comments} yorum): "${highCmt.description?.slice(0,60)||"ürün gösterimi"}". `:""}Aynı "denediniz mi?" formatıyla "${kw(2)}" için içerik üret. Son karede merak uyandıran soru.`,
      cekim_tarzi: `Ürünü gizemli şekilde göster → reveal → soru ekranı. Yazı overlay büyük font. 10-15 sn.`,
      viral_sebebi: `Soru formatı yorum oranını %180 artırır. Her yorum organik erişimi doğrudan büyütür.`,
      muzik_trendi: topMusic[0]||"Suspenseful trending",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[0]}reels/`,
      ilham_google: `have you tried food reel format`,
      ilham_tiktok: `bunu denediniz mi yemek reels`,
    },
    {
      baslik: `Mutfak Arkası (Behind The Scenes)`,
      konsept: `"${kw(3)}" — bu ürünün hazırlık sürecini göster. Hamur yoğurma, et dinlendirme, sos hazırlama, fırın açma. Ham, gerçek, filtre olmadan.`,
      cekim_tarzi: `El kamerası hareketi, doğal mutfak sesleri (bıçak, tava, ocak). Hızlandırılmış (timelapse) bölümler. 15-30 sn.`,
      viral_sebebi: `Özgünlük ve şeffaflık güven inşa eder. BTS içerikler kayıt oranını 2.4x artırır çünkü insanlar sırları sever.`,
      muzik_trendi: topMusic[0]||"Lo-fi kitchen vibes",
      ilham_ig: `https://www.instagram.com/explore/tags/kitchenbehindthescenes/`,
      ilham_google: `restaurant behind the scenes viral reel`,
      ilham_tiktok: `mutfak arkası ${cat}`,
    },
    {
      baslik: `${top2.views.toLocaleString()} İzleme Alan Format #2`,
      konsept: `İkinci en viral video: "${top2.description?.slice(0,70)||"İçerik"}". Bu formatı başka bir ürün veya günle tekrarla. Aynı tempo ve kapanış formülü.`,
      cekim_tarzi: `${top2.description?.toLowerCase().includes("yakın")||top2.views>30000?"Yakın plan ağırlıklı, renk doygunluğu yüksek":"Geniş açı → yakın plan geçiş"}.`,
      viral_sebebi: `Bu format da kanıtlanmış — ${top2.views.toLocaleString()} görüntülenme. Farklı ürünle tekrar çalışma ihtimali yüksek.`,
      muzik_trendi: topMusic[1]||topMusic[0]||"Trending beat",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[2]||catTags[0]}/`,
      ilham_google: `${concept} second best reel format`,
      ilham_tiktok: topTags[1]||catTags[1]||catTags[0],
    },
    {
      baslik: `Trend Ses ile Beat Sync`,
      konsept: `"${topMusic[0]||"trend ses"}" müziği ${data.filter(r=>r.music===topMusic[0]).length} videoda kullanıldı ve bu hesapta en iyi performans verdi. Bu sesi "${kw(4)}" ürün görüntüleriyle beat'e tam senkronize çek.`,
      cekim_tarzi: `Her beat düşüşünde yeni kare. 6-10 hızlı kesim. Renk: sıcak tonlar. Aspect: 9:16 tam dolu.`,
      viral_sebebi: `Trend sesler Instagram keşfet algoritmasına %40-60 daha yüksek erişim sağlar. Müzik tanınırlığı izlemeyi tamamlatır.`,
      muzik_trendi: topMusic[0]||"Viral trending",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[0]}/`,
      ilham_google: `beat sync food reel ${topMusic[0]||"trending"}`,
      ilham_tiktok: `beat sync ${catTags[0]}`,
    },
    {
      baslik: `Önce/Sonra Dönüşüm`,
      konsept: `"${kw(4)}" — ham malzeme veya pişmemiş hal → bitmiş, servise hazır ürün. Dramatik dönüşüm. Yarım ekran split veya ardışık.`,
      cekim_tarzi: `Sol: ham/çiğ. Sağ: pişmiş/sunulmuş. Aynı kamera açısı zorunlu. Geçişte ses efekti. 8-12 sn.`,
      viral_sebebi: `Before/after formatı kaydedilme oranı sektörde %3.1 (ortalama %1.2'nin 2.6x'i). "Transformation" içerikler algoritma favorisi.`,
      muzik_trendi: topMusic[2]||topMusic[0]||"Dramatic reveal sound",
      ilham_ig: `https://www.instagram.com/explore/tags/foodtransformation/`,
      ilham_google: `before after food transformation reel`,
      ilham_tiktok: `önce sonra yemek ${cat}`,
    },
    {
      baslik: `"${avgViews.toLocaleString()} İzleme Ortalamasını Kır" İçeriği`,
      konsept: `Bu hesabın ortalama izlenmesi ${avgViews.toLocaleString()}. Ortalamayı kıracak kanca: ilk 2 saniyede "hiç görmediğin" bir görüntü. "${kw(5)}" için en alışılmadık çekim açısını bul.`,
      cekim_tarzi: `Alışılmadık açı: tavandan, camın içinden, ürünün içinden. Retro/film grain filtre. Ses: doğal ortam sesi.`,
      viral_sebebi: `Beklenmedik görsel kanca izleme tamamlama oranını %60+ artırır. Algoritma için en kritik sinyal bu.`,
      muzik_trendi: topMusic[3]||topMusic[0]||"Unexpected viral sound",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[3]||catTags[0]}/`,
      ilham_google: `unique angle food reel viral`,
      ilham_tiktok: `unexpected food reel hook ${cat}`,
    },
    {
      baslik: `Kaydettiren Tarif / Teknik`,
      konsept: `En çok kaydedilen içerik ${(highSave?.saves||0).toLocaleString()} kayıt aldı. "${highSave?.description?.slice(0,60)||"tarif formatı"}". "${kw(6)}" için pratik bir teknik veya yapım aşaması adım adım göster.`,
      cekim_tarzi: `Adım adım: 1-malzeme, 2-hazırlık, 3-pişirme, 4-sunum. Her adımda yazı overlay. Alt yazı olsun. 20-30 sn.`,
      viral_sebebi: `Tutorial içerikler %270 daha fazla kaydedilir. Kaydedilme = uzun vadeli erişim (algorithm bookmark).`,
      muzik_trendi: topMusic[1]||"Soft background lofi",
      ilham_ig: `https://www.instagram.com/explore/tags/${cat}recipe/`,
      ilham_google: `${concept} recipe tutorial reel viral`,
      ilham_tiktok: `${cat} tarif nasıl yapılır`,
    },
    {
      baslik: `Müşteri Tepkisi / POV`,
      konsept: `Sipariş geldiği an müşterinin tepkisi — gerçek, kurgulanmamış. POV: müşteri gözünden sipariş alımı ve ilk lokmayı çek (izin alarak).`,
      cekim_tarzi: `El kamerasıyla müşteri POV. İlk ısırık/yutma anı close-up. Gülümseme veya "vay" anı yakalanmalı. Kısa: 8-12 sn.`,
      viral_sebebi: `Gerçek tepkiler sosyal kanıt oluşturur. "Bunu denemem lazım" duygusunu 3x daha fazla tetikler. Yorum: "neresi bu?"`,
      muzik_trendi: topMusic[0]||"Happy upbeat",
      ilham_ig: `https://www.instagram.com/explore/tags/foodreaction/`,
      ilham_google: `customer reaction food reel viral`,
      ilham_tiktok: `müşteri tepkisi yemek ${cat}`,
    },
    {
      baslik: `Altın Saat Estetik Çekim`,
      konsept: `"${kw(7)}" — gün batımı veya sabah 6-8 arası doğal ışıkta çekim. Hiç renk filtresi kullanma. Altın ışığın bu ürünü nasıl yaktığını göster.`,
      cekim_tarzi: `Sabah veya akşam golden hour. Pencere yanı veya dışarısı. Tripod yok, hafif el titremesi. Warm tone, hiç cold filter.`,
      viral_sebebi: `Doğal ışık içerikleri yapay stüdyo ışığına göre 2x daha organik hissettiriyor. "Keşke gitsem" etkisi yaratır.`,
      muzik_trendi: topMusic[2]||"Aesthetic lofi warm",
      ilham_ig: `https://www.instagram.com/explore/tags/goldenhour${cat}/`,
      ilham_google: `golden hour food photography reel`,
      ilham_tiktok: `altın saat yemek estetik ${catTags[0]}`,
    },
    {
      baslik: `Rakip Analizi: ${top3.views.toLocaleString()} İzleme Alan Format #3`,
      konsept: `Üçüncü en viral video: "${top3.description?.slice(0,70)||"İçerik"}". "${kw(8)}" ile bu formatı farklı bir ürün veya mevsimsel içerikle uygula.`,
      cekim_tarzi: `Top 3 videonun ortak unsurlarını tespit et: ${topMusic[0]?"Müzik: "+topMusic[0]+", ":""}${topTags[0]||catTags[0]} hashtag. Bu formülü koru.`,
      viral_sebebi: `Üçüncü en iyi format hala güçlü sinyal — ${top3.views.toLocaleString()} görüntülenme. Farklı içerikle test etmeye değer.`,
      muzik_trendi: topMusic[2]||topMusic[0]||"Viral trending ses",
      ilham_ig: `https://www.instagram.com/explore/tags/${catTags[1]||catTags[0]}/`,
      ilham_google: `${kw(8)} top format reel viral`,
      ilham_tiktok: topTags[2]||catTags[2]||catTags[0],
    },
  ];

  // Rotate pool by seed → different 5 ideas each time
  const rotated = [...pool.slice(seed), ...pool.slice(0, seed)];
  return rotated.slice(0, 5);
}

// ── CLAUDE API ────────────────────────────────────────────────────────────────
const CLAUDE_HEADERS = {
  "Content-Type":"application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY||"",
  "anthropic-version":"2023-06-01",
  "anthropic-dangerous-direct-browser-access":"true",
};
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:CLAUDE_HEADERS,
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,messages:[{role:"user",content:prompt}]}),
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.content?.map(b=>b.text||"").join("\n")||"";
}
async function callClaudeWithImages(textPrompt, frames) {
  const content=[...frames.map(f=>({type:"image",source:{type:"base64",media_type:f.mtype,data:f.data}})),{type:"text",text:textPrompt}];
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:CLAUDE_HEADERS,
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,messages:[{role:"user",content}]}),
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error.message);
  return data.content?.map(b=>b.text||"").join("\n")||"";
}
async function extractFrames(file, count=4) {
  return new Promise(resolve=>{
    const video=document.createElement("video"),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),url=URL.createObjectURL(file),frames=[];
    video.src=url; video.muted=true;
    video.onloadedmetadata=()=>{
      const dur=video.duration; canvas.width=480; canvas.height=Math.round(480*(video.videoHeight/video.videoWidth))||270;
      const times=Array.from({length:count},(_,i)=>Math.max(0.5,(dur/(count+1))*(i+1)));
      let done=0;
      const capture=t=>{video.currentTime=t;video.onseeked=()=>{ctx.drawImage(video,0,0,canvas.width,canvas.height);frames.push({data:canvas.toDataURL("image/jpeg",0.7).split(",")[1],mtype:"image/jpeg"});done++;done<times.length?capture(times[done]):(URL.revokeObjectURL(url),resolve(frames));};};
      capture(times[0]);
    };
    video.onerror=()=>{URL.revokeObjectURL(url);resolve([]);};
  });
}

// ── APIFY API ─────────────────────────────────────────────────────────────────
const APIFY_TOKEN = import.meta.env.VITE_APIFY_API_KEY||"";

async function searchInstagramReels(hashtags, maxResults = 4) {
  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/acts/apidojo~instagram-hashtag-scraper/runs?token=${APIFY_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hashtags: hashtags,
          resultsLimit: maxResults,
          mediaType: "reels",
        }),
      }
    );
    if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status}`);
    const runData = await runRes.json();
    const runId = runData?.data?.id;
    if (!runId) throw new Error("Run ID alınamadı");

    // Run tamamlanana kadar bekle (max 60 sn, 3 sn aralıkla)
    let status = "RUNNING";
    let waited = 0;
    while (status === "RUNNING" || status === "READY") {
      await new Promise(r => setTimeout(r, 3000));
      waited += 3;
      if (waited > 60) throw new Error("Apify timeout");
      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`
      );
      const statusData = await statusRes.json();
      status = statusData?.data?.status;
    }
    if (status !== "SUCCEEDED") throw new Error(`Run failed: ${status}`);

    const itemsRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=${maxResults}`
    );
    const items = await itemsRes.json();

    return (items || [])
      .filter(item => item?.url || item?.shortCode || item?.id)
      .map(item => ({
        url: item.url ||
             (item.shortCode ? `https://www.instagram.com/reel/${item.shortCode}/` : null) ||
             (item.id ? `https://www.instagram.com/reel/${item.id}/` : null),
        likes: item.likesCount || item.likes || 0,
        views: item.videoViewCount || item.views || 0,
        caption: (item.caption || "").slice(0, 80),
        username: item.ownerUsername || item.username || "",
      }))
      .filter(r => r.url);
  } catch (e) {
    console.error("Apify hatası:", e.message);
    return [];
  }
}

async function fetchInstagramReels(instagramHandle) {
  if(!instagramHandle||!APIFY_TOKEN) throw new Error("Instagram handle veya API key eksik");
  const handle = instagramHandle.replace("@","").trim();

  // Start the actor run
  const runRes = await fetch(`https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${APIFY_TOKEN}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      username:[handle],
      resultsLimit:20,
      proxy:{ useApifyProxy:true },
    }),
  });
  const runData = await runRes.json();
  if(!runData.data?.id) throw new Error("Apify actor başlatılamadı: "+(runData.error?.message||JSON.stringify(runData)));

  const runId = runData.data.id;

  // Poll until finished
  for(let i=0;i<30;i++){
    await new Promise(r=>setTimeout(r,4000));
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
    const statusData = await statusRes.json();
    const status = statusData.data?.status;
    if(status==="SUCCEEDED") break;
    if(status==="FAILED"||status==="ABORTED"||status==="TIMED-OUT") throw new Error("Apify run başarısız: "+status);
  }

  // Get results from dataset
  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=20`);
  const items = await dataRes.json();
  if(!Array.isArray(items)||items.length===0) throw new Error("Veri alınamadı — hesap özel veya içerik yok");

  return items.map(item=>({
    url:         item.url||item.shortCode?`https://www.instagram.com/reel/${item.shortCode}/`:"",
    views:       item.videoViewCount||item.playCount||0,
    likes:       item.likesCount||0,
    comments:    item.commentsCount||0,
    saves:       item.savesCount||0,
    music:       item.musicInfo?.originalAudioName||item.musicInfo?.artistName||"",
    hashtags:    (item.hashtags||[]).slice(0,5).join(" "),
    timestamp:   item.timestamp||"",
    description: (item.caption||"").slice(0,120),
  }));
}

async function fetchViralByCategory(category) {
  if(!APIFY_TOKEN) throw new Error("Apify token eksik");
  const hashtags = CATEGORY_HASHTAGS[category]||CATEGORY_HASHTAGS.restaurant;
  const runRes = await fetch(`https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/runs?token=${APIFY_TOKEN}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ hashtags:hashtags.slice(0,2), resultsLimit:15, proxy:{useApifyProxy:true} }),
  });
  const runData = await runRes.json();
  if(!runData.data?.id) throw new Error("Actor başlatılamadı: "+(runData.error?.message||""));
  const runId = runData.data.id;
  for(let i=0;i<25;i++){
    await new Promise(r=>setTimeout(r,4000));
    const st = (await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`)).json()).data?.status;
    if(st==="SUCCEEDED") break;
    if(st==="FAILED"||st==="ABORTED"||st==="TIMED-OUT") throw new Error("Viral fetch başarısız: "+st);
  }
  const items = await (await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${APIFY_TOKEN}&limit=20`)).json();
  if(!Array.isArray(items)||!items.length) throw new Error("Veri bulunamadı");
  return items
    .filter(item=>(item.videoViewCount||0)>5000||(item.likesCount||0)>500)
    .sort((a,b)=>((b.videoViewCount||0)+(b.likesCount||0)*10)-((a.videoViewCount||0)+(a.likesCount||0)*10))
    .slice(0,8)
    .map(item=>({
      url:      item.url||(item.shortCode?`https://www.instagram.com/reel/${item.shortCode}/`:""),
      views:    item.videoViewCount||0,
      likes:    item.likesCount||0,
      username: item.ownerUsername?"@"+item.ownerUsername:"",
      desc:     (item.caption||"").slice(0,90),
    }));
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const ICON_MAP = {
  camera:    Camera,
  calendar:  Calendar,
  mail:      Mail,
  copy:      Copy,
  sparkle:   Sparkles,
  plus:      Plus,
  trash:     Trash2,
  stock:     ChartColumn,
  check:     Check,
  warning:   AlertTriangle,
  edit:      Pencil,
  close:     X,
  analyze:   Search,
  phone:     Phone,
  lock:      Lock,
  note:      FileText,
  user:      User,
  instagram: null,
  eye:       Eye,
  eyeOff:    EyeOff,
  refresh:   RefreshCw,
  trending:  TrendingUp,
  send:      Send,
  clock:     Clock,
  checkcircle: CircleCheck,
  xcircle:   CircleX,
  archive:   Archive,
  notebook:  NotebookPen,
  chevron:   ChevronRight,
  star:      Star,
  layers:    Layers,
  message:   MessageSquare,
  users:     Users,
  dashboard: LayoutDashboard,
  share:     Share2,
  clipboard: ClipboardList,
  lightbulb: Lightbulb,
  shield:    ShieldCheck,
  megaphone: Megaphone,
};
const WA_ICON = ({size=18})=>(
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const Icon = ({name, size=18, strokeWidth=1.75})=>{
  if(name==="whatsapp") return <WA_ICON size={size}/>;
  const Comp = ICON_MAP[name];
  if(name==="instagram") return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
  if(!Comp) return null;
  return <Comp size={size} strokeWidth={strokeWidth}/>;
};

// ── BADGES ────────────────────────────────────────────────────────────────────
const StockBadge = ({stock})=>{
  const color=stock===0?"#FF3B30":stock<=3?"#FF9500":stock<=6?"#FFCC00":"#34C759";
  const label=stock===0?"KRİTİK":stock<=3?"DÜŞÜK":stock<=6?"ORTA":"YETERLİ";
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:1}}>{stock} · {label}</span>;
};
const StatusBadge = ({status})=>{
  const s=STATUS[status]||STATUS.taslak;
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700}}>{s.icon} {s.label}</span>;
};

// ── ROLE CONFIG ───────────────────────────────────────────────────────────────
const ROLES = {
  admin: { label:"Admin",         color:"#7B68EE", icon:"lock",  desc:"Tam yetki" },
  ekip:  { label:"Ekip",          color:"#34C759", icon:"user",  desc:"Onay paneli" },
  mudur: { label:"Müdür / Patron",color:"#F4A623", icon:"eye",   desc:"Salt okunur" },
};

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
const LoginScreen = ({onLogin})=>{
  const [selected, setSelected] = useState(null);
  const [pw, setPw]             = useState("");
  const [show, setShow]         = useState(false);
  const [err, setErr]           = useState(false);
  const [shake, setShake]       = useState(false);

  // Ekip ve Müdür için şifre gerekmez, sadece Admin şifre ister
  const needsPassword = selected==="admin";

  const tryLogin = ()=>{
    if(!selected) return;
    if(!needsPassword){ onLogin(selected); return; }
    const expected = PASSWORDS.admin;
    if(pw===expected){ onLogin(selected); }
    else { setErr(true); setShake(true); setTimeout(()=>{setErr(false);setShake(false);},600); }
  };

  return (
    <div style={{minHeight:"100vh",background:"#07070F",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:20}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}`}</style>
      {/* Ambient glow */}
      <div style={{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,#8B7CF614 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:400,position:"relative",zIndex:1}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:56,height:56,borderRadius:15,background:"linear-gradient(135deg,#8B7CF6 0%,#5EEAD4 100%)",marginBottom:16,boxShadow:"0 8px 24px #8B7CF630"}}>
            <Camera size={24} strokeWidth={1.8} color="#fff"/>
          </div>
          <div style={{fontSize:20,fontWeight:600,color:"#E2E2EE",letterSpacing:"-0.03em"}}>HSI Medya</div>
          <div style={{fontSize:11,color:"#28284A",marginTop:4,letterSpacing:"0.06em",textTransform:"uppercase"}}>Content Planner</div>
        </div>

        {/* Role selector */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#28284A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Rol seçin</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {Object.entries(ROLES).map(([key,r])=>(
              <button key={key} onClick={()=>{setSelected(key);setPw("");setErr(false);}} style={{background:selected===key?r.color+"18":"#0C0C1A",border:`1px solid ${selected===key?r.color+"44":"#16162A"}`,borderRadius:9,padding:"11px 8px",cursor:"pointer",transition:"all 0.15s",outline:"none"}}>
                <div style={{color:selected===key?r.color:"#2E2E50",marginBottom:5,display:"flex",justifyContent:"center"}}><Icon name={r.icon} size={16}/></div>
                <div style={{fontSize:11,fontWeight:500,color:selected===key?r.color:"#3A3A5C",letterSpacing:"-0.01em"}}>{r.label}</div>
                <div style={{fontSize:9,color:selected===key?r.color+"88":"#1E1E38",marginTop:2}}>{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Password input — only for admin */}
        {needsPassword&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:"#28284A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Şifre</div>
            <div style={{position:"relative",animation:shake?"shake 0.4s ease":undefined}}>
              <input
                type={show?"text":"password"}
                value={pw}
                onChange={e=>{setPw(e.target.value);setErr(false);}}
                onKeyDown={e=>e.key==="Enter"&&tryLogin()}
                placeholder="Admin şifresi"
                autoFocus
                style={{
                  width:"100%",boxSizing:"border-box",
                  background:"#0C0C1A",
                  border:`1px solid ${err?"#FF5A5244":selected?"#1E1E32":"#16162A"}`,
                  borderRadius:9,padding:"11px 44px 11px 14px",
                  color:"#E2E2EE",fontSize:13,outline:"none",letterSpacing:"-0.01em",
                  transition:"border-color 0.15s",
                }}
              />
              <button onClick={()=>setShow(v=>!v)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#2E2E50",padding:4}}>
                <Icon name={show?"eyeOff":"eye"} size={15}/>
              </button>
            </div>
            {err&&<div style={{color:"#FF5A52",fontSize:12,marginTop:6,display:"flex",alignItems:"center",gap:5}}><Icon name="warning" size={12}/> Yanlış şifre</div>}
          </div>
        )}

        {/* Login button */}
        <button
          onClick={tryLogin}
          disabled={!selected||(needsPassword&&!pw)}
          style={{
            width:"100%",padding:"12px",borderRadius:9,border:"none",cursor:(selected&&(!needsPassword||pw))?"pointer":"not-allowed",
            background:(selected&&(!needsPassword||pw))?`linear-gradient(135deg,${ROLES[selected]?.color||"#8B7CF6"},${ROLES[selected]?.color+"cc"||"#8B7CF6cc"})`:"#0F0F1E",
            color:(selected&&(!needsPassword||pw))?"#fff":"#2A2A48",fontSize:13,fontWeight:500,letterSpacing:"-0.01em",
            transition:"all 0.15s",
            boxShadow:(selected&&(!needsPassword||pw))?`0 4px 16px ${ROLES[selected]?.color+"30"||"#8B7CF630"}`:"none",
          }}
        >
          {selected ? `${ROLES[selected].label} olarak giriş yap` : "Giriş Yap"}
        </button>

        {/* Version */}
        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"#1A1A30"}}>HSI Medya Content Planner · Mart 2026</div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
    </div>
  );
};

// ── SURVEY PAGE (public, no login) ────────────────────────────────────────────
function SurveyPage({ venueName }) {
  const cats = [
    { key:"video",    label:"Video Kalitesi",       icon:"🎬" },
    { key:"iletisim", label:"İletişim",              icon:"💬" },
    { key:"teslimat", label:"Zamanında Teslimat",    icon:"⏰" },
    { key:"genel",    label:"Genel Memnuniyet",      icon:"⭐" },
  ];
  const [ratings, setRatings] = useState({ video:0, iletisim:0, teslimat:0, genel:0 });
  const [hover,   setHover]   = useState({ video:0, iletisim:0, teslimat:0, genel:0 });
  const [yorum,   setYorum]   = useState("");
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);
  const [err,     setErr]     = useState("");

  const filled = cats.every(c => ratings[c.key] > 0);
  const avg = filled ? (cats.reduce((a,c)=>a+ratings[c.key],0)/cats.length).toFixed(1) : null;
  const stars = n => "⭐".repeat(n)+"☆".repeat(5-n);
  const WEB3_KEY = import.meta.env.VITE_WEB3FORMS_KEY||"";

  const submit = async () => {
    if(!filled){ setErr("Lütfen tüm kategorileri puanlayın."); return; }
    setSending(true); setErr("");
    const msg = [
      `📊 PUANLAR:`,
      ...cats.map(c=>`• ${c.label}: ${stars(ratings[c.key])} (${ratings[c.key]}/5)`),
      ``,`Ortalama Puan: ${avg}/5`,
      yorum?`\n💬 YORUM:\n"${yorum}"`:"",
      `\n📅 Tarih: ${new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric"})}`,
    ].join("\n");
    try {
      if(WEB3_KEY){
        const res = await fetch("https://api.web3forms.com/submit",{
          method:"POST",
          headers:{"Content-Type":"application/json","Accept":"application/json"},
          body:JSON.stringify({ access_key:WEB3_KEY, subject:`HSI Medya Anket — ${venueName} ⭐ ${avg}/5`, from_name:`${venueName} (Anket)`, message:msg, botcheck:false }),
        });
        const data = await res.json();
        if(!data.success) throw new Error(data.message||"Gönderim başarısız");
      }
      setDone(true);
    } catch(e){ setErr("Gönderilemedi: "+e.message); }
    setSending(false);
  };

  const bg = "#080810"; const card = "#0E0E1C"; const border = "#1A1A2E";
  const accent = "#7B68EE"; const green = "#34C759";

  if(done) return (
    <div style={{minHeight:"100vh",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif",padding:20}}>
      <div style={{textAlign:"center",maxWidth:400}}>
        <div style={{fontSize:72,marginBottom:20}}>🙏</div>
        <div style={{fontSize:26,fontWeight:800,color:"#fff",marginBottom:10}}>Teşekkürler!</div>
        <div style={{fontSize:15,color:"#666",lineHeight:1.7}}>Değerlendirmeniz alındı.<br/>Görüşleriniz bizim için çok değerli.</div>
        <div style={{marginTop:20,background:green+"18",border:`1px solid ${green}33`,borderRadius:12,padding:"12px 20px",display:"inline-flex",alignItems:"center",gap:8,fontSize:13,color:green,fontWeight:700}}>
          ✅ Yanıtınız kaydedildi · Ort. {avg}/5
        </div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:bg,fontFamily:"'Inter',system-ui,sans-serif",padding:"0 0 60px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0E0E1C 0%,#131326 100%)",borderBottom:`1px solid ${border}`,padding:"22px 0 20px"}}>
        <div style={{maxWidth:580,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:44,height:44,borderRadius:13,background:"linear-gradient(135deg,#7B68EE,#48BFAB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🎬</div>
          <div>
            <div style={{fontSize:11,color:"#555",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>HSI Medya</div>
            <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>Memnuniyet Anketi</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:580,margin:"0 auto",padding:"28px 20px"}}>
        {/* Venue */}
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:accent,flexShrink:0}}/>
          <div>
            <div style={{fontSize:11,color:"#555",fontWeight:700,marginBottom:2}}>DEĞERLENDİRİLEN HİZMET</div>
            <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{venueName}</div>
          </div>
          <div style={{marginLeft:"auto",fontSize:11,color:"#444"}}>{new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"long",year:"numeric"})}</div>
        </div>

        <div style={{fontSize:13,color:"#555",marginBottom:20,lineHeight:1.6}}>Lütfen aşağıdaki her kategori için 1–5 yıldız arasında bir puan verin. Görüşleriniz hizmetimizi geliştirmemize yardımcı olur.</div>

        {/* Categories */}
        {cats.map(cat => (
          <div key={cat.key} style={{background:card,border:`1px solid ${ratings[cat.key]>0?accent+"44":border}`,borderRadius:14,padding:"16px 20px",marginBottom:12,transition:"border-color 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>{cat.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{cat.label}</div>
                  {ratings[cat.key]>0&&<div style={{fontSize:11,color:accent,fontWeight:600,marginTop:1}}>{["","Çok Kötü","Kötü","Orta","İyi","Çok İyi"][ratings[cat.key]]}</div>}
                </div>
              </div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n}
                    onMouseEnter={()=>setHover(p=>({...p,[cat.key]:n}))}
                    onMouseLeave={()=>setHover(p=>({...p,[cat.key]:0}))}
                    onClick={()=>setRatings(p=>({...p,[cat.key]:n}))}
                    style={{width:36,height:36,borderRadius:10,border:`2px solid ${(hover[cat.key]||ratings[cat.key])>=n?"#F4A623":"#1E1E30"}`,background:(hover[cat.key]||ratings[cat.key])>=n?"#F4A62322":"transparent",cursor:"pointer",fontSize:18,transition:"all 0.1s",display:"flex",alignItems:"center",justifyContent:"center"}}
                  >{(hover[cat.key]||ratings[cat.key])>=n?"⭐":"☆"}</button>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Comment */}
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"16px 20px",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:"#ccc",marginBottom:10}}>💬 Yorumunuz <span style={{color:"#444",fontWeight:400}}>(isteğe bağlı)</span></div>
          <textarea
            value={yorum} onChange={e=>setYorum(e.target.value)}
            placeholder="Hizmetimiz hakkında düşüncelerinizi paylaşın..."
            rows={4}
            style={{width:"100%",background:"#0A0A14",border:"1px solid #1E1E30",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:13,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.6}}
          />
        </div>

        {err&&<div style={{background:"#FF3B3018",border:"1px solid #FF3B3033",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#FF3B30",marginBottom:16}}>{err}</div>}
        {!WEB3_KEY&&<div style={{background:"#FF950012",border:"1px solid #FF950033",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#FF9500",marginBottom:16}}>⚠️ Web3Forms API key ayarlanmamış — gönderim e-posta bildirimi olmadan çalışır.</div>}

        <button onClick={submit} disabled={sending||!filled}
          style={{width:"100%",padding:"16px",background:filled?"linear-gradient(135deg,#7B68EE,#48BFAB)":"#1A1A2E",border:"none",borderRadius:14,color:filled?"#fff":"#444",fontSize:15,fontWeight:800,cursor:filled?"pointer":"not-allowed",transition:"all 0.2s",letterSpacing:"0.02em"}}>
          {sending?"Gönderiliyor...":filled?`Değerlendirmeyi Gönder · ⭐ ${avg}/5`:"Tüm kategorileri puanlayın"}
        </button>
        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#333"}}>HSI Medya · Güvenli form · Yanıtınız ekibimize iletilir</div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const [role,setRole]                   = useState(null);
  const ls = (key,def)=>{ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):def; }catch{ return def; } };
  const [venues,setVenuesRaw]            = useState(()=>{
    const saved=ls("hsi_venues",null);
    if(!saved) return INITIAL_VENUES;
    // Kasıtlı silinen mekan ID'lerini oku
    const deletedIds=new Set(ls("hsi_deleted_ids",[]));
    // Sadece daha önce hiç görülmemiş (silinmemiş) yeni mekanları ekle
    const savedIds=new Set(saved.map(v=>v.id));
    const yeni=INITIAL_VENUES.filter(v=>!savedIds.has(v.id)&&!deletedIds.has(v.id));
    return yeni.length?[...saved,...yeni]:saved;
  });
  const [activeTab,setActiveTab]         = useState("onay");
  const [selectedVenue,setSelectedVenue] = useState(null);
  const [addModal,setAddModal]           = useState(false);
  const [editVenue,setEditVenue]         = useState(null);
  const [schedule,setScheduleRaw]        = useState(()=>ls("hsi_schedule",{}));
  const [loading,setLoading]             = useState({});
  const [copied,setCopied]               = useState(null);
  const [toast,setToast]                 = useState(null);
  const [mudurNotu,setMudurNotuRaw]      = useState(()=>ls("hsi_mudurNotu",""));
  const [isMobile,setIsMobile]           = useState(()=>window.innerWidth<700);

  const setVenues    = v=>setVenuesRaw(v);
  const setSchedule  = v=>setScheduleRaw(v);
  const setMudurNotu = v=>setMudurNotuRaw(v);

  // Supabase sync kontrol ref'leri
  const supaReadyRef  = useRef(false);   // ilk yükleme bitti mi
  const lastWriteRef  = useRef({});      // kendi yazdığımız değerleri takip et (realtime'da geri gelmesin)

  // ── OTOMATİK KAYIT (localStorage + Supabase) ─────────────────────────────────
  useEffect(()=>{
    try{ localStorage.setItem("hsi_venues", JSON.stringify(venues)); }catch{}
    if(!supaReadyRef.current) return;
    lastWriteRef.current.venues=JSON.stringify(venues);
    _supaSet("venues", venues);
  },[venues]);
  useEffect(()=>{
    try{ localStorage.setItem("hsi_schedule", JSON.stringify(schedule)); }catch{}
    if(!supaReadyRef.current) return;
    lastWriteRef.current.schedule=JSON.stringify(schedule);
    _supaSet("schedule", schedule);
  },[schedule]);
  useEffect(()=>{
    try{ localStorage.setItem("hsi_mudurNotu", JSON.stringify(mudurNotu)); }catch{}
    if(!supaReadyRef.current) return;
    lastWriteRef.current.mudur_notu=JSON.stringify(mudurNotu);
    _supaSet("mudur_notu", mudurNotu);
  },[mudurNotu]);

  // ── SUPABASE'DEN İLK YÜKLEME ─────────────────────────────────────────────────
  useEffect(()=>{
    if(!_supa){ supaReadyRef.current=true; return; }
    (async()=>{
      try{
        const {data} = await _supa.from("app_state").select("key,value");
        if(data?.length){
          const m=Object.fromEntries(data.map(r=>[r.key,r.value]));
          if(m.venues?.length){
            const localDel = new Set(ls("hsi_deleted_ids",[]));
            const supaDel  = new Set(m.deleted_venue_ids||[]);
            const allDel   = new Set([...localDel,...supaDel]);
            const supaIds  = new Set(m.venues.map(v=>v.id));
            const toAdd    = INITIAL_VENUES.filter(v=>!supaIds.has(v.id)&&!allDel.has(v.id));
            setVenuesRaw(toAdd.length?[...m.venues,...toAdd]:m.venues);
          }
          if(m.schedule)          setScheduleRaw(m.schedule);
          if(m.mudur_notu!=null)  setMudurNotuRaw(m.mudur_notu);
        }
      }catch(e){ console.error("Supabase yüklenemedi:",e); }
      supaReadyRef.current=true;
    })();
  },[]);

  // ── SUPABASE REALTIME (diğer cihazlardan gelen değişiklikler) ─────────────────
  useEffect(()=>{
    if(!_supa) return;
    const ch=_supa.channel("app_state_rt")
      .on("postgres_changes",{event:"*",schema:"public",table:"app_state"},(payload)=>{
        const {key,value}=payload.new||{};
        if(!key||!value) return;
        if(lastWriteRef.current[key]===JSON.stringify(value)) return; // kendi yazdığımız, yoksay
        if(key==="venues")     setVenuesRaw(value);
        if(key==="schedule")   setScheduleRaw(value);
        if(key==="mudur_notu") setMudurNotuRaw(value);
      })
      .subscribe();
    return ()=>{ _supa.removeChannel(ch); };
  },[]);
  const weekDates = getWeekDates();

  useEffect(()=>{
    const onResize=()=>setIsMobile(window.innerWidth<700);
    window.addEventListener("resize",onResize);
    return ()=>window.removeEventListener("resize",onResize);
  },[]);

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const updateVenue=(id,patch)=>setVenues(prev=>prev.map(v=>v.id===id?{...v,...patch}:v));

  // ── SUPABASE STOK SYNC ────────────────────────────────────────────────────────
  const SUPA_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  useEffect(()=>{
    if(!SUPA_URL||!SUPA_KEY) return; // Supabase tanımlı değilse atla
    fetch(`${SUPA_URL}/rest/v1/venues?select=name,stock`,{
      headers:{"apikey":SUPA_KEY,"Authorization":`Bearer ${SUPA_KEY}`}
    })
    .then(r=>r.ok?r.json():null)
    .then(rows=>{
      if(!rows||!rows.length) return;
      setVenues(prev=>prev.map(v=>{
        const row=rows.find(r=>r.name.trim().toLowerCase()===v.name.trim().toLowerCase());
        return row?{...v,stock:row.stock}:v;
      }));
    })
    .catch(()=>{}); // sessiz hata — offline ise localStorage kullan
  },[]);

  const generateSchedule=()=>{
    // Stok sırasına göre: önce düşük stoklu mekanlar, sıfır stoklu dahil
    const sorted=[...venues].sort((a,b)=>a.stock-b.stock);
    const ns={};
    let idx=0;
    DAYS.forEach(day=>{
      ns[day]=[];
      // Günde max 2 mekan
      for(let i=0;i<2;i++){
        if(sorted[idx]){
          ns[day].push({venueId:sorted[idx].id,status:"taslak",note:"",ekipNotu:""});
          idx++;
        }
      }
    });
    setSchedule(ns);
    const toplam=Object.values(ns).flat().length;
    showToast(`Program oluşturuldu — ${toplam} mekan, günde max 2`);
  };

  useEffect(()=>{if(Object.keys(schedule).length===0)generateSchedule();},[]);

  const updateSlotStatus=(day,venueId,status)=>setSchedule(prev=>({...prev,[day]:prev[day].map(s=>s.venueId===venueId?{...s,status}:s)}));
  const updateSlotField =(day,venueId,field,val)=>setSchedule(prev=>({...prev,[day]:prev[day].map(s=>s.venueId===venueId?{...s,[field]:val}:s)}));
  const swapVenueInSlot =(day,venueId,newId)=>setSchedule(prev=>({...prev,[day]:newId===""?prev[day].filter(s=>s.venueId!==venueId):prev[day].map(s=>s.venueId===venueId?{...s,venueId:parseInt(newId),status:"taslak",note:"",ekipNotu:""}:s)}));
  const addVenueToDay  =(day,venueId)=>{const id=parseInt(venueId);if(!id)return;setSchedule(prev=>{const exist=(prev[day]||[]).some(s=>s.venueId===id);if(exist)return prev;return{...prev,[day]:[...(prev[day]||[]),{venueId:id,status:"taslak",ideas:[],ekipFikirleri:[],note:"",ekipNotu:"",secilenIcerikler:[],icerikGonderildi:false,gonderilenIcerik:"",icerikOnaylandi:false}]};});};
  const removeVenueFromDay=(day,venueId)=>setSchedule(prev=>({...prev,[day]:(prev[day]||[]).filter(s=>s.venueId!==venueId)}));

  const allSlots    = Object.values(schedule).flat();
  const confirmed   = allSlots.filter(s=>s.status==="kesinlesti").length;
  const approved    = allSlots.filter(s=>s.status==="onaylandi").length;
  const postponed   = allSlots.filter(s=>s.status==="ertelendi").length;
  const total       = allSlots.length;
  const readyToSend = total>0&&allSlots.every(s=>s.status==="kesinlesti"||s.status==="onaylandi");

  const buildScheduleMessage=()=>{
    const lines=["📅 *HAFTALIK ÇEKİM PROGRAMI*\n"];
    weekDates.forEach(({day,date})=>{
      const slots=(schedule[day]||[]).filter(s=>s.status!=="ertelendi");
      lines.push(`*${day} ${date}*`);
      slots.forEach((s,i)=>{const v=venues.find(vv=>vv.id===s.venueId);if(v)lines.push(`  ${i+1}. ${v.name} ${STATUS[s.status]?.icon||""}`)});
      lines.push("");
    });
    const low=venues.filter(v=>v.stock<=3).map(v=>`⚠️ ${v.name}: ${v.stock} video`);
    if(low.length){lines.push("*⚠️ DÜŞÜK STOK*");low.forEach(l=>lines.push(l));}
    lines.push("\n_hsi medya_");
    return lines.join("\n");
  };

  const buildVenueWAMessage=(venue,day,date)=>
    `Merhaba ${venue.name}! 👋\n\nHSI Medya olarak *${day} ${date}* tarihinde çekim yapmak istiyoruz.\n\nUygun olur mu? 🎬\n\n_HSI Medya Ekibi_`;

  const lowStockVenues=venues.filter(v=>v.stock<=3);
  const scheduleMsg=buildScheduleMessage();

  // ── STYLES ────────────────────────────────────────────────────────────────────
  const s={
    app:     {minHeight:"100vh",background:"#07070F",color:"#E2E2EE",fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:isMobile?"column":"row"},
    sidebar: isMobile
      ? {display:"none"}
      : {width:232,background:"#0A0A14",borderRight:"1px solid #13132200",padding:"20px 0 20px",display:"flex",flexDirection:"column",flexShrink:0,boxShadow:"1px 0 0 0 #161628"},
    navItem: (a)=>({display:"flex",alignItems:"center",gap:10,padding:"9px 18px 9px 20px",cursor:"pointer",color:a?"#E2E2EE":"#3A3A5C",background:a?"#13132A":"transparent",borderLeft:`2px solid ${a?"#8B7CF6":"transparent"}`,fontSize:13,fontWeight:a?500:400,transition:"all 0.12s",userSelect:"none",letterSpacing:"-0.01em"}),
    main:    {flex:1,overflow:"auto",padding:isMobile?16:32,paddingBottom:isMobile?80:32},
    btn:     (v="primary")=>({display:"inline-flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:7,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,transition:"all 0.12s",letterSpacing:"-0.01em",
      ...(v==="primary"?{background:"#8B7CF6",color:"#fff",boxShadow:"0 1px 8px #8B7CF633"}:
          v==="ghost"  ?{background:"transparent",color:"#525270",border:"1px solid #1E1E32"}:
          v==="danger" ?{background:"#FF3B3012",color:"#FF5A52",border:"1px solid #FF3B3028"}:
          v==="success"?{background:"#34C75912",color:"#3DD66A",border:"1px solid #34C75928"}:
          v==="warn"   ?{background:"#FF950012",color:"#FFB340",border:"1px solid #FF950028"}:
          v==="purple" ?{background:"#8B7CF612",color:"#A98EFF",border:"1px solid #8B7CF628"}:
          v==="apify"  ?{background:"linear-gradient(135deg,#FF6B35,#FF9500)",color:"#fff",boxShadow:"0 2px 12px #FF6B3540"}:
                        {background:"#0F0F1E",color:"#8888AA",border:"1px solid #1A1A2A"})
    }),
    input:  {background:"#0C0C1A",border:"1px solid #1C1C2E",borderRadius:7,padding:"8px 12px",color:"#E2E2EE",fontSize:13,width:"100%",outline:"none",letterSpacing:"-0.01em"},
    card:   (color)=>({background:"#0C0C1A",border:"1px solid #161626",borderRadius:10,padding:18,cursor:"pointer",transition:"all 0.12s",borderTop:`2px solid ${color}`}),
  };

  // ── VENUE MODAL ───────────────────────────────────────────────────────────────
  const VenueModal=({venue,onClose})=>{
    const [section,setSection]     = useState("intro");
    const [editConcept,setEdit]    = useState(false);
    const [conceptVal,setConceptV] = useState(venue.concept);
    const [newLink,setNewLink]     = useState("");
    const [newDesc,setNewDesc]     = useState("");
    const [igHandle,setIgHandle]     = useState(venue.instagram||"");
    const [igLoading,setIgLoading]   = useState(false);
    const [viralVids,setViralVids]   = useState(venue.viralInspirations||[]);
    const [viralLoad,setViralLoad]   = useState(false);

    const handleIntroUpload=(e)=>{
      const files=Array.from(e.target.files).slice(0,5-(venue.introVideos||[]).length);
      if(!files.length){showToast("Maks 5 video","error");return;}
      updateVenue(venue.id,{introVideos:[...(venue.introVideos||[]),...files.map(f=>({id:Date.now()+Math.random(),file:f,name:f.name,url:URL.createObjectURL(f)}))]});
      showToast(`${files.length} video eklendi!`);
    };
    const handleRefUpload=(e)=>{
      const files=Array.from(e.target.files);
      updateVenue(venue.id,{referenceLinks:[...(venue.referenceLinks||[]),...files.map(f=>({id:Date.now()+Math.random(),file:f,name:f.name,url:URL.createObjectURL(f),isLocal:true,desc:""}))]});
      showToast(`${files.length} referans eklendi!`);
    };
    const analyzeVenue=async()=>{
      if(!(venue.introVideos||[]).length){showToast("Önce video yükle","error");return;}
      setLoading(p=>({...p,[`a_${venue.id}`]:true}));showToast("Analiz ediliyor...");
      try{
        let allFrames=[];
        for(const v of venue.introVideos.slice(0,5)){if(v.file){const fr=await extractFrames(v.file,3);allFrames=[...allFrames,...fr];}}
        const analysis=allFrames.length>0
          ?await callClaudeWithImages(`Bu videolar bir restorana ait. Analiz et: 1)Mutfak türü 2)Öne çıkan yemekler 3)Mekan estetiği 4)Hedef kitle 5)Çekim tarzı 6)Marka kişiliği. Kısa yaz.`,allFrames)
          :await callClaude(`"${venue.name}" restoranı için genel analiz yap`);
        updateVenue(venue.id,{venueAnalysis:analysis});showToast("✅ Analiz tamamlandı!");
      }catch(e){showToast(`Hata: ${e.message}`,"error");}
      setLoading(p=>({...p,[`a_${venue.id}`]:false}));
    };

    const fetchIG=async()=>{
      if(!igHandle){showToast("Instagram kullanıcı adı gir","error");return;}
      updateVenue(venue.id,{instagram:igHandle});
      setIgLoading(true);showToast("Instagram verisi çekiliyor... (~60sn)");
      try{
        const data=await fetchInstagramReels(igHandle);
        updateVenue(venue.id,{instagramData:data,instagram:igHandle});
        showToast(`✅ ${data.length} Reels verisi alındı!`);
        setSection("instagram");
      }catch(e){showToast(`Apify hata: ${e.message}`,"error");}
      setIgLoading(false);
    };

    const fetchViral=async()=>{
      setViralLoad(true);
      try{
        const cat=detectCategory(venue);
        const data=await fetchViralByCategory(cat);
        setViralVids(data);
        updateVenue(venue.id,{viralInspirations:data});
        showToast(`✅ ${data.length} viral video bulundu!`);
      }catch(e){showToast(`Viral fetch hata: ${e.message}`,"error");}
      setViralLoad(false);
    };

    const generateIdeas=async()=>{
      setLoading(p=>({...p,[venue.id]:true}));
      try{
        if(venue.instagramData?.length){
          const ideas=generateIdeasFromInstagram(venue);
          updateVenue(venue.id,{ideas});
          showToast(`✅ ${ideas.length} fikir Instagram verisinden üretildi!`);
        } else {
          const ctx=venue.venueAnalysis?`\nMekan analizi:\n${venue.venueAnalysis}`:venue.concept?`\nKonsept: ${venue.concept}`:"";
          const result=await callClaude(`"${venue.name}" için viral Instagram Reels fikirleri üret.${ctx}\n\nKural: Restorana uygun içerik üret.\n\n5 fikir, SADECE JSON:\n[{"baslik":"","konsept":"","cekim_tarzi":"","viral_sebebi":"","muzik_trendi":"","ilham_google":"","ilham_tiktok":"","ilham_youtube":"","instagram_hashtags":["","",""]}]\nAçıklamalar Türkçe, ilham_* ve instagram_hashtags İngilizce. instagram_hashtags: bu fikre uygun Instagram'da viral 3 hashtag (# işareti olmadan, küçük harf).`);
          let parsed=[];
          try{parsed=JSON.parse(result.replace(/```json|```/g,"").trim());}catch{parsed=[{baslik:"Sonuç",konsept:result,cekim_tarzi:"",viral_sebebi:"",muzik_trendi:"",ilham_google:"",ilham_tiktok:"",ilham_youtube:"",instagram_hashtags:[]}];}
          showToast("Instagram'da viral videolar aranıyor...", "info");
          const allHashtags=[...new Set(parsed.flatMap(idea=>idea.instagram_hashtags||[]))];
          const allReels=allHashtags.length>0?await searchInstagramReels(allHashtags,20):[];
          const ideasWithReels=parsed.map(idea=>{
            const tags=idea.instagram_hashtags||[];
            const matching=allReels.filter(reel=>
              tags.some(tag=>(reel.caption||"").toLowerCase().includes(tag))
            ).slice(0,4);
            return{...idea,instagramReels:matching.length>0?matching:allReels.slice(0,2)};
          });
          updateVenue(venue.id,{ideas:ideasWithReels});showToast(`${ideasWithReels.length} fikir + Instagram Reels linkleri hazır!`);
        }
      }catch(e){showToast(`Hata: ${e.message}`,"error");}
      setLoading(p=>({...p,[venue.id]:false}));
    };

    const tabs=[{id:"intro",label:"📹 Tanıtım"},{id:"refs",label:"🔗 Referans"},{id:"instagram",label:"📊 Instagram"},{id:"ideas",label:"✨ Fikirler"}];
    return (
      <div className="modal-backdrop" style={{position:"fixed",inset:0,background:"#000c",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
        <div className="modal-slide" style={{background:"#0E0E1C",border:"1px solid #1E1E30",borderRadius:16,maxWidth:700,width:"100%",maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
          {/* Header */}
          <div style={{padding:"18px 22px",borderBottom:"1px solid #1A1A2E",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <div style={{width:11,height:11,borderRadius:"50%",background:venue.color}}/>
                <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{venue.name}</div>
                <StockBadge stock={venue.stock}/>
                {venue.instagramData&&<span style={{fontSize:10,background:"#E1306C18",color:"#E1306C",border:"1px solid #E1306C33",borderRadius:10,padding:"2px 7px",fontWeight:700}}>📊 IG Verisi Var</span>}
              </div>
              {editConcept
                ?<div style={{display:"flex",gap:8}}><input value={conceptVal} onChange={e=>setConceptV(e.target.value)} style={{...s.input,fontSize:12}}/><button onClick={()=>{updateVenue(venue.id,{concept:conceptVal});setEdit(false);showToast("Güncellendi");}} style={{...s.btn("success"),padding:"6px 10px",flexShrink:0}}><Icon name="check" size={12}/></button></div>
                :<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:"#555"}}>{venue.concept||"Konsept yok — video yükle"}</span><button onClick={()=>setEdit(true)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",padding:2}}><Icon name="edit" size={12}/></button></div>}
            </div>
            <button onClick={onClose} style={{...s.btn("ghost"),padding:"6px 10px"}}><Icon name="close" size={13}/></button>
          </div>

          {/* Meta row */}
          <div style={{padding:"8px 22px",borderBottom:"1px solid #1A1A2E",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"#555"}}>Stok:</span>
              <input type="number" min={0} value={venue.stock} onChange={e=>{const n=parseInt(e.target.value);if(!isNaN(n)&&n>=0)updateVenue(venue.id,{stock:n});}} style={{...s.input,width:60,padding:"4px 8px"}}/>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:180}}>
              <Icon name="phone" size={13}/>
              <input type="tel" value={venue.phone||""} onChange={e=>updateVenue(venue.id,{phone:e.target.value})} placeholder="905XXXXXXXXX" style={{...s.input,padding:"4px 8px"}}/>
            </div>
            {/* Instagram handle + fetch */}
            <div style={{display:"flex",alignItems:"center",gap:6,flex:1,minWidth:220}}>
              <Icon name="instagram" size={13}/>
              <input value={igHandle} onChange={e=>setIgHandle(e.target.value)} placeholder="@instagram_hesabi" style={{...s.input,padding:"4px 8px"}}/>
              <button onClick={fetchIG} disabled={igLoading||!igHandle} style={{...s.btn("apify"),padding:"4px 10px",flexShrink:0,fontSize:11}}>
                {igLoading?<><span style={{display:"inline-block",width:10,height:10,border:"2px solid #fff4",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/> Çekiyor...</>:<><Icon name="trending" size={12}/> Çek</>}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:"1px solid #1A1A2E",padding:"0 22px"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setSection(t.id)} style={{background:"none",border:"none",padding:"11px 14px",cursor:"pointer",fontSize:12,fontWeight:section===t.id?700:400,color:section===t.id?"#7B68EE":"#555",borderBottom:`2px solid ${section===t.id?"#7B68EE":"transparent"}`}}>{t.label}</button>)}
          </div>

          {/* Body */}
          <div style={{flex:1,overflow:"auto",padding:22}}>

            {/* INTRO */}
            {section==="intro"&&<div>
              <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:14}}>3-5 video yükle → AI analiz ederek konsepti öğrenir</div>
              {(venue.introVideos||[]).length<5&&<label style={{display:"block",background:"#0C0C18",border:"2px dashed #1E1E30",borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",marginBottom:12}}><div style={{fontSize:28,marginBottom:6}}>🎬</div><div style={{fontSize:13,color:"#7B68EE",fontWeight:700,marginBottom:3}}>Tanıtım Videoları Yükle</div><div style={{fontSize:11,color:"#444"}}>Maks 5 video</div><input type="file" accept="video/*" multiple onChange={handleIntroUpload} style={{display:"none"}}/></label>}
              {(venue.introVideos||[]).map((v,i)=><div key={i} style={{background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:8,padding:"8px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:18}}>🎬</div><div style={{flex:1,fontSize:12,fontWeight:600,color:"#34C759"}}>{v.name}</div><button onClick={()=>updateVenue(venue.id,{introVideos:venue.introVideos.filter((_,ii)=>ii!==i)})} style={{...s.btn("danger"),padding:"4px 8px"}}><Icon name="trash" size={12}/></button></div>)}
              {(venue.introVideos||[]).length>0&&<div style={{marginTop:12}}>
                <button onClick={analyzeVenue} disabled={loading[`a_${venue.id}`]} style={s.btn(venue.venueAnalysis?"ghost":"primary")}><Icon name="analyze" size={14}/>{loading[`a_${venue.id}`]?"Analiz ediliyor...":venue.venueAnalysis?"Yeniden Analiz":"🔍 AI ile Analiz Et"}</button>
                {venue.venueAnalysis&&<div style={{background:"#0C0C18",border:"1px solid #34C75933",borderLeft:"3px solid #34C759",borderRadius:8,padding:14,marginTop:10}}><div style={{fontSize:10,fontWeight:700,color:"#34C759",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>✅ AI Bu Mekanı Tanıyor</div><div style={{fontSize:12,color:"#bbb",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{venue.venueAnalysis}</div></div>}
              </div>}
            </div>}

            {/* REFS */}
            {section==="refs"&&<div>
              <label style={{display:"block",background:"#0C0C18",border:"2px dashed #1E1E30",borderRadius:10,padding:18,textAlign:"center",cursor:"pointer",marginBottom:12}}><div style={{fontSize:24,marginBottom:4}}>⬆️</div><div style={{fontSize:13,color:"#7B68EE",fontWeight:700}}>Viral Video Yükle</div><div style={{fontSize:11,color:"#444"}}>İndirdiğin Instagram/TikTok videoları</div><input type="file" accept="video/*" multiple onChange={handleRefUpload} style={{display:"none"}}/></label>
              <div style={{background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:10,padding:14,marginBottom:12}}>
                <input value={newLink} onChange={e=>setNewLink(e.target.value)} placeholder="Link..." style={{...s.input,marginBottom:8}}/><input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="İçerik açıklaması..." style={{...s.input,marginBottom:8}}/><button onClick={()=>{if(!newLink.trim())return;updateVenue(venue.id,{referenceLinks:[...(venue.referenceLinks||[]),{id:Date.now(),url:newLink.trim(),desc:newDesc.trim()}]});setNewLink("");setNewDesc("");}} style={s.btn()}><Icon name="plus" size={14}/> Ekle</button>
              </div>
              {(venue.referenceLinks||[]).map((ref,i)=><div key={i} style={{background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:8,padding:"8px 12px",marginBottom:6,display:"flex",gap:10,alignItems:"center"}}><div style={{fontSize:16}}>{ref.isLocal?"🎬":"🔗"}</div><div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12,fontWeight:600,color:ref.isLocal?"#34C759":"#7B68EE",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ref.isLocal?ref.name:ref.url}</div>{ref.desc&&<div style={{fontSize:11,color:"#555",marginTop:2}}>{ref.desc}</div>}</div><button onClick={()=>updateVenue(venue.id,{referenceLinks:(venue.referenceLinks||[]).filter((_,ii)=>ii!==i)})} style={{...s.btn("danger"),padding:"4px 8px"}}><Icon name="trash" size={12}/></button></div>)}
            </div>}

            {/* INSTAGRAM DATA */}
            {section==="instagram"&&<div>
              {!venue.instagramData&&<div>
                <div style={{background:"#0C0C18",border:"1px solid #E1306C22",borderRadius:10,padding:24,textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:10}}>📊</div>
                  <div style={{fontSize:14,fontWeight:700,color:"#E1306C",marginBottom:6}}>Instagram Reels Analizi</div>
                  <div style={{fontSize:12,color:"#555",lineHeight:1.6,marginBottom:16}}>Hesabın son 20 Reels'ini Apify ile çek → görüntülenme, müzik, hashtag verileri AI'ın fikir üretimine dahil olur</div>
                  <div style={{fontSize:11,color:"#444"}}>Yukarıdan @instagram_hesabi gir ve <strong style={{color:"#FF6B35"}}>Çek</strong> butonuna bas</div>
                </div>
              </div>}
              {venue.instagramData&&<div>
                {/* Summary stats */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
                  {[
                    {val:venue.instagramData.length,label:"Reels",color:"#E1306C"},
                    {val:Math.max(...venue.instagramData.map(r=>r.views)).toLocaleString(),label:"Max Görüntülenme",color:"#7B68EE"},
                    {val:Math.round(venue.instagramData.reduce((a,r)=>a+r.likes,0)/venue.instagramData.length).toLocaleString(),label:"Ort. Beğeni",color:"#34C759"},
                    {val:[...new Set(venue.instagramData.map(r=>r.music).filter(Boolean))].length,label:"Farklı Müzik",color:"#FF9500"},
                  ].map((k,i)=><div key={i} style={{background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:10,padding:12,textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:k.color}}>{k.val}</div><div style={{fontSize:10,color:"#555",marginTop:2}}>{k.label}</div></div>)}
                </div>
                {/* Top reels */}
                <div style={{marginBottom:8,fontSize:11,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em"}}>En viral içerikler</div>
                {[...venue.instagramData].sort((a,b)=>b.views-a.views).slice(0,5).map((r,i)=>(
                  <div key={i} style={{background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:8,padding:"10px 14px",marginBottom:6,display:"flex",gap:12,alignItems:"center"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:"#E1306C22",border:"1px solid #E1306C33",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#E1306C",flexShrink:0}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,color:"#ddd",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.description||"—"}</div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <span style={{fontSize:10,color:"#7B68EE"}}>👁 {r.views.toLocaleString()}</span>
                        <span style={{fontSize:10,color:"#34C759"}}>❤️ {r.likes.toLocaleString()}</span>
                        {r.music&&<span style={{fontSize:10,color:"#FF9500"}}>🎵 {r.music}</span>}
                        {r.hashtags&&<span style={{fontSize:10,color:"#48BFAB"}}>{r.hashtags}</span>}
                      </div>
                    </div>
                    {r.url&&<a href={r.url} target="_blank" rel="noreferrer" style={{fontSize:10,color:"#E1306C",flexShrink:0}}>↗</a>}
                  </div>
                ))}
                <button onClick={fetchIG} disabled={igLoading} style={{...s.btn("ghost"),marginTop:8}}><Icon name="refresh" size={13}/> Yenile</button>
              </div>}
            </div>}

            {/* IDEAS */}
            {section==="ideas"&&<div>
              {!venue.concept&&<div style={{background:"#7B68EE12",border:"1px solid #7B68EE33",borderRadius:8,padding:10,fontSize:12,color:"#7B68EE",marginBottom:12}}>💡 <strong>İpucu:</strong> Yukarıdaki <em>Konsept</em> alanına virgülle ayrılmış anahtar kelimeler yaz (örn: <em>mangal, et, közlenmiş lezzet</em>) — fikirler bu kelimelere göre kişiselleşir.</div>}
              {venue.concept&&<div style={{background:"#34C75912",border:"1px solid #34C75933",borderRadius:8,padding:10,fontSize:12,color:"#34C759",marginBottom:12}}>✅ Konsept mevcut: <strong>{venue.concept}</strong> — fikirler bu temaya göre üretilecek.</div>}
              {!venue.venueAnalysis&&<div style={{background:"#FF950012",border:"1px solid #FF950033",borderRadius:8,padding:10,fontSize:12,color:"#FF9500",marginBottom:12}}>⚠️ Video analizi yapılmamış — fikirler daha az isabetli olabilir.</div>}
              {venue.instagramData&&<div style={{background:"#E1306C12",border:"1px solid #E1306C33",borderRadius:8,padding:10,fontSize:12,color:"#E1306C",marginBottom:12}}>✅ Instagram verisi mevcut — API key gerekmeden lokal analiz ile fikir üretilecek.</div>}
              {!venue.instagramData&&!venue.venueAnalysis&&<div style={{background:"#FF950012",border:"1px solid #FF950033",borderRadius:8,padding:10,fontSize:12,color:"#FF9500",marginBottom:12}}>⚠️ Instagram verisi yok — önce Instagram sekmesinden veri çek (API key gerekmez).</div>}
              <button onClick={generateIdeas} disabled={loading[venue.id]} style={{...s.btn(),marginBottom:14}}><Icon name="sparkle" size={14}/>{loading[venue.id]?"Analiz ediliyor...":(venue.ideas||[]).length>0?"Yeniden Analiz Et":venue.instagramData?"📊 Instagram'dan Viral Fikirler Üret":"AI ile Viral Fikirler Üret"}</button>
              {(venue.ideas||[]).map((idea,i)=><div key={i} style={{background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:10,padding:14,marginBottom:8,borderLeft:"3px solid #7B68EE"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:8}}><span style={{color:"#7B68EE",marginRight:6}}>#{i+1}</span>{idea.baslik}</div>
                {idea.konsept&&<div style={{fontSize:12,color:"#bbb",lineHeight:1.6,marginBottom:8}}>{idea.konsept}</div>}
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                  {idea.cekim_tarzi&&<span style={{fontSize:11,background:"#7B68EE18",color:"#9B8EFF",border:"1px solid #7B68EE33",borderRadius:6,padding:"2px 7px"}}>🎥 {idea.cekim_tarzi}</span>}
                  {idea.viral_sebebi&&<span style={{fontSize:11,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:6,padding:"2px 7px"}}>🔥 {idea.viral_sebebi}</span>}
                  {idea.muzik_trendi&&<span style={{fontSize:11,background:"#FF950018",color:"#FF9500",border:"1px solid #FF950033",borderRadius:6,padding:"2px 7px"}}>🎵 {idea.muzik_trendi}</span>}
                </div>
                {/* Apify'den gelen gerçek Instagram Reels linkleri */}
                {(idea.instagramReels || []).length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "#E1306C", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                      📍 Bu konsepte uygun gerçek viral Reels:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {idea.instagramReels.map((reel, ri) => (
                        <a key={ri} href={reel.url} target="_blank" rel="noreferrer"
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, background: "#E1306C12", border: "1px solid #E1306C33", borderRadius: 8, padding: "6px 10px", textDecoration: "none" }}>
                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#E1306C", marginBottom: 1 }}>
                              {reel.username ? `@${reel.username}` : "Instagram Reel"}
                            </div>
                            {reel.caption && (
                              <div style={{ fontSize: 9, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {reel.caption}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            {reel.views > 0 && (
                              <span style={{ fontSize: 9, color: "#aaa" }}>
                                👁 {reel.views > 1000 ? `${Math.round(reel.views / 1000)}K` : reel.views}
                              </span>
                            )}
                            {reel.likes > 0 && (
                              <span style={{ fontSize: 9, color: "#aaa" }}>
                                ❤️ {reel.likes > 1000 ? `${Math.round(reel.likes / 1000)}K` : reel.likes}
                              </span>
                            )}
                            <span style={{ fontSize: 9, color: "#E1306C", fontWeight: 700 }}>→ Aç</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apify sonuç dönmezse Instagram hashtag linki göster */}
                {(idea.instagramReels || []).length === 0 && idea.instagram_hashtags && idea.instagram_hashtags.length > 0 && (
                  <a href={`https://www.instagram.com/explore/tags/${encodeURIComponent(idea.instagram_hashtags[0])}/`}
                    target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: "#E1306C", background: "#E1306C18", border: "1px solid #E1306C33", borderRadius: 6, padding: "3px 8px", textDecoration: "none", fontWeight: 600, display: "inline-block", marginBottom: 6 }}>
                    📱 Instagram #{idea.instagram_hashtags[0]}
                  </a>
                )}

                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {idea.ilham_ig&&<a href={idea.ilham_ig} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#E1306C",background:"#E1306C18",border:"1px solid #E1306C33",borderRadius:6,padding:"3px 8px",textDecoration:"none",fontWeight:600}}>📸 Instagram Keşfet</a>}
                  {idea.ilham_google&&<a href={`https://www.google.com/search?q=${encodeURIComponent(idea.ilham_google+" instagram reels")}&tbm=vid`} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#C77EE8",background:"#C77EE818",border:"1px solid #C77EE833",borderRadius:6,padding:"3px 8px",textDecoration:"none",fontWeight:600}}>🔍 Google</a>}
                  {idea.ilham_tiktok&&<a href={`https://www.tiktok.com/search?q=${encodeURIComponent(idea.ilham_tiktok)}`} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#69C9D0",background:"#69C9D018",border:"1px solid #69C9D033",borderRadius:6,padding:"3px 8px",textDecoration:"none",fontWeight:600}}>🎵 TikTok</a>}
                </div>
              </div>)}

              {/* Dünya Viral İlhamları */}
              <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid #1A1A2E"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#E1306C",textTransform:"uppercase",letterSpacing:"0.1em"}}>🌍 Dünya Viral İlhamları</div>
                  <button onClick={fetchViral} disabled={viralLoad} style={{...s.btn("ghost"),padding:"4px 10px",fontSize:11}}>{viralLoad?"Çekiliyor (~60sn)...":"🔄 Instagram'dan Çek"}</button>
                </div>
                {viralVids.length===0&&!viralLoad&&<div style={{background:"#E1306C0A",border:"1px solid #E1306C22",borderRadius:8,padding:"12px 14px",fontSize:12,color:"#555",textAlign:"center"}}>
                  Henüz çekilmedi — "Instagram'dan Çek" ile o kategoride dünya genelinde viral olan gerçek videoları getir
                </div>}
                {viralLoad&&<div style={{background:"#E1306C0A",border:"1px solid #E1306C22",borderRadius:8,padding:"14px",fontSize:12,color:"#E1306C",textAlign:"center"}}>
                  ⏳ Instagram hashtag taraması yapılıyor (~60sn)...
                </div>}
                {viralVids.map((v,i)=>(
                  <a key={i} href={v.url} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:"#0C0C18",border:"1px solid #1A1A2E",borderRadius:8,padding:"10px 12px",marginBottom:6,textDecoration:"none",transition:"border-color 0.15s"}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#E1306C22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#E1306C",flexShrink:0}}>#{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#E1306C",marginBottom:2}}>{v.username}</div>
                      {v.desc&&<div style={{fontSize:11,color:"#555",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.desc}</div>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {v.views>0&&<div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{v.views.toLocaleString()} 👁</div>}
                      {v.likes>0&&<div style={{fontSize:10,color:"#555"}}>{v.likes.toLocaleString()} ❤️</div>}
                    </div>
                    <div style={{fontSize:10,color:"#E1306C",flexShrink:0}}>→</div>
                  </a>
                ))}
              </div>
            </div>}
          </div>
        </div>
      </div>
    );
  };

  // ── ADD VENUE MODAL ───────────────────────────────────────────────────────────
  const AddVenueModal=({onClose})=>{
    const [name,setName]=useState("");const [concept,setConcept]=useState("");const [stock,setStock]=useState(0);const [color,setColor]=useState(COLORS[0]);
    return <div className="modal-backdrop" style={{position:"fixed",inset:0,background:"#000c",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div className="modal-slide" style={{background:"#0E0E1C",border:"1px solid #1E1E30",borderRadius:16,padding:28,maxWidth:460,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:17,fontWeight:800,color:"#fff",marginBottom:20}}>Yeni Mekan Ekle</div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Mekan Adı *</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="örn: Süleyman Usta Kebap" style={s.input} autoFocus/></div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Konsept</div><input value={concept} onChange={e=>setConcept(e.target.value)} placeholder="Boş bırakabilirsin" style={s.input}/></div>
        <div style={{display:"flex",gap:16,marginBottom:20}}>
          <div><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Stok</div><input type="number" min={0} value={stock} onChange={e=>setStock(e.target.value)} style={{...s.input,width:70}}/></div>
          <div><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Renk</div><div style={{display:"flex",gap:5,flexWrap:"wrap",maxWidth:200}}>{COLORS.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:color===c?"3px solid #fff":"2px solid transparent"}}/>)}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><button onClick={()=>{if(!name.trim())return;setVenues(p=>[...p,{id:Date.now(),name:name.trim(),concept:concept.trim(),stock:parseInt(stock)||0,color,phone:"",instagram:"",introVideos:[],referenceLinks:[],venueAnalysis:"",instagramData:null,ideas:[]}]);showToast(`${name} eklendi!`);onClose();}} style={s.btn()} disabled={!name.trim()}><Icon name="plus" size={14}/> Ekle</button><button onClick={onClose} style={s.btn("ghost")}>İptal</button></div>
      </div>
    </div>;
  };

  // ── EDIT VENUE MODAL ──────────────────────────────────────────────────────────
  const EditVenueModal=({venue,onClose})=>{
    const [name,setName]=useState(venue.name);
    const [concept,setConcept]=useState(venue.concept||"");
    const [stock,setStock]=useState(venue.stock||0);
    const [phone,setPhone]=useState(venue.phone||"");
    const [color,setColor]=useState(venue.color);
    const save=()=>{
      if(!name.trim()) return;
      updateVenue(venue.id,{name:name.trim(),concept:concept.trim(),stock:parseInt(stock)||0,phone:phone.trim(),color});
      showToast(`${name.trim()} güncellendi`);
      onClose();
    };
    return(
      <div className="modal-backdrop" style={{position:"fixed",inset:0,background:"#000c",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
        <div className="modal-slide" style={{background:"#0E0E1C",border:"1px solid #1E1E30",borderRadius:16,padding:28,maxWidth:460,width:"100%"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:16,fontWeight:700,color:"#E2E2EE",marginBottom:20,display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:color}}/>{venue.name} — Düzenle</div>
          <div style={{marginBottom:12}}><div style={{fontSize:10,color:"#8B7CF6",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Mekan Adı *</div><input value={name} onChange={e=>setName(e.target.value)} style={s.input} autoFocus/></div>
          <div style={{marginBottom:12}}><div style={{fontSize:10,color:"#8B7CF6",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Konsept</div><input value={concept} onChange={e=>setConcept(e.target.value)} placeholder="Virgülle ayır: kebap, mangal, aile" style={s.input}/></div>
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            <div><div style={{fontSize:10,color:"#8B7CF6",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Stok</div><input type="number" min={0} value={stock} onChange={e=>setStock(e.target.value)} style={{...s.input,width:80}}/></div>
            <div style={{flex:1}}><div style={{fontSize:10,color:"#8B7CF6",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Telefon</div><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+90 5xx xxx xx xx" style={s.input}/></div>
          </div>
          <div style={{marginBottom:20}}><div style={{fontSize:10,color:"#8B7CF6",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Renk</div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{COLORS.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:color===c?"3px solid #fff":"2px solid transparent"}}/>)}</div></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} disabled={!name.trim()} style={s.btn()}><Icon name="check" size={14}/> Kaydet</button>
            <button onClick={onClose} style={s.btn("ghost")}>İptal</button>
          </div>
        </div>
      </div>
    );
  };

  // ── ONAY PANEL ────────────────────────────────────────────────────────────────
  const OnayPanel=()=>{
    const [noteEditing,setNoteEditing]=useState(null);
    const [noteVal,setNoteVal]=useState("");
    const [selectedIdeas,setSelectedIdeas]=useState({});
    const [ekipFikirForm,setEkipFikirForm]=useState(null); // key = "day_venueId"
    const [ekipFikirBaslik,setEkipFikirBaslik]=useState("");
    const [ekipFikirKonsept,setEkipFikirKonsept]=useState("");
    const [addPickerDay,setAddPickerDay]=useState(null);
    const [addPickerVal,setAddPickerVal]=useState("");

    const addEkipFikir=(day,venueId)=>{
      if(!ekipFikirBaslik.trim()) return;
      const newFikir={id:Date.now(),baslik:ekipFikirBaslik.trim(),konsept:ekipFikirKonsept.trim()};
      const mevcut=schedule[day]?.find(s=>s.venueId===venueId)?.ekipFikirleri||[];
      updateSlotField(day,venueId,"ekipFikirleri",[...mevcut,newFikir]);
      updateSlotField(day,venueId,"ekipFikirleriOnaylandi",false);
      setEkipFikirBaslik("");setEkipFikirKonsept("");setEkipFikirForm(null);
      showToast("Fikir eklendi — admin onayı bekleniyor");
    };
    const removeEkipFikir=(day,venueId,id)=>{
      const mevcut=schedule[day]?.find(s=>s.venueId===venueId)?.ekipFikirleri||[];
      updateSlotField(day,venueId,"ekipFikirleri",mevcut.filter(f=>f.id!==id));
    };
    return (
      <div>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:8}}>
          <div><div style={{fontSize:isMobile?20:24,fontWeight:800,color:"#fff",marginBottom:4}}>{role==="ekip"?"Onay Paneli":"Program & Onay"}</div><div style={{fontSize:13,color:"#555"}}>{role==="ekip"?"Mekanları ara, durumları güncelle":"Haftalık çekim programı · Onay takibi"}</div></div>
          {role==="admin"&&<button onClick={generateSchedule} style={s.btn("ghost")}><Icon name="sparkle" size={14}/> Yeniden Oluştur</button>}
        </div>

        {/* Müdür Notu — sadece ekip görür */}
        {role==="ekip"&&mudurNotu&&(
          <div style={{background:"#F4A62312",border:"1px solid #F4A62344",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{fontSize:20,flexShrink:0}}>📝</div>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:"#F4A623",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Müdür / Patron Notu</div>
              <div style={{fontSize:13,color:"#E8E8F0",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{mudurNotu}</div>
            </div>
          </div>
        )}

        {/* Mekan durumları özeti — sadece ekip görür */}
        {role==="ekip"&&(
          <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>Bu Haftaki Mekan Durumları</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {Object.entries(schedule).flatMap(([day,slots])=>
                slots.map(slot=>{
                  const v=venues.find(vv=>vv.id===slot.venueId);if(!v)return null;
                  const st=STATUS[slot.status]||STATUS.taslak;
                  return(
                    <div key={`${day}_${slot.venueId}`} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#0A0A14",borderRadius:8,border:"1px solid #131326"}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:v.color,flexShrink:0}}/>
                      <div style={{fontSize:12,fontWeight:600,color:"#ccc",flex:1}}>{v.name}</div>
                      <div style={{fontSize:10,color:"#444"}}>{day}</div>
                      <div style={{fontSize:10,background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:5,padding:"2px 7px",fontWeight:700}}>{st.icon} {st.label}</div>
                      {slot.note&&<div style={{fontSize:10,color:"#FF9500",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>📋 {slot.note}</div>}
                    </div>
                  );
                })
              ).filter(Boolean)}
              {Object.values(schedule).flat().length===0&&<div style={{fontSize:12,color:"#444",textAlign:"center",padding:10}}>Program henüz oluşturulmadı</div>}
            </div>
          </div>
        )}

        {/* Progress */}
        <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Onay Durumu</div>
            <div style={{fontSize:12,color:"#555"}}>{confirmed+approved} / {total} tamamlandı</div>
          </div>
          <div style={{background:"#0A0A14",borderRadius:6,height:8,overflow:"hidden",marginBottom:10}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,#7B68EE,#34C759)",width:`${total?((confirmed+approved)/total)*100:0}%`,transition:"width 0.4s",borderRadius:6}}/>
          </div>
          <div style={{display:"flex",gap:isMobile?16:12,flexWrap:"wrap"}}>
            {[["🔒",confirmed,"Kesinleşti","#7B68EE"],["✅",approved,"Onaylandı","#34C759"],["❌",postponed,"Ertelendi","#FF3B30"],["⬜",total-confirmed-approved-postponed,"Bekliyor","#444"]].map(([icon,n,label,color])=>(
              <div key={label} style={{fontSize:isMobile?13:12,color}}><span style={{fontWeight:800}}>{icon} {n}</span> <span style={{color:"#444"}}>{label}</span></div>
            ))}
          </div>
          {readyToSend&&<div style={{marginTop:10,background:"#34C75918",border:"1px solid #34C75933",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#34C759",fontWeight:600}}>✅ Tüm mekanlar onaylandı! Program gönderilebilir.</div>}
        </div>

        {/* Grid */}
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(5,1fr)",gap:isMobile?10:12}}>
          {weekDates.map(({day,date})=>{
            const slots=schedule[day]||[];
            return (
              <div key={day} style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:isMobile?12:14}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:isMobile?10:2}}>
                  <div style={{fontSize:isMobile?13:11,fontWeight:700,color:"#7B68EE",letterSpacing:"0.1em",textTransform:"uppercase"}}>{day}</div>
                  <div style={{fontSize:isMobile?12:10,color:"#555",fontWeight:isMobile?600:400}}>{date}</div>
                </div>
                {!isMobile&&<div style={{marginBottom:12}}/>}
                {slots.map((slot)=>{
                  const v=venues.find(vv=>vv.id===slot.venueId);if(!v)return null;
                  const isEditingNote=noteEditing===`${day}_${slot.venueId}`;
                  const waMsg=buildVenueWAMessage(v,day,date);
                  return (
                    <div key={slot.venueId} style={{background:"#0A0A14",border:`1px solid ${v.color}33`,borderRadius:10,padding:isMobile?12:10,marginBottom:isMobile?10:8,borderTop:`2px solid ${v.color}`}}>
                      {role==="admin"
                        ?<select value={slot.venueId} onChange={e=>swapVenueInSlot(day,slot.venueId,e.target.value)} style={{background:"#0E0E1C",border:"none",color:"#fff",fontSize:isMobile?14:12,fontWeight:700,width:"100%",marginBottom:8,cursor:"pointer",outline:"none"}}><option value="">— Hiçbiri —</option>{venues.map(vv=><option key={vv.id} value={vv.id}>{vv.name}</option>)}</select>
                        :<div style={{fontSize:isMobile?14:12,fontWeight:700,color:"#fff",marginBottom:8}}>{v.name}</div>}
                      <StockBadge stock={v.stock}/>
                      <div style={{marginTop:8,marginBottom:8}}><StatusBadge status={slot.status}/></div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:isMobile?6:4,marginBottom:8}}>
                        {[["aranıyor","📞","warn"],["onaylandi","✅","success"],["ertelendi","❌","danger"],...(role==="admin"?[["kesinlesti","🔒","purple"]]:[[]])].filter(x=>x.length).map(([st2,icon,variant])=>(
                          <button key={st2} onClick={()=>updateSlotStatus(day,slot.venueId,st2)} style={{...s.btn(slot.status===st2?variant:"ghost"),padding:isMobile?"6px 12px":"3px 7px",fontSize:isMobile?13:10,opacity:slot.status===st2?1:0.6}}>{icon} {isMobile?(st2==="aranıyor"?"Aranıyor":st2==="onaylandi"?"Onaylandı":st2==="ertelendi"?"Ertelendi":"Kesinleşti"):""}</button>
                        ))}
                      </div>
                      <a href={v.phone?`https://wa.me/${v.phone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(waMsg)}`:`https://wa.me/?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:isMobile?13:10,color:"#25D366",background:"#25D36618",border:"1px solid #25D36633",borderRadius:8,padding:isMobile?"8px 12px":"3px 7px",textDecoration:"none",fontWeight:600,marginBottom:8}}>
                        <Icon name="whatsapp" size={isMobile?14:10}/> {v.phone?"Randevu WA":"WA (numara yok)"}
                      </a>
                      <div style={{borderTop:"1px solid #16162A",paddingTop:8,marginTop:4}}>
                        {/* ── EKİP: fikir yazma formu ── */}
                        {role==="ekip"&&!slot.icerikGonderildi&&(()=>{
                          const slotKey=`${day}_${slot.venueId}`;
                          const ekipFikirleri=slot.ekipFikirleri||[];
                          const onayliEkipFikirleri=slot.ekipFikirleriOnaylandi?ekipFikirleri:[];
                          const aiFikirleri=v.ideas||[];
                          const gonderilebilir=[...aiFikirleri,...onayliEkipFikirleri];
                          return(
                            <div>
                              {/* Ekip fikir listesi */}
                              {ekipFikirleri.length>0&&(
                                <div style={{marginBottom:8}}>
                                  <div style={{fontSize:10,color:"#FF9500",fontWeight:700,marginBottom:4}}>
                                    ✍️ Senin fikirlerin {slot.ekipFikirleriOnaylandi?<span style={{color:"#34C759"}}>✅ Onaylandı</span>:<span style={{color:"#FF9500"}}>⏳ Admin onayı bekleniyor</span>}
                                  </div>
                                  {ekipFikirleri.map(f=>(
                                    <div key={f.id} style={{background:f.onaylandi?"#34C75910":"#FF950010",border:`1px solid ${f.onaylandi?"#34C75933":"#FF950033"}`,borderRadius:6,padding:"5px 8px",marginBottom:4,display:"flex",gap:6,alignItems:"flex-start"}}>
                                      <div style={{flex:1}}>
                                        <div style={{fontSize:10,fontWeight:700,color:f.onaylandi?"#3DD66A":"#FF9500"}}>{f.baslik} {f.onaylandi&&<span style={{fontWeight:400,fontSize:9}}>✅</span>}</div>
                                        {f.konsept&&<div style={{fontSize:9,color:"#888",marginTop:1,lineHeight:1.4}}>{f.konsept}</div>}
                                      </div>
                                      {!f.onaylandi&&<button onClick={()=>removeEkipFikir(day,slot.venueId,f.id)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",padding:0,flexShrink:0,fontSize:12}}>✕</button>}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Fikir ekleme formu */}
                              {ekipFikirForm===slotKey?(
                                <div style={{background:"#0A0A14",border:"1px solid #FF950033",borderRadius:8,padding:8,marginBottom:6}}>
                                  <input value={ekipFikirBaslik} onChange={e=>setEkipFikirBaslik(e.target.value)} placeholder="Fikir başlığı *" style={{...s.input,fontSize:10,padding:"5px 8px",marginBottom:4}}/>
                                  <textarea value={ekipFikirKonsept} onChange={e=>setEkipFikirKonsept(e.target.value)} placeholder="Kısa açıklama (opsiyonel)" rows={2} style={{...s.input,fontSize:10,padding:"5px 8px",resize:"none",marginBottom:6,display:"block"}}/>
                                  <div style={{display:"flex",gap:4}}>
                                    <button onClick={()=>addEkipFikir(day,slot.venueId)} disabled={!ekipFikirBaslik.trim()} style={{...s.btn("warn"),padding:"3px 8px",fontSize:10,flex:1,justifyContent:"center"}}><Icon name="check" size={10}/> Ekle</button>
                                    <button onClick={()=>{setEkipFikirForm(null);setEkipFikirBaslik("");setEkipFikirKonsept("");}} style={{...s.btn("ghost"),padding:"3px 8px",fontSize:10}}><Icon name="close" size={10}/></button>
                                  </div>
                                </div>
                              ):(
                                <button onClick={()=>{setEkipFikirForm(slotKey);setEkipFikirBaslik("");setEkipFikirKonsept("");}} style={{...s.btn("ghost"),padding:"3px 8px",fontSize:10,width:"100%",justifyContent:"center",marginBottom:6}}>✍️ Fikir Yaz</button>
                              )}
                              {/* Gönderilecek içerik seçimi (AI + onaylı ekip fikirleri) */}
                              {gonderilebilir.length>0&&(
                                <div>
                                  <div style={{fontSize:10,color:"#7B68EE",fontWeight:700,marginBottom:4}}>📋 Gönderilecek içerikleri seç:</div>
                                  {gonderilebilir.map((idea,ii)=>(
                                    <label key={ii} style={{display:"flex",alignItems:"flex-start",gap:5,marginBottom:4,cursor:"pointer"}}>
                                      <input type="checkbox" checked={(selectedIdeas[slotKey]||[]).includes(ii)} onChange={e=>{setSelectedIdeas(prev=>{const cur=prev[slotKey]||[];return{...prev,[slotKey]:e.target.checked?[...cur,ii]:cur.filter(x=>x!==ii)};});}} style={{marginTop:2,flexShrink:0}}/>
                                      <span style={{fontSize:10,color:ii>=aiFikirleri.length?"#FF9500":"#ccc",lineHeight:1.4}}>{idea.baslik}{ii>=aiFikirleri.length?" ✍️":""}</span>
                                    </label>
                                  ))}
                                  {(selectedIdeas[slotKey]||[]).length>0&&(
                                    <button onClick={()=>{
                                      const idxs=selectedIdeas[slotKey]||[];const secilen=gonderilebilir.filter((_,ii)=>idxs.includes(ii));
                                      const satirlar=secilen.map((id,n)=>[`${n+1}. *${id.baslik}*`,id.konsept,id.cekim_tarzi?`Cekim: ${id.cekim_tarzi}`:"",id.muzik_trendi?`Muzik: ${id.muzik_trendi}`:""].filter(Boolean).join("\n")).join("\n\n");
                                      const msg=`Merhaba ${v.name}!\n\nBu hafta planlanan icerik fikirleri:\n\n${satirlar}\n\nGoruslerinizi bekliyoruz!\n_HSI Medya_`;
                                      window.open(v.phone?`https://wa.me/${v.phone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`,"_blank");
                                      updateSlotField(day,slot.venueId,"icerikGonderildi",true);updateSlotField(day,slot.venueId,"gonderilenIcerik",secilen.map(id=>id.baslik).join(", "));showToast(`${v.name} için içerik gönderildi!`);
                                    }} style={{...s.btn("primary"),padding:"4px 9px",fontSize:10,width:"100%",justifyContent:"center",marginTop:4}}><Icon name="whatsapp" size={10}/> İçerikleri Gönder</button>
                                  )}
                                </div>
                              )}
                              {gonderilebilir.length===0&&ekipFikirleri.length===0&&<div style={{fontSize:10,color:"#444",fontStyle:"italic"}}>AI fikri yok — yukarıdan kendi fikirlerini yaz</div>}
                              {gonderilebilir.length===0&&ekipFikirleri.length>0&&<div style={{fontSize:10,color:"#FF9500",fontStyle:"italic"}}>Fikirler admin onayı bekleniyor…</div>}
                            </div>
                          );
                        })()}
                        {/* ── ADMİN: ekip fikirlerini görüntüle ve onayla ── */}
                        {role==="admin"&&(slot.ekipFikirleri||[]).length>0&&(
                          <div style={{background:"#FF950010",border:"1px solid #FF950033",borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                            <div style={{fontSize:10,fontWeight:700,color:"#FF9500",marginBottom:6}}>✍️ Ekip Fikirleri ({(slot.ekipFikirleri||[]).length})</div>
                            {(slot.ekipFikirleri||[]).map(f=>{
                              const toggleOnay=()=>{
                                const guncellenmis=(slot.ekipFikirleri||[]).map(x=>x.id===f.id?{...x,onaylandi:!x.onaylandi}:x);
                                updateSlotField(day,slot.venueId,"ekipFikirleri",guncellenmis);
                                updateSlotField(day,slot.venueId,"ekipFikirleriOnaylandi",guncellenmis.some(x=>x.onaylandi));
                              };
                              return(
                                <div key={f.id} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:5,background:f.onaylandi?"#34C75910":"transparent",borderRadius:5,padding:"4px 6px"}}>
                                  <button onClick={toggleOnay} style={{...s.btn(f.onaylandi?"success":"ghost"),padding:"2px 6px",fontSize:9,flexShrink:0,minWidth:52,justifyContent:"center"}}>
                                    {f.onaylandi?<><Icon name="check" size={9}/> Onaylı</>:<><Icon name="check" size={9}/> Onayla</>}
                                  </button>
                                  <div style={{flex:1,minWidth:0}}>
                                    <div style={{fontSize:10,fontWeight:700,color:f.onaylandi?"#3DD66A":"#FF9500"}}>{f.baslik}</div>
                                    {f.konsept&&<div style={{fontSize:9,color:"#555",marginTop:1}}>{f.konsept}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {slot.icerikGonderildi&&(
                          <div style={{background:"#25D36612",border:"1px solid #25D36633",borderRadius:6,padding:"6px 8px",marginBottom:6}}>
                            <div style={{fontSize:10,color:"#25D366",fontWeight:700,marginBottom:2}}>📤 İçerik gönderildi</div>
                            {slot.gonderilenIcerik&&<div style={{fontSize:10,color:"#777",lineHeight:1.4}}>{slot.gonderilenIcerik}</div>}
                            {role==="admin"&&!slot.icerikOnaylandi&&(
                              <div style={{display:"flex",gap:4,marginTop:6}}>
                                <button onClick={()=>{updateSlotField(day,slot.venueId,"icerikOnaylandi",true);showToast(`${v.name} içerik onaylandı!`);}} style={{...s.btn("success"),padding:"3px 8px",fontSize:10,flex:1,justifyContent:"center"}}><Icon name="check" size={10}/> Onayla</button>
                                <button onClick={()=>{updateSlotField(day,slot.venueId,"icerikGonderildi",false);updateSlotField(day,slot.venueId,"gonderilenIcerik","");showToast("Geri alındı.");}} style={{...s.btn("danger"),padding:"3px 8px",fontSize:10,flex:1,justifyContent:"center"}}><Icon name="close" size={10}/> Geri Al</button>
                              </div>
                            )}
                            {slot.icerikOnaylandi&&<div style={{marginTop:4,fontSize:10,color:"#7B68EE",fontWeight:700}}>🔒 Admin onayladı</div>}
                          </div>
                        )}
                        {role==="admin"&&!slot.icerikGonderildi&&(v.ideas||[]).length>0&&!(slot.ekipFikirleri||[]).length&&<div style={{fontSize:10,color:"#444",fontStyle:"italic"}}>⏳ Ekip içerik göndermedi</div>}
                        {role==="admin"&&!slot.icerikGonderildi&&(v.ideas||[]).length===0&&!(slot.ekipFikirleri||[]).length&&<div style={{fontSize:10,color:"#FF3B30",fontStyle:"italic"}}>⚠️ Fikir yok</div>}
                      </div>
                      {isEditingNote?(
                        <div style={{marginTop:6}}>
                          <input value={noteVal} onChange={e=>setNoteVal(e.target.value)} placeholder="Not ekle..." style={{...s.input,fontSize:11,padding:"4px 8px",marginBottom:4}}/>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>{updateSlotField(day,slot.venueId,role==="ekip"?"ekipNotu":"note",noteVal);setNoteEditing(null);}} style={{...s.btn("success"),padding:"3px 8px",fontSize:10}}><Icon name="check" size={10}/></button>
                            <button onClick={()=>setNoteEditing(null)} style={{...s.btn("ghost"),padding:"3px 8px",fontSize:10}}><Icon name="close" size={10}/></button>
                          </div>
                        </div>
                      ):(
                        <div style={{marginTop:4}}>
                          {slot.note&&<div style={{fontSize:10,color:"#777",marginBottom:3}}>📋 {slot.note}</div>}
                          {slot.ekipNotu&&<div style={{fontSize:10,color:"#FF9500",marginBottom:3}}>👤 {slot.ekipNotu}</div>}
                          <button onClick={()=>{setNoteEditing(`${day}_${slot.venueId}`);setNoteVal(role==="ekip"?slot.ekipNotu:slot.note);}} style={{...s.btn("ghost"),padding:"2px 7px",fontSize:10}}><Icon name="note" size={10}/> Not</button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {role==="admin"&&(
                  addPickerDay===day
                    ?<div style={{marginTop:6,display:"flex",gap:4}}>
                        <select value={addPickerVal} onChange={e=>setAddPickerVal(e.target.value)} style={{background:"#0A0A14",border:"1px solid #2A2A3E",borderRadius:6,color:"#fff",fontSize:11,flex:1,padding:"4px 6px",outline:"none"}}>
                          <option value="">Mekan seç...</option>
                          {venues.filter(v=>!(schedule[day]||[]).some(s=>s.venueId===v.id)).map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                        <button onClick={()=>{if(addPickerVal){addVenueToDay(day,addPickerVal);setAddPickerDay(null);setAddPickerVal("");}}} style={{...s.btn("success"),padding:"4px 8px",fontSize:11}}>✓</button>
                        <button onClick={()=>{setAddPickerDay(null);setAddPickerVal("");}} style={{...s.btn("ghost"),padding:"4px 8px",fontSize:11}}>✕</button>
                      </div>
                    :<button onClick={()=>{setAddPickerDay(day);setAddPickerVal("");}} style={{width:"100%",marginTop:slots.length?6:0,background:"none",border:"1px dashed #2A2A3E",borderRadius:8,color:"#555",fontSize:11,padding:"5px",cursor:"pointer",transition:"all 0.2s"}} onMouseEnter={e=>e.target.style.borderColor="#7B68EE"} onMouseLeave={e=>e.target.style.borderColor="#2A2A3E"}>+ Mekan Ekle</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── MÜDÜR NOT PANELİ (bileşen) ───────────────────────────────────────────────
  const MudurNotPanel=({mudurNotu,setMudurNotu,showToast})=>{
    const [draft,setDraft]=useState(mudurNotu);
    const [saved,setSaved]=useState(false);
    const save=()=>{setMudurNotu(draft);setSaved(true);showToast("Not ekibe iletildi!");setTimeout(()=>setSaved(false),2500);};
    return(
      <div style={{background:"#0E0E1C",border:"1px solid #F4A62333",borderRadius:12,padding:20}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:32,height:32,borderRadius:9,background:"#F4A62322",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>📝</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Ekibe Not</div>
            <div style={{fontSize:11,color:"#555"}}>Yazdığın not Ekip panelinde görünür</div>
          </div>
          {mudurNotu&&<div style={{marginLeft:"auto",fontSize:10,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:6,padding:"2px 8px",fontWeight:700}}>✅ Aktif not var</div>}
        </div>
        <textarea
          value={draft} onChange={e=>setDraft(e.target.value)}
          placeholder="Ekibe iletmek istediğin talimat, uyarı veya bilgi..."
          rows={4}
          style={{width:"100%",background:"#0A0A14",border:"1px solid #1E1E30",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:13,fontFamily:"inherit",resize:"vertical",outline:"none",lineHeight:1.6,marginBottom:10}}
        />
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={save} disabled={!draft.trim()} style={{...s.btn("warn"),padding:"8px 16px"}}>{saved?"✅ Gönderildi":"📤 Ekibe Gönder"}</button>
          {draft&&<button onClick={()=>{setDraft("");setMudurNotu("");showToast("Not silindi");}} style={{...s.btn("danger"),padding:"8px 12px"}}><Icon name="trash" size={12}/> Sil</button>}
        </div>
      </div>
    );
  };

  // ── MÜDÜR PANEL ───────────────────────────────────────────────────────────────
  const MudurPanel=()=>{
    const allSlots2=Object.values(schedule).flat();const total2=allSlots2.length;
    const st_counts={taslak:allSlots2.filter(s=>s.status==="taslak").length,aranıyor:allSlots2.filter(s=>s.status==="aranıyor").length,onaylandi:allSlots2.filter(s=>s.status==="onaylandi").length,ertelendi:allSlots2.filter(s=>s.status==="ertelendi").length,kesinlesti:allSlots2.filter(s=>s.status==="kesinlesti").length};
    const icerikGonderilen=allSlots2.filter(s=>s.icerikGonderildi).length;const icerikOnaylanan=allSlots2.filter(s=>s.icerikOnaylandi).length;
    const progressPct=total2?Math.round(((st_counts.onaylandi+st_counts.kesinlesti)/total2)*100):0;const icerikPct=total2?Math.round((icerikOnaylanan/total2)*100):0;
    return (
      <div>
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div style={{fontSize:isMobile?18:24,fontWeight:800,color:"#fff"}}>Haftalık Operasyon Takibi</div>
            <div style={{background:"#F4A62322",border:"1px solid #F4A62333",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#F4A623"}}>👁 Salt Okunur</div>
          </div>
          <div style={{color:"#555",fontSize:13}}>{new Date().toLocaleDateString("tr-TR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?10:12,marginBottom:24}}>
          {[{val:`${progressPct}%`,label:"Randevu Onay Oranı",color:"#34C759",sub:`${st_counts.onaylandi+st_counts.kesinlesti}/${total2}`,icon:"✅"},{val:`${icerikPct}%`,label:"İçerik Onay Oranı",color:"#7B68EE",sub:`${icerikOnaylanan}/${total2}`,icon:"📋"},{val:st_counts.ertelendi,label:"Ertelenen",color:"#FF3B30",sub:"bu hafta",icon:"❌"},{val:venues.filter(v=>v.stock<=3).length,label:"Düşük Stok",color:"#FF9500",sub:"mekan",icon:"⚠️"}].map((k,i)=>(
            <div key={i} className="stat-card" style={{background:`linear-gradient(135deg,#0E0E1C,${k.color}08)`,border:`1px solid ${k.color}22`,borderRadius:12,padding:18,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:12,right:14,fontSize:20,opacity:0.2}}>{k.icon}</div>
              <div style={{fontSize:28,fontWeight:800,color:k.color,marginBottom:4}}>{k.val}</div>
              <div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:2}}>{k.label}</div>
              <div style={{fontSize:11,color:"#555"}}>{k.sub}</div>
              <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${k.color}44,${k.color})`}}/>
            </div>
          ))}
        </div>
        <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:16}}>Bu Hafta İlerleme</div>
          {[{label:"Randevu Onayı",pct:progressPct,color:"#34C759",detail:`${st_counts.onaylandi+st_counts.kesinlesti} onaylı, ${st_counts.aranıyor} bekliyor`},{label:"İçerik Gönderimi",pct:total2?Math.round((icerikGonderilen/total2)*100):0,color:"#7B68EE",detail:`${icerikGonderilen} gönderildi`},{label:"İçerik Onayı",pct:icerikPct,color:"#F4A623",detail:`${icerikOnaylanan} onaylandı`}].map((b,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontSize:12,fontWeight:600,color:"#ccc"}}>{b.label}</div><div style={{fontSize:12,fontWeight:800,color:b.color}}>{b.pct}%</div></div>
              <div style={{background:"#0A0A14",borderRadius:6,height:8,overflow:"hidden",marginBottom:3}}><div style={{height:"100%",background:b.color,width:`${b.pct}%`,borderRadius:6,transition:"width 0.5s"}}/></div>
              <div style={{fontSize:11,color:"#444"}}>{b.detail}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14}}>Mekan Stok Durumu</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {[...venues].sort((a,b)=>a.stock-b.stock).map(v=>{const color=v.stock===0?"#FF3B30":v.stock<=3?"#FF9500":v.stock<=6?"#FFCC00":"#34C759";const label=v.stock===0?"KRİTİK":v.stock<=3?"DÜŞÜK":v.stock<=6?"ORTA":"YETERLİ";return(
              <div key={v.id} style={{background:"#0A0A14",border:`1px solid ${color}33`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:2}}>{v.name}</div><div style={{fontSize:10,color,fontWeight:700}}>{label}</div></div>
                <div style={{fontSize:20,fontWeight:800,color}}>{v.stock}</div>
              </div>
            );})}
          </div>
        </div>
        {/* Haftalık Program — salt okunur */}
        <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>📅 Haftalık Program</div>
            <div style={{background:"#F4A62322",color:"#F4A623",border:"1px solid #F4A62333",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600}}>👁 Salt Okunur</div>
          </div>
          {Object.keys(schedule).length===0&&<div style={{fontSize:12,color:"#444",fontStyle:"italic"}}>Henüz program girilmedi.</div>}
          {Object.entries(schedule).map(([day,slots])=>{
            if(!slots||!slots.length)return null;
            return(
              <div key={day} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#7B68EE",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6,paddingBottom:4,borderBottom:"1px solid #1A1A2E"}}>{day}</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {slots.map((slot,i)=>{
                    const v=venues.find(vv=>vv.id===slot.venueId);if(!v)return null;
                    const st=STATUS[slot.status]||STATUS.taslak;
                    return(
                      <div key={i} style={{background:"#0A0A14",borderRadius:8,padding:"9px 12px",display:"flex",flexDirection:"column",gap:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:v.color,flexShrink:0}}/>
                          <div style={{fontSize:12,fontWeight:700,color:"#fff",flex:1,minWidth:100}}>{v.name}</div>
                          <div style={{fontSize:10,background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:5,padding:"2px 7px",fontWeight:700,flexShrink:0}}>{st.icon} {st.label}</div>
                          {slot.icerikGonderildi&&<div style={{fontSize:9,background:"#25D36618",color:"#25D366",border:"1px solid #25D36633",borderRadius:4,padding:"2px 6px",fontWeight:700,flexShrink:0}}>📤 İçerik Gönderildi</div>}
                          {slot.icerikOnaylandi&&<div style={{fontSize:9,background:"#8B7CF618",color:"#A98EFF",border:"1px solid #8B7CF628",borderRadius:4,padding:"2px 6px",fontWeight:600,flexShrink:0}}>🔒 Onaylandı</div>}
                        </div>
                        {(slot.ekipFikirleri||[]).filter(f=>f.onaylandi).length>0&&(
                          <div style={{paddingLeft:18,marginTop:2}}>
                            <div style={{fontSize:9,color:"#FFB340",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>💡 Ekip Fikirleri</div>
                            {(slot.ekipFikirleri||[]).filter(f=>f.onaylandi).map((f,fi)=>(
                              <div key={fi} style={{marginBottom:5,paddingLeft:2}}>
                                <div style={{fontSize:11,color:"#C8C8E8",display:"flex",alignItems:"flex-start",gap:5}}>
                                  <span style={{color:v.color,marginTop:2,fontSize:8,flexShrink:0}}>▸</span>
                                  <span style={{fontWeight:600}}>{f.baslik}</span>
                                </div>
                                {f.konsept&&<div style={{fontSize:10,color:"#4A4A70",marginTop:2,paddingLeft:13,lineHeight:1.5}}>{f.konsept}</div>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ekip & Admin Notları */}
        {(()=>{
          const notluSlotlar=Object.entries(schedule).flatMap(([day,slots])=>
            slots.filter(s=>s.ekipNotu||s.note).map(s=>({...s,day}))
          );
          if(!notluSlotlar.length) return null;
          return(
            <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:20,marginBottom:20}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14}}>🗒 Mekan Notları</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {notluSlotlar.map((slot,i)=>{
                  const v=venues.find(vv=>vv.id===slot.venueId);if(!v)return null;
                  return(
                    <div key={i} style={{background:"#0A0A14",border:"1px solid #1A1A2E",borderRadius:10,padding:"12px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:v.color,flexShrink:0}}/>
                        <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{v.name}</div>
                        <div style={{fontSize:10,color:"#444",marginLeft:"auto"}}>{slot.day}</div>
                        <div style={{fontSize:10,background:STATUS[slot.status]?.bg,color:STATUS[slot.status]?.color,border:`1px solid ${STATUS[slot.status]?.border}`,borderRadius:5,padding:"2px 7px",fontWeight:700}}>{STATUS[slot.status]?.icon} {STATUS[slot.status]?.label}</div>
                      </div>
                      {slot.note&&<div style={{fontSize:12,color:"#ccc",background:"#13132688",borderRadius:7,padding:"7px 10px",marginBottom:slot.ekipNotu?6:0}}>
                        <span style={{fontSize:10,fontWeight:700,color:"#7B68EE",marginRight:6}}>👤 Admin:</span>{slot.note}
                      </div>}
                      {slot.ekipNotu&&<div style={{fontSize:12,color:"#FF9500",background:"#FF950010",border:"1px solid #FF950022",borderRadius:7,padding:"7px 10px"}}>
                        <span style={{fontSize:10,fontWeight:700,color:"#FF9500",marginRight:6}}>👥 Ekip:</span>{slot.ekipNotu}
                      </div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Gönderilen İçerikler */}
        {(()=>{
          const gonderilenSlotlar=Object.entries(schedule).flatMap(([day,slots])=>
            slots.filter(s=>s.icerikGonderildi&&s.gonderilenIcerik).map(s=>({...s,day}))
          );
          if(!gonderilenSlotlar.length) return null;
          return(
            <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:20,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>📤 Gönderilen İçerikler</div>
                <div style={{background:"#25D36622",color:"#25D366",border:"1px solid #25D36633",borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700}}>{gonderilenSlotlar.length} mekan</div>
                <div style={{background:"#F4A62322",color:"#F4A623",border:"1px solid #F4A62333",borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:600}}>👁 Salt Okunur</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {gonderilenSlotlar.map((slot,i)=>{
                  const v=venues.find(vv=>vv.id===slot.venueId);if(!v)return null;
                  return(
                    <div key={i} style={{background:"#0A0A14",border:`1px solid ${slot.icerikOnaylandi?"#7B68EE33":"#25D36633"}`,borderRadius:10,padding:"12px 14px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:v.color,flexShrink:0}}/>
                        <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{v.name}</div>
                        <div style={{fontSize:10,color:"#555",marginLeft:"auto"}}>{slot.day}</div>
                        {slot.icerikOnaylandi
                          ?<span style={{fontSize:10,background:"#7B68EE18",color:"#7B68EE",border:"1px solid #7B68EE33",borderRadius:5,padding:"2px 7px",fontWeight:700}}>🔒 Onaylandı</span>
                          :<span style={{fontSize:10,background:"#25D36618",color:"#25D366",border:"1px solid #25D36633",borderRadius:5,padding:"2px 7px",fontWeight:700}}>📤 Gönderildi</span>
                        }
                      </div>
                      <div style={{background:"#13132688",borderRadius:7,padding:"8px 12px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#555",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>İçerik Başlıkları</div>
                        {slot.gonderilenIcerik.split(", ").map((baslik,bi)=>(
                          <div key={bi} style={{fontSize:12,color:"#ccc",marginBottom:3,display:"flex",alignItems:"center",gap:6}}>
                            <span style={{width:4,height:4,borderRadius:"50%",background:v.color,display:"inline-block",flexShrink:0}}/>
                            {baslik}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Ekibe Not */}
        <MudurNotPanel mudurNotu={mudurNotu} setMudurNotu={setMudurNotu} showToast={showToast}/>
      </div>
    );
  };

  // ── ANKET PANEL ───────────────────────────────────────────────────────────────
  const AnketPanel=()=>{
    const [anketResults,setAnketResults]=useState(()=>{try{const s=localStorage.getItem("hsi_anket_results");return s?JSON.parse(s):{};}catch{return{};}});
    useEffect(()=>{try{localStorage.setItem("hsi_anket_results",JSON.stringify(anketResults));}catch{}},[anketResults]);
    const [weekLabel]=useState(()=>new Date().toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit",year:"numeric"}));
    const surveyLink=(venue)=>`${window.location.origin}${window.location.pathname}?survey=${venue.id}&venue=${encodeURIComponent(venue.name)}`;
    const anketMsg=(venue)=>[`Merhaba ${venue.name}! 👋`,``,`HSI Medya olarak bu haftaki hizmetimizi değerlendirmenizi rica ederiz.`,``,`🔗 *Anket linki (2 dakika):*`,surveyLink(venue),``,`Video kalitesi, iletişim ve teslimat hakkında görüşlerinizi bekliyoruz 🙏`,``,`_HSI Medya Ekibi_ 🎬`].join("\n");
    const openWA=(venue)=>{if(!venue.phone){showToast(`${venue.name} için telefon numarası eklenmedi!`,"error");return;}window.open(`https://wa.me/${venue.phone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(anketMsg(venue))}`,"_blank");setAnketResults(prev=>({...prev,[venue.id]:{...(prev[venue.id]||{}),gonderildi:true,tarih:weekLabel}}));showToast(`${venue.name} için anket gönderildi!`);};
    const copyLink=(venue)=>{navigator.clipboard.writeText(surveyLink(venue));showToast(`${venue.name} anket linki kopyalandı!`);};
    const phoneCount=venues.filter(v=>v.phone).length;const sentCount=Object.values(anketResults).filter(r=>r.gonderildi).length;
    const avgScore=(()=>{const scores=Object.values(anketResults).map(r=>r.puan).filter(Boolean);return scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1):null;})();
    return (
      <div>
        <div style={{marginBottom:20}}><div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Memnuniyet Anketi</div><div style={{fontSize:13,color:"#555"}}>Haftalık WP anketi · {weekLabel}</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[{val:venues.length,label:"Toplam Mekan",color:"#7B68EE"},{val:phoneCount,label:"Numara Girilmiş",color:"#34C759"},{val:sentCount,label:"Anket Gönderildi",color:"#48BFAB"},{val:avgScore||"—",label:"Haftalık Ort. Puan",color:"#FF9500"}].map((k,i)=>(
            <div key={i} style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:14}}><div style={{fontSize:24,fontWeight:800,color:k.color,marginBottom:2}}>{k.val}</div><div style={{fontSize:11,color:"#555"}}>{k.label}</div></div>
          ))}
        </div>
        {phoneCount<venues.length&&<div style={{background:"#FF950018",border:"1px solid #FF950033",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#FF9500",marginBottom:16}}>⚠️ {venues.length-phoneCount} mekanın telefon numarası eksik.</div>}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button onClick={()=>{const w=venues.filter(v=>v.phone);if(!w.length){showToast("Önce telefonları gir!","error");return;}w.forEach((v,i)=>setTimeout(()=>openWA(v),i*800));showToast(`${w.length} mekana gönderiliyor...`);}} style={s.btn()}><Icon name="whatsapp" size={14}/> Hepsine Gönder ({phoneCount})</button>
          <button onClick={()=>setAnketResults({})} style={s.btn("danger")}><Icon name="trash" size={14}/> Sıfırla</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {venues.map(venue=>{const result=anketResults[venue.id]||{};return(
            <div key={venue.id} style={{background:"#0E0E1C",border:`1px solid ${result.gonderildi?"#34C75933":"#1A1A2E"}`,borderRadius:12,padding:14,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,minWidth:180}}><div style={{width:10,height:10,borderRadius:"50%",background:venue.color,flexShrink:0}}/><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{venue.name}</div></div>
              <div style={{flex:1,minWidth:180}}>{venue.phone?<div style={{fontSize:11,color:"#34C759",fontFamily:"monospace"}}>{venue.phone}</div>:<div style={{fontSize:11,color:"#FF3B30",fontStyle:"italic"}}>Numara yok</div>}</div>
              <button onClick={()=>copyLink(venue)} style={{...s.btn("ghost"),padding:"6px 12px",flexShrink:0}}><Icon name="copy" size={12}/> Link</button>
              <button onClick={()=>openWA(venue)} disabled={!venue.phone} style={{...s.btn(result.gonderildi?"ghost":"primary"),padding:"6px 12px",flexShrink:0}}><Icon name="whatsapp" size={12}/>{result.gonderildi?"Tekrar Gönder":"WhatsApp Gönder"}</button>
              {result.gonderildi&&<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"#444"}}>Puan:</span>
                <div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setAnketResults(prev=>({...prev,[venue.id]:{...(prev[venue.id]||{}),puan:n}}))} style={{width:28,height:28,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,background:result.puan===n?"#7B68EE":"#131326",color:result.puan===n?"#fff":"#555"}}>{n}</button>)}</div>
                <input value={result.yorum||""} onChange={e=>setAnketResults(prev=>({...prev,[venue.id]:{...(prev[venue.id]||{}),yorum:e.target.value}}))} placeholder="Yorum..." style={{...s.input,padding:"4px 8px",width:130,fontSize:11}}/>
                {result.puan&&<span style={{fontSize:10,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:6,padding:"2px 8px",fontWeight:700}}>✅ Kaydedildi</span>}
              </div>}
            </div>
          );})}
        </div>
        {Object.values(anketResults).some(r=>r.puan)&&(
          <div style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:12,padding:16,marginTop:20}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>📊 Bu Hafta Sonuçları</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
              {venues.filter(v=>anketResults[v.id]?.puan).map(v=>{const r=anketResults[v.id];const pColor=r.puan>=4?"#34C759":r.puan===3?"#FFCC00":"#FF3B30";return(
                <div key={v.id} style={{background:"#0A0A14",border:`1px solid ${pColor}33`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                  <div><div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:2}}>{v.name}</div>{r.yorum&&<div style={{fontSize:10,color:"#555",fontStyle:"italic"}}>{r.yorum}</div>}</div>
                  <div style={{fontSize:22,fontWeight:800,color:pColor,flexShrink:0}}>{r.puan}/5</div>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── SHARE PANEL ───────────────────────────────────────────────────────────────
  const SharePanel=()=>(
    <div>
      <div style={{marginBottom:24}}><div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Paylaş</div><div style={{color:"#555",fontSize:13}}>Her Cuma — WP Grubuna & Mail</div></div>
      {!readyToSend&&<div style={{background:"#FF950018",border:"1px solid #FF950033",borderRadius:10,padding:14,fontSize:13,color:"#FF9500",marginBottom:20}}>⚠️ Henüz tüm mekanlar onaylanmadı.</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {[
          {key:"wp",icon:"whatsapp",title:"WhatsApp Grubu",sub:"Çekim Bilgilendirme",color:"#25D366",action:<a href={`https://wa.me/?text=${encodeURIComponent(scheduleMsg)}`} target="_blank" rel="noreferrer" style={{...s.btn("success"),textDecoration:"none"}}><Icon name="whatsapp" size={14}/> WA&apos;da Aç</a>},
          {key:"mail",icon:"mail",title:"E-posta",sub:"hsimedya@gmail.com",color:"#7B68EE",action:<a href={`mailto:hsimedya@gmail.com?subject=Haftalık Çekim Programı&body=${encodeURIComponent(scheduleMsg)}`} style={{...s.btn("ghost"),textDecoration:"none"}}><Icon name="mail" size={14}/> Mail Aç</a>},
        ].map(({key,icon,title,sub,color,action})=>(
          <div key={key} style={{background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:14,padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:34,height:34,borderRadius:10,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",color}}><Icon name={icon} size={17}/></div><div><div style={{fontWeight:700,fontSize:14}}>{title}</div><div style={{fontSize:11,color:"#555"}}>{sub}</div></div></div>
            <div style={{background:"#0A0A14",border:"1px solid #1A1A2E",borderRadius:10,padding:14,fontFamily:"monospace",fontSize:12,color:"#9BE4A0",lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:240,overflow:"auto",marginBottom:12}}>{scheduleMsg}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{navigator.clipboard.writeText(scheduleMsg);setCopied(key);setTimeout(()=>setCopied(null),2000);showToast("Kopyalandı!");}} style={s.btn()}>{copied===key?<><Icon name="check" size={14}/> Kopyalandı!</>:<><Icon name="copy" size={14}/> Kopyala</>}</button>
              {action}
            </div>
          </div>
        ))}
      </div>

      {/* ── STOK ÖZETİ ── */}
      {(()=>{
        const sorted=[...venues].sort((a,b)=>a.stock-b.stock);
        const stokIcon=s=>s===0?"⚫":s<=2?"🔴":s<=6?"🟡":"🟢";
        const stokMsg="📦 Stok Özeti\n\n"+sorted.map(v=>`${stokIcon(v.stock)} ${v.name}: ${v.stock}`).join("\n")+"\n\nToplam: "+venues.reduce((a,v)=>a+v.stock,0)+" stok";
        return(
          <div style={{marginTop:20,background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:14,padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:34,height:34,borderRadius:10,background:"#FF950022",display:"flex",alignItems:"center",justifyContent:"center",color:"#FF9500"}}><Icon name="stock" size={17}/></div>
              <div><div style={{fontWeight:700,fontSize:14}}>Stok Özeti</div><div style={{fontSize:11,color:"#555"}}>Mekan bazlı stok durumu</div></div>
            </div>
            <div style={{background:"#0A0A14",border:"1px solid #1A1A2E",borderRadius:10,padding:14,fontFamily:"monospace",fontSize:12,color:"#9BE4A0",lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:280,overflow:"auto",marginBottom:12}}>{stokMsg}</div>
            <button onClick={()=>{navigator.clipboard.writeText(stokMsg);setCopied("stok");setTimeout(()=>setCopied(null),2000);showToast("Kopyalandı!");}} style={s.btn()}>
              {copied==="stok"?<><Icon name="check" size={14}/> Kopyalandı!</>:<><Icon name="copy" size={14}/> Kopyala</>}
            </button>
          </div>
        );
      })()}
    </div>
  );

  // ── İÇERİK KONTROL PANELİ ────────────────────────────────────────────────────
  const IcerikKontrolPanel = () => {
    const [tarama, setTarama]   = useState(null);
    const [scanning, setScanning] = useState(false);
    const [hata, setHata]       = useState(null);

    const harddisTara = async () => {
      setScanning(true); setHata(null);
      try {
        const r = await fetch(`${API_BASE}/api/icerik-tara`);
        const d = await r.json();
        if (!d.ok) throw new Error(d.error || "Tarama başarısız");
        setTarama(d);
      } catch(e) { setHata(e.message); }
      finally { setScanning(false); }
    };

    const venueRenk = (adi) => (venues.find(v => v.name === adi) || {}).color || "#7B68EE";

    const renderFolders = (items) => items.length === 0
      ? <div style={{fontSize:12,color:"#333",padding:"3px 0"}}>—</div>
      : items.map((it, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",borderRadius:6,background:it.renkli?"#34C75910":"#0E0E1C",border:`1px solid ${it.renkli?"#34C75922":"#1A1A2E"}`,marginBottom:3}}>
            <span style={{fontSize:13,flexShrink:0}}>{it.renkli ? "✅" : "📦"}</span>
            <span style={{flex:1,fontSize:12,color:it.renkli?"#9BE4A0":"#A0A0B8",lineHeight:1.3,wordBreak:"break-word"}}>{it.ad}</span>
            <span style={{fontSize:10,fontWeight:700,color:it.renkli?"#34C759":"#FF9500",flexShrink:0}}>{it.renkli?"YAPILDI":"STOK"}</span>
          </div>
        ));

    const renderSection = (title, items, color) => (
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
          <span style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{title}</span>
          <span style={{fontSize:11,color:"#444"}}>{items.filter(x=>x.renkli).length}/{items.length} yapıldı</span>
        </div>
        {renderFolders(items)}
      </div>
    );

    return (
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>İçerik Kontrol</div>
            <div style={{fontSize:13,color:"#555"}}>Harddiskteki video klasörlerini yapım / akım olarak sınıflandırır</div>
          </div>
          <button onClick={harddisTara} disabled={scanning} style={{...s.btn("primary"),padding:"10px 20px",gap:8}}>
            {scanning
              ? <><span style={{display:"inline-block",width:13,height:13,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Taranıyor...</>
              : <><Icon name="refresh" size={15}/> Harddiski Tara</>}
          </button>
        </div>

        {hata && (
          <div style={{background:"#FF3B3018",border:"1px solid #FF3B3033",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#FF3B30",marginBottom:16}}>
            ⚠️ {hata}
          </div>
        )}

        {!tarama && !scanning && (
          <div style={{textAlign:"center",padding:"70px 20px"}}>
            <div style={{fontSize:52,marginBottom:16}}>💾</div>
            <div style={{fontSize:15,fontWeight:600,color:"#555",marginBottom:8}}>Elements diski takılıyken "Harddiski Tara" butonuna bas</div>
            <div style={{fontSize:12,color:"#333"}}>Her mekanın video klasörleri yapım / akım olarak ayrıştırılıp gösterilecek</div>
          </div>
        )}

        {tarama && !tarama.disk_var && (
          <div style={{background:"#FF950018",border:"1px solid #FF950033",borderRadius:10,padding:14,fontSize:13,color:"#FF9500"}}>
            ⚠️ Elements diski bulunamadı — <code>/Volumes/Elements</code> bağlı değil
          </div>
        )}

        {tarama?.disk_var && tarama.mekanlar.length === 0 && (
          <div style={{background:"#1A1A2E",border:"1px solid #252540",borderRadius:10,padding:14,fontSize:13,color:"#555"}}>
            Disk tarandı ama eşleşen mekan klasörü bulunamadı.
          </div>
        )}

        {tarama?.disk_var && tarama.mekanlar.length > 0 && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(360px,1fr))",gap:16}}>
            {tarama.mekanlar.map((m, i) => {
              const renk = venueRenk(m.supabase_adi);
              const toplamYapim = m.yapim.filter(x=>x.renkli).length;
              const toplamAkim  = m.akim.filter(x=>x.renkli).length;
              return (
                <div key={i} style={{background:"#0A0A14",border:`1px solid ${renk}22`,borderRadius:14,padding:18,borderTop:`3px solid ${renk}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:renk,flexShrink:0}}/>
                    <div style={{fontSize:15,fontWeight:700,color:"#E8E8F0",flex:1}}>{m.supabase_adi}</div>
                    <span style={{fontSize:10,color:"#333",fontFamily:"monospace"}}>{m.disk_klasoru}</span>
                  </div>
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    {[
                      {label:"Yapım",count:toplamYapim,total:m.yapim.length,color:"#34C759"},
                      {label:"Akım", count:toplamAkim, total:m.akim.length, color:"#7B68EE"},
                    ].map(({label,count,total,color})=>(
                      <div key={label} style={{flex:1,background:color+"10",border:`1px solid ${color}22`,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                        <div style={{fontSize:20,fontWeight:800,color}}>{count}<span style={{fontSize:13,color:"#555"}}>/{total}</span></div>
                        <div style={{fontSize:10,color:"#555",marginTop:2}}>{label} yapıldı</div>
                      </div>
                    ))}
                  </div>
                  {renderSection("🎬 Yapım Videoları", m.yapim, "#34C759")}
                  {renderSection("📱 Akım Videoları",  m.akim,  "#7B68EE")}
                  {m.diger.length > 0 && renderSection(`❓ Sınıflandırılmadı`, m.diger, "#555")}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  // Survey public page — no login needed
  const _surveyParams = new URLSearchParams(window.location.search);
  const _surveyVenue  = _surveyParams.get("survey");
  const _surveyName   = _surveyParams.get("venue")||"Mekan";
  if(_surveyVenue) return <SurveyPage venueName={decodeURIComponent(_surveyName)}/>;

  if(!role) return <LoginScreen onLogin={r=>{setRole(r);setActiveTab(r==="mudur"?"mudur":"onay");}}/>;

  const adminTabs=[{id:"onay",label:"Onay Takibi",icon:"calendar"},{id:"venues",label:"Mekanlar",icon:"camera"},{id:"anket",label:"Anket",icon:"phone"},{id:"share",label:"Paylaş",icon:"whatsapp"},{id:"icerik",label:"İçerik Kontrol",icon:"layers"},{id:"dashboard",label:"Dashboard",icon:"stock"}];
  const ekipTabs =[{id:"onay",label:"Onay Paneli",icon:"phone"}];
  const mudurTabs=[{id:"mudur",label:"Genel Bakış",icon:"eye"}];
  const tabs=role==="admin"?adminTabs:role==="mudur"?mudurTabs:ekipTabs;

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:#09090F}
        ::-webkit-scrollbar-thumb{background:#1A1A2E;border-radius:2px}
        a{text-decoration:none}
        button:disabled{opacity:0.35;cursor:not-allowed}
        select option{background:#0C0C1A}
        input::placeholder{color:#2E2E46}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes toastPop{0%{opacity:0;transform:translateY(10px) scale(0.96)}60%{transform:translateY(-2px) scale(1.01)}100%{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(139,124,246,0)}50%{box-shadow:0 0 0 5px rgba(139,124,246,0.10)}}
        .venue-card{transition:all 0.18s ease!important}
        .venue-card:hover{transform:translateY(-2px)!important;box-shadow:0 6px 24px rgba(0,0,0,0.45)!important;border-color:#1E1E32!important}
        .stat-card{transition:all 0.18s ease}
        .stat-card:hover{transform:translateY(-2px);border-color:rgba(139,124,246,0.3)!important;box-shadow:0 4px 20px rgba(0,0,0,0.3)}
        .nav-item:hover{background:#0E0E1C!important;color:#A0A0C0!important}
        .action-btn{transition:all 0.12s ease!important}
        .action-btn:hover:not(:disabled){filter:brightness(1.12);transform:translateY(-1px)}
        .panel-fade{animation:fadeIn 0.18s ease}
        .modal-slide{animation:slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)}
        .modal-backdrop{animation:fadeIn 0.18s ease}
      `}</style>

      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={{padding:"0 18px 16px",borderBottom:"1px solid #12122A"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#8B7CF6 0%,#5EEAD4 100%)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 10px #8B7CF638"}}>
              <Camera size={16} strokeWidth={2} color="#fff"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600,letterSpacing:"-0.02em",color:"#E2E2EE"}}>HSI Medya</div>
              <div style={{fontSize:9,color:"#28284A",letterSpacing:"0.06em",textTransform:"uppercase",marginTop:1}}>Content Planner</div>
            </div>
          </div>
          <div style={{background:ROLES[role]?.color+"15",border:`1px solid ${ROLES[role]?.color+"28"}`,borderRadius:6,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:500,color:ROLES[role]?.color,letterSpacing:"-0.01em"}}>
            <Icon name={ROLES[role]?.icon} size={10}/>{ROLES[role]?.label}
          </div>
        </div>
        <nav style={{padding:"10px 0",flex:1}}>
          {tabs.map(t=><div key={t.id} className="nav-item" style={s.navItem(activeTab===t.id)} onClick={()=>setActiveTab(t.id)}><Icon name={t.icon} size={14}/>{t.label}</div>)}
        </nav>
        {lowStockVenues.length>0&&(
          <div style={{margin:"0 12px 14px",padding:"10px 12px",background:"#FF950012",border:"1px solid #FF950033",borderRadius:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,color:"#FF9500",fontSize:11,fontWeight:700,marginBottom:5}}><Icon name="warning" size={11}/> {lowStockVenues.length} DÜŞÜK STOK</div>
            {lowStockVenues.map(v=><div key={v.id} style={{fontSize:11,color:"#FF9500",opacity:0.7,marginBottom:1}}>• {v.name}: {v.stock}</div>)}
          </div>
        )}
        <div style={{padding:"12px 20px",borderTop:"1px solid #16162A"}}>
          <button onClick={()=>setRole(null)} style={{...s.btn("ghost"),width:"100%",justifyContent:"center",fontSize:11}}>Çıkış Yap</button>
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>
        {activeTab==="onay"&&<div className="panel-fade"><OnayPanel/></div>}
        {activeTab==="venues"&&role==="admin"&&(
          <div className="panel-fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:10}}>
              <div><div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Mekanlar</div><div style={{color:"#555",fontSize:13}}>{venues.length} mekan · {venues.filter(v=>v.instagramData).length} IG verisi var</div></div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={async()=>{
                  if(!window.showDirectoryPicker){showToast("Tarayıcınız bu özelliği desteklemiyor (Chrome/Edge gerekli)","error");return;}
                  // Disk klasör adı → App mekan adı eşleştirmesi (stok_say.py ile aynı)
                  const MEKAN_ESLESTIRME={
                    "MİKADO":               "Mikado Restaurant",
                    "HARVEY BURGER":        "Harvey Burger",
                    "SULTAN SOFRASI":       "Sultan Sofrası",
                    "EGE DÖNER":            "Ege Döner",
                    "EGE BÜFE":             "Ege Büfe",
                    "KUBAN":                "Kuban Kuruyemiş",
                    "MUSTA":                "Musta Döner",
                    "SÜLEYMAN USTA":        "Süleyman Usta Döner",
                    "İSTE ÇİFTLİK":        "İSTE Çiftlik",
                    "SEZAİ USTA":           "Sezai Usta",
                    "SÜTLÜ KAVURMA":        "Sütlü Kavurma",
                    "YSANTOCHİA":           "YSANTOCHİA",
                    "SİNAN ÖZDEMİR":        "Sinan Özdemir",
                    "ŞENÖZ":                "Şenöz",
                    "SAUDADE":              "Saudade",
                  };
                  try{
                    showToast("'s' klasörünü seçin (Elements diski içindeki s/ klasörü)...");
                    // Kullanıcı doğrudan 's' klasörünü seçer
                    const sKlasoru=await window.showDirectoryPicker({mode:"read"});
                    let guncellenen=0;
                    const yeniVenues=[...venues];
                    for await(const [klasorAdi,entry] of sKlasoru.entries()){
                      if(entry.kind!=="directory") continue;
                      if(klasorAdi.startsWith(".")) continue;
                      const appAdi=MEKAN_ESLESTIRME[klasorAdi];
                      if(!appAdi) continue; // eşleştirme yoksa atla
                      const eslesen=yeniVenues.find(v=>v.name.trim()===appAdi.trim());
                      if(!eslesen) continue;
                      // Alt klasörleri say (her alt klasör = bir içerik = stok)
                      let altKlasorSayisi=0;
                      for await(const [,alt] of entry.entries()){
                        if(alt.kind==="directory"&&!alt.name?.startsWith(".")) altKlasorSayisi++;
                      }
                      const idx=yeniVenues.findIndex(v=>v.id===eslesen.id);
                      yeniVenues[idx]={...yeniVenues[idx],stock:altKlasorSayisi};
                      guncellenen++;
                    }
                    setVenues(yeniVenues);
                    showToast(`✅ ${guncellenen} mekanın stoğu güncellendi`);
                  }catch(e){
                    if(e.name!=="AbortError") showToast("Hata: "+e.message,"error");
                  }
                }} style={{...s.btn("purple")}}><Icon name="refresh" size={14}/> Harddisk Tara</button>
                <button onClick={async()=>{
                  const isLocal=["localhost","127.0.0.1"].includes(window.location.hostname);
                  if(!isLocal){showToast("Stok Yenile yalnızca admin bilgisayarından (localhost) çalışır","error");return;}
                  setLoading(p=>({...p,stokYenile:true}));
                  try{
                    const r=await fetch(`${API_BASE}/api/stok-say`,{method:"POST"});
                    const text=await r.text();
                    if(!text) throw new Error("server.py çalışmıyor — terminalde başlat");
                    const d=JSON.parse(text);
                    if(!d.ok) throw new Error(d.error||"Hata");
                    setVenues(prev=>prev.map(v=>{
                      const stk=d.stoklar[v.name];
                      return stk!==undefined?{...v,stock:stk}:v;
                    }));
                    showToast(`✅ ${d.guncellenen} mekan stoğu güncellendi`);
                  }catch(e){showToast("Stok güncelleme hatası: "+e.message,"error");}
                  finally{setLoading(p=>({...p,stokYenile:false}));}
                }} disabled={loading.stokYenile} style={s.btn("ghost")}>
                  {loading.stokYenile?<><span style={{display:"inline-block",width:12,height:12,border:"2px solid #fff4",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/> Yenileniyor...</>:<><Icon name="refresh" size={14}/> Stok Yenile</>}
                </button>
                <button onClick={()=>setAddModal(true)} style={s.btn()}><Icon name="plus" size={14}/> Mekan Ekle</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {venues.map(venue=>(
                <div key={venue.id} className="venue-card" style={s.card(venue.color)} onClick={()=>setSelectedVenue(venue)}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><div style={{width:10,height:10,borderRadius:"50%",background:venue.color,flexShrink:0,marginTop:3}}/><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{venue.name}</div></div>
                    <StockBadge stock={venue.stock}/>
                  </div>
                  <div style={{fontSize:12,color:"#666",lineHeight:1.5,marginBottom:10}}>{venue.concept||"Konsept henüz tanımlanmadı"}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:5,flexWrap:"wrap"}}>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {venue.venueAnalysis&&<span style={{fontSize:10,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:10,padding:"2px 7px",fontWeight:700}}>✅ AI Tanıyor</span>}
                      {venue.instagramData&&<span style={{fontSize:10,background:"#E1306C18",color:"#E1306C",border:"1px solid #E1306C33",borderRadius:10,padding:"2px 7px",fontWeight:700}}>📊 {venue.instagramData.length} Reels</span>}
                      {(venue.ideas||[]).length>0&&<span style={{fontSize:10,background:"#7B68EE18",color:"#7B68EE",border:"1px solid #7B68EE33",borderRadius:10,padding:"2px 7px",fontWeight:700}}>✨ {venue.ideas.length} fikir</span>}
                      {!venue.venueAnalysis&&!venue.instagramData&&<span style={{fontSize:10,background:"#131326",color:"#444",borderRadius:10,padding:"2px 7px",fontWeight:700}}>Video Yükle</span>}
                    </div>
                    <button onClick={e=>{e.stopPropagation();setEditVenue(venue);}} style={{...s.btn("ghost"),padding:"3px 8px",fontSize:10,flexShrink:0}}><Icon name="edit" size={11}/></button>
                    <button onClick={e=>{e.stopPropagation();if(window.confirm(`"${venue.name}" silinsin mi?`)){const prev=ls("hsi_deleted_ids",[]);const newDel=[...new Set([...prev,venue.id])];try{localStorage.setItem("hsi_deleted_ids",JSON.stringify(newDel))}catch{}lastWriteRef.current.deleted_venue_ids=JSON.stringify(newDel);_supaSet("deleted_venue_ids",newDel);setVenues(p=>p.filter(v=>v.id!==venue.id));showToast(`${venue.name} silindi`,"error");}}} style={{...s.btn("danger"),padding:"3px 8px",fontSize:10,flexShrink:0}}><Icon name="trash" size={11}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab==="share"&&role==="admin"&&<SharePanel/>}
        {activeTab==="anket"&&role==="admin"&&<AnketPanel/>}
        {activeTab==="icerik"&&role==="admin"&&<div className="panel-fade"><IcerikKontrolPanel/></div>}
        {activeTab==="mudur"&&role==="mudur"&&<MudurPanel/>}
        {activeTab==="dashboard"&&role==="admin"&&(
          <>
            <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Dashboard</div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
              {[{val:venues.length,label:"Toplam Mekan",color:"#7B68EE",icon:"🏪"},{val:venues.reduce((a,v)=>a+v.stock,0),label:"Toplam Stok",color:"#34C759",icon:"🎬"},{val:venues.filter(v=>v.instagramData).length,label:"IG Verisi",color:"#E1306C",icon:"📊"},{val:venues.filter(v=>v.venueAnalysis).length,label:"AI Tanıyan",color:"#48BFAB",icon:"🤖"}].map((s2,i)=>(
                <div key={i} className="stat-card" style={{background:`linear-gradient(135deg,#0E0E1C,${s2.color}08)`,border:`1px solid ${s2.color}22`,borderRadius:12,padding:18,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:12,right:14,fontSize:22,opacity:0.25}}>{s2.icon}</div>
                  <div style={{fontSize:30,fontWeight:800,color:s2.color,lineHeight:1}}>{s2.val}</div>
                  <div style={{fontSize:11,color:"#666",marginTop:6,fontWeight:600}}>{s2.label}</div>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${s2.color}44,${s2.color})`}}/>
                </div>
              ))}
            </div>
            <div style={{fontSize:12,fontWeight:700,color:"#444",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Öncelik Sıralaması (düşük stok → yüksek)</div>
            {[...venues].sort((a,b)=>a.stock-b.stock).map((v,i)=>(
              <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,background:"#0E0E1C",border:"1px solid #1A1A2E",borderRadius:10,padding:"10px 14px",marginBottom:6,cursor:"pointer"}} onClick={()=>{setSelectedVenue(v);setActiveTab("venues");}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:v.color+"22",border:`2px solid ${v.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:v.color}}>{i+1}</div>
                <div style={{flex:1,fontSize:13,fontWeight:600,color:"#E8E8F0"}}>{v.name}</div>
                <div style={{display:"flex",gap:5}}>
                  {v.venueAnalysis&&<span style={{fontSize:10,color:"#34C759"}}>✅</span>}
                  {v.instagramData&&<span style={{fontSize:10,color:"#E1306C"}}>📊</span>}
                  {(v.ideas||[]).length>0&&<span style={{fontSize:10,color:"#7B68EE"}}>✨</span>}
                </div>
                <StockBadge stock={v.stock}/>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0A0A14",borderTop:"1px solid #161628",display:"flex",alignItems:"stretch",zIndex:200,paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"10px 4px",background:activeTab===t.id?"#13132A":"transparent",border:"none",cursor:"pointer",color:activeTab===t.id?"#8B7CF6":"#3A3A5C",borderTop:`2px solid ${activeTab===t.id?"#8B7CF6":"transparent"}`,transition:"all 0.12s",minHeight:56}}>
              <Icon name={t.icon} size={18}/>
              <span style={{fontSize:9,fontWeight:activeTab===t.id?600:400,letterSpacing:"-0.01em",whiteSpace:"nowrap"}}>{t.label}</span>
            </button>
          ))}
          <button onClick={()=>setRole(null)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"10px 4px",background:"transparent",border:"none",cursor:"pointer",color:"#3A3A5C",borderTop:"2px solid transparent",minHeight:56}}>
            <Icon name="user" size={18}/>
            <span style={{fontSize:9,fontWeight:400,letterSpacing:"-0.01em"}}>Çıkış</span>
          </button>
        </div>
      )}

      {addModal&&<AddVenueModal onClose={()=>setAddModal(false)}/>}
      {editVenue&&<EditVenueModal venue={venues.find(v=>v.id===editVenue.id)||editVenue} onClose={()=>setEditVenue(null)}/>}
      {selectedVenue&&<VenueModal venue={venues.find(v=>v.id===selectedVenue.id)||selectedVenue} onClose={()=>setSelectedVenue(null)}/>}
      {toast&&<div style={{position:"fixed",bottom:isMobile?72:24,right:isMobile?12:24,left:isMobile?12:"auto",background:toast.type==="error"?"#FF3B30":toast.type==="info"?"#7B68EE":"#34C759",color:"#fff",padding:"12px 18px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:999,boxShadow:"0 8px 32px #0008",maxWidth:320,backdropFilter:"blur(8px)",animation:"toastPop 0.35s cubic-bezier(0.34,1.56,0.64,1)",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16}}>{toast.type==="error"?"❌":toast.type==="info"?"⏳":"✅"}</span>{toast.msg}</div>}
    </div>
  );
}
