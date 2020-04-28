import { AlertsService } from './../alerts.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';
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

  public isBestie = false;
  public isEnemy = false;
  public maxAmountOfBesties = false;

  public canAddUser = false;
  public canSendMessage = false;
  public haveSentFriendRequest = false;
  public haveReceivedFriendRequest = false;
  public userDataEvent: any;

  private besties = [];
  private enemies = [];

  ngOnInit(): void {
    this.title.setTitle('Profile');
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');

    this.userDataEvent = this.alert.getUserData.subscribe((user: any) => {
      this.besties = user.besties;
      this.enemies = user.enemies;

      this.route.params.subscribe((params) => {
        this.showPosts = 6;

        this.isBestie = user.besties.some((v: any) => v._id === params.userid);
        this.isEnemy = user.enemies.some((v: any) => v._id === params.userid);

        this.maxAmountOfBesties = user.besties.length >= 2;

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
    });
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
    this.isBestie = false;
    this.isEnemy = false;
    this.maxAmountOfBesties = false;
  }

  public updateSendMessageObject(id: any, name: any) {
    this.alert.updateSendMessageObjectEvent.emit({ id, name });
  }

  public toggleRequest(toggle: any) {
    function toggleValue(array: any[]) {
      for (let i = 0; i < array.length; i++) {
        if (array[i]._id === this.usersId) {
          return array.splice(i, 1);
        }
      }
      array.push({ _id: this.usersId });
    }

    const requestObject = {
      location: `users/bestie-enemy-toggle/${this.usersId}?toggle=${toggle}`,
      method: 'POST',
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.statusCode === 201) {
        if (toggle === 'besties') {
          toggleValue.call(this, this.besties);
          this.maxAmountOfBesties = this.besties.length >= 2;
          this.isBestie = !this.isBestie;
        } else {
          toggleValue.call(this, this.enemies);
          this.isEnemy = !this.isEnemy;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
