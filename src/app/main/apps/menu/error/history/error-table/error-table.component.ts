import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { ErrorService } from '../../../../services/error.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-error-table',
    templateUrl: './error-table.component.html',
    styleUrls: ['./error-table.component.scss']
})
export class ErrorTableComponent implements OnInit {

    dataSrc: any;
    totalItems: number = 0;
    currentPage: number = 1;
    itemsPerPage: number = 10;
    loading: boolean = false;
    errorColumn: string[] = ['name', 'values', 'threshold', 'timestamp', 'ack'];

    constructor(public matDialogRef: MatDialogRef<ErrorTableComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private errorService: ErrorService,
        private _matSnackBar: MatSnackBar,
        private datePipe: DatePipe, ) {
        matDialogRef.disableClose = true;
    }

    ngOnInit() {
        this.loadSignalError();
    }

    loadSignalError() {
        this.loading = true;
        this.errorService.getSignalErrors(this.data.signalName, this.data.dateFrom, this.data.dateTo, this.currentPage, this.itemsPerPage).subscribe(
            res => {
                if (res.code == 200 && res.data.errors.content.length > 0) {
                    this.dataSrc = res.data.errors.content.filter(e => e != null);
                    this.totalItems = res.data.totalElements;
                }
            },
            error => {
                console.log(error);
                this._matSnackBar.open(`There was an error`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                })
            }, () => this.loading = false
        );
    }

    onPageChange(number: number) {
        this.currentPage = number;
        this.loadSignalError();
    }

    onItemPerPage(event) {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.loadSignalError();
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    }


    showThreshold(threshold: any): string {
        if (threshold.level != '') {
            return `${threshold.values} (${threshold.level})`;
        } else {
            return `${threshold.values}`;
        }
    }
}
