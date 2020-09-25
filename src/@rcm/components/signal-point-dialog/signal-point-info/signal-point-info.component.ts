import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {DatePipe} from '@angular/common';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SignalService} from 'app/main/apps/services/signal.service';
import {DATA_TYPE_BOOL, DATA_TYPE_FLOAT, DATA_TYPE_INT16, DATA_TYPE_INT32} from '@rcm/_helpers/constant/signal-constants';
import {ChartData} from '@rcm/components/common-chart/chartData';
import {AuthStore} from '@rcm/_authentication/auth.store';
import {environment} from 'environments/environment';
import {CommonUtilitiesService} from '@rcm/_helpers/common-utilities.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-signal-point-info',
    templateUrl: './signal-point-info.component.html',
    styleUrls: ['./signal-point-info.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SignalPointInfoComponent implements OnInit {

    pointData: any;
    documents: any;
    pictureSrc: string;
    loading: boolean = false;
    isNumeric: boolean = false;
    isFloat: boolean = false;
    isBoolean: boolean = false;
    historicalLoaded: boolean = false;

    THRESHOLD_MIN = 'Low';
    THRESHOLD_MIN_MIN = 'Too_Low';
    THRESHOLD_MAX_MAX = 'Too_High';
    THRESHOLD_MAX = 'High';
    THRESHOLD_BOOL = '';

    chartData: any[] = [];
    xAxisData: any[] = [];
    chartSeriesName = '';
    chartXAxisMin: any;
    chartXAxisMax: any;
    chartPointStart: any;

    dialogRef: MatDialogRef<any>;
    public pointDataForm: FormGroup;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                public matDialogRef: MatDialogRef<SignalPointInfoComponent>,
                private signalService: SignalService,
                private datePipe: DatePipe,
                private _formBuilder: FormBuilder,
                private authStore: AuthStore,
                private commonUtil: CommonUtilitiesService,
                private _matSnackBar: MatSnackBar,
                private translateService: TranslateService
    ) {
        matDialogRef.disableClose = true;
        this.pointData = data.pointData;
        switch (this.pointData.signal.dataType.name) {
            case DATA_TYPE_FLOAT:
                this.isFloat = true;
                break;
            case DATA_TYPE_BOOL:
                this.isBoolean = true;
                break;
            case DATA_TYPE_INT16:
            case DATA_TYPE_INT32:
                this.isNumeric = true;
                break;
        }
        this.initForm();
    }

    get form() {
        return this.pointDataForm.controls;
    }

    ngOnInit() {
        this.resetVariable();
        this.chartSeriesName = this.pointData.signal.name;

        // this.loadSignalPointData();
        this.signalService.getSignalForSignalPointInfo(this.pointData.signal.name).subscribe(
            res => {
                if (res.code === 200 && res.data) {
                    this.documents = res.data.signal.documents;
                    this.pictureSrc = 'data:image/jpeg;base64,' + res.data.signal.images;
                }
            }
        );
    }

    loadSignalPointData() {
        this.loading = true;
        this.resetVariable();
        this.signalService.getSignalPointDataForChart(this.pointData.signal.name, this.form.dateFrom.value, this.form.dateTo.value)
            .subscribe(res => {
                    if (res.data.signalPointData.length > 0) {
                        this.chartData = [];
                        this.xAxisData = [];
                        let tempData = [];
                        res.data.signalPointData.forEach(element => {
                            const time = Date.parse(element.t);
                            tempData.push([time, element.v]);
                            this.xAxisData.push(time);
                        });
                        this.chartData.push(tempData);
                    }
                },
                error => console.log(error),
                () => {
                    this.createChartData();
                    this.loading = false;
                }
            );
    }

    onTabChange(event){
        //historical tab selected
        if(event.tab.textLabel === this.translateService.instant('SIGNAL.Points.Info.Tab.His') && !this.historicalLoaded){
            this.loadSignalPointData();
            this.historicalLoaded = true;
        }
    }

    createChartData(): ChartData {
        let chartDataInput = new ChartData();
        chartDataInput.chartTitle = this.pointData.signal.name + ' historical chart';
        chartDataInput.seriesName = this.chartSeriesName;
        chartDataInput.data = this.chartData;
        chartDataInput.yAxisTile = 'Data value (' + this.pointData.signal.unit + ')';
        chartDataInput.chartPointStart = this.chartPointStart;
        chartDataInput.xAxisMax = this.chartXAxisMax;
        chartDataInput.xAxisMin = this.chartXAxisMin;
        chartDataInput.xAxisData = this.xAxisData;
        return chartDataInput;
    }

    initForm() {
        this.pointDataForm = this._formBuilder.group({
            //86400000 means a day in seconds
            dateFrom: [this.convertDate(new Date(new Date().getTime() - 86400000)), [Validators.required]],
            dateTo: [this.convertDate(new Date()), [Validators.required]],
            
            threshTooLow: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[0]
                ? this.getThresholdByLevel(this.THRESHOLD_MIN_MIN, this.pointData.signal.thresholds) : ''],
            threshLow: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[1]
                ? this.getThresholdByLevel(this.THRESHOLD_MIN, this.pointData.signal.thresholds) : ''],
            threshHigh: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[2]
                ? this.getThresholdByLevel(this.THRESHOLD_MAX, this.pointData.signal.thresholds) : ''],
            threshTooHigh: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[3]
                ? this.getThresholdByLevel(this.THRESHOLD_MAX_MAX, this.pointData.signal.thresholds) : ''],

            errorTooLow: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[0]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MIN_MIN, this.pointData.signal.thresholds) : '',],
            errorLow: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[1]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MIN, this.pointData.signal.thresholds) : ''],
            errorHigh: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[2]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MAX, this.pointData.signal.thresholds) : ''],
            errorTooHigh: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[3]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MAX_MAX, this.pointData.signal.thresholds) : ''],

            digit: [this.pointData.signal.digit && this.pointData.signal && this.pointData.signal.digit !== '0'
                ? this.pointData.signal.digit : 1, [Validators.max(4), Validators.min(1)]],

            threshold: [{
                value: this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[0]
                    ? this.pointData.signal.thresholds[0].values : '', disabled: true
            }],
            displayTrue: [this.pointData.signal.displayTrue ? this.pointData.signal.displayTrue : ''],
            displayFalse: [this.pointData.signal.displayFalse ? this.pointData.signal.displayFalse : ''],
            errorMessage: [this.pointData.signal.thresholds && this.pointData.signal.thresholds.length > 0 && this.pointData.signal.thresholds[0]
                ? this.pointData.signal.thresholds[0].errorMessages : ''],
        });
    }

    fromDateEvent(date) {
        this.form.dateFrom.setValue(this.convertDate(date));
    }

    toDateEvent(date) {
        this.form.dateTo.setValue(this.convertDate(date));
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    resetVariable() {
        this.chartData = [];
        this.chartPointStart = null;
    }

    onFilter() {
        this.resetVariable();
        this.loadSignalPointData();
    }

    getThresholdByLevel(level: string, thresholds: any[]): any {
        for (let i = 0; i < thresholds.length; i++) {
            if (thresholds[i].level == level) {
                return thresholds[i].values;
            }
        }
    }

    getMessageErrorByLevel(level: string, thresholds: any[]): any {
        for (let i = 0; i < thresholds.length; i++) {
            if (thresholds[i].level == level) {
                return thresholds[i].errorMessages;
            }
        }
    }

    //QUYEN SAID: IM NOT SURE IF THIS IS NEEDED OR NOT, SINCE IN THE HTML FILE DOESNT CALL THIS FUCNTION
    // relatedSignalButton(level) {
    //     const relatedSignal = {};
    //     relatedSignal['signalId'] = [this.pointData.signal.signalId];
    //     relatedSignal['threshold'] = [this.getFullThresholdByLevel(level, this.pointData.signal.thresholds)];
    //     if (this.getFullThresholdByLevel(level, this.pointData.signal.thresholds) !== undefined) {
    //         this.dialogRef = this._matDialog.open(RelatedSignalFormComponent, {
    //             panelClass: 'related-signal-form',
    //             data: {
    //                 relatedSignal: relatedSignal,
    //                 action: 'add'
    //             }
    //         });
    //     }
    // }

    getFullThresholdByLevel(level: string, thresholds: any[]): any {
        for (let i = 0; i < thresholds.length; i++) {
            if (thresholds[i].level == level) {
                return thresholds[i];
            }
        }
    }

    navigateToDownload(document: any): void {
        if (document.id) {
            const data = {
                projectId: this.authStore.getProjectId(),
                signalName: this.pointData.signal.name,
                docId: document.id
            };
            const url = `${environment.apiUrl}/api/signal/downloadDocument?signalName=${data.signalName}&projectId=${data.projectId}&docId=${data.docId}`;
            this.commonUtil.exportFileGetMethod(url, document.type, document.name)
                .catch(error => {
                    if (error.status === 404) {
                        this._matSnackBar.open(`No data was found!!!`, 'NOT FOUND', {
                            verticalPosition: 'bottom',
                            duration: 3000
                        });
                    }
                });
        } else {
            this._matSnackBar.open(`This document is not uploaded yet.`, 'OK', {
                verticalPosition: 'bottom',
                duration: 3000
            });
        }
    }
}
