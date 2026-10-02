import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors, radius } from '../theme/theme';
import { fetchPrices } from '../services/api';

const CATEGORY_TITLES = {
  domestic: 'Domestic Cylinders',
  commercial: 'Commercial Cylinders',
  industrial: 'Industrial Cylinders',
};

export default function CylinderSelectionScreen({ route, navigation }) {
  const { category } = route.params;
  const [prices, setPrices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPrices(category);
        setPrices(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [category]);

  const handleContinue = () => {
    if (!selected) return;
    const qty = Math.max(1, parseInt(quantity || '1', 10));
    navigation.navigate('OrderSummary', {
      category,
      cylinder: selected,
      quantity: qty,
    });
  };

  return (
    <GlassBackground style={styles.container}>
      <Text style={typography.h1}>{CATEGORY_TITLES[category]}</Text>
      <Text style={typography.caption}>Select size and quantity</Text>

      <ScrollView style={{ marginTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {prices.map((item) => {
          const isSelected = selected?.id === item.id;
          const priceLabel = item.price_on_request
            ? 'Price on request'
            : `₹${item.min_price} – ₹${item.max_price}`;
          return (
            <TouchableOpacity key={item.id} onPress={() => setSelected(item)} activeOpacity={0.85}>
              <GlassCard
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                intensity={isSelected ? 60 : 35}
              >
                <View style={{ flex: 1 }}>
                  <Text style={typography.h2}>{item.label}</Text>
                  <Text style={typography.caption}>{priceLabel} (estimated)</Text>
                </View>
                {isSelected && <Text style={styles.check}>✓</Text>}
              </GlassCard>
            </TouchableOpacity>
          );
        })}

        {!loading && selected && (
          <GlassCard style={{ marginTop: spacing.md }}>
            <Text style={typography.h2}>Quantity</Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="number-pad"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </GlassCard>
        )}
      </ScrollView>

      <GlassButton label="Continue" onPress={handleContinue} disabled={!selected} />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, flex: 1 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionCardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  check: { color: colors.accent, fontSize: 22, fontWeight: '800' },
  qtyInput: {
    color: colors.textLight,
    fontSize: 22,
    borderBottomWidth: 1,
    borderColor: colors.glassBorder,
    marginTop: spacing.sm,
    paddingBottom: 6,
    width: 100,
  },
});
