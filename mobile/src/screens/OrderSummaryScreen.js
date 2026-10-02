import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import * as Location from 'expo-location';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors } from '../theme/theme';
import { createOrderWithPayment, getSavedProfile, saveProfile } from '../services/api';

const ADVANCE_AMOUNT = 50;

export default function OrderSummaryScreen({ route, navigation }) {
  const { category, cylinder, quantity } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [pincode, setPincode] = useState('');
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pre-fill from a previous order on this device, if any
  useEffect(() => {
    getSavedProfile().then((profile) => {
      if (profile) {
        setName(profile.full_name || '');
        setPhone(profile.phone ? profile.phone.replace('+91', '') : '');
      }
    });
  }, []);

  const useCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location permission denied', 'You can still enter your address manually.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setCoords(loc.coords);
    const [place] = await Location.reverseGeocodeAsync(loc.coords);
    if (place) {
      const line = [place.name, place.street, place.city, place.region].filter(Boolean).join(', ');
      setAddressLine(line);
      setPincode(place.postalCode || '');
    }
  };

  const handlePayAndBook = async () => {
    if (phone.trim().length !== 10) {
      Alert.alert('Enter a valid 10-digit mobile number');
      return;
    }
    if (!addressLine.trim()) {
      Alert.alert('Please enter a delivery address');
      return;
    }

    setLoading(true);
    const e164Phone = `+91${phone.trim()}`;
    try {
      const orderInit = await createOrderWithPayment({
        phone: e164Phone,
        full_name: name.trim() || null,
        category,
        cylinder_label: cylinder.label,
        quantity,
        address_line: addressLine.trim(),
        pincode: pincode.trim(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });

      await saveProfile({ phone: e164Phone, full_name: name.trim() });

      const options = {
        description: `LPG booking advance - ${cylinder.label}`,
        currency: orderInit.currency,
        key: orderInit.key_id,
        amount: orderInit.amount,
        order_id: orderInit.razorpay_order_id,
        name: 'LPG',
        prefill: { contact: phone.trim(), name: name.trim() },
        theme: { color: '#0B3D91' },
      };

      RazorpayCheckout.open(options)
        .then(() => {
          navigation.replace('OrderConfirmation', { orderId: orderInit.order_id });
        })
        .catch((err) => {
          Alert.alert('Payment cancelled or failed', err.description || 'Please try again');
        });
    } catch (err) {
      Alert.alert('Could not create order', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground style={styles.container}>
      <Text style={typography.h1}>Order Summary</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: spacing.md }}>
        <GlassCard style={{ marginBottom: spacing.md }}>
          <Text style={typography.h2}>{cylinder.label} — {category}</Text>
          <Text style={typography.caption}>Quantity: {quantity}</Text>
          <Text style={typography.caption}>
            Estimated cylinder cost: {cylinder.price_on_request
              ? 'On request'
              : `₹${cylinder.min_price} – ₹${cylinder.max_price} (payable to dealer on delivery)`}
          </Text>
        </GlassCard>

        <GlassCard style={{ marginBottom: spacing.md }}>
          <Text style={typography.h2}>Your Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name (optional)"
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={name}
            onChangeText={setName}
          />
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={[styles.input, { flex: 1, marginTop: 0, borderBottomWidth: 0 }]}
              placeholder="Mobile number"
              placeholderTextColor="rgba(255,255,255,0.55)"
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <Text style={typography.caption}>Used for order updates and delivery contact — no OTP needed</Text>
        </GlassCard>

        <GlassCard style={{ marginBottom: spacing.md }}>
          <Text style={typography.h2}>Delivery Address</Text>
          <TextInput
            style={styles.input}
            placeholder="House no, street, area, city"
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={addressLine}
            onChangeText={setAddressLine}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor="rgba(255,255,255,0.55)"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />
          <GlassButton label="Use current location" onPress={useCurrentLocation} variant="secondary" />
        </GlassCard>

        <GlassCard>
          <View style={styles.rowBetween}>
            <Text style={typography.body}>Booking / service charge</Text>
            <Text style={styles.amount}>₹{ADVANCE_AMOUNT}</Text>
          </View>
          <Text style={typography.caption}>
            Non-refundable advance paid now via Razorpay. Remaining cylinder cost is paid to the
            dealer on delivery (cash/UPI).
          </Text>
        </GlassCard>
      </ScrollView>

      <GlassButton label={`Pay ₹${ADVANCE_AMOUNT} & Book`} onPress={handlePayAndBook} loading={loading} />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
  input: {
    color: colors.textLight,
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 8,
    marginTop: spacing.sm,
    fontSize: 15,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: spacing.sm,
  },
  prefix: { color: colors.textLight, fontSize: 15, fontWeight: '600', paddingVertical: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  amount: { color: colors.accent, fontSize: 18, fontWeight: '700' },
});
