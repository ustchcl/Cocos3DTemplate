import * as c3d from "cc";
import { Maybe } from "../basic/Maybe";
import Obstacle from "./Obstacle";
const { ccclass, property } = c3d._decorator;

type SpeedMode = "Normal" | "Sprint";
type GameState = "BeforeStart" | "Ready" | "ReadyEnd" | "CounterDown" | "End";
type CarState = "Normal" | "Collision" | "CameraBack" | "BulletTime";

type State = {
	gameState: GameState,
	car: {
		damage: () => number,
		maxSpd: number,
		speedMode: SpeedMode,
		state: CarState,
		speed: c3d.Vec3
	},
	cameraSpeed: number,
	score: number,
	enemyLife: number,
	remainTime: number,
	currentObstacle: Maybe<Obstacle>,

	clickCount: number,
	startTime: number,
	currentTime: number,
	realTime: number,

	collisionCount: number,
	cameraBackSpd: number,

	touchPreX: number;
	bulletTimeSuccess: Maybe<boolean>,
	bulletTimeEnergy: number,
}



@ccclass("GameUIMain")
export default class GameUIMain extends c3d.Component {
    @property({type: c3d.Prefab})
    obstaclePrefab: c3d.Prefab = null;
    
    @property({type: c3d.CameraComponent})
    camera: c3d.CameraComponent = null;
    @property({type: c3d.Node})
    carNode: c3d.Node = null;


    state: State = {
		car: {
			damage: () => Math.floor(Math.random() * 9) + 2,
			maxSpd: 1,
			speedMode: "Normal",
			state: "Normal",
			speed: new c3d.Vec3(0, 0, 0.4),
		},
		cameraSpeed: 0.4,
		gameState: "BeforeStart",
		score: 0,
		enemyLife: 100,
		remainTime: 30,
		currentObstacle: Maybe.Nothing(),
		clickCount: 0,
		startTime: 0,
		currentTime: 0,
		realTime: 0,
		collisionCount: 0,
		cameraBackSpd: 0,
		touchPreX: 0,
		bulletTimeSuccess: Maybe.Nothing(),
		bulletTimeEnergy: 0.4
	}


    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    start () {
        // Your initialization goes here.
    }

    update () {
        // Your update function goes here.
    }
}
