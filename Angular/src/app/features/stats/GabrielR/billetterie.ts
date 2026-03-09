import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-billetterie',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatTabsModule],
  templateUrl: './billetterie.html',
  styleUrls: ['./billetterie.css']
})
export class BilletterieComponent {
  public translate = inject(TranslateService);

}