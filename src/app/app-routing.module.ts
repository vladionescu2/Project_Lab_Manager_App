import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { StaffGuard } from './core/guards/staff.guard';

const appRoutes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path:'',
        canActivate: [AuthGuard],
        children: [
            {
                path: 'submissions',
                loadChildren: () => import('./submissions/submissions.module').then(m => m.SubmissionsModule),
                
            },
            {
                path: 'dashboard',
                loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
            },
            {
                path: 'account',
                loadChildren: () => import('./account/account.module').then(m => m.AccountModule)
            },
            {
                path:'staff',
                canActivate: [StaffGuard],
                children: [
                    {
                        path: 'active-labs',
                        loadChildren: () => import('./active-labs/active-labs.module').then(m => m.ActiveLabsModule)
                    },
                    {
                        path: 'course-units',
                        loadChildren: () => import('./course-units/course-units.module').then(m => m.CourseUnitsModule)
                    }
                ]
            },
            {
                path: '**',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, { /*enableTracing: true, */relativeLinkResolution: 'legacy' })
    ],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule { }
