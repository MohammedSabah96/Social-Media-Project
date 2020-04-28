import { UserDataService } from './../user-data.service';
import { ApiService } from './../api.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-page-messages',
  templateUrl: './page-messages.component.html',
  styleUrls: ['./page-messages.component.css'],
})
export class PageMessagesComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private api: ApiService,
    private centralUserData: UserDataService
  ) {}

  public activeMessage = {
    fromId: '',
    fromName: '',
    fromProfilePicture: '',
    messageGroups: [],
  };

  public messages = [];
  public usersProfileImage = 'default-avatar';
  public usersName = '';
  public usersId = '';
  public newMessage = '';

  public userDataEvent: any;

  ngOnInit(): void {
    this.title.setTitle('Your Messages');
    this.api.resetMessageNotifications();

    if (history.state.data && history.state.data.msgId) {
      this.activeMessage.fromId = history.state.data.msgId;
    }

    this.userDataEvent = this.centralUserData.getUserData.subscribe(
      (user: any) => {
        if (user.messages.length) {
          this.activeMessage.fromId =
            this.activeMessage.fromId || user.messages[0].from_id;
          this.messages = user.messages.reverse();
          this.usersName = user.name;
          this.usersId = user._id;
          this.usersProfileImage = user.profile_image;
          this.setActiveMessage(this.activeMessage.fromId);
        }
      }
    );
  }

  public setActiveMessage(id: any) {
    for (const message of this.messages) {
      if (message.from_id === id) {
        this.activeMessage.fromId = message.from_id;
        this.activeMessage.fromName = message.messengerName;
        this.activeMessage.fromProfilePicture = message.messengerProfileImage;

        const groups = (this.activeMessage.messageGroups = []);

        for (const content of message.content) {
          const me = content.messenger === this.usersId;

          if (groups.length) {
            const lastMessengerId = groups[groups.length - 1].id;

            if (content.messenger === lastMessengerId) {
              groups[groups.length - 1].messages.push(content.message);
              continue;
            }
          }
          const group = {
            image: me ? this.usersProfileImage : message.messengerProfileImage,
            name: me ? 'Me' : message.messengerName,
            id: content.messenger,
            messages: [content.message],
            isMe: me,
          };
          groups.push(group);
        }
      }
    }
  }

  public sendMessage() {
    if (!this.newMessage) {
      return;
    }
    const obj = {
      content: this.newMessage,
      id: this.activeMessage.fromId,
    };

    this.api.sendMessage(obj, false).then((val: any) => {
      if (val.statusCode === 201) {
        const groups = this.activeMessage.messageGroups;
        if (groups[groups.length - 1].isMe) {
          groups[groups.length - 1].messages.push(this.newMessage);
        } else {
          const newGroup = {
            image: this.usersProfileImage,
            name: this.usersName,
            id: this.usersId,
            messages: [this.newMessage],
            isMe: true,
          };
          groups.push(newGroup);
        }

        for (const message of this.messages) {
          if (message.from_id === this.activeMessage.fromId) {
            const newContent = {
              message: this.newMessage,
              messenger: this.usersId,
            };
            message.content.push(newContent);
          }
        }
        this.newMessage = '';
      }
    });
  }

  public deleteMessage(msgId: any) {
    const requestObject = {
      location: `users/delete-message/${msgId}`,
      method: 'POST',
    };

    this.api.makeRequest(requestObject).then((val: any) => {
      if (val.statusCode === 201) {
        for (let i = 0; i < this.messages.length; i++) {
          if (this.messages[i]._id === msgId) {
            this.messages.splice(i, 1);
            if (this.messages.length === 0) {
              return;
            }
            this.setActiveMessage(this.messages[0].from_id);
            break;
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.userDataEvent.unsubscribe();
  }
}
