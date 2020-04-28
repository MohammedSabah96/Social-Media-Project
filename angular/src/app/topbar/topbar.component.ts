import { ApiService } from './../api.service';
import { UserDataService } from './../user-data.service';
import { AlertsService } from './../alerts.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './../auth.service';
import { LocalStorageService } from './../local-storage.service';
@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  constructor(
    public auth: AuthService,
    private router: Router,
    private storage: LocalStorageService,
    private alert: AlertsService,
    private centralUserData: UserDataService,
    private api: ApiService
  ) {}
  public query = '';
  public alertEvent: any;
  public FriendRequestEvent: any;
  public userDataEvent: any;
  public resetMessagesEvent: any;
  public updateMessageEvent: any;
  public alertMessage: any;
  public sendMessageObject: any = {
    id: '',
    name: '',
    content: '',
  };

  public username = '';
  public userId = '';
  public profilePicture = 'default-avatar';
  public messagePreviews = [];
  public notifications = {
    alert: 0,
    friendRequests: 0,
    messages: 0,
  };

  ngOnInit(): void {
    this.username = this.storage.getParsedToken().name;
    this.userId = this.storage.getParsedToken()._id;

    this.alertEvent = this.alert.onAlertEvent.subscribe((msg: any) => {
      this.alertMessage = msg;
    });
    this.FriendRequestEvent = this.alert.updateNumOfFriendRequestsEvent.subscribe(
      (_: any) => {
        this.notifications.friendRequests--;
      }
    );

    this.userDataEvent = this.centralUserData.getUserData.subscribe(
      (user: any) => {
        this.notifications.friendRequests = user.friend_requests.length;
        this.notifications.messages = user.new_message_notifications.length;
        this.profilePicture = user.profile_image;
        this.setMessagePreviews(user.messages, user.new_message_notifications);
      }
    );

    this.updateMessageEvent = this.alert.updateSendMessageObjectEvent.subscribe(
      (val: any) => {
        this.sendMessageObject.id = val.id;
        this.sendMessageObject.name = val.name;
      }
    );

    this.resetMessagesEvent = this.alert.resetMessageNotificationsEvent.subscribe(
      () => {
        this.notifications.messages = 0;
      }
    );

    const requestObject = {
      location: `users/get-user-data/${this.userId}`,
      method: 'GET',
    };
    this.api.makeRequest(requestObject).then((val: any) => {
      this.centralUserData.getUserData.emit(val.user);
    });
  }

  public searchForFriends() {
    this.router.navigate(['/search-results', { query: this.query }]);
  }

  public sendMessage() {
    this.api.sendMessage(this.sendMessageObject);
    this.sendMessageObject.content = '';
  }

  public resetMessageNotifications() {
    this.api.resetMessageNotifications();
  }

  private setMessagePreviews(messages: any, messageNotifications: any) {
    for (let i = messages.length - 1; i >= 0; i--) {
      const lastMessage = messages[i].content[messages[i].content.length - 1];

      const preview = {
        messengerName: messages[i].messengerName,
        messageContent: lastMessage.message,
        messengerImage: '',
        messengerId: messages[i].from_id,
        isNew: false,
      };

      if (lastMessage.messenger === this.userId) {
        preview.messengerImage = this.profilePicture;
      } else {
        preview.messengerImage = messages[i].messengerProfileImage;
        if (messageNotifications.includes(messages[i].from_id)) {
          preview.isNew = true;
        }
      }

      if (preview.isNew) {
        this.messagePreviews.unshift(preview);
      } else {
        this.messagePreviews.push(preview);
      }
    }
  }

  public messageLink(messageId: any) {
    this.router.navigate(['/messages'], {
      state: { data: { msgId: messageId } },
    });
  }

  ngOnDestroy(): void {
    this.alertEvent.unsubscribe();
    this.FriendRequestEvent.unsubscribe();
    this.userDataEvent.unsubscribe();
    this.updateMessageEvent.unsubscribe();
    this.resetMessagesEvent.unsubscribe();
  }
}
