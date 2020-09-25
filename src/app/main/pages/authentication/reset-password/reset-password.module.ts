import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';

import {FuseSharedModule} from '@rcm/shared.module';

import {ResetPasswordComponent} from 'app/main/pages/authentication/reset-password/reset-password.component';
import {RoleAdminGuard} from '../../../../../@rcm/_authentication/role-admin.guard';
import {TranslateModule} from '@ngx-translate/core';

const routes = [
    {
        path: 'auth/reset-password',
        component: ResetPasswordComponent,
        canActivate: [RoleAdminGuard]
    }
];

@NgModule({
    declarations: [
        ResetPasswordComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,

        FuseSharedModule,
        TranslateModule
    ]
})
export class ResetPasswordModule {
}
