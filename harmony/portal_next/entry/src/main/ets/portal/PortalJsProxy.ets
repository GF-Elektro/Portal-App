export interface PortalMessageSink {
  onPortalMessage(message: string): void;
}

/** Object exposed to the page as window.portalNative. */
export class PortalJsProxy {
  private sink: PortalMessageSink;

  constructor(sink: PortalMessageSink) {
    this.sink = sink;
  }

  postMessage(message: string): void {
    this.sink.onPortalMessage(message);
  }
}
