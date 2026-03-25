import React, { useEffect, useState } from 'react';
import api from '../api';
import { MapPin } from 'lucide-react';

const statusColor = s => ({ pending:'badge-pending',processing:'badge-processing',shipped:'badge-shipped',delivered:'badge-delivered',cancelled:'badge-cancelled' }[s] || '');

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => { setOrders(r.data); setLoading(false); });
  }, []);

  if (loading) return <div style={{ color:'var(--muted)',textAlign:'center',marginTop:'60px' }}>Loading orders…</div>;

  return (
    <div>
      <div className="page-header"><h1>My Orders</h1></div>

      {orders.length === 0 ? (
        <div style={{ textAlign:'center',padding:'80px',color:'var(--muted)' }}>
          <div style={{ fontSize:'56px',marginBottom:'16px' }}>📦</div>
          <h3>No orders yet</h3>
          <p>Place your first order from the shop!</p>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:'16px' }}>
          {orders.map(o => (
            <div key={o.id} className="card">
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'12px' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px' }}>
                    <h3 style={{ fontSize:'16px',fontFamily:'DM Sans',fontWeight:600 }}>Order #{o.id}</h3>
                    <span className={`badge ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <p style={{ fontSize:'13px',color:'var(--muted)',marginBottom:'6px' }}>{o.items}</p>
                  <p style={{ fontSize:'12px',color:'var(--muted)',marginBottom:'10px' }}>
                    {new Date(o.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                  </p>

                  {/* Delivery Address */}
                  {o.delivery_address && (
                    <div style={{ display:'flex',alignItems:'flex-start',gap:'8px',padding:'10px 12px',background:'rgba(245,166,35,0.06)',borderRadius:'8px',border:'1px solid rgba(245,166,35,0.12)' }}>
                      <MapPin size={14} color="var(--accent)" style={{ marginTop:'1px',flexShrink:0 }}/>
                      <div>
                        <div style={{ fontSize:'11px',color:'var(--accent)',fontWeight:600,marginBottom:'2px' }}>Delivery Address</div>
                        <div style={{ fontSize:'12px',color:'var(--muted)' }}>{o.delivery_address}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'22px',fontFamily:'Playfair Display',fontWeight:'700',color:'var(--accent)' }}>
                    Rs.{Number(o.total_amount).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
