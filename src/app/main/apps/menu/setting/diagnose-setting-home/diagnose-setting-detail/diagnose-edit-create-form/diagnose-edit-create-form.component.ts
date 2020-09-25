import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-diagnose-edit-create-form',
    templateUrl: './diagnose-edit-create-form.component.html',
    styleUrls: ['./diagnose-edit-create-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DiagnoseEditCreateFormComponent implements OnInit {

    dialogTitle: string;
    action: string;
    diagnoseInstance: any;
    diagnoseInstanceForm: FormGroup;
    faultId;

    constructor(
        public matDialogRef: MatDialogRef<DiagnoseEditCreateFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private _translateService: TranslateService,
    ) {
        matDialogRef.disableClose = true;
        this.action = _data.action;
        if (this.action === 'edit') {
            this._translateService.get('CONFIGURATION.Diagnose.EditD').subscribe(translation => {
                this.dialogTitle = translation;
                // console.log(this.selectAllText);
            });
            // this.dialogTitle = 'Edit Diagnose';
        } else {
            this._translateService.get('CONFIGURATION.Diagnose.Add').subscribe(translation => {
                this.dialogTitle = translation;
                // console.log(this.selectAllText);
            });
            // this.dialogTitle = 'Add Diagnose';
        }
        this.diagnoseInstance = _data.diagnoseInstance;
        this.faultId = _data.faultId;
    }

    ngOnInit() {
        this.createForm();
    }

    createForm(): void {
        this.diagnoseInstanceForm = this._formBuilder.group({
            id: [this.diagnoseInstance && this.diagnoseInstance.id ? this.diagnoseInstance.id : ''],
            calculationOutput: [this.diagnoseInstance && this.diagnoseInstance.calculationOutput ? this.diagnoseInstance.calculationOutput : '', Validators.required],
            description: [this.diagnoseInstance && this.diagnoseInstance.description ? this.diagnoseInstance.description : '']
        });
    }

    ngAction(): void {
        const formData = new FormData();
        if (this.action === 'edit') {
            formData.append('action', 'edit');
        } else {
            formData.append('action', 'add');
        }
        formData.append('faultId', this.faultId);
        this.diagnoseInstanceForm.controls['calculationOutput'].setValue(this.diagnoseInstanceForm.controls['calculationOutput'].value.toString());
        formData.append('formValues', JSON.stringify(this.diagnoseInstanceForm.value));
        this.settingService.createDiagnoseInstance(formData).subscribe(
            res => {
            },
            error => {
                this._matSnackBar.open(`Submit form failed with error: ${error.error.messages}`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            },
            () => {
                this.matDialogRef.close({event: 'Success'});
                this._matSnackBar.open(`Submit form successfully`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }
        );
    }
}
