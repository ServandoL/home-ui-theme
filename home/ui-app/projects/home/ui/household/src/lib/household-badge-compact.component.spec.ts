import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HouseholdBadgeCompactComponent } from './household-badge-compact.component';
import { HouseholdContext } from './household-context.service';
import { household } from './testing.spec-helpers';

describe('HouseholdBadgeCompactComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  async function render(count: number, variant: 'rail' | 'header') {
    const all = Array.from({ length: count }, (_, i) => household(`h${i + 1}`, i ? 'City flat' : 'Lake house'));
    const chooseAgain = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HouseholdContext,
          useValue: {
            current: signal(all[0]),
            households: signal(all),
            manageUrl: () => '/household',
            chooseAgain,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(HouseholdBadgeCompactComponent);
    fixture.componentRef.setInput('variant', variant);
    await fixture.whenStable();
    return { el: fixture.nativeElement as HTMLElement, chooseAgain };
  }

  it('names the household beside the app name in the collapsed header', async () => {
    const { el } = await render(1, 'header');

    expect(el.textContent?.replace(/\s+/g, ' ').trim()).toBe('Household: Lake house');
    expect(el.querySelector('a, button')).toBeNull();
  });

  it('links to the household in Home from the rail when there is one', async () => {
    const { el } = await render(1, 'rail');
    const link = el.querySelector('a')!;

    expect(link.getAttribute('href')).toBe('/household/h1');
    expect(link.getAttribute('aria-label')).toBe('Household: Lake house, manage in Home');
  });

  it('switches household from the rail when there are several', async () => {
    const { el, chooseAgain } = await render(2, 'rail');
    const button = el.querySelector('button')!;

    expect(button.getAttribute('aria-label')).toBe('Switch household, now Lake house');
    button.click();
    expect(chooseAgain).toHaveBeenCalled();
  });
});
