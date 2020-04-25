import { LocalStorageService } from './../local-storage.service';
import { ApiService } from './../api.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AlertsService } from './../alerts.service';
@Component({
  selector: 'app-page-feed',
  templateUrl: './page-feed.component.html',
  styleUrls: ['./page-feed.component.css'],
})
export class PageFeedComponent implements OnInit {
  constructor(
    private api: ApiService,
    private title: Title,
    private storage: LocalStorageService,
    private alert: AlertsService
  ) {}

  public newPostContent = '';
  public newPostTheme = this.storage.getPostTheme() || 'primary';
  public posts = {
    col1: [],
    col2: [],
    col3: [],
    col4: [],
  };
  ngOnInit(): void {
    this.title.setTitle('A Social Media - Feed');

    const requestObject = {
      location: 'users/generate-feed',
      method: 'GET',
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.statusCode === 200) {
        const fullCol1 = val.posts.filter(
          (value: any, i: number) => i % 4 === 0
        );
        const fullCol2 = val.posts.filter(
          (value: any, i: number) => i % 4 === 1
        );
        const fullCol3 = val.posts.filter(
          (value: any, i: number) => i % 4 === 2
        );
        const fullCol4 = val.posts.filter(
          (value: any, i: number) => i % 4 === 3
        );
        const cols = [fullCol1, fullCol2, fullCol3, fullCol4];
        this.addPostToFeed(cols, 0, 0);
      }
    });
  }

  public changeTheme(newTheme: string) {
    this.newPostTheme = newTheme;
    this.storage.setPostTheme(newTheme);
  }

  public createPost() {
    if (this.newPostContent.length === 0) {
      return this.alert.onAlertEvent.emit(
        'No content for your post was provided.'
      );
    }

    const requestObject = {
      location: 'users/create-post',
      method: 'POST',
      body: {
        theme: this.newPostTheme,
        content: this.newPostContent,
      },
    };

    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.statusCode === 201) {
        val.newPost.ago = 'Now';
        this.posts.col1.unshift(val.newPost);
      } else {
        this.alert.onAlertEvent.emit(
          'Something went wrong your post could not be created.'
        );
      }
      this.newPostContent = '';
    });
  }

  private addPostToFeed(array: any[], colNumber: number, delay: number) {
    setTimeout(() => {
      if (array[colNumber].length) {
        this.posts['col' + (colNumber + 1)].push(
          array[colNumber].splice(0, 1)[0]
        );
        colNumber = ++colNumber % 4;
        this.addPostToFeed(array, colNumber, 100);
      }
    }, delay);
  }
}
