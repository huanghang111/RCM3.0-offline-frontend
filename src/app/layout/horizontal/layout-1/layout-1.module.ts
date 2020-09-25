import {NgModule} from '@angular/core';
import {MatSidenavModule} from '@angular/material';

import {FuseSidebarModule, FuseThemeOptionsModule} from '@rcm/components';
import {FuseSharedModule} from '@rcm/shared.module';

import {ContentModule} from 'app/layout/components/content/content.module';
import {FooterModule} from 'app/layout/components/footer/footer.module';
import {NavbarModule} from 'app/layout/components/navbar/navbar.module';
import {ToolbarModule} from 'app/layout/components/toolbar/toolbar.module';

import {HorizontalLayout1Component} from 'app/layout/horizontal/layout-1/layout-1.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {MenuModule} from 'app/main/apps/menu/menu.module';
import {ClickOutsideModule} from 'ng-click-outside';

@NgModule({
    declarations: [
        HorizontalLayout1Component
    ],
    imports: [
        MatSidenavModule,

        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,
        ContentModule,
        FooterModule,
        NavbarModule,
        ToolbarModule,
        MaterialSharedModule,
        MenuModule,
        ClickOutsideModule
    ],
    exports: [
        HorizontalLayout1Component
    ]
})
export class HorizontalLayout1Module {
}
