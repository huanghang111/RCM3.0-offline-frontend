import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material';
import {FuseSharedModule} from '@rcm/shared.module';

import {VersionComponent} from 'app/main/pages/version/version.component';
import {VersionService} from './version.service';


const routes = [
    {
        path: 'versions',
        component: VersionComponent
    }
];

@NgModule({
    declarations: [
        VersionComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,

        FuseSharedModule
    ],
    providers: [
        VersionService
    ]
})
export class VersionModule {
}
