import {NgModule} from '@angular/core';
import {DiagnoseHomeComponent} from './home/diagnose-home.component';
import {RouterModule} from '@angular/router';
import {MaterialSharedModule} from 'app/material.shared.module';
import {FuseSharedModule} from '@rcm/shared.module';
import {NgxPaginationModule} from 'ngx-pagination';
import {DiagnoseDetailComponent} from './home/detail/diagnose-detail.component';
import {DiagnoseService} from '../../services/diagnose.service';
import {SettingService} from '../../services/setting.service';
import {DiagnoseStepComponent} from './home/step/diagnose-step.component';
import {RelatedDataComponent} from '../../../../../@rcm/components/related-data/related-data.component';
import {TranslateModule} from '@ngx-translate/core';
import {DatePipe} from '@angular/common';

const routes = [
    {
        path: '',
        component: DiagnoseHomeComponent
    },
    {
        path: ':id/detail',
        component: DiagnoseDetailComponent
    },
];

@NgModule({
    declarations: [
        DiagnoseHomeComponent,
        DiagnoseDetailComponent,
        DiagnoseStepComponent,
    ],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
        NgxPaginationModule,
        TranslateModule
    ],
    providers: [
        DiagnoseService,
        SettingService,
        DatePipe
    ],
    entryComponents: [
        DiagnoseStepComponent,
        RelatedDataComponent,
    ]
})
export class DiagnoseModule {
}
