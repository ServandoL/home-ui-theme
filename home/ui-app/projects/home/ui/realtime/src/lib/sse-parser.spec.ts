import { describe, expect, it } from 'vitest';
import { SseParser } from './sse-parser';

describe('SseParser', () => {
  it('reads Spring’s events and skips pings', () => {
    const parser = new SseParser();
    expect(parser.push('event:ready\ndata:{}\n\n:ping\n\nevent:change\ndata:{"resource":"pets"}\n\n')).toEqual([
      { event: 'ready', data: '{}' },
      { event: 'change', data: '{"resource":"pets"}' },
    ]);
  });

  it('waits for the rest of a message split across chunks', () => {
    const parser = new SseParser();
    expect(parser.push('event:cha')).toEqual([]);
    expect(parser.push('nge\ndata:{"a"')).toEqual([]);
    expect(parser.push(':1}\n')).toEqual([]);
    expect(parser.push('\n')).toEqual([{ event: 'change', data: '{"a":1}' }]);
  });

  it('handles CRLF, even split between chunks', () => {
    const parser = new SseParser();
    expect(parser.push('event: change\r')).toEqual([]);
    expect(parser.push('\ndata: x\r\n\r\n')).toEqual([{ event: 'change', data: 'x' }]);
  });

  it('joins data lines and defaults the event name', () => {
    expect(new SseParser().push('data:a\ndata:b\n\n')).toEqual([{ event: 'message', data: 'a\nb' }]);
  });

  it('ignores a blank line with no data', () => {
    expect(new SseParser().push('event:ready\n\n\n')).toEqual([]);
  });
});
