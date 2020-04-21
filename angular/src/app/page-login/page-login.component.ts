import { Component, OnInit } from '@angular/core';
import { ApiService } from './../api.service';

@Component({
  selector: 'app-page-login',
  templateUrl: './page-login.component.html',
  styleUrls: ['./page-login.component.css'],
})
export class PageLoginComponent implements OnInit {
  constructor(private api: ApiService) {}

  public formError = '';
  public credentials = {
    email: '',
    password: '',
  };
  ngOnInit(): void {}

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
      if (val.statusText === 'Unauthorized' && val.status === 401) {
        this.formError = 'Your Email or Password does not exists.';
      }
    });
  }
}
