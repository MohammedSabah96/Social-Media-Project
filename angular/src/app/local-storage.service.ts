import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  tokenName = '--token-ASM';

  private set(key: string, value: string) {
    if (localStorage) {
      localStorage.setItem(key, value);
    } else {
      alert('Browser does not support the localStorage API');
    }
  }

  private get(key: string) {
    if (localStorage) {
      if (key in localStorage) {
        return localStorage.getItem(key);
      }
    } else {
      alert('Browser does not support the localStorage API');
    }
  }

  public setToken(token: string) {
    this.set(this.tokenName, token);
  }

  public getParsedToken() {
    const token = this.getToken();
    return JSON.parse(atob(token.split('.')[1]));
  }

  public getToken() {
    return this.get(this.tokenName);
  }
  public removeToken() {
    localStorage.removeItem(this.tokenName);
  }
}
