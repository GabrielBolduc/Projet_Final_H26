import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-stats-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule, 
    MatIconModule, 
    MatTabsModule
  ],
  templateUrl: './stats-layout.html',
  styleUrls: ['./stats-layout.css']
})
export class StatsLayoutComponent {
  public translate = inject(TranslateService);

  navLinks = [
    { path: 'festival', label: 'STATS_GLOBAL.FESTIVAL', icon: 'festival' },
    { path: 'hebergement', label: 'STATS_GLOBAL.HEBERGEMENT', icon: 'hotel' },
    { path: 'billetterie', label: 'STATS_GLOBAL.BILLETTERIE', icon: 'local_activity' },
    { path: 'tache', label: 'STATS_GLOBAL.TACHE', icon: 'assignment' }
  ];
}