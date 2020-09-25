import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';
import {DATA_TYPE_INTENSIVE, RELATED_INTENSIVE, RELATED_POINT, RELATED_TIMES} from '../../_helpers/constant/signal-constants';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-related-signal-form',
    templateUrl: './related-signal-form.component.html',
    styleUrls: ['./related-signal-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class RelatedSignalFormComponent implements OnInit {

    dialogTitle: string;
    signalRelatedForm: FormGroup;
    data: any;
    listIntensiveSignal: any[];
    listPointSignal: any[];
    timeSelection = RELATED_TIMES;

    threshold: any;

    isShowIntensive: Boolean = true;
    isShowPoint: Boolean = true;
    isDisabled: Boolean = true;

    constructor(
        public matDialogRef: MatDialogRef<RelatedSignalFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private settingService: SettingService,
        private _matSnackBar: MatSnackBar,
        private _translateService: TranslateService,) {
        this._translateService.get('RELATEDFORM.ReSig').subscribe(translation => {
            this.dialogTitle = translation + ' ' + this._data.relatedSignal.threshold[0].errorMessages;
        });
        this.data = this._data.relatedSignal;
    }

    get formArr() {
        return this.signalRelatedForm.get('intensiveSignal') as FormArray;
    }

    get formArr2() {
        return this.signalRelatedForm.get('pointSignal') as FormArray;
    }

    ngOnInit() {
        this.settingService.getThresholdById(this._data.relatedSignal.threshold[0].id).subscribe(
            res => {
                this.threshold = res.data.Threshold;
                const i = this.threshold.relatedSignals.length;
                if (i > 0) {
                    this.initData();
                    this.isDisabled = false;
                } else {
                    this.removeIntensiveSignal(0);
                    this.removePointSignal(0);
                }
            }
        );

        this.createForm();

        this.settingService.getListSignalByDataType(DATA_TYPE_INTENSIVE, this.data.signalId).subscribe(
            res => {
                if (res.code === 200) {
                    this.listIntensiveSignal = res.data.signalIntensive;
                    this.listPointSignal = res.data.signalPoint;
                }
            }
        );
    }

    createForm() {
        this.signalRelatedForm = this._formBuilder.group({
            thresholdId: this._data.relatedSignal.threshold[0].id,
            intensiveSignal: this._formBuilder.array([this.addIntensiveSignal()]),
            pointSignal: this._formBuilder.array([this.addPointSignal()])
        });
    }

    initData() {
        let i = 0, j = 0, k = 0;
        for (i = 0; i < this.threshold.relatedSignals.length; i++) {
            const temp = this.threshold.relatedSignals[i];
            if (temp.type === RELATED_INTENSIVE) {
                (this.signalRelatedForm.controls['intensiveSignal'] as FormArray).push(this.addIntensiveSignalWithParam(temp.relatedSignalId, temp.timing));
                j++;
            } else {
                (this.signalRelatedForm.controls['pointSignal'] as FormArray).push(this.addPointSignalWithParam(temp.relatedSignalId, temp.timing));
                k++;
            }
        }
        if (j >= 0) {

            this.removeIntensiveSignal(0);
            if (j === 0) {
                this.isShowIntensive = true;
            } else {
                this.isShowIntensive = false;
            }
        }
        if (k >= 0) {
            this.removePointSignal(0);
            if (k === 0) {
                this.isShowPoint = true;
            } else {
                this.isShowPoint = false;
            }

        }
    }

    // Intensive Signal
    addIntensiveSignal() {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal.threshold[0].id,
            signalId: ['', Validators.required],
            timing: ['', Validators.required],
            type: RELATED_INTENSIVE
        });
    }

    addIntensiveSignalWithParam(signalId: String, timing: String) {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal.threshold[0].id,
            signalId: [signalId],
            timing: [timing],
            type: RELATED_INTENSIVE
        });
    }

    removeIntensiveSignal(index: number) {
        this.isShowIntensive = true;
        this.formArr.removeAt(index);
    }

    addNext() {
        this.isShowIntensive = false;
        this.isDisabled = false;
        (this.signalRelatedForm.controls['intensiveSignal'] as FormArray).push(this.addIntensiveSignal());
    }

    // Point Signal
    addPointSignal() {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal.threshold[0].id,
            signalId: ['', Validators.required],
            timing: ['', Validators.required],
            type: RELATED_POINT
        });
    }

    addPointSignalWithParam(signalId: String, timing: String) {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal.threshold[0].id,
            signalId: [signalId],
            timing: [timing],
            type: RELATED_POINT
        });
    }

    removePointSignal(index: number) {
        this.isShowPoint = true;
        this.formArr2.removeAt(index);
    }

    addNextPointSignal() {
        this.isShowPoint = false;
        this.isDisabled = false;
        (this.signalRelatedForm.controls['pointSignal'] as FormArray).push(this.addPointSignal());
    }


    onSave() {
        let formSubmit: FormGroup;
        formSubmit = this._formBuilder.group({
            thresholdId: this.signalRelatedForm.controls['thresholdId'].value,
            relatedSignals: [this.signalRelatedForm.controls['intensiveSignal'].value.concat(this.signalRelatedForm.controls['pointSignal'].value)]
        });
        // console.log(formSubmit.value);
        this.settingService.updatedRelatedSignalsForThreshold(formSubmit.value).subscribe(
            res => {
                if (res.body.code === 201) {
                    this._matSnackBar.open(`${res.body.messages}`, 'OK', {
                        verticalPosition: 'bottom',
                        duration: 3000
                    });
                }
                this.matDialogRef.close({event: 'Success', data: res});
            }
        );
    }
}
