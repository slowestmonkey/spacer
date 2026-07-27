import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A port of Godot's `ConfigFile`, backed by AsyncStorage.
 *
 * The game reads and writes a single `user://settings.cfg` with two sections
 * (`ship_data`, `goal_data`), and several call sites branch on the return code
 * of `load()` — `world.gd` sends the player to the start menu when the file is
 * missing, `hangar.gd` creates it on first save. Keeping the same shape means
 * those flows port across unchanged.
 *
 * The file itself is stored as JSON under the `user://` path as its key, so it
 * is opaque to the rest of the app and trivially inspectable in tests.
 */

/** Subset of Godot's `Error` enum that this class can return. */
export const OK = 0;
export const ERR_FILE_CANT_OPEN = 12;
export const ERR_FILE_CORRUPT = 16;

export type ConfigValue = string | number | boolean | null;
export type ConfigData = Record<string, Record<string, ConfigValue>>;

export class ConfigFile {
  private data: ConfigData = {};

  async load(path: string): Promise<number> {
    let raw: string | null;
    try {
      raw = await AsyncStorage.getItem(path);
    } catch {
      return ERR_FILE_CANT_OPEN;
    }

    if (raw === null) {
      return ERR_FILE_CANT_OPEN;
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return ERR_FILE_CORRUPT;
      }
      this.data = parsed as ConfigData;
      return OK;
    } catch {
      return ERR_FILE_CORRUPT;
    }
  }

  async save(path: string): Promise<number> {
    try {
      await AsyncStorage.setItem(path, JSON.stringify(this.data));
      return OK;
    } catch {
      return ERR_FILE_CANT_OPEN;
    }
  }

  getValue<T extends ConfigValue>(section: string, key: string, defaultValue: T): T;
  getValue(section: string, key: string): ConfigValue;
  getValue(section: string, key: string, defaultValue: ConfigValue = null): ConfigValue {
    const values = this.data[section];
    if (!values || !(key in values)) {
      return defaultValue;
    }
    return values[key];
  }

  setValue(section: string, key: string, value: ConfigValue): void {
    if (value === null) {
      // Godot erases the key when the value is null.
      if (this.data[section]) {
        delete this.data[section][key];
        if (Object.keys(this.data[section]).length === 0) {
          delete this.data[section];
        }
      }
      return;
    }

    if (!this.data[section]) {
      this.data[section] = {};
    }
    this.data[section][key] = value;
  }

  hasSection(section: string): boolean {
    return this.data[section] !== undefined;
  }

  hasSectionKey(section: string, key: string): boolean {
    return this.data[section] !== undefined && key in this.data[section];
  }

  getSections(): string[] {
    return Object.keys(this.data);
  }

  clear(): void {
    this.data = {};
  }
}
