import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';
import {SignalAddRelatedFormComponent} from '../signal-add-related-form/signal-add-related-form.component';
import {AuthStore} from '@rcm/_authentication/auth.store';
import {
    DATA_TYPE_BOOL,
    DATA_TYPE_CATALOG,
    DATA_TYPE_FLOAT,
    DATA_TYPE_INT16,
    DATA_TYPE_INT32,
    DATA_TYPE_INTENSIVE
} from '../../../../../../../@rcm/_helpers/constant/signal-constants';
import {TranslateService} from '@ngx-translate/core';
import {AngularEditorConfig} from '@kolkov/angular-editor';

@Component({
    selector: 'app-signal-create-form',
    templateUrl: './signal-create-form.component.html',
    styleUrls: ['./signal-create-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SignalCreateFormComponent implements OnInit {

    @ViewChild('numericForm') numericForm: TemplateRef<any>;
    @ViewChild('booleanForm') booleanForm: TemplateRef<any>;
    @ViewChild('catalogForm') catalogForm: TemplateRef<any>;
    currentTemplate: TemplateRef<any>;
    createSignalForm: FormGroup;
    listDataType: any[];
    isCatalog: boolean;
    isFloat: boolean;
    isManual: boolean;
    isOneDay: boolean;
    valid: boolean = true;

    pictureUpload: File = null;
    pictureSrc: any = null;

    /////angular editor/////
    htmlContent = '';
    config: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: '15rem',
        minHeight: '5rem',
        width: 'auto',
        minWidth: '0',
        enableToolbar: true,
        showToolbar: true,
        placeholder: this._translateService.instant('CONFIGURATION.Signal.DiaglogEdit.EnterText'),
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            {class: 'arial', name: 'Arial'},
            {class: 'times-new-roman', name: 'Times New Roman'},
            {class: 'calibri', name: 'Calibri'},
            {class: 'comic-sans-ms', name: 'Comic Sans MS'}
        ],
        sanitize: true,
        toolbarPosition: 'top',
    };
    //////////////////////

    message: string;
    inputThresholdError = false;
    dialogRef: any;
    THRESHOLD_MIN = 'Low';
    THRESHOLD_MIN_MIN = 'Too_Low';
    THRESHOLD_MAX_MAX = 'Too_High';
    THRESHOLD_MAX = 'High';
    THRESHOLD_BOOL = '';

    docUploads = [];

    constructor(
        public matDialogRef: MatDialogRef<SignalCreateFormComponent>,
        private _formBuilder: FormBuilder,
        private settingService: SettingService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private authStore: AuthStore, private _translateService: TranslateService
    ) {
        matDialogRef.disableClose = true;
    }

    get links(): any {
        return this.createSignalForm.get('links') as FormArray;
    }

    get relatedData(): any {
        return this.createSignalForm.get('relatedData') as FormArray;
    }

    ngOnInit() {
        this.settingService.getListDataType().subscribe(
            res => {
                this.listDataType = res.body.data.dataTypeList.filter(e => e.name !== 'INTENSIVE');
            }
        );
        this.initForm();
    }

    initForm(): void {
        this.createSignalForm = this._formBuilder.group({
            signalId: ['', Validators.required],
            signalName: ['', Validators.required],
            description: [''],
            dataType: ['', Validators.required],
            unit: [''],

            threshTooLow: [''],
            threshLow: [''],
            threshHigh: [''],
            threshTooHigh: [''],

            errorTooLow: [''],
            errorLow: [''],
            errorHigh: [''],
            errorTooHigh: [''],

            digit: [0, [Validators.max(4), Validators.min(0)]],

            threshold: [''],
            displayTrue: [''],
            displayFalse: [''],
            errorMessage: [''],

            methodTrigger: [null],
            timeTrigger: [null],
            hour: [null, [Validators.min(0), Validators.max(23)]],
            minute: [null, [Validators.min(0), Validators.max(59)]],

            tag: [''],
            relatedData: this._formBuilder.array([]),
            links: this._formBuilder.array([])
        });
        this.dataTypeSelect();
    }

    addlink(): void {
        this.links.push(this._formBuilder.control(''));
    }

    removeLink(index): void {
        this.links.removeAt(index);
    }

    initNumeric(): void {
        this.currentTemplate = this.numericForm;
    }

    initBoolean(): void {
        this.currentTemplate = this.booleanForm;
    }

    initCatalog(): void {
        this.currentTemplate = this.catalogForm;
    }

    dataTypeSelect(): void {
        const dataType = this.createSignalForm.get('dataType').value;
        this.isCatalog = false;

        switch (dataType) {
            case DATA_TYPE_FLOAT: {
                this.isFloat = true;
                this.initNumeric();
                break;
            }
            case DATA_TYPE_BOOL: {
                this.initBoolean();
                break;
            }
            case DATA_TYPE_CATALOG: {
                this.isCatalog = true;
                this.initCatalog();
                break;
            }
            case 'INT16':
            case 'INT32': {
                this.isFloat = false;
                this.initNumeric();
                break;
            }
        }
    }

    onSave(): void {
        this.removeUnusedFieldAndFormatString();
        if (this.isCatalog) {
            this.createSignalForm.controls['description'].setValue(this.htmlContent);
        }
        const formData = new FormData();
        for (let i = 0; i < this.docUploads.length; i++) {
            const fileItem = this.docUploads[i];
            formData.append('fileDocument', fileItem);
        }
        formData.append('formValues', JSON.stringify(this.createSignalForm.value));
        formData.append('image', this.pictureUpload);
        formData.append('projectId', this.authStore.getProjectId());

        this.validationForForm(this.createSignalForm);
        if (this.createSignalForm.valid) {
            this.settingService.add(formData).subscribe(
                () => {
                },
                error => {
                    console.log(error);
                    this._matSnackBar.open(`Update ${this.createSignalForm.get('signalId').value} failed with error: ${error.message}`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                () => {
                    this.matDialogRef.close({
                        status: 'success'
                    });
                    this._matSnackBar.open(`Added ${this.createSignalForm.get('signalId').value} successfully`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            );
        } else {
            this.valid = false;
            this.markFormAsTouched(this.createSignalForm);
        }
    }

    removeUnusedFieldAndFormatString(): void {
        const dataType = this.createSignalForm.get('dataType').value;
        switch (dataType) {
            case DATA_TYPE_BOOL: {
                this.createSignalForm.removeControl('threshTooLow');
                this.createSignalForm.removeControl('threshLow');
                this.createSignalForm.removeControl('threshHigh');
                this.createSignalForm.removeControl('threshTooHigh');
                this.createSignalForm.removeControl('errorTooLow');
                this.createSignalForm.removeControl('errorLow');
                this.createSignalForm.removeControl('errorHigh');
                this.createSignalForm.removeControl('errorTooHigh');
                this.createSignalForm.removeControl('errorTooHigh');

                this.createSignalForm.removeControl('unit');
                this.createSignalForm.removeControl('digit');

                this.createSignalForm.removeControl('methodTrigger');
                this.createSignalForm.removeControl('timeTrigger');
                this.createSignalForm.removeControl('hour');
                this.createSignalForm.removeControl('minute');

                this.createSignalForm.removeControl('tag');
                this.createSignalForm.removeControl('links');

                this.createSignalForm.controls['threshold'].setValue(this.createSignalForm.controls['threshold'].value.toString());
                break;
            }
            case DATA_TYPE_INTENSIVE: {
                this.createSignalForm.removeControl('threshTooLow');
                this.createSignalForm.removeControl('threshLow');
                this.createSignalForm.removeControl('threshHigh');
                this.createSignalForm.removeControl('threshTooHigh');
                this.createSignalForm.removeControl('errorTooLow');
                this.createSignalForm.removeControl('errorLow');
                this.createSignalForm.removeControl('errorHigh');
                this.createSignalForm.removeControl('errorTooHigh');
                this.createSignalForm.removeControl('errorTooHigh');

                this.createSignalForm.removeControl('unit');
                this.createSignalForm.removeControl('digit');

                this.createSignalForm.removeControl('threshold');
                this.createSignalForm.removeControl('displayTrue');
                this.createSignalForm.removeControl('displayFalse');
                this.createSignalForm.removeControl('errorMessage');

                this.createSignalForm.removeControl('tag');
                this.createSignalForm.removeControl('links');
                this.createSignalForm.removeControl('relatedData');
                break;
            }
            case DATA_TYPE_CATALOG: {
                this.createSignalForm.removeControl('threshTooLow');
                this.createSignalForm.removeControl('threshLow');
                this.createSignalForm.removeControl('threshHigh');
                this.createSignalForm.removeControl('threshTooHigh');
                this.createSignalForm.removeControl('errorTooLow');
                this.createSignalForm.removeControl('errorLow');
                this.createSignalForm.removeControl('errorHigh');
                this.createSignalForm.removeControl('errorTooHigh');
                this.createSignalForm.removeControl('errorTooHigh');

                this.createSignalForm.removeControl('unit');
                this.createSignalForm.removeControl('digit');

                this.createSignalForm.removeControl('threshold');
                this.createSignalForm.removeControl('displayTrue');
                this.createSignalForm.removeControl('displayFalse');
                this.createSignalForm.removeControl('errorMessage');

                this.createSignalForm.removeControl('relatedData');
                this.createSignalForm.removeControl('methodTrigger');
                this.createSignalForm.removeControl('timeTrigger');
                this.createSignalForm.removeControl('hour');
                this.createSignalForm.removeControl('minute');
                break;
            }
            default: {
                this.createSignalForm.removeControl('methodTrigger');
                this.createSignalForm.removeControl('timeTrigger');
                this.createSignalForm.removeControl('hour');
                this.createSignalForm.removeControl('minute');

                this.createSignalForm.removeControl('threshold');
                this.createSignalForm.removeControl('displayTrue');
                this.createSignalForm.removeControl('displayFalse');
                this.createSignalForm.removeControl('errorMessage');

                this.createSignalForm.removeControl('tag');
                this.createSignalForm.removeControl('links');

                this.createSignalForm.controls['digit'].setValue(this.createSignalForm.controls['digit'].value.toString());
                this.createSignalForm.controls['threshTooLow'].setValue(this.createSignalForm.controls['threshTooLow'].value.toString());
                this.createSignalForm.controls['threshLow'].setValue(this.createSignalForm.controls['threshLow'].value.toString());
                this.createSignalForm.controls['threshHigh'].setValue(this.createSignalForm.controls['threshHigh'].value.toString());
                this.createSignalForm.controls['threshTooHigh'].setValue(this.createSignalForm.controls['threshTooHigh'].value.toString());
                break;
            }
        }
    }

    onFileSelected(event): void {
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                const docImport: File = event.target.files[i];
                this.docUploads.push(docImport);
            }
        }
    }

    onPictureSelect(event): void {
        const typeAccept = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg'];
        if (event.target.files.length > 0) {
            const imageImport: File = event.target.files[0];
            if (typeAccept.indexOf(imageImport.type) !== -1) {
                this.pictureUpload = imageImport;

                // read picture content and show it
                const fileReader = new FileReader();
                // console.log(event.target.files[0]);
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

    removeUploadDoc(index): void {
        this.docUploads.splice(index, 1);
    }

    selectTriggerMethod(): void {
        const methodTrigger = this.createSignalForm.get('methodTrigger').value;
        this.isManual = methodTrigger === 'MANUAL';
    }

    selectTimeTrigger(): void {
        const timeTrigger = this.createSignalForm.get('timeTrigger').value;
        this.isOneDay = timeTrigger === '1 day';
    }

    relatedSignalButton(threshold): void {
        this.dialogRef = this._matDialog.open(SignalAddRelatedFormComponent, {
            panelClass: 'signal-add-related-form',
            data: {
                relatedSignal: threshold,
                action: 'add'
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.relatedData.push(this._formBuilder.group({
                    data: res.data
                }));
            }
        });
    }

    validationForForm(form: FormGroup) {
        const dataType = form.get('dataType').value;
        if (dataType === DATA_TYPE_INT16 || dataType === DATA_TYPE_INT32 || dataType === DATA_TYPE_FLOAT) {
            const tooLow = parseFloat(form.get('threshTooLow').value);
            const low = parseFloat(form.get('threshLow').value);
            const high = parseFloat(form.get('threshHigh').value);
            const tooHigh = parseFloat(form.get('threshTooHigh').value);

            if (tooLow >= low) {
                form.controls['threshTooLow'].setErrors({'Too low error': true});
                this.message = 'Error at threshold too low';
                this.inputThresholdError = true;
            }
            if (low >= high || low <= tooLow) {
                form.controls['threshLow'].setErrors({'Low error': true});
                this.message = 'Error at threshold low or too low';
                this.inputThresholdError = true;
            }
            if (high >= tooHigh || high <= low) {
                form.controls['threshHigh'].setErrors({'High error': true});
                this.message = 'Error at threshold high or low';
                this.inputThresholdError = true;
            }
            if (tooHigh <= high) {
                form.controls['threshTooHigh'].setErrors({'Too high error': true});
                this.message = 'Error at threshold too high or too high';
                this.inputThresholdError = true;
            }
            setTimeout(() => {
                this.inputThresholdError = false;
                form.controls['threshTooLow'].setErrors(null);
                form.controls['threshLow'].setErrors(null);
                form.controls['threshHigh'].setErrors(null);
                form.controls['threshTooHigh'].setErrors(null);
            }, 2000);
        }
    }

    markFormAsTouched(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            if (formGroup.contains(field)) {
                const control = formGroup.get(field);

                if (control instanceof FormControl) {
                    control.markAsTouched({onlySelf: true});
                } else if (control instanceof FormGroup) {
                    this.markFormAsTouched(control);
                }
            }
        });
    }
}
