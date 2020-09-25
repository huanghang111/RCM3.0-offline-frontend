import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {DiagnoseEditCreateFormComponent} from './diagnose-edit-create-form/diagnose-edit-create-form.component';
import {DiagnoseEditStepFormComponent} from './diagnose-edit-step-form/diagnose-edit-step-form.component';
import {SettingService} from 'app/main/apps/services/setting.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-diagnose-setting-detail',
    templateUrl: './diagnose-setting-detail.component.html',
    styleUrls: ['./diagnose-setting-detail.component.scss']
})
export class DiagnoseSettingDetailComponent implements OnInit {

    displayedColumns = ['calOutput', 'des', 'operation'];
    diagnoseInstances: any[] = [];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: any;
    faultId;
    faultName;

    totalItems = 0;
    currentPage = 1;
    itemsPerPage = 10;

    constructor(
        private activeRoute: ActivatedRoute,
        private settingService: SettingService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private router: Router,
        private _translateService: TranslateService
    ) {
    }

    ngOnInit() {
        this.faultId = this.activeRoute.snapshot.paramMap.get('faultId');
        this.getSignalFault();
    }

    getSignalFault(): void {
        this.settingService.getSignalFaultBySignalId(this.faultId).subscribe(
            res => {
                if(res.body.code == 200 && res.body.data){
                    this.faultName = res.body.data.signalFault.name;
                    if(res.body.data.signalFault.diagnoseInstances){
                        this.diagnoseInstances = res.body.data.signalFault.diagnoseInstances
                    }
                }
            }
        );
    }

    editDiagnoseDetail(action, diagnoseInstance): void {
        this.dialogRef = this._matDialog.open(DiagnoseEditCreateFormComponent, {
            panelClass: 'diagnose-edit-create-form',
            data: {
                diagnoseInstance: diagnoseInstance,
                faultId: this.faultId,
                action: action
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.getSignalFault();
                }
            }
        );
    }

    editStep(diagnoseInstance): void {
        this.dialogRef = this._matDialog.open(DiagnoseEditStepFormComponent, {
            panelClass: 'diagnose-edit-step-form',
            data: {
                diagnoseInstance: diagnoseInstance
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.getSignalFault();
                }
            }
        );
    }

    deleteDiagnoseDetail(diagnoseInstance): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this._translateService.get(['CONFIGURATION.Diagnose.DeleteForm.Title', 'ACTION.Confirm_delete']).subscribe(translations => {
            this.confirmDialogRef.componentInstance.confirmMessage = translations['ACTION.Confirm_delete'];
            this.confirmDialogRef.componentInstance.confirmHeader = translations['CONFIGURATION.Diagnose.DeleteForm.Title'] + diagnoseInstance.calculationOutput;
        });

        // this.confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to delete ?`;
        // this.confirmDialogRef.componentInstance.confirmHeader = `Delete diagnose instance with ID "${id}"`;

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.settingService.deleteDiagnoseInstanceById(diagnoseInstance.id).subscribe(data => {
                    this.getSignalFault();
                    this._matSnackBar.open(`DELETED diagnose instance "${this.faultName}"`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                }, error => {
                    const errorMess = `Delete error with error message: ${error.error.messages}`;
                    this.handleError(error, errorMess);
                });
            }
            this.confirmDialogRef = null;
        });
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

    onBack() {
        const url = 'apps/setting/diagnose-setting';
        this.router.navigate([url]);
    }
}
