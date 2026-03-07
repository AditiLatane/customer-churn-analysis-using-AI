
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, AreaChart, Area
} from "recharts";

// ── COLOUR SYSTEM ──────────────────────────────────────────────
const C = {
  crimson: "#C0392B", crimsonL: "#E74C3C",
  navy: "#1A2340", navyM: "#243058",
  gold: "#D4A843", goldL: "#F0C060",
  slate: "#4A5568", fog: "#F7F8FC",
  success: "#27AE60", warn: "#E67E22",
  blue: "#2980B9", purple: "#8E44AD",
  border: "#E2E8F0", muted: "#718096",
};

// ── RAW DATA ───────────────────────────────────────────────────
const ALL_DATA = {
  contract: [
    { name: "Month-to-Month", churnRate: 42.7, customers: 3875, churned: 1655 },
    { name: "One Year",       churnRate: 11.3, customers: 1473, churned: 166 },
    { name: "Two Year",       churnRate: 2.8,  customers: 1695, churned: 47 },
  ],
  tenure: [
    { band: "0–12 mo",  churnRate: 47.7 },
    { band: "13–24 mo", churnRate: 30.1 },
    { band: "25–36 mo", churnRate: 23.4 },
    { band: "37–48 mo", churnRate: 17.2 },
    { band: "49–60 mo", churnRate: 10.8 },
    { band: "61–72 mo", churnRate: 7.0  },
  ],
  internet: [
    { name: "Fiber Optic", churnRate: 41.9, customers: 3096 },
    { name: "DSL",         churnRate: 19.0, customers: 2421 },
    { name: "No Internet", churnRate: 7.4,  customers: 1526 },
  ],
  payment: [
    { name: "Electronic Check", churnRate: 45.3 },
    { name: "Mailed Check",     churnRate: 19.1 },
    { name: "Bank Transfer",    churnRate: 16.7 },
    { name: "Credit Card",      churnRate: 15.2 },
  ],
  services: [
    { service: "Online Security", withService: 14.6, withoutService: 41.8 },
    { service: "Tech Support",    withService: 15.2, withoutService: 41.7 },
    { service: "Online Backup",   withService: 15.8, withoutService: 39.9 },
    { service: "Device Protect",  withService: 16.3, withoutService: 40.1 },
  ],
  reasons: [
    { reason: "Competitor",    pct: 44.9 },
    { reason: "Dissatisfied",  pct: 16.2 },
    { reason: "Price",         pct: 11.3 },
    { reason: "Support",       pct: 11.0 },
    { reason: "Personal",      pct: 9.1  },
    { reason: "Unknown",       pct: 7.5  },
  ],
  demographics: [
    { group: "Senior - No Partner",       churnRate: 47 },
    { group: "Senior - Has Partner",      churnRate: 36 },
    { group: "Non-Senior - No Partner",   churnRate: 30 },
    { group: "Non-Senior - Has Partner",  churnRate: 18 },
    { group: "Has Dependents",            churnRate: 15.5 },
    { group: "No Dependents",             churnRate: 31.3 },
  ],
  radar: [
    { factor: "M2M Contract", churned: 85, retained: 28 },
    { factor: "Fiber Optic",  churned: 75, retained: 35 },
    { factor: "E-Check",      churned: 82, retained: 22 },
    { factor: "Senior",       churned: 60, retained: 40 },
    { factor: "No Security",  churned: 78, retained: 25 },
    { factor: "Low Tenure",   churned: 90, retained: 30 },
    { factor: "Solo Customer",churned: 64, retained: 38 },
  ],
  trend: [
    { month: "Jan", churnRate: 24.1, retained: 75.9 },
    { month: "Feb", churnRate: 25.0, retained: 75.0 },
    { month: "Mar", churnRate: 26.2, retained: 73.8 },
    { month: "Apr", churnRate: 27.5, retained: 72.5 },
    { month: "May", churnRate: 26.8, retained: 73.2 },
    { month: "Jun", churnRate: 28.1, retained: 71.9 },
    { month: "Jul", churnRate: 27.0, retained: 73.0 },
    { month: "Aug", churnRate: 26.5, retained: 73.5 },
  ],
};

const REASON_COLORS = [C.crimson, C.warn, C.navy, C.blue, C.slate, "#BDC3C7"];
const PIE_COLORS    = [C.crimson, C.warn, C.success];

// ── HELPERS ───────────────────────────────────────────────────
const fmt = (v, suffix = "%") => `${v}${suffix}`;

const CustomTooltip = ({ active, payload, label, prefix = "", suffix = "%" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.navy, color: "#fff", borderRadius: 8,
      padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: C.goldL }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#fff" }}>
          {p.name}: <strong>{prefix}{p.value}{suffix}</strong>
        </div>
      ))}
    </div>
  );
};

// ── KPI CARD ─────────────────────────────────────────────────
function KpiCard({ label, value, sub, color = C.crimson, icon }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 22px",
      border: `1px solid ${C.border}`, borderTop: `4px solid ${color}`,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
      <div style={{
        fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700,
        color: C.navy, lineHeight: 1.1, marginBottom: 4
      }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── CHART CARD ────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "22px 24px",
      border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      ...style
    }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: C.navy }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: C.muted, marginTop: 3, marginBottom: 16 }}>{subtitle}</div>}
      {!subtitle && <div style={{ marginBottom: 16 }} />}
      {children}
    </div>
  );
}

// ── FILTER BAR ────────────────────────────────────────────────
function FilterBar({ filters, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {filters.map(f => (
        <button
          key={f}
          onClick={() => onChange(f)}
          style={{
            padding: "6px 16px", borderRadius: 20, border: "none",
            background: active === f ? C.navy : "#fff",
            color: active === f ? "#fff" : C.slate,
            fontWeight: 600, fontSize: 12, cursor: "pointer",
            boxShadow: active === f ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
            transition: "all 0.15s",
            letterSpacing: 0.3,
          }}
        >{f}</button>
      ))}
    </div>
  );
}

// ── RISK BADGE ────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = {
    Critical: { bg: "#FDECEA", color: C.crimson },
    High:     { bg: "#FEF3E2", color: C.warn },
    Medium:   { bg: "#EBF5FB", color: C.blue },
    Low:      { bg: "#E9F7EF", color: C.success },
  };
  const s = map[level] || map.Low;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 12, padding: "2px 10px",
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5
    }}>{level}</span>
  );
}

// ══════════════════════════════════════════════════════════════
//  PAGES
// ══════════════════════════════════════════════════════════════

function OverviewPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPI Row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KpiCard icon="📉" label="Overall Churn Rate"  value="26.5%"  sub="1,869 customers lost"      color={C.crimson} />
        <KpiCard icon="👥" label="Total Customers"      value="7,043"  sub="Q3 California"              color={C.navy}   />
        <KpiCard icon="💰" label="Avg Charge — Churned" value="$74.44" sub="vs $61.27 retained"         color={C.warn}   />
        <KpiCard icon="⚠️" label="Monthly Revenue Risk" value="$139K+" sub="MRR from churned accounts"  color={C.gold}   />
      </div>

      {/* Trend + Donut Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <ChartCard title="Churn Rate Trend" subtitle="8-month view · % of customers who churned each month">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ALL_DATA.trend}>
              <defs>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.crimson} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.crimson} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => v + "%"} domain={[20, 32]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="churnRate" stroke={C.crimson} strokeWidth={2.5}
                fill="url(#cGrad)" name="Churn Rate" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Contract Split" subtitle="By number of customers">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ALL_DATA.contract} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="customers" nameKey="name" paddingAngle={3}>
                {ALL_DATA.contract.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => [v.toLocaleString(), "Customers"]} />
              <Legend formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Contract + Tenure Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="Churn Rate by Contract Type" subtitle="Month-to-month customers are 15× more likely to churn than 2-year">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ALL_DATA.contract} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis type="number" tickFormatter={v => v + "%"} tick={{ fontSize: 11 }} domain={[0, 50]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churnRate" name="Churn Rate" radius={[0, 6, 6, 0]}>
                {ALL_DATA.contract.map((e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn Rate by Tenure Band" subtitle="Risk halves every ~18 months of customer lifetime">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ALL_DATA.tenure}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="band" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => v + "%"} domain={[0, 55]} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churnRate" name="Churn Rate" radius={[5, 5, 0, 0]}>
                {ALL_DATA.tenure.map((_, i) => (
                  <Cell key={i} fill={`hsl(${4 + i * 22}, ${70 - i * 4}%, ${35 + i * 6}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function DriversPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Services", "Payment", "Demographics"];

  const show = (f) => activeFilter === "All" || activeFilter === f;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: C.navy }}>
          Churn Driver Deep-Dive
        </div>
        <FilterBar filters={filters} active={activeFilter} onChange={setActiveFilter} />
      </div>

      {/* Internet + Payment */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <ChartCard title="Internet Service Type" subtitle="Fiber optic users churn at 41.9% — 5.7× no-internet customers">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ALL_DATA.internet}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => v + "%"} domain={[0, 50]} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churnRate" name="Churn Rate" radius={[6, 6, 0, 0]}>
                {ALL_DATA.internet.map((_, i) => (
                  <Cell key={i} fill={[C.crimson, C.warn, C.success][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {(show("Payment")) && (
          <ChartCard title="Payment Method" subtitle="Electronic check users are 3× more likely to churn than credit card users">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ALL_DATA.payment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={v => v + "%"} domain={[0, 55]} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="churnRate" name="Churn Rate" radius={[6, 6, 0, 0]}>
                  {ALL_DATA.payment.map((_, i) => (
                    <Cell key={i} fill={[C.crimson, C.warn, C.blue, C.success][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Value-Added Services */}
      {(show("Services")) && (
        <ChartCard title="Value-Added Services — With vs Without" subtitle="Every protective add-on cuts churn rate by more than half">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ALL_DATA.services} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis type="number" tickFormatter={v => v + "%"} domain={[0, 50]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="service" tick={{ fontSize: 12 }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="withoutService" name="Without Service" fill={C.crimson} radius={[0, 4, 4, 0]} />
              <Bar dataKey="withService" name="With Service" fill={C.success} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Demographics + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {(show("Demographics")) && (
          <ChartCard title="Demographic Risk Groups" subtitle="Senior, solo, and no-dependent customers show elevated churn">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ALL_DATA.demographics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                <XAxis type="number" tickFormatter={v => v + "%"} domain={[0, 55]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="group" tick={{ fontSize: 10 }} width={160} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="churnRate" name="Churn Rate" radius={[0, 5, 5, 0]}>
                  {ALL_DATA.demographics.map((e, i) => (
                    <Cell key={i} fill={e.churnRate > 35 ? C.crimson : e.churnRate > 22 ? C.warn : C.success} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard title="Risk Factor Radar" subtitle="Intensity of each factor among churned vs retained customers">
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={ALL_DATA.radar}>
              <PolarGrid stroke="#E8E8E8" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10 }} />
              <Radar name="Churned" dataKey="churned" stroke={C.crimson} fill={C.crimson} fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Retained" dataKey="retained" stroke={C.navy} fill={C.navy} fillOpacity={0.12} strokeWidth={2} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Churn Reasons */}
      <ChartCard title="Primary Churn Reasons" subtitle="Why churned customers say they left — competitor offers dominate">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ALL_DATA.reasons} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
            <XAxis type="number" tickFormatter={v => v + "%"} domain={[0, 50]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="reason" tick={{ fontSize: 12 }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pct" name="Share of Churned" radius={[0, 6, 6, 0]}>
              {ALL_DATA.reasons.map((_, i) => <Cell key={i} fill={REASON_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function SegmentsPage() {
  const segments = [
    { name: "Early Fiber Switchers", chars: "Fiber optic · Month-to-month · Tenure <12 mo", size: 620, churnRate: 62, risk: "Critical", mrr: "$46K+", action: "Immediate outreach + bundle offer" },
    { name: "Unprotected High Spenders", chars: "Monthly charge >$70 · No security/support", size: 940, churnRate: 52, risk: "Critical", mrr: "$65K+", action: "Bundle security/support free 3 months" },
    { name: "Senior Solo Customers", chars: "Senior citizen · No partner · No dependents", size: 480, churnRate: 47, risk: "Critical", mrr: "$28K+", action: "Senior care programme + loyalty pricing" },
    { name: "E-Check Month-to-Month", chars: "Electronic check · Month-to-month contract", size: 1100, churnRate: 48, risk: "High", mrr: "$82K+", action: "Auto-pay migration with $5/mo credit" },
    { name: "Mid-Tenure Fiber/DSL", chars: "Tenure 13–24 mo · Fiber or DSL · Paperless billing", size: 780, churnRate: 30, risk: "Medium", mrr: "$35K+", action: "Annual contract discount offer" },
    { name: "New No-Service Customers", chars: "Tenure <6 mo · Phone only · No add-ons", size: 420, churnRate: 38, risk: "High", mrr: "$15K+", action: "30/60/90 onboarding programme" },
    { name: "Loyal Long-Term Subscribers", chars: "Tenure >48 mo · Annual or 2-year contract", size: 2100, churnRate: 7, risk: "Low", mrr: "—", action: "Loyalty recognition + upsell" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: C.navy }}>
        Customer Segment Risk Matrix
      </div>

      {/* Bubble-style segment cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {segments.map((s) => {
          const rColor = s.risk === "Critical" ? C.crimson : s.risk === "High" ? C.warn : s.risk === "Medium" ? C.blue : C.success;
          return (
            <div key={s.name} style={{
              background: "#fff", borderRadius: 12, padding: "18px 20px",
              border: `1px solid ${C.border}`, borderLeft: `4px solid ${rColor}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, lineHeight: 1.3, flex: 1, paddingRight: 8 }}>{s.name}</div>
                <RiskBadge level={s.risk} />
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{s.chars}</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: rColor, fontFamily: "Georgia, serif" }}>{s.churnRate}%</div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Churn Rate</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "Georgia, serif" }}>{s.size.toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>Customers</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.gold, fontFamily: "Georgia, serif" }}>{s.mrr}</div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5 }}>MRR at Risk</div>
                </div>
              </div>
              {/* Churn bar */}
              <div style={{ background: "#F0F0F0", borderRadius: 4, height: 6, marginBottom: 10 }}>
                <div style={{ width: `${Math.min(s.churnRate, 100)}%`, height: "100%", background: rColor, borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11, color: C.slate, background: "#F7F8FC", borderRadius: 6, padding: "6px 10px" }}>
                💡 {s.action}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bubble chart comparison */}
      <ChartCard title="Segment Risk vs Volume Overview" subtitle="Bubble area = number of customers · X = churn rate · Y = estimated MRR at risk">
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
          {segments.filter(s => s.mrr !== "—").map((s) => {
            const rColor = s.risk === "Critical" ? C.crimson : s.risk === "High" ? C.warn : s.risk === "Medium" ? C.blue : C.success;
            const size = Math.sqrt(s.size) * 2.2;
            return (
              <div key={s.name} style={{ textAlign: "center" }}>
                <div title={`${s.name}: ${s.churnRate}% churn, ~${s.size} customers`} style={{
                  width: size, height: size, borderRadius: "50%",
                  background: rColor, opacity: 0.85,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: Math.max(10, size / 6),
                  margin: "0 auto 6px",
                  boxShadow: `0 4px 12px ${rColor}40`,
                  cursor: "default",
                }}>
                  {s.churnRate}%
                </div>
                <div style={{ fontSize: 10, color: C.muted, maxWidth: 80, textAlign: "center" }}>{s.name}</div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8 }}>
          🔴 Critical &nbsp;·&nbsp; 🟠 High &nbsp;·&nbsp; 🔵 Medium
        </div>
      </ChartCard>
    </div>
  );
}

function RetentionPage() {
  const kpis = [
    { label: "Contract Upgrade Rate",   value: "—",    target: "15%/qtr", icon: "📋", color: C.navy },
    { label: "Auto-Pay Adoption",        value: "—",    target: "60%",     icon: "💳", color: C.blue },
    { label: "Bundle Attach Rate",       value: "—",    target: "40%",     icon: "🛡️", color: C.success },
    { label: "Retention Campaign Reach", value: "—",    target: "80%",     icon: "📣", color: C.warn },
    { label: "High-Risk Accounts Flagged", value: "—",  target: "Weekly",  icon: "⚠️", color: C.crimson },
    { label: "Churn Rate (Target)",      value: "26.5%",target: "<20%",    icon: "📉", color: C.gold },
  ];

  const strategies = [
    { icon: "📋", title: "Contract Migration Campaign", priority: "P1 – Immediate", impact: "High", effort: "Low",
      desc: "Offer 10–15% discount for switching from month-to-month to annual. Target top 1,000 highest-risk M2M accounts first using ML score." },
    { icon: "🌱", title: "30/60/90 Onboarding Programme", priority: "P1 – Immediate", impact: "High", effort: "Medium",
      desc: "Structured welcome touchpoints at day 7, 30, 60, 90. Proactive satisfaction check-in and personalised plan review." },
    { icon: "🛡️", title: "New Customer Security Bundle", priority: "P2 – Q2", impact: "Very High", effort: "Low",
      desc: "Free Online Security + Tech Support for 3 months on all new Fiber optic activations. Converts high-churn segment to low-churn." },
    { icon: "💳", title: "Auto-Pay Migration Incentive", priority: "P2 – Q2", impact: "Medium", effort: "Low",
      desc: "$5/month credit for switching from electronic check to automatic payment. Also lowers payment processing costs." },
    { icon: "👴", title: "Senior Customer Care Programme", priority: "P2 – Q2", impact: "Medium", effort: "Medium",
      desc: "Dedicated helpline, simplified billing, in-home tech support, and loyalty pricing for senior citizens." },
    { icon: "🤖", title: "ML Churn Propensity Model", priority: "P3 – Q3", impact: "Highest ROI", effort: "High",
      desc: "Deploy gradient boosted model (~80% accuracy) to score all customers weekly. Alert CRM when score >0.7 for proactive outreach." },
  ];

  const pColor = (p) => p.startsWith("P1") ? C.crimson : p.startsWith("P2") ? C.warn : C.blue;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: C.navy }}>
        Retention Strategy & KPI Tracker
      </div>

      {/* Operational KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{
            background: "#fff", borderRadius: 10, padding: "16px 18px",
            border: `1px solid ${C.border}`, borderLeft: `4px solid ${k.color}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: 22 }}>{k.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, margin: "6px 0 2px" }}>{k.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: C.navy, fontFamily: "Georgia, serif" }}>{k.value}</span>
              <span style={{ fontSize: 11, color: k.color, fontWeight: 700 }}>Target: {k.target}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Roadmap */}
      <ChartCard title="Retention Strategy Roadmap" subtitle="Prioritised actions with impact / effort assessment">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {strategies.map((s) => (
            <div key={s.title} style={{
              display: "flex", gap: 16, alignItems: "flex-start",
              background: "#F7F8FC", borderRadius: 10, padding: "14px 18px",
              border: `1px solid ${C.border}`
            }}>
              <div style={{ fontSize: 26, flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.navy }}>{s.title}</span>
                  <span style={{
                    background: pColor(s.priority), color: "#fff",
                    borderRadius: 10, padding: "2px 10px", fontSize: 10, fontWeight: 700
                  }}>{s.priority}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>Impact: <strong style={{ color: C.navy }}>{s.impact}</strong></span>
                  <span style={{ fontSize: 11, color: C.muted }}>Effort: <strong style={{ color: C.navy }}>{s.effort}</strong></span>
                </div>
                <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Expected Impact */}
      <ChartCard title="Projected Churn Reduction — Strategy Impact" subtitle="Estimated churn rate reduction if each strategy is fully implemented">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { strategy: "Baseline",          rate: 26.5 },
            { strategy: "+ Contract Campaign",rate: 22.8 },
            { strategy: "+ Onboarding",       rate: 20.4 },
            { strategy: "+ Bundle",           rate: 18.1 },
            { strategy: "+ Auto-Pay",         rate: 17.0 },
            { strategy: "+ Senior Care",      rate: 16.2 },
            { strategy: "+ ML Model",         rate: 14.5 },
          ]} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
            <XAxis type="number" tickFormatter={v => v + "%"} domain={[12, 28]} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="strategy" tick={{ fontSize: 11 }} width={145} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rate" name="Projected Churn Rate" radius={[0, 6, 6, 0]}>
              {[C.slate, "#E07060", C.warn, "#E8A862", "#A8D5B5", C.success, "#1A6B3A"].map((c, i) => (
                <Cell key={i} fill={c} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8, textAlign: "center" }}>
          Full implementation of all strategies could reduce churn from 26.5% → ~14.5%, saving ~$84K/month in recovered MRR
        </div>
      </ChartCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════════════════
const PAGES = [
  { id: "overview",   label: "📊  Overview",          component: OverviewPage   },
  { id: "drivers",    label: "🔍  Churn Drivers",      component: DriversPage    },
  { id: "segments",   label: "🎯  Risk Segments",      component: SegmentsPage   },
  { id: "retention",  label: "🛡️  Retention Strategy", component: RetentionPage  },
];

export default function App() {
  const [activePage, setActivePage] = useState("overview");
  const Page = PAGES.find(p => p.id === activePage)?.component || OverviewPage;

  return (
    <div style={{ minHeight: "100vh", background: "#ECEEF3", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* ── TOP BAR ── */}
      <div style={{
        background: C.navy, color: "#fff",
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 34, height: 34, background: C.crimson, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: 16, fontFamily: "Georgia, serif"
          }}>T</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>Telco Churn Intelligence</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 0.5 }}>IBM Dataset · 7,043 Customers · Q3 California</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: "rgba(192,57,43,0.3)", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
            🔴 Churn Rate: 26.5%
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>March 2026</div>
        </div>
      </div>

      {/* ── NAV TABS ── */}
      <div style={{ background: C.navyM, padding: "0 28px", display: "flex", gap: 0 }}>
        {PAGES.map(p => (
          <button
            key={p.id}
            onClick={() => setActivePage(p.id)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: activePage === p.id ? "#fff" : "rgba(255,255,255,0.5)",
              fontWeight: activePage === p.id ? 700 : 500,
              fontSize: 13, padding: "14px 20px",
              borderBottom: activePage === p.id ? `3px solid ${C.gold}` : "3px solid transparent",
              transition: "all 0.15s", letterSpacing: 0.3,
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
        <Page />
      </div>
    </div>
  );
}
