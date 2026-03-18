import React, { useEffect, useState } from 'react';
import api from '../api';
import { TrendingUp, Package, ShoppingBag, Users, AlertTriangle } from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ background: `${color}18`, borderRadius: '12px', padding: '14px', color }}>
      {icon}
    </div>
    <div>
      <div style={{ color: 'var(--muted)', fontSize: '13px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontFamily: 'Playfair Display', fontWeight: '700', marginTop: '2px' }}>{value}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '60px' }}>Loading dashboard…</div>;

  const statusColor = s => ({ pending:'badge-pending', processing:'badge-processing', shipped:'badge-shipped', delivered:'badge-delivered', cancelled:'badge-cancelled' }[s] || '');

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        <StatCard icon={<TrendingUp size={22}/>} label="Total Revenue" value={`₹${Number(data.total_revenue).toLocaleString()}`} color="#f5a623"/>
        <StatCard icon={<ShoppingBag size={22}/>} label="Total Orders"   value={data.total_orders}   color="#11cdef"/>
        <StatCard icon={<Package size={22}/>}     label="Products"       value={data.total_products}  color="#2dce89"/>
        <StatCard icon={<Users size={22}/>}        label="Customers"      value={data.total_customers} color="#7986f8"/>
      </div>

      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Recent Orders</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {data.recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>{o.customer}</td>
                    <td>₹{Number(o.total_amount).toLocaleString()}</td>
                    <td><span className={`badge ${statusColor(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Top Selling Products</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Product</th><th>Sold</th></tr></thead>
              <tbody>
                {data.topProducts.map((p, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--accent)', fontWeight: '600' }}>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.sold} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock */}
      {data.lowStock.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(245,54,92,0.3)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--danger)"/> Low Stock Alert
          </h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Stock Remaining</th></tr></thead>
              <tbody>
                {data.lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td style={{ color: p.stock === 0 ? 'var(--danger)' : 'var(--accent)' }}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
