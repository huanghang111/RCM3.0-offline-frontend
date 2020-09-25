import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagnoseService } from 'app/main/apps/services/diagnose.service';
import { DiagnoseStepComponent } from '../step/diagnose-step.component';
import { MatDialog } from '@angular/material';
import { RelatedDataComponent } from '../../../../../../../@rcm/components/related-data/related-data.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseConfirmDialogComponent } from '../../../../../../../@rcm/components/confirm-dialog/confirm-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { SocketApiService } from 'app/main/apps/services/socket-api.service';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-diagnose-detail',
    templateUrl: './diagnose-detail.component.html',
    styleUrls: ['./diagnose-detail.component.scss']
})
export class DiagnoseDetailComponent implements OnInit, OnDestroy {

    dataSrc: any;
    detailColumns: string[] = ['check', 'timestamp', 'measurement', 'related'];
    dialogRef: any;
    totalItems = 0;
    currentPage = 1;
    itemsPerPage = 10;
    signalName: string;
    checkedAll = false;
    checkedItem: Array<any> = [];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private diagnoseService: DiagnoseService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private socketApi: SocketApiService,
        private datePipe: DatePipe
    ) {
    }

    ngOnInit() {
        this.signalName = this.route.snapshot.paramMap.get('id');
        this.loadDiagnoseDetail();
    }

    ngOnDestroy() {
        this.disconnectSocket();
    }

    loadDiagnoseDetail(): void {
        this.diagnoseService.getDiagnoseDetail(this.currentPage, this.itemsPerPage, this.signalName).subscribe(
            res => {
                if (res.body.code === 200 && res.body.data.totalElements > 0) {
                    this.dataSrc = res.body.data.detail.filter(e => e != null);
                    this.totalItems = res.body.data.totalElements;
                    this.dataSrc.forEach(element => {
                        this.checkedItem.push(
                            {
                                checked: false,
                                id: element.error.id
                            }
                        );
                    });
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
        this.loadDiagnoseDetail();
    }

    onItemPerPage(event): void {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.loadDiagnoseDetail();
    }

    onBack(): void {
        this.router.navigate(['/apps/diagnose']);
    }

    onDelete(): void {
        const listIdChecked = this.checkedItem.filter(item => item.checked == true).map(value => value.id);
        const numOfDel = listIdChecked.length;
        if (numOfDel) {
            this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });

            this.confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to delete ${numOfDel} data?`;
            this.confirmDialogRef.componentInstance.confirmHeader = `Delete fault data error`;

            this.confirmDialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.diagnoseService.acknowledgeFaultError(listIdChecked).subscribe(
                        res => {
                        },
                        error => console.log(error),
                        () => {
                            this.checkedItem.length = 0;
                            this.loadDiagnoseDetail();
                            this._matSnackBar.open(`DELETED ${numOfDel} data fault errors`, 'OK', {
                                verticalPosition: 'bottom',
                                duration: 5000
                            });
                        }
                    );
                }
                this.confirmDialogRef = null;
            });
        }
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

    onCheckAll(event): void {
        this.checkedItem.forEach((element) => {
            element.checked = event.checked;
        });
        this.checkedAll = event.checked;
    }

    onCheckItem(event, index) {
        this.checkedItem.forEach((element) => {
            if (element.id == this.dataSrc[index].id) {
                element.checked = event.checked;
            }
        });
        //if all records are checked, checkall will be true. If one is uncheck, false
        this.checkedAll = this.checkedItem.every((element) => {
            return element.checked;
        });
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
    }

    onRelated(element: any) {
        this.dialogRef = this._matDialog.open(RelatedDataComponent, {
            panelClass: 'related-data',
            data: {
                error: element,
                action: 'view'
            },
        });
    }

    connectSocket() {
        this.socketApi._connect('/topic/errorData', false);
        this.socketApi.receive().subscribe(
            res => {
                if (res.name && res.name === this.signalName) {
                    this.dataSrc = [new Object({ output: null, error: res })].concat(this.dataSrc.slice(0, -1));
                    this.checkedItem.splice(0, 0, new Object({ checked: false, id: res.id }));
                    this.totalItems++;
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
