/**
 * What an app's Help page says, passed to provideHomeTheme({ help }). Plain text only: the page
 * lays it out and themes it the same way in every app.
 */
export interface HelpContent {
  /** One or two sentences: what the app is for. */
  summary: string;
  /** The things people do in the app, each with a short how-to. */
  topics: HelpTopic[];
  /** Common questions, shown folded. */
  questions?: HelpQuestion[];
}

export interface HelpTopic {
  title: string;
  text: string;
  /** A page in the app to go to, such as { label: 'Open Pantry', url: '/pantry' }. */
  link?: { label: string; url: string };
}

export interface HelpQuestion {
  question: string;
  answer: string;
}
