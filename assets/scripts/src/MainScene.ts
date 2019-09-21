import * as CC from "cc";
import Boom from "./Boom";
import { Maybe } from "../basic/Maybe";
import Obstacle from "./Obstacle";
import { GameMath } from "../basic/BaseFunctions";

const { property, ccclass } = CC._decorator;



type CarState = "Normal" | "Collision" | "CameraBack" | "BulletTime"

type GameState = "BeforeStart" | "Ready" | "ReadyEnd" | "CounterDown" | "End"

type SpeedMode = "Normal" | "Sprint"

type State = {
    gameState: GameState,
    car: {
        damage: () => number,
        maxSpd: number,
        speedMode: SpeedMode,
        state: CarState,
        speed: CC.Vec3
    },
    cameraSpeed: number,
    cameraBackSpeed: number,
    score: number,
    enemyLife: number,
    remainTime: number,
    currentObstacle: Maybe<Obstacle>,
    bulletTime: {
        count: number,
        start: number,
        current: number,
        real: number,
        success: Maybe<boolean>,
        energy: number
    },
    collisionCount: number,
    touchPreX: number,
}

type Msg 
    = ["TouchStart", CC.Vec2]
    | ["TouchMove", CC.Vec2]
    | ["TouchEnd"]

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
    @property({type: CC.ParticleSystemComponent })
    sps: CC.ParticleSystemComponent = null;
    @property({type: CC.CanvasComponent})
    canvas: CC.CanvasComponent = null;

    @property({type: CC.Node})
    carNode: CC.Node = null;
    @property({type: CC.Node})
    cameraNode: CC.Node = null;


    @property({type: CC.ModelComponent})
    model: CC.ModelComponent = null;

    state: State = {
        car: {
            damage: () => 1,
            maxSpd: 1,
            speedMode: "Normal",
            state: "Normal",
            speed: new CC.Vec3(0, 0, 0.4),
        },
        cameraSpeed: 0.4, 
        cameraBackSpeed: 0,

        gameState: "BeforeStart",

        score: 0,
        enemyLife: 100, 
        remainTime: 30,
        currentObstacle: Maybe.Nothing(),
        bulletTime: {
            count: 0,
            start: 0,
            current: 0,
            real: 0,
            success: Maybe.Nothing(),
            energy: 0
        },
        collisionCount: 0,
        touchPreX: 0,
    }

    start () {
        this.boomButton.node.on(CC.SystemEventType.TOUCH_END, () => {
            this.boom.boom();
            this.sps.play();
        }, this);
        this.resetButton.node.on(CC.SystemEventType.TOUCH_END, () => {
            this.boom.reset();
        }, this);

        this.initEvents();
    }   

    eval(msg: Msg) {
        switch (msg[0]) {
            case "TouchStart": {
                this.canvas.node.on("touch-end", this.canvasTouchEnd, this);
                this.canvas.node.on("touch-cancel", this.canvasTouchEnd, this);
                this.canvas.node.on("touch-move", this.canvasTouchMove, this);
                this.state.touchPreX = msg[1].x;
                break;
            }
            case "TouchMove": {
                let delta = msg[1].x - this.state.touchPreX;
                this.state.touchPreX = msg[1].x;
                GameMath.updatePosition(this.carNode as CC.Node, "x", x => Math.max(Math.min(x + delta / 40, 4), -4))
                break;
            }
            case "TouchEnd": {
                this.canvas.node.off("touch-end", this.canvasTouchEnd, this);
                this.canvas.node.off("touch-cancel", this.canvasTouchEnd, this);
                this.canvas.node.off("touch-move", this.canvasTouchMove, this);
                break;
            }
        }
    }

    initEvents() {
        this.canvas.node.on("touch-start", (e: CC.EventTouch) => {
            this.eval(["TouchStart", e.getLocation()])
        }, this);
    }

    update () {
        // if (this.carNode.position.z <= 100) {
        //     GameMath.updatePosition(this.carNode, "z", _ => 199);
        // } else {
        //     GameMath.updatePosition(this.carNode, "z", _ => _ - 1);
        // }
    }

    // events
    canvasTouchMove(e: CC.EventTouch) {
        if (this.state.car.state === "Collision") {
            return;
        }
        this.eval(["TouchMove", e.getLocation()])
    }

    canvasTouchEnd() {
        this.eval(["TouchEnd"]);
    }
}