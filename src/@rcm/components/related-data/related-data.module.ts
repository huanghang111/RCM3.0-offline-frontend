import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RelatedDataComponent} from './related-data.component';
import {CommonChartModule} from '..';
import {FuseDirectivesModule} from '../../directives/directives';
import {FlexModule} from '@angular/flex-layout';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialSharedModule} from 'app/material.shared.module';

@NgModule({
    declarations: [RelatedDataComponent],
    imports: [
        CommonModule,
        MaterialSharedModule,
        CommonChartModule,
        FuseDirectivesModule,
        FlexModule,
        TranslateModule
    ],
    providers: [
        DatePipe
    ]
})
export class RelatedDataModule {
}
