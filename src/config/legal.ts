/**
 * Data of the legal texts (src/content/legal.ts). Fill in the placeholders in brackets before going live.
 *
 * `termsVersion` is the version the API stores when someone signs up (Tulaziva.Application LegalRules.TermsVersion). When the texts
 * change in a way people must accept again, change it here and there.
 */
export const LEGAL = {
  termsVersion: '2026-11-13',
  /** Name of the person or company that runs the service (the "responsable" of the personal data). */
  company: 'Tulaziva',
  /** Where people send their requests about their personal data (access, correction, deletion, objection). */
  contactEmail: 'privacidad@tulaziva.com',
  /** Address of the responsable, required by the Mexican privacy notice. */
  address: '[Domicilio del responsable / Address of the controller]',
  /** Courts that settle the disputes. */
  jurisdiction: '[ciudad y estado / city and state]',
};
