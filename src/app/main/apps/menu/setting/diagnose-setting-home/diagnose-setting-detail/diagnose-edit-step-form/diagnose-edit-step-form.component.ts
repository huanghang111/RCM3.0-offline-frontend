import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {DiagnoseEditStepEditCreateFormComponent} from './diagnose-edit-step-edit-create-form/diagnose-edit-step-edit-create-form.component';
import {SettingService} from 'app/main/apps/services/setting.service';
import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-diagnose-edit-step-form',
    templateUrl: './diagnose-edit-step-form.component.html',
    styleUrls: ['./diagnose-edit-step-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DiagnoseEditStepFormComponent implements OnInit {

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: any;
    dialogTitle: string;
    diagnoseInstance;
    diagnoseSteps: any[] = [];

    constructor(
        public matDialogRef: MatDialogRef<DiagnoseEditStepFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private _matDialog: MatDialog,
        private _translateService: TranslateService
    ) {
        matDialogRef.disableClose = true;
        this._translateService.get('CONFIGURATION.Diagnose.StepForm.Title').subscribe(translation => {
            this.dialogTitle = translation + ' ' + this._data.diagnoseInstance.calculationOutput;
        });

        this.diagnoseInstance = this._data.diagnoseInstance;
    }

    ngOnInit() {
        this.getDiagnoseStep();
    }

    getDiagnoseStep(): void {
        this.settingService.getDiagnoseStepByDiagnoseInstanceId(this.diagnoseInstance.id).subscribe(
            res => {
                this.diagnoseSteps = res.body.data.DiagnoseStep;
            }
        );
    }

    editStep(action, diagnoseStep): void {
        this.dialogRef = this._matDialog.open(DiagnoseEditStepEditCreateFormComponent, {
            panelClass: 'diagnose-edit-step-edit-create-form',
            data: {
                diagnoseInstanceId: this.diagnoseInstance.id,
                diagnoseStep: diagnoseStep,
                action: action
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.getDiagnoseStep();
                }
            }
        );
    }

    deleteStep(id): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        // this._translateService.get(['CONFIGURATION.Diagnose.DeleteForm.Title', 'ACTION.Confirm_delete' ]).subscribe(translations => {
        //     this.confirmDialogRef.componentInstance.confirmMessage = translations['ACTION.Confirm_delete'];
        //     this.confirmDialogRef.componentInstance.confirmHeader = translations['CONFIGURATION.Diagnose.StepForm.DeleteHeader'];
        // });

        this.confirmDialogRef.componentInstance.confirmMessage = this._translateService.instant('ACTION.Confirm_delete');
        this.confirmDialogRef.componentInstance.confirmHeader = this._translateService.instant('CONFIGURATION.Diagnose.StepForm.DeleteHeader');

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.settingService.deleteDiagnoseStepById(id).subscribe(data => {
                    this.getDiagnoseStep();
                    this._matSnackBar.open(`DELETED diagnose step with ID "${id}"`, 'OK', {
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
}
