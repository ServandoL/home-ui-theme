import { Component, computed, inject, input } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { SEASONAL_LOOKS, SeasonalLook } from './seasonal-looks';
import { SeasonalThemeService } from './seasonal-theme.service';

interface Particle {
  shape: string;
  color: string;
  style: string;
  motion: string;
}

/**
 * The decorations for the seasonal look: falling leaves, snow, hearts and so on, behind the page.
 * The shell draws them in every app: a light layer, or the full one while a page asks for it with
 * `SeasonalThemeService.fullDecorations` (Home does). Nothing shows while the look is off. They
 * hold still under reduced motion.
 */
@Component({
  selector: 'app-seasonal-background',
  host: { 'aria-hidden': 'true', '[class.soft]': "intensity() === 'soft'" },
  styles: `
    /* Fills the nearest positioned ancestor (the shell's frame, or Home's page) rather than the
       screen: Safari tints its toolbars from elements fixed at the screen's edges. */
    :host {
      position: absolute;
      inset: 0;
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
    }
    .p { position: absolute; display: block; }
    .p > svg { width: 100%; height: 100%; display: block; overflow: visible; }
    @keyframes fall { from { top: -8%; } to { top: 106%; } }
    @keyframes rise { from { top: 106%; } to { top: -10%; } }
    @keyframes sway {
      0%, 100% { translate: -10px 0; rotate: -12deg; }
      50% { translate: 10px 0; rotate: 14deg; }
    }
    @keyframes twinkle { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
    @keyframes burst {
      0% { transform: scale(0.2); opacity: 0; }
      15% { opacity: 1; }
      60% { transform: scale(1); opacity: 0.9; }
      100% { transform: scale(1.15); opacity: 0; }
    }
    .m-fall { animation: fall linear infinite; }
    .m-rise { animation: rise linear infinite; }
    .m-fall > svg, .m-rise > svg, .m-drift > svg { animation: sway ease-in-out infinite; animation-duration: inherit; }
    .m-twinkle { animation: twinkle ease-in-out infinite; }
    .m-burst { animation: burst ease-out infinite; }
    .bulb { border-radius: 50% 50% 45% 45%; }
    :host(.soft) { opacity: 0.45; }
    @media (prefers-reduced-motion: reduce) {
      .p, .p > svg { animation: none !important; }
    }
  `,
  template: `
    @if (look()) {
      <svg width="0" height="0" style="position: absolute">
        <defs>
          <symbol id="hs-leaf" viewBox="0 0 24 24"><path d="M4 20C4 10 10 4 21 3c-1 11-7 17-17 17z" fill="currentColor"/><path d="M4 20 15 9" stroke="rgba(0,0,0,.25)" stroke-width="1.3" fill="none"/></symbol>
          <symbol id="hs-maple" viewBox="0 0 24 24"><path d="M12 2l2 4 3-1-1 4 4 1-3 3 2 3-5-1-1 4h-2l-1-4-5 1 2-3-3-3 4-1-1-4 3 1z" fill="currentColor"/><path d="M12 13v9" stroke="currentColor" stroke-width="1.4"/></symbol>
          <symbol id="hs-acorn" viewBox="0 0 24 24"><path d="M5 10c0-3 3-5 7-5s7 2 7 5z" fill="currentColor" opacity=".75"/><path d="M6 10h12c0 6-3 10-6 11-3-1-6-5-6-11z" fill="currentColor"/><path d="M12 5V2" stroke="currentColor" stroke-width="1.6"/></symbol>
          <symbol id="hs-snow" viewBox="0 0 24 24"><g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5M3.5 10.2l3.4-.9-.9-3.4M20.5 13.8l-3.4.9.9 3.4M3.5 13.8l3.4.9-.9 3.4M20.5 10.2l-3.4-.9.9-3.4"/></g></symbol>
          <symbol id="hs-dot" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" fill="currentColor"/></symbol>
          <symbol id="hs-blossom" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="6" r="4"/><circle cx="17.7" cy="10.2" r="4"/><circle cx="15.5" cy="17" r="4"/><circle cx="8.5" cy="17" r="4"/><circle cx="6.3" cy="10.2" r="4"/></g><circle cx="12" cy="12" r="2.6" fill="#fde68a"/></symbol>
          <symbol id="hs-petal" viewBox="0 0 24 24"><path d="M12 3c5 4 6 11 0 18-6-7-5-14 0-18z" fill="currentColor"/></symbol>
          <symbol id="hs-tulip" viewBox="0 0 24 24"><path d="M12 22V12" stroke="#4d9b5a" stroke-width="1.8"/><path d="M12 17c-3-3-6-2-7-1 2 1 5 2 7 1z" fill="#4d9b5a"/><path d="M6 4l3 3 3-4 3 4 3-3c1 5-1 9-6 9S5 9 6 4z" fill="currentColor"/></symbol>
          <symbol id="hs-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></symbol>
          <symbol id="hs-wave" viewBox="0 0 24 24"><path d="M1 13c3-4 5-4 7 0s5 4 7 0 5-4 8 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
          <symbol id="hs-ball" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 2a10 10 0 0 1 9 6c-4-2-7-2-9 4-2-6-5-6-9-4a10 10 0 0 1 9-6z" fill="currentColor"/><path d="M3 16c3 0 6-1 9-4 3 3 6 4 9 4a10 10 0 0 1-18 0z" fill="#38bdf8"/><circle cx="12" cy="12" r="10" fill="none" stroke="rgba(0,0,0,.15)"/></symbol>
          <symbol id="hs-star" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z" fill="currentColor"/></symbol>
          <symbol id="hs-sparkle" viewBox="0 0 24 24"><path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z" fill="currentColor"/></symbol>
          <symbol id="hs-confetti" viewBox="0 0 24 24"><rect x="8" y="3" width="8" height="18" rx="1.5" fill="currentColor"/></symbol>
          <symbol id="hs-heart" viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.7-9.3C.6 8 3 4 7 4c2.2 0 3.8 1.2 5 3 1.2-1.8 2.8-3 5-3 4 0 6.4 4 4.7 7.7C19.5 16.4 12 21 12 21z" fill="currentColor"/></symbol>
          <symbol id="hs-shamrock" viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="6.5" r="4.5"/><circle cx="6.8" cy="12.5" r="4.5"/><circle cx="17.2" cy="12.5" r="4.5"/></g><path d="M12 12c0 4 1 7 3 10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></symbol>
          <symbol id="hs-coin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="currentColor"/><circle cx="12" cy="12" r="6" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="1.5"/></symbol>
          <symbol id="hs-egg" viewBox="0 0 24 24"><path d="M12 2C7.5 2 4.5 9 4.5 14a7.5 7.5 0 0 0 15 0C19.5 9 16.5 2 12 2z" fill="currentColor"/><path d="M5 12l3 2 4-2 4 2 3-2" fill="none" stroke="#fff" stroke-width="1.6" opacity=".85"/><path d="M5.5 16.5l3-1.5 3.5 1.5 3.5-1.5 3 1.5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/></symbol>
          <symbol id="hs-bat" viewBox="0 0 24 24"><path d="M1 8c2 0 3.5 1.5 4 3.5C6 10 8 10 9 11.2L10.5 8l1.5 2 1.5-2 1.5 3.2c1-1.2 3-1.2 4 .3.5-2 2-3.5 4-3.5-1 3.5-3 7-6.5 7.5-1-.8-2.4-.8-3.5.5-1.1-1.3-2.5-1.3-3.5-.5C4 15 2 11.5 1 8z" fill="currentColor"/></symbol>
          <symbol id="hs-pumpkin" viewBox="0 0 24 24"><path d="M12 6c-1-2 0-4 2-4" stroke="#4d7c3a" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="7.5" cy="14" rx="5" ry="7" fill="currentColor"/><ellipse cx="16.5" cy="14" rx="5" ry="7" fill="currentColor"/><ellipse cx="12" cy="14" rx="4.5" ry="7.5" fill="currentColor"/><path d="M12 7c-1.5 2-1.5 12 0 14M12 7c1.5 2 1.5 12 0 14" stroke="rgba(0,0,0,.18)" stroke-width="1.2" fill="none"/></symbol>
          <symbol id="hs-wheat" viewBox="0 0 24 24"><path d="M12 23V6" stroke="currentColor" stroke-width="1.6"/><g fill="currentColor"><ellipse cx="12" cy="4" rx="1.8" ry="3"/><ellipse cx="9.3" cy="8" rx="1.6" ry="2.8" transform="rotate(-30 9.3 8)"/><ellipse cx="14.7" cy="8" rx="1.6" ry="2.8" transform="rotate(30 14.7 8)"/><ellipse cx="9.3" cy="12.5" rx="1.6" ry="2.8" transform="rotate(-30 9.3 12.5)"/><ellipse cx="14.7" cy="12.5" rx="1.6" ry="2.8" transform="rotate(30 14.7 12.5)"/><ellipse cx="9.3" cy="17" rx="1.6" ry="2.8" transform="rotate(-30 9.3 17)"/><ellipse cx="14.7" cy="17" rx="1.6" ry="2.8" transform="rotate(30 14.7 17)"/></g></symbol>
          <symbol id="hs-ornament" viewBox="0 0 24 24"><rect x="9.5" y="2" width="5" height="4" rx="1" fill="#cbd5e1"/><circle cx="12" cy="14" r="8" fill="currentColor"/><path d="M5 12c4 2 10 2 14 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".7"/><circle cx="9" cy="11" r="1.6" fill="#fff" opacity=".6"/></symbol>
          <symbol id="hs-tree" viewBox="0 0 24 24"><path d="M12 1l5 7h-2.5l4.5 6h-3l4 6H4l4-6H5l4.5-6H7z" fill="currentColor"/><rect x="10.5" y="20" width="3" height="3" fill="#92400e"/></symbol>
          <symbol id="hs-moon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><circle cx="8" cy="9" r="1.6" fill="rgba(0,0,0,.08)"/><circle cx="15" cy="15" r="2.4" fill="rgba(0,0,0,.08)"/></symbol>
          <symbol id="hs-firework" viewBox="0 0 48 48"><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M24 4v10M24 34v10M4 24h10M34 24h10M9.9 9.9l7 7M31.1 31.1l7 7M9.9 38.1l7-7M31.1 16.9l7-7"/></g><g fill="currentColor"><circle cx="24" cy="2.5" r="1.8"/><circle cx="24" cy="45.5" r="1.8"/><circle cx="2.5" cy="24" r="1.8"/><circle cx="45.5" cy="24" r="1.8"/><circle cx="8.5" cy="8.5" r="1.6"/><circle cx="39.5" cy="39.5" r="1.6"/><circle cx="8.5" cy="39.5" r="1.6"/><circle cx="39.5" cy="8.5" r="1.6"/></g></symbol>
        </defs>
      </svg>

      @if (extras().moon; as moon) {
        <span class="p" [style]="moon"><svg><use href="#hs-moon"/></svg></span>
      }
      @for (burst of extras().fireworks; track $index) {
        <span class="p m-burst" [style]="burst"><svg viewBox="0 0 48 48"><use href="#hs-firework"/></svg></span>
      }
      @for (p of particles(); track $index) {
        <span class="p" [class]="p.motion" [style]="p.style">
          <svg viewBox="0 0 24 24" [style.color]="p.color"><use [attr.href]="'#hs-' + p.shape"/></svg>
        </span>
      }
      @if (extras().lights.length) {
        <svg class="p" viewBox="0 0 100 40" preserveAspectRatio="none" style="left: 0; top: 0; width: 100%; height: 48px">
          <path [attr.d]="garland" fill="none" stroke="currentColor" stroke-width=".5" vector-effect="non-scaling-stroke" class="app-text-subtle"/>
        </svg>
        @for (bulb of extras().lights; track $index) {
          <span class="p bulb m-twinkle" [style]="bulb"></span>
        }
      }
    }
  `,
})
export class SeasonalBackgroundComponent {
  private readonly seasonal = inject(SeasonalThemeService);
  private readonly theme = inject(ThemeService);

  /** `soft` for behind an app's pages, `full` for Home. */
  readonly intensity = input<'soft' | 'full'>('full');
  /** Shows this look instead of the person's, for previews. */
  readonly preview = input<SeasonalLook | null>(null);

  protected readonly look = computed(() => this.preview() ?? this.seasonal.look());

  private static readonly BULBS = 16;
  protected readonly garland = (() => {
    let d = 'M0 8 ';
    for (let i = 1; i <= SeasonalBackgroundComponent.BULBS; i++) {
      const x = (i / SeasonalBackgroundComponent.BULBS) * 100;
      d += `Q${(x - 50 / SeasonalBackgroundComponent.BULBS).toFixed(2)} 26 ${x.toFixed(2)} 8 `;
    }
    return d;
  })();

  protected readonly particles = computed<Particle[]>(() => {
    const look = this.look();
    if (!look) return [];
    const { decor } = SEASONAL_LOOKS[look];
    const dark = this.theme.mode() !== 'light';
    const colors = dark && decor.darkColors ? decor.darkColors : decor.colors;
    const random = seeded(look);
    const count = this.intensity() === 'soft' ? Math.round(decor.count * 0.6) : decor.count;
    return Array.from({ length: count }, () => {
      const size = decor.size[0] + random() * (decor.size[1] - decor.size[0]);
      const duration = decor.speed[0] + random() * (decor.speed[1] - decor.speed[0]);
      const shape = decor.shapes[Math.floor(random() * decor.shapes.length)];
      const color = colors[Math.floor(random() * colors.length)];
      const style =
        `left: ${(random() * 100).toFixed(1)}%; top: ${(random() * 100).toFixed(1)}%; ` +
        `width: ${size.toFixed(0)}px; height: ${size.toFixed(0)}px; ` +
        `opacity: ${(decor.opacity * (0.55 + random() * 0.45)).toFixed(2)}; rotate: ${Math.floor(random() * 360)}deg; ` +
        `animation-duration: ${duration.toFixed(1)}s; animation-delay: -${(random() * duration).toFixed(1)}s`;
      return { shape, color, style, motion: `p m-${decor.motion}` };
    });
  });

  protected readonly extras = computed(() => {
    const look = this.look();
    const none = { moon: null as string | null, fireworks: [] as string[], lights: [] as string[] };
    if (!look) return none;
    const info = SEASONAL_LOOKS[look];
    const dark = this.theme.mode() !== 'light';
    const random = seeded(look + ':extras');
    const moon = info.moon
      ? `right: 7%; top: 7%; width: 86px; height: 86px; opacity: .9; color: ${dark ? '#fef3c7' : '#fdba74'}; ` +
        `filter: drop-shadow(0 0 24px ${dark ? 'rgba(254,243,199,.55)' : 'rgba(251,146,60,.5)'})`
      : null;
    const fireworks = (info.fireworks ?? []).length
      ? Array.from({ length: 6 }, (_, i) => {
          const size = 60 + random() * 70;
          const duration = 2.6 + random() * 2;
          return (
            `left: ${(4 + random() * 86).toFixed(1)}%; top: ${(2 + random() * 40).toFixed(1)}%; ` +
            `width: ${size.toFixed(0)}px; height: ${size.toFixed(0)}px; opacity: .75; ` +
            `color: ${info.fireworks![i % info.fireworks!.length]}; ` +
            `animation-duration: ${duration.toFixed(1)}s; animation-delay: -${(random() * 4).toFixed(2)}s`
          );
        })
      : [];
    const colors = ['#ef4444', '#facc15', '#22c55e', '#3b82f6', '#f472b6'];
    const bulbs = SeasonalBackgroundComponent.BULBS;
    const lights = info.lights
      ? Array.from({ length: bulbs }, (_, i) => {
          const color = colors[i % colors.length];
          return (
            `left: calc(${(((i + 0.5) / bulbs) * 100).toFixed(2)}% - 5px); top: 18px; width: 10px; height: 14px; ` +
            `background: ${color}; box-shadow: 0 0 12px 2px ${color}; ` +
            `animation-duration: ${1.6 + (i % 4) * 0.5}s; animation-delay: ${(i * 0.23).toFixed(2)}s`
          );
        })
      : [];
    return { moon, fireworks, lights };
  });
}

/** A repeatable random sequence, so a look's decorations sit in the same places every visit. */
function seeded(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
