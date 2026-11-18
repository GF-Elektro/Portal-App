import { abilityAccessCtrl, common, Permissions, Want, wantAgent } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { picker } from '@kit.CoreFileKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { notificationManager } from '@kit.NotificationKit';
import { util } from '@kit.ArkTS';
import { webview } from '@kit.ArkWeb';
import { PortalEvents } from './PortalEvents';
import { PortalHosts } from './PortalHosts';
import { PortalJsProxy, PortalMessageSink } from './PortalJsProxy';
import { PORTAL_API_PRELUDE } from './PortalPrelude';

const DOMAIN: number = 0xE001;
const TAG: string = 'PortalSession';
const BUNDLE_NAME: string = 'com.gfelektro.portal';
const ABILITY_NAME: string = 'EntryAbility';

class IncomingOptions {
  body?: string;
  message?: string;
  id?: string;
  tag?: string;
  data?: Object;
}

class IncomingMessage {
  action?: string;
  title?: string;
  requestId?: string;
  options?: IncomingOptions;
}

class ClickPayload {
  id: string = '';
  tag: string = '';
  data: Object | null = null;
}

class LoadBox {
  data?: RequestBox;
  getRequestUrl?: () => string;
  isMainFrame?: () => boolean;
}

class RequestBox {
  getRequestUrl: () => string = (): string => '';
  isMainFrame: () => boolean = (): boolean => true;
}

class HandlerBox {
  setWebController: (controller: webview.WebviewController) => void = (_controller: webview.WebviewController): void => {
  };
}

class NewWindowBox {
  targetUrl?: string;
  handler?: HandlerBox;
}

class PermissionBox {
  request?: PermissionRequestBox;
}

class PermissionRequestBox {
  getAccessibleResource: () => string[] = (): string[] => [];
  grant: (resources: string[]) => void = (_resources: string[]): void => {
  };
}

class FileSelectorBox {
  result?: FileResultBox;
}

class FileResultBox {
  handleFileList: (fileList: string[]) => void = (_fileList: string[]): void => {
  };
}

export class PortalSession implements PortalMessageSink {
  readonly proxy: PortalJsProxy;
  private context: common.UIAbilityContext | null = null;
  private controller: webview.WebviewController | null = null;
  private scriptsInjected: boolean = false;

  constructor() {
    this.proxy = new PortalJsProxy(this);
  }

  attach(context: common.UIAbilityContext, controller: webview.WebviewController): void {
    this.context = context;
    this.controller = controller;
    PortalEvents.listener = this;
    if (PortalEvents.pendingPayload.length > 0) {
      const pending = PortalEvents.pendingPayload;
      PortalEvents.pendingPayload = '';
      this.onNotificationClick(pending);
    }
  }

  detach(): void {
    if (PortalEvents.listener === this) {
      PortalEvents.listener = null;
    }
  }

  onPortalMessage(message: string): void {
    let incoming: IncomingMessage;
    try {
      incoming = JSON.parse(message) as IncomingMessage;
    } catch (err) {
      hilog.error(DOMAIN, TAG, 'bad portal message');
      return;
    }
    const action = incoming.action ?? '';
    if (action === 'show') {
      const options = incoming.options ?? new IncomingOptions();
      this.showNotification(incoming.title ?? 'G&F Portal EU', options, incoming.requestId ?? '');
      return;
    }
    if (action === 'requestPermission') {
      this.resolvePermission(incoming.requestId ?? '', true);
      return;
    }
    if (action === 'checkPermission') {
      this.resolvePermission(incoming.requestId ?? '', false);
    }
  }

  onNotificationClick(payload: string): void {
    if (!this.controller) {
      PortalEvents.pendingPayload = payload;
      return;
    }
    const literal = JSON.stringify(payload);
    const script =
      `window.dispatchEvent(new CustomEvent('portal-notification-clicked', { detail: JSON.parse(${literal}) }));`;
    this.controller.runJavaScript(script);
  }

  injectOnce(): void {
    this.injectOnceAsync();
  }

  interceptLoad(event: Object): boolean {
    const box = event as LoadBox;
    const request: RequestBox = box.data ?? (event as RequestBox);
    let requestUrl = '';
    let mainFrame = true;
    try {
      requestUrl = request.getRequestUrl();
      mainFrame = request.isMainFrame();
    } catch (err) {
      return false;
    }
    if (!mainFrame) {
      return false;
    }
    if (PortalHosts.shouldKeepInApp(requestUrl)) {
      return false;
    }
    if (PortalHosts.isWebScheme(requestUrl)) {
      this.openExternal(requestUrl);
    }
    return true;
  }

  handleNewWindow(event: Object): void {
    const box = event as NewWindowBox;
    const target = box.targetUrl ?? '';
    if (PortalHosts.shouldKeepInApp(target) && this.controller) {
      this.controller.loadUrl(target);
      if (box.handler) {
        box.handler.setWebController(this.controller);
      }
      return;
    }
    this.openExternal(target);
  }

  handlePermission(event: Object): void {
    const box = event as PermissionBox;
    if (!box.request) {
      return;
    }
    const resources = box.request.getAccessibleResource();
    this.grantSystemPermissions(resources).then(() => {
      if (box.request) {
        box.request.grant(resources);
      }
    }).catch((err: Object) => {
      hilog.error(DOMAIN, TAG, 'permission request failed %{public}s', JSON.stringify(err));
    });
  }

  handleFileSelector(event: Object | undefined): boolean {
    if (!event) {
      return false;
    }
    const box = event as FileSelectorBox;
    if (!box.result) {
      return false;
    }
    this.pickImages(box.result);
    return true;
  }

  goBack(): boolean {
    if (this.controller && this.controller.accessBackward()) {
      this.controller.backward();
      return true;
    }
    return false;
  }

  private async injectOnceAsync(): Promise<void> {
    if (this.scriptsInjected || !this.controller || !this.context) {
      return;
    }
    this.scriptsInjected = true;
    try {
      await this.controller.runJavaScript(PORTAL_API_PRELUDE);
      const bytes = await this.context.resourceManager.getRawFileContent('portal-native-bridge.js');
      const decoder = util.TextDecoder.create('utf-8');
      const bridge = decoder.decodeToString(bytes);
      await this.controller.runJavaScript(bridge);
    } catch (err) {
      this.scriptsInjected = false;
      hilog.error(DOMAIN, TAG, 'inject failed %{public}s', JSON.stringify(err));
    }
  }

  private openExternal(raw: string): void {
    if (!this.context || !PortalHosts.isWebScheme(raw)) {
      return;
    }
    const want: Want = {
      action: 'ohos.want.action.viewData',
      entities: ['entity.system.browsable'],
      uri: raw
    };
    this.context.startAbility(want).catch((err: BusinessError) => {
      hilog.error(DOMAIN, TAG, 'openExternal %{public}s', err.message);
    });
  }

  private async resolvePermission(requestId: string, prompt: boolean): Promise<void> {
    const safeId = PortalSession.safeId(requestId);
    if (safeId.length === 0 || !this.controller) {
      return;
    }
    let status = 'denied';
    try {
      if (prompt && this.context) {
        await notificationManager.requestEnableNotification(this.context);
      }
      const enabled = await notificationManager.isNotificationEnabled();
      status = enabled ? 'granted' : 'denied';
    } catch (err) {
      status = 'denied';
    }
    await this.finishResolver(safeId, status);
  }

  private async finishResolver(requestId: string, value: string): Promise<void> {
    if (requestId.length === 0 || !this.controller) {
      return;
    }
    const script =
      `window.__portalNativeResolvers && window.__portalNativeResolvers['${requestId}'] && window.__portalNativeResolvers['${requestId}']('${value}'); delete window.__portalNativeResolvers['${requestId}'];`;
    await this.controller.runJavaScript(script);
  }

  private async showNotification(title: string, options: IncomingOptions, requestId: string): Promise<void> {
    const body = options.body ?? options.message ?? '';
    const id = (options.id && options.id.length > 0) ? options.id : `${Date.now()}`;
    const tag = options.tag ?? '';
    const click = new ClickPayload();
    click.id = id;
    click.tag = tag;
    click.data = options.data ?? null;
    const payload = JSON.stringify(click);
    const notificationId = PortalSession.hashCode(id);
    try {
      if (this.context) {
        let enabled = await notificationManager.isNotificationEnabled();
        if (!enabled) {
          await notificationManager.requestEnableNotification(this.context);
          enabled = await notificationManager.isNotificationEnabled();
        }
        if (!enabled) {
          await this.finishResolver(PortalSession.safeId(requestId), 'rejected');
          return;
        }
      }
      const slot: notificationManager.NotificationSlot = {
        notificationType: notificationManager.SlotType.SOCIAL_COMMUNICATION,
        notificationLevel: notificationManager.SlotLevel.LEVEL_HIGH
      };
      await notificationManager.addSlot(slot);
      const request: notificationManager.NotificationRequest = {
        id: notificationId,
        content: {
          notificationContentType: notificationManager.ContentType.NOTIFICATION_CONTENT_BASIC_TEXT,
          normal: {
            title: title,
            text: body
          }
        }
      };
      const info: wantAgent.WantAgentInfo = {
        wants: [
          {
            bundleName: BUNDLE_NAME,
            abilityName: ABILITY_NAME,
            parameters: {
              portalNotificationPayload: payload
            }
          }
        ],
        actionType: wantAgent.OperationType.START_ABILITY,
        requestCode: notificationId,
        actionFlags: [wantAgent.WantAgentFlags.UPDATE_PRESENT_FLAG]
      };
      request.wantAgent = await wantAgent.getWantAgent(info);
      await notificationManager.publish(request);
      await this.finishResolver(PortalSession.safeId(requestId), 'accepted');
    } catch (err) {
      hilog.error(DOMAIN, TAG, 'notify failed %{public}s', JSON.stringify(err));
      await this.finishResolver(PortalSession.safeId(requestId), 'rejected');
    }
  }

  private async grantSystemPermissions(resources: string[]): Promise<void> {
    if (!this.context) {
      return;
    }
    const needed: Permissions[] = [];
    const joined = resources.join(' ').toUpperCase();
    if (joined.indexOf('VIDEO') >= 0 || joined.indexOf('CAMERA') >= 0) {
      needed.push('ohos.permission.CAMERA');
    }
    if (joined.indexOf('AUDIO') >= 0 || joined.indexOf('MICROPHONE') >= 0) {
      needed.push('ohos.permission.MICROPHONE');
    }
    if (joined.indexOf('GEO') >= 0 || joined.indexOf('LOCATION') >= 0) {
      needed.push('ohos.permission.APPROXIMATELY_LOCATION');
      needed.push('ohos.permission.LOCATION');
    }
    if (needed.length === 0) {
      return;
    }
    const atManager = abilityAccessCtrl.createAtManager();
    await atManager.requestPermissionsFromUser(this.context, needed);
  }

  private async pickImages(result: FileResultBox): Promise<void> {
    const options = new picker.PhotoSelectOptions();
    options.MIMEType = picker.PhotoViewMIMETypes.IMAGE_TYPE;
    options.maxSelectNumber = 1;
    const view = new picker.PhotoViewPicker();
    try {
      const selected = await view.select(options);
      result.handleFileList(selected.photoUris);
    } catch (err) {
      result.handleFileList([]);
    }
  }

  private static safeId(raw: string): string {
    let out = '';
    for (let i = 0; i < raw.length; i++) {
      const code = raw.charCodeAt(i);
      const ok = (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      if (ok) {
        out += raw.charAt(i);
      }
    }
    return out;
  }

  private static hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    if (hash < 0) {
      hash = -hash;
    }
    if (hash === 0) {
      hash = 1;
    }
    return hash;
  }
}
