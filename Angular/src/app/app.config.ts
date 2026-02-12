import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// 1. AJOUTER 'withHashLocation' dans les imports
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
    // 2. AJOUTER 'withHashLocation()' comme argument ici
    provideRouter(routes, withHashLocation()), 
    
    //provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/', 
        suffix: '.json'
      })
    })
  ]
};