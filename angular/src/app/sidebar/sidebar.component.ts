import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './../auth.service';
import { UserDataService } from './../user-data.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  constructor(
    public auth: AuthService,
    private centralUserData: UserDataService
  ) {}

  public userData: any = {};
  public userDataEvent: any;

  ngOnInit(): void {
    this.userDataEvent = this.centralUserData.getUserData.subscribe(
      (data: any) => {
        this.userData = data;
      }
    );
  }

  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
