import { ArrowUpRight, Globe, Mail } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { PrefetchLink } from '@/components/PrefetchLink';
import { config } from '@/config';

const GITHUB = 'https://github.com/Alshahriar-07/Musophone';
const WEBSITE = 'https://musophone.vercel.app/';

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      className="inline-flex items-center gap-1 text-key hover:underline focus-visible:underline"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {children}
      <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
    </a>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-[18px] font-bold text-white tracking-tight">{title}</h2>
      <div className="rounded-[8px] bg-[#181818] border border-white/[0.04] p-4 text-[#b3b3b3] divide-y divide-white/[0.05]">
        {children}
      </div>
    </section>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-[14px]">
      <span className="font-medium text-white">{label}</span>
      <div className="text-right text-[#b3b3b3]">{children}</div>
    </div>
  );
}

function CreditItem({ name, description }: { name: string; description: ReactNode }) {
  return (
    <div className="py-3.5 first:pt-0 last:pb-0">
      <span className="block text-[14.5px] font-bold text-white">{name}</span>
      <p className="mt-1 text-[13px] leading-relaxed text-[#b3b3b3]">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[860px] px-6 py-4">
      <PageHeader title="About" />

      {/* Spotify Desktop Hero Card */}
      <div className="relative mb-8 overflow-hidden rounded-[8px] bg-gradient-to-b from-[#242424] to-[#121212] p-8 border border-white/[0.06] shadow-lg">
        <div className="relative z-1 max-w-[560px]">
          <img
            src="/brand/musophone-logo.webp"
            alt="MusoPhone"
            className="h-auto w-[min(300px,80%)] drop-shadow-md"
            width={1400}
            height={467}
          />
          <p className="mt-4 text-[20px] font-bold text-white tracking-tight">Play. Listen. Enjoy.</p>
          <p className="mt-2 text-[14px] leading-relaxed text-[#b3b3b3]">
            An independent, desktop-grade music experience for the web, Android and your browser — designed and
            developed by <strong className="text-white">Al Shahriar Sowan</strong> at <strong className="text-white">Eagox Studio</strong>.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] font-semibold">
            <a
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-white px-4 py-2 text-black transition-transform hover:scale-102 active:scale-98"
              href={WEBSITE}
              target="_blank"
              rel="noreferrer"
            >
              <Globe size={15} />
              Website
            </a>
            <a
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#2a2a2a] px-4 py-2 text-white border border-white/[0.08] transition-transform hover:scale-102 active:scale-98"
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub size={15} />
              GitHub
            </a>
            <a
              className="inline-flex items-center gap-1.5 rounded-[6px] bg-[#2a2a2a] px-4 py-2 text-white border border-white/[0.08] transition-transform hover:scale-102 active:scale-98"
              href={config.androidAppUrl}
              target="_blank"
              rel="noreferrer"
            >
              Android App
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <SectionCard title="Project">
        <InfoRow label="Product">MusoPhone Web · v{config.version}</InfoRow>
        <InfoRow label="Creator & Developer">Al Shahriar Sowan</InfoRow>
        <InfoRow label="Publisher & Studio">Eagox Studio</InfoRow>
        <InfoRow label="Website">
          <ExternalLink href={WEBSITE}>musophone.vercel.app</ExternalLink>
        </InfoRow>
        <InfoRow label="Source Code">
          <ExternalLink href={GITHUB}>Alshahriar-07/Musophone</ExternalLink>
        </InfoRow>
        <InfoRow label="Contact">
          <a className="inline-flex items-center gap-1.5 text-key hover:underline" href="mailto:eagoxstudio@gmail.com">
            <Mail size={14} />
            eagoxstudio@gmail.com
          </a>
        </InfoRow>
      </SectionCard>

      {/* Credits */}
      <SectionCard title="Credits & Acknowledgements">
        <CreditItem
          name="Al Shahriar Sowan · Eagox Studio"
          description="Product direction, brand identity, desktop UI design, Android and web development, integration and release engineering."
        />
        <CreditItem
          name="The MusoPhone Community"
          description={
            <>
              Everyone who reports bugs, suggests features, translates, tests releases and keeps the project honest. The full
              contributor list lives in <ExternalLink href={`${GITHUB}/blob/main/MAINTAINERS.md`}>MAINTAINERS.md</ExternalLink>.
            </>
          }
        />
        <CreditItem
          name="AI-Assisted Development"
          description="ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google DeepMind), and DeepSeek supported planning, documentation and implementation. Product decisions, integration and code remain MusoPhone's own."
        />
      </SectionCard>

      {/* Built on Open Source */}
      <SectionCard title="Built on Open Source">
        <CreditItem
          name="BitChord · Kushagra Singh"
          description={
            <>
              MusoPhone's original codebase and core foundation for playback, library, and party sync. GPL-3.0.{' '}
              <ExternalLink href="https://github.com/kushagrasinghx/BitChord">Upstream repository</ExternalLink>.
            </>
          }
        />
        <CreditItem
          name="AutoMix · David Finnegan"
          description="The beat-matched transition engine that MusoPhone's Automix builds on. AGPL-3.0, combined under GPLv3 §13."
        />
        <CreditItem
          name="am-lyrics · binimum"
          description="The Apple-style animated lyric renderer used by the player."
        />
        <CreditItem
          name="Playback & Engines"
          description="youtubei.js, Shaka Player, hls.js, googlevideo, onnxruntime-web and Essentia.js."
        />
        <CreditItem
          name="Lyrics Providers"
          description="LRCLIB, BiniLyrics, BetterLyrics, PaxSenix, LyricsPlus, SimpMusic, Unison, lrc.red, KuGou, Musixmatch and Genius."
        />
      </SectionCard>

      {/* Licence & Legal */}
      <SectionCard title="Licence & Legal">
        <InfoRow label="Licence">
          <ExternalLink href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</ExternalLink>
        </InfoRow>
        <InfoRow label="Full Credits">
          <ExternalLink href={`${GITHUB}/blob/main/Credit.md`}>Credit.md</ExternalLink>
        </InfoRow>
        <InfoRow label="Licence Text">
          <ExternalLink href={`${GITHUB}/blob/main/LICENSE`}>LICENSE</ExternalLink>
        </InfoRow>
      </SectionCard>

      <footer className="mt-8 border-t border-white/[0.06] pt-5 text-[12px] text-[#727272]">
        <p>© 2026 Eagox Studio · MusoPhone</p>
        <p className="mt-1">
          Designed & developed by Al Shahriar Sowan ·{' '}
          <ExternalLink href={GITHUB}>Source on GitHub</ExternalLink> ·{' '}
          <PrefetchLink to="/extension" className="text-key hover:underline">
            Browser extension
          </PrefetchLink>
        </p>
      </footer>
    </div>
  );
}
