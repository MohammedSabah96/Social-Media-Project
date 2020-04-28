import { AlertsService } from './../alerts.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';
import { UserDataService } from './../user-data.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.css'],
})
export class PageProfileComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    @Inject(DOCUMENT) private document: Document,
    private api: ApiService,
    private centralUserData: UserDataService,
    private route: ActivatedRoute,
    private alert: AlertsService
  ) {}

  public randomFriends = [];
  public totalFriends = 0;
  public posts: object[] = [];
  public profilePicture = 'default-avatar';
  public showPosts = 6;
  public usersName = '';
  public usersEmail = '';
  public usersId = '';

  public canAddUser = false;
  public canSendMessage = false;
  public haveSentFriendRequest = false;
  public haveReceivedFriendRequest = false;
  public userDataEvent: any;
  ngOnInit(): void {
    this.title.setTitle('Profile');
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');

    this.userDataEvent = this.centralUserData.getUserData.subscribe(
      (user: any) => {
        this.route.params.subscribe((params) => {
          this.showPosts = 6;
          if (user._id === params.userid) {
            this.setComponentValues(user);
            this.resetBooleans();
          } else {
            this.canSendMessage = true;
            const requestObject = {
              location: `users/get-user-data/${params.userid}`,
              method: 'GET',
            };
            this.api
              .makeRequest(requestObject)
              .then((data: { statusCode: number; user: any }) => {
                if (data.statusCode === 200) {
                  this.canAddUser = user.friends.includes(data.user._id)
                    ? false
                    : true;

                  this.haveReceivedFriendRequest = user.friend_requests.includes(
                    data.user._id
                  )
                    ? true
                    : false;

                  this.haveSentFriendRequest = data.user.friend_requests.includes(
                    user._id
                  )
                    ? true
                    : false;

                  if (this.canAddUser) {
                    this.showPosts = 0;
                  }

                  this.setComponentValues(data.user);
                }
              });
          }
        });
      }
    );
  }

  public showMorePosts() {
    this.showPosts += 6;
  }

  public backToTop() {
    this.document.body.scrollTop = this.document.documentElement.scrollTop = 0;
  }

  private setComponentValues(user: any) {
    this.randomFriends = user.random_friends;
    this.profilePicture = user.profile_image;
    this.posts = user.posts;
    this.usersEmail = user.email;
    this.usersName = user.name;
    this.totalFriends = user.friends.length;
    this.usersId = user._id;
  }

  public accept() {
    this.api.resolveFriendRequest('accept', this.usersId).then((val: any) => {
      if (val.statusCode === 201) {
        this.haveReceivedFriendRequest = false;
        this.canAddUser = false;
        this.totalFriends++;
        this.showPosts = 6;
      }
    });
  }
  public decline() {
    this.api.resolveFriendRequest('decline', this.usersId).then((val: any) => {
      if (val.statusCode === 201) {
        this.haveReceivedFriendRequest = false;
      }
    });
  }

  public makeFriendRequest() {
    this.api.makeFriendRequest(this.usersId).then((val: any) => {
      if (val.statusCode === 201) {
        this.haveSentFriendRequest = true;
      }
    });
  }

  private resetBooleans() {
    this.canAddUser = false;
    this.canSendMessage = false;
    this.haveReceivedFriendRequest = false;
    this.haveSentFriendRequest = false;
  }

  public updateSendMessageObject(id: any, name: any) {
    this.alert.updateSendMessageObjectEvent.emit({ id, name });
  }

  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
