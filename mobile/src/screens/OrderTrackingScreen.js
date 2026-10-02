import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import { typography, spacing, colors } from '../theme/theme';
import { fetchOrderById } from '../services/api';

const STEPS = [
  { key: 'received', label: 'Order Received' },
  { key: 'forwarded', label: 'Forwarded to Dealer' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const POLL_INTERVAL_MS = 15000;

export default function OrderTrackingScreen({ route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
    } catch (e) {
      // keep showing last known state on a transient error
    }
  }, [orderId]);

  useEffect(() => {
    load();
    // Lightweight polling instead of realtime, since there's no login session
    // to scope a realtime subscription to.
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const currentIndex = order ? STEPS.findIndex((s) => s.key === order.status) : -1;

  return (
    <GlassBackground style={styles.container}>
      <Text style={typography.h1}>Track Order</Text>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        style={{ marginTop: spacing.md }}
      >
        {order && (
          <GlassCard style={{ marginBottom: spacing.md }}>
            <Text style={typography.h2}>{order.order_number}</Text>
            <Text style={typography.caption}>
              {order.cylinder_label} × {order.quantity} ({order.category})
            </Text>
          </GlassCard>
        )}

        <GlassCard>
          {order?.status === 'cancelled' ? (
            <Text style={[typography.body, { color: colors.danger }]}>This order was cancelled.</Text>
          ) : (
            STEPS.map((step, idx) => {
              const done = idx <= currentIndex;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={[styles.dot, done && styles.dotActive]} />
                  <Text style={[typography.body, done && styles.activeText]}>{step.label}</Text>
                </View>
              );
            })
          )}
        </GlassCard>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  dot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.25)', marginRight: 12,
  },
  dotActive: { backgroundColor: colors.success },
  activeText: { fontWeight: '700' },
});
