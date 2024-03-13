import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';

import { AuthenticationService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    loading: boolean;
    testAccounts = [{
        userName: 'student1',
        fullName: 'Student 1',
        category: 'student'
    },
    {
        userName: 'student2',
        fullName: 'Student 2',
        category: 'student'
    },
    {
        userName: 'student3',
        fullName: 'Student 3',
        category: 'student'
    },
    {
        userName: 'student4',
        fullName: 'Student 4',
        category: 'student'
    },
    {
        userName: 'student5',
        fullName: 'Student 5',
        category: 'student'
    },
    {
        userName: 'student6',
        fullName: 'Student 6',
        category: 'student'
    },
    {
        userName: 'staff1',
        fullName: 'Staff 1',
        category: 'staff'
    },
    {
        userName: 'staff2',
        fullName: 'Staff 2',
        category: 'staff'
    }] 

    constructor(private router: Router,
        private titleService: Title,
        private notificationService: NotificationService,
        private authenticationService: AuthenticationService) {
    }

    ngOnInit() {
        this.titleService.setTitle('Lab Manager - Login');
        this.authenticationService.logout();
        this.createForm();
    }

    private createForm() {
        this.loginForm = new FormGroup({
            account: new FormControl('', Validators.required)
        });
    }

    login() {
        const testAccount = this.loginForm.get('account').value;
        console.log(testAccount);

        this.loading = true;
        this.authenticationService
            .login(testAccount.userName, testAccount.fullName, testAccount.category)
            .subscribe(
                data => {
                    this.router.navigate(['/']);
                },
                error => {
                    this.notificationService.openSnackBar(error.error);
                    this.loading = false;
                }
            );
    }

    CASlogin() {
        this.authenticationService.requestCASlogin();
    }

    // resetPassword() {
    //     this.router.navigate(['/auth/password-reset-request']);
    // }
}
