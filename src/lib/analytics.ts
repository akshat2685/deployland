// Generic Analytics Abstraction

export type AnalyticsEvent = 
  | 'game_started'
  | 'level_started'
  | 'level_completed'
  | 'level_failed'
  | 'level_replayed'
  | 'engineer_mode_opened'
  | 'level_abandoned'
  | 'account_created'
  | 'paywall_viewed'
  | 'checkout_started'
  | 'purchase_completed';

export interface AnalyticsContext {
  course_id?: string;
  level_id?: string;
  archetype?: string;
  attempt_number?: number;
  time_to_completion?: number;
  [key: string]: any;
}

class AnalyticsManager {
  private initialized = false;

  init() {
    this.initialized = true;
    console.log('[Analytics] Initialized');
  }

  track(event: AnalyticsEvent, context?: AnalyticsContext) {
    if (!this.initialized) return;
    // In production, this would send to PostHog, Mixpanel, etc.
    // without blocking the main thread or causing unhandled exceptions.
    try {
      console.log(`[Analytics] ${event}`, context || {});
    } catch (e) {
      // Never break gameplay due to analytics
    }
  }

  identify(userId: string) {
    if (!this.initialized) return;
    try {
      console.log(`[Analytics] Identified user: ${userId}`);
    } catch (e) {}
  }
}

export const analytics = new AnalyticsManager();
