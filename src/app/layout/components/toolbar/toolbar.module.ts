import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatIconModule, MatMenuModule, MatToolbarModule} from '@angular/material';

import {FuseSearchBarModule, FuseShortcutsModule} from '@rcm/components';
import {FuseSharedModule} from '@rcm/shared.module';

import {ToolbarComponent} from 'app/layout/components/toolbar/toolbar.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        ToolbarComponent
    ],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,
        TranslateModule
    ],
    exports: [
        ToolbarComponent
    ]

})
export class ToolbarModule {
}
