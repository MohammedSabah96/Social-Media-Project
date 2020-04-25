import { ApiService } from './../api.service';
import { UserDataService } from './../user-data.service';
import { AlertsService } from './../alerts.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../auth.service';
import { LocalStorageService } from './../local-storage.service';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit, OnDestroy {
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
  public profilePicture = 'default-avatar';

  public alertEvent: any;
  public FriendRequestEvent: any;
  public userDataEvent: any;

  ngOnInit(): void {
    this.username = this.storage.getParsedToken().name;
    this.userId = this.storage.getParsedToken()._id;

    this.alertEvent = this.alert.onAlertEvent.subscribe((msg: any) => {
      this.alertMessage = msg;
    });
    this.FriendRequestEvent = this.alert.updateNumOfFriendRequestsEvent.subscribe(
      (_: any) => {
        this.numOfFriendRequests--;
      }
    );

    this.userDataEvent = this.centralUserData.getUserData.subscribe(
      (data: any) => {
        this.userData = data;
        this.numOfFriendRequests = data.friend_requests.length;
        this.profilePicture = data.profile_image;
      }
    );

    const requestObject = {
      location: `users/get-user-data/${this.userId}`,
      method: 'GET',
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      this.centralUserData.getUserData.emit(val.user);
    });
  }

  public searchForFriends() {
    this.router.navigate(['/search-results', { query: this.query }]);
  }
  ngOnDestroy(): void {
    this.alertEvent.unsubscribe();
    this.FriendRequestEvent.unsubscribe();
    this.userDataEvent.unsubscribe();
  }
}
