export const CONSENT_COOKIE = 'su_consent';
export const CONSENT_VERSION = '1';
export type Consent = { v: string; performance: boolean; thirdParty: boolean };

export function parseConsent(raw: string | undefined | null): Consent | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(decodeURIComponent(raw));
    if (c && c.v === CONSENT_VERSION) return { v: c.v, performance: !!c.performance, thirdParty: !!c.thirdParty };
  } catch {}
  return null;
}
