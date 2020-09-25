import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {DiagnoseService} from 'app/main/apps/services/diagnose.service';

@Component({
    selector: 'app-diagnose-calculation',
    templateUrl: './diagnose-calculation.component.html',
    styleUrls: ['./diagnose-calculation.component.scss']
})
export class DiagnoseCalculationComponent implements OnInit {

    signalOne: string;
    methodOne: string;

    signalTwo: string;
    methodTwo: string;

    constructor(
        public matDialogRef: MatDialogRef<DiagnoseCalculationComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private diagnoseService: DiagnoseService,
        private _matSnackBar: MatSnackBar) {
        matDialogRef.disableClose = true;
    }

    ngOnInit() {
        this.getDiagnoseCalc();
    }

    getDiagnoseCalc(): void {
        this.diagnoseService.getDiagnoseCalc(this._data.id).subscribe(
            res => {
                if (res.body.code === 200 && res.body.data) {
                    this.signalOne = res.body.data.calculations.signalOne;
                    this.methodOne = res.body.data.calculations.methodOne;

                    this.signalTwo = res.body.data.calculations.signalTwo ? res.body.data.calculations.signalTwo : '';
                    this.methodTwo = res.body.data.calculations.methodTwo ? res.body.data.calculations.methodTwo : '';
                }
            },
            error => {
                console.log(error);
                this._matSnackBar.open('There is an error. Please check console log.', 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                });
            }
        );
    }

}
