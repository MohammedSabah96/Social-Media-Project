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

  ngOnInit(): void {}

  public accept() {
    this.updateRequests();
    this.api
      .resolveFriendRequest('accept', this.resultRequest._id)
      .then((val) => {
        console.log(val);
      });
  }
  public decline() {
    this.updateRequests();
    this.api
      .resolveFriendRequest('decline', this.resultRequest._id)
      .then((val) => {
        console.log(val);
      });
  }

  private updateRequests() {
    this.resultRequestChange.emit(this.resultRequest._id);
  }
}
