import { Component, OnDestroy, OnInit } from '@angular/core';
import { DiagnoseService } from '../../../../apps/services/diagnose.service';
import { AuthStore } from '../../../../../../@rcm/_authentication/auth.store';
import { Router } from '@angular/router';
import { DiagnoseStepComponent } from './step/diagnose-step.component';
import { MatDialog } from '@angular/material';
import { SocketApiService } from 'app/main/apps/services/socket-api.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-diagnose-home',
    templateUrl: './diagnose-home.component.html',
    styleUrls: ['./diagnose-home.component.scss']
})
export class DiagnoseHomeComponent implements OnInit, OnDestroy {

    dataSrc: Array<any> = [];
    diagnoseColumns: string[] = ['faultName', 'occTime', 'lastOcc', 'action'];
    totalItems = 0;
    currentPage = 1;
    itemsPerPage = 10;
    projectId: string;
    dialogRef: any;

    constructor(
        private authStore: AuthStore,
        private diagnoseService: DiagnoseService,
        private router: Router,
        private _matDialog: MatDialog,
        private socketApi: SocketApiService,
        private datePipe: DatePipe
    ) {
    }

    ngOnInit() {
        this.projectId = this.authStore.getProjectId();
        this.loadDiagnoseData();
    }

    ngOnDestroy() {
        this.disconnectSocket();
    }

    loadDiagnoseData(): void {
        this.diagnoseService.getAllSignalFaultWithData(this.currentPage, this.itemsPerPage).subscribe(
            res => {
                if (res.code === 200 && res.data.detail.length > 0) {
                    this.dataSrc = res.data.detail.filter(e => e != null);
                    this.totalItems = res.data.totalElements;
                }
            }, error => console.log(error),
            () => {
                if (!this.socketApi.isConnected()) {
                    this.connectSocket();
                }
            }
        );
    }

    onPageChange(number: number): void {
        this.currentPage = number;
        this.loadDiagnoseData();
    }

    onItemPerPage(event): void {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.loadDiagnoseData();
    }

    onDetail(name: string): void {
        this.router.navigate([`apps/diagnose/${name}/detail`]);
    }

    onDiagnose(signalName: string, timestamp: string): void {
        this.dialogRef = this._matDialog.open(DiagnoseStepComponent, {
            panelClass: 'diagnose-step',
            data: {
                signalName: signalName,
                timestamp: timestamp
            }
        });
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:MM:ss');
    }

    connectSocket() {
        this.socketApi._connect('/topic/errorData', false);
        this.socketApi.receive().subscribe(
            res => {
                if (res.name) {
                    let errorIndex = this.dataSrc.indexOf(this.dataSrc.find(e => e.name === res.name));
                    if (errorIndex >= 0) {
                        this.dataSrc[errorIndex].total++;
                        this.dataSrc[errorIndex].lastOccur = res.timestamp;
                    }
                }
            }
        );
    }

    disconnectSocket() {
        if (this.socketApi.isConnected()) {
            this.socketApi._disconnect();
        }
    }
}
