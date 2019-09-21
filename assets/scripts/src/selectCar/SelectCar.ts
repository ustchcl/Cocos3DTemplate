import { _decorator, Component, Node, Vec3 } from "cc";
const { ccclass, property } = _decorator;

@ccclass("SelectCar")
export class SelectCar extends Component {
    @property({type: Node})
    topModelNode: Node = null;

    start () {
        // Your initialization goes here.
    }

    update () {
        let re = new Vec3();
        this.topModelNode.getRotation().getEulerAngles(re);
        this.topModelNode.setRotationFromEuler(re.x, re.y + 0.5, re.z);
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
