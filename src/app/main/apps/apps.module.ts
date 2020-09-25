import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FuseSharedModule} from '@rcm/shared.module';
import {MaterialSharedModule} from 'app/material.shared.module';


const routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'signal',
        loadChildren: './menu/signal/signal.module#SignalModule'
    },
    {
        path: 'setting',
        loadChildren: './menu/setting/setting.module#SettingModule'
    },
    {
        path: 'error',
        loadChildren: './menu/error/error.module#ErrorModule'
    },
    {
        path: 'home',
        loadChildren: './home/home.module#HomeModule'
    },
    {
        path: 'log',
        loadChildren: './log/log.module#LogModule'
    },
    {
        path: 'user',
        loadChildren: './user/user.module#UserModule'
    },
    {
        path: 'diagnose',
        loadChildren: './menu/diagnose/diagnose.module#DiagnoseModule'
    }
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
    ],
    exports: []
})
export class AppsModule {
}
