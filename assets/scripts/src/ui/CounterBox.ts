import { _decorator, Component, Node, Vec3, ButtonComponent, LabelComponent, MaskComponent, SpriteFrame, SpriteComponent } from "cc";
const { ccclass, property } = _decorator;


@ccclass("CounterBox")
export class Stars extends Component {
    @property({type: SpriteFrame})
    sf1: SpriteFrame = null;
    @property({type: SpriteFrame})
    sf2: SpriteFrame = null;
    @property({type: SpriteFrame})
    sf3: SpriteFrame = null;
    @property({type: SpriteComponent})
    sp: SpriteComponent = null;


    // playAnimation(): Promise<void> {
        
    // }
}
