import { LocalStorageService } from './local-storage.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertsService } from './alerts.service';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
    private alert: AlertsService
  ) {}

  private baseUrl = 'http://localhost:3000';
  private successHandler(value: any) {
    return value;
  }
  private errorHandler(error: any) {
    return error;
  }

  public makeRequest(requestObject: {
    method: any;
    location: any;
    body?: any;
  }): any {
    const method = requestObject.method.toLowerCase();
    if (!method) {
      return console.log('No method specified in the request object.');
    }
    const body = requestObject.body || {};
    const location = requestObject.location;
    if (!location) {
      return console.log('No location specified in the request object.');
    }
    const url = `${this.baseUrl}/${location}`;

    let httpOptions = {};

    if (this.storage.getToken()) {
      httpOptions = {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this.storage.getToken()}`,
        }),
      };
    }

    if (method === 'get') {
      return this.http
        .get(url, httpOptions)
        .toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }
    if (method === 'post') {
      return this.http
        .post(url, body, httpOptions)
        .toPromise()
        .then(this.successHandler)
        .catch(this.errorHandler);
    }
    console.log(
      'Could not make the request. Make sure a method of GET or POST is supplied.'
    );
  }

  public makeFriendRequest(to: any) {
    const from = this.storage.getParsedToken()._id;
    const requestObject = {
      location: `users/make-friend-request/${from}/${to}`,
      method: 'POST',
    };

    return new Promise((resolve, reject) => {
      this.makeRequest(requestObject).then((val: any) => {
        if (val.statusCode === 201) {
          this.alert.onAlertEvent.emit('Successfully sent a friend request.');
        } else {
          this.alert.onAlertEvent.emit(
            'Something went wrong, we could not send friend request.'
          );
        }
        resolve(val);
      });
    });
  }

  public resolveFriendRequest(resolution: string, id: any) {
    const to = this.storage.getParsedToken()._id;

    return new Promise((resolve, reject) => {
      const requestObject = {
        location: `users/resolve-friend-request/${id}/${to}?resolution=${resolution}`,
        method: 'POST',
      };

      this.makeRequest(requestObject).then((val: any) => {
        if (val.statusCode === 201) {
          this.alert.updateNumOfFriendRequestsEvent.emit();
          const resolutioned =
            resolution === 'accept' ? 'accepted' : 'declined';
          this.alert.onAlertEvent.emit(
            `Successfully ${resolutioned} friend request.`
          );
        } else {
          this.alert.onAlertEvent.emit(
            'Something went wrong and we could not handle your friend request.'
          );
        }
        resolve(val);
      });
    });
  }
}
