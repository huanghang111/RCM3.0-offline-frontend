import {NgModule} from '@angular/core';
import {MatButtonModule, MatIconModule} from '@angular/material';

import {FuseNavigationModule} from '@rcm/components';
import {FuseSharedModule} from '@rcm/shared.module';

import {NavbarVerticalStyle2Component} from 'app/layout/components/navbar/vertical/style-2/style-2.component';

@NgModule({
    declarations: [
        NavbarVerticalStyle2Component
    ],
    imports: [
        MatButtonModule,
        MatIconModule,

        FuseSharedModule,
        FuseNavigationModule
    ],
    exports: [
        NavbarVerticalStyle2Component
    ]
})
export class NavbarVerticalStyle2Module {
}
