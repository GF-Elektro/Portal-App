import { Want } from '@kit.AbilityKit';

export interface PortalClickListener {
  onNotificationClick(payload: string): void;
}

class WantPayload {
  portalNotificationPayload?: string;
}

/** Bridges a notification tap into the page, including cold start. */
export class PortalEvents {
  static pendingPayload: string = '';
  static listener: PortalClickListener | null = null;

  static publishClick(payload: string): void {
    if (payload.length === 0) {
      return;
    }
    if (PortalEvents.listener !== null) {
      PortalEvents.listener.onNotificationClick(payload);
      PortalEvents.pendingPayload = '';
      return;
    }
    PortalEvents.pendingPayload = payload;
  }

  static publishClickFromWant(want: Want): void {
    const params = want.parameters as WantPayload;
    const payload = params.portalNotificationPayload ?? '';
    PortalEvents.publishClick(payload);
  }
}
