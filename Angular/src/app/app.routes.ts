import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Signup } from './features/auth/signup/signup'; 
import { Notfound } from './core/notfound/notfound';
import { Home } from './features/home/home';
import { Reservations } from '@features/alexandre/reservations/reservations';
import { ReservationsForm } from '@features/alexandre/reservations-form/reservations-form';
import { Accommodations } from '@features/alexandre/accommodations/accommodations';
import { AccommodationsDetails } from '@features/alexandre/accommodations-details/accommodations-details';
import { AccommodationsForm } from '@features/alexandre/admin/accommodations-form/accommodations-form';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/festival/performance/dashboard';
import { AdministrationComponent } from './features/festival/festival/administration';
import { FestivalFormComponent } from './features/festival/festival/festival-form';
import { AddPerformanceComponent } from './features/festival/performance/add_performance';
import { TaskListComponent } from '@features/laurent/task/list/list';
import { TaskShowComponent } from '@features/laurent/task/show/show';
import { TaskFormComponent } from '@features/laurent/task/form/form';
import { Ticketing } from '@features/GabrielR/ticketing/ticketing';
import { AdminTicketingComponent } from '@features/GabrielR/ticketing/admin/ticketing-admin';
import { PackageFormComponent } from './features/GabrielR/ticketing/admin/package-form/package-form';
import { TicketingOrderFormComponent } from './features/GabrielR/ticketing/public/order-form/order-form';
import { TicketingOrdersComponent } from './features/GabrielR/ticketing/public/orders/orders';
import { TicketingOrderDetailComponent } from './features/GabrielR/ticketing/public/order-detail/order-detail';
import { TicketingTicketDetailComponent } from './features/GabrielR/ticketing/public/ticket-detail/ticket-detail';
import { PublicScheduleComponent } from './features/festival/public_programation/public_schedule';
import { AuthGuard } from './core/guards/auth.guard';
import { restrictionLoginGuard } from './core/guards/restriction-login-guard';
import { adminGuard } from './core/guards/admin.guard';
import {FestivalFormComponent} from './features/festival/festival/festival-form'

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
                path: 'programmation',
                component: PublicScheduleComponent
            },
            {
                path: 'reservations',
                component: Reservations
            },
            {
                path: 'reservations-form',
                component: ReservationsForm,
                canActivate: [AuthGuard]
            },
            {
                path: 'accommodations',
                component: Accommodations
            },
            {
                path: 'accommodations-details/:id',
                component: AccommodationsDetails
            },
            {
                path: 'accommodations-form',
                component: AccommodationsForm,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'accommodations-form/:id',
                component: AccommodationsForm,
                canActivate: [AuthGuard, adminGuard]
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
                path: 'admin/festivals',
                component: AdministrationComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'admin/festivals/new',
                component: FestivalFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'admin/festivals/:id/edit',
                component: FestivalFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'admin/festivals/:id/dashboard',
                component: DashboardComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'admin/festivals/:id/performances/new',
                component: AddPerformanceComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'admin/festivals/:id/performances/:perfId/edit',
                component: AddPerformanceComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            
            {
                path: 'admin/ticketing',
                component: AdminTicketingComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'packages/new',
                component: PackageFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'packages/:id/edit',
                component: PackageFormComponent,
                canActivate: [AuthGuard, adminGuard]
            },
            {
                path: 'ticketing',
                component: Ticketing
            },
            {
                path: 'ticketing/packages/:id/order',
                component: TicketingOrderFormComponent
            },
            {
                path: 'ticketing/orders',
                component: TicketingOrdersComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'ticketing/orders/:id',
                component: TicketingOrderDetailComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'ticketing/tickets/:id',
                component: TicketingTicketDetailComponent,
                canActivate: [AuthGuard]
            },
            {
                path: 'tasks',
                component: TaskListComponent,
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
                path: '**',
                component: Notfound
            }
        ]
    }
];
