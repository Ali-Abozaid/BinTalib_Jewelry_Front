import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FilesApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;
  private readonly origin = environment.apiBaseUrl.replace(/\/api\/?$/, '');

  upload(file: File, subfolder: string = 'orders'): Observable<string> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    const url = `${this.base}/Files/upload?subfolder=${encodeURIComponent(subfolder)}`;
    return this.http.post<{ url: string }>(url, fd).pipe(map((r) => r.url));
  }

  toAbsoluteUrl(value: string | null | undefined): string | null {
    if (!value) return null;
    if (/^https?:\/\//i.test(value) || /^data:/i.test(value)) return value;
    if (value.startsWith('/')) return `${this.origin}${value}`;
    return value;
  }
}
