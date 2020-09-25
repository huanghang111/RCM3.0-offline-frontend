import {NgModule} from '@angular/core';
import {DatePipe} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ErrorHistoryComponent} from './history/error-history.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {FuseSharedModule} from '@rcm/shared.module';
import {LatestComponent} from './latest/latest.component';
import {ErrorService} from '../../services/error.service';
import {ErrorTableComponent} from './history/error-table/error-table.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {RelatedDataComponent} from '../../../../../@rcm/components/related-data/related-data.component';
import {SignalService} from '../../services/signal.service';
import {TranslateModule} from '@ngx-translate/core';
import {ProjectGuard} from '../../../../../@rcm/_authentication/project.guard';

const routes = [
    {
        path: 'latest',
        component: LatestComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: 'history',
        component: ErrorHistoryComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: '',
        redirectTo: 'latest',
        pathMatch: 'full'
    }
];

@NgModule({
    declarations: [ErrorHistoryComponent, LatestComponent, ErrorTableComponent],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
        NgxPaginationModule,
        TranslateModule
    ],
    entryComponents: [
        RelatedDataComponent,
        ErrorTableComponent
    ],
    providers: [
        ErrorService,
        DatePipe,
        SignalService
    ]
})
export class ErrorModule {
}
