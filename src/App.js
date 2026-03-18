import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Login    from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products  from './pages/Products';
import Shop      from './pages/Shop';
import Cart      from './pages/Cart';
import Orders    from './pages/Orders';
import AllOrders from './pages/AllOrders';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/shop" />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="layout">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={!user ? <Login />    : <Navigate to="/shop" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/shop" />} />

      <Route path="/shop" element={
        <PrivateRoute><AppLayout><Shop /></AppLayout></PrivateRoute>
      }/>
      <Route path="/cart" element={
        <PrivateRoute><AppLayout><Cart /></AppLayout></PrivateRoute>
      }/>
      <Route path="/orders" element={
        <PrivateRoute><AppLayout><Orders /></AppLayout></PrivateRoute>
      }/>
      <Route path="/dashboard" element={
        <PrivateRoute adminOnly><AppLayout><Dashboard /></AppLayout></PrivateRoute>
      }/>
      <Route path="/products" element={
        <PrivateRoute adminOnly><AppLayout><Products /></AppLayout></PrivateRoute>
      }/>
      <Route path="/all-orders" element={
        <PrivateRoute adminOnly><AppLayout><AllOrders /></AppLayout></PrivateRoute>
      }/>

      <Route path="*" element={<Navigate to={user ? "/shop" : "/login"} />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a1a28', color: '#f0ede8', border: '1px solid rgba(255,255,255,0.07)' }
        }}/>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
