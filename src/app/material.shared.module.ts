import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { FlexLayoutModule } from '@angular/flex-layout';
import 'hammerjs';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FlexLayoutModule,

        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatGridListModule,
        MatCardModule,
        MatTabsModule,
        MatToolbarModule,
        MatSidenavModule,
        MatSortModule
    ],
    exports: [
        CommonModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSnackBarModule,
        MatDialogModule,
        MatMomentDateModule,
        MatTooltipModule,
        MatExpansionModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatGridListModule,
        MatCardModule,
        MatTabsModule,
        MatToolbarModule,
        MatSidenavModule,
        MatSortModule,
    ]
})
export class MaterialSharedModule {
}
