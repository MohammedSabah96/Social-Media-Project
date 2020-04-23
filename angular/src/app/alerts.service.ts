import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
// EventEmitterService
export class AlertsService {
  onAlertEvent: EventEmitter<string> = new EventEmitter();
  updateNumOfFriendRequestsEvent: EventEmitter<string> = new EventEmitter();
  constructor() {}
}
