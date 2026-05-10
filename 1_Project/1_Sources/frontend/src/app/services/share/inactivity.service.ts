import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private logoutTimeout: any;
  private warningTimeout: any;
  private isWatching = false;

  private logoutSubject = new Subject<void>();
  private warningSubject = new Subject<void>();

  public logout$ = this.logoutSubject.asObservable();
  public warning$ = this.warningSubject.asObservable();

  private readonly WARNING_MINUTES_BEFORE = 2;

  constructor() {}

  startWatching(): void {
    if (this.isWatching) {
      return;
    }

    this.isWatching = true;

    document.addEventListener('click', this.resetTimerBound);
    document.addEventListener('keydown', this.resetTimerBound);
    document.addEventListener('mousemove', this.resetTimerBound);

    this.resetTimer();
  }

  stopWatching(): void {
    if (!this.isWatching) {
      return;
    }

    this.isWatching = false;

    document.removeEventListener('click', this.resetTimerBound);
    document.removeEventListener('keydown', this.resetTimerBound);
    document.removeEventListener('mousemove', this.resetTimerBound);

    this.clearTimers();
  }

  resetTimer(): void {
    this.clearTimers();

    const timeoutMs = environment.inactivityTimeoutMinutes * 60 * 1000;
    const warningMs = timeoutMs - (this.WARNING_MINUTES_BEFORE * 60 * 1000);

    this.warningTimeout = setTimeout(() => {
      this.warningSubject.next();
    }, warningMs);

    this.logoutTimeout = setTimeout(() => {
      this.logoutSubject.next();
    }, timeoutMs);
  }

  private clearTimers(): void {
    if (this.logoutTimeout) {
      clearTimeout(this.logoutTimeout);
      this.logoutTimeout = null;
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
  }

  private resetTimerBound = () => {
    this.resetTimer();
  };
}