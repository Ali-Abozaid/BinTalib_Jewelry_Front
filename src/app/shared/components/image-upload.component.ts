import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FilesApi } from '../../core/api/files.api';
import { UiLanguageService } from '../../core/services/ui-language.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  template: `
    <div class="img-up">
      @if (currentValue() && !uploading()) {
        <div class="preview-card">
          <img [src]="absoluteUrl(currentValue())" alt="preview" />
          <div class="preview-actions">
            <label class="action replace" [class.disabled]="uploading()">
              <i class="fa-solid fa-arrow-rotate-right"></i>
              <span>{{ lang.isArabic() ? 'استبدال' : 'Replace' }}</span>
              <input
                #replaceInput
                type="file"
                accept="image/*"
                [disabled]="uploading()"
                (change)="onChange($event, replaceInput)"
                hidden />
            </label>
            <button type="button" class="action remove" (click)="clearValue()">
              <i class="fa-solid fa-trash"></i>
              <span>{{ lang.isArabic() ? 'إزالة' : 'Remove' }}</span>
            </button>
          </div>
        </div>
      } @else {
        <label
          class="dropzone"
          [class.uploading]="uploading()"
          [class.dragging]="dragging()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event, fileInput)">
          <input
            #fileInput
            type="file"
            accept="image/*"
            [disabled]="uploading()"
            (change)="onChange($event, fileInput)"
            hidden />

          @if (uploading()) {
            <div class="icon spin">
              <i class="fa-solid fa-spinner"></i>
            </div>
            <span class="primary">{{ lang.isArabic() ? 'جارٍ الرفع...' : 'Uploading...' }}</span>
          } @else {
            <div class="icon">
              <i class="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <span class="primary">
              {{ lang.isArabic() ? 'اضغط أو اسحب الصورة هنا' : 'Click or drag an image here' }}
            </span>
            <span class="hint">{{ lang.isArabic() ? 'PNG · JPG · JPEG' : 'PNG · JPG · JPEG' }}</span>
          }
        </label>
      }

      @if (errorMessage(); as msg) {
        <small class="status err">
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ msg }}
        </small>
      }
    </div>
  `,
  styles: [
    `
      :host { display: block; width: 100%; }

      .img-up {
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        width: 100%;
      }

      /* ---------- Dropzone ---------- */
      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 150px;
        padding: 1.4rem 1rem;
        border: 2px dashed var(--jewelry-border-strong);
        border-radius: 0.85rem;
        background: linear-gradient(180deg, rgba(243, 234, 212, 0.65), var(--jewelry-surface-muted));
        color: var(--jewelry-ink-secondary);
        cursor: pointer;
        text-align: center;
        transition: border-color 0.2s, background 0.2s, transform 0.05s, box-shadow 0.2s;
        user-select: none;
      }
      .dropzone:hover {
        border-color: rgba(166, 124, 0, 0.45);
        background: linear-gradient(180deg, rgba(232, 197, 71, 0.22), var(--jewelry-gold-pale));
      }
      .dropzone:active { transform: scale(0.998); }
      .dropzone.dragging {
        border-color: var(--jewelry-gold-mid);
        background: linear-gradient(180deg, rgba(232, 197, 71, 0.35), var(--jewelry-gold-pale));
        box-shadow: 0 0 0 4px rgba(232, 197, 71, 0.2) inset;
      }
      .dropzone.uploading { cursor: progress; }

      .dropzone .icon {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgba(232, 197, 71, 0.28);
        color: var(--jewelry-gold-deep);
        font-size: 1.2rem;
      }
      .dropzone .icon.spin i { animation: imgUploadSpin 1s linear infinite; }
      @keyframes imgUploadSpin { to { transform: rotate(360deg); } }

      .dropzone .primary {
        color: var(--jewelry-ink);
        font-weight: 600;
        font-size: 0.95rem;
      }
      .dropzone .hint {
        color: var(--jewelry-ink-muted);
        font-size: 0.78rem;
        letter-spacing: 0.02em;
      }

      /* ---------- Preview ---------- */
      .preview-card {
        position: relative;
        border: 1px solid var(--jewelry-border-strong);
        border-radius: 0.85rem;
        overflow: hidden;
        background: var(--jewelry-surface);
        max-width: 320px;
        box-shadow: var(--jewelry-shadow);
      }
      .preview-card img {
        display: block;
        width: 100%;
        height: 200px;
        object-fit: cover;
        background: var(--jewelry-surface-muted);
      }

      .preview-actions {
        display: flex;
        gap: 0.4rem;
        padding: 0.55rem;
        border-top: 1px solid var(--jewelry-border);
        background: var(--jewelry-surface-muted);
      }

      .action {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        height: 34px;
        padding: 0 0.7rem;
        border-radius: 0.55rem;
        border: 1px solid var(--jewelry-border-strong);
        background: var(--jewelry-surface);
        color: var(--jewelry-ink-secondary);
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s, border-color 0.18s, color 0.18s;
        margin: 0;
      }
      .action:hover {
        background: var(--jewelry-gold-pale);
        border-color: rgba(166, 124, 0, 0.35);
      }
      .action.replace:hover {
        color: var(--jewelry-gold-deep);
        border-color: rgba(166, 124, 0, 0.48);
      }
      .action.remove {
        color: #991b1b;
      }
      .action.remove:hover {
        color: #fff;
        background: rgba(185, 28, 28, 0.85);
        border-color: #991b1b;
      }
      .action.disabled { opacity: 0.6; pointer-events: none; }

      /* ---------- Status / errors ---------- */
      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
      }
      .status.err {
        color: #991b1b;
      }
    `
  ]
})
export class ImageUploadComponent {
  private readonly filesApi = inject(FilesApi);
  protected readonly lang = inject(UiLanguageService);

  @Input() label: string = '';
  @Input() subfolder: string = 'orders';

  @Input()
  set value(next: string | null | undefined) {
    this.currentValue.set(next ?? null);
  }
  get value(): string | null {
    return this.currentValue();
  }

  @Output() valueChange = new EventEmitter<string | null>();

  protected readonly currentValue = signal<string | null>(null);
  protected readonly uploading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly dragging = signal(false);

  absoluteUrl(value: string | null | undefined): string | null {
    return this.filesApi.toAbsoluteUrl(value ?? null);
  }

  onChange(event: Event, fileInput: HTMLInputElement): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadFile(file, fileInput);
  }

  onDragOver(event: DragEvent): void {
    if (this.uploading()) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  onDrop(event: DragEvent, fileInput: HTMLInputElement): void {
    event.preventDefault();
    this.dragging.set(false);
    if (this.uploading()) return;
    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      this.errorMessage.set(this.lang.isArabic() ? 'الرجاء اختيار ملف صورة' : 'Please drop an image file');
      return;
    }
    this.uploadFile(file, fileInput);
  }

  clearValue(): void {
    this.currentValue.set(null);
    this.errorMessage.set(null);
    this.valueChange.emit(null);
  }

  private uploadFile(file: File, fileInput: HTMLInputElement): void {
    this.uploading.set(true);
    this.errorMessage.set(null);

    this.filesApi.upload(file, this.subfolder).subscribe({
      next: (url) => {
        this.uploading.set(false);
        this.currentValue.set(url);
        this.valueChange.emit(url);
        fileInput.value = '';
      },
      error: (err: { error?: { error?: string } }) => {
        this.uploading.set(false);
        this.errorMessage.set(
          err?.error?.error ?? (this.lang.isArabic() ? 'فشل رفع الصورة' : 'Image upload failed')
        );
        fileInput.value = '';
      }
    });
  }
}
