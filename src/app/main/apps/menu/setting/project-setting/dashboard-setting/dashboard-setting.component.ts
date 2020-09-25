import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DashboardModel } from '../../setting.model';
import { Router } from '@angular/router';
import { SettingService } from 'app/main/apps/services/setting.service';
import { AuthStore } from '@rcm/_authentication/auth.store';

@Component({
    selector: 'app-dashboard-setting',
    templateUrl: './dashboard-setting.component.html',
    styleUrls: ['./dashboard-setting.component.scss']
})
export class DashboardSettingComponent implements OnInit {
    dashboards: DashboardModel[] = [];
    optionDialogRef: MatDialogRef<any>;
    @ViewChild('dashboardOption') dashboardOptionTemplate: TemplateRef<any>;

    constructor(private router: Router,
        private settingService: SettingService,
        private authStore: AuthStore,
        private _matDialog: MatDialog,
    ) {
    }

    ngOnInit() {
        this.getProject();
    }

    startSlide() {
        const url = 'apps/setting/dashboard/slide-dashboard';
        this.router.navigate([url]);
    }

    getProject(): void {
        this.settingService.getProjectById(this.authStore.getProjectId()).subscribe(
            res => {
                if (res.body.code == 200 && res.body.data.project) {
                    this.dashboards = res.body.data.project.dashboards.filter(e => e != null);
                }
            },
            error => {
                console.log(error);
            }
        );
    }

    onRefresh(event) {
        if (event) {
            this.getProject();
        }
    }

    addDashboard(): void {
        this.optionDialogRef = this._matDialog.open(this.dashboardOptionTemplate);
        this.optionDialogRef.disableClose = true;
        let url: string;
        this.optionDialogRef.afterClosed().subscribe(result => {
            if (result != null) {
                if (result == 'template') {
                    url = 'apps/setting/project-setting/dashboard/template/';
                } else {
                    url = 'apps/setting/project-setting/dashboard/add-dashboard/';
                }
                this.router.navigate([url]);
            }
        });
    }
}
