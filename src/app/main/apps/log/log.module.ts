import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FuseSharedModule} from '@rcm/shared.module';
import {LogComponent} from './log.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {LogService} from '../services/log.service';
import {DatePipe} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

const routes = [
    {
        path: '',
        component: LogComponent,
    },
    // {
    //     path: '',
    //     redirectTo: 'log',
    //     pathMatch: 'full'
    // }
];

@NgModule({
    declarations: [LogComponent],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
        NgxPaginationModule,
        TranslateModule
    ],
    providers: [
        LogService,
        DatePipe
    ]
})
export class LogModule {
}