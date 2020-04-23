import { ApiService } from './../api.service';
import { UserDataService } from './../user-data.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-page-friend-requests',
  templateUrl: './page-friend-requests.component.html',
  styleUrls: ['./page-friend-requests.component.css'],
})
export class PageFriendRequestsComponent implements OnInit {
  constructor(
    private centralUserData: UserDataService,
    private api: ApiService
  ) {}

  public userData: any = {};
  public friendRequests = [];
  ngOnInit(): void {
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
          console.log(this.friendRequests);
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
