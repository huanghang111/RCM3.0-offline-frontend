import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {DocumentEditCreateFormComponent} from './document-edit-create-form/document-edit-create-form.component';
import {IDocument} from '../../setting.model';
import {SettingService} from 'app/main/apps/services/setting.service';

@Component({
    selector: 'app-document-setting',
    templateUrl: './document-setting.component.html',
    styleUrls: ['./document-setting.component.scss']
})
export class DocumentSettingComponent implements OnInit {

    dialogRef: any;

    documents: IDocument[] = [];

    constructor(
        private _matDialog: MatDialog,
        private settingService: SettingService,
    ) {
    }

    ngOnInit() {
        this.loadAllDocuments(true);
    }

    createDocument(document: IDocument) {
        this.dialogRef = this._matDialog.open(DocumentEditCreateFormComponent, {
            panelClass: 'document-edit-create-form',
            data: {
                document: document,
                title: 'Add document form',
                action: 'add'
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.loadAllDocuments(true);
                }

            }
        );
    }

    loadAllDocuments(isLoad: boolean) {
        if (isLoad) {
            this.settingService.getAllDocuments().subscribe(
                res => {
                    this.documents = res.body.data.document;
                }
            );
        }
    }

}
