import { _decorator, Component, Node, Vec3, ButtonComponent, SpriteComponent, LabelComponent, Vec2, EventTouch, Prefab, instantiate } from "cc";
import VihecleModel from "../model/VehicleModel";

const { ccclass, property } = _decorator;

@ccclass("TestModel")
export class TestModel extends Component {
    @property(Prefab)
    carPrefab: Prefab = null;
    @property(VihecleModel)
    mode: VihecleModel = null;

    start () {
        this.mode.initColor(3);
        let node = instantiate(this.carPrefab);
        node.active = true;
        this.node.addChild(node);
    }
}