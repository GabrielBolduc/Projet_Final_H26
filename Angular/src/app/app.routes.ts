import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Signup } from './component/signup/signup'; 
import { Notfound } from './component/notfound/notfound';
import path from 'path';

export const routes: Routes = [

{
    path: '',
    component: Login
},
{
    path: 'signup',
    component: Signup

},
{
    path: '**',
    component: Notfound
}


];
