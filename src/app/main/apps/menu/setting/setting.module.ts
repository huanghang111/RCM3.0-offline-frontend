import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {SignalSettingComponent} from './signal-setting/signal-setting.component';

import {SignalCalDialogComponent} from './signal-setting/signal-cal/signal-cal.component';
import {FuseSharedModule} from '@rcm/shared.module';
import {MaterialSharedModule} from 'app/material.shared.module';
import {ProjectSettingComponent} from './project-setting/project-setting.component';
import {ProjectDetailComponent} from './project-setting/project-detail/project-detail.component';
import {ProjectEditCreateFormComponent} from './project-setting/project-edit-create-form/project-edit-create-form.component';
import {DocumentSettingComponent} from './project-setting/document-setting/document-setting.component';
import {DocumentDetailComponent} from './project-setting/document-setting/document-detail/document-detail.component';
import {DocumentEditCreateFormComponent} from './project-setting/document-setting/document-edit-create-form/document-edit-create-form.component';
import {NgxPaginationModule} from 'ngx-pagination';
import {DashboardSettingComponent} from './project-setting/dashboard-setting/dashboard-setting.component';
import {TextComponent} from './project-setting/dashboard-setting/dashboard-element/text/text.component';
import {DashboardDialogComponent} from './project-setting/dashboard-setting/dashboard-element/dashboard-dialog/dashboard-dialog.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {SettingService} from '../../services/setting.service';
import {SignalService} from '../../services/signal.service';
import {AddEditDashboardComponent} from './project-setting/dashboard-setting/add-edit-dashboard/add-edit-dashboard.component';
import {LineHistoricalComponent} from './project-setting/dashboard-setting/dashboard-element/charts/historical/line-historical.component';
import {DiagnoseSettingHomeComponent} from './diagnose-setting-home/diagnose-setting-home.component';
import {DiagnoseSettingDetailComponent} from './diagnose-setting-home/diagnose-setting-detail/diagnose-setting-detail.component';
import {DiagnoseEditStepFormComponent} from './diagnose-setting-home/diagnose-setting-detail/diagnose-edit-step-form/diagnose-edit-step-form.component';
import {DiagnoseEditStepEditCreateFormComponent} from './diagnose-setting-home/diagnose-setting-detail/diagnose-edit-step-form/diagnose-edit-step-edit-create-form/diagnose-edit-step-edit-create-form.component';
import {DiagnoseEditCreateFormComponent} from './diagnose-setting-home/diagnose-setting-detail/diagnose-edit-create-form/diagnose-edit-create-form.component';
import {LineIntensiveComponent} from './project-setting/dashboard-setting/dashboard-element/charts/intensive/line-intensive.component';
import {LineRealtimeComponent} from './project-setting/dashboard-setting/dashboard-element/charts/realtime/line-realtime.component';
import {BarComponent} from './project-setting/dashboard-setting/dashboard-element/charts/bar/bar.component';
import {PieComponent} from './project-setting/dashboard-setting/dashboard-element/charts/pie/pie.component';
import {ProjectGuard} from '../../../../../@rcm/_authentication/project.guard';
import {RoleRexrothGuard} from '../../../../../@rcm/_authentication/role-rexroth.guard';
import {DocumentLinkComponent} from './project-setting/dashboard-setting/dashboard-element/document-link/document-link.component';
import {CatalogItemComponent} from './project-setting/dashboard-setting/dashboard-element/catalog-item/catalog-item.component';
import {PictureComponent} from './project-setting/dashboard-setting/dashboard-element/picture/picture.component';
import {SchematicComponent} from './project-setting/dashboard-setting/dashboard-element/schematic/schematic.component';
import {SchemeSPComponent} from './project-setting/dashboard-setting/dashboard-element/schematic/scheme-SP/scheme-sp.component';
import {DashboardSPComponent} from './project-setting/dashboard-setting/dashboard-element/dashboard-SP/dashboard-SP.component';
import {SignalCreateFormComponent} from './signal-setting/signal-create-form/signal-create-form.component';
import {SignalAddRelatedFormComponent} from './signal-setting/signal-add-related-form/signal-add-related-form.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {SlideDashboardComponent} from './dashboard/slide-dashboard/slide-dashboard.component';
import {HealthyFormComponent} from './signal-setting/healthy-form/healthy-form.component';
import {SchemeCataComponent} from './project-setting/dashboard-setting/dashboard-element/schematic/scheme-cata/scheme-cata.component';
import {CatalogDialogComponent} from './project-setting/dashboard-setting/dashboard-element/catalog-item/dialog/catalog-dialog/catalog-dialog.component';
import {ExportDataComponent} from './export-data/export-data.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgxEchartsModule} from 'ngx-echarts';
import {DashboardTemplateComponent} from './project-setting/dashboard-setting/dashboard-template/dashboard-template.component';
import {DashboardSpTypebComponent} from './project-setting/dashboard-setting/dashboard-element/dashboard-SP-typeB/dashboard-sp-typeb.component';
import {AngularEditorModule} from '@kolkov/angular-editor';
import {RelatedSignalFormModule} from '@rcm/components/related-signal-form/related-signal-form.module';
import {SignalPointDialogModule} from '@rcm/components/signal-point-dialog/signal-point-dialog.module';
import {SignalPointInfoComponent} from '@rcm/components/signal-point-dialog/signal-point-info/signal-point-info.component';
import {RelatedSignalFormComponent} from '@rcm/components/related-signal-form/related-signal-form.component';
import {SignalEditFormComponent} from './signal-setting/signal-edit-form/signal-edit-form.component';
import {DiagnoseCalculationComponent} from './diagnose-setting-home/calc/diagnose-calculation.component';
import {CommonDashboardModule} from '@rcm/components/common-dashboard/common-dashboard.module';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'signal',
        pathMatch: 'full'
    },
    {
        path: 'signal',
        component: SignalSettingComponent,
        canActivate: [ProjectGuard, RoleRexrothGuard]
    },
    {
        path: 'project-setting',
        component: ProjectSettingComponent,
        canActivate: [RoleRexrothGuard]
    },
    {
        path: 'project-setting/dashboard',
        component: DashboardSettingComponent,
    },
    {
        path: 'diagnose-setting',
        component: DiagnoseSettingHomeComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: 'export-data',
        component: ExportDataComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: 'diagnose-setting/:faultId/diagnose-setting-detail',
        component: DiagnoseSettingDetailComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: 'project-setting/dashboard/add-dashboard',
        component: AddEditDashboardComponent,
        data: {mode: 'add'},
    },
    {
        path: 'project-setting/dashboard/template',
        component: DashboardTemplateComponent,
    },
    {
        path: 'project-setting/dashboard/template/:id/add-dashboard',
        component: AddEditDashboardComponent,
        data: {mode: 'add', useTemplate: true},
    },
    {
        path: 'project-setting/dashboard/view-dashboard/:id',
        component: AddEditDashboardComponent,
        data: {mode: 'view'},
    },
    {
        path: 'project-setting/:projectId/dashboard/edit-dashboard/:id',
        component: AddEditDashboardComponent,
        canActivate: [ProjectGuard],
        data: {mode: 'edit'},

    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'dashboard/slide-dashboard',
        component: SlideDashboardComponent
    }
];

@NgModule({
    declarations: [
        SignalSettingComponent,
        SignalCalDialogComponent,
        ProjectSettingComponent,
        ProjectDetailComponent,
        ProjectEditCreateFormComponent,
        DocumentSettingComponent,
        DocumentDetailComponent,
        DocumentEditCreateFormComponent,
        DashboardSettingComponent,
        TextComponent,
        DashboardDialogComponent,
        DiagnoseSettingHomeComponent,
        DiagnoseSettingDetailComponent,
        DashboardSPComponent,
        AddEditDashboardComponent,
        LineHistoricalComponent,
        LineIntensiveComponent,
        LineRealtimeComponent,
        BarComponent,
        PieComponent,
        DiagnoseEditStepFormComponent,
        DiagnoseEditStepEditCreateFormComponent,
        DiagnoseEditCreateFormComponent,
        DocumentLinkComponent,
        CatalogItemComponent,
        PictureComponent,
        SchematicComponent,
        SchemeSPComponent,
        SignalCreateFormComponent,
        SignalAddRelatedFormComponent,
        DashboardComponent,
        SlideDashboardComponent,
        HealthyFormComponent,
        SchemeCataComponent,
        ExportDataComponent,
        CatalogDialogComponent,
        DashboardTemplateComponent,
        DashboardSpTypebComponent,
        SignalEditFormComponent,
        DiagnoseCalculationComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        MaterialSharedModule,
        NgxPaginationModule,
        FuseSharedModule,
        DragDropModule,
        AngularEditorModule,
        NgxEchartsModule,
        TranslateModule,
        SignalPointDialogModule,
        RelatedSignalFormModule,
        CommonDashboardModule,
        NgSelectModule
    ],
    entryComponents: [
        SignalCalDialogComponent,
        SignalEditFormComponent,
        ProjectEditCreateFormComponent,
        DocumentEditCreateFormComponent,
        DashboardDialogComponent,
        TextComponent,
        DashboardDialogComponent,
        DashboardSPComponent,
        LineHistoricalComponent,
        LineIntensiveComponent,
        LineRealtimeComponent,
        BarComponent,
        PieComponent,
        DiagnoseEditStepFormComponent,
        DiagnoseEditStepEditCreateFormComponent,
        DiagnoseEditCreateFormComponent,
        DocumentLinkComponent,
        CatalogItemComponent,
        PictureComponent,
        SchematicComponent,
        SchemeSPComponent,
        SignalCreateFormComponent,
        SignalAddRelatedFormComponent,
        DashboardComponent,
        SlideDashboardComponent,
        HealthyFormComponent,
        SchemeCataComponent,
        CatalogDialogComponent,
        DashboardSpTypebComponent,
        SignalPointInfoComponent,
        RelatedSignalFormComponent,
        DiagnoseCalculationComponent
    ],
    providers: [
        SettingService,
        SignalService,
        DatePipe
    ]
})
export class SettingModule {
}
