import Redis from 'ioredis';

class Cache {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      keyPrefix: 'cache:',
    });
  }

  set(key, value) {
    return this.redis.set(key, JSON.stringify(value), 'EX', 60 * 60 * 24);
  }

  async get(key) {
    const cached = await this.redis.get(key);

    return cached ? JSON.parse(cached) : null;
  }

  invalidade(key) {
    return this.redis.del(key);
  }

  async invalidadePrefix(prefix) {
    const keys = await this.redis.keys(`cache:${prefix}:*`);

    if (keys.length !== 0) {
      const keysWithoutPrefix = keys.map(key => key.replace('cache:', ''));

      return this.redis.del(keysWithoutPrefix);
    }
    return null;
  }
}

export default new Cache();
