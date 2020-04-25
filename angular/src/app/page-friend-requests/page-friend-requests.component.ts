import { ApiService } from './../api.service';
import { UserDataService } from './../user-data.service';
import { Component, OnInit, Inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-page-friend-requests',
  templateUrl: './page-friend-requests.component.html',
  styleUrls: ['./page-friend-requests.component.css'],
})
export class PageFriendRequestsComponent implements OnInit {
  constructor(
    private centralUserData: UserDataService,
    private api: ApiService,
    private title: Title,
    @Inject(DOCUMENT) private document: Document
  ) {}
  public userData: any = {};
  public friendRequests = [];
  ngOnInit(): void {
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');
    this.title.setTitle('Friend Requests');
    this.centralUserData.getUserData.subscribe((data: any) => {
      this.userData = data;

      const array = JSON.stringify(this.userData.friend_requests);

      const requestObject = {
        location: `users/get-friend-requests?friend_requests=${array}`,
        type: 'GET',
        authorize: true,
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
}
