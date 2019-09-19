/**
 * CopyRight  : (C) Chenglin Huang 2019
 * MainTainer : Chenglin Huang <ustchcl@gmail.com>
 */

import * as CC from "cc"

const { ccclass, property } = CC._decorator;

@ccclass
export class LoadingScene extends CC.Component {
    @property(CC.LabelComponent)
    processLabel: CC.LabelComponent = null;
    @property(CC.ProgressBarComponent)
    loadingBar: CC.ProgressBarComponent = null;

    @property(String)
    sceneName: string = "main";

    onLoad() {
        this.processLabel.string = '0.00%';
        this.loadingBar.progress = 0;
    }

    start() {
        CC.director.preloadScene(
            this.sceneName,
            (completedCount, totalCount, item) => {
                let progress = completedCount / totalCount;
                if (progress > this.loadingBar.progress) {
                    this.loadingBar.progress = progress;
                    this.processLabel.string = `${(progress * 100).toFixed(2)}%`;
                }
            },
            (error, asset) => {
                if (error) {
                    console.error(error);
                    return;
                }
                CC.director.loadScene(this.sceneName, () => {
                    console.log(`${this.sceneName}`);
                }, () => {
                    console.log("End");
                });
            }
        );
    }
}
