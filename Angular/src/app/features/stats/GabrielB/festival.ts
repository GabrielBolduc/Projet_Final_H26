import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-festival',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatTabsModule],
  templateUrl: './festival.html',
  styleUrls: ['./festival.css']
})
export class FestivalComponent {
  public translate = inject(TranslateService);

}