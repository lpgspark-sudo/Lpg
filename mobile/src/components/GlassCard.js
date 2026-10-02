import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../theme/theme';

// The core "glassmorphism" building block: a translucent, blurred card
// with a soft light border, used for every panel in the app.
export default function GlassCard({ children, style, intensity = 40 }) {
  return (
    <View style={[styles.wrapper, style]}>
      <BlurView
        intensity={intensity}
        tint="light"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View style={styles.tint} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.glassFill,
  },
  content: {
    padding: 18,
  },
});
