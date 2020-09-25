import {Component, OnInit} from '@angular/core';
import {SignalService} from 'app/main/apps/services/signal.service';

@Component({
    selector: 'app-intensive-signal',
    templateUrl: './intensive-signal.component.html',
    styleUrls: ['./intensive-signal.component.scss']
})
export class IntensiveSignalComponent implements OnInit {
    intensiveSignals: any = [];

    constructor(private signalService: SignalService) {
    }

    ngOnInit() {
        this.getData();
    }

    getData() {
        this.signalService.getIntensiveSignals().subscribe(
            res => {
                if (res.code == 200 && res.data.listIntensiveData.length > 0) {
                    this.intensiveSignals = res.data.listIntensiveData;
                }
            },
            error => console.log(error),
        );
    }
}
