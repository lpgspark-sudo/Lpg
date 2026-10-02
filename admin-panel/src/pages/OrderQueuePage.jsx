import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const STATUS_OPTIONS = ['received', 'forwarded', 'out_for_delivery', 'delivered', 'cancelled'];

export default function OrderQueuePage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filterStatus !== 'all') query = query.eq('status', filterStatus);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    // Live updates: new paid orders appear instantly
    const channel = supabase
      .channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe();
    return () => supabase.removeChannel(channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const updateStatus = async (orderId, status) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Order Queue</h2>
        <select className="glass-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="glass-card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Category</th>
                <th>Cylinder</th>
                <th>Qty</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Placed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td style={{ textTransform: 'capitalize' }}>{o.category}</td>
                  <td>{o.cylinder_label}</td>
                  <td>{o.quantity}</td>
                  <td><span className={`badge ${o.payment_status}`}>{o.payment_status}</span></td>
                  <td><span className={`badge ${o.status}`}>{o.status.replace(/_/g, ' ')}</span></td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>
                    <select
                      className="glass-select"
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 20 }}>No orders found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
