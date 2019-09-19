import * as CC from "cc";
import Boom from "./Boom";

const { property, ccclass } = CC._decorator;

@ccclass("MainScene")
export default class MainScene extends CC.Component {
    @property({type: CC.Prefab})
    cubePrefab: CC.Prefab = null;

    @property({type: [CC.Material]})
    materials: CC.Material[] = [];

    @property({type: CC.ButtonComponent})
    startButton: CC.ButtonComponent = null;
    @property({type: CC.ButtonComponent})
    boomButton: CC.ButtonComponent = null;
    @property({type: CC.ButtonComponent})
    resetButton: CC.ButtonComponent = null;
    @property({type: Boom})
    boom: Boom = null;

    @property({type: CC.ModelComponent})
    model: CC.ModelComponent = null;

    state = {
        index: 0,
    }

    start () {
        this.startButton.node.on(CC.SystemEventType.TOUCH_END, () => {
            this.state.index += 1;
            if (this.state.index >= 3) {
                this.state.index = 0;
            }
            this.model.materials[0].copy(this.materials[this.state.index]);
            console.log("StartButton", this.state.index)
        }, this);

        this.boomButton.node.on(CC.SystemEventType.TOUCH_END, () => {
            this.boom.boom();
        }, this);
        this.resetButton.node.on(CC.SystemEventType.TOUCH_END, () => {
            this.boom.reset();
        }, this);
    }   
}