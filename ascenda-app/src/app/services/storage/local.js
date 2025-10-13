import { buildSeed, schemaVersion } from '../seed.js';

const STORAGE_KEY = 'ascenda-app:dataset';
const SCHEMA_KEY = 'ascenda-app:schema';

export function createLocalAdapter() {
  return {
    async loadDataset() {
      try {
        const schema = window?.localStorage?.getItem(SCHEMA_KEY);
        if (!schema || Number(schema) !== schemaVersion) {
          const seed = buildSeed();
          await this.persistDataset(seed);
          return seed;
        }
        const payload = window?.localStorage?.getItem(STORAGE_KEY);
        if (!payload) {
          const seed = buildSeed();
          await this.persistDataset(seed);
          return seed;
        }
        const data = JSON.parse(payload);
        if (!Object.prototype.hasOwnProperty.call(data, "session")) {
          data.session = null;
        }
        return data;
      } catch (error) {
        const seed = buildSeed();
        return seed;
      }
    },
    async persistDataset(dataset) {
      const payload = { ...dataset };
      if (!Object.prototype.hasOwnProperty.call(payload, 'session')) {
        payload.session = null;
      }
      window?.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
      window?.localStorage?.setItem(SCHEMA_KEY, String(schemaVersion));
    }
  };
}
