import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import LegalPage from './LegalPage';
import { legalContent } from '@/content/legal';
import { renderWithProviders } from '@/test/utils';

describe('LegalPage', () => {
  it('shows the terms of use, with the prohibited content', () => {
    renderWithProviders(<LegalPage kind="terms" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Terms of use' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Prohibited content/ })).toBeInTheDocument();
    expect(screen.getByText(/Child sexual abuse material/)).toBeInTheDocument();
    expect(screen.getByText(/Human trafficking/)).toBeInTheDocument();
    expect(screen.getByText(/Firearms, ammunition/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the Privacy notice' })).toHaveAttribute('href', '/privacy');
  });

  it('shows the privacy notice, with the ARCO rights', () => {
    renderWithProviders(<LegalPage kind="privacy" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy notice' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Your rights \(ARCO\)/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Read the Terms of use' })).toHaveAttribute('href', '/terms');
  });

  it('has the same sections in both languages', () => {
    for (const kind of ['terms', 'privacy'] as const) {
      const es = legalContent(kind, 'es');
      const en = legalContent(kind, 'en');

      expect(es.sections).toHaveLength(en.sections.length);
      es.sections.forEach((s, i) => expect(s.items?.length).toBe(en.sections[i].items?.length));
    }
  });

  it('keeps the Spanish text for any other language', () => {
    expect(legalContent('terms', 'fr').title).toBe('Términos de uso');
    expect(legalContent('terms', undefined).title).toBe('Términos de uso');
  });
});
