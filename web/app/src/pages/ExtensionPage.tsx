import { Check, ChevronRight, RefreshCw } from 'lucide-react';
import { useState, type ComponentType } from 'react';
import { FaChrome, FaFirefoxBrowser } from 'react-icons/fa';
import { SiDiscord, SiSpotify, SiYoutubemusic } from 'react-icons/si';
import type { Capability } from '@musophone/shared/bridge';
import { LogoMark } from '@/components/icons/LogoMark';
import { PageHeader } from '@/components/PageHeader';
import { config } from '@/config';
import { recheckExtension, useExtension, type ExtensionStatus } from '@/extension/useExtension';
import { downloadUrl, useExtensionUpdate, usePublishedExtension, type PublishedExtension } from '@/extension/useExtensionUpdate';
import { useYtAuth, type YtAuthStatus } from '@/extension/useYtAuth';
import { PrefetchLink } from '@/components/PrefetchLink';
import { DiscordIntegration, SpotifyIntegration } from './IntegrationSettings';
import { settingsUi } from './settingsStyles';

type Browser = 'chrome' | 'firefox';

interface Download {
  browser: Browser;
  title: string;
  detail: string;
  href: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  steps: string[];
  updateSteps: string[];
}

/**
 * Downloads configured for Chrome/Chromium and Firefox with clear instructions.
 */
function downloadsFor(published: PublishedExtension | null): Download[] {
  const folder = (browser: Browser) => `musophone-extension-${browser}${published ? ` (${published.version})` : ''}`;
  return [
    {
      browser: 'chrome',
      title: 'Download for Chromium',
      detail: 'Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi',
      href: published ? downloadUrl(published.files.chrome) : config.extensionChromeUrl,
      Icon: FaChrome,
      steps: [
        `Extract the downloaded ZIP. It contains the extension folder: ${folder('chrome')}.`,
        'Open your browser extensions manager (e.g. chrome://extensions or edge://extensions) and enable "Developer mode".',
        'Click "Load unpacked" and select the extracted folder.',
        'Return to MusoPhone: the connection status immediately detects the extension via content script or direct messaging.',
      ],
      updateSteps: [
        `Extract the new ZIP archive containing ${folder('chrome')}.`,
        'In your extensions page, click "Load unpacked" and select the new folder (or click the reload icon on the existing extension).',
        'Delete the old folder, then return to this page: the active version updates automatically.',
      ],
    },
    {
      browser: 'firefox',
      title: 'Download for Firefox',
      detail: 'Firefox 128 or newer (Temporary Add-on)',
      href: published ? downloadUrl(published.files.firefox) : config.extensionFirefoxUrl,
      Icon: FaFirefoxBrowser,
      steps: [
        `Extract the ZIP archive. It contains ${folder('firefox')}.`,
        'Open about:debugging#/runtime/this-firefox in Firefox and click "Load Temporary Add-on".',
        'Select the manifest.json file inside the extracted folder.',
        'Return to MusoPhone: the status updates to Connected.',
      ],
      updateSteps: [
        `Extract the new ZIP archive containing ${folder('firefox')}.`,
        'In about:debugging, click "Load Temporary Add-on" and select the new manifest.json.',
        'Return to this page: the updated version will be detected.',
      ],
    },
  ];
}

const currentBrowser: Browser = typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent) ? 'firefox' : 'chrome';

interface Integration {
  name: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  capability: Capability;
  ready: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'YouTube Music', Icon: SiYoutubemusic, color: '#ff0033', capability: 'yt', ready: 'Playback ready · not signed in' },
  { name: 'Spotify', Icon: SiSpotify, color: '#1ed760', capability: 'spotify', ready: 'Not connected' },
  { name: 'Discord', Icon: SiDiscord, color: '#5865f2', capability: 'discord', ready: 'Off' },
];

function youtubeStatus(auth: YtAuthStatus): string | null {
  if (auth.state !== 'ready') return null;
  const { browserSignedIn, connected, active } = auth.auth;
  if (!browserSignedIn) return 'Playback ready · not signed in';
  if (!connected) return 'Disconnected';
  return active ? `Signed in as ${active.name}` : 'Signed in · no account read';
}

/**
 * Spotify-inspired Connection Status Card with real-time handshake diagnostics.
 */
function ConnectionCard({ status }: { status: ExtensionStatus }) {
  const [checking, setChecking] = useState(false);
  const diagnostics = status.diagnostics;
  const connected = status.state === 'present';

  const check = () => {
    setChecking(true);
    void recheckExtension().finally(() => setChecking(false));
  };

  return (
    <aside className="rounded-[8px] bg-[#181818] border border-white/[0.06] p-5 lg:sticky lg:top-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-bold text-white tracking-tight">Connection Status</h2>
        <span
          className={`inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-semibold border ${
            connected
              ? 'bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20'
              : status.state === 'checking'
                ? 'bg-[#e5a00d]/10 text-[#e5a00d] border-[#e5a00d]/20 animate-pulse'
                : 'bg-white/[0.04] text-[#a4a4a4] border-white/[0.06]'
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              connected ? 'bg-[#1ed760]' : status.state === 'checking' ? 'bg-[#e5a00d]' : 'bg-[#727272]'
            }`}
            aria-hidden="true"
          />
          {connected ? 'Connected' : status.state === 'checking' ? 'Checking…' : 'Not detected'}
        </span>
      </div>

      <dl className="mt-4 flex flex-col gap-2 divide-y divide-white/[0.04]">
        <div className="flex items-baseline justify-between gap-3 pt-2">
          <dt className="text-[12px] text-[#727272]">Website Host</dt>
          <dd className="min-w-0 truncate text-right text-[12px] text-[#b3b3b3] font-mono" title={diagnostics.origin || undefined}>
            {diagnostics.origin || 'unknown'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-2">
          <dt className="text-[12px] text-[#727272]">Browser Family</dt>
          <dd className="text-[12px] text-[#b3b3b3]">
            {diagnostics.browser === 'chromium' ? 'Chromium (Chrome, Edge, Brave)' : diagnostics.browser === 'firefox' ? 'Firefox' : 'Other'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-2">
          <dt className="text-[12px] text-[#727272]">Extension Runtime</dt>
          <dd className="text-[12px] text-[#b3b3b3]">
            {diagnostics.runtimeExposed ? 'Available' : 'Content script relay only'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 pt-2">
          <dt className="text-[12px] text-[#727272]">Handshake Probes</dt>
          <dd className="text-[12px] text-[#b3b3b3]">
            {diagnostics.attempts} probe{diagnostics.attempts === 1 ? '' : 's'} · {diagnostics.elapsedMs} ms
          </dd>
        </div>
        {connected && (
          <div className="flex items-baseline justify-between gap-3 pt-2">
            <dt className="text-[12px] text-[#727272]">Active Transport</dt>
            <dd className="text-[12px] text-[#1ed760] font-medium">
              {status.extension.bridge.transport === 'external' ? 'Direct (externally_connectable)' : 'Relay (content_script)'}
            </dd>
          </div>
        )}
        {diagnostics.ids.length > 0 && (
          <div className="pt-2 flex flex-col gap-1.5">
            <dt className="text-[12px] text-[#727272]">Probed IDs</dt>
            {diagnostics.ids.map((id) => (
              <dd key={id} className="break-all rounded-[4px] bg-[#222222] px-2 py-1 font-mono text-[11px] text-[#a4a4a4]">
                {id}
              </dd>
            ))}
          </div>
        )}
      </dl>

      <p className="mt-4 text-[12px] text-[#a4a4a4] leading-relaxed">{diagnostics.hint}</p>

      <button
        className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-white px-4 text-[13px] font-semibold text-black transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-50"
        onClick={check}
        disabled={checking}
      >
        <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
        {checking ? 'Checking…' : 'Check again'}
      </button>

      <p className="mt-3 text-[11px] text-[#727272] leading-normal">
        Requires an active handshake challenge response. The extension service worker wakes up automatically upon probing.
      </p>
    </aside>
  );
}

function integrationStatus(status: ExtensionStatus, integration: Integration, auth: YtAuthStatus): string {
  if (status.state === 'checking') return 'Checking…';
  if (status.state === 'missing') return 'Needs companion extension';
  if (!status.extension.info.capabilities.includes(integration.capability)) return 'Not available in this version';
  return (integration.capability === 'yt' && youtubeStatus(auth)) || integration.ready;
}

export default function ExtensionPage() {
  const status = useExtension();
  const update = useExtensionUpdate();
  const DOWNLOADS = downloadsFor(usePublishedExtension());
  const auth = useYtAuth();
  const [chosen, setChosen] = useState<Browser | null>(null);
  const [updating, setUpdating] = useState(false);
  const downloads = [...DOWNLOADS].sort(
    (a, b) => Number(b.browser === currentBrowser) - Number(a.browser === currentBrowser),
  );
  const installedBrowser: Browser | null =
    status.state === 'present' ? (status.extension.info.browser === 'firefox' ? 'firefox' : 'chrome') : null;
  const forUpdate = DOWNLOADS.find((d) => d.browser === (installedBrowser ?? currentBrowser))!;
  const selectedDownload = DOWNLOADS.find((d) => d.browser === chosen);

  return (
    <div className={settingsUi.centered}>
      <PageHeader title="MusoPhone Extension" />
      <div className={settingsUi.body}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
          <div className="flex min-w-0 flex-col">
            {/* Hero Card */}
            <section className="rounded-[8px] bg-[#181818] border border-white/[0.06] flex items-center gap-4 px-5 py-4 shadow-sm">
              <LogoMark size={44} />
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-white tracking-tight">MusoPhone Companion Extension</p>
                <p className="mt-0.5 text-[13px] text-[#a4a4a4] leading-normal">
                  Connects the web player to YouTube Music, Spotify and Discord across Chrome, Edge, Brave and Firefox.
                </p>
              </div>
            </section>

            {/* Connection Overview Group */}
            <section className={`${settingsUi.group} mt-4`} aria-live="polite">
              <div className={settingsUi.row}>
                <span>Status</span>
                <span className={settingsUi.value}>
                  {status.state === 'checking' && 'Checking…'}
                  {status.state === 'missing' && 'Not installed'}
                  {status.state === 'present' && (
                    <span className="inline-flex items-center gap-1.5 text-[#1ed760] font-medium">
                      <Check size={14} strokeWidth={2.5} />
                      Installed · v{status.extension.info.version}
                    </span>
                  )}
                </span>
              </div>
              {update.state !== 'unknown' && (
                <div className={settingsUi.row}>
                  <span>Latest Release</span>
                  <span className={settingsUi.value}>
                    v{update.latest.version}
                    {update.state === 'current' && ' · Up to date'}
                  </span>
                </div>
              )}
              {status.state === 'present' && (
                <div className={settingsUi.row}>
                  <span>Connection Transport</span>
                  <span className={settingsUi.value}>
                    {status.extension.bridge.transport === 'external' ? 'Direct Externally Connectable' : 'Page Relay'} ·{' '}
                    {status.extension.info.browser === 'firefox' ? 'Firefox' : 'Chromium'}
                  </span>
                </div>
              )}
            </section>

            {/* Update Available Banner */}
            {update.state === 'available' && (
              <div className="mt-4">
                <a
                  className={`${settingsUi.group} ${settingsUi.download}`}
                  href={forUpdate.href}
                  download={`musophone-extension-${forUpdate.browser}.zip`}
                  onClick={() => setUpdating(true)}
                >
                  <span className={settingsUi.updateDot} aria-hidden="true" />
                  <span className={settingsUi.downloadText}>
                    <span className={settingsUi.downloadTitle}>Update to v{update.latest.version}</span>
                    <span className={settingsUi.downloadDetail}>
                      You currently have v{update.installed}. Download the new {forUpdate.browser === 'firefox' ? 'Firefox' : 'Chromium'}{' '}
                      build and reload the extension.
                    </span>
                  </span>
                  <ChevronRight size={16} strokeWidth={2.4} className={settingsUi.chevron} />
                </a>
                {updating && (
                  <ol className="mt-3 space-y-2 rounded-[8px] bg-[#181818] border border-white/[0.06] p-4 text-[13px] text-[#a4a4a4]">
                    {forUpdate.updateSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="grid size-5 flex-none place-items-center rounded-[4px] bg-white/[0.08] text-[11px] font-bold text-white">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <p className={settingsUi.footer}>
              The extension securely handles authenticated API requests that web browsers restrict under CORS policy.
            </p>

            {/* Downloads Section */}
            <h2 className={settingsUi.sectionHeader}>Get the Extension</h2>
            <section className="grid gap-2.5">
              {downloads.map(({ browser, title, detail, href, Icon }) => (
                <div
                  key={browser}
                  className="rounded-[8px] bg-[#181818] border border-white/[0.06] p-4 transition-all hover:border-white/[0.12]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="grid size-10 flex-none place-items-center rounded-[6px] bg-[#242424] text-white">
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-white truncate">{title}</h3>
                          {browser === currentBrowser && (
                            <span className="rounded-[4px] bg-[#242424] px-1.5 py-0.5 text-[10px] font-semibold text-[#1ed760] border border-[#1ed760]/20">
                              Your Browser
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-[#a4a4a4] truncate mt-0.5">{detail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-none">
                      <button
                        className="rounded-[6px] bg-[#242424] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#2c2c2c] transition-colors border border-white/[0.08]"
                        onClick={() => setChosen(chosen === browser ? null : browser)}
                      >
                        {chosen === browser ? 'Hide Steps' : 'Instructions'}
                      </button>
                      <a
                        className="inline-flex items-center gap-1.5 rounded-[6px] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-black hover:bg-white/90 active:scale-[0.98] transition-all"
                        href={href}
                        download={`musophone-extension-${browser}.zip`}
                        onClick={() => setChosen(browser)}
                      >
                        Download
                      </a>
                    </div>
                  </div>

                  {chosen === browser && selectedDownload && (
                    <div className="mt-4 border-t border-white/[0.06] pt-3.5">
                      <h4 className="text-[12px] font-semibold text-white uppercase tracking-wider mb-2.5">
                        Installation Steps
                      </h4>
                      <ol className="space-y-2 text-[12.5px] text-[#b3b3b3]">
                        {selectedDownload.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="grid size-5 flex-none place-items-center rounded-[4px] bg-white/[0.08] text-[11px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Integrations Section */}
            <h2 className={settingsUi.sectionHeader}>Supported Integrations</h2>
            <section className={settingsUi.group}>
              {INTEGRATIONS.map((integration) => (
                <div key={integration.name} className={settingsUi.integration}>
                  <span className={settingsUi.integrationIcon} style={{ backgroundColor: integration.color }}>
                    <integration.Icon size={14} />
                  </span>
                  <span className={settingsUi.integrationName}>{integration.name}</span>
                  {status.state === 'present' && integration.capability === 'spotify' ? (
                    <SpotifyIntegration />
                  ) : status.state === 'present' && integration.capability === 'discord' ? (
                    <DiscordIntegration />
                  ) : (
                    <span className={settingsUi.integrationValue}>{integrationStatus(status, integration, auth)}</span>
                  )}
                </div>
              ))}
            </section>

            {auth.state === 'ready' && auth.auth.problem && (
              <p className={settingsUi.footer}>YouTube Music: {auth.auth.problem}.</p>
            )}

            <p className={settingsUi.footer}>
              Credentials and session cookies remain securely stored inside the extension sandbox.
            </p>
            <p className={settingsUi.footer}>
              Canvas settings, Discord Rich Presence and Listen Together configurations are managed in{' '}
              <PrefetchLink to="/settings" className={settingsUi.inlineLink}>
                Settings
              </PrefetchLink>
              .
            </p>
            <p className={settingsUi.footer}>
              MusoPhone Extension by Al Shahriar Sowan · Eagox Studio.{' '}
              <PrefetchLink to="/about" className={settingsUi.inlineLink}>
                About &amp; Credits
              </PrefetchLink>
            </p>
          </div>

          <ConnectionCard status={status} />
        </div>
      </div>
    </div>
  );
}
