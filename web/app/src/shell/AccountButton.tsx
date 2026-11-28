import { ArrowUpRight, ChevronsUpDown, LogIn, UserRound } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Menu, MenuHeader, MenuItem, MenuSeparator } from '@/components/Menu';
import { useRefreshYtAuth, useSelectChannel, useSetConnected, useYtAuth } from '@/extension/useYtAuth';

const SIGN_IN_URL = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https://music.youtube.com/';

// The signed-out button: clean Spotify-style rectangular with subtle rounding
const pill =
  'self-start rounded-[6px] bg-key px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:brightness-110 disabled:opacity-60 transition-transform active:scale-95';
const avatar = 'inline-grid flex-none place-items-center rounded-[6px] bg-[#242424] object-cover text-[11px] font-bold text-white';
const compactAccountButton =
  'grid size-8 place-items-center rounded-[6px] bg-[#242424] text-[#b3b3b3] hover:text-white transition-colors';

function Avatar({ src, name, size }: { src: string | null; name: string; size: number }) {
  return src ? (
    <img className={avatar} src={src} alt="" width={size} height={size} referrerPolicy="no-referrer" />
  ) : (
    <span className={avatar} style={{ width: size, height: size }} aria-hidden="true">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/**
 * The sidebar's account control (report §1: avatar and name at the bottom,
 * opening the account menu; a red "Sign In" pill when signed out).
 *
 * There is no sign-in form (prompt §5.3): BitChord uses the YouTube session
 * this browser already has, through the extension. "Sign In" opens Google's
 * own sign-in; the extension notices the new session and this updates itself.
 */
export function AccountButton({ compact = false }: { compact?: boolean }) {
  const status = useYtAuth();
  const select = useSelectChannel();
  const connect = useSetConnected();
  const refresh = useRefreshYtAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = useCallback(() => setAnchor(null), []);

  if (status.state !== 'ready') return null;
  const { auth } = status;

  if (!auth.browserSignedIn) {
    return compact ? (
      <a
        className="grid size-8 place-items-center rounded-[6px] bg-key text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
        href={SIGN_IN_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Sign In"
        title="Sign In"
      >
        <LogIn size={15} strokeWidth={2.2} />
      </a>
    ) : (
      <a className={pill} href={SIGN_IN_URL} target="_blank" rel="noreferrer">
        Sign In
      </a>
    );
  }
  if (!auth.connected) {
    return (
      <button
        className={compact ? compactAccountButton : pill}
        onClick={() => connect.mutate(true)}
        disabled={connect.isPending}
        aria-label="Connect YouTube Music"
        title="Connect YouTube Music"
      >
        {compact ? <UserRound size={15} strokeWidth={2.2} /> : 'Connect YouTube Music'}
      </button>
    );
  }
  if (!auth.active) {
    // Signed in to the browser, but the account couldn't be read (the reason is on the Extension page).
    return (
      <button
        className={compact ? compactAccountButton : pill}
        title={auth.problem ?? undefined}
        onClick={() => refresh.mutate()}
        disabled={refresh.isPending}
        aria-label="Retry YouTube Sign-In"
      >
        {compact ? <UserRound size={15} strokeWidth={2.2} /> : refresh.isPending ? 'Reading account…' : 'Retry YouTube Sign-In'}
      </button>
    );
  }
  const active = auth.active;
  const multiple = auth.accounts.flatMap((a) => a.channels).length > 1;

  return (
    <>
      <button
        // Signed in: a 24px avatar and the name, opening the account menu.
        className={
          compact
            ? 'press grid size-9 place-items-center rounded-full hover:bg-quinary aria-expanded:bg-quinary'
            : 'flex w-full min-w-0 items-center gap-2 rounded-nav px-1 py-1.5 text-start type-body-reduced text-primary hover:bg-quinary aria-expanded:bg-quinary'
        }
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-label={compact ? active.name : undefined}
        title={compact ? active.name : undefined}
        onClick={(event) => setAnchor(anchor ? null : event.currentTarget)}
      >
        <Avatar src={active.avatarUrl} name={active.name} size={compact ? 28 : 24} />
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate">{active.name}</span>
            {multiple && <ChevronsUpDown size={14} strokeWidth={2} className="flex-none text-secondary" />}
          </>
        )}
      </button>
      {anchor && (
        <Menu anchor={anchor} placement="above-start" onClose={close} label="Account">
          {auth.accounts.map((account) => (
            <div key={account.authUser} role="group" aria-label={account.email ?? account.name}>
              <MenuHeader>{account.email ?? account.name}</MenuHeader>
              {account.channels.map((channel) => (
                <MenuItem
                  key={channel.id}
                  checked={channel.id === active.id}
                  icon={<Avatar src={channel.avatarUrl} name={channel.name} size={20} />}
                  trailing={channel.brand ? 'Brand' : undefined}
                  onSelect={() => {
                    close();
                    if (channel.id !== active.id) select.mutate(channel.id);
                  }}
                >
                  {channel.name}
                </MenuItem>
              ))}
            </div>
          ))}
          <MenuSeparator />
          <MenuItem
            onSelect={() => {
              close();
              window.open(SIGN_IN_URL.replace('ServiceLogin', 'AddSession'), '_blank', 'noreferrer');
            }}
            trailing={<ArrowUpRight size={13} />}
          >
            Add Account
          </MenuItem>
          <MenuItem
            destructive
            onSelect={() => {
              close();
              connect.mutate(false);
            }}
          >
            Disconnect from MusoPhone
          </MenuItem>
        </Menu>
      )}
    </>
  );
}
