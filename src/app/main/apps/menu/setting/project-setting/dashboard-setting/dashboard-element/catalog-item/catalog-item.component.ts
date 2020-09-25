import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {DashboardDialogComponent} from '../dashboard-dialog/dashboard-dialog.component';
import {CATALOG_ITEM} from '../../../../../../../../../@rcm/_helpers/constant/dashboard-element-constant';
import {CatalogDialogComponent} from './dialog/catalog-dialog/catalog-dialog.component';

@Component({
    selector: 'app-catalog-item',
    templateUrl: './catalog-item.component.html',
    styleUrls: ['./catalog-item.component.scss']
})
export class CatalogItemComponent implements OnInit {

    @Input() dataRef: any;
    @Input() mode: string;
    @Output() removeElement = new EventEmitter();
    @Output() changeData = new EventEmitter();
    @Output() dashFinish = new EventEmitter();

    dialogRef: MatDialogRef<DashboardDialogComponent>;
    catalogName: string = '';

    constructor(private _matDialog: MatDialog) {
    }

    ngOnInit() {
        if (!this.dataRef || !this.dataRef.cataName) {
            this.dialogRef = this._matDialog.open(DashboardDialogComponent, {
                data: {
                    dataRef: this.dataRef,
                    componentType: CATALOG_ITEM.componentType
                }
            });
            this.dialogRef.afterClosed().subscribe(result => {
                if (result.cataName) {
                    this.catalogName = result.cataName;
                    this.changeData.emit({cataName: result.cataName});
                } else {
                    this.removeDashboardElement();
                }
            });
        } else {
            this.catalogName = this.dataRef.cataName;
        }
    }

    ngAfterViewInit() {
        this.dashFinish.emit(CATALOG_ITEM.componentType);
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    showCatalogInfo() {
        this._matDialog.open(CatalogDialogComponent, {
            data: {
                cataName: this.catalogName
            }
        });
    }

}
