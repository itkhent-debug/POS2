import { useMemo, useState } from "react";
import { Coffee, Minus, Plus, Trash2, LogOut, LineChart, Lock } from "lucide-react";
import logo from "./assets/logo.jpg";
import { CATEGORIES, DEMO_STAFF, ORDER_TYPES, PRODUCTS, TAX_RATE } from "./data";
import { actions, useStore } from "./store";

const money = (n) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Logo({ size }) {
  return (
    <div className={`${size} rounded-full overflow-hidden shadow-md ring-4 ring-white bg-white`}>
      <img src={logo} alt="Cafe Brewm" className="h-full w-full object-cover scale-[1.06]" />
    </div>
  );
}

function StaffLogin() {
  const [name, setName] = useState(DEMO_STAFF[0].name);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const ok = DEMO_STAFF.find((s) => s.name === name && s.password === password);
    if (!ok) return setError("Mali ang password.");
    actions.staffLogin(name);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <Logo size="h-20 w-20" />
          <h1 className="mt-4 text-2xl font-bold font-display tracking-tight">Cafe Brewm POS</h1>
          <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mt-1">Staff Terminal Login</p>
        </div>
        <label className="text-xs font-semibold text-neutral-600 block mb-1.5">Staff</label>
        <select value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm mb-3">
          {DEMO_STAFF.map((s) => <option key={s.name}>{s.name}</option>)}
        </select>
        <label className="text-xs font-semibold text-neutral-600 block mb-1.5">Password</label>
        <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Password"
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white" />
        {error && <p className="text-xs text-rose-600 font-medium mt-2">{error}</p>}
        <button className="w-full mt-5 rounded-xl bg-neutral-900 text-white text-sm font-bold py-3 hover:bg-neutral-800 active:scale-[0.99] transition">Time In</button>
        <a href="#/ledger" className="block text-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 mt-3">Pumunta sa Ledger →</a>
      </form>
    </div>
  );
}

export default function Pos() {
  const { staff, orders } = useStore();
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState(ORDER_TYPES[0]);
  const [discountPct, setDiscountPct] = useState(0);
  const [customer, setCustomer] = useState("");
  const [toast, setToast] = useState("");

  const products = useMemo(() => PRODUCTS.filter((p) => category === "All" || p.category === category), [category]);
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = subtotal * (discountPct / 100);
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;
  const nextNumber = orders.reduce((m, o) => Math.max(m, o.orderNumber), 0) + 1;

  if (!staff) return <StaffLogin />;

  const add = (p) => setCart((c) => (c.some((i) => i.id === p.id) ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { ...p, qty: 1 }]));
  const change = (id, d) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0));

  function place() {
    if (!cart.length) return;
    const now = new Date();
    actions.addOrder({
      orderNumber: nextNumber,
      customer: customer.trim() || "Guest",
      staff: staff.name,
      items: cart.map((i) => `${i.name} x${i.qty}`).join(", "),
      orderType,
      total: Math.round(total * 100) / 100,
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      date: now.toISOString().slice(0, 10),
    });
    setCart([]); setDiscountPct(0); setCustomer("");
    setToast(`Order #${String(nextNumber).padStart(4, "0")} na-save`);
    setTimeout(() => setToast(""), 2600);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <Logo size="h-9 w-9" />
        <span className="font-display font-bold tracking-tight">Cafe Brewm</span>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 border border-neutral-200 rounded px-1.5 py-0.5">POS</span>
        <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
          <span className="hidden sm:inline text-neutral-500">Staff: {staff.name}</span>
          <a href="#/ledger" className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 hover:bg-neutral-50"><LineChart className="h-3.5 w-3.5" />Ledger</a>
          <button onClick={actions.staffLogout} className="flex items-center gap-1 rounded-lg bg-neutral-900 text-white px-2.5 py-1.5 hover:bg-neutral-800"><LogOut className="h-3.5 w-3.5" />Time Out</button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-[1fr_360px] gap-4 p-4 sm:p-6">
        <section>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold border transition ${category === c ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"}`}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map((p) => (
              <button key={p.id} onClick={() => add(p)} className="text-left rounded-2xl bg-white border border-neutral-200 p-4 hover:border-neutral-900 hover:shadow-md active:scale-[0.98] transition">
                <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center mb-3"><Coffee className="h-4 w-4 text-neutral-700" /></div>
                <div className="text-sm font-bold leading-tight">{p.name}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{p.category}</div>
                <div className="text-sm font-bold mt-2">₱{money(p.price)}</div>
              </button>
            ))}
          </div>
        </section>

        <aside className="lg:sticky lg:top-16 self-start rounded-2xl bg-white border border-neutral-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold">Current Order</h2>
            <span className="text-xs font-semibold text-neutral-500">#{String(nextNumber).padStart(4, "0")}</span>
          </div>
          <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name (optional)"
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm mb-3 outline-none focus:border-neutral-900 focus:bg-white" />
          <div className="flex gap-1.5 mb-3">
            {ORDER_TYPES.map((t) => (
              <button key={t} onClick={() => setOrderType(t)} className={`flex-1 rounded-lg py-1.5 text-xs font-bold border ${orderType === t ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200"}`}>{t}</button>
            ))}
          </div>
          <div className="min-h-[96px] max-h-64 overflow-y-auto divide-y divide-neutral-100">
            {cart.length === 0 && <p className="text-xs text-neutral-400 py-6 text-center">Wala pang item. Pindutin ang menu para magdagdag.</p>}
            {cart.map((i) => (
              <div key={i.id} className="flex items-center gap-2 py-2">
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{i.name}</div><div className="text-xs text-neutral-500">₱{money(i.price)}</div></div>
                <button onClick={() => change(i.id, -1)} className="h-6 w-6 rounded-md border border-neutral-200 flex items-center justify-center">{i.qty === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}</button>
                <span className="w-5 text-center text-sm font-bold">{i.qty}</span>
                <button onClick={() => change(i.id, 1)} className="h-6 w-6 rounded-md border border-neutral-200 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-500">Discount:</span>
            <select value={discountPct} onChange={(e) => setDiscountPct(Number(e.target.value))} className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 font-semibold">
              <option value={0}>None</option><option value={5}>5% Senior / PWD</option><option value={10}>10% Staff / VIP</option><option value={15}>15% Promo</option>
            </select>
          </div>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-neutral-500"><dt>Subtotal</dt><dd>₱{money(subtotal)}</dd></div>
            {discount > 0 && <div className="flex justify-between text-neutral-500"><dt>Discount</dt><dd>-₱{money(discount)}</dd></div>}
            <div className="flex justify-between text-neutral-500"><dt>Tax (5%)</dt><dd>₱{money(tax)}</dd></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-neutral-200"><dt>Total</dt><dd>₱{money(total)}</dd></div>
          </dl>
          <button onClick={place} disabled={!cart.length} className="w-full mt-4 rounded-xl bg-neutral-900 text-white text-sm font-bold py-3 disabled:opacity-40 hover:bg-neutral-800 active:scale-[0.99] transition">Place Order</button>
        </aside>
      </div>

      {toast && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-xl bg-neutral-900 text-white text-sm font-semibold px-4 py-2.5 shadow-lg">{toast}</div>}
    </div>
  );
}
