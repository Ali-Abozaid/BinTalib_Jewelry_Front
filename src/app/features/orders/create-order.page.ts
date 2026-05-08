import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersStore } from '../../core/services/orders.store';
import { UiLanguageService } from '../../core/services/ui-language.service';
import { AuthService } from '../../core/auth/auth.service';
import { PricingType } from '../../core/models/order.model';
import { ImageUploadComponent } from '../../shared/components/image-upload.component';

@Component({
  selector: 'app-create-order-page',
  standalone: true,
  imports: [ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './create-order.page.html',
  styleUrl: './create-order.page.scss'
})
export class CreateOrderPageComponent implements OnInit {
  private readonly store = inject(OrdersStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  protected readonly lang = inject(UiLanguageService);

  protected readonly branches = this.store.branches;
  protected readonly customers = this.store.customers;

  protected readonly user = this.auth.user;
  protected readonly isBranchUser = computed(() => this.auth.role() === 'Branch');

  protected readonly form = this.fb.group({
    customerName: ['', Validators.required],
    customerPhone: ['', Validators.required],
    customerEmail: [''],
    branchId: ['', Validators.required],
    receivingEmployeeName: ['', Validators.required],
    weightBefore: [0, [Validators.required, Validators.min(0.01)]],
    imageBeforeUrl: [''],
    pricingType: ['Warranty', Validators.required],
    price: [0],
    notes: ['']
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.store.loadLookups();

    const u = this.user();
    if (u?.role === 'Branch' && u.branchId) {
      this.form.patchValue({ branchId: u.branchId });
      this.form.controls.branchId.disable();
    }
  }

  selectCustomer(phone: string): void {
    if (!phone) return;
    const customer = this.customers().find((item) => item.phone === phone);
    if (!customer) return;
    this.form.patchValue({
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email ?? ''
    });
  }

  get isPriceVisible(): boolean {
    const v = this.form.controls.pricingType.value;
    return v === 'Branch' || v === 'Workshop';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (!value.branchId) return;

    const pricingType = (value.pricingType ?? 'Warranty') as PricingType;
    const price = pricingType === 'Branch' ? Number(value.price) || 0 : undefined;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.store
      .createOrder({
        customerName: value.customerName ?? '',
        customerPhone: value.customerPhone ?? '',
        customerEmail: value.customerEmail || undefined,
        branchId: value.branchId,
        receivingEmployeeName: value.receivingEmployeeName ?? '',
        weightBefore: Number(value.weightBefore) || 0,
        imageBeforeUrl: value.imageBeforeUrl || undefined,
        pricingType,
        price,
        notes: value.notes || undefined
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigateByUrl('/workshop-assignment');
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.error?.error ?? 'Failed to create order');
        }
      });
  }
}
