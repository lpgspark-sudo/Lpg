import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved'];

export default function ComplaintLogPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('complaints')
      .select('*, orders(order_number), customers(phone)')
      .order('created_at', { ascending: false });
    setComplaints(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('complaints').update({ status }).eq('id', id);
    load();
  };

  return (
    <div>
      <h2>Complaints</h2>
      <div className="glass-card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Status</th>
                <th>Raised</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.orders?.order_number || '—'}</td>
                  <td>{c.customers?.phone || '—'}</td>
                  <td style={{ maxWidth: 300 }}>{c.description}</td>
                  <td><span className={`badge ${c.status}`}>{c.status.replace(/_/g, ' ')}</span></td>
                  <td>{new Date(c.created_at).toLocaleString()}</td>
                  <td>
                    <select className="glass-select" value={c.status} onChange={(e) => updateStatus(c.id, e.target.value)}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20 }}>No complaints logged.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
