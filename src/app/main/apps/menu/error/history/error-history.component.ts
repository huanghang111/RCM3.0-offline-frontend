import { Component, OnInit, ViewChild } from '@angular/core';
import { ErrorService } from '../../../services/error.service';
import { MatDialog, MatOption, MatSnackBar, MatSort } from '@angular/material';
import { ErrorTableComponent } from './error-table/error-table.component';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SignalService } from 'app/main/apps/services/signal.service';

@Component({
    selector: 'app-error-history',
    templateUrl: './error-history.component.html',
    styleUrls: ['./error-history.component.scss'],
})
export class ErrorHistoryComponent implements OnInit {

    dialogRef: any;
    dataSrc: any;
    exportDataSource: any = [];
    signalList: Array<any> = [];
    groupSignalColumns: string[] = ['select', 'sigID', 'sigName', 'count', 'action'];
    groupTimeColumns: string[] = ['sigID', 'sigName', 'values', 'threshold', 'timestamp'];
    currentGroup = 'signal';
    currentOrderBy: string = '';

    tempsignalNames: any = null;
    tempDateFrom: string = '';
    tempDateTo: string = '';

    totalItems: number = 0;
    currentPage: number = 1;
    itemsPerPage: number = 10;
    isNoData = false;

    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('allSelected') allSelected: MatOption;

    public filterForm = new FormGroup({
        'dateFrom': new FormControl(this.convertDate(new Date(new Date().getTime() - 86400000)), [Validators.required]),
        'dateTo': new FormControl(this.convertDate(new Date()), [Validators.required]),
        'signalNames': new FormControl(''),
        'groupBy': new FormControl('signal')
    });

    constructor(private errorService: ErrorService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private datePipe: DatePipe,
        private signalService: SignalService) {
    }

    get form() {
        return this.filterForm.controls;
    }

    ngOnInit() {
        this.loadSignalList();
        this.onFilter();
    }

    loadSignalList() {
        this.signalService.getSignalPointsDashboardEdit().subscribe(res => {
            if (res.code == 200 && res.data.signalPoints.length > 0) {
                this.signalList = res.data.signalPoints.filter(e => e != null);
                //select all 
                this.form.signalNames.setValue([...this.signalList.map(e => e.name), 0]);
            }
        }, error => console.log(error));
    }

    loadDataBySignal(signalNames: any, dateFrom: string, dateTo: string) {
        this.exportDataSource = [];
        this.errorService.getHistoryBySignal(signalNames, dateFrom, dateTo, this.currentPage, this.itemsPerPage)
            .subscribe(res => {
                if (res.code == 200) {
                    if (res.data.signals.length > 0) {
                        this.dataSrc = res.data.signals;
                        this.totalItems = res.data.totalElements;
                    } else {
                        this.isNoData = true;
                    }
                }
            },
                error => {
                    console.log(error);
                    this._matSnackBar.open(`Error while trying to load data`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                // () => this.loading = false

            );
    }

    loadDataByTimeAsc(signalNames: any, dateFrom: string, dateTo: string) {
        this.errorService.getHistoryByTimeAsc(signalNames, dateFrom, dateTo, this.currentPage, this.itemsPerPage)
            .subscribe(res => {
                if (res.code == 200) {
                    this.isNoData = res.data.errors.length <= 0;
                    this.dataSrc = res.data.errors;
                    this.totalItems = res.data.totalElements;
                } else {
                    this._matSnackBar.open(`Error loading ` + res.status, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                }
            },
                error => {
                    console.log(error);
                    // this.loading = false;
                    this._matSnackBar.open(`Error while trying to load data`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                // () => this.loading = false
            );
    }

    loadDataByTimeDesc(signalNames: any, dateFrom: string, dateTo: string) {
        this.errorService.getHistoryByTimeDesc(signalNames, dateFrom, dateTo, this.currentPage, this.itemsPerPage)
            .subscribe((res: any) => {
                if (res.code == 200) {
                    this.isNoData = res.data.errors.length <= 0;
                    this.dataSrc = res.data.errors;
                    this.totalItems = res.data.totalElements;
                } else {
                    this._matSnackBar.open(`Error loading ` + res.status, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                }
            },
                error => {
                    console.log(error);
                    // this.loading = false;
                    this._matSnackBar.open(`Error while trying to load data`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                // () => this.loading = false
            );
    }

    resetVariable() {
        this.exportDataSource = [];
    }

    checkItem(event, index) {
        if (event.checked) {
            this.exportDataSource.push(
                this.dataSrc[index].signal.name
            );
        } else {
            this.exportDataSource.forEach((element, i) => {
                if (element == this.dataSrc[index].signal.name) {
                    this.exportDataSource.splice(i, 1);
                }
            });
        }
    }

    onSortData(event) {
        this.currentOrderBy = event.direction;
        if (event.direction == 'asc') {
            this.loadDataByTimeAsc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
        } else if (event.direction == 'desc') {
            this.loadDataByTimeDesc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
        }

    }

    onPageChange(number: number) {
        this.currentPage = number;
        if (this.form.groupBy.value === 'signal') {
            this.loadDataBySignal(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
        } else {
            if (this.currentOrderBy == 'desc') {
                this.loadDataByTimeDesc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
            } else {
                this.loadDataByTimeAsc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
            }
        }
    }

    onItemPerPage(event) {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.scrollToTop();
        if (this.form.groupBy.value === 'signal') {
            this.loadDataBySignal(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
        } else {
            if (this.currentOrderBy == 'desc') {
                this.loadDataByTimeDesc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
            } else {
                this.loadDataByTimeAsc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
            }
        }
    }

    onGroupChange(event) {
        this.form.groupBy.setValue(event.value);
    }

    scrollToTop() {
        let scrollElem = document.querySelector('#formFilter');
        scrollElem.scrollIntoView();
    }

    onExport() {
        if (this.form.groupBy.value === 'time') {
            this.errorService.exportHistoryDataByTime(this.form.signalNames.value, this.form.dateFrom.value, this.form.dateTo.value, this.currentOrderBy)
                .catch(e => {
                    this._matSnackBar.open(`Error when trying to download file`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                });
        } else {
            if (this.exportDataSource.length > 0) {
                this.errorService.exportHistoryDataBySignal(this.exportDataSource, this.form.dateFrom.value, this.form.dateTo.value)
                    .catch(e => {
                        this._matSnackBar.open(`Error when trying to download file`, 'OK', {
                            verticalPosition: 'bottom',
                            duration: 5000
                        });
                    });
            } else {
                this._matSnackBar.open(`No record was chosen to export`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                });
            }
        }
    }

    onFilter() {
        if (!this.filterForm.invalid) {
            if (Date.parse(this.form.dateFrom.value) <= Date.parse(this.form.dateTo.value)) {
                this.isNoData = false;
                this.currentGroup = this.form.groupBy.value;
                this.dataSrc = [];
                this.currentOrderBy = '';
                this.currentPage = 1;

                this.tempsignalNames = this.form.signalNames.value;
                this.tempDateFrom = this.form.dateFrom.value;
                this.tempDateTo = this.form.dateTo.value;

                if (this.currentGroup === 'signal') {
                    this.loadDataBySignal(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
                } else {
                    this.dataSrc.sort = this.sort;
                    this.loadDataByTimeAsc(this.tempsignalNames, this.tempDateFrom, this.tempDateTo);
                }
            } else {
                this._matSnackBar.open(`Date range is not correct`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                });
            }
        } else {
            this._matSnackBar.open(`Please pick a date range`, 'OK', {
                verticalPosition: 'bottom',
                duration: 5000
            });
        }
    }

    errorDetail(signalName) {
        if (this.filterForm.invalid) {
            this._matSnackBar.open(`Please pick a date range`, 'OK', {
                verticalPosition: 'bottom',
                duration: 5000
            });
        } else {
            this.dialogRef = this._matDialog.open(ErrorTableComponent, {
                data: {
                    signalName: signalName,
                    dateFrom: this.form.dateFrom.value,
                    dateTo: this.form.dateTo.value
                }
            });
        }

    }

    togglePerSelection() {
        if (this.allSelected.selected) {
            this.allSelected.deselect();
        }
        if (this.signalList.length == this.form.signalNames.value.length) {
            this.allSelected.select();
        }

    }

    toggleAllSelection() {
        if (this.allSelected.selected) {
            this.form.signalNames.setValue([...this.signalList.map(e => e.name), 0]);
        } else {
            this.form.signalNames.setValue([]);
        }
    }

    fromDateEvent(date) {
        this.form.dateFrom.setValue(this.convertDate(date));
    }

    toDateEvent(date) {
        this.form.dateTo.setValue(this.convertDate(date));
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:MM:ss');
    }

    showThreshold(threshold: any): string {
        if (threshold.level != "") {
            return `${threshold.values} (${threshold.level})`;
        } else {
            return `${threshold.values}`;
        }
    }
}
