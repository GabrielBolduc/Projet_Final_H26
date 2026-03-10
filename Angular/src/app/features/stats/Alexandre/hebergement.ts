import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-hebergement',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatTabsModule],
  templateUrl: './hebergement.html',
  styleUrls: ['./hebergement.css']
})
export class HebergementComponent {
  public translate = inject(TranslateService);

}