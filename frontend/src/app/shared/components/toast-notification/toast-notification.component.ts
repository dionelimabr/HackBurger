import { Component, OnInit } from '@angular/core';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-notification',
  templateUrl: './toast-notification.component.html',
  styleUrls: ['./toast-notification.component.scss']
})
export class ToastNotificationComponent implements OnInit {
  toasts: (ToastMessage & { id: number })[] = [];
  private idCounter = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toast$.subscribe(toast => {
      const id = this.idCounter++;
      const newToast = { ...toast, id };
      this.toasts.push(newToast);

      setTimeout(() => {
        this.remove(id);
      }, toast.duration || 3000);
    });
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
