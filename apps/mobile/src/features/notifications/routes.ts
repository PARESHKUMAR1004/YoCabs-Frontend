import type { AppNotification } from '@yocabs/api-client';
import type { AppRole } from '@/shared/auth/session.store';

/** Where tapping a notification should take each kind of user. Null = nothing to open. */
export function notificationRoute(role: AppRole, notification: AppNotification): string | null {
  const id = notification.referenceId;
  if (!id) return null;

  switch (notification.referenceType) {
    case 'BOOKING':
      if (role === 'tourist') return `/(tourist)/booking/${id}`;
      if (role === 'partner') return `/(partner)/booking/${id}`;
      if (role === 'driver') return `/(driver)/trip/${id}`;
      return null;
    case 'NEGOTIATION':
      if (role === 'tourist') return `/(tourist)/negotiation/${id}`;
      if (role === 'partner') return `/(partner)/negotiation/${id}`;
      return null;
    case 'SUPPORT_TICKET':
      return `/(${role})/support/${id}`;
    default:
      return null;
  }
}
