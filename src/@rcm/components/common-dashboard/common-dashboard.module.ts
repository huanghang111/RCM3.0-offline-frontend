import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonDashboardComponent} from './common-dashboard.component';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialSharedModule} from 'app/material.shared.module';
import {FuseSharedModule} from '@rcm/shared.module';

@NgModule({
    declarations: [CommonDashboardComponent],
    imports: [
        CommonModule,
        TranslateModule,
        MaterialSharedModule,
        FuseSharedModule
    ],
    entryComponents: [
        CommonDashboardComponent
    ],
    exports: [
        CommonDashboardComponent
    ]
})
export class CommonDashboardModule {
}
