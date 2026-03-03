import { inject } from '@angular/core';
import { CanActivateFn, Router  } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const staffGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)

  if (authService.isStaff()){
    return true
  }else{
    console.warn("Acces Staff refuse")
    return router.createUrlTree(['/'])
  }
}