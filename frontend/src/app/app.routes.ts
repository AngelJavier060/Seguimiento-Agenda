import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'agenda', pathMatch: 'full' },
    {
        path: 'agenda',
        loadComponent: () => import('./features/agenda/agenda.component').then(m => m.AgendaComponent)
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent)
    },
    {
        path: 'alertas',
        loadComponent: () => import('./features/alertas/alertas.component').then(m => m.AlertasComponent)
    },
    { path: '**', redirectTo: 'agenda' }
];
