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
    { path: 'festival', label: 'STATS.FESTIVAL', icon: 'festival' },
    { path: 'hebergement', label: 'STATS.HEBERGEMENT', icon: 'hotel' },
    { path: 'billetterie', label: 'STATS.BILLETTERIE', icon: 'local_activity' },
    { path: 'tache', label: 'STATS.TACHE', icon: 'assignment' }
  ];
}