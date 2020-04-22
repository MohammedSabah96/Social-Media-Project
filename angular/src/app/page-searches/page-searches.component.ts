import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-page-searches',
  templateUrl: './page-searches.component.html',
  styleUrls: ['./page-searches.component.css'],
})
export class PageSearchesComponent implements OnInit {
  subscription: any;
  constructor(private api: ApiService, private route: ActivatedRoute) {}

  public results: any;
  public query = this.route.snapshot.params.query;

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe((params) => {
      this.query = params.query;
      this.getResults();
    });
  }

  private getResults() {
    const requestObject = {
      location: `users/get-search-results?query=${this.query}`,
      type: 'GET',
      authorize: true,
    };

    this.api.makeRequest(requestObject).then((val: any) => {
      this.results = val.results;
    });
  }
}
