import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {DiagnoseService} from 'app/main/apps/services/diagnose.service';

@Component({
    selector: 'app-diagnose-step',
    templateUrl: './diagnose-step.component.html',
    styleUrls: ['./diagnose-step.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DiagnoseStepComponent implements OnInit {

    dialogTitle: string;
    diagnoseSteps: any[] = [];
    signalName: string;
    timestamp: string;

    constructor(
        public matDialogRef: MatDialogRef<DiagnoseStepComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private diagnoseService: DiagnoseService,
        private matSnackBar: MatSnackBar
    ) {
        matDialogRef.disableClose = true;
        this.dialogTitle = this._data.signalName + ' - Diagnose';
        this.signalName = this._data.signalName;
        this.timestamp = this._data.timestamp ? this._data.timestamp : new Date();
    }

    ngOnInit() {
        this.getDiagnoseStep();
    }

    getDiagnoseStep(): void {
        this.diagnoseService.getDiagnoseBySignalNameAndTimestamp(this.signalName, this.timestamp).subscribe(
            res => {
                if (res.body.code === 200 && res.body.data) {
                    this.diagnoseSteps = res.body.data.diagnoseStep;
                }
            },
            error => {
                console.log(error);
                this.matSnackBar.open(`Error occurs`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 5000
                });
            }
        );
    }
}
