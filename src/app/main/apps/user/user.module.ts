import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FuseSharedModule} from '@rcm/shared.module';
import {UserComponent} from './user.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {RoleAdminGuard} from '../../../../@rcm/_authentication/role-admin.guard';
import {TranslateModule} from '@ngx-translate/core';

const routes = [
    {
        path: '',
        component: UserComponent,
        canActivate: [RoleAdminGuard]
    },
    // {
    //     path: '',
    //     redirectTo: 'user',
    //     pathMatch: 'full'
    // }
];

@NgModule({
    declarations: [UserComponent, ResetPasswordComponent],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
        NgxPaginationModule,
        TranslateModule
    ],
    entryComponents: [
        ResetPasswordComponent
    ]
})
export class UserModule {
}
