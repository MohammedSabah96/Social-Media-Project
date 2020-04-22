import { ApiService } from './../api.service';
import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-result-request',
  templateUrl: './result-request.component.html',
  styleUrls: ['./result-request.component.css'],
})
export class ResultRequestComponent implements OnInit {
  @Input() resultRequest: any;

  constructor(public api: ApiService) {}

  ngOnInit(): void {}
}
