import { ImageSourcePropType } from 'react-native';

export interface ShipData {
  id: number;
  name: string;
  image: ImageSourcePropType;
}

export const SHIPS: ShipData[] = [
  { id: 1, name: 'Falcon', image: require('../../assets/ships/ship_1.png') },
  { id: 2, name: 'Viper', image: require('../../assets/ships/ship_2.png') },
  { id: 3, name: 'Phantom', image: require('../../assets/ships/ship_3.png') },
  { id: 4, name: 'Dart', image: require('../../assets/ships/ship_4.png') },
  { id: 5, name: 'Striker', image: require('../../assets/ships/ship_5.png') },
  { id: 6, name: 'Nova', image: require('../../assets/ships/ship_6.png') },
];

export const getShipById = (id: number): ShipData | undefined => {
  return SHIPS.find((ship) => ship.id === id);
};
