import { ApiService } from './../api.service';
import { UserDataService } from './../user-data.service';
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
    private alert: AlertsService,
    private centralUserData: UserDataService,
    private api: ApiService
  ) {}

  public query = '';
  public username = '';
  public alertMessage: any;
  public userId = '';
  public userData: any = {};
  public numOfFriendRequests = 0;

  ngOnInit(): void {
    this.username = this.storage.getParsedToken().name;
    this.userId = this.storage.getParsedToken()._id;

    this.alert.onAlertEvent.subscribe((msg: any) => {
      this.alertMessage = msg;
    });
    this.alert.updateNumOfFriendRequestsEvent.subscribe((_: any) => {
      this.numOfFriendRequests--;
    });

    this.centralUserData.getUserData.subscribe((data: any) => {
      this.userData = data;
      this.numOfFriendRequests = data.friend_requests.length;
    });

    const requestObject = {
      location: `users/get-user-data/${this.userId}`,
      type: 'GET',
      authorize: true,
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      this.centralUserData.getUserData.emit(val.user);
    });
  }

  public searchForFriends() {
    this.router.navigate(['/search-results', { query: this.query }]);
  }
}
