import { signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @typeParam T - Record shape returned by the server.
 * @typeParam TCreate - Payload accepted by `create`. Defaults to `T` minus `id`;
 *   narrow it when the server sets fields such as `createdAt`/`createdBy`.
 * @typeParam TUpdate - Payload accepted by `update`. Defaults to `TCreate`.
 */
export abstract class BaseCrudService<T, TCreate = Omit<T, 'id'>, TUpdate = TCreate> {
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

  public abstract create(data: TCreate): Observable<T>;

  public abstract update(id: string, data: TUpdate): Observable<T>;

  public abstract delete(id: string): Observable<void>;
}
