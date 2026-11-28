import { ChevronRight } from 'lucide-react';
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
 * The two builds, as published (extension.json): the zip and the folder in it
 * carry the version, "musophone-extension-chrome (0.4.3)". Before that file
 * has loaded, the configured URLs and the unversioned names stand in.
 */
function downloadsFor(published: PublishedExtension | null): Download[] {
  const folder = (browser: Browser) => `musophone-extension-${browser}${published ? ` (${published.version})` : ''}`;
  return [
    {
      browser: 'chrome',
      title: 'Download for Chrome',
      detail: 'Chrome, Edge, Brave and other Chromium browsers',
      href: published ? downloadUrl(published.files.chrome) : config.extensionChromeUrl,
      Icon: FaChrome,
      steps: [
        `Extract the zip somewhere you’ll keep it. It holds one folder, ${folder('chrome')}.`,
        'Open chrome://extensions and turn on Developer mode.',
        'Choose Load unpacked and select that folder.',
        'Come back to this page: the status above turns to Installed.',
      ],
      updateSteps: [
        `Extract the new zip. It holds ${folder('chrome')}.`,
        'In chrome://extensions, choose Load unpacked and select that folder. It has the same ID, so it takes the old one’s place and keeps your settings.',
        'Delete the old folder, then come back to this page: the version above updates on its own.',
      ],
    },
    {
      browser: 'firefox',
      title: 'Download for Firefox',
      detail: 'Firefox 128 or newer',
      href: published ? downloadUrl(published.files.firefox) : config.extensionFirefoxUrl,
      Icon: FaFirefoxBrowser,
      steps: [
        `Extract the zip. It holds one folder, ${folder('firefox')}.`,
        'Open about:debugging#/runtime/this-firefox and choose Load Temporary Add-on.',
        'Select manifest.json inside that folder.',
        'Firefox removes temporary add-ons when it quits; a signed version is coming.',
      ],
      updateSteps: [
        `Extract the new zip. It holds ${folder('firefox')}.`,
        'In about:debugging, choose Load Temporary Add-on and select manifest.json in the new folder.',
        'Come back to this page: the version above updates on its own.',
      ],
    },
  ];
}

/** The browser this page is open in, to put its download first. */
const currentBrowser: Browser = /firefox/i.test(navigator.userAgent) ? 'firefox' : 'chrome';

interface Integration {
  name: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  capability: Capability;
  /** What the row says when the extension serves this integration. */
  ready: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'YouTube Music', Icon: SiYoutubemusic, color: '#ff0033', capability: 'yt', ready: 'Playback ready · not signed in' },
  { name: 'Spotify', Icon: SiSpotify, color: '#1ed760', capability: 'spotify', ready: 'Not connected' },
  { name: 'Discord', Icon: SiDiscord, color: '#5865f2', capability: 'discord', ready: 'Off' },
];

/** YouTube Music's row: who requests act as, once the extension reports it. */
function youtubeStatus(auth: YtAuthStatus): string | null {
  if (auth.state !== 'ready') return null;
  const { browserSignedIn, connected, active } = auth.auth;
  if (!browserSignedIn) return 'Playback ready · not signed in';
  if (!connected) return 'Disconnected';
  return active ? `Signed in as ${active.name}` : 'Signed in · no account could be read';
}

/**
 * The handshake, made visible: which address was probed, which ids were
 * called, what Chromium exposed, how many times it was tried and what the last
 * failure said. This is the panel that turns "not detected" into a cause.
 */
function ConnectionCard({ status }: { status: ExtensionStatus }) {
  const [checking, setChecking] = useState(false);
  const diagnostics = status.diagnostics;
  const connected = status.state === 'present';
  const badge = connected
    ? 'bg-green shadow-[0_0_10px_color-mix(in_srgb,var(--systemGreen)_60%,transparent)]'
    : status.state === 'checking'
      ? 'animate-pulse bg-key/60'
      : 'bg-tertiary';

  const check = () => {
    setChecking(true);
    void recheckExtension().finally(() => setChecking(false));
  };

  return (
    <aside className="glass-card rounded-[22px] p-5 lg:sticky lg:top-4" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-[600_13px/17px]">Connection</h2>
        <span className="inline-flex items-center gap-2 rounded-pill bg-quinary px-2.5 py-1 type-[600_10px/12px] uppercase tracking-[0.12em] text-secondary">
          <span className={`size-1.5 rounded-full ${badge}`} aria-hidden="true" />
          {connected ? 'Connected' : status.state === 'checking' ? 'Checking' : 'Not detected'}
        </span>
      </div>

      <dl className="mt-4 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="type-callout text-tertiary">Website</dt>
          <dd className="min-w-0 truncate text-right type-callout text-secondary" title={diagnostics.origin || undefined}>
            {diagnostics.origin || 'unknown'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="type-callout text-tertiary">Browser</dt>
          <dd className="type-callout text-secondary">
            {diagnostics.browser === 'chromium' ? 'Chromium' : diagnostics.browser === 'firefox' ? 'Firefox' : 'Unknown'}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="type-callout text-tertiary">Extension runtime</dt>
          <dd className="type-callout text-secondary">{diagnostics.runtimeExposed ? 'Exposed' : 'Not exposed'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="type-callout text-tertiary">Handshake</dt>
          <dd className="type-callout text-secondary">
            {diagnostics.attempts} probe{diagnostics.attempts === 1 ? '' : 's'} · {diagnostics.elapsedMs} ms
          </dd>
        </div>
        {connected && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="type-callout text-tertiary">Transport</dt>
            <dd className="type-callout text-secondary">
              {status.extension.bridge.transport === 'external' ? 'Direct page → extension' : 'Page relay'}
            </dd>
          </div>
        )}
        {diagnostics.ids.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            <dt className="type-callout text-tertiary">Extension ids probed</dt>
            {diagnostics.ids.map((id) => (
              <dd key={id} className="break-all rounded-[8px] bg-quinary px-2 py-1 font-mono type-[10px/14px] text-secondary">
                {id}
              </dd>
            ))}
          </div>
        )}
      </dl>

      <p className="mt-4 type-callout text-secondary">{diagnostics.hint}</p>
      <button
        className="press mt-3 inline-flex h-8 items-center gap-2 rounded-pill bg-quinary px-3.5 type-[600_11px/14px] text-primary shadow-[inset_0_1px_0_var(--tileRim),inset_0_0_0_1px_var(--tileHairline)] hover:bg-quaternary disabled:opacity-50"
        onClick={check}
        disabled={checking}
      >
        {checking && <span className="size-2 animate-pulse rounded-full bg-key" aria-hidden="true" />}
        {checking ? 'Checking…' : 'Check again'}
      </button>
      <p className="mt-3 type-caption-2 text-tertiary">
        This page only claims a connection after the extension answers its own ping. Nothing is assumed from the
        browser.
      </p>
    </aside>
  );
}

/** One integration's state, honest about what this extension version can do. */
function integrationStatus(status: ExtensionStatus, integration: Integration, auth: YtAuthStatus): string {
  if (status.state === 'checking') return 'Checking…';
  if (status.state === 'missing') return 'Needs the extension';
  if (!status.extension.info.capabilities.includes(integration.capability)) return 'Not available in this version yet';
  return (integration.capability === 'yt' && youtubeStatus(auth)) || integration.ready;
}

export default function ExtensionPage() {
  const status = useExtension();
  const update = useExtensionUpdate();
  const DOWNLOADS = downloadsFor(usePublishedExtension());
  const auth = useYtAuth();
  const [chosen, setChosen] = useState<Browser | null>(null);
  const [updating, setUpdating] = useState(false);
  const downloads = [...DOWNLOADS].sort((a, b) => Number(b.browser === currentBrowser) - Number(a.browser === currentBrowser));
  const installedBrowser: Browser | null =
    status.state === 'present' ? (status.extension.info.browser === 'firefox' ? 'firefox' : 'chrome') : null;
  const forUpdate = DOWNLOADS.find((d) => d.browser === (installedBrowser ?? currentBrowser))!;
  const steps = DOWNLOADS.find((d) => d.browser === chosen)?.steps;

  return (
    <div className={settingsUi.centered}>
      <PageHeader title="MusoPhone Extension" />
      <div className={settingsUi.body}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
          <div className="flex min-w-0 flex-col">
        <section className="glass-card flex items-center gap-5 rounded-[20px] px-5 py-4">
          <LogoMark size={48} />
          <div className="min-w-0">
            <p className="type-[600_14px/19px]">MusoPhone for your browser</p>
            <p className="mt-0.5 type-callout text-secondary">
              Playback, sign-in, Spotify and Discord support in Chrome, Edge, Brave and Firefox.
            </p>
          </div>
        </section>
        <section className={`${settingsUi.group} mt-3`} aria-live="polite">
          <div className={settingsUi.row}>
            <span>Status</span>
            <span className={settingsUi.value}>
              {status.state === 'checking' && 'Checking…'}
              {status.state === 'missing' && 'Not installed'}
              {status.state === 'present' && (
                <>
                  <span className={settingsUi.dot} aria-hidden="true" />
                  Installed · v{status.extension.info.version}
                </>
              )}
            </span>
          </div>
          {update.state !== 'unknown' && (
            <div className={settingsUi.row}>
              <span>Latest</span>
              <span className={settingsUi.value}>
                v{update.latest.version}
                {update.state === 'current' && ' · Up to date'}
              </span>
            </div>
          )}
          {status.state === 'present' && (
            <div className={settingsUi.row}>
              <span>Connection</span>
              <span className={settingsUi.value}>
                {status.extension.bridge.transport === 'external' ? 'Direct' : 'Page relay'} ·{' '}
                {status.extension.info.browser === 'firefox' ? 'Firefox' : 'Chromium'}
              </span>
            </div>
          )}
        </section>
        {update.state === 'available' && (
          <>
            <a
              className={`${settingsUi.group} ${settingsUi.download} mt-3`}
              href={forUpdate.href}
              download={`musophone-extension-${forUpdate.browser}.zip`}
              onClick={() => setUpdating(true)}
            >
              <span className={settingsUi.updateDot} aria-hidden="true" />
              <span className={settingsUi.downloadText}>
                <span className={settingsUi.downloadTitle}>Update to v{update.latest.version}</span>
                <span className={settingsUi.downloadDetail}>
                  You have v{update.installed}. Download the new {forUpdate.browser === 'firefox' ? 'Firefox' : 'Chrome'}{' '}
                  build, then reload the extension.
                </span>
              </span>
              <ChevronRight size={16} strokeWidth={2.4} className={settingsUi.chevron} />
            </a>
            {updating && (
              <ol className={settingsUi.steps}>
                {forUpdate.updateSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </>
        )}
        <p className={settingsUi.footer}>
          The extension does the networking and sign-in work a web page isn’t allowed to do. Addons and most lyric
          providers work without it.
        </p>

        <h2 className={settingsUi.sectionHeader}>Get the extension</h2>
        <section className={settingsUi.group}>
          {downloads.map(({ browser, title, detail, href, Icon }) => (
            <a
              key={browser}
              className={settingsUi.download}
              href={href}
              download={`musophone-extension-${browser}.zip`}
              onClick={() => setChosen(browser)}
            >
              <Icon size={28} className="text-primary" />
              <span className={settingsUi.downloadText}>
                <span className={settingsUi.downloadTitle}>{title}</span>
                <span className={settingsUi.downloadDetail}>
                  {detail}
                  {browser === currentBrowser && ' · This browser'}
                </span>
              </span>
              <ChevronRight size={16} strokeWidth={2.4} className={settingsUi.chevron} />
            </a>
          ))}
        </section>
        {steps ? (
          <ol className={settingsUi.steps}>
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className={settingsUi.footer}>Pick your browser to download the extension and see how to install it.</p>
        )}

        <h2 className={settingsUi.sectionHeader}>Integrations</h2>
        <section className={settingsUi.group}>
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className={settingsUi.integration}>
              <span className={settingsUi.integrationIcon} style={{ backgroundColor: integration.color }}>
                <integration.Icon size={15} />
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
          Sign-ins stay inside the extension: this page only ever sees results, never your cookies or tokens.
        </p>
        <p className={settingsUi.footer}>
          Spotify Canvas, Discord presence and Listen Together are in{' '}
          <PrefetchLink to="/settings" className={settingsUi.inlineLink}>
            Settings
          </PrefetchLink>
          .
        </p>
        <p className={settingsUi.footer}>
          The extension is part of MusoPhone by Al Shahriar Sowan · Eagox Studio.{' '}
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
