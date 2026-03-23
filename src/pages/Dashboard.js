import React, { useEffect, useState } from 'react';
import api from '../api';
import { TrendingUp, Package, ShoppingBag, Users, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `${color}08`, borderRadius: '0 16px 0 80px' }}/>
    <div style={{ background: `${color}18`, borderRadius: '14px', padding: '14px', color, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontFamily: 'Playfair Display', fontWeight: '700', marginTop: '2px', color }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  </div>
);

const MiniBar = ({ data, maxVal }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '48px' }}>
    {data.map((item, i) => {
      const pct = maxVal > 0 ? (item.sold / maxVal) * 100 : 0;
      return (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '100%', height: `${Math.max(pct * 0.44, 4)}px`, background: `rgba(245,166,35,${0.4 + (i / data.length) * 0.6})`, borderRadius: '3px 3px 0 0', transition: 'height 0.6s ease' }}/>
        </div>
      );
    })}
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const r = await api.get('/dashboard');
      setData(r.data);
    } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: 'var(--muted)' }}>Loading dashboard…</span>
    </div>
  );

  const statusColor = s => ({ pending:'badge-pending', processing:'badge-processing', shipped:'badge-shipped', delivered:'badge-delivered', cancelled:'badge-cancelled' }[s] || '');
  const maxSold = data.topProducts.length ? Math.max(...data.topProducts.map(p => p.sold)) : 1;
  const statusCounts = { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  data.recentOrders.forEach(o => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <StatCard icon={<TrendingUp size={22}/>} label="Total Revenue" value={`₹${Number(data.total_revenue).toLocaleString()}`} color="#f5a623" sub="All time earnings"/>
        <StatCard icon={<ShoppingBag size={22}/>} label="Total Orders" value={data.total_orders} color="#11cdef" sub="All orders placed"/>
        <StatCard icon={<Package size={22}/>} label="Products" value={data.total_products} color="#2dce89" sub="In catalogue"/>
        <StatCard icon={<Users size={22}/>} label="Customers" value={data.total_customers} color="#7986f8" sub="Registered users"/>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Status Overview</span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className={`badge badge-${status}`} style={{ padding: '6px 14px', fontSize: '13px' }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}: <strong>{count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px' }}>Recent Orders</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/all-orders')}>View All <ArrowRight size={13}/></button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {data.recentOrders.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No orders yet</td></tr>}
                {data.recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><div style={{ fontWeight: 500 }}>{o.customer}</div><div style={{ fontSize: '11px', color: 'var(--muted)' }}>#{o.id}</div></td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{Number(o.total_amount).toLocaleString()}</td>
                    <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '18px' }}>Top Selling Products</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/products')}>Manage <ArrowRight size={13}/></button>
          </div>
          {data.topProducts.length > 0 && <div style={{ marginBottom: '12px' }}><MiniBar data={data.topProducts} maxVal={maxSold} /></div>}
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Sold</th></tr></thead>
              <tbody>
                {data.topProducts.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No sales yet</td></tr>}
                {data.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td><span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', background: i === 0 ? 'rgba(245,166,35,0.2)' : 'var(--bg3)', color: i === 0 ? 'var(--accent)' : 'var(--muted)', fontSize: '12px', fontWeight: '700' }}>{i + 1}</span></td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'var(--bg3)', borderRadius: '2px', minWidth: '60px' }}>
                          <div style={{ height: '100%', width: `${(p.sold / maxSold) * 100}%`, background: 'var(--accent)', borderRadius: '2px' }}/>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', minWidth: '50px' }}>{p.sold} units</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(245,54,92,0.25)', background: 'rgba(245,54,92,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--danger)"/> Low Stock Alert
              <span style={{ background: 'rgba(245,54,92,0.15)', color: 'var(--danger)', fontSize: '12px', padding: '2px 8px', borderRadius: '12px' }}>{data.lowStock.length} items</span>
            </h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/products')}>Update Stock <ArrowRight size={13}/></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {data.lowStock.map(p => (
              <div key={p.id} style={{ padding: '14px 16px', borderRadius: '10px', background: p.stock === 0 ? 'rgba(245,54,92,0.08)' : 'rgba(245,166,35,0.06)', border: `1px solid ${p.stock === 0 ? 'rgba(245,54,92,0.2)' : 'rgba(245,166,35,0.2)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: p.stock === 0 ? 'rgba(245,54,92,0.15)' : 'rgba(245,166,35,0.15)', color: p.stock === 0 ? 'var(--danger)' : 'var(--accent)' }}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}