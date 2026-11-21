import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ConfirmDeleteActionsComponent } from './confirm-delete-actions.component';

describe('ConfirmDeleteActionsComponent', () => {
  it('lays out its own host as a flex row', () => {
    const fixture = TestBed.createComponent(ConfirmDeleteActionsComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.classList).toContain('flex');
    expect(host.classList).toContain('items-center');
    expect(host.classList).toContain('gap-2');
  });
});
