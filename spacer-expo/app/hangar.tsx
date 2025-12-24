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
import { SHIPS } from '../src/data/ships';
import Ship from '../src/components/Ship';
import { hapticMedium, hapticSelection } from '../src/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Hangar() {
  const { setShipHull, setDestroyed } = useGameStore();
  const selectedHull = useRef(SHIPS[0].id);

  const handleLaunch = () => {
    hapticMedium();
    setShipHull(selectedHull.current);
    setDestroyed(false);
    router.push('/world');
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        const newHull = viewableItems[0].item.id;
        if (newHull !== selectedHull.current) {
          hapticSelection();
          selectedHull.current = newHull;
        }
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
              <Ship hullId={item.id} size={100} showThruster={false} />
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
  shipName: {
    color: '#666',
    fontSize: 14,
    marginTop: 16,
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
