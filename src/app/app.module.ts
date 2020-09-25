import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { RcmModule } from '@rcm/rcm.module';
import { FuseSharedModule } from '@rcm/shared.module';

import { rcmConfig } from 'app/rcm-config';
import { AppComponent } from 'app/app.component';
import { AppStoreModule } from 'app/store/store.module';
import { LayoutModule } from 'app/layout/layout.module';
import { AuthenticateGuard } from '../@rcm/_authentication/authenticate.guard';
import { MaterialSharedModule } from './material.shared.module';
import { AuthStore } from '@rcm/_authentication/auth.store';
import { JwtInterceptor } from '@rcm/_helpers/JwtInterceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpCancelService } from './main/apps/services/http-cancel.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

const appRoutes: Routes = [
    {
        path: 'apps',
        loadChildren: './main/apps/apps.module#AppsModule',
        canActivate: [AuthenticateGuard]
    },
    {
        path: 'pages',
        loadChildren: './main/pages/pages.module#PagesModule'
    },
    {
        path: '**',
        redirectTo: 'pages/auth/login'
    }
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),

        //Material modules
        MaterialSharedModule,
        // Fuse modules
        RcmModule.forRoot(rcmConfig),
        FuseSharedModule,

        // App modules
        LayoutModule,
        AppStoreModule
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        AuthStore,
        HttpCancelService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
    ]
})
export class AppModule {
}
