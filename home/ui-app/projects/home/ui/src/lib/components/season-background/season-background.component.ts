// season-background.component.ts
import {Component, computed, inject, input} from '@angular/core';
import {NgIcon} from '@ng-icons/core';
import {Season, SeasonIconService} from '../../services/season-icon.service';

@Component({
  selector: 'app-season-background',
  standalone: true,
  templateUrl: './season-background.component.html',
  imports: [
    NgIcon
  ],
  styleUrls: ['./season-background.component.css']
})
export class SeasonBackgroundComponent {
  private seasonIcons = inject(SeasonIconService);
  season = input.required<Season>();
  count = input<number>(10);
  currentSeason = computed(() => this.seasonIcons.getIcons(this.season()))
  icons = computed(() => Array.from({length: this.count()}).map(() => {
    const currentSeason = this.currentSeason();
    const icon = currentSeason[Math.floor(Math.random() * currentSeason.length)];
    return {
      icon,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotate: `rotate(${Math.random() * 360}deg)`,
      scale: `scale(${0.6 + Math.random() * 0.8})`
    };
  }))
}
