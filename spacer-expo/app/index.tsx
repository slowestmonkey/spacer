import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, text, components, screenContainer } from '../src/styles/theme';
import { hapticMedium } from '../src/utils/haptics';

export default function StartMenu() {
  const handleStart = () => {
    hapticMedium();
    router.push('/hangar');
  };

  return (
    <View style={styles.container}>
      {/* Decorative top border */}
      <View style={styles.decorTop}>
        <View style={styles.decorLine} />
        <View style={styles.decorDot} />
        <View style={styles.decorLine} />
      </View>

      <Text style={styles.title}>SPACER</Text>
      <Text style={styles.subtitle}>WALK TO SURVIVE</Text>

      {/* Version badge */}
      <View style={styles.versionBadge}>
        <Text style={styles.versionText}>v1.0</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={handleStart}
      >
        <Text style={styles.buttonText}>[ START ]</Text>
      </Pressable>

      {/* Decorative bottom */}
      <View style={styles.decorBottom}>
        <Text style={styles.hint}>TAP TO BEGIN</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...screenContainer,
    paddingHorizontal: 40,
  },
  decorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  decorLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
  },
  decorDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.primary,
  },
  title: {
    ...text.titleLarge,
    fontSize: 56,
    color: colors.text,
    letterSpacing: 12,
  },
  subtitle: {
    ...text.subtitle,
    marginTop: 12,
    marginBottom: 80,
    color: colors.textDim,
  },
  versionBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  versionText: {
    ...text.label,
    fontSize: 8,
    color: colors.textMuted,
  },
  button: {
    ...components.button,
    minWidth: 180,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    ...text.button,
  },
  decorBottom: {
    position: 'absolute',
    bottom: 60,
  },
  hint: {
    ...text.label,
    fontSize: 8,
    color: colors.textMuted,
    opacity: 0.5,
  },
});
