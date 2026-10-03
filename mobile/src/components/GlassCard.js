import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius } from '../theme/theme';

// The core "glassmorphism" building block: a translucent, blurred card
// with a soft light border, used for every panel in the app.
export default function GlassCard({ children, style, intensity = 40 }) {
  // Flatten in case `style` is an array (e.g. [styles.a, condition && styles.b])
  const flatStyle = StyleSheet.flatten(style) || {};
  // Layout props (how children are arranged) must apply to the inner content
  // box, not just the outer blur wrapper, or a flex:1 child inside content
  // collapses to zero height since content's own height is auto/unbounded.
  const { flexDirection, alignItems, justifyContent, ...wrapperOnlyStyle } = flatStyle;
  const contentLayoutStyle = { flexDirection, alignItems, justifyContent };

  return (
    <View style={[styles.wrapper, wrapperOnlyStyle]}>
      <BlurView
        intensity={intensity}
        tint="light"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      <View style={styles.tint} />
      <View style={[styles.content, contentLayoutStyle]}>{children}</View>
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
