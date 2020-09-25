import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SignalPointDialogComponent} from './signal-point-dialog.component';
import {SignalPointInfoComponent} from './signal-point-info/signal-point-info.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {CommonChartModule} from '..';
import {FuseDirectivesModule} from '@rcm/directives/directives';
import {FlexModule} from '@angular/flex-layout';
import {TranslateModule} from '@ngx-translate/core';
import {FuseSharedModule} from '@rcm/shared.module';

@NgModule({
    declarations: [
        SignalPointDialogComponent,
        SignalPointInfoComponent
    ],
    imports: [
        CommonModule,
        MaterialSharedModule,
        CommonChartModule,
        FuseDirectivesModule,
        FlexModule,
        TranslateModule,
        FuseSharedModule
    ],
    exports: [
        SignalPointDialogComponent,
        SignalPointInfoComponent
    ]
})
export class SignalPointDialogModule {
}
