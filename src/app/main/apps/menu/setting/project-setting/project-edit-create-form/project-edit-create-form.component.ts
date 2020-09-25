import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {IProject} from '../../setting.model';
import {SettingService} from 'app/main/apps/services/setting.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-project-edit-create-form',
    templateUrl: './project-edit-create-form.component.html',
    styleUrls: ['./project-edit-create-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProjectEditCreateFormComponent implements OnInit {

    dialogTitle: string;
    action: string;
    project: IProject;
    projectForm: FormGroup;
    pictureUpload: File = null;
    pictureSrc: any = null;
    isEdit: boolean;

    constructor(
        public matDialogRef: MatDialogRef<ProjectEditCreateFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private _translateService: TranslateService
    ) {
        matDialogRef.disableClose = true;
        this._translateService.get(['PROJECT.ECForm.TitleEdit', 'PROJECT.ECForm.TitleCreate']).subscribe(translations => {
            switch (_data.title) {
                case 'Edit project form':
                    this.dialogTitle = translations['PROJECT.ECForm.TitleEdit'];
                    break;
                case 'Add project form':
                    this.dialogTitle = translations['PROJECT.ECForm.TitleCreate'];
                    break;

            }
        });
        this.action = _data.action;
        this.project = _data.project;
    }

    ngOnInit() {
        this.createForm();
    }

    createForm() {
        this.pictureSrc = this.project && this.project.image ? 'data:image/jpeg;base64,' + this.project.image : '';
        this.projectForm = this._formBuilder.group({
            projectId: [this.project && this.project.projectId ? this.project.projectId : ''],
            projectName: [this.project && this.project.name ? this.project.name : '', Validators.required],
            time: [this.project && this.project.time ? new Date(this.project.time) : new Date()],
            image: [null],
            address: [this.project && this.project.address ? this.project.address : '']
        });
        if (this.action === 'edit') {
            this.isEdit = true;
        }
    }

    ngAction() {
        const formData = new FormData();
        let messages;
        if (this.action === 'edit') {
            formData.append('action', 'edit');
            messages = 'Edit project';
        } else {
            formData.append('action', 'add');
            messages = 'Add project';
        }
        formData.append('formValues', JSON.stringify(this.projectForm.value));
        formData.append('image', this.pictureUpload);
        this.settingService.createProject(formData).subscribe(
            res => {
            },
            error => {
                this._matSnackBar.open(messages + ` failed with error: ${error.error.messages}`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }, () => {
                this.matDialogRef.close({event: 'Success'});
                this._matSnackBar.open(messages + ` successfully`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }
        );
    }

    onPictureSelect(event) {
        const typeAccept = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (event.target.files.length > 0) {
            const imageImport: File = event.target.files[0];
            if (typeAccept.indexOf(imageImport.type) !== -1) {
                this.pictureUpload = imageImport;

                //read picture content and show it
                let fileReader = new FileReader();
                fileReader.readAsDataURL(event.target.files[0]);
                fileReader.onload = (e) => {
                    this.pictureSrc = fileReader.result;
                };
            } else {
                this._matSnackBar.open(`Please choose only image`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }
        }
    }
}
