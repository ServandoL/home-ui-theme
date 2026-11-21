import { Component, inject } from '@angular/core';
import { Route, RouterLink } from '@angular/router';
import { NavigationRoutes } from '../../models/routes.model';
import { HOME_THEME_TOKEN } from '../../providers/provider';

/**
 * How to use the app, from the `help` passed to provideHomeTheme, and how it fits with the other
 * home apps. Without `help` it says the app has no help yet.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-help-page',
  template: `
    <div class="px-4 py-6 max-w-3xl mx-auto flex flex-col gap-6">
      <header class="flex flex-col gap-2">
        <h1 class="text-2xl font-bold app-text">Help</h1>
        @if (help) {
          <p class="app-text-muted">{{ help.summary }}</p>
        } @else {
          <p class="app-text-muted">{{ appName }} doesn’t have help written yet.</p>
        }
      </header>

      @if (help?.topics?.length) {
        <section class="flex flex-col gap-3" aria-labelledby="help-topics">
          <h2 id="help-topics" class="text-lg font-semibold app-text">How to</h2>
          <ul class="flex flex-col gap-3">
            @for (topic of help!.topics; track topic.title) {
              <li class="app-card rounded-xl p-4 flex flex-col gap-1.5">
                <h3 class="font-semibold app-text">{{ topic.title }}</h3>
                <p class="text-sm app-text-muted">{{ topic.text }}</p>
                @if (topic.link) {
                  <a class="app-link text-sm font-medium self-start" [routerLink]="topic.link.url">{{ topic.link.label }}</a>
                }
              </li>
            }
          </ul>
        </section>
      }

      @if (help?.questions?.length) {
        <section class="flex flex-col gap-3" aria-labelledby="help-questions">
          <h2 id="help-questions" class="text-lg font-semibold app-text">Questions</h2>
          <div class="app-card app-divide rounded-xl divide-y overflow-hidden">
            @for (q of help!.questions; track q.question) {
              <details class="group px-4 py-3">
                <summary class="cursor-pointer font-medium app-text">{{ q.question }}</summary>
                <p class="mt-2 text-sm app-text-muted">{{ q.answer }}</p>
              </details>
            }
          </div>
        </section>
      }

      <section class="flex flex-col gap-2" aria-labelledby="help-about">
        <h2 id="help-about" class="text-lg font-semibold app-text">About</h2>
        <p class="text-sm app-text-muted">
          {{ appName }} is one of the Home apps. They share your sign-in and your households: create a
          household and invite people to it in Home, and everyone in it sees the same data here.
          Appearance and layout are in Settings.
        </p>
        <a class="app-link text-sm font-medium self-start" href="/">Open Home</a>
      </section>
    </div>
  `,
})
export class HelpPageComponent {
  private config = inject(HOME_THEME_TOKEN);
  protected readonly appName = this.config.appName;
  protected readonly help = this.config.help;
}

/** Add to the app's routes, under the shell, to serve HelpPageComponent at /help. */
export const HELP_ROUTE: Route = { path: 'help', title: 'Help', component: HelpPageComponent };

/** The nav item for HELP_ROUTE; provideHomeTheme registers its icon. */
export const HELP_NAV_ROUTE: NavigationRoutes = {
  name: 'Help',
  url: '/help',
  icon: { name: 'heroQuestionMarkCircleSolid' },
};
