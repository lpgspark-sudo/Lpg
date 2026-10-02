import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors } from '../theme/theme';
import { fetchOrderHistory, getSavedProfile } from '../services/api';

const STATUS_COLOR = {
  pending_payment: colors.warning,
  received: colors.warning,
  forwarded: colors.warning,
  out_for_delivery: colors.accent,
  delivered: colors.success,
  cancelled: colors.danger,
};

export default function OrderHistoryScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSavedProfile().then((profile) => {
      if (profile?.phone) {
        const digitsOnly = profile.phone.replace('+91', '');
        setPhone(digitsOnly);
        handleSearch(digitsOnly);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (value) => {
    const num = (value ?? phone).trim();
    if (num.length !== 10) {
      Alert.alert('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const data = await fetchOrderHistory(`+91${num}`);
      setOrders(data);
    } catch (err) {
      Alert.alert('Could not fetch orders', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground style={styles.container}>
      <Text style={typography.h1}>Order History</Text>

      <GlassCard style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
        <Text style={typography.caption}>Enter the mobile number used for booking</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Mobile number"
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <GlassButton label="Search" onPress={() => handleSearch()} loading={loading} />
      </GlassCard>

      <FlatList
        data={orders || []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          orders !== null && <Text style={typography.caption}>No orders found for this number.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}>
            <GlassCard style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={typography.h2}>{item.order_number}</Text>
                <Text style={typography.caption}>
                  {item.cylinder_label} × {item.quantity} · {item.category}
                </Text>
              </View>
              <Text style={[styles.status, { color: STATUS_COLOR[item.status] || colors.textMuted }]}>
                {item.status.replace(/_/g, ' ')}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        )}
      />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  prefix: { color: colors.textLight, fontSize: 16, marginRight: 8, fontWeight: '600' },
  input: { flex: 1, color: colors.textLight, fontSize: 16, paddingVertical: 8 },
  card: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  status: { fontWeight: '700', textTransform: 'capitalize', fontSize: 12 },
});
