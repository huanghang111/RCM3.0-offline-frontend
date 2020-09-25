import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-diagnose-edit-step-edit-create-form',
    templateUrl: './diagnose-edit-step-edit-create-form.component.html',
    styleUrls: ['./diagnose-edit-step-edit-create-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DiagnoseEditStepEditCreateFormComponent implements OnInit {

    dialogTitle: string;
    action: string;
    diagnoseInstanceId: string;
    diagnoseStep: any;
    diagnoseStepForm: FormGroup;
    diagnosePictures: any[] = [];
    pictureUploads = [];
    pictureRest = [];

    constructor(
        public matDialogRef: MatDialogRef<DiagnoseEditStepEditCreateFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private _translateService: TranslateService,
    ) {
        matDialogRef.disableClose = true;
        this.action = _data.action;
        if (this.action === 'edit') {
            this._translateService.get('CONFIGURATION.Diagnose.EditStep').subscribe(translation => {
                this.dialogTitle = translation;
                // console.log(this.selectAllText);
            });
            // this.dialogTitle = 'Edit step';
        } else {
            this._translateService.get('CONFIGURATION.Diagnose.AddStep').subscribe(translation => {
                this.dialogTitle = translation;
                // console.log(this.selectAllText);
            });
            // this.dialogTitle = 'Add step';
        }
        this.diagnoseInstanceId = _data.diagnoseInstanceId;
        this.diagnoseStep = _data.diagnoseStep;
        if (this.diagnoseStep && this.diagnoseStep.diagnosePictures) {
            for (let i = 0; i < this.diagnoseStep.diagnosePictures.length; i++) {
                this.diagnosePictures.push(this.diagnoseStep.diagnosePictures[i]);
            }
        }
        // this.diagnosePictures = this.diagnoseStep && this.diagnoseStep.diagnosePictures ? this.diagnoseStep.diagnosePictures : [];
    }

    ngOnInit() {
        this.createForm();
    }

    createForm(): void {
        for (let i = 0; i < this.diagnosePictures.length; i++) {
            this.pictureRest.push(this.diagnosePictures[i].id);
        }
        this.diagnoseStepForm = this._formBuilder.group({
            id: [this.diagnoseStep && this.diagnoseStep.id ? this.diagnoseStep.id : ''],
            description: [this.diagnoseStep && this.diagnoseStep.description ? this.diagnoseStep.description : ''],
            pictureRest: []
        });
    }

    ngAction(): void {
        this.diagnoseStepForm.controls['pictureRest'].setValue(this.pictureRest);
        const formData = new FormData();
        for (let j = 0; j < this.pictureUploads.length; j++) {
            const fileItem = this.pictureUploads[j].send;
            formData.append('pictures', fileItem);
        }
        formData.append('action', this.action);
        formData.append('diagnoseInstanceId', this.diagnoseInstanceId);
        formData.append('formValues', JSON.stringify(this.diagnoseStepForm.value));
        this.settingService.createDiagnoseStep(formData).subscribe(
            res => {
                this.matDialogRef.close({event: 'Success'});
                this._matSnackBar.open(`Submit form successfully`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            },
            error => {
                this._matSnackBar.open(`Submit form failed with error: ${error.error.messages}`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            },
        );
    }

    onFileSelected(event): void {
        const typeAccept = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const imageImport: File = event.target.files[i];
                if (typeAccept.indexOf(imageImport.type) !== -1) {
                    const isImage = imageImport.type.includes('image/');
                    const file = {
                        name: imageImport.name,
                        size: imageImport.size,
                        type: imageImport.type,
                        isImage: isImage,
                        send: imageImport,
                        data: this.readURL(imageImport)
                    };
                    this.pictureUploads.push(file);
                } else {
                    this._matSnackBar.open(`Please choose only image`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                    return;
                }
            }
        }
    }

    readURL(file): any {
        return new Promise((resolve, reject) => {
            if (file) {
                const isImage = file.type.includes('image/');
                const reader = new FileReader();
                reader.onload = function (e) {
                    resolve(reader.result);
                };
                if (isImage) {
                    reader.readAsDataURL(file);
                } else {
                    resolve('');
                }
            }
        });
    }

    removeUploadPicture(index): void {
        this.pictureUploads.splice(index, 1);
    }


    removePicture(index): void {
        this.diagnosePictures.splice(index, 1);
        this.pictureRest.splice(index, 1);
    }

}
