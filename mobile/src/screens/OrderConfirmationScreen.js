import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors } from '../theme/theme';
import { fetchOrderById } from '../services/api';

export default function OrderConfirmationScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrderById(orderId).then(setOrder).catch(() => {});
  }, [orderId]);

  return (
    <GlassBackground style={styles.center}>
      <GlassCard style={styles.card}>
        <Text style={styles.tick}>✅</Text>
        <Text style={typography.h1}>Booking Confirmed</Text>
        {order && (
          <>
            <Text style={typography.caption}>Order ID</Text>
            <Text style={styles.orderNo}>{order.order_number}</Text>
            <Text style={typography.body}>
              {order.cylinder_label} × {order.quantity} ({order.category})
            </Text>
            <Text style={typography.caption}>
              ₹{order.advance_amount} advance paid. Remaining amount payable to dealer on delivery.
            </Text>
          </>
        )}
        <GlassButton
          label="Track Order"
          onPress={() => navigation.replace('OrderTracking', { orderId })}
        />
        <GlassButton
          label="Back to Home"
          variant="secondary"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        />
      </GlassCard>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', paddingHorizontal: spacing.lg },
  card: { alignItems: 'center' },
  tick: { fontSize: 50, marginBottom: 8 },
  orderNo: { color: colors.accent, fontSize: 20, fontWeight: '700', marginVertical: 6 },
});
