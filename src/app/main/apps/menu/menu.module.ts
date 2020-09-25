import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MenuComponent} from './menu.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {FuseSharedModule} from '@rcm/shared.module';
import {TranslateModule} from '@ngx-translate/core';

const routes: Routes = [
    // {
    //     path: 'submenu',
    //     component: MenuComponent
    // },
    // {
    //     path: '**',
    //     redirectTo: 'submenu'
    // }
];

@NgModule({
    declarations: [MenuComponent],
    imports: [
        RouterModule.forChild(routes),
        MaterialSharedModule,
        FuseSharedModule,
        TranslateModule
    ],
    providers: [],
    exports: [
        MenuComponent
    ]
})
export class MenuModule {
}