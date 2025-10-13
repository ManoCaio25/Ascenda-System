import Dexie from 'dexie';
import { buildSeed, schemaVersion } from '../seed.js';

class IndexedDbAdapter {
  constructor() {
    this.db = new Dexie('ascenda-app');
    this.db.version(1).stores({
      meta: '&key',
      users: '&email,slug,role',
      quizLibrary: '&id',
      quizAssignments: '&id,slug,quizId,status',
      activities: '&id,slug,status',
      videos: '&id,slug',
      videoProgress: '&id,slug,videoId',
      vacationRequests: '&id,slug,status',
      forumTopics: '&id',
      notifications: '++id'
    });
  }

  async initialize() {
    await this.db.open();
    const schema = await this.db.table('meta').get('__schemaVersion');
    if (!schema || schema.value !== schemaVersion) {
      await this.seed();
    }
  }

  async seed() {
    const seed = buildSeed();
    await this.db.transaction('rw', this.db.tables, async () => {
      await Promise.all(this.db.tables.map((table) => table.clear()));
      await this.db.table('meta').put({ key: '__schemaVersion', value: schemaVersion });
      await this.db.table('meta').put({ key: 'session', value: seed.session });
      await this.db.table('users').bulkPut(seed.users);
      await this.db.table('quizLibrary').bulkPut(seed.quizLibrary);
      await this.db.table('quizAssignments').bulkPut(seed.quizAssignments);
      await this.db.table('activities').bulkPut(seed.activities);
      await this.db.table('videos').bulkPut(seed.videos);
      await this.db.table('videoProgress').bulkPut(seed.videoProgress);
      await this.db.table('vacationRequests').bulkPut(seed.vacationRequests);
      await this.db.table('forumTopics').bulkPut(seed.forumTopics);
      await this.db.table('notifications').bulkPut(seed.notifications);
    });
  }

  async loadDataset() {
    const [
      users,
      quizLibrary,
      quizAssignments,
      activities,
      videos,
      videoProgress,
      vacationRequests,
      forumTopics,
      sessionRow
    ] = await Promise.all([
      this.db.table('users').toArray(),
      this.db.table('quizLibrary').toArray(),
      this.db.table('quizAssignments').toArray(),
      this.db.table('activities').toArray(),
      this.db.table('videos').toArray(),
      this.db.table('videoProgress').toArray(),
      this.db.table('vacationRequests').toArray(),
      this.db.table('forumTopics').toArray(),
      this.db.table('meta').get('session')
    ]);

    return {
      users,
      quizLibrary,
      quizAssignments,
      activities,
      videos,
      videoProgress,
      vacationRequests,
      forumTopics,
      notifications: [],
      session: sessionRow?.value ?? null
    };
  }

  async persistDataset(dataset) {
    await this.db.transaction('rw', this.db.tables, async () => {
      await this.db.table('users').clear();
      await this.db.table('users').bulkPut(dataset.users);
      await this.db.table('quizLibrary').clear();
      await this.db.table('quizLibrary').bulkPut(dataset.quizLibrary);
      await this.db.table('quizAssignments').clear();
      await this.db.table('quizAssignments').bulkPut(dataset.quizAssignments);
      await this.db.table('activities').clear();
      await this.db.table('activities').bulkPut(dataset.activities);
      await this.db.table('videos').clear();
      await this.db.table('videos').bulkPut(dataset.videos);
      await this.db.table('videoProgress').clear();
      await this.db.table('videoProgress').bulkPut(dataset.videoProgress);
      await this.db.table('vacationRequests').clear();
      await this.db.table('vacationRequests').bulkPut(dataset.vacationRequests);
      await this.db.table('forumTopics').clear();
      await this.db.table('forumTopics').bulkPut(dataset.forumTopics);
      await this.db.table('meta').put({ key: 'session', value: dataset.session ?? null });
    });
  }
}

export async function createIndexedDbAdapter() {
  const adapter = new IndexedDbAdapter();
  await adapter.initialize();
  return adapter;
}
