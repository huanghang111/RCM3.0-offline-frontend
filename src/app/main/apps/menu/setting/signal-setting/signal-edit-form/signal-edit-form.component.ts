import { Component, Inject, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';
import { SettingService } from 'app/main/apps/services/setting.service';
import { AuthStore } from '@rcm/_authentication/auth.store';
import {
    DATA_TYPE_BOOL,
    DATA_TYPE_CATALOG,
    DATA_TYPE_FLOAT,
    DATA_TYPE_INT16,
    DATA_TYPE_INT32,
    DATA_TYPE_INTENSIVE,
    TRIGGER_INTERVALS
} from '../../../../../../../@rcm/_helpers/constant/signal-constants';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { SignalService } from 'app/main/apps/services/signal.service';
import { CommonUtilitiesService } from '../../../../../../../@rcm/_helpers/common-utilities.service';
import { environment } from '../../../../../../../environments/environment';
import { RelatedSignalFormComponent } from '@rcm/components/related-signal-form/related-signal-form.component';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-signal-edit-form',
    templateUrl: './signal-edit-form.component.html',
    styleUrls: ['./signal-edit-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class SignalEditFormComponent implements OnInit {

    @ViewChild('numericForm') numericForm: TemplateRef<any>;
    @ViewChild('booleanForm') booleanForm: TemplateRef<any>;
    @ViewChild('intensiveForm') intensiveForm: TemplateRef<any>;
    @ViewChild('catalogForm') catalogForm: TemplateRef<any>;
    currentTemplate: TemplateRef<any>;
    editSignalForm: FormGroup;
    // listDataType: any[];
    currentSignal: any;

    isCatalog: boolean;
    isFloat: boolean;
    isManual: boolean;
    isOneDay: boolean;
    valid: boolean = true;

    pictureUpload: File = null;
    pictureSrc: any = null;
    docUploads: Array<any> = [];

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
        placeholder: '',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            { class: 'arial', name: 'Arial' },
            { class: 'times-new-roman', name: 'Times New Roman' },
            { class: 'calibri', name: 'Calibri' },
            { class: 'comic-sans-ms', name: 'Comic Sans MS' }
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

    constructor(
        public matDialogRef: MatDialogRef<SignalEditFormComponent>,
        private _formBuilder: FormBuilder,
        private settingService: SettingService,
        private signalService: SignalService,
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private authStore: AuthStore,
        private commonUtil: CommonUtilitiesService,
        private datePipe: DatePipe,
        @Inject(MAT_DIALOG_DATA) private _data: any) {
        matDialogRef.disableClose = true;
    }

    get links(): any {
        return this.editSignalForm.get('links') as FormArray;
    }

    get form() {
        return this.editSignalForm.controls;
    }

    ngOnInit() {
        this.signalService.getSignalByName(this._data.signalName).subscribe(
            res => {
                if (res.code === 200 && res.data.signal) {
                    this.currentSignal = res.data.signal;
                }
            },
            error => {
                console.log(error);
            }, () => {
                this.initForm();
            }
        );
    }

    initForm(): void {
        let hour: string = '', minute: string = '', triggerInterval : number;

        if (this.currentSignal.triggerInterval && this.currentSignal.createdDate) {
            triggerInterval = TRIGGER_INTERVALS.find(e=> e.name === this.currentSignal.triggerInterval).value;
            let date = new Date(Date.parse(this.currentSignal.createdDate) + triggerInterval * 1000);
            hour = date.getHours().toString();
            minute = date.getMinutes().toString();
        }

        let digit: number = 0;
        if (this.currentSignal.digit) {
            digit = parseInt(this.currentSignal.digit);
        }

        if (this.currentSignal.documents && this.currentSignal.documents.length > 0) {
            this.currentSignal.documents.forEach(element => {
                this.docUploads.push(new Object({
                    id: element.id,
                    name: element.name,
                    docType: element.type,
                    url: element.url
                }));
            });
        }

        this.editSignalForm = this._formBuilder.group({
            signalId: [{ value: this.currentSignal.signalId, disabled: true }],
            signalName: [{ value: this.currentSignal.name, disabled: true }],
            description: [this.currentSignal.descriptions],
            dataType: [{ value: this.currentSignal.dataType.name, disabled: true }, Validators.required],
            unit: [this.currentSignal.unit],

            plcId: [{ value: this.currentSignal.plcId, disabled: true }, Validators.required],
            cmd: [{ value: this.currentSignal.cmd, disabled: true }, Validators.required],
            subDataType: [{ value: this.currentSignal.subDataType, disabled: true }, Validators.required],
            mode: [this.currentSignal.mode],
            interval: [this.currentSignal.interval],
            dataSize: [this.currentSignal.dataSize, [Validators.required, Validators.pattern('^[0-9]*$')]],
            dataLength: [this.currentSignal.dataLength, [Validators.required, Validators.pattern('^[0-9]*$')]],
            totalLength: [this.currentSignal.totalLength, [Validators.required, Validators.pattern('^[0-9]*$')]],

            threshTooLow: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[0]
                ? this.getThresholdByLevel(this.THRESHOLD_MIN_MIN) : ''],
            threshLow: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[1]
                ? this.getThresholdByLevel(this.THRESHOLD_MIN) : ''],
            threshHigh: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[2]
                ? this.getThresholdByLevel(this.THRESHOLD_MAX) : ''],
            threshTooHigh: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[3]
                ? this.getThresholdByLevel(this.THRESHOLD_MAX_MAX) : ''],

            errorTooLow: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[0]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MIN_MIN) : '',],
            errorLow: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[1]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MIN) : ''],
            errorHigh: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[2]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MAX) : ''],
            errorTooHigh: [this.currentSignal.thresholds && this.currentSignal.thresholds.length > 0 && this.currentSignal.thresholds[3]
                ? this.getMessageErrorByLevel(this.THRESHOLD_MAX_MAX) : ''],

            picture: [''],
            document: [],
            digit: [digit, [Validators.max(4), Validators.min(0)]],

            threshold: [this.currentSignal.thresholds[0] ? this.currentSignal.thresholds[0].values : ''],
            displayTrue: [this.currentSignal.displayTrue ? this.currentSignal.displayTrue : ''],
            displayFalse: [this.currentSignal.displayFalse ? this.currentSignal.displayFalse : ''],
            errorMessage: [this.currentSignal.thresholds[0] ? this.currentSignal.thresholds[0].errorMessages : ''],

            methodTrigger: [{ value: this.currentSignal.triggerType, disabled: true }],
            timeTrigger: [this.currentSignal.triggerInterval],
            hour: [{ value: hour, disabled: true }],
            minute: [{ value: minute, disabled: true }],
            tag: [this.currentSignal.tag ? this.currentSignal.tag : ''],
            relatedData: '',
            links: this.initLinkControl()
        });

        this.htmlContent = this.form.description.value;
        this.editSignalForm.controls['timeTrigger'].disable();

        this.initDatatype();
    }

    initDatatype(): void {
        this.isCatalog = false;

        switch (this.currentSignal.dataType.name) {
            case DATA_TYPE_FLOAT: {
                this.isFloat = true;
                this.initNumeric();
                break;
            }
            case DATA_TYPE_BOOL: {
                this.initBoolean();
                break;
            }
            case DATA_TYPE_INTENSIVE: {
                this.initIntensive();
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

    initLinkControl(): any {
        if (this.currentSignal.links && this.currentSignal.links.length > 0) {
            const listLink = this._formBuilder.array([]);
            this.currentSignal.links.forEach(item => {
                listLink.push(this._formBuilder.control(item.values));
            });
            return listLink;
        } else {
            return this._formBuilder.array([
                this._formBuilder.control('')]);
        }
    }

    getThresholdByLevel(level: string): string {
        return this.currentSignal.thresholds.find(e => e.level === level) ? this.currentSignal.thresholds.find(e => e.level === level).values : '';
    }

    getMessageErrorByLevel(level: string): any {
        return this.currentSignal.thresholds.find(e => e.level === level) ? this.currentSignal.thresholds.find(e => e.level === level).errorMessages : '';
    }

    convertDate(date): string {
        return this.datePipe.transform(date, 'yyyy-MM-dd HH:MM:ss');
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

    initIntensive(): void {
        this.currentTemplate = this.intensiveForm;
    }

    initCatalog(): void {
        this.currentTemplate = this.catalogForm;
    }

    onSave(): void {
        this.removeUnusedFieldAndFormatString();
        this.enableFields();
        const formData = new FormData();

        if (this.isCatalog) {
            this.editSignalForm.controls['description'].setValue(this.htmlContent);
        }

        if (this.docUploads.length > 0) {
            let docName: Array<String> = [];
            this.docUploads.forEach(e => {
                docName.push(e.name);
                formData.append('fileDocument', e);
            });
            this.editSignalForm.controls['document'].setValue(docName);
        }

        formData.append('formValues', JSON.stringify(this.editSignalForm.value));
        formData.append('image', this.pictureUpload);
        formData.append('projectId', this.authStore.getProjectId());

        this.validationForForm(this.editSignalForm);

        if (this.editSignalForm.valid) {
            this.settingService.update(formData).subscribe(
                () => {
                },
                error => {
                    console.log(error);
                    this._matSnackBar.open(`Update ${this.editSignalForm.get('signalName').value} failed with error: ${error.message}`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 5000
                    });
                },
                () => {
                    this.matDialogRef.close({
                        status: 'success'
                    });
                    this._matSnackBar.open(`Update ${this.editSignalForm.get('signalName').value} successfully`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
            );
        } else {
            this.disableFields();
            this.valid = false;
            this.markFormAsTouched(this.editSignalForm);
        }
    }

    removeUnusedFieldAndFormatString(): void {
        const dataType = this.editSignalForm.get('dataType').value;
        switch (dataType) {
            case DATA_TYPE_BOOL: {
                this.editSignalForm.removeControl('threshTooLow');
                this.editSignalForm.removeControl('threshLow');
                this.editSignalForm.removeControl('threshHigh');
                this.editSignalForm.removeControl('threshTooHigh');
                this.editSignalForm.removeControl('errorTooLow');
                this.editSignalForm.removeControl('errorLow');
                this.editSignalForm.removeControl('errorHigh');
                this.editSignalForm.removeControl('errorTooHigh');
                this.editSignalForm.removeControl('errorTooHigh');

                this.editSignalForm.removeControl('unit');
                this.editSignalForm.removeControl('digit');

                this.editSignalForm.removeControl('methodTrigger');
                this.editSignalForm.removeControl('timeTrigger');
                this.editSignalForm.removeControl('hour');
                this.editSignalForm.removeControl('minute');

                this.editSignalForm.removeControl('tag');
                this.editSignalForm.removeControl('links');

                this.editSignalForm.controls['threshold'].setValue(this.editSignalForm.controls['threshold'].value.toString());
                break;
            }
            case DATA_TYPE_INTENSIVE: {
                this.editSignalForm.removeControl('threshTooLow');
                this.editSignalForm.removeControl('threshLow');
                this.editSignalForm.removeControl('threshHigh');
                this.editSignalForm.removeControl('threshTooHigh');
                this.editSignalForm.removeControl('errorTooLow');
                this.editSignalForm.removeControl('errorLow');
                this.editSignalForm.removeControl('errorHigh');
                this.editSignalForm.removeControl('errorTooHigh');
                this.editSignalForm.removeControl('errorTooHigh');

                this.editSignalForm.removeControl('unit');
                this.editSignalForm.removeControl('digit');

                this.editSignalForm.removeControl('threshold');
                this.editSignalForm.removeControl('displayTrue');
                this.editSignalForm.removeControl('displayFalse');
                this.editSignalForm.removeControl('errorMessage');

                this.editSignalForm.removeControl('tag');
                this.editSignalForm.removeControl('links');
                this.editSignalForm.removeControl('relatedData');
                break;
            }
            case DATA_TYPE_CATALOG: {
                this.editSignalForm.removeControl('threshTooLow');
                this.editSignalForm.removeControl('threshLow');
                this.editSignalForm.removeControl('threshHigh');
                this.editSignalForm.removeControl('threshTooHigh');
                this.editSignalForm.removeControl('errorTooLow');
                this.editSignalForm.removeControl('errorLow');
                this.editSignalForm.removeControl('errorHigh');
                this.editSignalForm.removeControl('errorTooHigh');
                this.editSignalForm.removeControl('errorTooHigh');

                this.editSignalForm.removeControl('unit');
                this.editSignalForm.removeControl('digit');

                this.editSignalForm.removeControl('threshold');
                this.editSignalForm.removeControl('displayTrue');
                this.editSignalForm.removeControl('displayFalse');
                this.editSignalForm.removeControl('errorMessage');

                this.editSignalForm.removeControl('relatedData');
                this.editSignalForm.removeControl('methodTrigger');
                this.editSignalForm.removeControl('timeTrigger');
                this.editSignalForm.removeControl('hour');
                this.editSignalForm.removeControl('minute');
                break;
            }
            default: {
                this.editSignalForm.removeControl('methodTrigger');
                this.editSignalForm.removeControl('timeTrigger');
                this.editSignalForm.removeControl('hour');
                this.editSignalForm.removeControl('minute');

                this.editSignalForm.removeControl('threshold');
                this.editSignalForm.removeControl('displayTrue');
                this.editSignalForm.removeControl('displayFalse');
                this.editSignalForm.removeControl('errorMessage');

                this.editSignalForm.removeControl('tag');
                this.editSignalForm.removeControl('links');

                this.editSignalForm.controls['digit'].setValue(this.editSignalForm.controls['digit'].value.toString());
                this.editSignalForm.controls['threshTooLow'].setValue(this.editSignalForm.controls['threshTooLow'].value.toString());
                this.editSignalForm.controls['threshLow'].setValue(this.editSignalForm.controls['threshLow'].value.toString());
                this.editSignalForm.controls['threshHigh'].setValue(this.editSignalForm.controls['threshHigh'].value.toString());
                this.editSignalForm.controls['threshTooHigh'].setValue(this.editSignalForm.controls['threshTooHigh'].value.toString());
                break;
            }
        }

        if (!this.currentSignal.plcId) {
            this.editSignalForm.removeControl('plcId');
            this.editSignalForm.removeControl('cmd');
            this.editSignalForm.removeControl('subDataType');
            this.editSignalForm.removeControl('mode');
            this.editSignalForm.removeControl('interval');
            this.editSignalForm.removeControl('dataSize');
            this.editSignalForm.removeControl('dataLength');
            this.editSignalForm.removeControl('totalLength');
        }
    }

    enableFields() {
        this.editSignalForm.controls['dataType'].enable();
        this.editSignalForm.controls['signalId'].enable();
        this.editSignalForm.controls['signalName'].enable();

        if (this.currentSignal.plcId) {
            this.editSignalForm.controls['plcId'].enable();
            this.editSignalForm.controls['cmd'].enable();
            if (this.currentSignal.dataType.name === DATA_TYPE_INTENSIVE) {
                this.editSignalForm.controls['subDataType'].enable();
                this.editSignalForm.controls['methodTrigger'].enable();
                this.editSignalForm.controls['timeTrigger'].enable();
                this.editSignalForm.controls['hour'].enable();
                this.editSignalForm.controls['minute'].enable();
            }
        }
    }

    disableFields() {
        this.editSignalForm.controls['dataType'].disable();
        this.editSignalForm.controls['signalId'].disable();
        this.editSignalForm.controls['signalName'].disable();

        if (this.currentSignal.plcId) {
            this.editSignalForm.controls['plcId'].disable();
            this.editSignalForm.controls['cmd'].disable();
            if (this.currentSignal.dataType.name === DATA_TYPE_INTENSIVE) {
                this.editSignalForm.controls['subDataType'].disable();
                this.editSignalForm.controls['methodTrigger'].disable();
                this.editSignalForm.controls['timeTrigger'].disable();
                this.editSignalForm.controls['hour'].disable();
                this.editSignalForm.controls['minute'].disable();
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

    navigateToDownload(document: any): void {
        if (document.id) {
            const data = {
                projectId: this.authStore.getProjectId(),
                signalName: this.currentSignal.name,
                docId: document.id
            };
            const url = `${environment.apiUrl}/api/signal/downloadDocument?signalName=${data.signalName}&projectId=${data.projectId}&docId=${data.docId}`;
            this.commonUtil.exportFileGetMethod(url, document.type, document.name)
                .catch(error => {
                    if (error.status === 404) {
                        this._matSnackBar.open(`No data was found!!!`, 'NOT FOUND', {
                            verticalPosition: 'bottom',
                            duration: 3000
                        });
                    }
                });
        } else {
            this._matSnackBar.open(`This document is not uploaded yet.`, 'OK', {
                verticalPosition: 'bottom',
                duration: 3000
            });
        }
    }

    selectTriggerMethod(): void {
        const methodTrigger = this.editSignalForm.get('methodTrigger').value;
        this.isManual = methodTrigger === 'MANUAL';
    }

    selectTimeTrigger(): void {
        const timeTrigger = this.editSignalForm.get('timeTrigger').value;
        this.isOneDay = timeTrigger === '1 day';
    }

    getFullThresholdByLevel(level: string): any {
        return this.currentSignal.thresholds.find(e => e.level === level);
    }

    onRelated(level): void {
        const relatedSignal = {
            signalId: null,
            threshold: null
        };
        relatedSignal.signalId = [this.currentSignal.signalId];
        relatedSignal.threshold = [this.getFullThresholdByLevel(level)];
        if (relatedSignal.threshold !== undefined) {
            this.dialogRef = this._matDialog.open(RelatedSignalFormComponent, {
                panelClass: 'related-signal-form',
                data: {
                    relatedSignal: relatedSignal,
                    action: 'add'
                }
            });
        }
    }

    validationForForm(form: FormGroup) {
        const dataType = form.get('dataType').value;
        if (dataType === DATA_TYPE_INT16 || dataType === DATA_TYPE_INT32 || dataType === DATA_TYPE_FLOAT) {
            const tooLow = parseFloat(form.get('threshTooLow').value);
            const low = parseFloat(form.get('threshLow').value);
            const high = parseFloat(form.get('threshHigh').value);
            const tooHigh = parseFloat(form.get('threshTooHigh').value);

            if (tooLow >= low) {
                form.controls['threshTooLow'].setErrors({ 'Too low error': true });
                this.message = 'Error at threshold too low';
                this.inputThresholdError = true;
            }
            if (low >= high || low <= tooLow) {
                form.controls['threshLow'].setErrors({ 'Low error': true });
                this.message = 'Error at threshold low or too low';
                this.inputThresholdError = true;
            }
            if (high >= tooHigh || high <= low) {
                form.controls['threshHigh'].setErrors({ 'High error': true });
                this.message = 'Error at threshold high or low';
                this.inputThresholdError = true;
            }
            if (tooHigh <= high) {
                form.controls['threshTooHigh'].setErrors({ 'Too high error': true });
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
                    control.markAsTouched({ onlySelf: true });
                } else if (control instanceof FormGroup) {
                    this.markFormAsTouched(control);
                }
            }
        });
    }
}
