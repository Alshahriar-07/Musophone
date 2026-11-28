import { handshake, type DetectedExtension, type DetectDiagnostics } from '@musophone/shared/bridge';
import { useQuery } from '@tanstack/react-query';
import { config } from '@/config';
import { queryClient } from '@/lib/queryClient';

/** A handshake result: the extension when one genuinely answered, and why not when none did. */
export interface ExtensionCheck {
  extension: DetectedExtension | null;
  diagnostics: DetectDiagnostics;
}

export type ExtensionStatus =
  | { state: 'checking'; diagnostics: DetectDiagnostics }
  | { state: 'missing'; diagnostics: DetectDiagnostics }
  | { state: 'present'; extension: DetectedExtension; diagnostics: DetectDiagnostics };

export const extensionQueryKey = ['extension', 'detect'] as const;

/** Re-pings after a miss: a sleeping MV3 worker waking on the first message can miss it. */
const RECHECKS = 4;
/** Backs off from 1.5 s to this, so a late install is picked up without hammering the worker. */
const RECHECK_MIN_MS = 1500;
const RECHECK_MAX_MS = 15_000;

/**
 * The cache under `extensionQueryKey` holds only the detected extension, which
 * is what the bridge, the player, history reporting and the auth hooks read.
 * The handshake's diagnostics ride alongside in this module variable (read back
 * by `extensionDiagnostics`) so a miss can explain itself without changing the
 * shape every other caller depends on.
 */
let lastDiagnostics: DetectDiagnostics;

/**
 * One handshake. Both ids are pinged together: the configured one (a store
 * build) and the unpacked build's pinned id, so either install is found.
 *
 * A miss gets a second, more patient handshake — a worker that has just been
 * put to sleep needs longer than 2 s to answer. If that fails too the answer is
 * "not installed", never a cached "connected": the site may only claim the
 * extension when the extension itself answered.
 */
async function detect(): Promise<DetectedExtension | null> {
  const ids = [config.chromiumExtensionId, config.devChromiumExtensionId];
  const first = await handshake({ chromiumExtensionIds: ids });
  lastDiagnostics = first.diagnostics;
  if (first.detected) return first.detected;
  const retry = await handshake({ chromiumExtensionIds: ids, timeoutMs: 4000, attempts: 2 });
  lastDiagnostics = retry.diagnostics;
  return retry.detected;
}

/** Before the first probe lands there is nothing to diagnose yet. */
const IDLE_DIAGNOSTICS: DetectDiagnostics = {
  origin: '',
  secureContext: false,
  runtimeExposed: false,
  browser: 'other',
  ids: [],
  attempts: 0,
  elapsedMs: 0,
  failures: [],
  hint: 'The extension has not been checked yet.',
};
lastDiagnostics = IDLE_DIAGNOSTICS;

/** Re-runs the handshake now (the Extension page's "Check again", and the debug page). */
export function recheckExtension(): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: extensionQueryKey, exact: true });
}

/**
 * Whether the companion extension is installed: a `ping` handshake on
 * startup, then a backoff while it's missing and a fresh probe whenever the tab
 * comes back (an extension updated, reloaded or installed meanwhile reports
 * itself without a page reload).
 */
export function useExtension(): ExtensionStatus {
  const query = useQuery({
    queryKey: extensionQueryKey,
    queryFn: detect,
    staleTime: 30_000,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: true,
    // Also re-probe when the device comes back online: a failed handshake on a
    // flaky connection must not leave the site stuck on "not installed".
    refetchOnReconnect: true,
    refetchInterval: (q) => {
      if (q.state.data) return false;
      const missingFor = q.state.dataUpdateCount;
      if (missingFor > RECHECKS) return RECHECK_MAX_MS;
      return Math.min(RECHECK_MAX_MS, RECHECK_MIN_MS * 2 ** missingFor);
    },
  });
  if (query.isPending) return { state: 'checking', diagnostics: lastDiagnostics };
  if (!query.data) return { state: 'missing', diagnostics: lastDiagnostics };
  return { state: 'present', extension: query.data, diagnostics: lastDiagnostics };
}

/** The last handshake's diagnostics, for the extension and debug pages (no request). */
export function extensionDiagnostics(): DetectDiagnostics | null {
  return lastDiagnostics;
}
