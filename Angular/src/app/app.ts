import { Component, inject  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'fr']);
    this.translate.setFallbackLang('en');

    const savedLang = localStorage.getItem('userLanguage');
    
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang?.match(/en|fr/) ? browserLang : 'en');
    }
  }
}