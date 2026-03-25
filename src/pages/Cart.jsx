import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingBag, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const emptyAddress = { full_name: '', phone: '', address_line: '', city: '', state: '', pincode: '' };

export default function Cart() {
  const [cart,         setCart]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [checkout,     setCheckout]     = useState(false);
  const [showAddrModal,setShowAddrModal]= useState(false);
  const [address,      setAddress]      = useState(emptyAddress);
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

  // Step 1: open address modal
  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setShowAddrModal(true);
  };

  // Step 2: validate address then place order
  const placeOrder = async e => {
    e.preventDefault();
    const { full_name, phone, address_line, city, state, pincode } = address;
    if (!full_name.trim() || !phone.trim() || !address_line.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      toast.error('Please fill all address fields');
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      toast.error('Phone number must be 10 digits');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      toast.error('Pincode must be 6 digits');
      return;
    }
    setCheckout(true);
    try {
      const { data } = await api.post('/orders', address);
      toast.success(`Order #${data.order_id} placed! Total: Rs.${Number(data.total).toLocaleString()}`);
      setShowAddrModal(false);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Checkout failed');
    } finally { setCheckout(false); }
  };

  const set = (field, val) => setAddress(a => ({ ...a, [field]: val }));

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

          {/* Cart items */}
          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
            {cart.map(item => (
              <div key={item.id} className="card" style={{ display:'flex',gap:'16px',alignItems:'center',padding:'16px' }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width:72,height:72,borderRadius:10,objectFit:'cover',flexShrink:0 }}/>
                  : <div style={{ width:72,height:72,borderRadius:10,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0 }}>📦</div>
                }
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontWeight:600,fontSize:15 }}>{item.name}</div>
                  <div style={{ color:'var(--accent)',fontWeight:700,marginTop:4 }}>Rs.{Number(item.price).toLocaleString()}</div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                  <button className="btn btn-outline btn-sm" style={{ padding:'4px 8px' }} onClick={()=>updateQty(item,-1)}><Minus size={12}/></button>
                  <span style={{ minWidth:24,textAlign:'center',fontWeight:600 }}>{item.quantity}</span>
                  <button className="btn btn-outline btn-sm" style={{ padding:'4px 8px' }} onClick={()=>updateQty(item,1)}><Plus size={12}/></button>
                </div>
                <div style={{ minWidth:80,textAlign:'right',fontWeight:600 }}>
                  Rs.{Number(item.price * item.quantity).toLocaleString()}
                </div>
                <button className="btn btn-danger btn-sm" style={{ padding:'6px 10px' }} onClick={()=>remove(item.id)}>
                  <Trash2 size={14}/>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ position:'sticky',top:24 }}>
            <h3 style={{ fontSize:'20px',marginBottom:'20px' }}>Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:14 }}>
                <span style={{ color:'var(--muted)' }}>{item.name} × {item.quantity}</span>
                <span>Rs.{Number(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop:'1px solid var(--border)',paddingTop:16,marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <span style={{ fontWeight:600 }}>Total</span>
              <span style={{ fontSize:'22px',fontFamily:'Playfair Display',fontWeight:700,color:'var(--accent)' }}>
                Rs.{Number(total).toLocaleString()}
              </span>
            </div>

            {/* Delivery note */}
            <div style={{ display:'flex',alignItems:'center',gap:'8px',margin:'16px 0 0',padding:'12px',background:'rgba(245,166,35,0.06)',borderRadius:'10px',border:'1px solid rgba(245,166,35,0.15)' }}>
              <MapPin size={16} color="var(--accent)"/>
              <span style={{ fontSize:'13px',color:'var(--muted)' }}>You will enter your delivery address in the next step</span>
            </div>

            <button
              className="btn btn-primary"
              style={{ width:'100%',justifyContent:'center',padding:'14px',marginTop:'16px',fontSize:'16px' }}
              onClick={handleCheckoutClick}>
              <ShoppingBag size={18}/> Proceed to Checkout
            </button>
          </div>
        </div>
      )}

      {/* ── Address Modal ── */}
      {showAddrModal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'20px' }}>
          <div className="card" style={{ width:'100%',maxWidth:'520px',maxHeight:'92vh',overflowY:'auto' }}>

            {/* Modal header */}
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px' }}>
              <div>
                <h3 style={{ fontSize:'20px',display:'flex',alignItems:'center',gap:'8px' }}>
                  <MapPin size={20} color="var(--accent)"/> Delivery Address
                </h3>
                <p style={{ fontSize:'12px',color:'var(--muted)',marginTop:'4px' }}>Where should we deliver your order?</p>
              </div>
              <button onClick={()=>setShowAddrModal(false)} style={{ background:'var(--bg3)',border:'none',cursor:'pointer',color:'var(--muted)',borderRadius:'8px',padding:'6px',display:'flex' }}>
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={placeOrder}>

              {/* Full Name */}
              <div className="form-group">
                <label>Full Name *</label>
                <input placeholder="e.g. Ramesh Kumar" value={address.full_name} onChange={e=>set('full_name',e.target.value)} required/>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone Number *</label>
                <input placeholder="10-digit mobile number" value={address.phone} onChange={e=>set('phone',e.target.value)} maxLength={10} required/>
              </div>

              {/* Address Line */}
              <div className="form-group">
                <label>House / Flat / Street Address *</label>
                <textarea rows={2} placeholder="e.g. Flat 4B, Shiva Apartments, MG Road" value={address.address_line} onChange={e=>set('address_line',e.target.value)} required/>
              </div>

              {/* City + State side by side */}
              <div className="grid-2">
                <div className="form-group">
                  <label>City *</label>
                  <input placeholder="e.g. Kathmandu" value={address.city} onChange={e=>set('city',e.target.value)} required/>
                </div>
                <div className="form-group">
                  <label>State / Province *</label>
                  <input placeholder="e.g. Bagmati" value={address.state} onChange={e=>set('state',e.target.value)} required/>
                </div>
              </div>

              {/* Pincode */}
              <div className="form-group">
                <label>Pincode / ZIP Code *</label>
                <input placeholder="6-digit pincode" value={address.pincode} onChange={e=>set('pincode',e.target.value)} maxLength={6} required/>
              </div>

              {/* Order total reminder */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px',background:'var(--bg3)',borderRadius:'10px',marginBottom:'16px' }}>
                <span style={{ color:'var(--muted)',fontSize:'14px' }}>Order Total</span>
                <span style={{ fontSize:'20px',fontFamily:'Playfair Display',fontWeight:700,color:'var(--accent)' }}>
                  Rs.{Number(total).toLocaleString()}
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display:'flex',gap:'10px' }}>
                <button type="button" className="btn btn-outline" onClick={()=>setShowAddrModal(false)} style={{ flex:1,justifyContent:'center' }}>
                  Back to Cart
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex:2,justifyContent:'center',padding:'12px' }} disabled={checkout}>
                  <ShoppingBag size={16}/>
                  {checkout ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
