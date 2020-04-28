import { AlertsService } from './../alerts.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './../auth.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  constructor(public auth: AuthService, private alert: AlertsService) {}

  public userData: any = {};

  public besties = [];
  public enemies = [];

  public userDataEvent: any;

  ngOnInit(): void {
    this.userDataEvent = this.alert.getUserData.subscribe((user: any) => {
      this.userData = user;
      this.besties = user.besties;
      this.enemies = user.enemies;
    });
  }

  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
