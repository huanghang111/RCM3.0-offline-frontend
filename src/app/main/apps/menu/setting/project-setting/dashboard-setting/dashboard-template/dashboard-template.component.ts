import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthStore} from '@rcm/_authentication/auth.store';

@Component({
    selector: 'app-dashboard-template',
    templateUrl: './dashboard-template.component.html',
    styleUrls: ['./dashboard-template.component.scss']
})
export class DashboardTemplateComponent implements OnInit {

    templateArr: Array<any> = [
        {
            id: 'no1',
            name: 'Template 1',
            tooltip: '1 Schematic, 1 error pie chart, 2 blocks of text',
            imgSrc: 'assets/images/dashboard_templates/template_1.png'
        },
        {
            id: 'no2',
            name: 'Template 2',
            tooltip: '1 Picture, 1 error pie chart, 1 block of text',
            imgSrc: 'assets/images/dashboard_templates/template_2.png'
        },
        {
            id: 'no3',
            name: 'Template 3',
            tooltip: '2 medium-size charts, 1 large chart, 6 signal points',
            imgSrc: 'assets/images/dashboard_templates/template_3.png'
        }
    ];


    constructor(private router: Router,
                private authStore: AuthStore) {
    }

    ngOnInit() {
    }

    onTemplateClick(id) {
        let url = `apps/setting/project-setting/dashboard/template/${id}/add-dashboard`;
        this.router.navigate([url]);
    }

    // navigate(id) {
    //   let url = `project-setting/dashboard/template/${id}/add-dashboard`;
    //   this.router.navigate([url]);
    // }
}
