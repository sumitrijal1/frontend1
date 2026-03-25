import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Search, ChevronDown, ChevronUp, RefreshCw, Filter } from 'lucide-react';

const statuses = ['pending','processing','shipped','delivered','cancelled'];
const statusColor = s => ({ pending:'badge-pending',processing:'badge-processing',shipped:'badge-shipped',delivered:'badge-delivered',cancelled:'badge-cancelled' }[s] || '');

const statusFlow = ['pending','processing','shipped','delivered'];

export default function AllOrders() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded,   setExpanded]   = useState(null);
  const [updating,   setUpdating]   = useState(null);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success(`Order #${id} → ${status}`);
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const counts = statuses.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc; }, {});
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0);

  if (loading) return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'16px' }}>
      <div style={{ width:'40px',height:'40px',border:'3px solid var(--border)',borderTop:'3px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:'var(--muted)' }}>Loading orders…</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Orders</h1>
          <p style={{ color:'var(--muted)',fontSize:'13px',marginTop:'4px' }}>
            {orders.length} total orders · Revenue: <span style={{ color:'var(--accent)' }}>₹{Number(totalRevenue).toLocaleString()}</span>
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => load(true)} disabled={refreshing}>
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}/>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Status summary pills */}
      <div style={{ display:'flex',gap:'10px',marginBottom:'20px',flexWrap:'wrap' }}>
        <button
          onClick={() => setStatusFilter('')}
          style={{
            padding:'8px 16px',borderRadius:'20px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:500,
            background: !statusFilter ? 'var(--accent)' : 'var(--bg2)',
            color: !statusFilter ? '#0a0a0f' : 'var(--muted)',
            transition:'all 0.2s'
          }}>
          All ({orders.length})
        </button>
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            className={`badge badge-${s}`}
            style={{
              padding:'8px 16px',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:500,
              opacity: statusFilter && statusFilter !== s ? 0.4 : 1,
              transition:'all 0.2s'
            }}>
            {s.charAt(0).toUpperCase()+s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom:'20px',padding:'14px 18px' }}>
        <div style={{ position:'relative' }}>
          <Search size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)' }}/>
          <input placeholder="Search by customer name, email or order ID…" value={search}
            onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'36px' }}/>
        </div>
      </div>

      {/* Orders table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{width:40}}></th>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <React.Fragment key={o.id}>
                  <tr style={{ cursor:'pointer' }} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                    <td>
                      {expanded === o.id
                        ? <ChevronUp size={16} color="var(--accent)"/>
                        : <ChevronDown size={16} color="var(--muted)"/>
                      }
                    </td>
                    <td>
                      <span style={{ fontWeight:700,color:'var(--accent)',fontFamily:'Playfair Display' }}>#{o.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight:500 }}>{o.customer_name}</div>
                      <div style={{ fontSize:11,color:'var(--muted)' }}>{o.email}</div>
                    </td>
                    <td style={{ fontSize:13,color:'var(--muted)',maxWidth:180 }}>
                      <div style={{ overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{o.items || '—'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight:700,fontSize:15,color:'var(--text)' }}>₹{Number(o.total_amount).toLocaleString()}</span>
                    </td>
                    <td style={{ fontSize:12,color:'var(--muted)',whiteSpace:'nowrap' }}>
                      {new Date(o.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                    </td>
                    <td onClick={e=>e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={e=>updateStatus(o.id,e.target.value)}
                        disabled={updating===o.id}
                        className={`badge badge-${o.status}`}
                        style={{ width:'auto',padding:'6px 10px',borderRadius:'20px',cursor:'pointer',fontWeight:500 }}>
                        {statuses.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={7} style={{ padding:'0',background:'transparent' }}>
                        <div style={{ margin:'0 0 12px',padding:'20px 24px',background:'var(--bg3)',borderRadius:'12px',border:'1px solid var(--border)' }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                            {/* Delivery Address */}
                            {o.delivery_address && (
                              <div style={{ padding:"12px 16px", background:"rgba(245,166,35,0.06)", borderRadius:"10px", border:"1px solid rgba(245,166,35,0.15)" }}>
                                <div style={{ fontSize:"11px", color:"var(--muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"6px" }}>📍 Delivery Address</div>
                                <div style={{ fontSize:"13px", color:"var(--text)" }}>{o.delivery_address}</div>
                              </div>
                            )}
                            <div className="grid-2" style={{ gap:"24px" }}>
                            {/* Order progress */}
                            <div>
                              <div style={{ fontSize:'12px',color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'14px' }}>
                                Order Progress
                              </div>
                              <div style={{ display:'flex',alignItems:'center',gap:'0' }}>
                                {statusFlow.map((s, i) => {
                                  const reached = statusFlow.indexOf(o.status) >= i || o.status === 'delivered';
                                  const isCurrent = o.status === s;
                                  return (
                                    <React.Fragment key={s}>
                                      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:'6px' }}>
                                        <div style={{
                                          width:28,height:28,borderRadius:'50%',
                                          background: reached ? 'var(--accent)' : 'var(--bg2)',
                                          border: `2px solid ${reached ? 'var(--accent)' : 'var(--border)'}`,
                                          display:'flex',alignItems:'center',justifyContent:'center',
                                          fontSize:11,fontWeight:700,
                                          color: reached ? '#0a0a0f' : 'var(--muted)',
                                          boxShadow: isCurrent ? '0 0 0 4px rgba(245,166,35,0.2)' : 'none'
                                        }}>✓</div>
                                        <span style={{ fontSize:10,color: reached ? 'var(--accent)' : 'var(--muted)',whiteSpace:'nowrap' }}>
                                          {s.charAt(0).toUpperCase()+s.slice(1)}
                                        </span>
                                      </div>
                                      {i < statusFlow.length - 1 && (
                                        <div style={{ flex:1,height:2,background: statusFlow.indexOf(o.status)>i ? 'var(--accent)' : 'var(--border)',margin:'0 4px',marginBottom:20 }}/>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                              {o.status === 'cancelled' && (
                                <div style={{ marginTop:12,padding:'8px 12px',background:'rgba(245,54,92,0.08)',border:'1px solid rgba(245,54,92,0.2)',borderRadius:'8px',fontSize:12,color:'var(--danger)' }}>
                                  ✕ This order was cancelled
                                </div>
                              )}
                            </div>
                            {/* Quick actions */}
                            <div>
                              <div style={{ fontSize:'12px',color:'var(--muted)',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'14px' }}>
                                Quick Actions
                              </div>
                              <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
                                {statuses.filter(s=>s!==o.status).map(s=>(
                                  <button key={s} className={`btn btn-outline btn-sm`}
                                    style={{ justifyContent:'flex-start',textTransform:'capitalize' }}
                                    disabled={updating===o.id}
                                    onClick={()=>updateStatus(o.id,s)}>
                                    <span className={`badge badge-${s}`} style={{ padding:'1px 6px',fontSize:10 }}>{s}</span>
                                    Mark as {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center',padding:'48px',color:'var(--muted)' }}>
                    <div style={{ fontSize:40,marginBottom:12 }}>📦</div>
                    {search||statusFilter ? 'No orders match your filters' : 'No orders yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
