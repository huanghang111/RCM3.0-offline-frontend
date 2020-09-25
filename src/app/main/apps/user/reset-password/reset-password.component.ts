import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {confirmPasswordValidator} from '../../../../../@rcm/_helpers/passwordValidator';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {UserService} from '../user.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    userData: any;

    resetPasswordForm: FormGroup;
    dialogRef: any;
    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(private _formBuilder: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private _data: any,
                private userService: UserService,
                public matDialogRef: MatDialogRef<ResetPasswordComponent>,
                private _matSnackBar: MatSnackBar) {
        matDialogRef.disableClose = true;
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    get password(): any {
        return this.resetPasswordForm.get('password');
    }

    ngOnInit() {
        this.resetPasswordForm = new FormGroup({
            password: new FormControl('', [
                Validators.required,
                Validators.minLength(4),
                Validators.maxLength(100)
            ]),
            passwordConfirm: new FormControl('', [
                Validators.required,
                confirmPasswordValidator
            ])
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
            });
        if (this._data) {
            this.userData = this._data.userData;
            // console.log(this._data.userData);
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    resetPassword() {
        this.userService.resetPassword(this.userData.loginName, this.password.value).subscribe(() => {
            this._matSnackBar.open(`Reset password for "${this.userData.loginName}" successfully!`, 'OK', {
                verticalPosition: 'bottom',
                duration: 5000
            });
            this.matDialogRef.close({
                status: 'success'
            });
        });
    }
}


