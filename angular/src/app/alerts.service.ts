import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
// EventEmitterService
export class AlertsService {
  onAlertEvent: EventEmitter<string> = new EventEmitter();
  updateNumOfFriendRequestsEvent: EventEmitter<string> = new EventEmitter();
  updateSendMessageObjectEvent: EventEmitter<object> = new EventEmitter();
  resetMessageNotificationsEvent: EventEmitter<string> = new EventEmitter();
  getUserData: EventEmitter<any> = new EventEmitter();
  constructor() {}
}
