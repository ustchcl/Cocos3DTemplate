import { _decorator, Component, Node, Vec3, ButtonComponent, LabelComponent, MaskComponent } from "cc";
const { ccclass, property } = _decorator;


@ccclass("Stars")
export class Stars extends Component {
    @property({type: MaskComponent})
    starMask1: MaskComponent = null;
    @property({type: MaskComponent})
    starMask2: MaskComponent = null;
    @property({type: MaskComponent})
    starMask3: MaskComponent = null;

    readonly WIDTH = 51; 
    readonly OneThird = 0.3333;

    /**
     * @param percent [0, 1]
     */
    setStar(percent: number) {
        this.starMask1.node.width = Math.min(this.OneThird, percent) / this.OneThird * this.WIDTH;
        this.starMask2.node.width = Math.min(this.OneThird, Math.max(0, percent - this.OneThird)) / this.OneThird * this.WIDTH;
        this.starMask3.node.width = Math.max(0, percent - this.OneThird * 2) / this.OneThird * this.WIDTH
    }
}
