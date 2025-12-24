import { useRef } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHIP_SIZE = 120;

const SHIPS = [
  { id: 0, emoji: '🚀', name: 'Scout' },
  { id: 1, emoji: '🛸', name: 'Saucer' },
  { id: 2, emoji: '🛰️', name: 'Satellite' },
  { id: 3, emoji: '🚁', name: 'Chopper' },
  { id: 4, emoji: '✈️', name: 'Jet' },
  { id: 5, emoji: '🎯', name: 'Target' },
  { id: 6, emoji: '⭐', name: 'Star' },
];

export default function Hangar() {
  const { setShipHull, setDestroyed } = useGameStore();
  const selectedHull = useRef(0);

  const handleLaunch = () => {
    setShipHull(selectedHull.current);
    setDestroyed(false);
    router.push('/world');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        selectedHull.current = viewableItems[0].index;
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HANGAR</Text>
      <Text style={styles.subtitle}>Select your ship</Text>

      <View style={styles.selectorContainer}>
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
              <Text style={styles.shipEmoji}>{item.emoji}</Text>
              <Text style={styles.shipName}>{item.name}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.dots}>
        {SHIPS.map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>

      <Pressable style={styles.button} onPress={handleLaunch}>
        <Text style={styles.buttonText}>LAUNCH</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    marginBottom: 40,
  },
  selectorContainer: {
    height: 160,
    width: SCREEN_WIDTH,
  },
  shipItem: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shipEmoji: {
    fontSize: 64,
  },
  shipName: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
    letterSpacing: 2,
  },
  dots: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#444',
  },
  button: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    letterSpacing: 4,
  },
});
