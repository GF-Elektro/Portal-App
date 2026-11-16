import { AbilityConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';
import { PortalEvents } from '../portal/PortalEvents';

const DOMAIN: number = 0xE001;
const TAG: string = 'EntryAbility';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, _launchParam: AbilityConstant.LaunchParam): void {
    PortalEvents.publishClickFromWant(want);
  }

  onNewWant(want: Want, _launchParam: AbilityConstant.LaunchParam): void {
    PortalEvents.publishClickFromWant(want);
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        hilog.error(DOMAIN, TAG, 'loadContent failed %{public}s', JSON.stringify(err));
      }
    });
  }
}
