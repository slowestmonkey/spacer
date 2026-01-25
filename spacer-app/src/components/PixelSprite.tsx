import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PixelSpriteProps {
  data: number[][];
  palette: string[];
  scale?: number;
}

export const PixelSprite: React.FC<PixelSpriteProps> = ({
  data,
  palette,
  scale = 4
}) => {
  const pixelSize = scale;

  return (
    <View style={styles.container}>
      {data.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.map((colorIndex, x) => (
            <View
              key={`${x}-${y}`}
              style={[
                styles.pixel,
                {
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: colorIndex === 0 ? 'transparent' : palette[colorIndex],
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {},
});
