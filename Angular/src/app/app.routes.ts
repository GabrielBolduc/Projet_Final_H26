import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Signup } from './component/signup/signup'; 
import { Notfound } from './component/notfound/notfound';
import path from 'path';
import { Home } from './component/home/home';

export const routes: Routes = [

{
    path: '',
    component: Home
},
{
    path: 'signup',
    component: Signup

},
{
    path: 'login',
    component: Login
},
{
    path: '**',
    component: Notfound
}

];
