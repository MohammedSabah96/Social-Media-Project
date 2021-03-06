import { AlertsService } from './../alerts.service';
import { ApiService } from './../api.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-page-friend-requests',
  templateUrl: './page-friend-requests.component.html',
  styleUrls: ['./page-friend-requests.component.css'],
})
export class PageFriendRequestsComponent implements OnInit, OnDestroy {
  constructor(
    private alert: AlertsService,
    private api: ApiService,
    private title: Title,
    @Inject(DOCUMENT) private document: Document
  ) {}
  public userData: any = {};
  public friendRequests = [];
  public userDataEvent: any;

  ngOnInit(): void {
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');
    this.title.setTitle('Friend Requests');
    this.userDataEvent = this.alert.getUserData.subscribe((data: any) => {
      this.userData = data;

      const array = JSON.stringify(this.userData.friend_requests);

      const requestObject = {
        location: `users/get-friend-requests?friend_requests=${array}`,
        method: 'GET',
      };
      this.api.makeRequest(requestObject).then((val: any) => {
        if (val.statusCode === 200) {
          this.friendRequests = val.users;
        }
      });
    });
  }

  public updateFriendRequests(id: any) {
    const arr = this.friendRequests;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]._id === id) {
        arr.splice(i, 1);
        break;
      }
    }
  }
  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
