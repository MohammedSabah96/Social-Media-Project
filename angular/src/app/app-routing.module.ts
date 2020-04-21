import { PageFriendRequestsComponent } from './page-friend-requests/page-friend-requests.component';
import { PageSearchesComponent } from './page-searches/page-searches.component';
import { PageMessagesComponent } from './page-messages/page-messages.component';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { PageFeedComponent } from './page-feed/page-feed.component';
import { PageLoginComponent } from './page-login/page-login.component';
import { PageRegisterComponent } from './page-register/page-register.component';
import { AuthService } from './auth.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/feed',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: PageRegisterComponent,
    canActivate: [AuthService],
  },
  {
    path: 'login',
    component: PageLoginComponent,
    canActivate: [AuthService],
  },
  {
    path: 'feed',
    component: PageFeedComponent,
    canActivate: [AuthService],
    data: { loggedIn: true },
  },
  {
    path: 'profile',
    component: PageProfileComponent,
    canActivate: [AuthService],
    data: { loggedIn: true },
  },
  {
    path: 'messages',
    component: PageMessagesComponent,
    canActivate: [AuthService],
    data: { loggedIn: true },
  },
  {
    path: 'search-results',
    component: PageSearchesComponent,
    canActivate: [AuthService],
    data: { loggedIn: true },
  },
  {
    path: 'friend-requests',
    component: PageFriendRequestsComponent,
    canActivate: [AuthService],
    data: { loggedIn: true },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
