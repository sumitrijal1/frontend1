import React, { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const empty = { name: '', description: '', price: '', stock: '', category_id: '', image_url: '' };

export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(empty);
  const [editId,     setEditId]     = useState(null);
  const [search,     setSearch]     = useState('');

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')]);
    setProducts(p.data); setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit   = p  => { setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category_id: p.category_id || '', image_url: p.image_url || '' }); setEditId(p.id); setModal(true); };

  const save = async e => {
    e.preventDefault();
    try {
      if (editId) { await api.put(`/products/${editId}`, form); toast.success('Product updated'); }
      else        { await api.post('/products', form);           toast.success('Product created'); }
      setModal(false); load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
  };

  const del = async id => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    toast.success('Deleted'); load();
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add Product</button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                      : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--bg3)', display:'flex',alignItems:'center',justifyContent:'center', color:'var(--muted)', fontSize:18 }}>📦</div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.description?.slice(0, 40)}…</div>
                  </td>
                  <td>{p.category_name || '—'}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{Number(p.price).toLocaleString()}</td>
                  <td>
                    <span style={{ color: p.stock < 10 ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>{p.stock}</span>
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(p)} style={{ marginRight: 8 }}>
                      <Pencil size={14}/> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => del(p.id)}>
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200 }}>
          <div className="card" style={{ width:'100%',maxWidth:'500px',maxHeight:'90vh',overflowY:'auto' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px' }}>
              <h3 style={{ fontSize:'20px' }}>{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModal(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--muted)' }}><X size={20}/></button>
            </div>
            <form onSubmit={save}>
              <div className="form-group"><label>Product Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
              <div className="form-group"><label>Description</label><textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div className="grid-2">
                <div className="form-group"><label>Price (₹) *</label><input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required /></div>
                <div className="form-group"><label>Stock *</label><input type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required /></div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Image URL</label><input placeholder="https://…" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} /></div>
              <div style={{ display:'flex',gap:12,marginTop:8 }}>
                <button type="button" className="btn btn-outline" onClick={()=>setModal(false)} style={{flex:1,justifyContent:'center'}}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex:1,justifyContent:'center'}}>{editId?'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
