import { useState } from "react";
import { LogOut, RotateCcw, Store } from "lucide-react";
import logo from "./assets/logo.jpg";
import { DEMO_ADMIN } from "./data";
import { actions, useStore } from "./store";

const money = (n) => Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function AdminLogin() {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  function submit(e) {
    e.preventDefault();
    if (u === DEMO_ADMIN.username && p === DEMO_ADMIN.password) actions.adminLogin();
    else setErr("Mali ang username o password.");
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl border border-neutral-200 shadow-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="h-16 w-16 rounded-full overflow-hidden ring-4 ring-neutral-100 bg-white"><img src={logo} alt="Cafe Brewm" className="h-full w-full object-cover scale-[1.06]" /></div>
          <h1 className="mt-4 text-xl font-bold font-display">Admin Ledger</h1>
        </div>
        <label className="text-xs font-semibold text-neutral-600 block mb-1.5">Username</label>
        <input value={u} onChange={(e) => { setU(e.target.value); setErr(""); }} placeholder="admin" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm mb-3 outline-none focus:border-neutral-900 focus:bg-white" />
        <label className="text-xs font-semibold text-neutral-600 block mb-1.5">Password</label>
        <input type="password" value={p} onChange={(e) => { setP(e.target.value); setErr(""); }} placeholder="Password" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 focus:bg-white" />
        {err && <p className="text-xs text-rose-600 font-medium mt-2">{err}</p>}
        <button className="w-full mt-5 rounded-xl bg-neutral-900 text-white text-sm font-bold py-3 hover:bg-neutral-800">Login</button>
        <a href="#/" className="block text-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 mt-3">← Bumalik sa POS</a>
      </form>
    </div>
  );
}

export default function Ledger() {
  const { admin, orders } = useStore();
  if (!admin) return <AdminLogin />;

  const sorted = [...orders].sort((a, b) => b.orderNumber - a.orderNumber);
  const sales = orders.reduce((s, o) => s + o.total, 0);
  const stats = [
    { label: "Total Sales", value: `₱${money(sales)}` },
    { label: "Orders", value: orders.length },
    { label: "Average Order", value: `₱${money(orders.length ? sales / orders.length : 0)}` },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-neutral-200 px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-neutral-200 bg-white"><img src={logo} alt="" className="h-full w-full object-cover scale-[1.06]" /></div>
        <span className="font-display font-bold tracking-tight">Cafe Brewm Ledger</span>
        <div className="ml-auto flex items-center gap-2 text-xs font-semibold">
          <a href="#/" className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 hover:bg-neutral-50"><Store className="h-3.5 w-3.5" />POS</a>
          <button onClick={actions.adminLogout} className="flex items-center gap-1 rounded-lg bg-neutral-900 text-white px-2.5 py-1.5 hover:bg-neutral-800"><LogOut className="h-3.5 w-3.5" />Logout</button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
        <div className="grid sm:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-neutral-200 p-4">
              <div className="text-xs font-semibold text-neutral-500">{s.label}</div>
              <div className="text-2xl font-bold font-display mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        <section className="rounded-2xl bg-white border border-neutral-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <h2 className="font-display font-bold">Orders</h2>
            <button onClick={actions.reset} className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"><RotateCcw className="h-3.5 w-3.5" />Reset data</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs text-neutral-500 text-left">
                <tr>{["Order #", "Customer", "Staff", "Items", "Type", "Time", "Total"].map((h) => <th key={h} className="px-4 py-2 font-semibold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sorted.map((o) => (
                  <tr key={o.orderNumber}>
                    <td className="px-4 py-2.5 font-bold">#{String(o.orderNumber).padStart(4, "0")}</td>
                    <td className="px-4 py-2.5">{o.customer}</td>
                    <td className="px-4 py-2.5">{o.staff}</td>
                    <td className="px-4 py-2.5 text-neutral-600 min-w-[180px]">{o.items}</td>
                    <td className="px-4 py-2.5">{o.orderType}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{o.time}</td>
                    <td className="px-4 py-2.5 font-bold whitespace-nowrap">₱{money(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
