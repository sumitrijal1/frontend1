import React, { useEffect, useState, useRef } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Search, Package, Filter, Upload, Image } from 'lucide-react';

const empty = { name: '', description: '', price: '', stock: '', category_id: '', image_url: '' };

const StockBadge = ({ stock }) => {
  if (stock === 0) return <span style={{ background:'rgba(245,54,92,0.15)',color:'var(--danger)',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600 }}>Out of Stock</span>;
  if (stock < 10)  return <span style={{ background:'rgba(245,166,35,0.15)',color:'var(--accent)',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600 }}>{stock} Low</span>;
  return <span style={{ background:'rgba(45,206,137,0.15)',color:'var(--success)',padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600 }}>{stock} In stock</span>;
};

export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(empty);
  const [editId,     setEditId]     = useState(null);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [imageMode,  setImageMode]  = useState('upload');
  const [preview,    setPreview]    = useState('');
  const fileInputRef = useRef();

  const load = async () => {
    const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')]);
    setProducts(p.data); setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(empty); setEditId(null);
    setPreview(''); setImageMode('upload');
    setModal(true);
  };

  const openEdit = p => {
    setForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, category_id: p.category_id || '', image_url: p.image_url || '' });
    setPreview(p.image_url || '');
    setImageMode('url');
    setEditId(p.id); setModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, image_url: data.imageUrl }));
      setPreview(data.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
      setPreview('');
    } finally { setUploading(false); }
  };

  const save = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) { await api.put('/products/' + editId, form); toast.success('Product updated!'); }
      else        { await api.post('/products', form);           toast.success('Product created!'); }
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this product?')) return;
    setDeleting(id);
    try { await api.delete('/products/' + id); toast.success('Deleted'); load(); }
    catch (err) { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter ? String(p.category_id) === catFilter : true;
    return matchSearch && matchCat;
  });

  const totalValue = filtered.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p style={{ color:'var(--muted)',fontSize:'13px',marginTop:'4px' }}>
            {filtered.length} products · Inventory value: <span style={{ color:'var(--accent)' }}>Rs.{Number(totalValue).toLocaleString()}</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add Product</button>
      </div>

      <div style={{ display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap' }}>
        {[
          { label:'Total Products',  value:products.length,                                 color:'var(--info)' },
          { label:'Out of Stock',    value:products.filter(p=>p.stock===0).length,           color:'var(--danger)' },
          { label:'Low Stock (<10)', value:products.filter(p=>p.stock>0&&p.stock<10).length, color:'var(--accent)' },
          { label:'Healthy Stock',   value:products.filter(p=>p.stock>=10).length,           color:'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ flex:'1',minWidth:'140px',padding:'14px 18px',display:'flex',gap:'12px',alignItems:'center' }}>
            <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:s.color,flexShrink:0 }}/>
            <div>
              <div style={{ fontSize:'20px',fontWeight:'700',fontFamily:'Playfair Display',color:s.color }}>{s.value}</div>
              <div style={{ fontSize:'11px',color:'var(--muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom:'20px',padding:'14px 18px' }}>
        <div style={{ display:'flex',gap:'12px',flexWrap:'wrap' }}>
          <div style={{ position:'relative',flex:1,minWidth:'200px' }}>
            <Search size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)' }}/>
            <input placeholder="Search by product name..." value={search} onChange={e=>setSearch(e.target.value)} style={{ paddingLeft:'36px' }}/>
          </div>
          <div style={{ position:'relative',minWidth:'180px' }}>
            <Filter size={15} style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--muted)',pointerEvents:'none',zIndex:1 }}/>
            <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ paddingLeft:'36px' }}>
              <option value="">All Categories</option>
              {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {(search||catFilter) && (
            <button className="btn btn-outline btn-sm" onClick={()=>{setSearch('');setCatFilter('');}}>Clear</button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th style={{width:60}}>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th style={{width:160}}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width:48,height:48,borderRadius:10,objectFit:'cover',border:'1px solid var(--border)' }}/>
                      : <div style={{ width:48,height:48,borderRadius:10,background:'var(--bg3)',display:'flex',alignItems:'center',justifyContent:'center' }}><Package size={20} color="var(--muted)"/></div>
                    }
                  </td>
                  <td>
                    <div style={{ fontWeight:600,fontSize:14 }}>{p.name}</div>
                    <div style={{ fontSize:12,color:'var(--muted)',marginTop:3,maxWidth:260,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{p.description || 'No description'}</div>
                  </td>
                  <td>
                    {p.category_name
                      ? <span style={{ background:'rgba(121,134,248,0.12)',color:'#7986f8',padding:'3px 10px',borderRadius:'20px',fontSize:'12px' }}>{p.category_name}</span>
                      : <span style={{ color:'var(--muted)',fontSize:'12px' }}>--</span>}
                  </td>
                  <td><span style={{ fontSize:'16px',fontWeight:'700',color:'var(--accent)',fontFamily:'Playfair Display' }}>Rs.{Number(p.price).toLocaleString()}</span></td>
                  <td><StockBadge stock={p.stock}/></td>
                  <td>
                    <div style={{ display:'flex',gap:'8px' }}>
                      <button className="btn btn-outline btn-sm" onClick={()=>openEdit(p)}><Pencil size={13}/> Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>del(p.id)} disabled={deleting===p.id}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center',padding:'48px',color:'var(--muted)' }}>
                  <Package size={32} style={{ opacity:0.3,display:'block',margin:'0 auto 10px' }}/>
                  No products found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:'20px' }}>
          <div className="card" style={{ width:'100%',maxWidth:'540px',maxHeight:'92vh',overflowY:'auto' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px' }}>
              <div>
                <h3 style={{ fontSize:'20px' }}>{editId ? 'Edit Product' : 'Add New Product'}</h3>
                <p style={{ fontSize:'12px',color:'var(--muted)',marginTop:'2px' }}>{editId ? 'Update product details' : 'Fill in the details below'}</p>
              </div>
              <button onClick={()=>setModal(false)} style={{ background:'var(--bg3)',border:'none',cursor:'pointer',color:'var(--muted)',borderRadius:'8px',padding:'6px',display:'flex' }}><X size={18}/></button>
            </div>

            <form onSubmit={save}>
              <div className="form-group">
                <label>Product Name *</label>
                <input placeholder="e.g. Wireless Headphones" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} placeholder="Brief product description..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input type="number" min="0" placeholder="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div style={{ display:'flex',gap:'8px',marginBottom:'12px' }}>
                  <button type="button" onClick={()=>setImageMode('upload')}
                    style={{ flex:1,padding:'8px',borderRadius:'8px',border:'2px solid ' + (imageMode==='upload'?'var(--accent)':'var(--border)'), background: imageMode==='upload'?'rgba(245,166,35,0.08)':'transparent', color: imageMode==='upload'?'var(--accent)':'var(--muted)', cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px' }}>
                    <Upload size={14}/> Upload from Computer
                  </button>
                  <button type="button" onClick={()=>setImageMode('url')}
                    style={{ flex:1,padding:'8px',borderRadius:'8px',border:'2px solid ' + (imageMode==='url'?'var(--accent)':'var(--border)'), background: imageMode==='url'?'rgba(245,166,35,0.08)':'transparent', color: imageMode==='url'?'var(--accent)':'var(--muted)', cursor:'pointer',fontSize:'13px',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px' }}>
                    <Image size={14}/> Paste Image URL
                  </button>
                </div>

                {imageMode === 'upload' && (
                  <div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display:'none' }}/>
                    <div onClick={()=>fileInputRef.current.click()}
                      style={{ border:'2px dashed var(--border)',borderRadius:'12px',padding:'32px',textAlign:'center',cursor:'pointer',background:'var(--bg3)',transition:'border-color 0.2s' }}
                      onMouseOver={e=>e.currentTarget.style.borderColor='var(--accent)'}
                      onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                      {uploading ? (
                        <div>
                          <div style={{ width:'32px',height:'32px',border:'3px solid var(--border)',borderTop:'3px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 8px' }}/>
                          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                          <p style={{ color:'var(--accent)',fontSize:'13px' }}>Uploading...</p>
                        </div>
                      ) : preview && form.image_url ? (
                        <div>
                          <img src={preview} alt="preview" style={{ width:'100%',height:'140px',objectFit:'cover',borderRadius:'8px',marginBottom:'8px' }}/>
                          <p style={{ color:'var(--muted)',fontSize:'12px' }}>Click to change image</p>
                        </div>
                      ) : (
                        <div>
                          <Upload size={32} color="var(--muted)" style={{ margin:'0 auto 8px',display:'block' }}/>
                          <p style={{ color:'var(--text)',fontSize:'14px',fontWeight:500,marginBottom:'4px' }}>Click to upload image</p>
                          <p style={{ color:'var(--muted)',fontSize:'12px' }}>JPG, PNG, WEBP up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {imageMode === 'url' && (
                  <div>
                    <input placeholder="https://images.unsplash.com/..." value={form.image_url}
                      onChange={e=>{setForm({...form,image_url:e.target.value});setPreview(e.target.value);}}/>
                    {form.image_url && (
                      <div style={{ marginTop:'10px',borderRadius:'10px',overflow:'hidden',height:'140px' }}>
                        <img src={form.image_url} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }} onError={e=>e.target.style.display='none'}/>
                      </div>
                    )}
                    <span style={{ fontSize:'11px',color:'var(--muted)',marginTop:'4px',display:'block' }}>Paste any image URL from the web</span>
                  </div>
                )}
              </div>

              <div style={{ display:'flex',gap:10,marginTop:8 }}>
                <button type="button" className="btn btn-outline" onClick={()=>setModal(false)} style={{flex:1,justifyContent:'center'}}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{flex:2,justifyContent:'center'}} disabled={saving||uploading}>
                  {saving ? 'Saving...' : (editId ? 'Update Product' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}