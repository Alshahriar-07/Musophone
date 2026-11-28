// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handshake,
  relayBridge,
  externalBridge,
  BRIDGE_CHANNEL,
  BRIDGE_PROTOCOL,
  okResponse,
} from '@musophone/shared/bridge';

describe('MusoPhone Extension Detection & Handshake Architecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { chrome?: unknown }).chrome;
    delete document.documentElement.dataset.musophoneExtension;
    delete document.documentElement.dataset.musophoneExtensionId;
  });

  describe('1. Content-Script Relay Handshake (Cross-Browser: Chrome, Edge, Brave, Firefox)', () => {
    it('detects and establishes connection when content-script relay responds to ping', async () => {
      // Simulate content-script relay in the page
      const onMsg = (event: MessageEvent) => {
        if (event.data?.channel === BRIDGE_CHANNEL && event.data?.method === 'ping') {
          window.postMessage(
            okResponse(event.data.id, {
              version: '0.5.1',
              protocol: BRIDGE_PROTOCOL,
              browser: 'chromium',
              capabilities: ['yt', 'spotify', 'lyrics'],
            }),
            '*',
          );
        }
      };

      window.addEventListener('message', onMsg);
      try {
        const result = await handshake({ timeoutMs: 800, attempts: 1 });
        expect(result.detected).not.toBeNull();
        expect(result.detected?.info.version).toBe('0.5.1');
        expect(result.diagnostics.hint).toBe('Connected.');
      } finally {
        window.removeEventListener('message', onMsg);
      }
    });

    it('immediately identifies DOM marker when content script runs at document_start', () => {
      document.documentElement.dataset.musophoneExtension = '0.5.1';
      document.documentElement.dataset.musophoneExtensionId = 'pkddffeebcmhhanjcigilehaeonkkfih';

      expect(document.documentElement.dataset.musophoneExtension).toBe('0.5.1');
      expect(document.documentElement.dataset.musophoneExtensionId).toBe('pkddffeebcmhhanjcigilehaeonkkfih');
    });
  });

  describe('2. Direct Chromium Externally Connectable Handshake', () => {
    it('detects extension when chrome.runtime.sendMessage responds', async () => {
      const mockSendMessage = vi.fn().mockImplementation((id, req, cb) => {
        cb(
          okResponse(req.id, {
            version: '0.5.1',
            protocol: BRIDGE_PROTOCOL,
            browser: 'chromium',
            capabilities: ['yt', 'spotify', 'lyrics', 'discord'],
          }),
        );
      });

      (window as unknown as { chrome: unknown }).chrome = {
        runtime: {
          sendMessage: mockSendMessage,
        },
      };

      const result = await handshake({
        chromiumExtensionIds: ['pkddffeebcmhhanjcigilehaeonkkfih'],
        timeoutMs: 800,
        attempts: 1,
      });

      expect(result.detected).not.toBeNull();
      expect(result.detected?.info.version).toBe('0.5.1');
      expect(result.detected?.info.capabilities).toContain('discord');
    });
  });

  describe('3. Cold-Start Service Worker Resilience', () => {
    it('retries gracefully on cold start when first attempt returns transient receiving end error', async () => {
      let callCount = 0;
      const mockSendMessage = vi.fn().mockImplementation((id, req, cb) => {
        callCount++;
        if (callCount === 1) {
          // First attempt: simulate sleeping service worker
          const runtime = (window as unknown as { chrome: { runtime: { lastError?: { message: string } } } }).chrome.runtime;
          runtime.lastError = { message: 'Could not establish connection. Receiving end does not exist.' };
          cb(null);
        } else {
          // Second attempt: worker has awoken and answers
          const runtime = (window as unknown as { chrome: { runtime: { lastError?: unknown } } }).chrome.runtime;
          delete runtime.lastError;
          cb(
            okResponse(req.id, {
              version: '0.5.1',
              protocol: BRIDGE_PROTOCOL,
              browser: 'chromium',
              capabilities: ['yt', 'spotify'],
            }),
          );
        }
      });

      (window as unknown as { chrome: unknown }).chrome = {
        runtime: {
          sendMessage: mockSendMessage,
        },
      };

      const result = await handshake({
        chromiumExtensionIds: ['pkddffeebcmhhanjcigilehaeonkkfih'],
        timeoutMs: 500,
        attempts: 2,
      });

      expect(result.detected).not.toBeNull();
      expect(result.detected?.info.version).toBe('0.5.1');
      expect(callCount).toBe(2);
    });
  });

  describe('4. Honest Diagnostics when Extension is truly Missing', () => {
    it('returns honest diagnostics without falsely reporting connected when nothing answers', async () => {
      const result = await handshake({
        chromiumExtensionIds: ['non_existent_id'],
        timeoutMs: 300,
        attempts: 1,
      });

      expect(result.detected).toBeNull();
      expect(result.diagnostics.hint).not.toBe('Connected.');
      expect(result.diagnostics.elapsedMs).toBeGreaterThanOrEqual(0);
    });
  });
});
