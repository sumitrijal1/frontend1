import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const statuses = ['pending','processing','shipped','delivered','cancelled'];
const statusColor = s => ({ pending:'badge-pending',processing:'badge-processing',shipped:'badge-shipped',delivered:'badge-delivered',cancelled:'badge-cancelled' }[s] || '');

export default function AllOrders() {
  const [orders, setOrders]  = useState([]);
  const [loading, setLoading]= useState(true);

  const load = () => api.get('/orders').then(r => { setOrders(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch { toast.error('Update failed'); }
  };

  if (loading) return <div style={{ color:'var(--muted)',textAlign:'center',marginTop:'60px' }}>Loading orders…</div>;

  return (
    <div>
      <div className="page-header">
        <h1>All Orders</h1>
        <span style={{ color:'var(--muted)',fontSize:'14px' }}>{orders.length} orders</span>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td style={{ fontWeight:600, color:'var(--accent)' }}>#{o.id}</td>
                  <td>
                    <div style={{ fontWeight:500 }}>{o.customer_name}</div>
                    <div style={{ fontSize:12,color:'var(--muted)' }}>{o.email}</div>
                  </td>
                  <td style={{ fontSize:13,color:'var(--muted)',maxWidth:200 }}>
                    <div style={{ whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{o.items}</div>
                  </td>
                  <td style={{ fontWeight:600 }}>₹{Number(o.total_amount).toLocaleString()}</td>
                  <td style={{ fontSize:13,color:'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={e => updateStatus(o.id, e.target.value)}
                      style={{ width:'auto',padding:'6px 10px',borderRadius:'8px' }}
                      className={`badge ${statusColor(o.status)}`}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center',color:'var(--muted)',padding:'40px' }}>No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
