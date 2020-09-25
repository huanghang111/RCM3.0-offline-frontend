import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {ProjectEditCreateFormComponent} from '../project-edit-create-form/project-edit-create-form.component';
import {Router} from '@angular/router';
import {IProject} from '../../setting.model';
import {SettingService} from 'app/main/apps/services/setting.service';
import {AuthStore} from '../../../../../../../@rcm/_authentication/auth.store';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-project-detail',
    templateUrl: './project-detail.component.html',
    styleUrls: ['./project-detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProjectDetailComponent implements OnInit {

    @Input() project: IProject;
    @Output() edited = new EventEmitter<boolean>();

    dialogRef: any;
    pictureSrc: any = null;
    dateToDisplay: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        private _matDialog: MatDialog,
        private _matSnackBar: MatSnackBar,
        private settingService: SettingService,
        private router: Router,
        private authStore: AuthStore,
        private _translateService: TranslateService
    ) {
    }

    ngOnInit() {

    }

    editProject(project: IProject) {
        this.authStore.setSelectedProject(project.projectId, project.name);
        this.dialogRef = this._matDialog.open(ProjectEditCreateFormComponent, {
            panelClass: 'project-edit-create-form',
            data: {
                project: project,
                title: 'Edit project form',
                action: 'edit'
            }
        });
        this.dialogRef.afterClosed()
            .subscribe(response => {
                if (!response) {
                    this.edited.emit(false);
                } else {
                    this.edited.emit(true);
                }
            });
    }

    deleteProject(projectID: string) {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this._translateService.get(['PROJECT.ECForm.DeleteHeader', 'ACTION.Confirm_delete']).subscribe(translations => {
            this.confirmDialogRef.componentInstance.confirmMessage = translations['ACTION.Confirm_delete'] + ' ' + this.project.name;
            this.confirmDialogRef.componentInstance.confirmHeader = translations['PROJECT.ECForm.DeleteHeader'];
        });
        // this.confirmDialogRef.componentInstance.confirmMessage = `Are you sure you want to delete project '${this.project.name}' ?`;
        // this.confirmDialogRef.componentInstance.confirmHeader = `DELETE PROJECT`;

        this.confirmDialogRef.afterClosed()
            .subscribe(result => {
                if (!result) {
                    this.edited.emit(false);
                } else {
                    this.settingService.deleteProjectById(projectID).subscribe(
                        data => {
                            this.edited.emit(true);
                            this._matSnackBar.open(`DELETED project with ID "${projectID}"`, 'OK', {
                                verticalPosition: 'bottom',
                                duration: 3000
                            });
                            this.authStore.removeSelectedProject();
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

    navigate() {
        this.authStore.setSelectedProject(this.project.projectId, this.project.name);
        this.router.navigate([`apps/setting/project-setting/dashboard`]);
    }
}
