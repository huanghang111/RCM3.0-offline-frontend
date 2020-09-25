import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {IElementDetail} from './element-detail.model';
import {IDocument, IProject} from '../../menu/setting/setting.model';
import {Router} from '@angular/router';
import {AuthStore} from '../../../../../@rcm/_authentication/auth.store';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CommonUtilitiesService} from '../../../../../@rcm/_helpers/common-utilities.service';

@Component({
    selector: 'app-element-detail',
    templateUrl: './element-detail.component.html',
    styleUrls: ['./element-detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ElementDetailComponent implements OnInit {

    @Input() element: IElementDetail;

    isProject: boolean;
    project: IProject;
    document: IDocument;
    hasDocument: boolean;

    constructor(private router: Router,
                private authStore: AuthStore,
                private _httpClient: HttpClient,
                private _matSnackBar: MatSnackBar,
                private commonUtil: CommonUtilitiesService
    ) {
    }

    ngOnInit() {
        this.authStore.removeSelectedProject();
        if (this.element.projectId != null) {
            this.isProject = true;
            this.project = this.element;
        } else {
            this.isProject = false;
            this.document = this.element;
            this.hasDocument = !!this.document.document;
        }
    }

    navigateToProject() {
        this.authStore.setSelectedProject(this.element.projectId, this.project.name);
        this.router.navigate(['apps/setting/dashboard']).then(() => {
        });
    }

    navigateToDownload(documentInput: any) {
        this.commonUtil.documentDownload(documentInput).then(() => {
        });
    }
}
