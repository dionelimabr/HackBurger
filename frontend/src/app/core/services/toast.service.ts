import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  public toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 3000) {
    this.toastSubject.next({ message, type, duration });
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }
}
