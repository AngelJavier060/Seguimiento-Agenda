import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    {
        path: 'landing',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'agenda',
        loadComponent: () => import('./features/agenda/agenda.component').then(m => m.AgendaComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'USER' }
    },
    {
        path: 'info',
        loadComponent: () => import('./features/info/info.component').then(m => m.InfoComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'USER' }
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'USER' }
    },
    {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'USER' }
    },
    {
        path: 'alertas',
        loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent),
        canActivate: [authGuard]
    },
    {
        path: 'admin/config',
        loadComponent: () => import('./features/admin/admin-config.component').then(m => m.AdminConfigComponent),
        canActivate: [authGuard, roleGuard],
        data: { role: 'ADMIN' }
    },
    { path: '**', redirectTo: 'landing' }
];
