import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {FuseSharedModule} from '@rcm/shared.module';
import {LoginComponent} from 'app/main/pages/authentication/login/login.component';
import {LoginService} from '../../../apps/services/login.service';
import {AuthenticationProfileService} from '@rcm/_authentication/authentication-profile.services';
import {TranslateModule} from '@ngx-translate/core';

const routes = [
    {
        path: 'auth/login',
        component: LoginComponent
    }
];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FuseSharedModule,
        TranslateModule
    ],
    providers: [
        LoginService,
        AuthenticationProfileService
    ]
})
export class LoginModule {
}
