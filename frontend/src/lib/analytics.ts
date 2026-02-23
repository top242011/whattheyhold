const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CONSENT_KEY = 'analytics_consent';
const BATCH_INTERVAL_MS = 5000;

export type EventType =
    | 'page_view'
    | 'session_start'
    | 'search_query'
    | 'fund_view'
    | 'map_click'
    | 'sector_click'
    | 'compare_funds';

interface AnalyticsEvent {
    type: EventType;
    data: Record<string, any>;
    timestamp: number;
}

class AnalyticsClient {
    private sessionId: string | null = null;
    private eventQueue: AnalyticsEvent[] = [];
    private isClient: boolean = false;
    private batchTimer: NodeJS.Timeout | null = null;
    private isInitializing: boolean = false;

    constructor() {
        this.isClient = typeof window !== 'undefined';
        if (this.isClient) {
            // Check for existing consent but DO NOT auto-initialize. 
            // Initialization happens in AnalyticsProvider or after explicit consent.
        }
    }

    public hasConsent(): boolean {
        if (!this.isClient) return false;
        try {
            return localStorage.getItem(CONSENT_KEY) === 'true';
        } catch {
            return false;
        }
    }

    public setConsent(granted: boolean) {
        if (!this.isClient) return;
        try {
            localStorage.setItem(CONSENT_KEY, granted ? 'true' : 'false');
            if (granted && !this.sessionId && !this.isInitializing) {
                this.initSession();
            } else if (!granted) {
                this.sessionId = null;
                this.eventQueue = [];
                if (this.batchTimer) {
                    clearInterval(this.batchTimer);
                    this.batchTimer = null;
                }
            }
        } catch (e) {
            console.error('Failed to save analytics consent:', e);
        }
    }

    public async initSession() {
        if (!this.isClient || !this.hasConsent() || this.sessionId || this.isInitializing) return;

        this.isInitializing = true;
        try {
            // Generate or retrieve anonymous_id for the device (browser scope)
            let anonymousId = localStorage.getItem('anonymous_id');
            if (!anonymousId) {
                anonymousId = crypto.randomUUID();
                localStorage.setItem('anonymous_id', anonymousId);
            }

            const response = await fetch(`${API_URL}/api/analytics/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    anonymous_id: anonymousId,
                    locale: navigator.language,
                    device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    referrer: document.referrer || null,
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.session_id) {
                    this.sessionId = data.session_id;
                    this.startBatchProcessing();
                    this.trackEvent('session_start', {
                        url: window.location.href,
                        path: window.location.pathname
                    });
                }
            }
        } catch (e) {
            console.error('Failed to init analytics session:', e);
        } finally {
            this.isInitializing = false;
        }
    }

    public trackEvent(type: EventType, data: Record<string, any> = {}) {
        if (!this.isClient || !this.hasConsent()) return;

        this.eventQueue.push({
            type,
            data,
            timestamp: Date.now()
        });

        // If batch processing isn't running and we have a session, send immediately or start batch
        if (!this.batchTimer && this.sessionId) {
            this.startBatchProcessing();
        }
    }

    private startBatchProcessing() {
        if (!this.isClient || this.batchTimer) return;

        this.batchTimer = setInterval(() => {
            this.flushEvents();
        }, BATCH_INTERVAL_MS);

        // Also flush on page hide/unload
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flushEvents();
            }
        });
    }

    private async flushEvents() {
        if (!this.sessionId || this.eventQueue.length === 0 || !this.hasConsent()) return;

        // Take current events and clear queue
        const eventsToSend = [...this.eventQueue];
        this.eventQueue = [];

        // Send each event (future optimization: bulk insert endpoint on backend)
        for (const event of eventsToSend) {
            try {
                // We use keepalive for reliability during page unloads if possible
                fetch(`${API_URL}/api/analytics/event`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: this.sessionId,
                        event_type: event.type,
                        event_data: { ...event.data, timestamp: event.timestamp }
                    }),
                    keepalive: true
                }).catch(() => {
                    // Suppress fetch errors to avoid spamming console
                });
            } catch (e) {
                // Ignore
            }
        }
    }
}

// Singleton instance
export const analytics = new AnalyticsClient();
