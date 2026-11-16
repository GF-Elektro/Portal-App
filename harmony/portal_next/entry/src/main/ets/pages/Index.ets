import { common } from '@kit.AbilityKit';
import { webview } from '@kit.ArkWeb';
import { PortalHosts } from '../portal/PortalHosts';
import { PortalSession } from '../portal/PortalSession';

@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();
  private portal: PortalSession = new PortalSession();

  aboutToAppear(): void {
    const host = this.getUIContext().getHostContext();
    if (host) {
      this.portal.attach(host as common.UIAbilityContext, this.controller);
    }
  }

  aboutToDisappear(): void {
    this.portal.detach();
  }

  onBackPress(): boolean {
    return this.portal.goBack();
  }

  build() {
    Column() {
      Web({ src: PortalHosts.portalUrl, controller: this.controller })
        .width('100%')
        .height('100%')
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .imageAccess(true)
        .onlineImageAccess(true)
        .databaseAccess(true)
        .geolocationAccess(true)
        .mediaPlayGestureAccess(false)
        .userAgent(PortalHosts.userAgent)
        .javaScriptProxy({
          object: this.portal.proxy,
          name: 'portalNative',
          methodList: ['postMessage'],
          controller: this.controller
        })
        .onPageEnd(() => {
          this.portal.injectOnce();
        })
        .onLoadIntercept((event) => {
          if (!event) {
            return false;
          }
          return this.portal.interceptLoad(event);
        })
        .onWindowNew((event) => {
          if (event) {
            this.portal.handleNewWindow(event);
          }
        })
        .onPermissionRequest((event) => {
          if (event) {
            this.portal.handlePermission(event);
          }
        })
        .onShowFileSelector((event) => {
          return this.portal.handleFileSelector(event);
        })
    }
    .width('100%')
    .height('100%')
  }
}
