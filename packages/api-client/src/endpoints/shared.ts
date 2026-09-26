import type { HttpClient } from '../core/http';
import type { Uuid } from '../types/common';
import type { DocumentOwnerType, DocumentRecord, UploadDocumentInput } from '../types/fleet';
import type { AppNotification, OpenTicketInput, Ticket, TicketSummary } from '../types/operations';

const API = '/api/v1';

export function createDocumentsApi(http: HttpClient) {
  return {
    list: (ownerType: DocumentOwnerType, ownerId: Uuid) =>
      http.request<DocumentRecord[]>({ path: `${API}/documents`, query: { ownerType, ownerId } }),

    upload(input: UploadDocumentInput): Promise<DocumentRecord> {
      const form = new FormData();
      form.append('ownerType', input.ownerType);
      form.append('ownerId', input.ownerId);
      form.append('documentType', input.documentType);
      if (input.expiryDate) form.append('expiryDate', input.expiryDate);

      if ('uri' in input.file) {
        // React Native reads the file from its uri; the cast satisfies the DOM FormData typing.
        form.append('file', input.file as unknown as Blob);
      } else {
        form.append('file', input.file, input.filename ?? 'upload');
      }

      return http.request<DocumentRecord>({
        method: 'POST',
        path: `${API}/documents`,
        formData: form,
      });
    },

    /** Authenticated download of a private document. */
    /** Removes a vehicle photo. Other documents cannot be removed. */
    remove: (documentId: Uuid) =>
      http.request<void>({ method: 'DELETE', path: `${API}/documents/${documentId}` }),
    content: (documentId: Uuid) =>
      http.requestBlob({ path: `${API}/documents/${documentId}/content` }),
  };
}

export function createNotificationsApi(http: HttpClient) {
  return {
    list: (options: { unreadOnly?: boolean; limit?: number } = {}) =>
      http.request<AppNotification[]>({
        path: `${API}/notifications`,
        query: { unreadOnly: options.unreadOnly, limit: options.limit },
      }),
    unreadCount: () =>
      http.request<{ unread: number }>({ path: `${API}/notifications/unread-count` }),
    markRead: (id: Uuid) =>
      http.request<void>({ method: 'POST', path: `${API}/notifications/${id}/read` }),
    markAllRead: () =>
      http.request<void>({ method: 'POST', path: `${API}/notifications/read-all` }),
  };
}

export function createSupportApi(http: HttpClient) {
  return {
    open: (input: OpenTicketInput) =>
      http.request<Ticket>({ method: 'POST', path: `${API}/support/tickets`, body: input }),
    mine: (limit = 50) =>
      http.request<TicketSummary[]>({ path: `${API}/support/tickets`, query: { limit } }),
    get: (id: Uuid) => http.request<Ticket>({ path: `${API}/support/tickets/${id}` }),
    reply: (id: Uuid, body: string) =>
      http.request<Ticket>({
        method: 'POST',
        path: `${API}/support/tickets/${id}/messages`,
        body: { body },
      }),
  };
}
