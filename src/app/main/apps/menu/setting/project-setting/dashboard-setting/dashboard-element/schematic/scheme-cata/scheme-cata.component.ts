import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material';
import {CatalogDialogComponent} from '../../catalog-item/dialog/catalog-dialog/catalog-dialog.component';

@Component({
    selector: 'app-scheme-cata',
    templateUrl: './scheme-cata.component.html',
    styleUrls: ['./scheme-cata.component.scss']
})
export class SchemeCataComponent implements OnInit {
    @Input() name: any = '';
    @Input() mode: string;
    @Input() blinkingInput: boolean = false;
    @Output() removeElement = new EventEmitter();
    @Output() blinkingOutput = new EventEmitter();

    currentCata: any = {};

    constructor(private _matDialog: MatDialog) {
    }

    ngOnInit() {
    }

    removeDashboardElement() {
        this.removeElement.emit(true);
    }

    showCatalogInfo() {
        this._matDialog.open(CatalogDialogComponent, {
            data: {
                cataName: this.name
            }
        });
    }

    blink() {
        this.blinkingInput = !this.blinkingInput;

        this.blinkingOutput.emit(new Object({
            type: 'cata',
            name: this.name,
            active: this.blinkingInput
        }));
    }

}