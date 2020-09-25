import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
    selector: 'app-catalog-dialog',
    templateUrl: './catalog-dialog.component.html',
    styleUrls: ['./catalog-dialog.component.scss']
})
export class CatalogDialogComponent implements OnInit {
    @Input() nameInput: any;
    currentCata: any = {};
    linkList: Array<any> = [];
    documentList: Array<any> = [];
    public catalogForm = new FormGroup({
        'name': new FormControl(''),
        'desc': new FormControl(''),
        'tag': new FormControl(''),
    });

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                public matDialogRef: MatDialogRef<CatalogDialogComponent>,
                private settingService: SettingService) {
        if (!this.data.cataName) {
            this.data.cataName = this.nameInput;
        }
    }

    get form() {
        return this.catalogForm.controls;
    }

    ngOnInit() {
        this.initCatalog();
    }

    initCatalog() {
        this.settingService.getCatalogByNames(this.data.cataName).subscribe(
            res => {
                if (res.code == 200 && res.data.catalog.length > 0) {
                    this.currentCata = res.data.catalog[0];
                }
            }, error => console.log(error),
            () => {
                this.catalogForm.setValue(
                    {
                        name: this.currentCata.name,
                        desc: this.currentCata.descriptions,
                        tag: this.currentCata.tag
                    }
                );
            }
        );
    }

    navigateToDownload(document: any): void {
        const data = {
            docName: document.name,
            docType: document.type,
            signalName: this.currentCata.name,
            docId: document.id
        };
        this.settingService.downloadDocument(data);
    }

}
