import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  tokenName = '--token-ASM';
  postThemeName = '--post-theme-ASM';

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

  public getToken() {
    return this.get(this.tokenName);
  }

  public getParsedToken() {
    const token = this.getToken();
    return JSON.parse(atob(token.split('.')[1]));
  }

  public removeToken() {
    localStorage.removeItem(this.tokenName);
  }

  public setPostTheme(theme: string) {
    this.set(this.postThemeName, theme);
  }

  public getPostTheme() {
    return this.get(this.postThemeName);
  }
}
