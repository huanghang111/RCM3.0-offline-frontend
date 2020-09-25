import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DashboardDialogComponent} from '../dashboard-dialog/dashboard-dialog.component';
import {PICTURE} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';

@Component({
    selector: 'app-picture',
    templateUrl: './picture.component.html',
    // styleUrls: ['./picture.component.scss']
})
export class PictureComponent implements OnInit {

    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    dialogRef: MatDialogRef<DashboardDialogComponent>;
    imgSrc: string;

    constructor(private _matDialog: MatDialog) {
    }

    ngOnInit() {
        if (!this.dataRef || !this.dataRef.imgSrcInput) {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: PICTURE.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.imgSrc) {
                    this.imgSrc = result.imgSrc;
                    this.changeData.emit({imgSrcInput: result.imgSrc});
                } else {
                    this.removeDashboardElement();
                }
            });
        } else {
            this.imgSrc = this.dataRef.imgSrcInput;
        }
    }

    ngAfterViewInit() {
        this.dashFinish.emit(PICTURE.componentType);
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

}
