import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialSharedModule} from 'app/material.shared.module';
import {CommonChartModule} from '..';
import {FuseDirectivesModule} from '@rcm/directives/directives';
import {FlexModule} from '@angular/flex-layout';
import {TranslateModule} from '@ngx-translate/core';
import {RelatedSignalFormComponent} from './related-signal-form.component';
import {FuseSharedModule} from '@rcm/shared.module';

@NgModule({
    declarations: [
        RelatedSignalFormComponent
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
        RelatedSignalFormComponent
    ],
})
export class RelatedSignalFormModule {
}
