import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { typography, spacing, colors } from '../theme/theme';
import { fetchPrices } from '../services/api';

const CATEGORY_TITLES = {
  domestic: 'Domestic Cylinders',
  commercial: 'Commercial Cylinders',
  industrial: 'Industrial Cylinders',
};

const CUSTOM_ID = '__custom__';

export default function CylinderSelectionScreen({ route, navigation }) {
  const { category } = route.params;
  const [prices, setPrices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [customWeight, setCustomWeight] = useState('');
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

  const isCustomSelected = selected?.id === CUSTOM_ID;

  const selectCustom = () => {
    setSelected({ id: CUSTOM_ID, label: '', price_on_request: true, custom: true });
  };

  const handleContinue = () => {
    if (!selected) return;
    if (isCustomSelected && !customWeight.trim()) return;

    const qty = Math.max(1, parseInt(quantity || '1', 10));
    const cylinder = isCustomSelected
      ? { ...selected, label: `${customWeight.trim()} kg (custom)` }
      : selected;

    navigation.navigate('OrderSummary', {
      category,
      cylinder,
      quantity: qty,
    });
  };

  const canContinue = selected && (!isCustomSelected || customWeight.trim().length > 0);

  return (
    <GlassBackground style={styles.container}>
      <Text style={typography.h1}>{CATEGORY_TITLES[category]}</Text>
      <Text style={typography.caption}>Select a size, or enter your own weight below</Text>

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

        {/* Manual / custom weight entry — for sizes not in the preset list */}
        <TouchableOpacity onPress={selectCustom} activeOpacity={0.85}>
          <GlassCard
            style={[styles.optionCard, isCustomSelected && styles.optionCardSelected]}
            intensity={isCustomSelected ? 60 : 35}
          >
            <View style={{ flex: 1 }}>
              <Text style={typography.h2}>Other / Custom weight</Text>
              <Text style={typography.caption}>Enter an exact kg value not listed above</Text>
            </View>
            {isCustomSelected && <Text style={styles.check}>✓</Text>}
          </GlassCard>
        </TouchableOpacity>

        {isCustomSelected && (
          <GlassCard style={{ marginTop: spacing.sm }}>
            <Text style={typography.h2}>Custom Weight (kg)</Text>
            <TextInput
              style={styles.qtyInput}
              keyboardType="decimal-pad"
              value={customWeight}
              onChangeText={setCustomWeight}
              placeholder="e.g. 25"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <Text style={typography.caption}>Price confirmed by customer care on call</Text>
          </GlassCard>
        )}

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

      <GlassButton label="Continue" onPress={handleContinue} disabled={!canContinue} />
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
    width: 140,
  },
});
