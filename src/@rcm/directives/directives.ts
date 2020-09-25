import {NgModule} from '@angular/core';

import {FuseIfOnDomDirective} from '@rcm/directives/fuse-if-on-dom/fuse-if-on-dom.directive';
import {FuseInnerScrollDirective} from '@rcm/directives/fuse-inner-scroll/fuse-inner-scroll.directive';
import {FusePerfectScrollbarDirective} from '@rcm/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import {FuseMatSidenavHelperDirective, FuseMatSidenavTogglerDirective} from '@rcm/directives/fuse-mat-sidenav/fuse-mat-sidenav.directive';

@NgModule({
    declarations: [
        FuseIfOnDomDirective,
        FuseInnerScrollDirective,
        FuseMatSidenavHelperDirective,
        FuseMatSidenavTogglerDirective,
        FusePerfectScrollbarDirective
    ],
    imports: [],
    exports: [
        FuseIfOnDomDirective,
        FuseInnerScrollDirective,
        FuseMatSidenavHelperDirective,
        FuseMatSidenavTogglerDirective,
        FusePerfectScrollbarDirective
    ]
})
export class FuseDirectivesModule {
}
