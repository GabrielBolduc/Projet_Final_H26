import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup'; 
import { Notfound } from './core/notfound/notfound';
import { Home } from './features/home/home';
import { Ticketing } from './features/ticketing/ticketing';
import { Reservation } from '@features/alexandre/reservation/reservation';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/admin/performance/dashboard/dashboard';
import { AdministrationComponent } from './features/admin/festival/administration/administration';
import { taskListComponent } from '@features/laurent/task/list/list';
import { TaskShowComponent } from '@features/laurent/task/show/show';
import { TaskFormComponent } from '@features/laurent/task/form/form';

import { AuthGuard } from './core/guards/auth.guard';
import { restrictionLoginGuard } from './core/guards/restriction-login-guard';
import { adminGuard } from './core/guards/admin.guard';

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
                path: 'ticketing',
                component: Ticketing
            },
            {
                path: 'reservations',
                component: Reservation
            },
            
            {
                path: 'login',
                component: Login,
                canActivate: [restrictionLoginGuard]
            },
            {
                path: 'signup',
                component: Signup,
                canActivate: [restrictionLoginGuard]
            },

            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'admin',
                component: AdministrationComponent,
<<<<<<< HEAD
=======
                canActivate: [AuthGuard, adminGuard]
>>>>>>> GabrielB
            },

            {
                path: 'tasks',
                component: taskListComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'tasks/new', 
                component: TaskFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'tasks/:id/edit',
                component: TaskFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'tasks/:id', 
                component: TaskShowComponent,
                canActivate: [AuthGuard, adminGuard]
            },

            {
<<<<<<< HEAD
                path: 'tasks/new',
                component: TaskFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },

            {
                path: 'tasks/:id/edit',
                component: TaskFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },

            {
                path: '**',
                component: Notfound
            },


=======
                path: '**',
                component: Notfound
            }
>>>>>>> GabrielB
        ]
    }
];