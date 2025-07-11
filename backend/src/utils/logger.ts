const isDev = process.env['NODE_ENV'] === 'development';

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`❌ ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`⚠️ ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(`🔍 ${message}`, ...args);
    }
  }
}; 