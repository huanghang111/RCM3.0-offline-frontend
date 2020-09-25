import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})

export class MenuComponent implements OnInit {
    constructor(private router: Router,
                private authStore: AuthStore) {
    }

    ngOnInit() {
    }

    navigate(url: string) {
        this.router.navigate([url]);
    }

    initProjectName(): string {
        return this.authStore.getProjectName() ? this.authStore.getProjectName().toUpperCase() : 'DEFAULT PROJECT';
        // if (this.authStore.getProjectName() != null) {
        //     return this.authStore.getProjectName().toUpperCase();
        // } else {
        //     return 'Default Project'.toUpperCase()
        // }
    }
}
