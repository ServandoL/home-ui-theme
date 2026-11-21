import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CLIENT_ID, clientIdInterceptor } from './client-id';
import { provideRealtime } from './realtime.config';

describe('clientIdInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([clientIdInterceptor])),
        provideHttpClientTesting(),
        provideRealtime({ apiUrl: '/pet-qol-api' }),
        { provide: CLIENT_ID, useValue: 'tab-1' },
      ],
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    TestBed.resetTestingModule();
  });

  it('names this tab on writes to the app’s API', () => {
    void firstValueFrom(client.post('/pet-qol-api/api/v1/pets', {}));
    void firstValueFrom(client.put(`${location.origin}/pet-qol-api/api/v1/settings`, {}));
    void firstValueFrom(client.delete('/pet-qol-api/api/v1/pets/1'));
    for (const request of http.match(() => true)) {
      expect(request.request.headers.get('X-Client-Id')).toBe('tab-1');
      request.flush(null);
    }
  });

  it('leaves reads, other APIs and other sites alone', () => {
    void firstValueFrom(client.get('/pet-qol-api/api/v1/pets'));
    void firstValueFrom(client.post('/household-api/api/v1/households', {}));
    void firstValueFrom(client.post('https://example.com/pet-qol-api/x', {}));
    for (const request of http.match(() => true)) {
      expect(request.request.headers.has('X-Client-Id')).toBe(false);
      request.flush(null);
    }
  });

  it('gives each page load its own id', () => {
    TestBed.resetTestingModule();
    const first = TestBed.inject(CLIENT_ID);
    TestBed.resetTestingModule();
    expect(TestBed.inject(CLIENT_ID)).not.toBe(first);
  });
});
