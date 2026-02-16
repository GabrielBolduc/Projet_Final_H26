import { inject } from '@angular/core/primitives/di';
import { CanActivateFn, Router  } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  
    const router = inject(Router);


  if (JSON.parse(localStorage.getItem('festify_user') || 'false').type !== 'admin') {

    router.navigate(['/login']);
    return false;
  }
    

  return true;
};
