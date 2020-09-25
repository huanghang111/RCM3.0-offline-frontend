import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SignalPointInfoComponent } from './signal-point-info/signal-point-info.component';
import { DATA_TYPE_BOOL } from '../../_helpers/constant/signal-constants';

@Component({
    selector: 'app-signal-point-dialog',
    templateUrl: './signal-point-dialog.component.html',
    styleUrls: ['./signal-point-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SignalPointDialogComponent implements OnInit {

    _data: any;
    get data(): any {
        return this._data;
    }

    @Input('data')
    set data(_data: any) {
        this._data = _data;
        if (this._data && this._data.danger) {
            this.renderBar();
        }
    }

    _realTimeData: any;
    get realTimeData(): any {
        return this._realTimeData;
    }

    @Input('realTimeData')
    set realTimeData(_realTimeData: any) {
        this._realTimeData = _realTimeData;

        if (this._realTimeData && this._realTimeData.name && this._data.signal && (this._data.signal.name === this._realTimeData.name)) {

            //if the data is previously null -> add a fake signalData object having only values
            if (!this._data.signalData) this._data.signalData = { values: null };

            if (this._data.signal.dataType.name === DATA_TYPE_BOOL) {
                this._data.signalData.values = this._realTimeData.values;
            } else {
                let digit = this._data.signal.digit ? this._data.signal.digit : 1;
                this._data.signalData.values = parseFloat(this._realTimeData.values.toFixed(digit));
            }
            this._data.danger = this._realTimeData.danger;
            this.renderBar();
        }
    }

    y1: number = 0;
    h1: number = 0;
    y2: number = 0;
    h2: number = 0;
    y3: number = 0;
    h3: number = 0;
    y4: number = 0;
    h4: number = 0;
    y5: number = 0;
    h5: number = 0;

    triangleY: string = '';
    triangleColor: string = '';

    constructor(private _matDialog: MatDialog) {
    }

    ngOnInit() {
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

    showPointInfo() {
        this._matDialog.open(SignalPointInfoComponent, {
            data: {
                pointData: this._data
            }
        });
    }

    renderBar() {
        if (this._data.signal.dataType.name === DATA_TYPE_BOOL) {
            this.y1 = -41.5;
            this.h1 = 41.5;
            this.y2 = -41.5 * 2;
            this.h2 = 41.5;
            if (this._data.danger === 3) {
                this.triangleY = `translate(10, -5) rotate(-90)`;
                this.triangleColor = 'rgb(65, 166, 42)';
            } else {
                this.triangleY = `translate(10, -78) rotate(-90)`;
                this.triangleColor = 'rgb(223, 0, 36)';
            }
        } else {
            let tLowValue = 0;
            let tHighValue = 0;
            let lowValue = 0;
            let highValue = 0;
            let currentValue: number = this._data.signalData.values;

            this._data.signal.thresholds.forEach(el => {
                switch (el.level) {
                    case 'Too_Low':
                        tLowValue = parseFloat(el.values);
                        break;
                    case 'Low':
                        lowValue = parseFloat(el.values);
                        break;
                    case 'High':
                        highValue = parseFloat(el.values);
                        break;
                    case 'Too_High':
                        tHighValue = parseFloat(el.values);
                        break;
                }
            });

            //currently the total height of the bar is 85px => 1/5 of that is 17px.

            //this is lower bound and upper bound, respectively
            this.y1 = -17;
            this.h1 = 17;
            this.y5 = -17 * 5;
            this.h5 = 17;
            ////////////////////////////////////////////////////////////////////////////

            let tooLow_TooHigh_Range = tHighValue - tLowValue;
            this.h2 = ((lowValue - tLowValue) / tooLow_TooHigh_Range) * 51;  //51 is 3*17px, which means 3/5 of the bar
            this.y2 = -(this.h2 + Math.abs(this.y1));
            this.h3 = ((highValue - lowValue) / tooLow_TooHigh_Range) * 51;
            this.y3 = -(this.h3 + Math.abs(this.y2));
            this.h4 = ((tHighValue - highValue) / tooLow_TooHigh_Range) * 51;
            this.y4 = -(this.h4 + Math.abs(this.y3));

            /**
             * We have two ruler, one is unit of threshold values (now called unit) and another one is pixel (pxs), the length of pixel ruler
             * is 85 pxs, then we need calculate the lower and upper bound of unit ruler, which is now called C for lower bound and D is for upper bound.
             * The pixel ruler can be divided into 3 part, one is lower than the tooLow value (unit) has 17pxs, one is between tooLow
             * and tooHigh value (unit) has 51 pxs, and the last one is upper than tooHigh value (unit) has also 10pxs. Basing on these
             * ratios of two rulers, we can derive C and D value (unit).
             *
             * Call Cx is the current value data in unit ruler, we need to find the value in pxs of Cx to display.
             * If Cx is out of range of ruler:
             *  + Cx < C: set value pxs of Cx = 5 or 0 (the lower bound in pxs ruler).
             *  + Cx > The algebraic distance between C and D: set value pxs of Cx = 85 (the upper bound in pxs ruler)
             * Otherwise, Cx can be derived by the same ratios above.
             * */
            let C: number = tLowValue - (17 * tooLow_TooHigh_Range / 51);
            let D: number = (68 * tooLow_TooHigh_Range / 51);
            let triY: number;
            let Cx: number = currentValue - C;
            if (currentValue < 0) {
                Cx = C - Cx;
            }
            if (currentValue > D) {
                triY = 85;
            } else if (currentValue < C) {
                triY = 0;
            } else {
                triY = Cx * 85 / Math.abs(D - C);
            }

            this.triangleY = `translate(10, ${-triY}) rotate(-90)`;

            switch (this._data.danger) {
                case 1:
                case 5:
                    this.triangleColor = 'rgb(223, 0, 36)';
                    break;
                case 3:
                    this.triangleColor = 'rgb(65, 166, 42)';
                    break;
                default:
                    this.triangleColor = 'rgb(245, 121, 0)';
                    break;
            }

        }
    }

}
