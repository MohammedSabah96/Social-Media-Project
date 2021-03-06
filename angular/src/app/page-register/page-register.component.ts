import { Router } from '@angular/router';
import { LocalStorageService } from './../local-storage.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from './../api.service';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-page-register',
  templateUrl: './page-register.component.html',
  styleUrls: ['./page-register.component.css'],
})
export class PageRegisterComponent implements OnInit {
  constructor(
    private api: ApiService,
    private storage: LocalStorageService,
    private router: Router,
    private title: Title
  ) {}

  public formError = '';
  public credentials = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirm: '',
  };
  ngOnInit(): void {
    this.title.setTitle('A Social Media - Register');
  }

  public formSubmit() {
    this.formError = '';
    if (
      !this.credentials.first_name ||
      !this.credentials.last_name ||
      !this.credentials.email ||
      !this.credentials.password ||
      !this.credentials.password_confirm
    ) {
      return (this.formError = 'All fields are required.');
    }
    // we don't use it in development mode (only on production mode)
    // const re = new RegExp(
    // tslint:disable-next-line: max-line-length
    //   /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%*'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    // );
    // if (!re.test(this.credentials.email)) {
    //   return (this.formError = 'Please enter a valid email address.');
    // }

    if (this.credentials.password !== this.credentials.password_confirm) {
      return (this.formError = 'Passwords do not match');
    }

    this.register();
  }
  private register() {
    const requestObject = {
      method: 'POST',
      location: 'users/register',
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
