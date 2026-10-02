import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Linking, Alert } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors } from '../theme/theme';
import { submitComplaint, getSavedProfile } from '../services/api';

const SUPPORT_PHONE = '9884224076';

export default function CustomerCareScreen() {
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSavedProfile().then((profile) => {
      if (profile?.phone) setPhone(profile.phone.replace('+91', ''));
    });
  }, []);

  const callSupport = () => Linking.openURL(`tel:${SUPPORT_PHONE}`);
  const whatsappSupport = () => Linking.openURL(`https://wa.me/91${SUPPORT_PHONE}`);

  const handleSubmit = async () => {
    if (phone.trim().length !== 10) {
      Alert.alert('Enter a valid 10-digit mobile number');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Please describe your issue');
      return;
    }
    setLoading(true);
    try {
      await submitComplaint({ phone: `+91${phone.trim()}`, description: description.trim() });
      setDescription('');
      Alert.alert('Submitted', 'Our team will get back to you shortly.');
    } catch (err) {
      Alert.alert('Could not submit', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassBackground style={styles.container}>
      <Text style={typography.h1}>Customer Care</Text>

      <GlassCard style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <Text style={typography.h2}>Need help right away?</Text>
        <GlassButton label={`Call ${SUPPORT_PHONE}`} onPress={callSupport} />
        <GlassButton label="Chat on WhatsApp" onPress={whatsappSupport} variant="secondary" />
      </GlassCard>

      <GlassCard>
        <Text style={typography.h2}>Report an issue</Text>
        <Text style={typography.caption}>Leak, short delivery, delay, or anything else</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.phoneInput}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="Your mobile number"
            placeholderTextColor="rgba(255,255,255,0.55)"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={4}
          placeholder="Describe your issue..."
          placeholderTextColor="rgba(255,255,255,0.55)"
          value={description}
          onChangeText={setDescription}
        />
        <GlassButton label="Submit" onPress={handleSubmit} loading={loading} />
      </GlassCard>
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
  },
  prefix: { color: colors.textLight, fontSize: 15, fontWeight: '600' },
  phoneInput: { flex: 1, color: colors.textLight, fontSize: 15, paddingVertical: 8 },
  textarea: {
    color: colors.textLight,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    padding: 10,
    marginTop: spacing.sm,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
