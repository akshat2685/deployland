// Generic Error Monitoring Abstraction

class ErrorMonitor {
  private initialized = false;

  init() {
    this.initialized = true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(event.reason, { type: 'unhandled_promise' });
      });
      
      window.addEventListener('error', (event) => {
        this.captureException(event.error, { type: 'uncaught_exception' });
      });
    }
    
    console.log('[Monitoring] Initialized');
  }

  captureException(error: any, context?: Record<string, any>) {
    if (!this.initialized) return;
    // In production, this would send to Sentry, Datadog, etc.
    try {
      console.error(`[Monitoring] Exception captured:`, error, context || {});
    } catch (e) {}
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    if (!this.initialized) return;
    try {
      console.log(`[Monitoring] [${level}] ${message}`, context || {});
    } catch (e) {}
  }
}

export const monitoring = new ErrorMonitor();
