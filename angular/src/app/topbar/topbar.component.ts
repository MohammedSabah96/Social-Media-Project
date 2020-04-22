import { AlertsService } from './../alerts.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../auth.service';
import { LocalStorageService } from './../local-storage.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit {
  constructor(
    public auth: AuthService,
    private router: Router,
    private storage: LocalStorageService,
    private alert: AlertsService
  ) {}

  public query = '';
  public username = 'WOW';
  public alertMessage: any;
  ngOnInit(): void {
    this.username = this.storage.getParsedToken().name;
    this.alert.onAlertEvent.subscribe((msg: any) => {
      this.alertMessage = msg;
    });
  }

  public searchForFriends() {
    this.router.navigate(['/search-results', { query: this.query }]);
  }
}
