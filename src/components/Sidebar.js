import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList,
  Users, LogOut, Store, Tag
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const customerLinks = [
    { to: '/shop',    icon: <Store size={18} />,         label: 'Shop' },
    { to: '/cart',    icon: <ShoppingCart size={18} />,  label: 'My Cart' },
    { to: '/orders',  icon: <ClipboardList size={18} />, label: 'My Orders' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/products',  icon: <Package size={18} />,         label: 'Products' },
    { to: '/shop',      icon: <Store size={18} />,           label: 'Shop' },
    { to: '/all-orders',icon: <ClipboardList size={18} />,   label: 'All Orders' },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  const navStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 20px', borderRadius: '10px', margin: '2px 12px',
    fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
    background: isActive ? 'rgba(245,166,35,0.12)' : 'transparent',
    color: isActive ? '#f5a623' : '#8a8799',
    borderLeft: isActive ? '3px solid #f5a623' : '3px solid transparent',
  });

  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '0 24px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: '22px', color: '#f5a623' }}>
          Shop<span style={{ color: '#f0ede8' }}>DB</span>
        </h2>
        <p style={{ fontSize: '11px', color: '#8a8799', marginTop: '2px' }}>
          {isAdmin ? '⚡ Admin Panel' : '🛍️ Customer'}
        </p>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 24px', margin: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#f0ede8' }}>{user?.name}</div>
        <div style={{ fontSize: '11px', color: '#8a8799', marginTop: '2px' }}>{user?.email}</div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, marginTop: '8px' }}>
        {links.map(l => (
          <NavLink key={l.to} to={l.to} style={navStyle}>
            {l.icon}{l.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
