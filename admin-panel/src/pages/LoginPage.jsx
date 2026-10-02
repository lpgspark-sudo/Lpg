import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    navigate('/orders');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} className="glass-card" style={{ width: 340 }}>
        <h2 style={{ marginTop: 0 }}>🔥 LPG Customer Care</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Staff / Admin login</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
          <input
            className="glass-input"
            type="email"
            placeholder="Staff email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="glass-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button className="glass-button" type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}
