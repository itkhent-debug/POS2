import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Bell,
  Printer,
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
  X,
  User,
  Clock,
  ChevronDown,
  Timer,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import logo from "./assets/logo.jpg";

const STAFF_ACCOUNTS = [
  { name: "Juan", password: "juan123" },
  { name: "Maria", password: "maria123" },
];
const CLOCKIN_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-clockin";
const CLOCKOUT_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-clockout";
const SHIFTS_API_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-shifts";
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
const PAYMENT_METHODS = [{ id: "cash", label: "Cash Payment", icon: Banknote }];
const SIZE_OPTIONS = [
  { label: "12oz", extra: 0 },
  { label: "16oz", extra: 20 },
  { label: "24oz", extra: 40 },
];
const TEMP_SIZE_CATEGORIES = ["Espresso"];
const SIZE_ONLY_CATEGORIES = ["Milk Tea", "Fruit Tea", "Iced Coffee", "Blended", "Frappe"];
const TAX_RATE = 0.05;
const COST_MARGIN = 0.4; // estimated cost as a % of price, used for profit/loss reporting
const N8N_WEBHOOK_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-order";

function money(n) {
  return Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StaffLoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [onDuty, setOnDuty] = useState([]);

  useEffect(() => {
    fetch(SHIFTS_API_URL)
      .then((r) => r.json())
      .then((d) => {
        const active = (Array.isArray(d?.shifts) ? d.shifts : [])
          .filter((s) => s.status === "active")
          .map((s) => s.staffName);
        setOnDuty(active);
      })
      .catch(() => {});
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const match = STAFF_ACCOUNTS.find(
      (s) => s.name.toLowerCase() === name.trim().toLowerCase() && s.password === password
    );
    if (match) {
      setError("");
      onLogin(match.name, onDuty.includes(match.name));
    } else {
      setError("Incorrect username or password. Please try again.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-3.5">
            <img
              src={logo}
              alt="Cafe Brewm"
              className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-white"
            />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight font-display">Cafe Brewm POS</h1>
          <p className="text-xs text-neutral-500 font-medium tracking-wide uppercase mt-1">Staff Terminal Login</p>

          {onDuty.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 animate-fade-in">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mr-0.5">On duty now:</span>
              {onDuty.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-neutral-200/80 bg-white shadow-xl shadow-neutral-200/40 p-7 space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Staff Username</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan or Maria"
              autoFocus
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-700 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 hover:bg-black active:scale-[0.99] text-white text-sm font-semibold py-3 transition-all shadow-sm"
          >
            {onDuty.some((n) => n.toLowerCase() === name.trim().toLowerCase())
              ? "Sign in & Resume Shift"
              : "Sign in & Clock In"}
          </button>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Cafe Brewm Station 1</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Connected
            </span>
          </div>
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
  const [resumedShift, setResumedShift] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [nowTick, setNowTick] = useState(Date.now());

  const searchInputRef = useRef(null);

  // Live tick for the on-duty duration timer in the profile dropdown
  useEffect(() => {
    if (authPhase !== "pos") return;
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [authPhase]);

  // Cross-device session sync: the server's active shift is the source of truth.
  // If this staff's shift is closed from another device, log this device out too.
  useEffect(() => {
    if (authPhase !== "pos" || !currentStaff) return;
    const check = async () => {
      try {
        const res = await fetch(SHIFTS_API_URL).then((r) => r.json());
        const shifts = Array.isArray(res?.shifts) ? res.shifts : [];
        const stillActive = shifts.some((s) => s.staffName === currentStaff && s.status === "active");
        if (!stillActive) {
          localStorage.removeItem(SHIFT_KEY);
          setProfileOpen(false);
          setCurrentStaff(null);
          setClockInInfo(null);
          setAuthPhase("login");
        }
      } catch {
        // Offline or webhook down — keep the local session rather than logging out.
      }
    };
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [authPhase, currentStaff]);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleStaffLogin(staffName) {
    setAuthPhase("loading");
    setClockBarActive(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setClockBarActive(true)));

    const sessionToken = crypto.randomUUID();
    logSession("staff", staffName, "login", sessionToken);

    // The server's active shift is the source of truth. If this staff already
    // has an active shift (e.g. logged in on another device/tab), resume it
    // instead of creating a duplicate one.
    const shiftsRes = await fetch(SHIFTS_API_URL)
      .then((r) => r.json())
      .catch(() => null);
    const activeShift = (Array.isArray(shiftsRes?.shifts) ? shiftsRes.shifts : []).find(
      (s) => s.staffName === staffName && s.status === "active"
    );

    let resolvedClockIn;
    if (activeShift) {
      setResumedShift(true);
      resolvedClockIn = {
        day: activeShift.dayIn,
        date: activeShift.dateIn,
        time: activeShift.timeIn,
        ts: activeShift.timeInTs
          ? new Date(activeShift.timeInTs.replace(" ", "T") + "Z").getTime()
          : null,
      };
    } else {
      setResumedShift(false);
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

      resolvedClockIn = info?.success
        ? { ...info, ts: Date.now() }
        : {
            ts: Date.now(),
            day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          };
    }

    setCurrentStaff(staffName);
    setClockInInfo(resolvedClockIn);
    localStorage.setItem(SHIFT_KEY, JSON.stringify({ staffName, clockInInfo: resolvedClockIn, sessionToken }));
    setAuthPhase("timein");

    setTimeout(() => setAuthPhase("pos"), resumedShift ? 1800 : 2600);
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
  const [paymentMethod, setPaymentMethod] = useState("cash");
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
  const [customItemModal, setCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
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

  const categoryCounts = useMemo(() => {
    const counts = { "All Items": PRODUCTS.length };
    PRODUCTS.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, []);

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
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const shiftDurationLabel = useMemo(() => {
    if (!clockInInfo?.ts) return "—";
    const mins = Math.max(0, Math.floor((nowTick - clockInInfo.ts) / 60000));
    if (mins < 1) return "Just started";
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }, [clockInInfo, nowTick]);

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
    const { product, mode, temp, size } = variantModal;
    const sizeOption = SIZE_OPTIONS.find((s) => s.label === size);
    const price = product.price + (sizeOption?.extra || 0);
    const id = mode === "tempSize" ? `${product.id}-${temp}-${size}` : `${product.id}-${size}`;
    const name = mode === "tempSize" ? `${product.name} (${temp}, ${size})` : `${product.name} (${size})`;
    addToCart({ id, name, price });
    setVariantModal(null);
  }

  function confirmCustomItem() {
    const name = customItemName.trim();
    const price = Number(customItemPrice);
    if (!name || !(price > 0)) return;
    addToCart({ id: `custom-${Date.now()}`, name, price });
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemModal(false);
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
        text: data?.message || `Order #${String(payload.orderNumber).padStart(4, "0")} synced to ledger!`,
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
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (authPhase === "login") {
    return <StaffLoginScreen onLogin={handleStaffLogin} />;
  }

  if (authPhase === "timeout") {
    return (
      <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="w-[340px] rounded-2xl border border-neutral-200/80 bg-white p-7 text-center shadow-xl shadow-neutral-200/40 animate-fade-in">
          <div className="mb-3 text-5xl animate-pop">👋</div>
          <h2 className="font-semibold text-xl text-neutral-900 font-display">Bye, {currentStaff}!</h2>
          <p className="text-xs text-neutral-500 mb-5 font-medium">Shift Summary & Clock Out</p>

          <div className="space-y-2.5 text-left mb-6">
            <div className="rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Time In</span>
              <p className="text-lg font-bold text-neutral-900 font-mono-num">{clockInInfo?.time}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{clockInInfo?.day}, {clockInInfo?.date}</p>
            </div>
            <div className="rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3.5">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Time Out</span>
              <p className="text-lg font-bold text-neutral-900 font-mono-num">{clockOutInfo?.time}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{clockOutInfo?.day}, {clockOutInfo?.date}</p>
            </div>
          </div>

          <button
            onClick={finishLogout}
            className="w-full rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold py-3 transition-all shadow-sm"
          >
            Return to Login Screen
          </button>
        </div>
      </div>
    );
  }

  if (authPhase === "loading" || authPhase === "timein" || authPhase === "loggingout") {
    return (
      <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="w-[320px] rounded-2xl border border-neutral-200/80 bg-white p-7 text-center shadow-xl shadow-neutral-200/40 animate-fade-in">
          {authPhase === "loading" || authPhase === "loggingout" ? (
            <>
              <div className="text-5xl mb-4 animate-bounce">☕</div>
              <p className="font-semibold text-lg text-neutral-900 font-display mb-1">
                {authPhase === "loading" ? "Clocking in…" : "Clocking out…"}
              </p>
              <p className="text-xs text-neutral-500 mb-5">
                {authPhase === "loading" ? "Recording shift start with ledger" : "Recording shift end with ledger"}
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-[width] ease-linear"
                  style={{ width: clockBarActive ? "100%" : "0%", transitionDuration: "5000ms" }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 text-5xl animate-pop">{resumedShift ? "🔄" : "☕"}</div>
              <p className="font-semibold text-xl text-neutral-900 font-display mb-2">
                {resumedShift ? "Shift Resumed" : "Shift Started"}
              </p>
              <p className="text-3xl font-bold text-neutral-900 font-mono-num">{clockInInfo?.time}</p>
              <p className="text-xs text-neutral-500 mt-1 font-medium">{clockInInfo?.day}, {clockInInfo?.date}</p>
              {resumedShift && (
                <p className="mt-2.5 mx-auto max-w-[240px] rounded-xl bg-amber-50 border border-amber-200/70 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
                  Naka-time-in ka na kanina pa — itinuloy lang namin ang shift mo. Hindi ito nadoble.
                </p>
              )}
              <div className="mt-5 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-600 font-medium">Have a wonderful shift, <span className="font-bold text-neutral-900">{currentStaff}</span>!</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-neutral-900 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-white/95 backdrop-blur-md">
        <div className="flex items-center gap-3 md:gap-4 px-4 sm:px-6 py-2.5">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <img
                src={logo}
                alt="Cafe Brewm"
                className="h-9 w-9 rounded-xl object-cover shadow-sm ring-1 ring-neutral-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base tracking-tight text-neutral-900">Cafe Brewm</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                  POS
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-none hidden sm:block">Modern Terminal</p>
            </div>
          </div>

          {/* Search Bar with Shortcut hint */}
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or drinks…"
              className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/70 pl-9 pr-14 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white rounded border border-neutral-200 shadow-2xs">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Actions & Staff Header Area */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 disabled:opacity-40 disabled:hover:border-neutral-200 text-xs font-semibold px-3 py-2 transition-all"
              title="Clear Cart"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Clear</span>
            </button>

            <button
              onClick={() => setCustomItemModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-black active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-2 transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Custom Item</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUnreadCount(0);
                }}
                className={`relative h-9 w-9 rounded-xl border flex items-center justify-center transition-all ${
                  bellRing
                    ? "border-neutral-900 text-neutral-900 bg-neutral-100 ring-2 ring-neutral-900/10"
                    : "border-neutral-200/80 bg-white text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
                }`}
                title="Notifications"
              >
                <Bell className={`h-4 w-4 ${bellRing ? "animate-bounce" : ""}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-neutral-900 text-[10px] font-bold text-white flex items-center justify-center leading-none ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-neutral-200 bg-white shadow-2xl z-30 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Notifications</span>
                    <span className="text-[11px] text-neutral-400">{notifications.length} updates</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-neutral-100">
                    {notifications.length === 0 && (
                      <p className="px-4 py-8 text-center text-xs text-neutral-400">No recent notifications.</p>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 flex items-start gap-2.5 hover:bg-neutral-50/70 transition-colors">
                        <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${n.tone === "error" ? "bg-red-500" : "bg-emerald-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-800 leading-snug">{n.message}</p>
                          <p className="text-[10px] text-neutral-400 mt-1 font-mono-num">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Staff Profile Dropdown & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-200/80">
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className={`flex items-center gap-2 py-1 px-2 rounded-xl border transition-all ${
                    profileOpen
                      ? "bg-white border-neutral-300 shadow-sm"
                      : "bg-neutral-100/80 border-neutral-200/60 hover:border-neutral-300"
                  }`}
                  title="Staff profile"
                >
                  <div className="relative">
                    <div className="h-6 w-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {currentStaff?.[0]?.toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-neutral-800">{currentStaff}</span>
                  <ChevronDown className={`h-3 w-3 text-neutral-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {profileOpen && (
                  <>
                    {/* Invisible backdrop to close the dropdown */}
                    <div className="fixed inset-0 z-20" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white shadow-2xl z-30 overflow-hidden animate-pop">
                      {/* Profile header */}
                      <div className="p-4 border-b border-neutral-100 bg-gradient-to-b from-neutral-50 to-white">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-neutral-900 text-white flex items-center justify-center text-lg font-bold shrink-0">
                            {currentStaff?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">{currentStaff}</p>
                            <span className="inline-flex items-center gap-1.5 mt-0.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              On Duty
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Shift details */}
                      <div className="p-3 space-y-2 border-b border-neutral-100">
                        <div className="flex items-center justify-between rounded-xl bg-neutral-50/70 border border-neutral-200/60 px-3 py-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                            <Clock className="h-3.5 w-3.5" /> Time In
                          </span>
                          <span className="font-mono-num text-xs font-bold text-neutral-900">{clockInInfo?.time ?? "—"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-neutral-50/70 border border-neutral-200/60 px-3 py-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                            <Timer className="h-3.5 w-3.5" /> On-duty duration
                          </span>
                          <span className="font-mono-num text-xs font-bold text-neutral-900">{shiftDurationLabel}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-medium px-1 leading-relaxed">
                          Naka-sync sa lahat ng device. Kung mag-logout ka sa ibang phone o PC, magsa-sign out din dito.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="p-3">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 text-xs font-semibold py-2.5 transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Clock Out & Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-600 border border-red-200/60 text-xs font-semibold px-2.5 py-2 transition-colors"
                title="Log out & Clock out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clock Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="sm:hidden px-4 pb-3 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50 pl-9 pr-8 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-neutral-400 p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Left / Center Section: Category Pills & Product Catalog */}
        <section className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 space-y-4">
          {/* Horizontal Category Navigation Bar */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-2 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-900"
                        : "bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-num font-medium ${
                        isActive ? "bg-neutral-800 text-neutral-300" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Order Controls: Type, Discount, Note */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 shadow-sm flex flex-wrap items-center gap-3">
            {/* Order Type Pills */}
            <div className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/60">
              {ORDER_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={`text-xs font-semibold rounded-lg px-3 py-1.5 transition-all ${
                    orderType === t
                      ? "bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-900/10"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Discount Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">Discount:</span>
              <select
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="rounded-xl border border-neutral-200 bg-neutral-50/60 text-xs font-semibold text-neutral-900 px-3 py-1.5 outline-none focus:border-neutral-900 focus:bg-white transition-all cursor-pointer"
              >
                <option value={0}>No Discount (0%)</option>
                <option value={5}>5% Senior / PWD</option>
                <option value={10}>10% Staff / VIP</option>
                <option value={15}>15% Promo</option>
              </select>
            </div>

            {/* Order Note */}
            <div className="flex-1 min-w-[200px]">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Special instruction / table number / note…"
                className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/60 text-xs text-neutral-900 placeholder:text-neutral-400 px-3 py-1.5 outline-none focus:border-neutral-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Product Grid Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-baseline gap-2">
              <h2 className="font-display text-lg font-bold text-neutral-900">{activeCategory}</h2>
              <span className="text-xs text-neutral-400 font-medium">
                ({filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"})
              </span>
            </div>
            {query && (
              <span className="text-xs text-neutral-500">
                Filtered by: <span className="font-semibold text-neutral-900">"{query}"</span>
              </span>
            )}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5">
            {filteredProducts.map((p) => {
              const Icon = p.icon;
              const hasTempSize = TEMP_SIZE_CATEGORIES.includes(p.category);
              const hasSizeOnly = SIZE_ONLY_CATEGORIES.includes(p.category);
              const hasVariants = hasTempSize || hasSizeOnly;

              // Calculate total qty of this product currently in cart
              const inCartQty = cart.reduce(
                (sum, item) =>
                  item.id === p.id || (typeof item.id === "string" && item.id.startsWith(`${p.id}-`))
                    ? sum + item.qty
                    : sum,
                0
              );

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    if (hasTempSize) {
                      setVariantModal({ product: p, mode: "tempSize", temp: "Hot", size: "12oz" });
                    } else if (hasSizeOnly) {
                      setVariantModal({ product: p, mode: "sizeOnly", size: "12oz" });
                    } else {
                      addToCart(p);
                    }
                  }}
                  className={`group relative text-left bg-white rounded-2xl border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-neutral-300 active:scale-[0.99] ${
                    inCartQty > 0
                      ? "border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm"
                      : "border-neutral-200/80 shadow-2xs"
                  }`}
                >
                  {/* Quantity In Cart Badge */}
                  {inCartQty > 0 && (
                    <span className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-neutral-900 text-white font-mono-num text-[11px] font-bold shadow-sm animate-pop">
                      {inCartQty} in cart
                    </span>
                  )}

                  {/* Icon & Category Tag */}
                  <div>
                    <div className="h-14 w-14 rounded-xl bg-neutral-100/90 group-hover:bg-neutral-200/80 flex items-center justify-center mb-3 transition-colors">
                      <Icon className="h-6 w-6 text-neutral-800 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.75} />
                    </div>
                    <p className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2">
                      {p.name}
                    </p>
                    {hasVariants && (
                      <span className="inline-block mt-1 text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded uppercase tracking-wider">
                        {hasTempSize ? "Sizes & Temp" : "Sizes available"}
                      </span>
                    )}
                  </div>

                  {/* Price & Add Indicator */}
                  <div className="mt-3.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="font-mono-num text-sm font-bold text-neutral-900">
                        ₱{money(p.price)}
                      </span>
                      {hasVariants && <span className="text-[10px] text-neutral-400 ml-1">base</span>}
                    </div>
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                        inCartQty > 0
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-600 group-hover:bg-neutral-900 group-hover:text-white"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-neutral-200/80">
                <Search className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                <p className="text-sm font-semibold text-neutral-700">No items found</p>
                <p className="text-xs text-neutral-400 mt-1">
                  No products matched “{query}” in {activeCategory}.
                </p>
                <button
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("All Items");
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar: Cart & Order Receipt */}
        <aside className="lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200/80 bg-white p-4 sm:p-5 flex flex-col lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)]">
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-2xs">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-neutral-900">Current Order</h2>
                <p className="text-[11px] text-neutral-400 font-medium">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 border border-neutral-200/60 font-mono-num text-xs font-bold text-neutral-900">
                #{String(orderNumber).padStart(4, "0")}
              </span>
              <p className="text-[10px] text-neutral-400 mt-0.5">{today}</p>
            </div>
          </div>

          {/* Customer Name Input */}
          <div className="mt-3.5 mb-2 shrink-0">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
              Customer Name
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Guest Customer (for ledger)"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 px-3.5 py-2 outline-none focus:border-neutral-900 focus:bg-white transition-all"
            />
          </div>

          {/* Cart Items List */}
          <div className="flex-1 min-h-[140px] space-y-2.5 my-2 overflow-y-auto custom-scrollbar pr-1">
            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center text-neutral-400">
                <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center mb-2 text-neutral-300">
                  <Coffee className="h-6 w-6" />
                </div>
                <p className="text-xs font-semibold text-neutral-600">Cart is empty</p>
                <p className="text-[11px] text-neutral-400 max-w-[180px] mt-0.5">
                  Tap any item from the catalog to add it to the order.
                </p>
              </div>
            )}

            {cart.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-2.5 flex items-center justify-between gap-2 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-900 leading-snug truncate">{item.name}</p>
                  <p className="font-mono-num text-[11px] font-bold text-neutral-600 mt-0.5">
                    ₱{money(item.price)}
                    {item.qty > 1 && (
                      <span className="text-neutral-400 font-normal ml-1">
                        (₱{money(item.price * item.qty)})
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="h-6 w-6 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors shadow-2xs"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-mono-num text-xs font-bold w-5 text-center text-neutral-900">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="h-6 w-6 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors shadow-2xs"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 ml-0.5 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="border-t border-dashed border-neutral-200 pt-3.5 space-y-1.5 shrink-0">
            <div className="flex justify-between text-xs text-neutral-500 font-medium">
              <span>Subtotal</span>
              <span className="font-mono-num font-semibold text-neutral-800">₱{money(subtotal)}</span>
            </div>

            {discountPct > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount ({discountPct}%)</span>
                <span className="font-mono-num font-semibold">-₱{money(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-neutral-500 font-medium">
              <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
              <span className="font-mono-num font-semibold text-neutral-800">₱{money(tax)}</span>
            </div>

            <div className="flex justify-between items-baseline text-base font-bold pt-2 mt-2 border-t border-neutral-200">
              <span className="font-display text-neutral-900">Total Due</span>
              <span className="font-mono-num text-lg text-neutral-900 font-extrabold">₱{money(total)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-3.5 shrink-0">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mb-1.5">
              Payment Method
            </span>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-semibold transition-all ${
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs"
                        : "border-neutral-200 bg-neutral-50/50 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Place Order CTA Button */}
          <button
            onClick={placeOrder}
            disabled={cart.length === 0 || orderStatus !== "idle"}
            className="mt-3.5 w-full rounded-xl bg-neutral-900 hover:bg-black active:scale-[0.99] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-semibold text-sm py-3.5 transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          >
            {orderStatus === "loading" ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing Order…</span>
              </>
            ) : orderStatus === "success" ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Order Placed!</span>
              </>
            ) : (
              <>
                <span>Complete Order</span>
                <span className="font-mono-num text-neutral-400 font-normal">
                  (₱{money(total)})
                </span>
              </>
            )}
          </button>
        </aside>
      </div>

      {/* Add Custom Item Modal */}
      {customItemModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-neutral-900">Add Custom Item</h3>
              <button
                onClick={() => {
                  setCustomItemModal(false);
                  setCustomItemName("");
                  setCustomItemPrice("");
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="text-xs font-semibold text-neutral-700 mb-1 block">Item Name</label>
            <input
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              placeholder="e.g. Special Pastry, Extra Shot"
              autoFocus
              className="w-full mb-3.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white"
            />

            <label className="text-xs font-semibold text-neutral-700 mb-1 block">Price (₱)</label>
            <input
              type="number"
              value={customItemPrice}
              onChange={(e) => setCustomItemPrice(e.target.value)}
              placeholder="0.00"
              className="w-full mb-5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-medium text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:bg-white"
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCustomItemModal(false);
                  setCustomItemName("");
                  setCustomItemPrice("");
                }}
                className="flex-1 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCustomItem}
                disabled={!customItemName.trim() || !(Number(customItemPrice) > 0)}
                className="flex-1 rounded-xl bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 text-white text-xs font-semibold py-2.5 transition-all shadow-xs"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Variant Selection Modal (Size / Temperature) */}
      {variantModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-neutral-900">{variantModal.product.name}</h3>
                <p className="text-xs text-neutral-400">Select drink temperature and size</p>
              </div>
              <button
                onClick={() => setVariantModal(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {variantModal.mode === "tempSize" && (
              <div className="mb-4">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                  Temperature
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Hot", "Iced"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setVariantModal((v) => ({ ...v, temp: t }))}
                      className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                        variantModal.temp === t
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs"
                          : "border-neutral-200 bg-neutral-50/60 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((s) => {
                  const active = variantModal.size === s.label;
                  return (
                    <button
                      key={s.label}
                      onClick={() => setVariantModal((v) => ({ ...v, size: s.label }))}
                      className={`rounded-xl border p-2.5 text-center transition-all ${
                        active
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-2xs"
                          : "border-neutral-200 bg-neutral-50/60 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className={`font-mono-num text-[11px] font-semibold mt-0.5 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                        ₱{money(variantModal.product.price + s.extra)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setVariantModal(null)}
                className="flex-1 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmVariant}
                className="flex-1 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold py-2.5 transition-all shadow-xs"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Processing / Confirmation Modal */}
      {orderStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-fade-in">
          <div className="w-[320px] rounded-2xl border border-neutral-200 bg-white p-7 text-center shadow-2xl">
            {orderStatus === "loading" ? (
              <>
                <RefreshCw className="mx-auto mb-4 h-8 w-8 text-neutral-900 animate-spin" />
                <p className="font-display text-base font-bold text-neutral-900 mb-1">Syncing Order…</p>
                <p className="text-xs text-neutral-500 mb-5">Connecting to ledger and CRM webhook</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-[width] ease-linear"
                    style={{ width: barActive ? "100%" : "0%", transitionDuration: "5000ms" }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-3 text-5xl animate-pop">🎉</div>
                <h3 className="font-display text-xl font-bold text-neutral-900 mb-1">Order Complete!</h3>
                <p className="text-xs text-neutral-500 mb-1">Successfully recorded into ledger.</p>
                <p className="text-xs font-mono-num font-semibold text-neutral-400">Order #{String(orderNumber - 1).padStart(4, "0")}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-16 right-5 z-50 max-w-sm rounded-2xl border px-4 py-3 shadow-xl flex items-start gap-2.5 backdrop-blur-md bg-white/95 animate-slide-in ${
            toast.tone === "error" ? "border-red-200 text-neutral-900" : "border-neutral-900 text-neutral-900"
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
              toast.tone === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
          />
          <p className="text-xs font-semibold leading-snug">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
