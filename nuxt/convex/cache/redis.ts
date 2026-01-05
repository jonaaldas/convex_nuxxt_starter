import { createStorage } from 'unstorage';
import upstashDriver from 'unstorage/drivers/upstash';

const UPSTASH_REDIS_REST_URL = 'https://selected-albacore-13461.upstash.io';
const UPSTASH_REDIS_REST_TOKEN = 'ATSVAAIjcDEyZTA3NTkyYWM0M2E0OTMxOGVhNjcyZGMyMWIyMDU4N3AxMA';
const prefix = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const APP_NAME = 'SAAS_STARTER';
const storage = createStorage({
  driver: upstashDriver({
    base: `${prefix}-${APP_NAME}-`,
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  }),
});

export default storage;
