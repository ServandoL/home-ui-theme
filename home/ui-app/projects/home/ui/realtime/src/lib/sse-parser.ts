/** One `text/event-stream` message: its `event:` name (default `message`) and joined `data:` lines. */
export interface SseMessage {
  event: string;
  data: string;
}

/**
 * Turns chunks of a `text/event-stream` body into messages. Chunks can split anywhere, even
 * inside a line, so the unfinished tail waits for the next chunk. Comments (`: ping`) and
 * fields other than `event` and `data` are dropped.
 */
export class SseParser {
  private buffer = '';
  private event = '';
  private data: string[] = [];

  push(chunk: string): SseMessage[] {
    let text = this.buffer + chunk;
    // A trailing \r may be the first half of \r\n, so it waits with the tail.
    const held = text.endsWith('\r') ? '\r' : '';
    if (held) text = text.slice(0, -1);
    const lines = text.split(/\r\n|\r|\n/);
    this.buffer = (lines.pop() ?? '') + held;
    const messages: SseMessage[] = [];
    for (const line of lines) {
      if (line === '') {
        if (this.data.length > 0) messages.push({ event: this.event || 'message', data: this.data.join('\n') });
        this.event = '';
        this.data = [];
        continue;
      }
      if (line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') this.event = value;
      else if (field === 'data') this.data.push(value);
    }
    return messages;
  }
}
