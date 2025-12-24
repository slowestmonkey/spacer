import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useGameStore, stepsToFuel } from '../src/stores/gameStore';
import { colors, text, components, screenContainer } from '../src/styles/theme';
import { hapticMedium } from '../src/utils/haptics';

export default function GameOver() {
  const { goal } = useGameStore();

  const handleRetry = () => {
    hapticMedium();
    router.replace('/hangar');
  };

  return (
    <View style={styles.container}>
      {/* Glitch effect decoration */}
      <View style={styles.glitchDecor}>
        <View style={[styles.glitchLine, { width: 60 }]} />
        <View style={[styles.glitchLine, { width: 40, marginLeft: 20 }]} />
        <View style={[styles.glitchLine, { width: 80 }]} />
      </View>

      {/* Warning indicator */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>! ALERT !</Text>
      </View>

      <Text style={styles.title}>DESTROYED</Text>
      <Text style={styles.subtitle}>SHIP RAN OUT OF FUEL</Text>

      {/* Stats panel */}
      <View style={styles.statsPanel}>
        <View style={styles.statsHeader}>
          <Text style={styles.statsHeaderText}>MISSION REPORT</Text>
        </View>
        <View style={styles.statsContent}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>DAILY GOAL</Text>
            <Text style={styles.statValue}>{stepsToFuel(goal)} FUEL</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>STEPS REQ.</Text>
            <Text style={styles.statValueSmall}>{goal.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>STATUS</Text>
            <Text style={[styles.statValueSmall, { color: colors.danger }]}>FAILED</Text>
          </View>
        </View>
      </View>

      {/* Retry button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={handleRetry}
      >
        <Text style={styles.buttonText}>[ TRY AGAIN ]</Text>
      </Pressable>

      {/* Bottom decoration */}
      <View style={styles.bottomDecor}>
        <View style={styles.decorDot} />
        <View style={styles.decorDot} />
        <View style={styles.decorDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...screenContainer,
    paddingHorizontal: 32,
  },
  glitchDecor: {
    position: 'absolute',
    top: 80,
    left: 20,
    gap: 4,
  },
  glitchLine: {
    height: 2,
    backgroundColor: colors.danger,
    opacity: 0.3,
  },
  warningBox: {
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  warningText: {
    ...text.label,
    fontSize: 10,
    color: colors.danger,
    letterSpacing: 4,
  },
  title: {
    ...text.title,
    fontSize: 36,
    color: colors.danger,
    letterSpacing: 6,
  },
  subtitle: {
    ...text.subtitle,
    marginTop: 8,
    marginBottom: 40,
  },
  statsPanel: {
    width: '100%',
    maxWidth: 280,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bgLight,
    marginBottom: 48,
  },
  statsHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  statsHeaderText: {
    ...text.label,
    fontSize: 10,
    color: colors.danger,
    textAlign: 'center',
  },
  statsContent: {
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  statLabel: {
    ...text.label,
    fontSize: 9,
    color: colors.textDim,
  },
  statValue: {
    ...text.pixel,
    fontSize: 20,
    color: colors.text,
  },
  statValueSmall: {
    ...text.pixel,
    fontSize: 12,
    color: colors.textDim,
  },
  button: {
    ...components.buttonDanger,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    ...text.button,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  decorDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.border,
  },
});
