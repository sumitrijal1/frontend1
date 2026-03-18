import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cart,     setCart]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [checkout, setCheckout] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try { const { data } = await api.get('/cart'); setCart(data); }
    catch { toast.error('Failed to load cart'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateQty = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    if (newQty > item.stock) { toast.error('Not enough stock'); return; }
    await api.put(`/cart/${item.id}`, { quantity: newQty });
    load();
  };

  const remove = async id => {
    await api.delete(`/cart/${id}`);
    toast.success('Removed from cart');
    load();
  };

  const placeOrder = async () => {
    setCheckout(true);
    try {
      const { data } = await api.post('/orders');
      toast.success(`Order #${data.order_id} placed! Total: ₹${Number(data.total).toLocaleString()}`);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally { setCheckout(false); }
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  if (loading) return <div style={{ color:'var(--muted)',textAlign:'center',marginTop:'60px' }}>Loading cart…</div>;

  return (
    <div>
      <div className="page-header"><h1>My Cart</h1></div>

      {cart.length === 0 ? (
        <div style={{ textAlign:'center',padding:'80px',color:'var(--muted)' }}>
          <div style={{ fontSize:'56px',marginBottom:'16px' }}>🛒</div>
          <h3 style={{ marginBottom:'8px' }}>Your cart is empty</h3>
          <p style={{ marginBottom:'20px' }}>Browse the shop and add items</p>
          <button className="btn btn-primary" onClick={()=>navigate('/shop')}>Go to Shop</button>
        </div>
      ) : (
        <div className="grid-2" style={{ alignItems:'start' }}>
          {/* Items */}
          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
            {cart.map(item => (
              <div key={item.id} className="card" style={{ display:'flex',gap:'16px',alignItems:'center',padding:'16px' }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width:72,height:72,borderRadius:10,objectFit:'cover',flexShrink:0 }}/>
                  : <div style={{ width:72,height:72,borderRadius:10,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0 }}>📦</div>
                }
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:600,fontSize:15 }}>{item.name}</div>
                  <div style={{ color:'var(--accent)',fontWeight:700,marginTop:4 }}>₹{Number(item.price).toLocaleString()}</div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <button className="btn btn-outline btn-sm" style={{ padding:'4px 8px' }} onClick={()=>updateQty(item,-1)}>
                    <Minus size={12}/>
                  </button>
                  <span style={{ minWidth:24,textAlign:'center',fontWeight:600 }}>{item.quantity}</span>
                  <button className="btn btn-outline btn-sm" style={{ padding:'4px 8px' }} onClick={()=>updateQty(item,1)}>
                    <Plus size={12}/>
                  </button>
                </div>
                <div style={{ minWidth:80,textAlign:'right',fontWeight:600 }}>
                  ₹{Number(item.price * item.quantity).toLocaleString()}
                </div>
                <button className="btn btn-danger btn-sm" style={{ padding:'6px 10px' }} onClick={()=>remove(item.id)}>
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card" style={{ position:'sticky',top:24 }}>
            <h3 style={{ fontSize:'20px',marginBottom:'20px' }}>Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14 }}>
                <span style={{ color:'var(--muted)' }}>{item.name} × {item.quantity}</span>
                <span>₹{Number(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid var(--border)',paddingTop:16,marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontWeight:600 }}>Total</span>
              <span style={{ fontSize:'22px',fontFamily:'Playfair Display',fontWeight:700,color:'var(--accent)' }}>
                ₹{Number(total).toLocaleString()}
              </span>
            </div>
            <button className="btn btn-primary" style={{ width:'100%',justifyContent:'center',padding:'14px',marginTop:'20px',fontSize:'16px' }}
              onClick={placeOrder} disabled={checkout}>
              <ShoppingBag size={18}/> {checkout ? 'Placing Order…' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
