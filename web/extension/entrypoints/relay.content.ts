import {
  BRIDGE_CHANNEL,
  errorResponse,
  EVENTS_PORT,
  isBridgeRequest,
  type BridgeEvent,
  type BridgeEventMessage,
  type BridgeResponse,
} from '@musophone/shared/bridge';

/** How long a dropped event port waits before reconnecting, while the page is visible. */
const RECONNECT_MS = 2000;

/**
 * MusoPhone content-script relay.
 * Runs on every trusted MusoPhone web origin (both Chromium and Firefox) at document_start.
 *
 * Responsibilities:
 * 1. Announces extension presence immediately via DOM attribute & window message.
 * 2. Relays window.postMessage ↔ browser.runtime.sendMessage with service worker wake-up resilience.
 * 3. Bridges real-time push events via browser.runtime.connect.
 * 4. Enables cross-browser support (Chrome, Edge, Brave, Firefox) regardless of extension ID.
 */
export default defineContentScript({
  matches: ['http://localhost/*'],
  runAt: 'document_start',
  main() {
    const version = browser.runtime.getManifest().version;
    const extensionId = browser.runtime.id;

    // 1. Announce presence immediately
    const announce = () => {
      try {
        if (typeof document !== 'undefined' && document.documentElement) {
          document.documentElement.dataset.musophoneExtension = version;
          document.documentElement.dataset.musophoneExtensionId = extensionId;
        }
      } catch {
        // Ignore
      }

      window.postMessage(
        {
          channel: BRIDGE_CHANNEL,
          direction: 'announce',
          version,
          id: extensionId,
        },
        location.origin,
      );
    };

    announce();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', announce, { once: true });
    }

    // 2. Relay web page requests to extension runtime
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.source !== window || event.origin !== location.origin) return;
      if (!isBridgeRequest(event.data)) return;
      const request = event.data;

      const sendWithRetry = (attemptsLeft: number): Promise<BridgeResponse> => {
        return browser.runtime.sendMessage(request).catch((err: unknown) => {
          if (attemptsLeft > 0) {
            return new Promise<BridgeResponse>((resolve) =>
              setTimeout(() => resolve(sendWithRetry(attemptsLeft - 1)), 350),
            );
          }
          throw err;
        });
      };

      sendWithRetry(2)
        .then((response: BridgeResponse) => window.postMessage(response, location.origin))
        .catch((error: unknown) =>
          window.postMessage(errorResponse(request.id, 'internal', String(error)), location.origin),
        );
    });

    // 3. Event push port
    let port: Browser.runtime.Port | null = null;
    const connect = () => {
      if (port || document.hidden) return;
      try {
        port = browser.runtime.connect({ name: EVENTS_PORT });
        port.onMessage.addListener((payload: BridgeEvent) => {
          const message: BridgeEventMessage = { channel: BRIDGE_CHANNEL, direction: 'event', payload };
          window.postMessage(message, location.origin);
        });
        port.onDisconnect.addListener(() => {
          port = null;
          setTimeout(connect, RECONNECT_MS);
        });
      } catch {
        port = null;
        setTimeout(connect, RECONNECT_MS);
      }
    };
    document.addEventListener('visibilitychange', connect);
    connect();
  },
});
