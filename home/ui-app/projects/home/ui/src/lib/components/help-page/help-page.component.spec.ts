import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHomeTheme } from '../../providers/provider';
import { HELP_NAV_ROUTE, HELP_ROUTE, HelpPageComponent } from './help-page.component';

@Component({ template: '' })
class Blank {}

async function render(help?: Parameters<typeof provideHomeTheme>[0]['help']) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: Blank }]),
      provideHomeTheme({ appName: 'Recipe book', routes: [], help }),
    ],
  });
  const fixture = TestBed.createComponent(HelpPageComponent);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('HelpPageComponent', () => {
  it('shows the summary, topics with their links, and folded questions', async () => {
    const page = await render({
      summary: 'Keep your recipes in one place.',
      topics: [
        { title: 'Add a recipe', text: 'Tap Create.', link: { label: 'Create a recipe', url: '/create' } },
        { title: 'Staples', text: 'Salt counts as in stock.' },
      ],
      questions: [{ question: 'Who can see my recipes?', answer: 'Your household.' }],
    });

    expect(page.querySelector('h1')?.textContent).toContain('Help');
    expect(page.textContent).toContain('Keep your recipes in one place.');
    expect([...page.querySelectorAll('h3')].map((h) => h.textContent?.trim())).toEqual(['Add a recipe', 'Staples']);
    expect(page.querySelector('a[href="/create"]')?.textContent).toContain('Create a recipe');
    const details = page.querySelector('details')!;
    expect(details.open).toBe(false);
    expect(details.querySelector('summary')?.textContent).toContain('Who can see my recipes?');
  });

  it('says when an app has no help yet, and still explains how the apps fit together', async () => {
    const page = await render();
    expect(page.textContent).toContain('Recipe book doesn’t have help written yet.');
    expect(page.textContent).toContain('one of the Home apps');
    expect(page.querySelector('h3')).toBeNull();
  });

  it('is served at /help with a nav item', () => {
    expect(HELP_ROUTE.path).toBe('help');
    expect(HELP_NAV_ROUTE).toEqual({ name: 'Help', url: '/help', icon: { name: 'heroQuestionMarkCircleSolid' } });
  });
});
