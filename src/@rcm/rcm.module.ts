import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';

import {RCM_CONFIG} from '@rcm/services/config.service';

@NgModule()
export class RcmModule {
    constructor(@Optional() @SkipSelf() parentModule: RcmModule) {
        if (parentModule) {
            throw new Error('RcmModule is already loaded. Import it in the AppModule only!');
        }
    }

    static forRoot(config): ModuleWithProviders {
        return {
            ngModule: RcmModule,
            providers: [
                {
                    provide: RCM_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}
