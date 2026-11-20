import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HouseholdContext } from './household-context.service';
import { HOUSEHOLD_CONFIG } from './household.config';
import { householdInterceptor } from './household.interceptor';
import { API, createStorageMock, household, me } from './testing.spec-helpers';

describe('householdInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;
  let context: HouseholdContext;

  beforeEach(async () => {
    vi.stubGlobal('localStorage', createStorageMock());
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([householdInterceptor])),
        provideHttpClientTesting(),
        { provide: HOUSEHOLD_CONFIG, useValue: { appId: 'budget', apiUrl: API, homeUrl: '/' } },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
    context = TestBed.inject(HouseholdContext);
    context.reloadPage = vi.fn();

    const loading = context.ensureLoaded();
    http.expectOne(`${API}/me`).flush(me([household('a')]));
    await loading;
  });

  afterEach(() => {
    http.verify();
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('sends the household to the app’s own API', () => {
    void firstValueFrom(client.get('/budget-api/api/v1/bills'));
    expect(http.expectOne('/budget-api/api/v1/bills').request.headers.get('X-Household-Id')).toBe('a');

    void firstValueFrom(client.get('api/v1/relative'));
    expect(http.expectOne('api/v1/relative').request.headers.get('X-Household-Id')).toBe('a');
  });

  it('never sends it to household-api or another site', () => {
    void firstValueFrom(client.get(`${API}/households/a`));
    expect(http.expectOne(`${API}/households/a`).request.headers.has('X-Household-Id')).toBe(false);

    for (const url of ['https://example.com/api', '//example.com/api', 'HTTP://example.com/api']) {
      void firstValueFrom(client.get(url));
      expect(http.expectOne(url).request.headers.has('X-Household-Id')).toBe(false);
    }
  });

  it('asks again when the API says the household is not the person’s', async () => {
    const forget = vi.spyOn(context, 'forget').mockResolvedValue();
    const request = firstValueFrom(client.get('/budget-api/api/v1/bills'));
    http
      .expectOne('/budget-api/api/v1/bills')
      .flush({ error: { code: 'NOT_A_MEMBER', message: 'no' } }, { status: 403, statusText: 'Forbidden' });

    await expect(request).rejects.toMatchObject({ status: 403 });
    expect(forget).toHaveBeenCalledOnce();
  });

  it('asks again when the API needs a household', async () => {
    const forget = vi.spyOn(context, 'forget').mockResolvedValue();
    const request = firstValueFrom(client.get('/budget-api/api/v1/bills'));
    http
      .expectOne('/budget-api/api/v1/bills')
      .flush({ error: { code: 'HOUSEHOLD_REQUIRED', message: 'no' } }, { status: 428, statusText: 'Precondition Required' });

    await expect(request).rejects.toMatchObject({ status: 428 });
    expect(forget).toHaveBeenCalledOnce();
  });

  it('leaves the app’s other 403s alone', async () => {
    const forget = vi.spyOn(context, 'forget').mockResolvedValue();
    const request = firstValueFrom(client.get('/budget-api/api/v1/bills'));
    http
      .expectOne('/budget-api/api/v1/bills')
      .flush({ error: { code: 'FORBIDDEN', message: 'admins only' } }, { status: 403, statusText: 'Forbidden' });

    await expect(request).rejects.toMatchObject({ status: 403 });
    expect(forget).not.toHaveBeenCalled();
  });
});
