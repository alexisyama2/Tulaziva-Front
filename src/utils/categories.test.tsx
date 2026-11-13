import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { categoryIcon } from './categories';

const iconName = (key: string) => {
  const { container } = render(categoryIcon(key));
  return container.querySelector('svg')?.getAttribute('data-testid');
};

describe('categoryIcon', () => {
  it('picks an icon by keyword of the API key', () => {
    expect(iconName('vehicles')).toBe('DirectionsCarRoundedIcon');
    expect(iconName('realEstate')).toBe('HomeRoundedIcon');
    expect(iconName('electronics')).toBe('PhoneIphoneRoundedIcon');
    expect(iconName('pets')).toBe('PetsRoundedIcon');
    expect(iconName('services')).toBe('HandymanRoundedIcon');
    expect(iconName('personalServices')).toBe('SpaRoundedIcon');
  });

  it('falls back to a generic icon for unknown categories', () => {
    expect(iconName('something-new')).toBe('CategoryRoundedIcon');
  });
});
