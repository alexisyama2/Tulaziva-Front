import i18n from '@/i18n';

/** The API sends UTC timestamps without a "Z" suffix; without it JavaScript would read them as local time. */
export function parseUtc(iso: string): Date {
  return new Date(/(Z|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`);
}

const locale = () => ((i18n.resolvedLanguage || 'es').startsWith('en') ? 'en-US' : 'es-MX');

export function formatPrice(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale(), {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'medium' }).format(parseUtc(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(parseUtc(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(locale(), { dateStyle: 'short', timeStyle: 'short' }).format(parseUtc(iso));
}

/** "hace 3 horas" / "3 hours ago". The API sends UTC timestamps. */
export function timeAgo(iso: string): string {
  const diffSec = Math.round((parseUtc(iso).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSec) >= seconds) return rtf.format(Math.round(diffSec / seconds), unit);
  }
  return rtf.format(diffSec, 'second');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function isExpired(iso: string): boolean {
  return parseUtc(iso).getTime() < Date.now();
}

/** An ad is featured while the end of its featuring is still in the future. */
export function isFeatured(featuredUntilUtc: string | null | undefined): boolean {
  return !!featuredUntilUtc && parseUtc(featuredUntilUtc).getTime() > Date.now();
}
