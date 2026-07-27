import AsyncStorage from '@react-native-async-storage/async-storage';

import { ConfigFile, ERR_FILE_CANT_OPEN, ERR_FILE_CORRUPT, OK } from './ConfigFile';

const PATH = 'user://settings.cfg';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe('load', () => {
  it('reports a missing file the way Godot does, so callers can branch on it', async () => {
    const config = new ConfigFile();
    expect(await config.load(PATH)).toBe(ERR_FILE_CANT_OPEN);
  });

  it('reads back what a previous save wrote', async () => {
    const writer = new ConfigFile();
    writer.setValue('ship_data', 'ship_hull', 3);
    writer.setValue('ship_data', 'username', 'monkey');
    expect(await writer.save(PATH)).toBe(OK);

    const reader = new ConfigFile();
    expect(await reader.load(PATH)).toBe(OK);
    expect(reader.getValue('ship_data', 'ship_hull', 0)).toBe(3);
    expect(reader.getValue('ship_data', 'username', '')).toBe('monkey');
  });

  it('reports corrupt content instead of throwing', async () => {
    await AsyncStorage.setItem(PATH, 'this is not json');
    const config = new ConfigFile();
    expect(await config.load(PATH)).toBe(ERR_FILE_CORRUPT);
  });

  it('rejects a JSON array, which has no sections', async () => {
    await AsyncStorage.setItem(PATH, '[1, 2, 3]');
    const config = new ConfigFile();
    expect(await config.load(PATH)).toBe(ERR_FILE_CORRUPT);
  });
});

describe('getValue', () => {
  it('falls back to the default for an unknown section or key', () => {
    const config = new ConfigFile();
    expect(config.getValue('goal_data', 'goal', 0)).toBe(0);

    config.setValue('goal_data', 'goal', 120);
    expect(config.getValue('goal_data', 'goal_set_at', '')).toBe('');
  });

  it('returns null when no default is supplied, matching ConfigFile', () => {
    const config = new ConfigFile();
    expect(config.getValue('ship_data', 'ship_hull')).toBeNull();
  });

  it('does not confuse a stored 0 with a missing key', () => {
    const config = new ConfigFile();
    config.setValue('goal_data', 'goal', 0);
    expect(config.getValue('goal_data', 'goal', 999)).toBe(0);
  });
});

describe('setValue', () => {
  it('erases the key when handed null, which is how the ship hull is cleared', async () => {
    const config = new ConfigFile();
    config.setValue('ship_data', 'ship_hull', 4);
    config.setValue('ship_data', 'username', 'monkey');

    config.setValue('ship_data', 'ship_hull', null);

    expect(config.hasSectionKey('ship_data', 'ship_hull')).toBe(false);
    expect(config.getValue('ship_data', 'ship_hull', 0)).toBe(0);
    expect(config.getValue('ship_data', 'username', '')).toBe('monkey');

    await config.save(PATH);
    const reloaded = new ConfigFile();
    await reloaded.load(PATH);
    expect(reloaded.getValue('ship_data', 'ship_hull')).toBeNull();
  });

  it('drops a section once its last key is erased', () => {
    const config = new ConfigFile();
    config.setValue('ship_data', 'ship_hull', 4);
    config.setValue('ship_data', 'ship_hull', null);
    expect(config.hasSection('ship_data')).toBe(false);
  });

  it('erasing an absent key is a no-op', () => {
    const config = new ConfigFile();
    expect(() => config.setValue('ship_data', 'ship_hull', null)).not.toThrow();
    expect(config.getSections()).toEqual([]);
  });
});

describe('save', () => {
  it('reports a write failure instead of throwing', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('disk full'));
    const config = new ConfigFile();
    expect(await config.save(PATH)).toBe(ERR_FILE_CANT_OPEN);
  });
});
