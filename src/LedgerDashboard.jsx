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
} from "lucide-react";

const LEDGER_API_URL = "https://tech12312.app.n8n.cloud/webhook/pos-ledger-data";

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
  { key: "items", label: "Items" },
  { key: "paymentMethod", label: "Payment" },
  { key: "orderType", label: "Order type" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "total", label: "Total" },
];

export default function LedgerDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selected, setSelected] = useState(new Set());

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

  const filtered = useMemo(() => {
    let list = orders;
    if (selectedMonth !== "All") list = list.filter((o) => o.month === selectedMonth);
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
  }, [orders, selectedMonth, query, sortKey, sortDir]);

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
    const header = ["Order #", "Customer", "Items", "Payment", "Order Type", "Day", "Date", "Time", "Subtotal", "Discount", "Tax", "Total"];
    const lines = [header.join(",")];
    for (const o of rows) {
      lines.push(
        [
          o.orderNumber,
          `"${(o.customer || "").replace(/"/g, '""')}"`,
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

  return (
    <div className="min-h-screen w-full bg-[#F7F8FA] text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-mono-num { font-family: 'IBM Plex Mono', monospace; font-variant-numeric: tabular-nums; }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Ledger</h1>
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
          </div>
        </div>

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
      </div>
    </div>
  );
}
