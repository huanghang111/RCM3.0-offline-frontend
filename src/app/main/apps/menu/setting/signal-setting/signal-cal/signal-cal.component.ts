import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';

import {Calculation, Method, Signal} from 'app/main/apps/menu/signal/signal.model';
import {SettingService} from 'app/main/apps/services/setting.service';
import {AuthStore} from '../../../../../../../@rcm/_authentication/auth.store';
import {DATA_TYPE_BOOL, DATA_TYPE_FLOAT, DATA_TYPE_INT16, DATA_TYPE_INT32} from '../../../../../../../@rcm/_helpers/constant/signal-constants';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'signal-cal',
    templateUrl: './signal-cal.component.html',
    styleUrls: ['./signal-cal.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class SignalCalDialogComponent implements OnInit {

    currentCalculation: Calculation = new Calculation({});

    methodOnes: Method[] = [];
    signalOnes: Signal[] = [];
    currentSignalOne: Signal;

    methodTwos: Method[] = [];
    signalTwos: Signal[] = [];
    currentSignalTwo: Signal;

    outputSignals: Signal[];

    dialogTitle: string = '';
    currentDialogType: string = '';
    result: string = '';
    valid: boolean = true;
    public newSignalForm = new FormGroup({
        'id': new FormControl(0, [Validators.required]),
        'signalOne': new FormControl('', [Validators.required]),
        'methodOne': new FormControl(null),
        'signalTwo': new FormControl(null),
        'methodTwo': new FormControl(''),
        'newSignalName': new FormControl('', [Validators.required, Validators.maxLength(50)]),
        'dataType': new FormControl(''),
        'signalType': new FormControl(''),
        'outputSignalId': new FormControl(''),
    });

    /**
     * Constructor
     *
     * @param {MatDialogRef<SignalNormalCalDialogComponent>} matDialogRef
     * @param settingService
     * @param _matSnackBar
     * @param _data
     * @param authStore
     * @param _translateService
     */
    constructor(
        public matDialogRef: MatDialogRef<SignalCalDialogComponent>,
        private settingService: SettingService,
        private _matSnackBar: MatSnackBar,
        private authStore: AuthStore,
        private _translateService: TranslateService,
        @Inject(MAT_DIALOG_DATA) private _data: any) {
        matDialogRef.disableClose = true;
        this.currentDialogType = _data.type;
        // console.log(this.currentDialogType);

        this.dialogTitle = `Create new ${this.currentDialogType} calculation`;

        if (this.currentDialogType === 'diagnose') {
            this.form.outputSignalId.setValidators([Validators.required]);
            this.newSignalForm.removeControl('newSignalName');
            this.getSignalFaults();
        }

        switch (this.currentDialogType) {
            case 'fault':
                this._translateService.get('CONFIGURATION.Signal.Calculation.NewFault').subscribe(translation => {
                    this.dialogTitle = translation;
                });
                break;
            case 'normal':
                this._translateService.get('CONFIGURATION.Signal.Calculation.NewNormal').subscribe(translation => {
                    this.dialogTitle = translation;
                });
                break;
            case 'diagnose':
                this._translateService.get('CONFIGURATION.Signal.Calculation.NewDiagnose').subscribe(translation => {
                    this.dialogTitle = translation;
                });
                break;

        }
        // this.dialogTitle = `New ${this.currentDialogType} calculation`;
    }

    get form() {
        return this.newSignalForm.controls;
    }

    ngOnInit() {
        this.getSignals();
        this.disableFields();
        this.onChanges();
    }

    getSignals() {
        this.settingService.getSignalsByTypeNotIn(['INTENSIVE', 'CATALOG'], 0, 999).subscribe(
            res => {
                if (res.code === 200) {
                    console.log(res);
                    this.signalOnes = res.data.signals;
                    // console.log(this.signalOnes);
                }
            }, error => {
                console.log(error);
            }
        );
    }

    getSignalFaults(): void {
        this.settingService.getAllSignalFault(0, 9999).subscribe(
            res => {
                if (res.code === 200) {
                    this.outputSignals = res.data.signalFault;
                }
            },
            err => console.log(err)
        );
    }

    onSignalOneChange(event) {
        this.currentSignalOne = this.signalOnes.filter(element => element.name == event.value)[0];
        switch (this.currentSignalOne.dataType.name) {
            case DATA_TYPE_FLOAT:
            case DATA_TYPE_INT32:
            case DATA_TYPE_INT16:
                this.initINT();
                break;
            case DATA_TYPE_BOOL:
                this.initBOOLEAN();
                break;
        }
        this.sigOneChangeReset();
    }

    onSignalTwoChange(event) {
        if (event.value) {
            this.currentSignalTwo = this.signalTwos.filter(element => element.name == event.value)[0];
            this.form.methodTwo.setValidators([Validators.required]);
            this.form.methodTwo.enable();
            console.log(this.currentSignalTwo);
        } else {
            this.form.methodTwo.setValidators(null);
            this.form.methodTwo.setValue('');
            this.form.methodTwo.disable();
        }
    }

    initINT() {
        this.settingService.getMethodsByType('NUMERIC').subscribe(
            res => {
                if (res.code == 200) {
                    this.methodOnes = res.data.methodList.filter(e => e.value != 'add' && e.value != 'lesser' && e.value != 'greater' &&
                        e.value != 'equal' && e.value != 'not_equal' && e.value != 'multi' && e.value != 'div');
                    this.methodTwos = res.data.methodList.filter(e => e.value != 'x10' && e.value != 'x100' && e.value != 'x0.1' &&
                        e.value != 'x0.01');
                    if (this.currentDialogType === 'fault') {
                        this.methodTwos = this.methodTwos.filter(e => e.value != 'add' && e.value != 'sub' && e.value != 'multi' && e.value != 'div');
                    }
                }
            },
            error => console.log(error)
        );
        this.signalTwos = this.signalOnes.filter(element => element.dataType.name != 'BOOL');
        this.enableFields();
    }

    initBOOLEAN() {
        this.settingService.getMethodsByType('BOOLEAN').subscribe(
            res => {
                if (res.code == 200) {
                    this.methodOnes = res.data.methodList.filter(e => e.value != 'AND' && e.value != 'OR');
                    this.methodTwos = res.data.methodList.filter(e => e.value != 'NOT');
                }
            },
            error => console.log(error),
            () => {
                this.signalTwos = this.signalOnes.filter(element => element.dataType.name == 'BOOL');
                this.enableFields();
            }
        );
    }

    disableFields() {
        this.form.methodOne.disable();
        this.form.signalTwo.disable();
        this.form.methodTwo.disable();
    }

    enableFields() {
        this.form.methodOne.enable();
        this.form.signalTwo.enable();
    }

    onAdd() {
        if (this.newSignalForm.valid) {
            if (this.currentDialogType === 'normal' || this.currentDialogType === 'fault') {
                if (this.currentDialogType === 'normal') {
                    switch (this.form.methodTwo.value) {
                        case 'lesser':
                        case 'greater':
                        case 'equal':
                        case 'not_equal': {
                            this.form.dataType.setValue(DATA_TYPE_BOOL);
                            break;
                        }
                        default: {
                            this.form.dataType.setValue(this.extractDataType());
                            break;
                        }
                    }
                } else if (this.currentDialogType === 'fault') {
                    this.form.dataType.setValue(DATA_TYPE_BOOL);
                }
                this.form.signalType.setValue(this.currentDialogType);
                this.settingService.updateCalculation(this.newSignalForm.value).subscribe(
                    res => {
                    },
                    error => {
                        console.log(error);
                        this._matSnackBar.open('Error creating new signal, caused by ' + error.error.messages, 'OK', {
                            verticalPosition: 'top',
                            duration: 3000
                        });
                    },
                    () => {
                        this.matDialogRef.close({
                            status: 'success'
                        });
                        this._matSnackBar.open('New signal Saved', 'OK', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                    }
                );
            } else if (this.currentDialogType === 'diagnose') {
                this.settingService.updateDiagnoseCalculation(this.newSignalForm.value).subscribe(
                    res => {
                    },
                    error => this._matSnackBar.open('Error creating new diagnose', 'OK', {
                        verticalPosition: 'top',
                        duration: 3000
                    }),
                    () => {
                        this.matDialogRef.close({
                            status: 'success'
                        });
                        this._matSnackBar.open('New diagnose saved', 'OK', {
                            verticalPosition: 'top',
                            duration: 2000
                        });
                    }
                );
            }
        } else {
            this.valid = false;
            this.validateAllFormFields(this.newSignalForm);
        }
    }

    extractDataType(): string {
        if (this.currentSignalTwo) {
            if (this.currentSignalOne.dataType.name == this.currentSignalTwo.dataType.name) {
                return this.currentSignalOne.dataType.name;
            } else {
                if (this.currentSignalOne.dataType.name == 'FLOAT' || this.currentSignalTwo.dataType.name == 'FLOAT') {
                    return 'FLOAT';
                } else {
                    return 'INT32';
                }
            }
        } else {
            return this.currentSignalOne.dataType.name;
        }
    }

    onChanges(): void {
        this.newSignalForm.valueChanges.subscribe(val => {
            if (this.currentDialogType === 'normal' || this.currentDialogType === 'fault') {

                if (this.form.methodOne.value != '' && this.form.methodOne.value != null) {
                    if (this.form.methodTwo.value != '' && this.form.methodTwo.value != null) {
                        this.result = this.form.newSignalName.value + ' = ' + this.methodOnes.filter(e => e.value == this.form.methodOne.value)[0].name + ' ' +
                            this.form.signalOne.value + ' ' + this.methodTwos.filter(e => e.value == this.form.methodTwo.value)[0].name + ' ' + this.form.signalTwo.value;
                    } else {
                        this.result = this.form.newSignalName.value + ' = ' + this.methodOnes.filter(e => e.value == this.form.methodOne.value)[0].name + ' ' +
                            this.form.signalOne.value;
                    }
                } else if (this.form.methodTwo.value != '') {
                    this.result = this.form.newSignalName.value + ' = ' + this.form.signalOne.value + ' ' + this.methodTwos.filter(e => e.value == this.form.methodTwo.value)[0].name +
                        ' ' + this.form.signalTwo.value;
                } else {
                    this.result = this.form.newSignalName.value + ' = ' + this.form.signalOne.value;
                }
            }

            this.valid = this.newSignalForm.valid;
        });
    }

    sigOneChangeReset() {
        this.form.methodOne.setValue(null);
        this.form.signalTwo.setValue(null);
        this.form.methodTwo.setValue('');
        this.form.methodTwo.disable();
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof FormControl) {
                control.markAsTouched({onlySelf: true});
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }
}
