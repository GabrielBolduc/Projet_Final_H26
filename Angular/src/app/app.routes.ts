import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Signup } from './component/signup/signup'; 
import { Notfound } from './component/notfound/notfound';
import path from 'path';
import { Home } from './component/home/home';
import { Hospitality } from './component/hospitality/hospitality';
import { Ticketing } from './component/ticketing/ticketing';

export const routes: Routes = [

{
    path: '',
    component: Home
},
{
    path: 'hospitality',
    component: Hospitality
},
{
    path: 'ticketing',
    component: Ticketing
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
