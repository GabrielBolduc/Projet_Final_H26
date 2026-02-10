import { Component, signal, inject  } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  imports: [
    RouterLink, 
    RouterOutlet, 
    MatToolbarModule, 
    MatButtonModule, 
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular');
  public auth = inject(AuthService);
  public translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'fr']);
    this.translate.setFallbackLang('en');
    
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en');
  }

  toggleLanguage() {
    const current = this.translate.getCurrentLang(); 
    const targetLang = current === 'en' ? 'fr' : 'en';
    
    this.translate.use(targetLang);
  }
}
