import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CommonChartComponent} from './common-chart.component';
import {NgxEchartsModule} from 'ngx-echarts';

@NgModule({
    declarations: [CommonChartComponent],
    imports: [
        CommonModule,
        NgxEchartsModule
    ],
    entryComponents: [
        CommonChartComponent
    ],
    exports: [
        CommonChartComponent
    ]
})
export class CommonChartModule {
}
