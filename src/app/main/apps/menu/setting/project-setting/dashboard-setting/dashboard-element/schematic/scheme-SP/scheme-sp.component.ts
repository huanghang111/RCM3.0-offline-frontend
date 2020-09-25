import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SignalService} from 'app/main/apps/services/signal.service';
import {DATA_TYPE_BOOL} from '@rcm/_helpers/constant/signal-constants';

@Component({
    selector: 'app-scheme-sp',
    templateUrl: './scheme-sp.component.html',
    // styleUrls: ['./scheme-sp.component.scss']
})
export class SchemeSPComponent implements OnInit {
    @Input() name: any;
    @Input() mode: string;
    @Input() blinkingInput: boolean = false;
    @Output() removeElement = new EventEmitter();
    @Output() blinkingOutput = new EventEmitter();

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
    constructor(private signalService: SignalService) {
    }

    ngOnInit() {
        if (this.name) {
            this.signalService.getSignalPointByNames(this.name).subscribe(
                res => {
                    if (res.code == 200 && res.data.listSigData.length > 0) {
                        this.currentPoint = res.data.listSigData[0];
                        if (this.currentPoint.signal.dataType.name !== DATA_TYPE_BOOL && this.currentPoint.signalData) {
                            this.digit = this.currentPoint.signal.digit ? this.currentPoint.signal.digit : 1;
                            this.currentPoint.signalData.values = parseFloat(this.currentPoint.signalData.values.toFixed(this.digit));
                        }
                    }

                }, error => console.log(error),
            );
        }
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    getColor(dangerRank: number): string {
        switch (dangerRank) {
            case 1:
                return 'rgb(223, 0, 36)';
            case 2:
                return 'rgb(245, 121, 0)';
            case 3:
                return '#fff';
            case 4:
                return 'rgb(245, 121, 0)';
            case 5:
                return 'rgb(223, 0, 36)';
            default:
                return 'rgb(140, 140, 140)';
        }
    }

    blink() {
        this.blinkingInput = !this.blinkingInput;
        this.blinkingOutput.emit(new Object({
            type: 'sp',
            name: this.name,
            active: this.blinkingInput
        }));
    }
}
