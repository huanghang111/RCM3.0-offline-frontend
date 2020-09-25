import {NgModule} from '@angular/core';

import {HorizontalLayout1Module} from 'app/layout/horizontal/layout-1/layout-1.module';
import {LoginService} from 'app/main/apps/services/login.service';


@NgModule({
    imports: [
        HorizontalLayout1Module,
    ],
    exports: [
        HorizontalLayout1Module
    ],
    providers: [LoginService]
})
export class LayoutModule {
}
