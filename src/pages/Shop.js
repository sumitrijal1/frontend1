import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { ShoppingCart, Search } from 'lucide-react';

export default function Shop() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [adding,     setAdding]     = useState({});

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    loadProducts();
  }, []);

  const loadProducts = async (s = '', c = '') => {
    const params = new URLSearchParams();
    if (s) params.append('search', s);
    if (c) params.append('category', c);
    const { data } = await api.get(`/products?${params}`);
    setProducts(data);
  };

  const handleSearch = e => {
    setSearch(e.target.value);
    loadProducts(e.target.value, catFilter);
  };

  const handleCat = e => {
    setCatFilter(e.target.value);
    loadProducts(search, e.target.value);
  };

  const addToCart = async product => {
    setAdding(a => ({ ...a, [product.id]: true }));
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error adding to cart');
    } finally {
      setAdding(a => ({ ...a, [product.id]: false }));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Shop</h1>
        <span style={{ color: 'var(--muted)', fontSize: '14px' }}>{products.length} products</span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)' }}/>
          <input placeholder="Search products…" value={search} onChange={handleSearch}
            style={{ paddingLeft: '36px' }} />
        </div>
        <select value={catFilter} onChange={handleCat} style={{ width: '180px' }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      <div className="grid-3">
        {products.map(p => (
          <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
              {p.image_url
                ? <img src={p.image_url} alt={p.name} style={{ width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.3s' }}
                    onMouseOver={e=>e.target.style.transform='scale(1.05)'}
                    onMouseOut={e=>e.target.style.transform='scale(1)'} />
                : <div style={{ width:'100%',height:'100%',background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'48px' }}>📦</div>
              }
              {p.stock < 5 && (
                <span style={{ position:'absolute',top:10,right:10,background:'var(--danger)',color:'white',fontSize:'11px',padding:'3px 8px',borderRadius:'6px',fontWeight:600 }}>
                  {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                </span>
              )}
            </div>
            <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                {p.category_name || 'Uncategorized'}
              </div>
              <h3 style={{ fontSize: '16px', fontFamily: 'DM Sans', fontWeight: 600, marginBottom: '6px' }}>{p.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', flex: 1, marginBottom: '12px', lineHeight: '1.4' }}>
                {p.description?.slice(0, 80)}…
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '20px', fontFamily: 'Playfair Display', fontWeight: '700', color: 'var(--accent)' }}>
                  ₹{Number(p.price).toLocaleString()}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0 || adding[p.id]}
                  style={{ opacity: p.stock === 0 ? 0.4 : 1 }}>
                  <ShoppingCart size={14}/>
                  {adding[p.id] ? 'Adding…' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}
