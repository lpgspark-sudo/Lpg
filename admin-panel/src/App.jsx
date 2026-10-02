import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

export default function App() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/login');
      setChecked(true);
    });
  }, [navigate]);

  if (!checked) return null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>🔥 LPG Admin</h1>
        <NavLink to="/orders">Order Queue</NavLink>
        <NavLink to="/prices">Price Management</NavLink>
        <NavLink to="/complaints">Complaints</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <button
          className="glass-button secondary"
          style={{ marginTop: 24, width: '100%' }}
          onClick={async () => {
            await supabase.auth.signOut();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
