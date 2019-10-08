import { _decorator, Component,  MaskComponent, CCInteger } from "cc";
const { ccclass, property } = _decorator;


@ccclass("VerticalBar")
export class VerticalBar extends Component {
    @property({type: MaskComponent})
    maskComp: MaskComponent = null;
    @property({type: CCInteger})
    maskHeight: number = 0;

    setPercent(percent: number) {
        this.maskComp.node.height = Math.min(percent, 1) * this.maskHeight;
    }
}
