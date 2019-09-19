import * as c3d from "cc"
import { GameMath } from "../basic/BaseFunctions";

const { ccclass, property } = c3d._decorator;

@ccclass("CarMovement")
export default class CarMovement extends c3d.Component {
    @property({type: c3d.Node})
    carNode: c3d.Node = null;
    @property({type: c3d.Node})
    cameraNode: c3d.Node = null;

    start () {
        console.log("CarMovement");
        console.log(R);
    }

    update (deltaTime: number) {
        if (this.carNode.position.z > 350) {
            GameMath.updatePosition(this.carNode, "z", R.always(-350));
        }
        GameMath.updatePosition(this.carNode, "z", R.add(0.3));
        GameMath.updatePosition(this.cameraNode, "z", R.always(this.carNode.position.z - 35));
    }
}