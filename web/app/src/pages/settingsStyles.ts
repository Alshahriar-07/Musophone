/*
 * Grouped inset rows, the settings idiom the app uses elsewhere: the
 * Extension, Settings, Discord and Listen Together pages.
 */

const row = 'relative flex min-h-[46px] items-center justify-between gap-4 px-4 py-2.5 type-[400_13px/18px] hairline-[16px]';
const integration = 'relative grid min-h-[46px] items-center gap-x-3 px-4 py-2.5 type-[400_13px/18px] hairline-[52px]';
const field =
  'w-[220px] flex-none rounded-[10px] border-0 bg-quinary px-2.5 py-[6px] type-body text-primary shadow-[inset_0_1px_0_var(--tileRim),inset_0_0_0_1px_var(--tileHairline)]';

export const settingsUi = {
  /** The page title and its rows as one column, centred in the page. */
  centered: 'mx-auto w-full max-w-[calc(1020px+2*var(--body-gutter))]',
  body: 'mx-(--body-gutter) mt-4 mb-[120px] max-w-[1020px]',
  /** A page whose content is one short column: it keeps a readable measure. */
  narrow: 'max-w-[720px]',
  /** Two columns of groups on a desktop, one on anything narrower. */
  split: 'grid gap-x-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start',
  column: 'flex min-w-0 flex-col',
  // One glass group: a slab with a lit rim, the same material as the cards.
  group: 'glass-card overflow-hidden rounded-[20px]',
  sectionHeader:
    'mx-4 mt-8 mb-2 flex items-center gap-2 type-[600_10px/13px] uppercase tracking-[0.16em] text-tertiary',
  footer: 'mx-4 mt-2 type-callout text-secondary',

  row,
  /** A row holding a switch, a select or a field: the whole row is its label. */
  controlRow: `${row} cursor-pointer gap-4`,
  rowText: 'flex flex-col gap-0.5',
  rowDetail: 'type-callout text-secondary',
  value: 'inline-flex items-center gap-1.5 text-right type-[400_13px/18px] text-secondary',
  /** A row's status/action: on a phone it moves under the name instead of overflowing beside it. */
  integrationValue:
    'inline-flex flex-wrap items-center gap-1.5 text-right type-body-reduced text-secondary max-sm:col-start-2 max-sm:row-start-2 max-sm:justify-self-start max-sm:text-left',
  dot: 'size-2 rounded-full bg-green',

  /** Download rows: browser logo, title and detail, chevron. */
  download:
    'relative grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 transition-colors hover:bg-quinary hairline-[60px]',
  updateDot: 'size-2.5 justify-self-center rounded-full bg-key shadow-[0_0_12px_var(--keyColor)]',
  downloadText: 'flex min-w-0 flex-col gap-0.5',
  downloadTitle: 'type-title-3-emphasized text-key',
  downloadDetail: 'type-body text-secondary',
  chevron: 'text-tertiary',
  steps: 'mx-4 mt-2.5 list-decimal ps-[18px] type-body-tall text-secondary [&>li+li]:mt-1',

  /** Integration rows: a coloured app-icon square, the name, the state. */
  integration: `${integration} grid-cols-[24px_minmax(0,1fr)_auto] max-sm:grid-cols-[24px_minmax(0,1fr)] max-sm:gap-y-1`,
  /** An integration row without the icon square. */
  integrationPlain: `${integration} grid-cols-[minmax(0,1fr)_auto]`,
  integrationIcon: 'grid size-6 place-items-center rounded-[6px] text-white',
  integrationName: 'min-w-0',
  /** Settings: an integration row that opens a page of its own. */
  linkRow: 'w-full cursor-pointer text-start hover:bg-quaternary',
  /** A row's own action, after its status (Connect, Disconnect). */
  inlineButton:
    'press ml-2 rounded-pill bg-quinary px-3 py-1 type-[600_11px/14px] text-primary shadow-[inset_0_1px_0_var(--tileRim),inset_0_0_0_1px_var(--tileHairline)] disabled:opacity-50',
  inlineLink: 'text-key',

  switch: [
    'relative h-[24px] w-[40px] flex-none cursor-pointer appearance-none rounded-full bg-quaternary shadow-[inset_0_1px_2px_rgb(0_0_0/0.18)] transition-[background-color] duration-200 checked:bg-green',
    'after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-[0_2px_6px_rgb(0_0_0/0.28)] after:transition-[translate] after:duration-200 checked:after:translate-x-4',
  ].join(' '),
  input: field,
};
