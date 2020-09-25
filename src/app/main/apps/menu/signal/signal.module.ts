import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {FuseSharedModule} from '@rcm/shared.module';
import {MaterialSharedModule} from 'app/material.shared.module';

import {SignalPointsComponent} from './signal-points/signal-points.component';
import {DatePipe} from '@angular/common';
import {IntensiveSignalComponent} from './intensive-signal/intensive-signal.component';
import {IntensiveCardComponent} from './intensive-signal/intensive-card/intensive-card.component';
import {IntensiveGraphComponent} from './intensive-signal/intensive-card/intensive-graph/intensive-graph.component';
import {SignalService} from '../../services/signal.service';
import {ProjectGuard} from '../../../../../@rcm/_authentication/project.guard';
import {TranslateModule} from '@ngx-translate/core';
import {RelatedDataModule} from '@rcm/components/related-data/related-data.module';
import {SignalPointDialogModule} from '@rcm/components/signal-point-dialog/signal-point-dialog.module';
import {SignalPointInfoComponent} from '@rcm/components/signal-point-dialog/signal-point-info/signal-point-info.component';
import {RelatedSignalFormComponent} from '@rcm/components/related-signal-form/related-signal-form.component';
import {RelatedSignalFormModule} from '@rcm/components/related-signal-form/related-signal-form.module';
import {NgxEchartsModule} from 'ngx-echarts';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
    {
        path: '',
        component: SignalPointsComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: 'signalPoint',
        component: SignalPointsComponent,
        canActivate: [ProjectGuard]
    },
    {
        path: 'intensiveSignal',
        component: IntensiveSignalComponent,
        canActivate: [ProjectGuard]
    },
];

@NgModule({
    declarations: [
        SignalPointsComponent,
        IntensiveSignalComponent,
        IntensiveCardComponent,
        IntensiveGraphComponent,
    ],
    imports: [
        RouterModule.forChild(routes),

        MaterialSharedModule,
        FuseSharedModule,
        TranslateModule,
        SignalPointDialogModule,
        RelatedDataModule,
        RelatedSignalFormModule,
        NgxEchartsModule,
        NgSelectModule
    ],
    providers: [
        SignalService,
        DatePipe
    ],
    entryComponents: [
        IntensiveGraphComponent,
        SignalPointInfoComponent,
        RelatedSignalFormComponent
    ],
})
export class SignalModule {
}
