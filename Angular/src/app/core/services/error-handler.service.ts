import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private translate = inject(TranslateService);

  parseRailsErrors(errEnvelope: any): string[] {
    
    if (errEnvelope && errEnvelope.code === 422) {
      const railsErrors = errEnvelope.errors || errEnvelope.data;
      const translatedErrorsList: string[] = [];

      if (railsErrors && typeof railsErrors === 'object') {
        Object.keys(railsErrors).forEach(field => {
          const fieldName = field !== 'base' ? `${field.toUpperCase()} : ` : '';
          
          const errorCodes = Array.isArray(railsErrors[field]) ? railsErrors[field] : [railsErrors[field]];

          errorCodes.forEach((errorCode: string) => {
            const translationKey = `SERVER_ERRORS.${errorCode}`;
            const translatedMessage = this.translate.instant(translationKey);
            
            const finalMessage = translatedMessage === translationKey ? errorCode : translatedMessage;
            translatedErrorsList.push(`${fieldName}${finalMessage}`);
          });
        });
        
        return translatedErrorsList.length > 0 ? translatedErrorsList : ["Données invalides."];
      }
    }

    if (errEnvelope && errEnvelope.code === 500) {
      return ["Erreur interne du serveur Rails."];
    }
    const fallbackCode = errEnvelope?.code || errEnvelope?.status || 'Inconnu';
    return [`Une erreur est survenue (Code: ${fallbackCode}).`];
  }
}