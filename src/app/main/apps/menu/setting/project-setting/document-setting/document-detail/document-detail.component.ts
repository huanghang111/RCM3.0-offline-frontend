import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {DocumentEditCreateFormComponent} from '../document-edit-create-form/document-edit-create-form.component';
import {IDocument} from '../../../setting.model';
import {SettingService} from 'app/main/apps/services/setting.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-document-detail',
    templateUrl: './document-detail.component.html',
    styleUrls: ['./document-detail.component.scss']
})
export class DocumentDetailComponent implements OnInit {

    @Input() document: IDocument;
    @Output() edited = new EventEmitter<boolean>();

    dialogRef: any;
    pictureSrc: any = null;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private _translateService: TranslateService
    ) {
    }

    ngOnInit() {
    }

    editDocument(document: IDocument) {

        this.dialogRef = this._matDialog.open(DocumentEditCreateFormComponent, {
            panelClass: 'document-edit-create-form',
            data: {
                document: document,
                title: 'Edit document form',
                action: 'edit'
            }
        });
        this.dialogRef.afterClosed().subscribe(response => {
            if (!response) {
                this.edited.emit(false);
            } else {
                this.edited.emit(true);
            }
        });
    }

    deleteDocument(title: string) {

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this._translateService.get(['DOCUMENT.DeleteHeader', 'ACTION.Confirm_delete']).subscribe(translations => {
            this.confirmDialogRef.componentInstance.confirmMessage = translations['ACTION.Confirm_delete'] + '?';
            this.confirmDialogRef.componentInstance.confirmHeader = translations['DOCUMENT.DeleteHeader'] + ' ' + title;
        });

        // this.confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to delete ?`;
        // this.confirmDialogRef.componentInstance.confirmHeader = `Delete document with title "${title}"`;

        this.confirmDialogRef.afterClosed()
            .subscribe(result => {
                if (!result) {
                    this.edited.emit(false);
                } else {
                    this.settingService.deleteDocumentByTitle(title).subscribe(
                        data => {
                            this.edited.emit(true);
                            this._matSnackBar.open(`DELETED document "${title}"`, 'OK', {
                                verticalPosition: 'bottom',
                                duration: 3000
                            });
                        },
                        error => {
                            this.edited.emit(true);
                            const errorMess = `Delete error with error message: ${error.error.messages}`;
                            this.handleError(error, errorMess);
                        });
                }
                this.confirmDialogRef = null;
            });
    }

    handleError(error: any, errorMessage: string) {
        console.log(`Error message: ${error.error.messages} 
      - Error status: ${error.error.status} 
      - Error code: ${error.error.code}`);
        this._matSnackBar.open(errorMessage, 'ERROR', {
            verticalPosition: 'bottom',
            duration: 5000
        });
    }
}
