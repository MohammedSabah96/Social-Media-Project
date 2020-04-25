import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { UserDataService } from './../user-data.service';
@Component({
  selector: 'app-page-searches',
  templateUrl: './page-searches.component.html',
  styleUrls: ['./page-searches.component.css'],
})
export class PageSearchesComponent implements OnInit, OnDestroy {
  subscription: any;
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private title: Title,
    private centralUserData: UserDataService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  public results: any;
  public query = this.route.snapshot.params.query;
  private user: any;
  public userDataEvent: any;

  ngOnInit(): void {
    this.document.getElementById('sidebarToggleTop').classList.add('d-none');
    this.title.setTitle('Search Results');
    this.userDataEvent = this.centralUserData.getUserData.subscribe(
      (data: any) => {
        this.subscription = this.route.params.subscribe((params) => {
          this.query = params.query;
          this.user = data;
          this.getResults();
        });
      }
    );
  }

  private getResults() {
    const requestObject = {
      location: `users/get-search-results?query=${this.query}`,
      method: 'GET',
    };

    this.api.makeRequest(requestObject).then((val: any) => {
      this.results = val.results;

      for (const result of this.results) {
        if (result.friends.includes(this.user._id)) {
          result.isFriend = true;
        }
        if (result.friend_requests.includes(this.user._id)) {
          result.haveSentFriendRequest = true;
        }
        if (this.user.friend_requests.includes(result._id)) {
          result.haveRecievedFriendRequest = true;
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
