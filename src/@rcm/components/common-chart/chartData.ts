import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ChartData {
    chartTitle: string = '';
    seriesName: string = '';
    data: any[] = [];
    tooltipValueSuffix?: string = '';
    yAxisTile?: string = '';
    xAxisMin?: any = null;
    xAxisMax?: any = null;
    chartPointStart?: any = null;
    tooltip?: any;
    xAxisData?: any[];


    constructor() {
    }
}