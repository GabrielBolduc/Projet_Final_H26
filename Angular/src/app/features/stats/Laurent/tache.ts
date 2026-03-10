import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-tache',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatTabsModule],
  templateUrl: './tache.html',
  styleUrls: ['./tache.css']
})
export class TacheComponent {
  public translate = inject(TranslateService);

}