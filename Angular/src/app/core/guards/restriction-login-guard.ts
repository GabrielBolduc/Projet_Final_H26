
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const restrictionLoginGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  if(auth.isLoggedIn()) {
    if(JSON.parse(localStorage.getItem('festify_user') || 'false').type !== "Admin") {
      router.navigate(['/']);
      return false;
    }
   
  }

  return true;
};
