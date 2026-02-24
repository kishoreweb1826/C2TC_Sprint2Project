import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: (Toast & { visible: boolean })[] = [];
  private sub!: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.sub = this.toastService.toasts$.subscribe(toast => {
      const t = { ...toast, visible: true };
      this.toasts.push(t);
      setTimeout(() => this.dismiss(t.id), 3500);
    });
  }

  dismiss(id: number) {
    const t = this.toasts.find(x => x.id === id);
    if (t) {
      t.visible = false;
      setTimeout(() => {
        this.toasts = this.toasts.filter(x => x.id !== id);
      }, 350);
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️'
    };
    return icons[type] || '💬';
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
