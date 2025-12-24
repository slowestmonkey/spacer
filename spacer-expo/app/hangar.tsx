import { useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { router } from 'expo-router';
import { useGameStore } from '../src/stores/gameStore';
import { SHIPS } from '../src/data/ships';
import Ship from '../src/components/Ship';
import { hapticMedium, hapticSelection } from '../src/utils/haptics';
import { colors, text, components, screenContainer } from '../src/styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Hangar() {
  const setShipHull = useGameStore((s) => s.setShipHull);
  const [currentIndex, setCurrentIndex] = useState(0);
  const selectedHull = useRef(SHIPS[0].id);

  const handleLaunch = () => {
    hapticMedium();
    setShipHull(selectedHull.current);
    router.push('/world');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        const newHull = viewableItems[0].item.id;
        const newIndex = viewableItems[0].index ?? 0;
        if (newHull !== selectedHull.current) {
          hapticSelection();
          selectedHull.current = newHull;
          setCurrentIndex(newIndex);
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>HANGAR</Text>
        <Text style={styles.subtitle}>SELECT YOUR SHIP</Text>
      </View>

      {/* Ship selector */}
      <View style={styles.selectorContainer}>
        {/* Left arrow indicator */}
        <View style={styles.arrowContainer}>
          {currentIndex > 0 && <Text style={styles.arrow}>{'<'}</Text>}
        </View>

        <FlatList
          data={SHIPS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.shipItem}>
              <View style={styles.shipFrame}>
                <Ship hullId={item.id} size={100} showThruster={false} />
              </View>
              <Text style={styles.shipName}>{item.name.toUpperCase()}</Text>
              <Text style={styles.shipId}>ID: {String(item.id).padStart(3, '0')}</Text>
            </View>
          )}
        />

        {/* Right arrow indicator */}
        <View style={styles.arrowContainer}>
          {currentIndex < SHIPS.length - 1 && <Text style={styles.arrow}>{'>'}</Text>}
        </View>
      </View>

      {/* Pagination dots */}
      <View style={styles.dots}>
        {SHIPS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex && styles.dotActive
            ]}
          />
        ))}
      </View>

      {/* Ship counter */}
      <Text style={styles.counter}>
        {String(currentIndex + 1).padStart(2, '0')} / {String(SHIPS.length).padStart(2, '0')}
      </Text>

      {/* Launch button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={handleLaunch}
      >
        <Text style={styles.buttonText}>[ LAUNCH ]</Text>
      </Pressable>

      {/* Bottom nav hint */}
      <View style={styles.navHint}>
        <Text style={styles.hintText}>{'<'} SWIPE {'>'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...screenContainer,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...text.title,
    color: colors.text,
  },
  subtitle: {
    ...text.subtitle,
    marginTop: 8,
  },
  selectorContainer: {
    height: 180,
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowContainer: {
    position: 'absolute',
    zIndex: 10,
    width: 40,
    alignItems: 'center',
  },
  arrow: {
    ...text.pixel,
    fontSize: 24,
    color: colors.textMuted,
  },
  shipItem: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipFrame: {
    borderWidth: 2,
    borderColor: colors.border,
    padding: 20,
    backgroundColor: 'rgba(10, 10, 15, 0.5)',
  },
  shipName: {
    ...text.pixel,
    color: colors.text,
    fontSize: 14,
    marginTop: 16,
    letterSpacing: 3,
  },
  shipId: {
    ...text.label,
    fontSize: 8,
    marginTop: 4,
    color: colors.textMuted,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  dot: {
    ...components.dot,
  },
  dotActive: {
    ...components.dotActive,
  },
  counter: {
    ...text.label,
    fontSize: 10,
    color: colors.textDim,
    marginBottom: 40,
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
  navHint: {
    position: 'absolute',
    bottom: 40,
  },
  hintText: {
    ...text.label,
    fontSize: 8,
    color: colors.textMuted,
    opacity: 0.5,
  },
});
