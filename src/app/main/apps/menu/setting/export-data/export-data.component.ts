import {Component, OnInit, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SignalService} from '../../../services/signal.service';
import {MatOption} from '@angular/material/core';
import {CommonUtilitiesService} from '../../../../../../@rcm/_helpers/common-utilities.service';
import {environment} from '../../../../../../environments/environment';
import {TYPE_EXCEL, TYPE_JSON} from '../../../../../../@rcm/_helpers/constant/export-constants';

@Component({
    selector: 'app-export-data',
    templateUrl: './export-data.component.html',
    styleUrls: ['./export-data.component.scss']
})
export class ExportDataComponent implements OnInit {

    dateFrom: any;
    dateTo: any;
    selectedSignals: Array<any> = [];
    signalList: Array<any> = [];
    isDisable = false;
    exportType = 'excel';
    @ViewChild('allSelected') private allSelected: MatOption;

    constructor(private datePipe: DatePipe,
                private _matSnackBar: MatSnackBar,
                private signalService: SignalService,
                private commonUtil: CommonUtilitiesService) {
    }

    ngOnInit() {
        this.getSignal();
        const currentDate = new Date();
        let fromDt = new Date();
        fromDt.setDate(fromDt.getDate() - 14);
        this.dateFrom = fromDt;
        this.dateTo = currentDate;
    }

    fromDateEvent(date) {
        this.dateFrom = this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    toDateEvent(date) {
        this.dateTo = this.datePipe.transform(date, 'yyyy-MM-dd');
    }

    onExport() {
        this.isDisable = true;
        const requestBody =
            {
                dateFrom: this.commonUtil.convertFullISODate(this.dateFrom),
                dateTo: this.commonUtil.convertFullISODate(this.dateTo),
                signalNames: this.selectedSignals
            };
        console.log(`Date from: ${requestBody.dateFrom}, date to: ${requestBody.dateTo}`);
        if (this.exportType === 'excel') {
            const url = `${environment.apiUrl}/api/signalData/exportData`;
            this.commonUtil.exportFile(url, TYPE_EXCEL, requestBody, 'Signal_Data.xlsx')
                .catch(error => {
                    this.handleError(error);
                }).finally(() => {
                this.isDisable = false;
            });
        } else if (this.exportType === 'json') {
            const url = `${environment.apiUrl}/api/signalData/exportDataJson`;
            this.commonUtil.exportFile(url, TYPE_JSON, requestBody, 'Signal_Data.json')
                .catch(error => {
                    this.handleError(error);
                }).finally(() => {
                this.isDisable = false;
            });
        }

    }

    getSignal() {
        this.signalService.getSignalExport().subscribe(res => {
            this.signalList = res['data'].signals;
        });
    }

    handleError(error: any) {
        if (error.status == 404) {
            this._matSnackBar.open(`No signal data was found!!!`, 'NOT FOUND', {
                verticalPosition: 'bottom',
                duration: 3000
            });
        } else {
            this._matSnackBar.open(`Export data with error: ${JSON.stringify(error)}`, 'NOT FOUND', {
                verticalPosition: 'bottom',
                duration: 3000
            });
        }
    }

    togglePerSelection() {
        if (this.allSelected.selected) {
            this.allSelected.deselect();
            return false;
        }
        if (this.signalList.length == this.selectedSignals.length) {
            this.allSelected.select();
        }

    }

    toggleAllSelection() {
        if (this.allSelected.selected) {
            this.selectedSignals = [...this.signalList.map(e => e.name), 0];
        } else {
            this.selectedSignals = [];
        }
    }
}


