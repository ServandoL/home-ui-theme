import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdContext } from './household-context.service';
import { HouseholdGateComponent } from './household-gate.component';
import { HOUSEHOLD_CONFIG } from './household.config';
import { SessionService } from './session';
import { API, createStorageMock, household, me } from './testing.spec-helpers';

let created = 0;

@Component({ selector: 'app-test-content', template: '<p id="app">App content</p>' })
class TestContent {
  constructor() {
    created++;
  }
}

@Component({
  imports: [HouseholdGateComponent, TestContent],
  template: `
    <app-household-gate>
      <ng-template><app-test-content /></ng-template>
    </app-household-gate>
  `,
})
class Host {}

describe('HouseholdGateComponent', () => {
  let fixture: ComponentFixture<Host>;
  let http: HttpTestingController;
  let context: HouseholdContext;

  beforeEach(() => {
    created = 0;
    vi.stubGlobal('localStorage', createStorageMock());
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HOUSEHOLD_CONFIG, useValue: { appId: 'budget', apiUrl: API, homeUrl: '/' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    context = TestBed.inject(HouseholdContext);
    context.reloadPage = vi.fn();
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  async function render(body: ReturnType<typeof me>, navigate = vi.fn()): Promise<HTMLElement> {
    fixture = TestBed.createComponent(Host);
    const gate = fixture.debugElement.children[0].componentInstance as HouseholdGateComponent;
    gate.navigate = navigate;
    fixture.detectChanges();
    http.expectOne(`${API}/me`).flush(body);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('does not create the app while loading', () => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading your households');
    expect(created).toBe(0);
    http.expectOne(`${API}/me`).flush(me([household('a')]));
  });

  it('renders the app once a household is chosen', async () => {
    const page = await render(me([household('a')]));
    expect(page.querySelector('#app')).not.toBeNull();
    expect(created).toBe(1);
  });

  it('shows the picker, not the app, when there are several households', async () => {
    const page = await render(me([household('a', 'Lake house', 'ADMIN'), household('b', 'City flat')]));
    expect(created).toBe(0);
    expect(page.querySelector('h1')?.textContent).toContain('Choose a household');
    expect(page.textContent).toContain('Lake house');
    expect(page.textContent).toContain('Admin');

    const buttons = Array.from(page.querySelectorAll('li button')) as HTMLButtonElement[];
    buttons[1].click();
    fixture.detectChanges();

    expect(page.querySelector('#app')).not.toBeNull();
    expect(context.currentId()).toBe('b');
  });

  it('sends someone with no household to Home’s welcome page', async () => {
    const navigate = vi.fn();
    const page = await render(me([]), navigate);
    expect(navigate).toHaveBeenCalledWith(expect.stringMatching(/^\/household\/welcome\?returnUrl=/));
    expect(page.textContent).toContain('Taking you to set up a household');
    expect(created).toBe(0);
  });

  it('mentions waiting invitations in the picker', async () => {
    const invite = {
      householdId: 'c',
      householdName: 'Beach house',
      address: null,
      role: 'MEMBER' as const,
      invitedBy: 'kim@example.com',
      invitedAt: '2026-11-20T18:00:00.000Z',
      expiresAt: '2026-11-27T18:00:00.000Z',
    };
    const page = await render(me([household('a'), household('b')], [invite]));
    expect(page.textContent).toContain('You have 1 invitation waiting.');
  });

  it('offers a retry when /me fails', async () => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    http.expectOne(`${API}/me`).flush({}, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Couldn’t load your households.');

    (page.querySelector('button') as HTMLButtonElement).click();
    http.expectOne(`${API}/me`).flush(me([household('a')]));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(page.querySelector('#app')).not.toBeNull();
  });

  it('shows the signed-out banner', async () => {
    const page = await render(me([household('a')]));
    TestBed.inject(SessionService).markExpired();
    fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('You’ve been signed out.');
  });
});
