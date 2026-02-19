import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu'; 
import { AuthService } from '@core/services/auth.service';
import { MatDividerModule } from '@angular/material/divider';

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
export class NavbarComponent {
  public auth = inject(AuthService);
  public translate = inject(TranslateService);

  toggleLanguage() {
    const current = this.translate.currentLang; 
    const targetLang = current === 'en' ? 'fr' : 'en';
    this.translate.use(targetLang);
    localStorage.setItem('userLanguage', targetLang); 
  }
  onLogout() {
    this.auth.logout();
  }


}