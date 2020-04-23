import { LocalStorageService } from './../local-storage.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from './../api.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.css'],
})
export class PageLoginComponent implements OnInit {
  constructor(
    private api: ApiService,
    private storage: LocalStorageService,
    private router: Router,
    private title: Title
  ) {}

  public formError = '';
  public credentials = {
    email: '',
    password: '',
  };
  ngOnInit(): void {
    this.title.setTitle('A Social Media - Login');
  }

  public formSubmit() {
    this.formError = '';
    if (!this.credentials.email || !this.credentials.password) {
      return (this.formError = 'All fields are required.');
    }

    if (!this.formError) {
      this.login();
    }
  }
  private login() {
    const requestObject = {
      type: 'POST',
      location: 'users/login',
      body: this.credentials,
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.token) {
        this.storage.setToken(val.token);
        this.router.navigate(['/']);
        return;
      }
      if (val.message) {
        this.formError = val.message;
      }
    });
  }
}
