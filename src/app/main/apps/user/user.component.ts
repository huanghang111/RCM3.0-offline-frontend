import {Component, OnInit} from '@angular/core';
import {AuthStore} from '../../../../@rcm/_authentication/auth.store';
import {UserService} from './user.service';
import {ADMIN, REXROTH} from '../../../../@rcm/_helpers/constant/role';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {MatDialog} from '@angular/material/dialog';
import {SocketApiService} from '../services/socket-api.service';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

    dialogRef: any;
    isShowed: Boolean = false;

    // displayedColumns = ['id', 'sigName', 'sigType', 'des', 'action'];
    displayedColumns = ['sigName', 'sigType', 'des', 'action'];
    totalItems: number = 0;
    currentPage: number = 1;
    itemsPerPage: number = 10;

    userData: any;

    messageBack: string;

    constructor(private authStore: AuthStore,
                private userService: UserService,
                private _matDialog: MatDialog,
                private socketApi: SocketApiService) {
    }

    ngOnInit() {
        this.authStore.removeSelectedProject();
        this.getUser();
    }

    getUser() {
        const role = this.authStore.getRoles();
        if (role === REXROTH) {
            this.userService.getAllSignal(this.currentPage, this.itemsPerPage).subscribe(data => this.processData(data));
        } else if (role === ADMIN) {
            this.userService.getAllSignalAd(this.currentPage, this.itemsPerPage).subscribe(data => this.processData(data));
        }

    }

    onPageChange(number: number) {
        this.currentPage = number;
        this.getUser();
    }

    onItemPerPage(event) {
        this.itemsPerPage = event;
        this.currentPage = 1;
        this.getUser();
    }

    resetPassword(user: any) {
        this.dialogRef = this._matDialog.open(ResetPasswordComponent, {
            panelClass: 'signal-edit-create-form',
            data: {
                userData: user
            }
        });
        this.dialogRef.afterClosed().subscribe(res => {
                if (res) {
                    this.getUser();
                }
            }
        );
    }

    private processData(res: any) {
        if (res) {
            // console.log(res);
            this.userData = res.data ? res.data.userPage.content : [];
            this.totalItems = res.data ? res.data.userPage.totalElements : 0;
        }
    }
}
