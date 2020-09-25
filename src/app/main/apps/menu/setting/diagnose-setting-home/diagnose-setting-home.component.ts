import {Component, OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {SettingService} from 'app/main/apps/services/setting.service';
import {Router} from '@angular/router';
import {DiagnoseCalculationComponent} from './calc/diagnose-calculation.component';

@Component({
    selector: 'app-diagnose-setting-home',
    templateUrl: './diagnose-setting-home.component.html',
    styleUrls: ['./diagnose-setting-home.component.scss']
})
export class DiagnoseSettingHomeComponent implements OnInit {

    displayedColumns = ['id', 'faultName', 'des', 'action'];
    faultData: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: any;

    totalItems = 0;
    currentPage = 1;
    itemsPerPage = 10;

    constructor(
        private router: Router,
        private signalSettingService: SettingService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar
    ) {
    }

    ngOnInit() {
        this.getSignalFault();
    }

    getSignalFault(): void {
        this.signalSettingService.getAllSignalFault(this.currentPage, this.itemsPerPage).subscribe(
            res => {
                this.processData(res);
            }
        );
    }

    onEdit(id): void {
        const url = 'apps/setting/diagnose-setting/' + `${id}` + '/diagnose-setting-detail';
        this.router.navigate([url]);
    }

    onCalc(signalName: string, id: string) {
        this.dialogRef = this._matDialog.open(DiagnoseCalculationComponent, {
            panelClass: 'diagnose-calc',
            data: {
                id: id,
                signalName: signalName
            }
        });
    }


    onPageChange(number: number): void {
        this.currentPage = number;
        this.getSignalFault();
    }

    onItemPerPage(event): void {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.getSignalFault();
    }

    processData(res: any): void {
        if (res) {
            this.faultData = res.data ? res.data.signalFault : [];
            this.totalItems = res.data ? res.data.totalElements : 0;
        }
    }

    handleError(error: any, errorMessage: string): void {
        console.log(`Error message: ${error.error.messages} 
        - Error status: ${error.error.status} 
        - Error code: ${error.error.code}`);
        this._matSnackBar.open(errorMessage, 'ERROR', {
            verticalPosition: 'bottom',
            duration: 5000
        });
    }
}
