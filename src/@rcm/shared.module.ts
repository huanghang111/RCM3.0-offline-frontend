import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

import {FlexLayoutModule} from '@angular/flex-layout';

import {FuseDirectivesModule} from '@rcm/directives/directives';
import {FusePipesModule} from '@rcm/pipes/pipes.module';
import {CommonChartModule, FuseConfirmDialogModule, FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule, FuseWidgetModule} from './components';
import {RelatedDataModule} from './components/related-data/related-data.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FuseDirectivesModule,
        FusePipesModule,
        FuseThemeOptionsModule,
        FuseWidgetModule,
        FuseProgressBarModule,
        RelatedDataModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonChartModule,
        FlexLayoutModule,
        FuseDirectivesModule,
        FusePipesModule,
        FuseConfirmDialogModule,
        FuseSidebarModule,
        FuseProgressBarModule,
        FuseWidgetModule,
        RelatedDataModule

    ]
})
export class FuseSharedModule {
}
