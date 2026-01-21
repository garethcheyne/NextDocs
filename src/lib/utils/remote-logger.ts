// Remote logger for client-side logging to server (useful for mobile debugging)
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class RemoteLogger {
  private source: string;
  private enabled: boolean;

  constructor(source: string = 'APP') {
    this.source = source;
    this.enabled = typeof window !== 'undefined';
  }

  private async sendLog(level: LogLevel, message: string, data?: any) {
    if (!this.enabled) return;

    try {
      // Don't await - fire and forget to avoid blocking
      fetch('/api/debug/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data, source: this.source }),
      }).catch(() => {}); // Silently fail if server unavailable
    } catch (error) {
      // Silently fail
    }
  }

  debug(message: string, data?: any) {
    console.log(`[${this.source}]`, message, data);
    this.sendLog('debug', message, data);
  }

  info(message: string, data?: any) {
    console.info(`[${this.source}]`, message, data);
    this.sendLog('info', message, data);
  }

  warn(message: string, data?: any) {
    console.warn(`[${this.source}]`, message, data);
    this.sendLog('warn', message, data);
  }

  error(message: string, data?: any) {
    console.error(`[${this.source}]`, message, data);
    this.sendLog('error', message, data);
  }
}

export default RemoteLogger;
