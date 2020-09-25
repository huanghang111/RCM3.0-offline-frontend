import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';
import {DATA_TYPE_INTENSIVE, RELATED_INTENSIVE, RELATED_POINT, RELATED_TIMES} from '../../../../../../../@rcm/_helpers/constant/signal-constants';

@Component({
    selector: 'app-signal-add-related-form',
    templateUrl: './signal-add-related-form.component.html',
    styleUrls: ['./signal-add-related-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SignalAddRelatedFormComponent implements OnInit {

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
        public matDialogRef: MatDialogRef<SignalAddRelatedFormComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private _formBuilder: FormBuilder,
        private settingService: SettingService,
    ) {
        this.dialogTitle = 'Related Signal, error ' + this._data.relatedSignal;
        this.data = this._data.relatedSignal;
    }

    get formArr(): any {
        return this.signalRelatedForm.get('intensiveSignal') as FormArray;
    }

    get formArr2(): any {
        return this.signalRelatedForm.get('pointSignal') as FormArray;
    }

    ngOnInit() {
        this.createForm();

        const signalId = '';

        this.settingService.getListSignalByDataType(DATA_TYPE_INTENSIVE, signalId).subscribe(
            res => {
                this.listIntensiveSignal = res.data.signalIntensive;
                this.listPointSignal = res.data.signalPoint;
            }
        );
    }

    createForm(): void {
        this.signalRelatedForm = this._formBuilder.group({
            thresholdId: this._data.relatedSignal,
            intensiveSignal: this._formBuilder.array([]),
            pointSignal: this._formBuilder.array([])
        });
    }

    // Intensive Signal
    addIntensiveSignal(): any {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal,
            signalId: ['', Validators.required],
            timing: ['', Validators.required],
            type: RELATED_INTENSIVE
        });
    }

    addIntensiveSignalWithParam(signalId: String, timing: String): any {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal,
            signalId: [signalId],
            timing: [timing],
            type: RELATED_INTENSIVE
        });
    }

    removeIntensiveSignal(index: number): void {
        this.isShowIntensive = true;
        this.formArr.removeAt(index);
    }

    addNext(): void {
        this.isShowIntensive = false;
        this.isDisabled = false;
        (this.signalRelatedForm.controls['intensiveSignal'] as FormArray).push(this.addIntensiveSignal());
    }

    // Point Signal
    addPointSignal(): any {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal,
            signalId: ['', Validators.required],
            timing: ['', Validators.required],
            type: RELATED_POINT
        });
    }

    addPointSignalWithParam(signalId: String, timing: String): any {
        return this._formBuilder.group({
            thresholdId: this._data.relatedSignal,
            signalId: [signalId],
            timing: [timing],
            type: RELATED_POINT
        });
    }

    removePointSignal(index: number): void {
        this.isShowPoint = true;
        this.formArr2.removeAt(index);
    }

    addNextPointSignal(): void {
        this.isShowPoint = false;
        this.isDisabled = false;
        (this.signalRelatedForm.controls['pointSignal'] as FormArray).push(this.addPointSignal());
    }


    onSave(): void {
        let formSubmit: FormGroup;
        formSubmit = this._formBuilder.group({
            thresholdId: this.signalRelatedForm.controls['thresholdId'].value,
            relatedSignals: [this.signalRelatedForm.controls['intensiveSignal'].value.concat(this.signalRelatedForm.controls['pointSignal'].value)]
        });
        this.matDialogRef.close({event: 'Success', data: formSubmit.value});
    }
}
