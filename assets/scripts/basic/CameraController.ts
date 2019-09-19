import * as c3d from "cc";
import { GameMath } from "./BaseFunctions";
const { ccclass, property, menu } = c3d._decorator;


@ccclass("CameraController")
@menu("base/CameraController")
export class CameraController extends c3d.Component {
    @property({type: c3d.CameraComponent})
    camera: c3d.CameraComponent = null;
    @property({type: c3d.Node})
    stageNode: c3d.Node = null;


    readonly r = 554.256;

    state = {
        startPos: new c3d.Vec2(),
        startRotation: new c3d.Quat()

    }

    start () {
        this.initEvents();
        console.log(this.camera.node.rotation);
    }

    initEvents() {
        this.stageNode.on(c3d.SystemEventType.TOUCH_START, (e: c3d.EventTouch) => {
            this.state.startPos = e.getLocation();
            this.state.startRotation = this.camera.node.rotation;
            this.addEvents();
        }, this)
    }

    addEvents() {
        this.stageNode.on(c3d.SystemEventType.TOUCH_MOVE, this.refreshCamera, this);
        this.stageNode.on(c3d.SystemEventType.TOUCH_END, this.removeEvents, this);
        this.stageNode.on(c3d.SystemEventType.TOUCH_CANCEL, this.removeEvents, this);
    }

    removeEvents() {
        this.stageNode.off(c3d.SystemEventType.TOUCH_MOVE);
        this.stageNode.off(c3d.SystemEventType.TOUCH_END);
        this.stageNode.off(c3d.SystemEventType.TOUCH_CANCEL)
    }

    refreshCamera(e: c3d.EventTouch) { 
        let curPos = e.getLocation() 
        let vector = GameMath.subtract(curPos, this.state.startPos);

        GameMath.updateRotation(this.camera.node as c3d.Node, "x", _ => _ + this.getArc(vector.y));
        GameMath.updateRotation(this.camera.node as c3d.Node, "y", _ => _ - this.getArc(vector.x));
        this.state.startPos = curPos;
    }

    getArc(delta: number) {
        return (delta / this.r) / Math.PI;
    }
}