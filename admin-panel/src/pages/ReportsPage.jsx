import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const { data: orders } = await supabase.from('orders').select('status, payment_status, advance_amount, category');
      if (!orders) return;

      const totalOrders = orders.length;
      const delivered = orders.filter((o) => o.status === 'delivered').length;
      const paidOrders = orders.filter((o) => o.payment_status === 'paid');
      const totalCollected = paidOrders.reduce((sum, o) => sum + Number(o.advance_amount || 0), 0);

      const byCategory = orders.reduce((acc, o) => {
        acc[o.category] = (acc[o.category] || 0) + 1;
        return acc;
      }, {});

      setStats({ totalOrders, delivered, totalCollected, byCategory });
    })();
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Reports</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Delivered" value={stats.delivered} />
        <StatCard label="Advance Collected" value={`₹${stats.totalCollected.toFixed(2)}`} />
      </div>

      <div className="glass-card">
        <h3 style={{ marginTop: 0 }}>Orders by Category</h3>
        <table>
          <thead><tr><th>Category</th><th>Orders</th></tr></thead>
          <tbody>
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <tr key={cat}><td style={{ textTransform: 'capitalize' }}>{cat}</td><td>{count}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="glass-card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 800 }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{label}</div>
    </div>
  );
}
