import {NgModule} from '@angular/core';

import {LoginModule} from 'app/main/pages/authentication/login/login.module';
import {ResetPasswordModule} from 'app/main/pages/authentication/reset-password/reset-password.module';
import {VersionModule} from 'app/main/pages/version/version.module';

@NgModule({
    imports: [
        // Authentication
        LoginModule,
        ResetPasswordModule,

        VersionModule
    ]
})
export class PagesModule {

}
