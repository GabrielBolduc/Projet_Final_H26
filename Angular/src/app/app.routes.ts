import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup'; 
import { Notfound } from './core/notfound/notfound';
import { Home } from './features/home/home';
import { Hospitality } from './features/hospitality/hospitality';
import { Ticketing } from './features/ticketing/ticketing';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent, 
        children: [

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
                path: 'login',
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
        ]
    }
]