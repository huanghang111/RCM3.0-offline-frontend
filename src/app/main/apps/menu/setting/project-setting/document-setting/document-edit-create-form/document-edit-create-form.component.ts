import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {IDocument} from '../../../setting.model';
import {SettingService} from 'app/main/apps/services/setting.service';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {CommonUtilitiesService} from '../../../../../../../../@rcm/_helpers/common-utilities.service';

@Component({
    selector: 'app-document-edit-create-form',
    templateUrl: './document-edit-create-form.component.html',
    styleUrls: ['./document-edit-create-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DocumentEditCreateFormComponent implements OnInit {

    dialogTitle: string;
    action: string;
    document: IDocument;
    documentForm: FormGroup;
    pictureUpload: File = null;
    fileUpload: File = null;
    pictureSrc: any = null;
    // isEdit: boolean;
    documentReceive: any;
    fileName: any;

    isShowed: Boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<DocumentEditCreateFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private _httpClient: HttpClient,
        private _translateService: TranslateService,
        private commonUtil: CommonUtilitiesService
    ) {
        this._translateService.get(['DOCUMENT.TitleEdit', 'DOCUMENT.TitleCreate']).subscribe(translations => {
            switch (_data.title) {
                case 'Edit document form':
                    this.dialogTitle = translations['DOCUMENT.TitleEdit'];
                    break;
                case 'Add document form':
                    this.dialogTitle = translations['DOCUMENT.TitleCreate'];
                    break;

            }
        });
        // this.dialogTitle = _data.title
        this.action = _data.action;
        this.document = _data.document;
    }

    ngOnInit() {
        this.createForm();
    }

    createForm() {
        this.pictureSrc = this.document && this.document.image ? 'data:image/jpeg;base64,' + this.document.image : '';
        this.documentForm = this._formBuilder.group({
            id: [this.document && this.document.id ? this.document.id : ''],
            title: [this.document && this.document.title ? this.document.title : '', Validators.required],
            image: [null],
            document: [this.document && this.document.document ? this.document.document.name : '', Validators.required]
        });
        // if (this.action === 'edit') {
        //     this.isEdit = true;
        // }
        this.documentReceive = this.document && this.document.document ? this.document.document : '';
    }

    ngAction() {
        const formData = new FormData();
        let messages;
        if (this.action === 'edit') {
            formData.append('action', 'edit');
            messages = 'Edit document';
        } else {
            formData.append('action', 'add');
            messages = 'Add document';
        }
        formData.append('formValues', JSON.stringify(this.documentForm.value));
        formData.append('image', this.pictureUpload);
        formData.append('document', this.fileUpload);
        this.settingService.createDocument(formData).subscribe(
            () => {
            },
            error => {
                this._matSnackBar.open(messages + ` failed with error: ${error.error.messages}`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            },
            () => {
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
                fileReader.onload = () => {
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

    onFileSelect(event) {
        if (event.target.files.length > 0) {
            const fileImport: File = event.target.files[0];
            this.fileUpload = fileImport;
            this.documentForm.controls['document'].setValue(fileImport.name);
            this.documentReceive = '';
            this.fileName = fileImport.name;
            this.isShowed = true;
        }
    }

    navigateToDownload(documentInput: any) {
        this.commonUtil.documentDownload(documentInput).then(() => {
        });
    }
}
