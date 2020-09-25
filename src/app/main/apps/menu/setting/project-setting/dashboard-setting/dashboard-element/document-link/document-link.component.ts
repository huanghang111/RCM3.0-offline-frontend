import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DashboardDialogComponent} from '../dashboard-dialog/dashboard-dialog.component';
import {DOCUMENT_LINK} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';

@Component({
    selector: 'app-document-link',
    templateUrl: './document-link.component.html',
    // styleUrls: ['./document-link.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DocumentLinkComponent implements OnInit {

    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    titleLink: string = 'Name of Link';
    link: string = null;

    dialogRef: MatDialogRef<DashboardDialogComponent>;

    constructor(private _matDialog: MatDialog) {
    }

    ngOnInit() {
        if (!this.dataRef || !this.dataRef.linkInput || !this.dataRef.titleInput) {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: DOCUMENT_LINK.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.title && result.link) {
                    this.titleLink = result.title;
                    this.link = result.link;
                    this.changeData.emit({linkInput: result.link, titleInput: result.title});
                } else {
                    this.removeDashboardElement();
                }
            });
        } else {
            this.link = this.dataRef.linkInput;
            this.titleLink = this.dataRef.titleInput;
        }
    }

    ngAfterViewInit() {
        this.dashFinish.emit(DOCUMENT_LINK.componentType);
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    navigate() {
        window.open(this.link.includes('://') ? this.link : '//' + this.link, "_blank");
    }
}
