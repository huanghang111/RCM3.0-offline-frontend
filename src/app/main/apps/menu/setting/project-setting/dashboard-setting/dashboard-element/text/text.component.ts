import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {TEXT} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {DashboardDialogComponent} from '../dashboard-dialog/dashboard-dialog.component';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    // styleUrls: ['./text.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TextComponent implements OnInit {
    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    /*using getter and setter to determine when will the realtime data comes */
    _realtimeData: any;
    get realtimeData(): any {
        return this._realtimeData;
    }

    @Input('realtimeData')
    set realtimeData(realtimeData: any) {
        this._realtimeData = realtimeData;
        this.textContent = this._realtimeData;
    }

    /**************************************************/

    textContent: string = 'no text';
    dialogRef: MatDialogRef<DashboardDialogComponent>;

    constructor(private _matDialog: MatDialog) {
    }

    ngOnInit() {
        if (!this.dataRef || !this.dataRef.textContent) {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: TEXT.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.text) {
                    this.textContent = result.text;
                    this.changeData.emit({textContent: result.text});
                } else {
                    this.removeDashboardElement();
                }
            });
        } else {
            this.textContent = this.dataRef.textContent;
        }
    }

    ngAfterViewInit() {
        this.dashFinish.emit(TEXT.componentType);
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }
}
