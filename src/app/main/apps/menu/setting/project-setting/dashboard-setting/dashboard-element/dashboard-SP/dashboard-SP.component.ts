import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {SIGNAL_POINT} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {DashboardDialogComponent} from '../dashboard-dialog/dashboard-dialog.component';
import {SignalService} from 'app/main/apps/services/signal.service';
import {DATA_TYPE_BOOL} from '@rcm/_helpers/constant/signal-constants';

@Component({
    selector: 'app-dashboard-sp',
    templateUrl: './dashboard-SP.component.html',
    // styleUrls: ['./dashboard-SP.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DashboardSPComponent implements OnInit {

    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    dialogRef: MatDialogRef<DashboardDialogComponent>;
    currentPoint: any = {};
    digit: number;

    /*using getter and setter to determine when will the realtime data comes */
    _realtimeData: any;
    get realtimeData(): any {
        return this._realtimeData;
    }

    @Input('realtimeData')
    set realtimeData(realtimeData: any) {
        this._realtimeData = realtimeData;

        if (this.currentPoint.signalData) { //do nothing if its signalData is null
            if (this.digit) //having a digit means it has dataType number
            {
                this.currentPoint.signalData.values = parseFloat(this._realtimeData.values.toFixed(this.digit));
            } else {
                this.currentPoint.signalData.values = this._realtimeData.values;
            }

            this.currentPoint.danger = this._realtimeData.danger;
        }
    }

    /**************************************************/

    constructor(private _matDialog: MatDialog, private signalService: SignalService) {
    }

    ngOnInit() {
        if (!this.dataRef || !this.dataRef.signalName) {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: SIGNAL_POINT.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.signalName) {
                    this.getSignalPointByName(result.signalName);
                    this.changeData.emit({signalName: result.signalName});
                } else {
                    this.removeDashboardElement();
                }
            });
        } else {
            this.getSignalPointByName(this.dataRef.signalName);
        }
    }

    removeDashboardElement(): void {
        this.removeElement.emit(true);
    }

    getSignalPointByName(signalName): void {
        this.signalService.getSignalPointByNames(signalName).subscribe(
            res => {
                if (res.code == 200 && res.data.listSigData.length > 0) {
                    this.currentPoint = res.data.listSigData[0];
                    if (this.currentPoint.signal.dataType.name !== DATA_TYPE_BOOL && this.currentPoint.signalData) {
                        this.digit = this.currentPoint.signal.digit ? this.currentPoint.signal.digit : 1;
                        this.currentPoint.signalData.values = parseFloat(this.currentPoint.signalData.values.toFixed(this.digit));
                    }
                }
            }, error => console.log(error),
            () => this.dashFinish.emit(SIGNAL_POINT.componentType)
        );
    }
}
