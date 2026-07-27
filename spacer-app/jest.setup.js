jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/**
 * Reanimated's own mock still pulls in `react-native-worklets`, which needs the
 * native module. The port only uses shared values, one derived value per
 * parallax layer, and the scroll handler, so a plain-JS stand-in covers it.
 */
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { ScrollView, View, Text, Image } = require('react-native');

  return {
    __esModule: true,
    default: { ScrollView, View, Text, Image },
    // Shared values are stable across renders, like the real implementation —
    // screens legitimately list them in effect dependency arrays.
    useSharedValue: (initial) => {
      const ref = React.useRef(null);
      if (ref.current === null) {
        ref.current = { value: initial };
      }
      return ref.current;
    },
    useDerivedValue: (factory) => ({ value: factory() }),
    useAnimatedScrollHandler: () => () => {},
    useAnimatedStyle: (factory) => factory(),
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
  };
});

/**
 * Skia draws to a native canvas, so under jest the scene graph is replaced with
 * inert placeholders. The screens' React Native layer — positions, text and
 * press handlers — is what these tests are about.
 */
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');

  const node = (name) => {
    const Component = ({ children }) => React.createElement(View, null, children);
    Component.displayName = name;
    return Component;
  };

  return {
    Canvas: node('Canvas'),
    Group: node('Group'),
    Image: node('Image'),
    ImageShader: node('ImageShader'),
    Rect: node('Rect'),
    RoundedRect: node('RoundedRect'),
    rect: (x, y, width, height) => ({ x, y, width, height }),
    rrect: (r, rx, ry) => ({ rect: r, rx, ry }),
    useImage: () => null,
    useClock: () => ({ value: 0 }),
    FilterMode: { Nearest: 0, Linear: 1 },
    MipmapMode: { None: 0, Nearest: 1, Linear: 2 },
    TileMode: { Clamp: 0, Repeat: 1, Mirror: 2, Decal: 3 },
  };
});

// React 19 needs this flag for `act()` to be recognised outside a render call;
// the screens finish their `_ready()` chains asynchronously.
global.IS_REACT_ACT_ENVIRONMENT = true;
