import { useState, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Bell,
  Printer,
  ArrowLeft,
  Wallet,
  CreditCard,
  Banknote,
  Coffee,
  CupSoda,
  Croissant,
  Sandwich,
  Cookie,
  Soup,
  Cake,
  Check,
} from "lucide-react";
import logo from "./assets/logo.jpg";

const PRODUCTS = [
  { id: 1, name: "Espresso", category: "Coffee", price: 3.5, icon: Coffee },
  { id: 2, name: "Cappuccino", category: "Coffee", price: 4.5, icon: Coffee },
  { id: 3, name: "Caffè Latte", category: "Coffee", price: 4.75, icon: Coffee },
  { id: 4, name: "Flat White", category: "Coffee", price: 4.25, icon: Coffee },
  { id: 5, name: "Americano", category: "Coffee", price: 3.75, icon: Coffee },
  { id: 6, name: "Cold Brew", category: "Cold Brew", price: 4.8, icon: CupSoda },
  { id: 7, name: "Iced Latte", category: "Cold Brew", price: 5.0, icon: CupSoda },
  { id: 8, name: "Nitro Cold Brew", category: "Cold Brew", price: 5.5, originalPrice: 6.0, icon: CupSoda },
  { id: 9, name: "Butter Croissant", category: "Pastries", price: 3.25, icon: Croissant },
  { id: 10, name: "Almond Croissant", category: "Pastries", price: 3.95, icon: Croissant },
  { id: 11, name: "Oat Cookie", category: "Pastries", price: 2.5, icon: Cookie },
  { id: 12, name: "Turkey Club", category: "Sandwiches", price: 8.5, icon: Sandwich },
  { id: 13, name: "Caprese Panini", category: "Sandwiches", price: 7.95, icon: Sandwich },
  { id: 14, name: "Tomato Basil Soup", category: "Sandwiches", price: 5.25, icon: Soup },
  { id: 15, name: "Pumpkin Spice Latte", category: "Seasonal", price: 5.25, originalPrice: 5.75, icon: Coffee },
  { id: 16, name: "Carrot Cake Slice", category: "Seasonal", price: 4.5, icon: Cake },
];

const CATEGORIES = ["All Items", "Coffee", "Cold Brew", "Pastries", "Sandwiches", "Seasonal"];
const ORDER_TYPES = ["Pickup", "Delivery", "Dine In"];
const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet },
];
const TAX_RATE = 0.05;
const COST_MARGIN = 0.4; // estimated cost as a % of price, used for profit/loss reporting
const N8N_WEBHOOK_URL = "https://tech12312.app.n8n.cloud/webhook/pos-order";

function money(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PosApp() {
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
        text: data?.message || `Order #${String(payload.orderNumber).padStart(4, "0")} logged sa ledger!`,
        tone: "success",
      };
    } catch (err) {
      return { text: "Order placed, pero hindi na-sync sa ledger (check n8n connection).", tone: "error" };
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
                      <p className="px-3 py-6 text-center text-sm text-neutral-400">Walang notification pa.</p>
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
            <button className="h-9 w-9 rounded-sm border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900">
              <ArrowLeft className="h-4 w-4" />
            </button>
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
              const inCart = cart.find((i) => i.id === p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
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
        <aside className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-200 bg-neutral-50 px-5 py-5 flex flex-col">
          <div className="flex items-baseline justify-between mb-4">
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
            placeholder="Customer name (para sa ledger)"
            className="w-full mb-4 rounded-sm border border-neutral-200 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 px-3 py-2 outline-none focus:border-neutral-900"
          />

          <div className="flex-1 space-y-3 mb-4 max-h-[360px] lg:max-h-none overflow-y-auto no-scrollbar">
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

          <div className="border-t border-dashed border-neutral-200 pt-3 space-y-1.5">
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

          <div className="mt-4">
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
            className="mt-4 w-full rounded-sm bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-medium text-sm uppercase tracking-wide py-3 transition-colors flex items-center justify-center gap-2"
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

      {orderStatus !== "idle" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[300px] rounded-sm border border-neutral-200 bg-white px-8 py-8 text-center">
            {orderStatus === "loading" ? (
              <>
                <RefreshCw className="mx-auto mb-4 h-8 w-8 text-neutral-900 animate-spin" />
                <p className="font-display text-base mb-1">Pinoproseso ang order…</p>
                <p className="text-xs text-neutral-500 mb-4">Sini-sync sa ledger, CRM, at Slack</p>
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
                <p className="text-sm text-neutral-500">Salamat sa order!</p>
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
