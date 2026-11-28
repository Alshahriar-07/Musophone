import { ArrowUpRight, Globe, Mail } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PrefetchLink } from '@/components/PrefetchLink';
import { config } from '@/config';
import { settingsUi } from './settingsStyles';

const GITHUB = 'https://github.com/Alshahriar-07/Musophone';
const WEBSITE = 'https://musophone.vercel.app/';

const externalLink =
  'inline-flex items-center gap-1 text-key hover:underline focus-visible:underline';

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className={externalLink} href={href} target="_blank" rel="noreferrer">
      {children}
      <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
    </a>
  );
}

/** One labelled row in a grouped panel, as on Settings. */
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={settingsUi.integrationPlain}>
      <span className={settingsUi.integrationName}>{label}</span>
      <span className={settingsUi.value}>{children}</span>
    </div>
  );
}

function Credit({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className={`${settingsUi.integrationPlain} items-start`}>
      <span className="min-w-0">
        <span className="block type-title-3-emphasized">{name}</span>
        <span className="mt-0.5 block type-callout text-secondary">{children}</span>
      </span>
    </div>
  );
}

/**
 * About & Credits. MusoPhone leads; the people, upstream projects and
 * third-party services that make it possible follow, with their real licences
 * and links. The official logo is the project's own artwork.
 */
export default function AboutPage() {
  return (
    <div className={settingsUi.centered}>
      <PageHeader title="About" />
      <div className={`${settingsUi.body} max-w-[900px]`}>
        <section className="relative mt-2 overflow-hidden rounded-[26px] bg-[#0d0e11] px-7 py-8 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.16),inset_0_0_0_1px_rgb(255_255_255/0.08),0_30px_80px_-40px_rgb(0_0_0/0.6)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 -left-24 size-[360px] rounded-full bg-[radial-gradient(circle,rgb(255_77_103/0.28),transparent_66%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-32 size-[320px] rounded-full bg-[radial-gradient(circle,rgb(255_77_103/0.14),transparent_68%)]"
          />
          <img
            src="/brand/musophone-logo.webp"
            alt="MusoPhone"
            className="relative h-auto w-[min(360px,82%)]"
            width={1400}
            height={467}
          />
          <p className="relative mt-5 type-title-2 text-white/85">Play. Listen. Enjoy.</p>
          <p className="relative mt-2 max-w-[480px] type-body-tall text-white/55">
            An independent, premium music player for the web, Android and your browser — designed and developed by
            Al Shahriar Sowan at Eagox Studio.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 type-body-emphasized">
            <a
              className="inline-flex items-center gap-1.5 text-[color-mix(in_srgb,var(--keyColor)_55%,#ffffff)] hover:underline"
              href={WEBSITE}
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={15} strokeWidth={2} aria-hidden="true" />
              musophone.vercel.app
            </a>
            <a
              className="inline-flex items-center gap-1.5 text-[color-mix(in_srgb,var(--keyColor)_55%,#ffffff)] hover:underline"
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub size={15} aria-hidden="true" />
              GitHub
            </a>
            <a
              className="inline-flex items-center gap-1.5 text-[color-mix(in_srgb,var(--keyColor)_55%,#ffffff)] hover:underline"
              href={config.androidAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              Android app
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </section>

        <h2 className={settingsUi.sectionHeader}>Project</h2>
        <section className={settingsUi.group}>
          <Row label="Product">MusoPhone Web · v{config.version}</Row>
          <Row label="Creator & developer">Al Shahriar Sowan</Row>
          <Row label="Studio & publisher">Eagox Studio</Row>
          <Row label="Website">
            <ExternalLink href={WEBSITE}>musophone.vercel.app</ExternalLink>
          </Row>
          <Row label="Source code">
            <ExternalLink href={GITHUB}>Alshahriar-07/Musophone</ExternalLink>
          </Row>
          <Row label="Contact">
            <a className={externalLink} href="mailto:eagoxstudio@gmail.com">
              <Mail size={14} strokeWidth={2} aria-hidden="true" />
              eagoxstudio@gmail.com
            </a>
          </Row>
        </section>

        <h2 className={settingsUi.sectionHeader}>Credits</h2>
        <section className={settingsUi.group}>
          <Credit name="Al Shahriar Sowan · Eagox Studio">
            Product direction, brand identity, Android and web development, integration, testing and release engineering.
          </Credit>
          <Credit name="The MusoPhone community">
            Everyone who reports bugs, suggests features, translates, tests releases and keeps the project honest. The full
            contributor list lives in the repository's history and{' '}
            <ExternalLink href={`${GITHUB}/blob/main/MAINTAINERS.md`}>MAINTAINERS.md</ExternalLink>.
          </Credit>
          <Credit name="AI-assisted development">
            ChatGPT (OpenAI), Claude (Anthropic) and DeepSeek supported planning, documentation and implementation. Product
            decisions, integration and final code remain the MusoPhone project's own.
          </Credit>
        </section>

        <h2 className={settingsUi.sectionHeader}>Built on open source</h2>
        <section className={settingsUi.group}>
          <Credit name="BitChord · Kushagra Singh">
            MusoPhone's original codebase and a substantial part of its architecture, playback, library and Listen Together
            work. GPL-3.0. <ExternalLink href="https://github.com/kushagrasinghx/BitChord">Upstream repository</ExternalLink>.
          </Credit>
          <Credit name="AutoMix · David Finnegan">
            The beat-matched transition engine that MusoPhone's Automix builds on. AGPL-3.0, combined under GPLv3 §13.
          </Credit>
          <Credit name="am-lyrics · binimum">
            The Apple-style animated lyric renderer used by the player.
          </Credit>
          <Credit name="Playback & data">
            youtubei.js, Shaka Player, hls.js, googlevideo, onnxruntime-web and Essentia.js. Each keeps its own licence in
            the source tree.
          </Credit>
          <Credit name="Lyrics providers">
            LRCLIB, BiniLyrics, BetterLyrics, PaxSenix, LyricsPlus, SimpMusic, Unison, lrc.red, KuGou, Musixmatch and
            Genius. Their terms and attribution continue to apply.
          </Credit>
          <Credit name="Artwork & catalogue">
            Album and artist artwork comes from YouTube Music, Spotify and Apple Music's public pages. MusoPhone hosts no
            media and is not affiliated with any of them.
          </Credit>
        </section>

        <h2 className={settingsUi.sectionHeader}>Licence & legal</h2>
        <section className={settingsUi.group}>
          <Row label="Licence">
            <ExternalLink href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</ExternalLink>
          </Row>
          <Row label="Full credits">
            <ExternalLink href={`${GITHUB}/blob/main/Credit.md`}>Credit.md</ExternalLink>
          </Row>
          <Row label="Licence text">
            <ExternalLink href={`${GITHUB}/blob/main/LICENSE`}>LICENSE</ExternalLink>
          </Row>
        </section>
        <p className={settingsUi.footer}>
          MusoPhone is free software under the GNU General Public License v3.0. Any distributed build must make its
          corresponding source available under the same licence. MusoPhone is not affiliated with Google, YouTube,
          Spotify, Discord, Apple or BitChord; third-party services remain subject to their own terms.
        </p>

        <footer className="mt-8 border-t border-(--labelDivider) pt-5 type-callout text-secondary">
          <p>© 2026 Eagox Studio · MusoPhone</p>
          <p className="mt-1">
            Designed & developed by Al Shahriar Sowan ·{' '}
            <ExternalLink href={GITHUB}>Source on GitHub</ExternalLink> ·{' '}
            <PrefetchLink to="/extension" className={externalLink}>
              Browser extension
            </PrefetchLink>
          </p>
        </footer>
      </div>
    </div>
  );
}
