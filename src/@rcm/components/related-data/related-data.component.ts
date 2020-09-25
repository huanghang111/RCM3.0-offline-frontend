import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RelatedDataService } from '../../../app/main/apps/services/related-data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { ChartData } from '../common-chart/chartData';

@Component({
    selector: 'app-related-data',
    templateUrl: './related-data.component.html',
    styleUrls: ['./related-data.component.scss']
})
export class RelatedDataComponent implements OnInit {

    dialogTitle: string;
    selectedError: any;
    signalDataName: string;
    thresholdId: string;
    intensiveData: any[] = [];
    pointData: any[] = [];
    isNodata = false;


    constructor(public matDialogRef: MatDialogRef<RelatedDataComponent>,
        private relatedDataService: RelatedDataService,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _matSnackBar: MatSnackBar,
        private datePipe: DatePipe) {
        matDialogRef.disableClose = true;
    }

    ngOnInit() {
        this.initData();
    }

    isNoData(): boolean {
        return this.isNodata || (this.intensiveData.length <= 0 && this.pointData.length <= 0);
    }

    private initData() {
        this.dialogTitle = 'Error of signal';
        if (this._data) {
            this.selectedError = this._data.error;
            this.signalDataName = this.selectedError.name;
            this.thresholdId = this.selectedError.threshold.id;
            const signalID = this._data.signalId ? this._data.signalId.length > 0 ? `(${this._data.signalId})` : '' : '';
            this.dialogTitle =
                `Error of  signal ${this.signalDataName} ${signalID} at ${this.datePipe.transform(this.selectedError.timestamp, 'yyyy-MM-dd HH:mm:ss')}`;
            this.relatedDataService.getRelatedDataError(this.signalDataName, this.selectedError.timestamp)
                .subscribe(res => {
                    if (res.code == 200 && res.data && (res.data.intensiveData.length > 0 || res.data.pointData.length > 0) ) {
                        this.isNodata = false;
                        this.intensiveData = res.data.intensiveData;
                        this.pointData = res.data.pointData;
                    } else {
                        this.isNodata = true;
                    }
                }, error => {
                    this._matSnackBar.open(`Get data with error "${error.messages}`, 'ERROR', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                });
        }
    }

    private createChartData(data: any): ChartData {
        const signalID = data.signalId ? data.signalId.length > 0 ? `(${data.signalId})` : '' : '';
        const seriesName = `${data.signalName} (${signalID})`;
        return { chartTitle: data.signalName, data: data.value, seriesName: seriesName, tooltipValueSuffix: '' };
    }

    private createChartDataPoint(data: any): ChartData {
        const seriesName = `Data of ${data.signalName}`;
        let chartDataInput = new ChartData();
        if (data.value.length > 0) {
            let chartData = [];
            let xAxisData = [];
            let tempData = [];
            data.value.forEach(element => {
                tempData.push([Date.parse(element.t), element.v]);
                xAxisData.push(Date.parse(element.t));
            });
            chartData.push(tempData);


            chartDataInput.chartTitle = data.signalName;
            chartDataInput.seriesName = seriesName;
            chartDataInput.data = chartData;
            chartDataInput.xAxisData = xAxisData;
            chartDataInput.tooltipValueSuffix = '';
        }
        return chartDataInput;
    }


}
