import {Component, OnInit} from '@angular/core';
import {LogService} from '../services/log.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {ALL_ROLES} from '../../../../@rcm/_helpers/constant/role';
import {OPERATIONS} from '../../../../@rcm/_helpers/constant/log-constants';
import {MatSnackBar} from '@angular/material/snack-bar';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';
import {CommonUtilitiesService} from '../../../../@rcm/_helpers/common-utilities.service';
import {environment} from '../../../../environments/environment';
import {TYPE_EXCEL} from '../../../../@rcm/_helpers/constant/export-constants';

@Component({
    selector: 'app-log',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {

    // logColumn: string[] = ['select', 'time', 'user', 'operation', 'message'];
    logColumn: string[] = ['time', 'user', 'operation', 'message'];
    exportDataSource: any = [];
    dataSource: any;
    totalItems: number = 0;
    currentPage: number = 1;
    itemsPerPage: number = 10;
    isExporting = false;
    isNoData = false;
    requestParams: any = null;
    oldRequestParams: any = null;

    roles = ALL_ROLES;
    operations = OPERATIONS;

    filterForm = new FormGroup({
        'dateFrom': new FormControl(this.datePipe.transform(new Date(new Date().getTime() - 86400000 * 14), 'yyyy-MM-dd'), [Validators.required]),
        'dateTo': new FormControl(this.datePipe.transform(new Date(), 'yyyy-MM-dd'), [Validators.required]),
        'userType': new FormControl(''),
        'operation': new FormControl(''),
        'keyword': new FormControl('')
    });

    constructor(private logService: LogService,
                private datePipe: DatePipe,
                private _matSnackBar: MatSnackBar,
                private authStore: AuthStore,
                private commonUtil: CommonUtilitiesService) {
    }

    get form() {
        return this.filterForm.controls;
    }

    ngOnInit() {
        this.authStore.removeSelectedProject();
        const currentDate = new Date();
        let fromDt = new Date();
        fromDt.setDate(fromDt.getDate() - 14);
        this.filterForm.get('dateFrom').setValue(fromDt);
        this.filterForm.get('dateTo').setValue(currentDate);
        this.onFilter();
    }

    onFilter() {
        this.isExporting = false;
        this.isNoData = false;
        this.currentPage = 0;
        this.itemsPerPage = 10;
        let userTypes: string[] = [];
        let operations: string[] = [];
        if (this.form.userType.value == '') {
            this.roles.forEach(a => {
                userTypes.push(a.key);
            });
        } else {
            userTypes.push(this.form.userType.value);
        }
        if (this.form.operation.value == '') {
            this.operations.forEach(a => {
                operations.push(a.key);
            });
        } else {
            operations.push(this.form.operation.value);
        }
        const fromDt = this.commonUtil.convertFullISODate(this.form.dateFrom.value);
        const toDate = this.commonUtil.convertFullISODate(this.form.dateTo.value);
        const message = this.form.keyword.value;

        this.requestParams = {
            dateFrom: fromDt,
            dateTo: toDate,
            operation: operations,
            userRole: userTypes,
            message: message
        };
        this.oldRequestParams = this.requestParams;
        if (!this.checkDate(fromDt, toDate)) {
            this._matSnackBar.open(`From date must be lower or equal to date!!`, 'ERROR', {
                verticalPosition: 'bottom',
                duration: 5000
            });
            return;
        }
        this.loadData(this.requestParams);
    }

    checkDate(dateFrom: any, dateTo: any): boolean {
        const fromDt: Date = dateFrom;
        const toDt: Date = dateTo;
        return fromDt <= toDt;

    }

    loadData(params: any) {
        this.logService.getLogs(params, this.currentPage, this.itemsPerPage).subscribe(data => {
            this.dataSource = data.data.logs;
            this.totalItems = data.data.totalElements;
            if (this.totalItems === 0) {
                this.isExporting = true;
                this.isNoData = true;
            }
        });
    }

    onPageChange(number: number) {
        this.currentPage = number;
        this.loadData(this.oldRequestParams);
    }

    onItemPerPage(event) {
        this.itemsPerPage = event;
        this.currentPage = 0;
        this.loadData(this.oldRequestParams);
    }

    fromDateEvent(date) {
        this.form.dateFrom.setValue(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

    toDateEvent(date) {
        this.form.dateTo.setValue(this.datePipe.transform(date, 'yyyy-MM-dd'));
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    }

    absoluteIndex(indexOnPage: number): number {
        return this.itemsPerPage * (this.currentPage - 1) + indexOnPage;
    }

    onExport() {
        if (this.requestParams == null) {
            return;
        }
        this.isExporting = true;
        const url = `${environment.apiUrl}/api/log/exportLogs`;
        this.commonUtil.exportFile(url, TYPE_EXCEL, this.requestParams, 'Log_Report.xlsx')
            .catch(error => {
                if (error.status == 404) {
                    this._matSnackBar.open(`No log data was found!!!`, 'NOT FOUND', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            });
    }
}
