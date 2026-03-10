import { Component, inject, computed, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';

import { TicketingStatsService } from '@core/services/ticketing-stats.service';

@Component({
  selector: 'app-billetterie',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatTabsModule,
    MatFormFieldModule, MatSelectModule, MatGridListModule],
  templateUrl: './billetterie.html',
  styleUrls: ['./billetterie.css']
})
export class BilletterieComponent {
  public translate = inject(TranslateService);
  private ticketingStatsService = inject(TicketingStatsService);

  statsResource = resource({
    loader: () => firstValueFrom(this.ticketingStatsService.getStats())
  });

  stats = computed(() => this.statsResource.value() ?? []);

  tiles = [
    {text: 'TICKETING_STATS.FESTIVAL', cols: 1, rows: 1},
    {text: 'TICKETING_STATS.TOTAL_TICKETS', cols: 1, rows: 1},
    {text: 'TICKETING_STATS.EXPENSES', cols: 1, rows: 1},
    {text: 'TICKETING_STATS.REVENUES', cols: 1, rows: 1},
    {text: 'TICKETING_STATS.PROFIT', cols: 1, rows: 1},
    {text: 'TICKETING_STATS.AVG_TICKETS', cols: 1, rows: 1},
    {text: 'TICKETING_STATS.REFUNDS', cols: 1, rows: 1}
  ];
}