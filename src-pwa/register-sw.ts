import { register } from 'register-service-worker';

// No forced reload or install prompts: keep the current practice uninterrupted.
register(import.meta.env.QUASAR_SERVICE_WORKER_FILE);
