import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu'; 
import { AuthService } from '@core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { firstValueFrom } from 'rxjs';
import { FestivalService } from '@core/services/festival.service'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'   
})
export class NavbarComponent implements OnInit {
  public auth = inject(AuthService);
  public translate = inject(TranslateService);
  private festivalService = inject(FestivalService); 

  ongoingFestivalId = signal<number | null>(null);

  async ngOnInit() {
    if (this.auth.currentUser()) { 
      try {
        const festivals = await firstValueFrom(this.festivalService.getFestivals());
        const ongoing = festivals.find(f => f.status === 'ongoing');
        
        if (ongoing) {
          this.ongoingFestivalId.set(ongoing.id);
        }
      } catch (error) {
        console.error("Impossible de charger le festival en cours pour la navbar", error);
      }
    }
  }

  toggleLanguage() {
    const current = this.translate.getCurrentLang(); 
    const targetLang = current === 'en' ? 'fr' : 'en';
    this.translate.use(targetLang);
    localStorage.setItem('userLanguage', targetLang); 
  }
  
  onLogout() {
    this.auth.logout();
  }
}