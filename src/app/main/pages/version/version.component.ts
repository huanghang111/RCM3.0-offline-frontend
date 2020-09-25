import {Component} from '@angular/core';

import {RcmConfigService} from '@rcm/services/config.service';
import {VersionService} from './version.service';

@Component({
    selector: 'version',
    templateUrl: './version.component.html',
    styleUrls: ['./version.component.scss']
})
export class VersionComponent {
    versionNumber: any;

    /**
     * Constructor
     *
     * @param {RcmConfigService} _rcmConfigService
     */
    constructor(
        private _rcmConfigService: RcmConfigService,
        private _versionService: VersionService
    ) {
        // Configure the layout
        this._rcmConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        this._versionService.getVersions().then((result: any) => {
            this.versionNumber = result;
        });
    }
}
