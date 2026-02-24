import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrderDetails, PAYMENT_MODES } from '../../models/order-details.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {

  @Input() order: OrderDetails | null = null;
  @Output() save  = new EventEmitter<OrderDetails>();
  @Output() close = new EventEmitter<void>();

  form!: FormGroup;
  isEdit = false;
  readonly paymentModes = PAYMENT_MODES;
  submitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.isEdit = !!this.order?.id;
    this.form = this.fb.group({
      dateOfPurchase: [
        this.order?.dateOfPurchase ? this.toInputFormat(this.order.dateOfPurchase) : '',
        [Validators.required]
      ],
      total: [
        this.order?.total ?? '',
        [Validators.required, Validators.min(0)]
      ],
      customerId: [
        this.order?.customerId ?? '',
        [Validators.required, Validators.min(1)]
      ],
      paymentMode: [
        this.order?.paymentMode ?? '',
        [Validators.required]
      ],
      shopId: [
        this.order?.shopId ?? '',
        [Validators.required, Validators.minLength(1)]
      ]
    });
  }

  // Convert "2025-06-15T10:30:00" → "2025-06-15T10:30" for datetime-local input
  toInputFormat(dt: string): string {
    return dt.length >= 16 ? dt.substring(0, 16) : dt;
  }

  // Convert "2025-06-15T10:30" → "2025-06-15T10:30:00" for backend
  toApiFormat(dt: string): string {
    return dt.length === 16 ? dt + ':00' : dt;
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getError(field: string): string {
    const c = this.form.get(field);
    if (!c || !c.errors) return '';
    if (c.errors['required'])  return 'This field is required';
    if (c.errors['min'])       return `Minimum value is ${c.errors['min'].min}`;
    if (c.errors['minlength']) return 'Too short';
    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const v = this.form.value;
    const payload: OrderDetails = {
      ...(this.isEdit && this.order?.id ? { id: this.order.id } : {}),
      dateOfPurchase: this.toApiFormat(v.dateOfPurchase),
      total: parseFloat(v.total),
      customerId: parseInt(v.customerId),
      paymentMode: v.paymentMode,
      shopId: v.shopId.trim()
    };
    this.save.emit(payload);
    this.submitting = false;
  }

  onClose(): void { this.close.emit(); }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
