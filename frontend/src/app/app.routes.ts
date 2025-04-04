// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },
  // // Protected routes with authGuard
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./features/dashboard/dashboard.routes')
  //     .then(m => m.DASHBOARD_ROUTES),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'contacts',
  //   loadChildren: () => import('./features/contacts/contacts.routes')
  //     .then(m => m.CONTACTS_ROUTES),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'leads',
  //   loadChildren: () => import('./features/leads/leads.routes')
  //     .then(m => m.LEADS_ROUTES),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'deals',
  //   loadChildren: () => import('./features/deals/deals.routes')
  //     .then(m => m.DEALS_ROUTES),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'tasks',
  //   loadChildren: () => import('./features/tasks/tasks.routes')
  //     .then(m => m.TASKS_ROUTES),
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'analytics',
  //   loadChildren: () => import('./features/analytics/analytics.routes')
  //     .then(m => m.ANALYTICS_ROUTES),
  //   canActivate: [authGuard]
  // },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
