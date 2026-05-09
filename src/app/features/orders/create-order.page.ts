import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
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

  /** Phone of the row selected in the customer combo (`''` when manual entry or cleared). */
  protected readonly comboSelectedPhone = signal<string>('');

  private readonly customerDialogEl = viewChild<ElementRef<HTMLDialogElement>>('customerDialog');

  protected readonly modalSaving = signal(false);
  protected readonly modalError = signal<string | null>(null);

  protected readonly newCustomerModalForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['']
  });

  protected readonly comboFilter = signal<string>('');

  /** Select options filtered by typed filter (combo-style). */
  protected readonly filteredCustomers = computed(() => {
    const q = this.comboFilter().trim().toLowerCase();
    const list = this.customers();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  });

  ngOnInit(): void {
    this.store.loadLookups();

    const u = this.user();
    if (u?.role === 'Branch' && u.branchId) {
      this.form.patchValue({ branchId: u.branchId });
      this.form.controls.branchId.disable();
    }
  }

  protected onComboFilterInput(value: string): void {
    this.comboFilter.set(value);
    this.comboSelectedPhone.set('');
  }

  protected onManualCustomerFieldsInput(): void {
    const sel = this.comboSelectedPhone();
    if (!sel) return;
    const phone = (this.form.controls.customerPhone.value ?? '').trim();
    if (phone !== sel) {
      this.comboSelectedPhone.set('');
    }
  }

  protected onComboSelectChange(phone: string): void {
    this.comboSelectedPhone.set(phone);
    this.comboFilter.set('');
    if (phone) {
      this.applyCustomerFromList(phone);
    } else {
      this.form.patchValue({ customerName: '', customerPhone: '', customerEmail: '' });
    }
  }

  protected openNewCustomerModal(): void {
    this.modalError.set(null);
    this.newCustomerModalForm.reset({
      name: '',
      phone: '',
      email: ''
    });
    queueMicrotask(() => this.customerDialogEl()?.nativeElement.showModal());
  }

  protected closeNewCustomerModal(): void {
    this.customerDialogEl()?.nativeElement.close();
  }

  protected saveNewCustomerFromModal(): void {
    if (this.newCustomerModalForm.invalid) {
      this.newCustomerModalForm.markAllAsTouched();
      return;
    }
    const raw = this.newCustomerModalForm.getRawValue();
    const name = (raw.name ?? '').trim();
    const phone = (raw.phone ?? '').trim();
    const email = (raw.email ?? '').trim();
    if (!name || !phone) return;

    this.modalSaving.set(true);
    this.modalError.set(null);
    this.store
      .saveCustomerToDirectory({ name, phone, email: email || undefined })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.modalSaving.set(false);
          this.closeNewCustomerModal();
          this.comboSelectedPhone.set(phone);
          this.comboFilter.set('');
          this.applyCustomerFromList(phone);
          this.store.refreshCustomers();
        },
        error: (err) => {
          this.modalSaving.set(false);
          this.modalError.set(err?.error?.error ?? err?.error?.message ?? 'Failed to save customer');
        }
      });
  }

  private applyCustomerFromList(phone: string): void {
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
          this.store.refreshCustomers();
          this.router.navigateByUrl('/workshop-assignment');
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.error?.error ?? 'Failed to create order');
        }
      });
  }
}
