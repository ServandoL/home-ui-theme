import { signal } from '@angular/core';
import { Observable } from 'rxjs';

export abstract class BaseCrudService<T> {
  protected readonly base: string;

  protected constructor(baseUrl: string) {
    this.base = baseUrl;
  }

  protected readonly _data = signal<Array<T>>([]);
  protected readonly _loading = signal(false);
  protected readonly _error = signal<string | null>(null);

  readonly data = this._data.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  public abstract getData(): Observable<Array<T>>;

  public abstract create(data: Omit<T, 'id'>): Observable<T>;

  public abstract update(id: string, data: Omit<T, 'id'>): Observable<T>;

  public abstract delete(id: string): Observable<void>;
}
