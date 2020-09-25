import {Component, Input, OnInit} from '@angular/core';
import {IntensiveGraphComponent} from './intensive-graph/intensive-graph.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {SettingService} from 'app/main/apps/services/setting.service';

@Component({
    selector: 'app-intensive-card',
    templateUrl: './intensive-card.component.html',
    styleUrls: ['./intensive-card.component.scss']
})
export class IntensiveCardComponent implements OnInit {
    @Input() data: any;

    constructor(private _matDialog: MatDialog,
                private settingService: SettingService,
                private _matSnackBar: MatSnackBar) {
    }

    ngOnInit() {
    }

    onInfo() {
        this._matDialog.open(IntensiveGraphComponent, {
            data: {
                signalData: this.data
            }
        });
    }

    onTrigger(name): void {
        this.settingService.sendMessageTrigger(name).subscribe(
            res => {
            }, error => {
                console.log(error);
                this._matSnackBar.open(`Error triggering the signal`, 'OK', {
                    verticalPosition: 'bottom',
                    duration: 3000
                });
            }
        );
    }
}
