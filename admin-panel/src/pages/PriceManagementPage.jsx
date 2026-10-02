import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function PriceManagementPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const loadPrices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cylinder_prices')
      .select('*')
      .order('category')
      .order('min_price', { ascending: true, nullsFirst: false });
    setPrices(data || []);
    setLoading(false);
  };

  useEffect(() => { loadPrices(); }, []);

  const handleChange = (id, field, value) => {
    setPrices((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const saveRow = async (row) => {
    setSavingId(row.id);
    await supabase
      .from('cylinder_prices')
      .update({
        min_price: row.price_on_request ? null : row.min_price,
        max_price: row.price_on_request ? null : row.max_price,
        price_on_request: row.price_on_request,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    setSavingId(null);
  };

  const grouped = prices.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div>
      <h2>Price Management</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
        Update these monthly to reflect the latest OMC/dealer rates. Changes reflect in the customer app immediately — no app update needed.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="glass-card">
            <h3 style={{ textTransform: 'capitalize', marginTop: 0 }}>{category}</h3>
            <table>
              <thead>
                <tr>
                  <th>Cylinder</th>
                  <th>Min Price (₹)</th>
                  <th>Max Price (₹)</th>
                  <th>Price on Request</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    <td>{row.label}</td>
                    <td>
                      <input
                        className="glass-input"
                        type="number"
                        disabled={row.price_on_request}
                        value={row.min_price ?? ''}
                        onChange={(e) => handleChange(row.id, 'min_price', e.target.value)}
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>
                      <input
                        className="glass-input"
                        type="number"
                        disabled={row.price_on_request}
                        value={row.max_price ?? ''}
                        onChange={(e) => handleChange(row.id, 'max_price', e.target.value)}
                        style={{ width: 90 }}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={row.price_on_request}
                        onChange={(e) => handleChange(row.id, 'price_on_request', e.target.checked)}
                      />
                    </td>
                    <td>
                      <button className="glass-button" onClick={() => saveRow(row)} disabled={savingId === row.id}>
                        {savingId === row.id ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
