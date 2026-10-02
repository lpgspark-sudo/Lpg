import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import { typography, spacing, colors } from '../theme/theme';

const CATEGORIES = [
  { key: 'domestic', label: 'Domestic', emoji: '🏠', desc: '4kg · 12kg · 14.2kg' },
  { key: 'commercial', label: 'Commercial', emoji: '🍽️', desc: '5 to 47.5 kg' },
  { key: 'industrial', label: 'Industrial', emoji: '🏭', desc: '33kg to bulk tankers' },
];

export default function HomeScreen({ navigation }) {
  return (
    <GlassBackground style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h1}>Book a Cylinder</Text>
        <Text style={typography.caption}>Choose a category to get started</Text>
      </View>

      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.key}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CylinderSelection', { category: cat.key })}
        >
          <GlassCard style={styles.categoryCard}>
            <Text style={styles.emoji}>{cat.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={typography.h2}>{cat.label}</Text>
              <Text style={typography.caption}>{cat.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </GlassCard>
        </TouchableOpacity>
      ))}

      <View style={styles.footerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
          <Text style={styles.footerLink}>Order History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('CustomerCare')}>
          <Text style={styles.footerLink}>Customer Care</Text>
        </TouchableOpacity>
      </View>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  header: { marginBottom: spacing.lg },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 34 },
  chevron: { color: colors.textLight, fontSize: 26 },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  footerLink: { color: colors.textLight, fontWeight: '600', textDecorationLine: 'underline' },
});
