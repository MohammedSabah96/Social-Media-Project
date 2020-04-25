import { LocalStorageService } from './../local-storage.service';
import { ApiService } from './../api.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-result-request',
  templateUrl: './result-request.component.html',
  styleUrls: ['./result-request.component.css'],
})
export class ResultRequestComponent implements OnInit {
  @Input() resultRequest: any;
  @Output() resultRequestChange = new EventEmitter<any>();
  @Input() use: any;

  constructor(public api: ApiService, private storage: LocalStorageService) {}

  public haveSentFriendRequest = false;
  public haveRecievedFriendRequest = false;
  public isFriend = false;
  ngOnInit(): void {
    if (this.resultRequest.haveSentFriendRequest) {
      this.haveSentFriendRequest = true;
    }
    if (this.resultRequest.haveSentFriendRequest) {
      this.haveSentFriendRequest = true;
    }
    if (this.resultRequest.haveRecievedFriendRequest) {
      this.haveRecievedFriendRequest = true;
    }
    if (this.resultRequest.isFriend) {
      this.isFriend = true;
    }
  }

  public accept() {
    this.updateRequests();
    this.api
      .resolveFriendRequest('accept', this.resultRequest._id)
      .then((val) => {});
  }
  public decline() {
    this.updateRequests();
    this.api
      .resolveFriendRequest('decline', this.resultRequest._id)
      .then((val) => {});
  }

  private updateRequests() {
    this.resultRequestChange.emit(this.resultRequest._id);
  }
  
}
