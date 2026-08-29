import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Filter,
  ArrowUpDown,
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet,
  Package,
  LogOut,
  Plus,
  X,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import logo from "./assets/logo.jpg";

const INVENTORY_API_URL = "https://redeem-dark-talking-handling.trycloudflare.com/webhook/pos-inventory";
const SHIFTS_API_URL = "https://redeem-dark-talking-handling.trycloudflare.com/webhook/pos-shifts";
const RESET_API_URL = "https://redeem-dark-talking-handling.trycloudflare.com/webhook/pos-reset-data";

const LEDGER_API_URL = "https://redeem-dark-talking-handling.trycloudflare.com/webhook/pos-ledger-data";
const ADMIN_USERNAME = "admincaffe";
const ADMIN_PASSWORD = "caffeprox12";
const AUTH_KEY = "cafe-brewm-ledger-auth";
const SESSION_LOG_URL = "https://redeem-dark-talking-handling.trycloudflare.com/webhook/pos-session-log";

function logSession(type, name, action, token) {
  fetch(SESSION_LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name, action, token }),
  }).catch(() => {});
}

const DONUT_COLORS = ["#C9A24B", "#7A2E2E", "#3B82F6", "#8A9A82", "#F59E0B", "#94A3B8"];

function peso(n) {
  return (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthLabel(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function parseItems(itemsStr) {
  if (!itemsStr) return [];
  return itemsStr
    .split(",")
    .map((chunk) => chunk.trim())
    .map((chunk) => {
      const match = chunk.match(/^(.*)\s+x(\d+)$/);
      if (!match) return null;
      return { name: match[1].trim(), qty: Number(match[2]) };
    })
    .filter(Boolean);
}

const COLUMNS = [
  { key: "orderNumber", label: "Order #" },
  { key: "customer", label: "Customer" },
  { key: "staff", label: "Staff" },
  { key: "items", label: "Items" },
  { key: "paymentMethod", label: "Payment" },
  { key: "orderType", label: "Order type" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "total", label: "Total" },
];

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setError("");
      onLogin();
    } else {
      setError("Maling username o password.");
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F8FA] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Cafe Brewm" className="h-20 w-20 rounded-full object-cover shadow-sm mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Cafe Brewm Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Admin access only</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admincaffe"
              autoFocus
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 transition-colors"
          >
            Log in
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-5">© {new Date().getFullYear()} Cafe Brewm. Internal use only.</p>
      </div>
    </div>
  );
}

function InventoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", quantity: "", unit: "pcs", lowStockThreshold: "5" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(INVENTORY_API_URL);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError("Hindi ma-load ang inventory. Check kung Active ang n8n workflow.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.quantity) return;
    setSaving(true);
    try {
      await fetch(INVENTORY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category.trim() || "Uncategorized",
          quantityDelta: Number(form.quantity),
          unit: form.unit,
          lowStockThreshold: Number(form.lowStockThreshold) || 0,
        }),
      });
      setForm({ name: "", category: "", quantity: "", unit: "pcs", lowStockThreshold: "5" });
      setModalOpen(false);
      await load();
    } catch (err) {
      setError("Hindi na-save ang item. Subukan ulit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {items.length} item{items.length !== 1 ? "s" : ""} sa stock
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-600 px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add / Restock Item
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Item</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Category</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Quantity</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Unit</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Last updated</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">Loading inventory…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-rose-500">{error}</td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Walang stock items pa. I-click ang "Add / Restock Item" para magdagdag.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                items.map((it) => {
                  const low = Number(it.quantity) <= Number(it.lowStockThreshold);
                  return (
                    <tr key={it.name} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-medium text-slate-800">{it.name}</td>
                      <td className="px-3 py-2.5 text-slate-500">{it.category}</td>
                      <td className="px-3 py-2.5 font-mono-num text-slate-900">{it.quantity}</td>
                      <td className="px-3 py-2.5 text-slate-500">{it.unit}</td>
                      <td className="px-3 py-2.5">
                        {low ? (
                          <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-600 text-xs font-medium px-2 py-0.5">
                            Low stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5">
                            OK
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{it.updatedAt}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-900">Add / Restock Item</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Item name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="hal. Coffee Beans"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="hal. Raw Materials"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Quantity to add</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder="hal. 10"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Unit</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="pcs / kg / L"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Low stock alert kapag baba sa:</label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium py-2.5 transition-colors mt-2"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffTab() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(SHIFTS_API_URL);
      const data = await res.json();
      setShifts(Array.isArray(data.shifts) ? data.shifts : []);
    } catch (err) {
      setError("Hindi ma-load ang staff records. Check kung Active ang n8n workflow.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function downloadPdf(shift) {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cafe Brewm - Shift Report", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 14, 24);

    autoTable(doc, {
      startY: 32,
      head: [["Field", "Value"]],
      body: [
        ["Staff", shift.staffName],
        ["Time In", `${shift.dayIn}, ${shift.dateIn} at ${shift.timeIn}`],
        ["Time Out", shift.timeOut ? `${shift.dayOut}, ${shift.dateOut} at ${shift.timeOut}` : "Still on duty"],
        ["Status", shift.status],
        ["Orders handled", shift.orderCount],
        ["Total sales", `P${peso(shift.totalSales)}`],
        ["Total profit", `P${peso(shift.totalProfit)}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`shift-${shift.staffName}-${shift.dateIn}.pdf`);
  }

  async function downloadAllPdf() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Cafe Brewm - Staff Shift Log", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString("en-US")}`, 14, 24);

    autoTable(doc, {
      startY: 32,
      head: [["Staff", "Time In", "Time Out", "Status", "Orders", "Sales", "Profit"]],
      body: shifts.map((s) => [
        s.staffName,
        `${s.dayIn}, ${s.dateIn} ${s.timeIn}`,
        s.timeOut ? `${s.dayOut}, ${s.dateOut} ${s.timeOut}` : "Active",
        s.status,
        s.orderCount,
        `P${peso(s.totalSales)}`,
        `P${peso(s.totalProfit)}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 8 },
    });

    doc.save(`staff-shift-log-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {shifts.length} shift{shifts.length !== 1 ? "s" : ""} naka-record
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-600 px-3 py-2 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={downloadAllPdf}
            disabled={shifts.length === 0}
            className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium px-3.5 py-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download as PDF
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-2.5 font-medium text-slate-500">Staff</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Time In</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Time Out</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Status</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Orders</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Sales</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500">Profit</th>
                <th className="text-left px-3 py-2.5 font-medium text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">Loading staff records…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-rose-500">{error}</td>
                </tr>
              )}
              {!loading && !error && shifts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Walang shift records pa. Mag-log in ang staff sa POS para magsimula ang tracking.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                shifts.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{s.staffName}</td>
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{s.dayIn}, {s.dateIn} {s.timeIn}</td>
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">
                      {s.timeOut ? `${s.dayOut}, ${s.dateOut} ${s.timeOut}` : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {s.status === "active" ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5">
                          On duty
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono-num text-slate-900">{s.orderCount}</td>
                    <td className="px-3 py-2.5 font-mono-num text-slate-900">₱{peso(s.totalSales)}</td>
                    <td className="px-3 py-2.5 font-mono-num text-emerald-600">₱{peso(s.totalProfit)}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => downloadPdf(s)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function LedgerDashboard() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === "true");
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedStaff, setSelectedStaff] = useState("All");
  const [selectedDay, setSelectedDay] = useState("All");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selected, setSelected] = useState(new Set());
  const [resetOpen, setResetOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(LEDGER_API_URL);
      const data = await res.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError("Hindi ma-load ang ledger data. Check kung Active ang n8n workflow.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const months = useMemo(() => {
    const set = new Set(orders.map((o) => o.month).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [orders]);

  const staffNames = useMemo(() => {
    const set = new Set(orders.map((o) => o.staff).filter(Boolean));
    return Array.from(set).sort();
  }, [orders]);

  const days = useMemo(() => {
    const set = new Set(orders.map((o) => o.date).filter(Boolean));
    return Array.from(set).sort().reverse();
  }, [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (selectedMonth !== "All") list = list.filter((o) => o.month === selectedMonth);
    if (selectedStaff !== "All") list = list.filter((o) => o.staff === selectedStaff);
    if (selectedDay !== "All") list = list.filter((o) => o.date === selectedDay);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          String(o.orderNumber).toLowerCase().includes(q) ||
          (o.customer || "").toLowerCase().includes(q) ||
          (o.items || "").toLowerCase().includes(q)
      );
    }
    const sorted = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      let cmp;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [orders, selectedMonth, selectedStaff, selectedDay, query, sortKey, sortDir]);

  const summary = useMemo(() => {
    const revenue = filtered.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const profit = filtered.reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
    const customers = new Set(filtered.map((o) => o.customer)).size;
    const avg = filtered.length ? revenue / filtered.length : 0;
    const itemsSold = filtered.reduce(
      (sum, o) => sum + parseItems(o.items).reduce((s, it) => s + it.qty, 0),
      0
    );
    return { revenue, profit, customers, avg, count: filtered.length, itemsSold };
  }, [filtered]);

  const topProducts = useMemo(() => {
    const tally = new Map();
    for (const o of filtered) {
      for (const it of parseItems(o.items)) {
        tally.set(it.name, (tally.get(it.name) || 0) + it.qty);
      }
    }
    const sorted = Array.from(tally.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
    const top = sorted.slice(0, 5);
    const othersQty = sorted.slice(5).reduce((s, p) => s + p.qty, 0);
    if (othersQty > 0) top.push({ name: "Others", qty: othersQty });
    const total = top.reduce((s, p) => s + p.qty, 0);
    return top.map((p, idx) => ({
      ...p,
      pct: total ? (p.qty / total) * 100 : 0,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    }));
  }, [filtered]);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function toggleRow(orderNumber) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  }

  function exportCsv() {
    const rows = filtered;
    const header = ["Order #", "Customer", "Staff", "Items", "Payment", "Order Type", "Day", "Date", "Time", "Subtotal", "Discount", "Tax", "Total"];
    const lines = [header.join(",")];
    for (const o of rows) {
      lines.push(
        [
          o.orderNumber,
          `"${(o.customer || "").replace(/"/g, '""')}"`,
          `"${(o.staff || "").replace(/"/g, '""')}"`,
          `"${(o.items || "").replace(/"/g, '""')}"`,
          o.paymentMethod,
          o.orderType,
          o.day,
          o.date,
          o.time,
          o.subtotal,
          o.discount,
          o.tax,
          o.total,
        ].join(",")
      );
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const label = selectedMonth === "All" ? "all" : selectedMonth;
    a.href = url;
    a.download = `ledger-${label}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function downloadFullBackupPdf(allOrders, allShifts, allInventory) {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const stamp = new Date().toLocaleString("en-US");

    doc.setFontSize(18);
    doc.text("Cafe Brewm - Full Backup", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated before reset: ${stamp}`, 14, 24);

    doc.setFontSize(13);
    doc.setTextColor(20);
    doc.text(`Orders (${allOrders.length})`, 14, 36);
    autoTable(doc, {
      startY: 40,
      head: [["Order #", "Customer", "Staff", "Date", "Time", "Total", "Profit"]],
      body: allOrders.map((o) => [
        o.orderNumber, o.customer, o.staff || "-", o.date, o.time, `P${peso(o.total)}`, `P${peso(o.profit)}`,
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.addPage();
    doc.setFontSize(13);
    doc.text(`Staff Shifts (${allShifts.length})`, 14, 18);
    autoTable(doc, {
      startY: 24,
      head: [["Staff", "Time In", "Time Out", "Status", "Orders", "Sales", "Profit"]],
      body: allShifts.map((s) => [
        s.staffName,
        `${s.dayIn}, ${s.dateIn} ${s.timeIn}`,
        s.timeOut ? `${s.dayOut}, ${s.dateOut} ${s.timeOut}` : "Active",
        s.status,
        s.orderCount,
        `P${peso(s.totalSales)}`,
        `P${peso(s.totalProfit)}`,
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.addPage();
    doc.setFontSize(13);
    doc.text(`Inventory (${allInventory.length})`, 14, 18);
    autoTable(doc, {
      startY: 24,
      head: [["Item", "Category", "Quantity", "Unit", "Low stock at"]],
      body: allInventory.map((it) => [it.name, it.category, it.quantity, it.unit, it.lowStockThreshold]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`cafe-brewm-backup-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  async function handleResetConfirm() {
    setResetLoading(true);
    setResetError(null);
    try {
      const [ordersRes, shiftsRes, inventoryRes] = await Promise.all([
        fetch(LEDGER_API_URL).then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch(SHIFTS_API_URL).then((r) => r.json()).catch(() => ({ shifts: [] })),
        fetch(INVENTORY_API_URL).then((r) => r.json()).catch(() => ({ items: [] })),
      ]);
      const allOrders = ordersRes.orders || [];
      const allShifts = shiftsRes.shifts || [];
      const allInventory = inventoryRes.items || [];

      await downloadFullBackupPdf(allOrders, allShifts, allInventory);

      const recordCount = allOrders.length + allShifts.length + allInventory.length;
      const minDelay = Math.min(4000, Math.max(1200, 400 + recordCount * 60));

      const [resetResult] = await Promise.all([
        fetch(RESET_API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
          .then((r) => r.json())
          .catch(() => null),
        new Promise((resolve) => setTimeout(resolve, minDelay)),
      ]);

      if (!resetResult?.success) {
        setResetError("Na-download ang backup, pero hindi na-confirm ang reset. Check kung Active ang n8n workflow.");
        setResetLoading(false);
        return;
      }

      window.location.reload();
    } catch (err) {
      setResetError("May error habang nire-reset. Subukan ulit.");
      setResetLoading(false);
    }
  }

  if (!authed) {
    return (
      <LoginScreen
        onLogin={() => {
          const sessionToken = crypto.randomUUID();
          sessionStorage.setItem(AUTH_KEY, "true");
          sessionStorage.setItem(AUTH_KEY + "-token", sessionToken);
          logSession("admin", ADMIN_USERNAME, "login", sessionToken);
          setAuthed(true);
        }}
      />
    );
  }

  function logout() {
    const token = sessionStorage.getItem(AUTH_KEY + "-token");
    logSession("admin", ADMIN_USERNAME, "logout", token);
    sessionStorage.removeItem(AUTH_KEY + "-token");
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F8FA] text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-mono-num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Cafe Brewm" className="h-9 w-9 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-slate-900">Cafe Brewm Ledger</h1>
            <span className="text-sm font-medium text-blue-600">{summary.count} Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-600 px-3 py-2 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3.5 py-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={() => { setResetOpen(true); setResetConfirmText(""); setResetError(null); }}
              className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-white text-sm font-medium text-rose-600 px-3 py-2 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Reset Data
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white text-sm font-medium text-slate-500 px-3 py-2 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {resetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-lg p-6">
              {resetLoading ? (
                <div className="text-center py-4">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 text-slate-900 animate-spin" />
                  <p className="text-sm font-medium text-slate-900 mb-1">Gumagawa ng backup PDF at nililinis ang data…</p>
                  <p className="text-xs text-slate-400">Huwag isara ang tab na ito.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3 text-rose-600">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="text-base font-semibold">Reset lahat ng data?</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Permanenteng mabubura ang <strong>lahat</strong> ng orders, customers, staff shifts, at inventory — sa Google Sheets AT MySQL. Awtomatikong gagawa muna ng backup PDF bago ito magpatuloy. Hindi na maibabalik ito pagkatapos.
                  </p>
                  {resetError && <p className="text-sm text-rose-600 mb-3">{resetError}</p>}
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    I-type ang <strong>RESET</strong> para kumpirmahin:
                  </label>
                  <input
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 mb-4"
                    placeholder="RESET"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setResetOpen(false)}
                      className="rounded-md border border-slate-200 text-sm font-medium text-slate-600 px-3.5 py-2 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetConfirm}
                      disabled={resetConfirmText !== "RESET"}
                      className="rounded-md bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-sm font-medium px-3.5 py-2 transition-colors"
                    >
                      Backup + Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "orders" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "inventory" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "staff" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Staff
          </button>
        </div>

        {activeTab === "inventory" ? (
          <InventoryTab />
        ) : activeTab === "staff" ? (
          <StaffTab />
        ) : (
        <>
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1.5">
              <Receipt className="h-3.5 w-3.5" /> Orders
            </div>
            <p className="font-mono-num text-xl font-semibold text-slate-900">{summary.count}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Revenue
            </div>
            <p className="font-mono-num text-xl font-semibold text-emerald-600">₱{peso(summary.revenue)}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1.5">
              {summary.profit >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              Est. Profit
            </div>
            <p className={`font-mono-num text-xl font-semibold ${summary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {summary.profit >= 0 ? "" : "-"}₱{peso(Math.abs(summary.profit))}
            </p>
            <p className={`text-[11px] font-medium mt-0.5 ${summary.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {summary.profit >= 0 ? "Kumita ✓" : "Nalugi ⚠"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1.5">
              <Users className="h-3.5 w-3.5" /> Customers
            </div>
            <p className="font-mono-num text-xl font-semibold text-slate-900">{summary.customers}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1.5">
              <Package className="h-3.5 w-3.5" /> Items sold
            </div>
            <p className="font-mono-num text-xl font-semibold text-slate-900">{summary.itemsSold}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1.5">
              <Wallet className="h-3.5 w-3.5" /> Avg order
            </div>
            <p className="font-mono-num text-xl font-semibold text-slate-900">₱{peso(summary.avg)}</p>
          </div>
        </div>

        {/* Top products donut */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Top-selling items {selectedMonth !== "All" ? `— ${monthLabel(selectedMonth)}` : ""}</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">Walang data pa para sa donut chart.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <svg width="160" height="160" viewBox="0 0 120 120" className="shrink-0">
                <g transform="rotate(-90 60 60)">
                  {(() => {
                    const r = 45;
                    const circumference = 2 * Math.PI * r;
                    let cumulative = 0;
                    return topProducts.map((p, idx) => {
                      const dash = (p.pct / 100) * circumference;
                      const el = (
                        <circle
                          key={p.name}
                          cx="60"
                          cy="60"
                          r={r}
                          fill="none"
                          stroke={p.color}
                          strokeWidth="18"
                          strokeDasharray={`${dash} ${circumference - dash}`}
                          strokeDashoffset={-((cumulative / 100) * circumference)}
                        />
                      );
                      cumulative += p.pct;
                      return el;
                    });
                  })()}
                </g>
                <text x="60" y="56" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 15, fontWeight: 700 }}>
                  {summary.itemsSold}
                </text>
                <text x="60" y="72" textAnchor="middle" className="fill-slate-400" style={{ fontSize: 9 }}>
                  items
                </text>
              </svg>

              <div className="flex-1 w-full space-y-2.5">
                {topProducts.map((p) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="text-sm text-slate-700 w-32 shrink-0 truncate">{p.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                    </div>
                    <span className="font-mono-num text-xs text-slate-500 w-16 text-right shrink-0">
                      {p.qty} ({p.pct.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none rounded-md border border-slate-200 bg-white text-sm pl-8 pr-8 py-2 outline-none focus:border-blue-500"
            >
              <option value="All">All months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="appearance-none rounded-md border border-slate-200 bg-white text-sm pl-3 pr-8 py-2 outline-none focus:border-blue-500"
            >
              <option value="All">All staff</option>
              {staffNames.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="appearance-none rounded-md border border-slate-200 bg-white text-sm pl-3 pr-8 py-2 outline-none focus:border-blue-500"
            >
              <option value="All">All days</option>
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders…"
              className="w-64 rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {(selectedStaff !== "All" || selectedDay !== "All") && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-5 py-4 mb-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-0.5">Computed total</p>
              <p className="text-sm text-slate-700">
                {selectedStaff === "All" ? "Lahat ng staff" : selectedStaff}
                {" · "}
                {selectedDay === "All" ? "Lahat ng araw" : selectedDay}
              </p>
            </div>
            <div className="flex items-center gap-6 ml-auto">
              <div>
                <p className="text-[11px] text-slate-500">Orders</p>
                <p className="font-mono-num text-lg font-semibold text-slate-900">{summary.count}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Sales</p>
                <p className="font-mono-num text-lg font-semibold text-slate-900">₱{peso(summary.revenue)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Profit</p>
                <p className="font-mono-num text-lg font-semibold text-emerald-600">₱{peso(summary.profit)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="w-10 px-4 py-2.5">
                    <input type="checkbox" disabled className="rounded border-slate-300" />
                  </th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left px-3 py-2.5 font-medium text-slate-500 whitespace-nowrap">
                      <button
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 hover:text-slate-800"
                      >
                        {col.label}
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="text-center py-10 text-slate-400">
                      Loading ledger data…
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="text-center py-10 text-rose-500">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="text-center py-10 text-slate-400">
                      Walang orders na nahanap.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  filtered.map((o) => (
                    <tr key={o.orderNumber + o.date + o.time} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.has(o.orderNumber)}
                          onChange={() => toggleRow(o.orderNumber)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-mono-num text-blue-600">#{o.orderNumber}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{o.customer}</td>
                      <td className="px-3 py-2.5 text-slate-500">{o.staff || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[240px] truncate">{o.items}</td>
                      <td className="px-3 py-2.5 text-slate-500 capitalize">{o.paymentMethod}</td>
                      <td className="px-3 py-2.5 text-slate-500">{o.orderType}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{o.date}</td>
                      <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{o.time}</td>
                      <td className="px-3 py-2.5 font-mono-num font-semibold text-slate-900 whitespace-nowrap">
                        ₱{peso(o.total)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
