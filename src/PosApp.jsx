import { useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Bell,
  Printer,
  Wallet,
  CreditCard,
  Banknote,
  Coffee,
  CupSoda,
  Sandwich,
  Cake,
  Check,
  LogOut,
  Utensils,
  Drumstick,
  Flame,
  GlassWater,
} from "lucide-react";
import logo from "./assets/logo.jpg";

const STAFF_ACCOUNTS = [
  { name: "Juan", password: "juan123" },
  { name: "Maria", password: "maria123" },
];
const CLOCKIN_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-clockin";
const CLOCKOUT_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-clockout";
const SHIFT_KEY = "cafe-brewm-pos-shift";
const SESSION_LOG_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-session-log";

function logSession(type, name, action, token) {
  fetch(SESSION_LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name, action, token }),
  }).catch(() => {});
}

const PRODUCTS = [
  // Espresso
  { id: 1, name: "Americano", category: "Espresso", price: 100, icon: Coffee },
  { id: 2, name: "Cafe Latte", category: "Espresso", price: 120, icon: Coffee },
  { id: 3, name: "Spanish Latte", category: "Espresso", price: 140, icon: Coffee },
  { id: 4, name: "Mocha Cloud", category: "Espresso", price: 140, icon: Coffee },
  { id: 5, name: "Brown Sugar Ice Shake", category: "Espresso", price: 140, icon: Coffee },
  { id: 6, name: "Salted Caramel Ice Shaken", category: "Espresso", price: 140, icon: Coffee },
  { id: 7, name: "Pistachio Cream", category: "Espresso", price: 160, icon: Coffee },
  { id: 8, name: "Lotus Biscoff Cream", category: "Espresso", price: 170, icon: Coffee },
  { id: 9, name: "Barista Drink", category: "Espresso", price: 160, icon: Coffee },
  { id: 10, name: "Sea Salt Cream", category: "Espresso", price: 160, icon: Coffee },
  { id: 11, name: "Vanilla With Coffee Jelly", category: "Espresso", price: 160, icon: Coffee },
  { id: 12, name: "Black Forrest", category: "Espresso", price: 160, icon: Coffee },
  { id: 13, name: "Ca Phe Trung (Vietnamese)", category: "Espresso", price: 160, icon: Coffee },

  // Non-Coffee
  { id: 14, name: "Matcha Latte", category: "Non-Coffee", price: 140, icon: CupSoda },
  { id: 15, name: "Strawberry Milk", category: "Non-Coffee", price: 120, icon: CupSoda },
  { id: 16, name: "Blueberry Milk", category: "Non-Coffee", price: 120, icon: CupSoda },
  { id: 17, name: "Strawberry Matcha", category: "Non-Coffee", price: 160, icon: CupSoda },
  { id: 18, name: "Chocolate Strawberry", category: "Non-Coffee", price: 160, icon: CupSoda },
  { id: 19, name: "Milky White", category: "Non-Coffee", price: 120, icon: CupSoda },
  { id: 20, name: "Chocolate Milk", category: "Non-Coffee", price: 120, icon: CupSoda },

  // Refreshers (Mocktail)
  { id: 21, name: "Strawberry Lychee Mojito", category: "Refreshers", price: 130, icon: GlassWater },
  { id: 22, name: "Blue Lagoon", category: "Refreshers", price: 130, icon: GlassWater },
  { id: 23, name: "Blueberry Lime", category: "Refreshers", price: 130, icon: GlassWater },
  { id: 24, name: "Sunrise Mocktail", category: "Refreshers", price: 130, icon: GlassWater },

  // Blended - Coffee Based
  { id: 25, name: "Darko Choco Chips", category: "Blended", price: 170, icon: CupSoda },
  { id: 26, name: "Darko Blended", category: "Blended", price: 160, icon: CupSoda },
  { id: 27, name: "Lotus Biscoff Blended", category: "Blended", price: 190, icon: CupSoda },
  { id: 28, name: "Caramel Blended", category: "Blended", price: 160, icon: CupSoda },
  { id: 29, name: "Coffee Jelly Blended", category: "Blended", price: 170, icon: CupSoda },
  { id: 30, name: "Caramel Coffee Jelly", category: "Blended", price: 180, icon: CupSoda },

  // Blended - Non Coffee Based
  { id: 31, name: "Chocolate Chips Blended", category: "Blended", price: 150, icon: CupSoda },
  { id: 32, name: "Nutella Oreo", category: "Blended", price: 160, icon: CupSoda },
  { id: 33, name: "Strawberry Cheesecake", category: "Blended", price: 150, icon: CupSoda },
  { id: 34, name: "Strawberry Oreo", category: "Blended", price: 150, icon: CupSoda },
  { id: 35, name: "Matcha Cream Blended", category: "Blended", price: 160, icon: CupSoda },
  { id: 36, name: "Lotus Biscoff Creamcheese", category: "Blended", price: 190, icon: CupSoda },
  { id: 37, name: "Cookie n Cream Cheesecake", category: "Blended", price: 180, icon: CupSoda },
  { id: 38, name: "Caramel Cream Blended", category: "Blended", price: 140, icon: CupSoda },
  { id: 39, name: "Salted Caramel Cream", category: "Blended", price: 140, icon: CupSoda },

  // Pasta
  { id: 40, name: "Pesto Pasta", category: "Pasta", price: 160, icon: Utensils },
  { id: 41, name: "Creamy Bacon Mushroom", category: "Pasta", price: 160, icon: Utensils },
  { id: 42, name: "Spicy Spaghetti", category: "Pasta", price: 160, icon: Utensils },
  { id: 43, name: "Spanish Sardines", category: "Pasta", price: 160, icon: Utensils },

  // Chicken Wings
  { id: 44, name: "3pcs Chicken Wings w/ Rice", category: "Chicken Wings", price: 150, icon: Drumstick },
  { id: 45, name: "6pcs Chicken Wings (2 flavors)", category: "Chicken Wings", price: 250, icon: Drumstick },
  { id: 46, name: "9pcs Chicken Wings (3 flavors)", category: "Chicken Wings", price: 350, icon: Drumstick },

  // Burger
  { id: 47, name: "Burger With Fries", category: "Burger", price: 100, icon: Sandwich },
  { id: 48, name: "Cheese Burger With Fries", category: "Burger", price: 120, icon: Sandwich },
  { id: 49, name: "Egg Burger With Fries", category: "Burger", price: 120, icon: Sandwich },
  { id: 50, name: "Overload With Fries", category: "Burger", price: 150, icon: Sandwich },

  // Nachos
  { id: 51, name: "Cheesy Beef Nachos", category: "Nachos", price: 150, icon: Flame },
  { id: 52, name: "Cheesy Beef Fries", category: "Nachos", price: 150, icon: Flame },

  // Waffle
  { id: 53, name: "Plain Waffle", category: "Waffle", price: 110, icon: Cake },
  { id: 54, name: "Chocolate Waffle", category: "Waffle", price: 130, icon: Cake },
  { id: 55, name: "Strawberry Waffle", category: "Waffle", price: 130, icon: Cake },
  { id: 56, name: "Caramel Waffle", category: "Waffle", price: 130, icon: Cake },
  { id: 57, name: "Biscoff Waffle", category: "Waffle", price: 150, icon: Cake },

  // Iced Coffee
  { id: 58, name: "Cafe Latte (Iced)", category: "Iced Coffee", price: 49, icon: CupSoda },
  { id: 59, name: "Cafe Mocha", category: "Iced Coffee", price: 49, icon: CupSoda },
  { id: 60, name: "Caramel Latte", category: "Iced Coffee", price: 49, icon: CupSoda },
  { id: 61, name: "Vanilla Latte", category: "Iced Coffee", price: 49, icon: CupSoda },
  { id: 62, name: "Spanish Latte (Iced)", category: "Iced Coffee", price: 49, icon: CupSoda },

  // Milk Tea
  { id: 63, name: "Chocolate Milk Tea", category: "Milk Tea", price: 49, icon: CupSoda },
  { id: 64, name: "Wintermelon Milk Tea", category: "Milk Tea", price: 49, icon: CupSoda },
  { id: 65, name: "Taro Milk Tea", category: "Milk Tea", price: 49, icon: CupSoda },
  { id: 66, name: "Matcha Milk Tea", category: "Milk Tea", price: 49, icon: CupSoda },
  { id: 67, name: "Red Velvet Milk Tea", category: "Milk Tea", price: 49, icon: CupSoda },
  { id: 68, name: "Cheesecake Milk Tea", category: "Milk Tea", price: 49, icon: CupSoda },

  // Fruit Tea
  { id: 69, name: "Strawberry Fruit Tea", category: "Fruit Tea", price: 49, icon: GlassWater },
  { id: 70, name: "Lychee Fruit Tea", category: "Fruit Tea", price: 49, icon: GlassWater },
  { id: 71, name: "Lemon Fruit Tea", category: "Fruit Tea", price: 49, icon: GlassWater },
  { id: 72, name: "Kiwi Fruit Tea", category: "Fruit Tea", price: 49, icon: GlassWater },
  { id: 73, name: "Blueberry Fruit Tea", category: "Fruit Tea", price: 49, icon: GlassWater },

  // Frappe
  { id: 74, name: "Java Chips Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 75, name: "Mocha Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 76, name: "Caramel Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 77, name: "Vanilla Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 78, name: "Matcha Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 79, name: "Strawberry Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 80, name: "Cookies & Cream Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 81, name: "Red Velvet Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 82, name: "Taro Frappe", category: "Frappe", price: 69, icon: CupSoda },
  { id: 83, name: "Cheesecake Frappe", category: "Frappe", price: 69, icon: CupSoda },
];

const CATEGORIES = [
  "All Items",
  "Espresso",
  "Non-Coffee",
  "Refreshers",
  "Blended",
  "Iced Coffee",
  "Milk Tea",
  "Fruit Tea",
  "Frappe",
  "Pasta",
  "Chicken Wings",
  "Burger",
  "Nachos",
  "Waffle",
];
const ORDER_TYPES = ["Pickup", "Delivery", "Dine In"];
const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
];
const SIZE_OPTIONS = [
  { label: "12oz", extra: 0 },
  { label: "16oz", extra: 20 },
  { label: "24oz", extra: 40 },
];
const TAX_RATE = 0.05;
const COST_MARGIN = 0.4; // estimated cost as a % of price, used for profit/loss reporting
const N8N_WEBHOOK_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-order";

function money(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StaffLoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const match = STAFF_ACCOUNTS.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.password === password
    );
    if (match) {
      setError("");
      onLogin(match.name);
    } else {
      setError("Wrong username or password.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Cafe Brewm" className="h-20 w-20 rounded-full object-cover shadow-sm mb-3" />
          <h1 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "'Fraunces', serif" }}>Cafe Brewm POS</h1>
          <p className="text-sm text-neutral-500 mt-1">Staff login</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-sm border border-neutral-200 bg-white shadow-sm p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Username</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              className="w-full rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-sm border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            />
          </div>

          {error && <p className="text-sm text-neutral-700">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-sm bg-neutral-900 hover:bg-black text-white text-sm font-medium py-2.5 transition-colors"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PosApp() {
  const [authPhase, setAuthPhase] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SHIFT_KEY) || "null");
      return saved?.staffName ? "pos" : "login";
    } catch {
      return "login";
    }
  });
  const [currentStaff, setCurrentStaff] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SHIFT_KEY) || "null")?.staffName || null;
    } catch {
      return null;
    }
  });
  const [clockInInfo, setClockInInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SHIFT_KEY) || "null")?.clockInInfo || null;
    } catch {
      return null;
    }
  });
  const [clockOutInfo, setClockOutInfo] = useState(null);
  const [clockBarActive, setClockBarActive] = useState(false);

  async function handleStaffLogin(staffName) {
    setAuthPhase("loading");
    setClockBarActive(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setClockBarActive(true)));

    const sessionToken = crypto.randomUUID();
    logSession("staff", staffName, "login", sessionToken);

    const [info] = await Promise.all([
      fetch(CLOCKIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffName }),
      })
        .then((r) => r.json())
        .catch(() => null),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);

    const now = new Date();
    const fallback = {
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
      date: now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    const resolvedClockIn = info?.success ? info : fallback;
    setCurrentStaff(staffName);
    setClockInInfo(resolvedClockIn);
    localStorage.setItem(SHIFT_KEY, JSON.stringify({ staffName, clockInInfo: resolvedClockIn, sessionToken }));
    setAuthPhase("timein");

    setTimeout(() => setAuthPhase("pos"), 2600);
  }

  async function handleLogout() {
    setAuthPhase("loggingout");
    setClockBarActive(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setClockBarActive(true)));

    if (currentStaff) {
      const saved = JSON.parse(localStorage.getItem(SHIFT_KEY) || "null");
      logSession("staff", currentStaff, "logout", saved?.sessionToken);
    }

    const [outInfo] = await Promise.all([
      currentStaff
        ? fetch(CLOCKOUT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ staffName: currentStaff }),
          })
            .then((r) => r.json())
            .catch(() => null)
        : Promise.resolve(null),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);

    const now = new Date();
    const fallbackOut = {
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
      date: now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    };

    localStorage.removeItem(SHIFT_KEY);
    setClockOutInfo(outInfo?.success ? outInfo : fallbackOut);
    setAuthPhase("timeout");
  }

  function finishLogout() {
    setCurrentStaff(null);
    setClockInInfo(null);
    setClockOutInfo(null);
    setAuthPhase("login");
  }

  const [activeCategory, setActiveCategory] = useState("All Items");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Pickup");
  const [discountPct, setDiscountPct] = useState(0);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderNumber, setOrderNumber] = useState(248);
  const [orderStatus, setOrderStatus] = useState("idle"); // idle | loading | success
  const [barActive, setBarActive] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [toast, setToast] = useState(null);
  const [bellRing, setBellRing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [variantModal, setVariantModal] = useState(null); // { product, temp, size }
  const toastTimer = useRef(null);
  const bellTimer = useRef(null);
  const successTimer = useRef(null);

  function showToast(message, tone = "success") {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 4000);

    setNotifications((prev) => [
      { id: Date.now(), message, tone, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) },
      ...prev,
    ].slice(0, 20));
    setUnreadCount((n) => n + 1);

    if (bellTimer.current) clearTimeout(bellTimer.current);
    setBellRing(true);
    bellTimer.current = setTimeout(() => setBellRing(false), 1200);
  }

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const inCategory = activeCategory === "All Items" || p.category === activeCategory;
      const inQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return inCategory && inQuery;
    });
  }, [activeCategory, query]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = subtotal * (discountPct / 100);
  const taxable = subtotal - discountAmount;
  const tax = taxable * TAX_RATE;
  const total = taxable + tax;

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function confirmVariant() {
    if (!variantModal) return;
    const { product, temp, size } = variantModal;
    const sizeOption = SIZE_OPTIONS.find((s) => s.label === size);
    const price = product.price + (sizeOption?.extra || 0);
    addToCart({
      id: `${product.id}-${temp}-${size}`,
      name: `${product.name} (${temp}, ${size})`,
      price,
    });
    setVariantModal(null);
  }

  function clearCart() {
    setCart([]);
    setDiscountPct(0);
    setNote("");
  }

  async function sendToLedger(payload) {
    try {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      return {
        text: data?.message || `Order #${String(payload.orderNumber).padStart(4, "0")} logged to ledger!`,
        tone: "success",
      };
    } catch (err) {
      return { text: "Order placed, but not synced to ledger (check n8n connection).", tone: "error" };
    }
  }

  async function placeOrder() {
    if (cart.length === 0 || orderStatus !== "idle") return;

    const itemsCost = cart.reduce((sum, i) => sum + i.price * i.qty * COST_MARGIN, 0);
    const profit = (subtotal - itemsCost) * (1 - discountPct / 100);

    const payload = {
      orderNumber,
      customerName: customerName.trim() || "Guest",
      items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
      subtotal,
      discountAmount,
      tax,
      total,
      cost: itemsCost,
      profit,
      paymentMethod,
      orderType,
      note,
      staffName: currentStaff,
    };

    setOrderStatus("loading");
    setBarActive(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setBarActive(true)));

    const [result] = await Promise.all([
      sendToLedger(payload),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);

    setCart([]);
    setDiscountPct(0);
    setNote("");
    setCustomerName("");
    setOrderNumber((n) => n + 1);
    setOrderStatus("success");
    showToast(result.text, result.tone);

    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setOrderStatus("idle"), 2600);
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (authPhase === "login") {
    return <StaffLoginScreen onLogin={handleStaffLogin} />;
  }

  if (authPhase === "timeout") {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@600&display=swap');
          .font-mono-num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
          @keyframes popIn { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
        `}</style>
        <div className="w-[320px] rounded-sm border border-neutral-200 bg-white px-8 py-8 text-center shadow-sm">
          <div className="mb-3 text-5xl" style={{ animation: "popIn 0.5s ease-out" }}>👋</div>
          <p className="font-medium text-lg mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Bye, {currentStaff}! Take care!</p>
          <p className="text-xs text-neutral-400 mb-4">Shift Summary</p>

          <div className="space-y-3 text-left">
            <div className="rounded-sm border border-neutral-200 px-4 py-2.5">
              <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Time In</p>
              <p className="text-lg font-semibold text-neutral-900 font-mono-num">{clockInInfo?.time}</p>
              <p className="text-xs text-neutral-500">{clockInInfo?.day}, {clockInInfo?.date}</p>
            </div>
            <div className="rounded-sm border border-neutral-200 px-4 py-2.5">
              <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Time Out</p>
              <p className="text-lg font-semibold text-neutral-900 font-mono-num">{clockOutInfo?.time}</p>
              <p className="text-xs text-neutral-500">{clockOutInfo?.day}, {clockOutInfo?.date}</p>
            </div>
          </div>

          <button
            onClick={finishLogout}
            className="w-full mt-5 rounded-sm bg-neutral-900 hover:bg-black text-white text-sm font-medium py-2.5 transition-colors"
          >
            Done, Log out
          </button>
        </div>
      </div>
    );
  }

  if (authPhase === "loading" || authPhase === "timein" || authPhase === "loggingout") {
    return (
      <div className="min-h-screen w-full bg-white flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@600&display=swap');
          .font-mono-num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
          @keyframes bounceCoffee { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes popIn { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
        `}</style>
        <div className="w-[300px] rounded-sm border border-neutral-200 bg-white px-8 py-8 text-center shadow-sm">
          {authPhase === "loading" || authPhase === "loggingout" ? (
            <>
              <div className="text-5xl mb-4" style={{ animation: "bounceCoffee 1s ease-in-out infinite" }}>☕</div>
              <p className="font-medium text-base mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
                {authPhase === "loading" ? "Clocking in…" : "Clocking out…"}
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                {authPhase === "loading" ? "Saving your time in" : "Saving your time out"}
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full bg-neutral-900 transition-[width] ease-linear"
                  style={{ width: clockBarActive ? "100%" : "0%", transitionDuration: "5000ms" }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 text-5xl" style={{ animation: "popIn 0.5s ease-out" }}>☕</div>
              <p className="font-medium text-lg mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Time In</p>
              <p className="text-2xl font-semibold text-neutral-900 font-mono-num">{clockInInfo?.time}</p>
              <p className="text-sm text-neutral-500 mt-1">{clockInInfo?.day}, {clockInInfo?.date}</p>
              <p className="text-xs text-neutral-400 mt-4">Have a great shift, {currentStaff}!</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900 flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-mono-num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes slideIn { 0% { transform: translateX(16px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="flex items-center gap-4 px-5 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Cafe Brewm" className="h-9 w-9 rounded-full object-cover" />
            <span className="font-display font-semibold text-lg tracking-tight">Cafe Brewm</span>
          </div>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-sm border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={clearCart}
              className="flex items-center gap-1.5 rounded-sm border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 text-sm font-medium px-3 py-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Clear cart</span>
            </button>
            <button className="flex items-center gap-1.5 rounded-sm bg-neutral-900 hover:bg-black text-white text-sm font-medium uppercase tracking-wide px-3.5 py-2 transition-colors">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add item</span>
            </button>
            <div className="hidden lg:flex items-center gap-1 pl-1">
              {[RefreshCw, Printer].map((Icon, idx) => (
                <button
                  key={idx}
                  className="h-9 w-9 rounded-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUnreadCount(0);
                }}
                className={`relative h-9 w-9 rounded-sm border flex items-center justify-center transition-colors ${
                  bellRing
                    ? "border-neutral-900 text-neutral-900 bg-neutral-100"
                    : "border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400"
                }`}
              >
                <Bell className={`h-4 w-4 ${bellRing ? "animate-bounce" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-[18px] px-1 rounded-full bg-neutral-900 text-[10px] font-semibold text-white flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-sm border border-neutral-200 bg-white shadow-lg z-20 overflow-hidden">
                  <div className="px-3 py-2 border-b border-neutral-200 text-xs font-medium text-neutral-500">
                    Notifications
                  </div>
                  <div className="max-h-72 overflow-y-auto no-scrollbar">
                    {notifications.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-neutral-400">No notifications yet.</p>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="px-3 py-2.5 border-b border-neutral-100 flex items-start gap-2">
                        <Bell className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${n.tone === "error" ? "text-neutral-400" : "text-neutral-900"}`} />
                        <div>
                          <p className="text-xs text-neutral-900 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
              <div className="h-8 w-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {currentStaff?.[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-neutral-700">{currentStaff}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-sm bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-2.5 py-2 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-5 pb-3 relative">
          <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-sm border border-neutral-200 bg-neutral-50 pl-9 pr-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900"
          />
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Sidebar */}
        <aside className="lg:w-52 shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-200 bg-neutral-50">
          <div className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar px-3 py-3 lg:px-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 text-left text-sm font-medium rounded-sm px-3 py-2 whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-5 py-5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-5">
            <div>
              <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Order type</span>
              <div className="inline-flex rounded-sm border border-neutral-200 p-1 bg-neutral-50">
                {ORDER_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`text-sm font-medium rounded-sm px-3 py-1.5 transition-colors ${
                      orderType === t ? "bg-white text-neutral-900 ring-1 ring-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Discount</span>
              <select
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="rounded-sm border border-neutral-200 bg-white text-sm text-neutral-900 px-3 py-2 outline-none focus:border-neutral-900"
              >
                <option value={0}>None</option>
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={15}>15%</option>
              </select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Note</span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Your comment here…"
                className="w-full rounded-sm border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 px-3 py-2 outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const Icon = p.icon;
              const hasVariants = p.category === "Espresso";
              const inCart = hasVariants
                ? cart.some((i) => typeof i.id === "string" && i.id.startsWith(`${p.id}-`))
                : cart.find((i) => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (hasVariants) {
                      setVariantModal({ product: p, temp: "Hot", size: "12oz" });
                    } else if (inCart) {
                      removeItem(p.id);
                    } else {
                      addToCart(p);
                    }
                  }}
                  className={`text-left bg-white rounded-sm border p-3 transition-all hover:border-neutral-400 ${
                    inCart ? "border-neutral-900 ring-1 ring-neutral-900" : "border-neutral-200"
                  }`}
                >
                  <div className="h-16 w-16 rounded-sm bg-neutral-100 flex items-center justify-center mb-3">
                    <Icon className="h-7 w-7 text-neutral-900" strokeWidth={1.6} />
                  </div>
                  <p className="font-display text-sm font-medium text-neutral-900 leading-snug">{p.name}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-mono-num text-sm font-semibold text-neutral-900">₱{money(p.price)}</span>
                    {p.originalPrice && (
                      <span className="font-mono-num text-xs text-neutral-400 line-through">₱{money(p.originalPrice)}</span>
                    )}
                  </div>
                </button>
              );
            })}
            {filteredProducts.length === 0 && (
              <p className="col-span-full text-sm text-neutral-400 py-10 text-center">
                No products match “{query}”.
              </p>
            )}
          </div>
        </main>

        {/* Cart */}
        <aside className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-neutral-50 px-5 py-5 flex flex-col lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
          <div className="flex items-baseline justify-between mb-4 shrink-0">
            <h2 className="font-display font-semibold text-base">Cart</h2>
            <div className="text-right">
              <p className="text-xs font-mono-num text-neutral-900 font-semibold">
                #{String(orderNumber).padStart(4, "0")}
              </p>
              <p className="text-[11px] text-neutral-400">{today}</p>
            </div>
          </div>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer name (for ledger)"
            className="w-full mb-4 rounded-sm border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 px-3 py-2 outline-none focus:border-neutral-900 shrink-0"
          />

          <div className="flex-1 min-h-0 space-y-3 mb-4 max-h-[360px] lg:max-h-none overflow-y-auto no-scrollbar">
            {cart.length === 0 && (
              <p className="text-sm text-neutral-400 py-8 text-center">Cart is empty. Tap a product to add it.</p>
            )}
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{item.name}</p>
                  <p className="font-mono-num text-xs text-neutral-500">₱{money(item.price)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="h-6 w-6 rounded-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono-num text-sm w-4 text-center">{item.qty}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="h-6 w-6 rounded-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 rounded-sm flex items-center justify-center text-neutral-400 hover:text-neutral-900"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-neutral-200 pt-3 space-y-1.5 shrink-0">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span className="font-mono-num">₱{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Discount {discountPct > 0 ? `(${discountPct}%)` : ""}</span>
              <span className="font-mono-num">-₱{money(discountAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
              <span className="font-mono-num">₱{money(tax)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-1.5 mt-1.5 border-t border-neutral-200">
              <span className="font-display">Total</span>
              <span className="font-mono-num text-neutral-900">₱{money(total)}</span>
            </div>
          </div>

          <div className="mt-4 shrink-0">
            <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Payment method</span>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-1 rounded-sm border py-2.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-neutral-900 bg-neutral-100 text-neutral-900"
                        : "border-neutral-200 text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={cart.length === 0 || orderStatus !== "idle"}
            className="mt-4 w-full rounded-sm bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium text-sm uppercase tracking-wide py-3 transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            {orderStatus === "loading" ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Processing…
              </>
            ) : orderStatus === "success" ? (
              <>
                <Check className="h-4 w-4" /> Order placed
              </>
            ) : (
              "Place order"
            )}
          </button>
        </aside>
      </div>

      {variantModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-xs rounded-sm border border-neutral-200 bg-white px-6 py-6">
            <p className="font-display text-base font-medium text-neutral-900 mb-4">{variantModal.product.name}</p>

            <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Temperature</span>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["Hot", "Iced"].map((t) => (
                <button
                  key={t}
                  onClick={() => setVariantModal((v) => ({ ...v, temp: t }))}
                  className={`rounded-sm border py-2 text-sm font-medium transition-colors ${
                    variantModal.temp === t
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <span className="text-xs font-medium text-neutral-500 mb-1.5 block">Size</span>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {SIZE_OPTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setVariantModal((v) => ({ ...v, size: s.label }))}
                  className={`rounded-sm border py-2 text-xs font-medium transition-colors ${
                    variantModal.size === s.label
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                  }`}
                >
                  <div>{s.label}</div>
                  <div className="font-mono-num">₱{money(variantModal.product.price + s.extra)}</div>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVariantModal(null)}
                className="flex-1 rounded-sm border border-neutral-200 text-sm font-medium text-neutral-600 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVariant}
                className="flex-1 rounded-sm bg-neutral-900 hover:bg-black text-white text-sm font-medium py-2.5 transition-colors"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {orderStatus !== "idle" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[300px] rounded-sm border border-neutral-200 bg-white px-8 py-8 text-center">
            {orderStatus === "loading" ? (
              <>
                <RefreshCw className="mx-auto mb-4 h-8 w-8 text-neutral-900 animate-spin" />
                <p className="font-display text-base mb-1">Processing order…</p>
                <p className="text-xs text-neutral-500 mb-4">Syncing to ledger, CRM, and Slack</p>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-neutral-900 transition-[width] ease-linear"
                    style={{ width: barActive ? "100%" : "0%", transitionDuration: "5000ms" }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 text-5xl" style={{ animation: "pop 0.5s ease-out" }}>
                  🎉
                </div>
                <p className="font-display text-lg font-semibold text-neutral-900 mb-1">Order placed!</p>
                <p className="text-sm text-neutral-500">Thanks for your order!</p>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed top-20 right-5 z-50 max-w-xs rounded-sm border px-4 py-3 shadow-lg flex items-start gap-2 backdrop-blur bg-white/95 ${
            toast.tone === "error" ? "border-neutral-400 text-neutral-900" : "border-neutral-900 text-neutral-900"
          }`}
          style={{ animation: "slideIn 0.35s ease-out" }}
        >
          <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${toast.tone === "error" ? "text-neutral-400" : "text-neutral-900"}`} />
          <p className="text-sm leading-snug">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
