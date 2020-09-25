import {Component, OnInit} from '@angular/core';
import {IDocument, IProject} from '../menu/setting/setting.model';
import {SettingService} from '../services/setting.service';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    documents: IDocument[] = [];
    projects: IProject[] = [];

    constructor(
        private settingService: SettingService,
        private authStore: AuthStore
    ) {
    }

    ngOnInit() {
        this.authStore.removeSelectedProject();
        this.settingService.getAllProjects().subscribe(
            res => {
                this.projects = res.body.data.Project;
            }
        );
        this.settingService.getAllDocuments().subscribe(
            res => {
                this.documents = res.body.data.document;
            }
        );
    }

}
