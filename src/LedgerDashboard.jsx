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
  LayoutGrid,
  UserCheck,
  MessageCircle,
  Send,
  Lock,
  User,
  Coffee,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import logo from "./assets/logo.jpg";

const INVENTORY_API_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-inventory";
const SHIFTS_API_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-shifts";
const RESET_API_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-reset-data";

const LEDGER_API_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-ledger-data";
const ADMIN_USERNAME = "admincaffe";
const ADMIN_PASSWORD = "caffeprox12";
const AUTH_KEY = "cafe-brewm-ledger-auth";
const SESSION_LOG_URL = "https://n8n-production-b0b3.up.railway.app/webhook/pos-session-log";
const AI_ASSISTANT_URL = "https://n8n-production-b0b3.up.railway.app/webhook/ai-assistant";

function logSession(type, name, action, token) {
  fetch(SESSION_LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, name, action, token }),
  }).catch(() => {});
}

// Sophisticated modern color palette for charts & breakdowns
const DONUT_COLORS = ["#18181b", "#b45309", "#059669", "#2563eb", "#7c3aed", "#d97706", "#e11d48", "#64748b"];

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
  { key: "orderType", label: "Order Type" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "total", label: "Total" },
];

function MiniDonut({ data, centerValue, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 45;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width="124" height="124" viewBox="0 0 120 120">
          <g transform="rotate(-90 60 60)">
            {total === 0 ? (
              <circle cx="60" cy="60" r={r} fill="none" stroke="#f4f4f5" strokeWidth="15" />
            ) : (
              data.map((d) => {
                const pct = (d.value / total) * 100;
                const dash = (pct / 100) * circumference;
                const el = (
                  <circle
                    key={d.name}
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke={d.color}
                    strokeWidth="15"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-((cumulative / 100) * circumference)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                );
                cumulative += pct;
                return el;
              })
            )}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
          <span className="font-mono-num text-sm font-bold text-neutral-900 tracking-tight">{centerValue}</span>
          {centerLabel && <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400">{centerLabel}</span>}
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-neutral-600 font-medium truncate">{d.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono-num font-semibold text-neutral-800">{d.value}</span>
              <span className="text-[11px] text-neutral-400 w-8 text-right font-mono-num">
                {total ? ((d.value / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-xs text-neutral-400 py-3 text-center">No data yet</p>}
      </div>
    </div>
  );
}

function SalesTrendChart({ data }) {
  const width = 640;
  const height = 180;
  const padding = 20;
  const max = Math.max(1, ...data.map((d) => d.revenue));

  const points = data.map((d, idx) => {
    const x = data.length > 1 ? padding + (idx / (data.length - 1)) * (width - padding * 2) : width / 2;
    const y = height - padding - (d.revenue / max) * (height - padding * 2.2);
    return { x, y };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${points[0].x.toFixed(1)} ${height - padding} Z`
      : "";

  if (data.length === 0) {
    return <p className="text-sm text-neutral-400 py-14 text-center">No sales data yet.</p>;
  }

  if (data.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="font-mono-num text-2xl font-bold text-neutral-900">₱{peso(data[0].revenue)}</p>
        <p className="text-xs text-neutral-500 mt-1 font-medium">Total sales for {data[0].label}</p>
        <p className="text-xs text-neutral-400 mt-2">
          Trend graph activates automatically as more days are logged.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="salesTrendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#18181b" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#salesTrendGradient)" />}
        <path d={linePath} fill="none" stroke="#18181b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#18181b" strokeWidth="2" />
          </g>
        ))}
        {data.map((d, idx) => (
          <text
            key={d.date}
            x={points[idx].x}
            y={height - 2}
            textAnchor="middle"
            className="fill-neutral-400 font-mono-num"
            style={{ fontSize: 9, fontWeight: 500 }}
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function OverviewTab() {
  const [orders, setOrders] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [ordersRes, shiftsRes, inventoryRes] = await Promise.all([
        fetch(LEDGER_API_URL).then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch(SHIFTS_API_URL).then((r) => r.json()).catch(() => ({ shifts: [] })),
        fetch(INVENTORY_API_URL).then((r) => r.json()).catch(() => ({ items: [] })),
      ]);
      setOrders(Array.isArray(ordersRes.orders) ? ordersRes.orders : []);
      setShifts(Array.isArray(shiftsRes.shifts) ? shiftsRes.shifts : []);
      setInventory(Array.isArray(inventoryRes.items) ? inventoryRes.items : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const orderTypeBreakdown = useMemo(() => {
    const tally = new Map();
    for (const o of orders) {
      const key = (o.orderType || "Other").trim() || "Other";
      tally.set(key, (tally.get(key) || 0) + 1);
    }
    return Array.from(tally.entries())
      .map(([name, value], idx) => ({ name, value, color: DONUT_COLORS[idx % DONUT_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const customerBreakdown = useMemo(() => {
    const counts = new Map();
    for (const o of orders) {
      const name = o.customer || "Guest";
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    let newCustomers = 0;
    let returning = 0;
    for (const c of counts.values()) {
      if (c > 1) returning += 1;
      else newCustomers += 1;
    }
    return [
      { name: "New Customers", value: newCustomers, color: "#18181b" },
      { name: "Returning", value: returning, color: "#b45309" },
    ];
  }, [orders]);

  const weeklyVolume = useMemo(() => {
    const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const tally = new Map(order.map((d) => [d, 0]));
    for (const o of orders) {
      if (tally.has(o.day)) tally.set(o.day, tally.get(o.day) + 1);
    }
    const max = Math.max(1, ...tally.values());
    return order.map((day) => ({ day, count: tally.get(day) || 0, pct: (tally.get(day) / max) * 100 }));
  }, [orders]);

  const staffSales = useMemo(() => {
    const tally = new Map();
    for (const o of orders) {
      const key = o.staff || "Unknown";
      tally.set(key, (tally.get(key) || 0) + (Number(o.total) || 0));
    }
    const max = Math.max(1, ...tally.values());
    return Array.from(tally.entries())
      .map(([name, total], idx) => ({ name, total, pct: (total / max) * 100, color: DONUT_COLORS[idx % DONUT_COLORS.length] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [orders]);

  const lowStockItems = useMemo(
    () => inventory.filter((it) => Number(it.quantity) <= Number(it.lowStockThreshold)),
    [inventory]
  );

  const onDuty = useMemo(() => shifts.filter((s) => s.status === "active"), [shifts]);

  const salesTrend = useMemo(() => {
    const tally = new Map();
    for (const o of orders) {
      if (!o.date) continue;
      tally.set(o.date, (tally.get(o.date) || 0) + (Number(o.total) || 0));
    }
    const sortedDates = Array.from(tally.keys()).sort();
    return sortedDates.slice(-7).map((d) => {
      const parts = d.split("-");
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : d;
      return { date: d, label, revenue: tally.get(d) };
    });
  }, [orders]);

  const recentCustomers = useMemo(() => {
    return [...orders].slice(-6).reverse();
  }, [orders]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top row: Sales trend */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">Sales Trend (Last 7 Active Days)</h3>
            <p className="text-xs text-neutral-400">Daily gross revenue trajectory</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        <SalesTrendChart data={salesTrend} />
      </div>

      {/* Donut row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Order Types Breakdown</h3>
          <p className="text-xs text-neutral-400 mb-4">Dine-in vs. Take-out distributions</p>
          <MiniDonut data={orderTypeBreakdown} centerValue={orders.length} centerLabel="orders" />
        </div>
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Customer Retention</h3>
          <p className="text-xs text-neutral-400 mb-4">New vs. Returning customer ratio</p>
          <MiniDonut
            data={customerBreakdown}
            centerValue={`${customerBreakdown[1] ? Math.round((customerBreakdown[1].value / Math.max(1, customerBreakdown[0].value + customerBreakdown[1].value)) * 100) : 0}%`}
            centerLabel="returning"
          />
        </div>
      </div>

      {/* Funnel + stage distribution row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Weekly Order Volume</h3>
          <p className="text-xs text-neutral-400 mb-4">Orders count by day of week</p>
          <div className="space-y-2.5">
            {weeklyVolume.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-500 w-24 shrink-0">{d.day}</span>
                <div className="flex-1 h-4 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(d.pct, d.count ? 10 : 0)}%`, backgroundColor: "#18181b" }}
                  />
                </div>
                <span className="font-mono-num text-xs font-semibold text-neutral-700 w-10 text-right shrink-0">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">Sales by Staff</h3>
          <p className="text-xs text-neutral-400 mb-4">Revenue handled per barista/cashier</p>
          <div className="space-y-2.5">
            {staffSales.length === 0 && <p className="text-xs text-neutral-400 py-8 text-center">No records logged yet.</p>}
            {staffSales.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-600 w-24 shrink-0 truncate">{s.name}</span>
                <div className="flex-1 h-4 rounded-full bg-neutral-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(s.pct, 6)}%`, backgroundColor: s.color }}
                  />
                </div>
                <span className="font-mono-num text-xs font-semibold text-neutral-900 w-24 text-right shrink-0">₱{peso(s.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions + tasks row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock Alerts
            </h3>
            {lowStockItems.length > 0 && (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 border border-rose-100">
                {lowStockItems.length} items
              </span>
            )}
          </div>
          {lowStockItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-neutral-600">All inventory items are adequately stocked</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {lowStockItems.map((it) => (
                <div key={it.name} className="flex items-center justify-between rounded-xl bg-amber-50/60 border border-amber-100/80 px-3.5 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">{it.name}</p>
                    <p className="text-[11px] text-neutral-500">{it.category}</p>
                  </div>
                  <span className="font-mono-num text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                    {it.quantity} {it.unit} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" /> Staff Currently On Duty
            </h3>
            {onDuty.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {onDuty.length} Active
              </span>
            )}
          </div>
          {onDuty.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 py-8 text-center">
              <Clock className="h-5 w-5 text-neutral-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-neutral-500">No staff members clocked in right now.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
              {onDuty.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-emerald-50/60 border border-emerald-100/80 px-3.5 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">{s.staffName}</p>
                    <p className="text-[11px] text-neutral-500">Clocked in: {s.timeIn}</p>
                  </div>
                  <span className="font-mono-num text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    {s.orderCount} orders
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Cards */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">Recent Activity</h3>
        <p className="text-xs text-neutral-400 mb-4">Latest transactions completed</p>
        {recentCustomers.length === 0 ? (
          <p className="text-xs text-neutral-400 py-8 text-center">No orders recorded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {recentCustomers.map((o) => (
              <div key={o.orderNumber + o.date + o.time} className="rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3 hover:border-neutral-300 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-7 w-7 rounded-full bg-neutral-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                    {(o.customer || "G").charAt(0).toUpperCase()}
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-neutral-900 truncate">{o.customer || "Guest"}</p>
                    <p className="text-[10px] text-neutral-400">#{o.orderNumber}</p>
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-neutral-200/60">
                  <span className="text-[10px] text-neutral-400">{o.time}</span>
                  <span className="font-mono-num text-xs font-bold text-neutral-900">₱{peso(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function buildBusinessSummary(orders, shifts, inventory) {
  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const totalProfit = orders.reduce((s, o) => s + (Number(o.profit) || 0), 0);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const todayOrders = orders.filter((o) => o.date === today);
  const todayRevenue = todayOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const todayProfit = todayOrders.reduce((s, o) => s + (Number(o.profit) || 0), 0);

  const mostRecentDate = orders.reduce((max, o) => (o.date && o.date > max ? o.date : max), "");
  const mostRecentOrders = mostRecentDate ? orders.filter((o) => o.date === mostRecentDate) : [];
  const mostRecentRevenue = mostRecentOrders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const mostRecentProfit = mostRecentOrders.reduce((s, o) => s + (Number(o.profit) || 0), 0);

  const tally = new Map();
  for (const o of orders) {
    for (const it of parseItems(o.items)) {
      tally.set(it.name, (tally.get(it.name) || 0) + it.qty);
    }
  }
  const topProducts = Array.from(tally.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const staffTally = new Map();
  for (const o of orders) {
    const key = o.staff || "Unknown";
    staffTally.set(key, (staffTally.get(key) || 0) + (Number(o.total) || 0));
  }
  const salesPerStaff = Array.from(staffTally.entries()).map(([name, total]) => ({ name, total }));

  const lowStock = inventory.filter((it) => Number(it.quantity) <= Number(it.lowStockThreshold));
  const onDuty = shifts.filter((s) => s.status === "active").map((s) => s.staffName);

  return {
    todayDate: today,
    totalOrders: orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    todayOrders: todayOrders.length,
    todayRevenue: Math.round(todayRevenue * 100) / 100,
    todayProfit: Math.round(todayProfit * 100) / 100,
    mostRecentDateWithOrders: mostRecentDate || null,
    mostRecentDateRevenue: Math.round(mostRecentDateRevenue * 100) / 100,
    mostRecentDateProfit: Math.round(mostRecentDateProfit * 100) / 100,
    topProducts,
    salesPerStaff,
    lowStockItems: lowStock.map((it) => ({ name: it.name, quantity: it.quantity, unit: it.unit })),
    staffOnDuty: onDuty,
  };
}

function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage(textToSend) {
    const text = (textToSend || input).trim();
    if (!text || sending) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const [ordersRes, shiftsRes, inventoryRes] = await Promise.all([
        fetch(LEDGER_API_URL).then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch(SHIFTS_API_URL).then((r) => r.json()).catch(() => ({ shifts: [] })),
        fetch(INVENTORY_API_URL).then((r) => r.json()).catch(() => ({ items: [] })),
      ]);
      const summary = buildBusinessSummary(
        Array.isArray(ordersRes.orders) ? ordersRes.orders : [],
        Array.isArray(shiftsRes.shifts) ? shiftsRes.shifts : [],
        Array.isArray(inventoryRes.items) ? inventoryRes.items : []
      );

      const res = await fetch(AI_ASSISTANT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: summary }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data?.reply || "Walang sagot na natanggap." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "May error, subukan ulit." }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-22 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] rounded-3xl border border-neutral-200/90 bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-pop">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight leading-tight">Brewm AI Assistant</h4>
                <p className="text-[11px] text-neutral-400">Real-time business analytics</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-neutral-400 hover:text-white p-1.5 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="h-12 w-12 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3.5 border border-amber-200/50 shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-neutral-900 mb-1">May maitutulong ako?</p>
                <p className="text-xs text-neutral-500 max-w-[220px] mx-auto mb-5">
                  Magtanong tungkol sa benta, best sellers, staff shift, o stock inventory.
                </p>
                <div className="flex flex-col gap-2 text-left">
                  {["Magkano kita ko ngayon?", "Anong best seller item?", "Sinong staff ang naka-duty?"].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100/80 hover:bg-neutral-200/70 border border-neutral-200/60 px-3.5 py-2.5 rounded-xl transition-all text-left shadow-2xs hover:shadow-xs active:scale-[0.98]"
                    >
                      💬 "{prompt}"
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                    m.role === "user"
                      ? "bg-neutral-900 text-white rounded-tr-xs"
                      : "bg-neutral-100 text-neutral-900 border border-neutral-200/60 rounded-tl-xs font-normal"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 text-neutral-500 border border-neutral-200/60 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs flex items-center gap-2">
                  <span className="text-neutral-600 font-medium">Nag-iisip si AI...</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
          </div>

          {/* Footer input */}
          <div className="flex items-center gap-2 p-3.5 border-t border-neutral-100 bg-white shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask AI a question..."
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/70 px-3.5 py-2.5 text-xs outline-none focus:border-neutral-900 focus:bg-white transition-all font-medium placeholder:text-neutral-400"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="h-9 w-9 rounded-xl bg-neutral-900 hover:bg-black disabled:bg-neutral-200 text-white flex items-center justify-center transition-all shrink-0 shadow-xs hover:scale-105 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Launcher Button - prominent, modern floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-neutral-700/80 cursor-pointer group"
        title="Open Brewm AI Assistant"
      >
        {open ? (
          <>
            <X className="h-5 w-5 text-neutral-300 group-hover:text-white transition-colors" />
            <span className="text-xs font-bold tracking-wide">Close AI</span>
          </>
        ) : (
          <>
            <div className="h-7 w-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold tracking-wide pr-1">AI Assistant</span>
          </>
        )}
      </button>
    </>
  );
}

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
      setError("Incorrect administrator credentials.");
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 bg-[#f8f9fa] overflow-hidden">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-stone-300/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-3xl border border-neutral-200/80 bg-white/90 backdrop-blur-xl shadow-xl p-8 animate-fade-in">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <img
                src={logo}
                alt="Cafe Brewm"
                className="h-16 w-16 rounded-full object-cover ring-4 ring-neutral-100 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-neutral-900 text-white p-1 rounded-full text-[10px] shadow-sm">
                <Lock className="h-3 w-3" />
              </span>
            </div>
            <h1 className="font-display text-2xl font-bold text-neutral-900">Cafe Brewm</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full mt-2 border border-amber-200/60">
              Admin Ledger
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Admin Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admincaffe"
                  autoFocus
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:bg-white focus:ring-2 focus:ring-neutral-900/10 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200/80 px-3 py-2 text-xs font-medium text-rose-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider py-3 shadow-md hover:shadow-lg active:scale-[0.99] transition-all"
            >
              Sign In to Ledger
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6 font-medium">
          © {new Date().getFullYear()} Cafe Brewm • Internal Operations
        </p>
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
      setError("Couldn't load inventory. Check if the n8n workflow is active.");
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
      setError("Couldn't save the item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">Stock & Supplies</h2>
          <p className="text-xs text-neutral-400">
            {items.length} trackable item{items.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 px-3.5 py-2 hover:bg-neutral-50 shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 shadow-sm transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add / Restock
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-subtle overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="text-left px-5 py-3.5">Item Name</th>
                <th className="text-left px-4 py-3.5">Category</th>
                <th className="text-left px-4 py-3.5">Quantity</th>
                <th className="text-left px-4 py-3.5">Unit</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    Loading inventory records...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    No items in inventory. Click "Add / Restock" to start.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                items.map((it) => {
                  const low = Number(it.quantity) <= Number(it.lowStockThreshold);
                  return (
                    <tr key={it.name} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-neutral-900">{it.name}</td>
                      <td className="px-4 py-3.5 text-neutral-500 font-medium">{it.category}</td>
                      <td className="px-4 py-3.5 font-mono-num font-bold text-neutral-900">{it.quantity}</td>
                      <td className="px-4 py-3.5 text-neutral-500">{it.unit}</td>
                      <td className="px-4 py-3.5">
                        {low ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-semibold px-2.5 py-0.5 border border-rose-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Low stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 border border-emerald-200/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Adequate
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 whitespace-nowrap font-mono-num text-[11px]">
                        {it.updatedAt}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-neutral-200 bg-white shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">Add or Restock Supply</h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-neutral-800 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Item Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Espresso Beans"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="e.g. Coffee / Dairy / Packaging"
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">Quantity Delta</label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    placeholder="e.g. 10"
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-600 mb-1 block">Unit</label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="pcs / kg / L"
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-600 mb-1 block">Low Stock Alert Threshold</label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                  className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs outline-none focus:border-neutral-900 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold py-2.5 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-neutral-900 hover:bg-black disabled:bg-neutral-300 text-white text-xs font-semibold py-2.5 transition-colors"
                >
                  {saving ? "Saving..." : "Save Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function workHours(timeInTs, timeOutTs) {
  if (!timeInTs || !timeOutTs) return null;
  const inDate = new Date(timeInTs.replace(" ", "T"));
  const outDate = new Date(timeOutTs.replace(" ", "T"));
  const ms = outDate - inDate;
  if (!Number.isFinite(ms) || ms < 0) return null;
  return ms / 1000 / 60 / 60;
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
      setError("Couldn't load staff records. Check if the n8n workflow is active.");
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
        ["Work Hours", workHours(shift.timeInTs, shift.timeOutTs)?.toFixed(2) ?? "—"],
        ["Status", shift.status],
        ["Orders handled", shift.orderCount],
        ["Total sales", `P${peso(shift.totalSales)}`],
        ["Total profit", `P${peso(shift.totalProfit)}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [24, 24, 27] },
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
      head: [["Staff", "Time In", "Time Out", "Work Hours", "Status", "Orders", "Sales", "Profit"]],
      body: shifts.map((s) => [
        s.staffName,
        `${s.dayIn}, ${s.dateIn} ${s.timeIn}`,
        s.timeOut ? `${s.dayOut}, ${s.dateOut} ${s.timeOut}` : "Active",
        workHours(s.timeInTs, s.timeOutTs)?.toFixed(2) ?? "—",
        s.status,
        s.orderCount,
        `P${peso(s.totalSales)}`,
        `P${peso(s.totalProfit)}`,
      ]),
      theme: "grid",
      headStyles: { fillColor: [24, 24, 27] },
      styles: { fontSize: 8 },
    });

    doc.save(`staff-shift-log-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-neutral-900 tracking-tight">Staff Attendance & Shifts</h2>
          <p className="text-xs text-neutral-400">
            {shifts.length} shift log{shifts.length !== 1 ? "s" : ""} on record
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 px-3.5 py-2 hover:bg-neutral-50 shadow-sm transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={downloadAllPdf}
            disabled={shifts.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-black disabled:bg-neutral-300 text-white text-xs font-semibold px-4 py-2 shadow-sm transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-subtle overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="text-left px-5 py-3.5">Staff Name</th>
                <th className="text-left px-4 py-3.5">Clock In</th>
                <th className="text-left px-4 py-3.5">Clock Out</th>
                <th className="text-left px-4 py-3.5">Hours</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Orders</th>
                <th className="text-left px-4 py-3.5">Gross Sales</th>
                <th className="text-left px-4 py-3.5">Profit</th>
                <th className="text-right px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-neutral-400">
                    Loading staff records...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-rose-500 font-medium">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && shifts.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-neutral-400">
                    No shift records found. Staff clock-in on the POS will show up here.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                shifts.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-neutral-900">{s.staffName}</td>
                    <td className="px-4 py-3.5 text-neutral-600 whitespace-nowrap">
                      {s.dayIn}, {s.dateIn} <span className="text-neutral-400">{s.timeIn}</span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-600 whitespace-nowrap">
                      {s.timeOut ? (
                        <>
                          {s.dayOut}, {s.dateOut} <span className="text-neutral-400">{s.timeOut}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono-num font-medium text-neutral-700">
                      {workHours(s.timeInTs, s.timeOutTs)?.toFixed(2) ?? "—"} hrs
                    </td>
                    <td className="px-4 py-3.5">
                      {s.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 border border-emerald-200/60">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          On duty
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 text-neutral-500 text-[11px] font-medium px-2.5 py-0.5">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono-num font-bold text-neutral-900">{s.orderCount}</td>
                    <td className="px-4 py-3.5 font-mono-num font-bold text-neutral-900">₱{peso(s.totalSales)}</td>
                    <td className="px-4 py-3.5 font-mono-num font-bold text-emerald-600">₱{peso(s.totalProfit)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => downloadPdf(s)}
                        className="text-neutral-700 hover:text-black font-semibold text-[11px] bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1 rounded-lg transition-colors"
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
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === "true");
  const [activeTab, setActiveTab] = useState("overview");
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
      setError("Couldn't load ledger data. Check if the n8n workflow is active.");
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
      headStyles: { fillColor: [24, 24, 27] },
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
      headStyles: { fillColor: [24, 24, 27] },
    });

    doc.addPage();
    doc.setFontSize(13);
    doc.text(`Inventory (${allInventory.length})`, 14, 18);
    autoTable(doc, {
      startY: 24,
      head: [["Item", "Category", "Quantity", "Unit", "Low stock at"]],
      body: allInventory.map((it) => [it.name, it.category, it.quantity, it.unit, it.lowStockThreshold]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [24, 24, 27] },
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
        setResetError("Backup downloaded, but reset wasn't confirmed. Check if n8n workflow is Active.");
        setResetLoading(false);
        return;
      }

      window.location.reload();
    } catch (err) {
      setResetError("An error occurred while resetting. Please try again.");
      setResetLoading(false);
    }
  }

  if (!authed) {
    return (
      <LoginScreen
        onLogin={() => {
          const sessionToken = crypto.randomUUID();
          localStorage.setItem(AUTH_KEY, "true");
          localStorage.setItem(AUTH_KEY + "-token", sessionToken);
          logSession("admin", ADMIN_USERNAME, "login", sessionToken);
          setAuthed(true);
        }}
      />
    );
  }

  function logout() {
    const token = localStorage.getItem(AUTH_KEY + "-token");
    logSession("admin", ADMIN_USERNAME, "logout", token);
    localStorage.removeItem(AUTH_KEY + "-token");
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-neutral-900 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Modern Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <img src={logo} alt="Cafe Brewm" className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-200 shadow-sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">Cafe Brewm</h1>
                <span className="rounded-full bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                  Admin Ledger
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">
                Financial, inventory, and staff analytics dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-xs font-semibold text-neutral-700 px-3.5 py-2 hover:bg-neutral-50 shadow-sm transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 shadow-sm transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => { setResetOpen(true); setResetConfirmText(""); setResetError(null); }}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-600 px-3.5 py-2 hover:bg-rose-100/60 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Reset Data
            </button>
            <button
              onClick={logout}
              title="Logout"
              className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 shadow-sm transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Reset Confirmation Modal */}
        {resetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white shadow-2xl p-6">
              {resetLoading ? (
                <div className="text-center py-6">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 text-neutral-900 animate-spin" />
                  <p className="text-sm font-bold text-neutral-900 mb-1">Generating full backup & clearing database...</p>
                  <p className="text-xs text-neutral-400">Please do not close or refresh this tab.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 mb-3 text-rose-600">
                    <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900">Reset all store records?</h3>
                  </div>
                  <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                    This will permanently clear orders, customers, shifts, and inventory from the database. A comprehensive backup PDF will automatically be generated and downloaded for your archives.
                  </p>
                  {resetError && <p className="text-xs text-rose-600 mb-3 font-semibold">{resetError}</p>}
                  <label className="text-xs font-semibold text-neutral-600 mb-1.5 block">
                    Type <span className="font-mono text-neutral-900 font-bold">RESET</span> to confirm:
                  </label>
                  <input
                    value={resetConfirmText}
                    onChange={(e) => setResetConfirmText(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-2 text-xs font-mono outline-none focus:border-rose-500 mb-4"
                    placeholder="RESET"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setResetOpen(false)}
                      className="rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 px-4 py-2.5 hover:bg-neutral-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResetConfirm}
                      disabled={resetConfirmText !== "RESET"}
                      className="rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-neutral-200 text-white text-xs font-semibold px-4 py-2.5 transition-colors shadow-sm"
                    >
                      Download Backup & Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modern Segmented Navigation Tabs */}
        <div className="flex items-center justify-start">
          <div className="inline-flex bg-neutral-200/60 p-1 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "overview"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "orders"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              Orders Ledger
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "inventory"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Inventory Stock
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === "staff"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Staff Shifts
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "overview" ? (
          <OverviewTab />
        ) : activeTab === "inventory" ? (
          <InventoryTab />
        ) : activeTab === "staff" ? (
          <StaffTab />
        ) : (
          /* Orders Ledger Tab */
          <div className="space-y-5 animate-fade-in">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Receipt className="h-3.5 w-3.5" /> Orders
                </div>
                <p className="font-mono-num text-2xl font-bold text-neutral-900">{summary.count}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <TrendingUp className="h-3.5 w-3.5" /> Gross Revenue
                </div>
                <p className="font-mono-num text-2xl font-bold text-emerald-600">₱{peso(summary.revenue)}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  {summary.profit >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-600" />}
                  Est. Profit
                </div>
                <p className={`font-mono-num text-2xl font-bold ${summary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {summary.profit >= 0 ? "" : "-"}₱{peso(Math.abs(summary.profit))}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${summary.profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {summary.profit >= 0 ? "Kumita ✓" : "Nalugi ⚠"}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Users className="h-3.5 w-3.5" /> Customers
                </div>
                <p className="font-mono-num text-2xl font-bold text-neutral-900">{summary.customers}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Package className="h-3.5 w-3.5" /> Items Sold
                </div>
                <p className="font-mono-num text-2xl font-bold text-neutral-900">{summary.itemsSold}</p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-subtle">
                <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <Wallet className="h-3.5 w-3.5" /> Avg Ticket
                </div>
                <p className="font-mono-num text-2xl font-bold text-neutral-900">₱{peso(summary.avg)}</p>
              </div>
            </div>

            {/* Top Products Donut Row */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-subtle">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Top-Selling Menu Items {selectedMonth !== "All" ? `— ${monthLabel(selectedMonth)}` : ""}
                  </h3>
                  <p className="text-xs text-neutral-400">Distribution of items ordered</p>
                </div>
              </div>

              {topProducts.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">No sales data recorded yet.</p>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <svg width="150" height="150" viewBox="0 0 120 120">
                      <g transform="rotate(-90 60 60)">
                        {(() => {
                          const r = 45;
                          const circumference = 2 * Math.PI * r;
                          let cumulative = 0;
                          return topProducts.map((p) => {
                            const dash = (p.pct / 100) * circumference;
                            const el = (
                              <circle
                                key={p.name}
                                cx="60"
                                cy="60"
                                r={r}
                                fill="none"
                                stroke={p.color}
                                strokeWidth="16"
                                strokeDasharray={`${dash} ${circumference - dash}`}
                                strokeDashoffset={-((cumulative / 100) * circumference)}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                              />
                            );
                            cumulative += p.pct;
                            return el;
                          });
                        })()}
                      </g>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                      <span className="font-mono-num text-lg font-bold text-neutral-900 leading-none">
                        {summary.itemsSold}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-neutral-400 mt-1">items</span>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    {topProducts.map((p) => (
                      <div key={p.name} className="flex items-center gap-3">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-xs font-semibold text-neutral-700 w-36 shrink-0 truncate">{p.name}</span>
                        <div className="flex-1 h-3 rounded-full bg-neutral-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${p.pct}%`, backgroundColor: p.color }}
                          />
                        </div>
                        <span className="font-mono-num text-xs font-semibold text-neutral-600 w-20 text-right shrink-0">
                          {p.qty} <span className="text-neutral-400 font-normal">({p.pct.toFixed(0)}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="rounded-xl border border-neutral-200/90 bg-white text-xs font-medium text-neutral-800 px-3.5 py-2.5 outline-none focus:border-neutral-900 shadow-sm transition-all"
                >
                  <option value="All">All Months</option>
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
                  className="rounded-xl border border-neutral-200/90 bg-white text-xs font-medium text-neutral-800 px-3.5 py-2.5 outline-none focus:border-neutral-900 shadow-sm transition-all"
                >
                  <option value="All">All Staff</option>
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
                  className="rounded-xl border border-neutral-200/90 bg-white text-xs font-medium text-neutral-800 px-3.5 py-2.5 outline-none focus:border-neutral-900 shadow-sm transition-all"
                >
                  <option value="All">All Days</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative ml-auto w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders, customers, items..."
                  className="w-full rounded-xl border border-neutral-200/90 bg-white pl-10 pr-3.5 py-2.5 text-xs outline-none focus:border-neutral-900 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Sub-filtered Summary Pill */}
            {(selectedStaff !== "All" || selectedDay !== "All" || selectedMonth !== "All") && (
              <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-subtle">
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Filtered View</p>
                  <p className="text-xs font-bold text-neutral-900 mt-0.5">
                    {selectedStaff !== "All" ? selectedStaff : "All Staff"} • {selectedDay !== "All" ? selectedDay : "All Days"} • {selectedMonth !== "All" ? monthLabel(selectedMonth) : "All Time"}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block font-medium">Orders</span>
                    <span className="font-mono-num text-sm font-bold text-neutral-900">{summary.count}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block font-medium">Sales</span>
                    <span className="font-mono-num text-sm font-bold text-neutral-900">₱{peso(summary.revenue)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block font-medium">Profit</span>
                    <span className="font-mono-num text-sm font-bold text-emerald-600">₱{peso(summary.profit)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-subtle overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/60 text-neutral-400 uppercase tracking-wider font-semibold">
                      <th className="w-10 px-4 py-3.5">
                        <input type="checkbox" disabled className="rounded border-neutral-300" />
                      </th>
                      {COLUMNS.map((col) => (
                        <th key={col.key} className="text-left px-3.5 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => toggleSort(col.key)}
                            className="flex items-center gap-1 hover:text-neutral-800 transition-colors"
                          >
                            {col.label}
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {loading && (
                      <tr>
                        <td colSpan={COLUMNS.length + 1} className="text-center py-14 text-neutral-400">
                          Loading ledger records...
                        </td>
                      </tr>
                    )}
                    {!loading && error && (
                      <tr>
                        <td colSpan={COLUMNS.length + 1} className="text-center py-14 text-rose-500 font-medium">
                          {error}
                        </td>
                      </tr>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                      <tr>
                        <td colSpan={COLUMNS.length + 1} className="text-center py-14 text-neutral-400">
                          No matching orders found.
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      !error &&
                      filtered.map((o) => (
                        <tr key={o.orderNumber + o.date + o.time} className="hover:bg-neutral-50/60 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(o.orderNumber)}
                              onChange={() => toggleRow(o.orderNumber)}
                              className="rounded border-neutral-300"
                            />
                          </td>
                          <td className="px-3.5 py-3 font-mono-num font-bold text-neutral-900">#{o.orderNumber}</td>
                          <td className="px-3.5 py-3 font-semibold text-neutral-900">{o.customer}</td>
                          <td className="px-3.5 py-3 text-neutral-600">{o.staff || "—"}</td>
                          <td className="px-3.5 py-3 text-neutral-600 max-w-[260px] truncate" title={o.items}>
                            {o.items}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="inline-flex items-center rounded-full bg-neutral-100 text-neutral-700 px-2 py-0.5 font-medium text-[11px] capitalize">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium text-[11px] ${
                                o.orderType === "Dine-in"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                                  : "bg-stone-100 text-stone-700"
                              }`}
                            >
                              {o.orderType}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-neutral-500 whitespace-nowrap font-mono-num">{o.date}</td>
                          <td className="px-3.5 py-3 text-neutral-500 whitespace-nowrap font-mono-num">{o.time}</td>
                          <td className="px-3.5 py-3 font-mono-num font-bold text-neutral-900 whitespace-nowrap">
                            ₱{peso(o.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Assistant Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
}
