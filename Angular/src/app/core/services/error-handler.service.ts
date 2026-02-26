import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private translate = inject(TranslateService);

  parseRailsErrors(response: any): string[] {
    
    if (response && response.status === "error") {
      const translatedErrorsList: string[] = [];

      if (response.errors && typeof response.errors === 'object') {
        Object.keys(response.errors).forEach(field => {
          const fieldName = field !== 'base' ? `${field.toUpperCase()} : ` : '';
          const errorCodes = Array.isArray(response.errors[field]) ? response.errors[field] : [response.errors[field]];

          errorCodes.forEach((errorCode: string) => {
            const translationKey = `SERVER_ERRORS.${errorCode}`;
            const translatedMessage = this.translate.instant(translationKey);
            const finalMessage = translatedMessage === translationKey ? errorCode : translatedMessage;
            translatedErrorsList.push(`${fieldName}${finalMessage}`);
          });
        });
      }

      if (translatedErrorsList.length === 0 && response.message) {
        translatedErrorsList.push(response.message);
      }

      return translatedErrorsList.length > 0 ? translatedErrorsList : [this.translate.instant('SERVER_ERRORS.UNKNOWN')];
    }
    return [this.translate.instant('SERVER_ERRORS.GENERIC_ERROR', { code: 'N/A' })];
  }
}