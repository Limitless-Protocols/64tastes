/* First history.length seen in this tab. A cold load reports 2 — the
   about:blank entry counts — so BackButton can't test "> 1": it would fire
   router.back() and leave the site. Only a length that has GROWN since the
   root layout mounted means an in-app navigation brought us here. */

let baseline: number | null = null;

/** Mounted once via <HistoryBaseline /> in the root layout. */
export function captureHistoryBaseline(): void {
  if (baseline === null) baseline = window.history.length;
}

/** True when in-app navigation pushed entries after the app mounted. */
export function canGoBackInApp(): boolean {
  return baseline !== null && window.history.length > baseline;
}
