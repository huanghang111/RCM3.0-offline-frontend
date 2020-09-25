import {NgModule} from '@angular/core';
import {MatButtonModule, MatDialogModule} from '@angular/material';

import {FuseConfirmDialogComponent} from '@rcm/components/confirm-dialog/confirm-dialog.component';
import {MaterialSharedModule} from 'app/material.shared.module';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        FuseConfirmDialogComponent
    ],
    imports: [
        MatDialogModule,
        MatButtonModule,
        MaterialSharedModule,
        TranslateModule
    ],
    entryComponents: [
        FuseConfirmDialogComponent
    ],
})
export class FuseConfirmDialogModule {
}
