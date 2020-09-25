import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FuseSharedModule} from '@rcm/shared.module';
import {HomeComponent} from './home.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {ElementDetailComponent} from './element-detail/element-detail.component';
import {AuthenticateGuard} from '../../../../@rcm/_authentication/authenticate.guard';
import {TranslateModule} from '@ngx-translate/core';

const routes = [
    {
        path: '**',
        component: HomeComponent,
        canActivate: [AuthenticateGuard]
    }
];

@NgModule({
    declarations: [HomeComponent, ElementDetailComponent],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
        TranslateModule,
    ]
})
export class HomeModule {
}
