import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors } from '../theme/theme';
import { saveProfile } from '../services/api';

// Shown once when the app is opened for the first time on a device.
// No OTP — just captures name + phone so it can be reused for order
// history lookups and pre-filled at checkout.
export default function PhoneEntryScreen({ navigation }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleContinue = async () => {
    if (phone.trim().length !== 10) {
      Alert.alert('Enter a valid 10-digit mobile number');
      return;
    }
    await saveProfile({ phone: `+91${phone.trim()}`, full_name: name.trim() });
    navigation.replace('Home');
  };

  return (
    <GlassBackground style={styles.center}>
      <View style={styles.logoWrap}>
        <Text style={styles.brand}>🔥 LPG</Text>
        <Text style={typography.caption}>Domestic • Commercial • Industrial cylinder booking</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={typography.h2}>Welcome</Text>
        <Text style={typography.caption}>Enter your details to get started — no OTP needed</Text>

        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={[styles.input, { flex: 1, marginTop: 0, borderBottomWidth: 0 }]}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Mobile number"
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <GlassButton label="Continue" onPress={handleContinue} />
      </GlassCard>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', paddingHorizontal: spacing.lg },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { fontSize: 40, fontWeight: '800', color: colors.textLight, marginBottom: 4 },
  card: { width: '100%' },
  input: {
    color: colors.textLight,
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: spacing.md,
    paddingVertical: 8,
    fontSize: 16,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: spacing.md,
  },
  prefix: { color: colors.textLight, fontSize: 16, fontWeight: '600', paddingVertical: 8 },
});
