import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ProjectEditCreateFormComponent} from './project-edit-create-form/project-edit-create-form.component';
import {IProject} from '../setting.model';
import {SettingService} from 'app/main/apps/services/setting.service';
import {AuthStore} from '../../../../../../@rcm/_authentication/auth.store';

@Component({
    selector: 'app-project-setting',
    templateUrl: './project-setting.component.html',
    styleUrls: ['./project-setting.component.scss']
})
export class ProjectSettingComponent implements OnInit {

    dialogRef: any;

    projects: IProject[] = [];

    constructor(
        private _matDialog: MatDialog,
        private settingService: SettingService,
        private authStore: AuthStore
    ) {
    }

    ngOnInit() {
        this.authStore.removeSelectedProject();
        this.loadAllProject(true);
    }

    createProject(project: IProject) {
        this.dialogRef = this._matDialog.open(ProjectEditCreateFormComponent, {
            panelClass: 'project-edit-create-form',
            data: {
                project: project,
                title: 'Add project form',
                action: 'add'
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.loadAllProject(true);
                }
            }
        );
    }

    loadAllProject(isLoad: boolean) {
        if (isLoad) {
            this.settingService.getAllProjects().subscribe(
                item => {
                    this.projects = item.body.data.Project;
                }
            );
        }
    }
}
