import * as CC from "cc";
import Boom from "./Boom";
import { Maybe } from "../basic/Maybe";
import { GameMath, vibrate, add, always, range, randomOneWithRate, wait, safeDestory } from "../basic/BaseFunctions";
import SolidParticleSystem from "./SolidParticleSystem";
import { Stars } from "./ui/prefabs/Stars";
import ObstacleModel from "./model/ObstacleModel";
import Timer from "../basic/Timer";
import { VerticalBar } from "./ui/VerticalBar";
import RoadScene from "./model/RoadScene";
import { GameData } from "./GameData";
import { LevelComplete } from "./ui/LevelComplete";
import VihecleModel from "./model/VehicleModel";

const { property, ccclass } = CC._decorator;

const DeltaZ = 34;

type CarState = "Normal" | "Collision" | "CameraBack" | "BulletTime"

type GameState = "BeforeStart" | "StartTween" | "Ready" | "ReadyEnd" | "CounterDown" | "End"

type SpeedMode = "Normal" | "Sprint"

type State = {
    gameState: GameState,
    star3Score: number,
    car: {
        maxSpd: number,
        speedMode: SpeedMode,
        state: CarState,
        speed: CC.Vec3
    },
    idleCount: number,

    cameraSpeed: number,
    cameraBackSpeed: number,
    deltaCamareSpeed: number,
    score: number,
    gold: number,
    enemyLife: number,
    remainTime: number,
    currentObstacle: Maybe<ObstacleModel>,
    bulletTime: {
        count: number,
        start: number,
        current: number,
        real: number,
        success: Maybe<boolean>,
        energy: number,
        triggerRemainTime: number,
        isTriggered: boolean
    },
    collisionCount: number,
    touchPreX: number,

    sceneIndex: number,

}

type Msg 
    = ["TouchStart", CC.Vec2]
    | ["TouchMove", CC.Vec2]
    | ["TouchEnd"]
    | ["EnergyBarTouchEnd"]
    // ui
    | ["StartGame"]
    | ["OpenSkillPanel"]
    | ["OpenRollPanel"]
    | ["RefreshGold"]
    | ["NextLevel"]
    | ["BackToMain"]
    | ["OpenSelectCar"]

@ccclass("MainScene")
export default class MainScene extends CC.Component {
    @property({type: Boom})
    boom: Boom = null;
    @property({type: CC.CanvasComponent})
    canvas: CC.CanvasComponent = null;

    @property({type: SolidParticleSystem})
    collision: SolidParticleSystem = null;
    @property({type: CC.CameraComponent})
    camera: CC.CameraComponent = null;


    @property({type: CC.Node})
    carNode: CC.Node = null;

    @property({type: [CC.Prefab]})
    obstaclePrefabs: CC.Prefab[] = [];
    obstacleRates = [0.5, 0.8, 1.0];

    @property({type: [CC.Prefab]})
    carPrefabs: CC.Prefab[] = [];

    @property({type: CC.Node})
    obstaclesNode: CC.Node = null;

    @property({type: Stars})
    stars: Stars = null;

    @property({type: RoadScene})
    roadScene: RoadScene = null;

    carBox: CC.BoxColliderComponent = null;
    carModel: VihecleModel = null;

    @property({type:CC.Node})
    tailFlameNode: CC.Node = null;

    // ui
    @property({type: CC.ProgressBarComponent})
    timeBar: CC.ProgressBarComponent = null;
    @property({type: VerticalBar})
    lifeBar: VerticalBar = null;
    @property({type: VerticalBar})
    energyBar: VerticalBar = null;
    @property(CC.Node)
    energyBgNode: CC.Node = null;
    @property({type: CC.AnimationComponent})
    animation: CC.AnimationComponent = null;
    @property({type: CC.AnimationComponent})
    cameraAnimation: CC.AnimationComponent = null;
    @property({type: CC.Node})
    menuPageNode: CC.Node = null;
    @property({type: CC.Node})
    gamePageNode: CC.Node = null;
    @property(CC.LabelComponent)
    goldAmountLabel: CC.LabelComponent = null;
    @property(CC.Node)
    skillLevelUpNode: CC.Node = null;
    @property(LevelComplete)
    levelComplete: LevelComplete = null;
    @property(CC.Node)
    selectCarNode: CC.Node = null;
    @property(CC.Node)
    selectCarButtonNode: CC.Node = null;
    @property(CC.Node)
    goldIcoNode: CC.Node = null;


    keyMap = {};

    obstacles: ObstacleModel[] = [];
    lastObstacles: ObstacleModel[] = [];



    state: State = {
        star3Score: 70000,
        car: {
            maxSpd: -1,
            speedMode: "Normal",
            state: "Normal",
            speed: new CC.Vec3(0, 0, 0),
        },
        cameraSpeed: -0.6, 
        cameraBackSpeed: 0,
        deltaCamareSpeed: 0.1,
        idleCount: 0,

        gameState: "BeforeStart",

        score: 0,
        gold: 0,
        enemyLife: 100, 
        remainTime: 30,
        currentObstacle: Maybe.Nothing(),
        bulletTime: {
            count: 0,
            start: 0,
            current: 0,
            real: 0,
            success: Maybe.Nothing(),
            energy: 0.3,
            triggerRemainTime: Math.random() * 5 + 5,
            isTriggered: false, 
        },
        collisionCount: 0,
        touchPreX: 0,

        sceneIndex: 0,
    }

    onLoad() {
        this.goldAmountLabel.spacingX=-10;
        CC.PhysicsSystem.instance.enable = true;
        // CC.PhysicsSystem.instance.gravity.y = 0;
    }

    start () {
        console.log("Start")
        this.stars.setStar(0);
        this.initEvents();
        this.init();
        this.cameraAnimation.play();
        this.loadModel();
        
        // this.state.car.speed.z = -GameData.carSpeed();
    }   

    eval(msg: Msg) {
        switch (msg[0]) {
            case "TouchStart": {
                if (this.state.gameState != "CounterDown") {
                    break;
                }
                this.canvas.node.on("touch-end", this.canvasTouchEnd, this);
                this.canvas.node.on("touch-cancel", this.canvasTouchEnd, this);
                this.canvas.node.on("touch-move", this.canvasTouchMove, this);
                this.state.touchPreX = msg[1].x;
                break;
            }
            case "TouchMove": {
                let delta = msg[1].x - this.state.touchPreX;
                this.state.touchPreX = msg[1].x;
                GameMath.updatePosition(this.carNode, "x", x => Math.max(Math.min(x + delta / 40, 4), -4))
                break;
            }
            case "TouchEnd": {
                this.canvas.node.off("touch-end", this.canvasTouchEnd, this);
                this.canvas.node.off("touch-cancel", this.canvasTouchEnd, this);
                this.canvas.node.off("touch-move", this.canvasTouchMove, this);
                break;
            }
            case "EnergyBarTouchEnd": {
                if (this.state.car.state != 'BulletTime') {
                    break;
                }
                this.state.bulletTime.energy += 0.1;
                this.energyBar.setPercent(this.state.bulletTime.energy);
                if (this.state.bulletTime.energy >= 1.05) {
                    this.state.car.speedMode = "Sprint";
                    vibrate("Long");
                    this.state.car.state = "Normal";
                    this.outBulletTime();
                    this.state.bulletTime.success = Maybe.Just(true);
                    let _this = this;
                    this.enterSprint();
                    setTimeout(() => {
                        _this.state.car.speedMode = "Normal";
                        _this.outSprint();
                    }, 10000);
                }
                break;
            }
            case "StartGame": {
                this.startGame();
                break;
            }
            case "RefreshGold": {
                this.goldAmountLabel.string = GameData.getGoldAmount() + '';
                break;
            }
            case "OpenSkillPanel": {
                this.skillLevelUpNode.active = true;
                break;
            }
            case "BackToMain": {
                this.nextLevel();
                break;
            }
            case "NextLevel": {
                this.nextLevel();
                this.startGame();
                break;
            }
            case "OpenSelectCar": {
                this.selectCarNode.active = true;
                break;
            }
        }
    }

    init () {
        this.obstacles = range(20, 1000, 30).map(i => this.genObstacle(i));
        this.lastObstacles = range(0, 30).map(i => this.genObstacle(i));
        this.lastObstacles.forEach(lo => lo.node.active = false);
        this.startTimer();
        this.startRefreshScene();
        this.roadScene.initBuildings();
    }

    genObstacle(index: number): ObstacleModel {
        if (Math.random() > 0.3) {
            let node: CC.Node = CC.instantiate(this.obstaclePrefabs[randomOneWithRate(this.obstacleRates).getOrElse(0)]);
            let ob = node.getComponent(ObstacleModel) as ObstacleModel;
            ob.initLife(GameData.getLevel());
            ob.state.idx = index;
            GameMath.updatePositionXYZ(ob.node, always(Math.random() * 8 - 4), always(0), always(-index));
            this.obstaclesNode.addChild(node);
            return ob;
        } else {
            let node: CC.Node = CC.instantiate(this.carPrefabs[randomOneWithRate(this.obstacleRates).getOrElse(0)]);
            let ob = node.getComponent(VihecleModel) as VihecleModel;
            ob.initLife(GameData.getLevel());
            ob.asObstalce(Math.floor(Math.random() * 3) + 1);
            ob.state.idx = index;
            GameMath.updatePositionXYZ(ob.node, always(Math.random() * 8 - 4), always(0), always(-index));
            this.obstaclesNode.addChild(node);
            return ob;
        }
    }

    initEvents() {
        this.canvas.node.on("touch-start", (e: CC.EventTouch) => {
            this.eval(["TouchStart", e.getLocation()])
        }, this);
        this.carBox && this.carBox.on("onTriggerEnter", (event: CC.ITriggerEvent) => {
            let ob = event.otherCollider.node.getComponent(ObstacleModel) as ObstacleModel;
            if (!ob) { return ; }
            if (ob.state.collision) {
                return;
            } else {
                ob.state.collision = true;
                this.state.currentObstacle = Maybe.Just(ob);
                this.showCollision(ob);
            }
        }, this);

        this.energyBgNode.on("touch-end", (e: CC.EventTouch) => {
            this.eval(["EnergyBarTouchEnd"]);
        }, this);
        this.selectCarButtonNode.on('touch-end', () => {
            this.eval(["OpenSelectCar"]);
        }, this);
        this.goldIcoNode.on('touch-end', () => {
            this.roadScene.roadNodes.forEach(node => node.active = !node.active);
        }, this);
    }

    // update () {
    //     if (this.sceneNodes[this.state.sceneIndex].position.z > this.carNode.position.z + 100) {
    //         GameMath.updatePosition(this.sceneNodes[this.state.sceneIndex], "z", add(-300));
    //         this.state.sceneIndex = (this.state.sceneIndex + 1) % 3;
    //     }
    //     GameMath.updatePosition(this.carNode, "z", add(-1));
    //     GameMath.updatePosition(this.camera.node, "z", add(-1));
    // }

    update () {
        if (this.state.gameState == "End") {
            return;
        }
        // 触发子弹时间: 
        // 子弹时间在指定时间,或者碰撞之后触发.
        if (!this.state.bulletTime.isTriggered && this.state.remainTime < this.state.bulletTime.triggerRemainTime)  {
            if (this.state.car.state != "Collision") {
                this.enterBulletTime();
                this.state.bulletTime.isTriggered = true;
                this.state.car.state = "BulletTime";
            }
        }

        // 最后猛冲的触发
        // if (this.state.car.speedMode != "Sprint" && this.state.remainTime == 5) {
        //     vibrate("Long");
        //     this.state.car.speedMode = "Sprint";
        // }

        // 
        switch (this.state.gameState) {
            case "BeforeStart": {
                break;
            }
            case "StartTween": {
                this.cameraAnimation.pause();
                let _this = this;
                GameMath.updatePositionXYZ(this.camera.node, always(0), always(30), always(36));
                this.camera.node.setRotationFromEuler(-40, 0, 0);
                this.startReadyCounterDown().then(() => {
                    _this.state.gameState = "ReadyEnd";
                });
                this.state.gameState = "Ready";
                break;
            }
            case "Ready": {
                break;
            }
            case "ReadyEnd": {
                this.state.bulletTime.current = this.state.bulletTime.start = this.state.bulletTime.real = Date.now();
                this.state.gameState = 'CounterDown';
                break;
            }
            case "CounterDown": {
                let t = Date.now();
                let deltaT = t - this.state.bulletTime.real;
                this.state.bulletTime.real = t;
				if (this.state.car.state != "BulletTime") {
					this.state.bulletTime.current += deltaT;
				} else {
                    this.state.bulletTime.current += deltaT / 200;
                }
				let remainTime = Math.floor(300 - (this.state.bulletTime.current - this.state.bulletTime.start) / 100) / 10;
                this.state.remainTime = remainTime;
                this.timeBar.progress = remainTime / 30;
				// this.counterDownLabel.text = `${this.state.remainTime}`;
				if (this.state.remainTime <= 0) {
					this.state.gameState = "End";
                    this.showComplete();
				}
				// this.updateCar();
                break;
            }
        }
        GameMath.updatePosition(this.camera.node, "z", always(this.carBox.node.position.z + 36));
    }

    updateCar() {
		let scale = this.state.car.speedMode == "Normal" ? 1 : 2;
		switch (this.state.car.state) {
			case "Normal": {
                let spd = this.state.car.speed;
                GameMath.updatePositionXYZ(this.carNode, add(spd.x), add(spd.y), add(spd.z * scale));
                GameMath.updatePosition(this.collision.node , "z", always(this.carNode.position.z));
                GameMath.updatePositionXYZ(this.camera.node , add(0), add(spd.y), add(spd.z * scale));
				break;
			}
			case "BulletTime": {
				this.state.bulletTime.energy = Math.max(0, this.state.bulletTime.energy - 0.005);
				if (this.state.bulletTime.energy <= 0) {
					this.outBulletTime();
					this.state.bulletTime.success = Maybe.Just(false);
					this.state.car.state = "Normal";
                }
                this.energyBar.setPercent(this.state.bulletTime.energy);
                let spd = GameMath.scaleV3(this.state.car.speed, 0.01)
                GameMath.updatePositionXYZ(this.carNode, add(spd.x), add(spd.y), add(spd.z));
                GameMath.updatePosition(this.collision.node, "z", always(this.carNode.position.z));
                GameMath.updatePositionXYZ(this.camera.node , add(0), add(spd.y), add(spd.z));
				break;
			}
			case "Collision": {
                GameMath.updatePositionXYZ(this.carNode, add(Math.random() * 0.05 - 0.025), add(0), add(Math.random() * 0.05 - 0.025));
				if (this.carNode.position.z - this.camera.node.position.z < -20) {
                    GameMath.updatePosition(this.camera.node, "z", add(this.state.cameraSpeed))
				}
				break;
			}
			case "CameraBack": {
				if (this.carNode.position.z - this.camera.node.position.z > -DeltaZ) {
                    GameMath.updatePosition(this.carNode, "z", add(-this.state.cameraBackSpeed * scale));
					if (this.state.cameraBackSpeed < Math.abs(this.state.car.speed.z)) {
						this.state.cameraBackSpeed += this.state.deltaCamareSpeed;
					}
				} else {
					this.state.cameraBackSpeed = 0;
					this.state.car.state = "Normal";
				}
				break;
			}
        }
    }
    
    startTimer() {
		let _this = this;
		let timer = new Timer({ tick: 0.1 });
		timer.on("ontick", () => {
			_this.collusionUpdate();
		}).start(Timer.Infinity);
    }
    
    startRefreshScene() {
        let _this = this;
        let timer = new Timer({tick: 1});
        timer.on('ontick', () => {
            if (_this.state.gameState != "CounterDown") {
                return;
            }
            _this.roadScene.moveForward(_this.carNode.position.z);
        }).start(Timer.Infinity)
    }

	collusionUpdate() {
		if (this.state.car.state == "Collision") {
			if (this.state.currentObstacle.valid) {
				let ob = this.state.currentObstacle.val;
				let damage = GameData.carDamage(this.state.car.speedMode == "Sprint")
				ob.applyDamage(damage);
				vibrate("Short");
                // this.startDamageTween(damage);
				this.lifeBar.setPercent(ob.state.life / ob.state.lifeMax);

				if (ob.state.life <= 0) {
					this.state.currentObstacle = Maybe.Nothing();
					this.state.car.state = "CameraBack";
                    this.outCollision();
                    this.collision.stop();
                    ob.state.collision = false;
                    ob.node.active = false;
                    ob.state.active = false;
                    this.boom.boom(ob);
                    this.state.gold += ob.state.gold;
                    GameData.updateGoldAmount(add(ob.state.gold));
                    this.eval(["RefreshGold"]);
                    this.state.score += ob.state.score;
                    this.stars.setStar(this.state.score / this.state.star3Score);
				}
			}
		}
    }
    
    


    // events
    startGame() {
        this.menuPageNode.active = false;
        this.gamePageNode.active = true;
        this.state.gameState = "StartTween";

        let rb = this.carModel.rb;
        rb.applyImpulse (new CC.Vec3(0, 0, -500), new CC.Vec3(0, 0, 0));
        // rb.setLinearVelocity(new CC.Vec3(0, 0, -1));
    }


    canvasTouchMove(e: CC.EventTouch) {
        if (this.state.car.state === "Collision") {
            return;
        }
        this.eval(["TouchMove", e.getLocation()])
    }

    canvasTouchEnd() {
        this.eval(["TouchEnd"]);
    }

    // ui render
    enterBulletTime() {
        console.log(" enter bullet time")
        this.energyBar.node.active = true;
    }

    outBulletTime() {
        console.log("out bullet time")
        this.energyBar.node.active = false;
    }

    enterCollision() {
        this.lifeBar.node.active = true;
    }

    outCollision() {
        this.lifeBar.node.active= true;
    }

    enterSprint() {
        this.tailFlameNode.active = true;
        GameMath.updatePositionXYZ(this.camera.node, always(0), add(-5), add(-8.66));

        let z = this.carNode.position.z;
        let startZ = Math.floor((z - 20) / 30) * 30 + 55 ;
        range(startZ - 900, startZ, 30).forEach((z, index) => {
			let ob = this.lastObstacles[index];
			if (ob) {
				GameMath.updatePosition(ob.node, "z", always(z));
			}
		});
		this.lastObstacles.forEach(o => o.node.active = true);

    }

    outSprint() {

    }

    showCollision(obstacle: ObstacleModel) {
        this.enterCollision();
        this.state.car.state = "Collision";
        this.state.cameraSpeed = this.state.car.speed.z;
        let obBc = (obstacle.node.getComponent(CC.BoxColliderComponent) as CC.BoxColliderComponent);
        let obPos = obstacle.node.position;
        let obCenterBc = GameMath.plusV3(obPos, obBc.center);
        let obSizeBc = obBc.size;
        let carBc = this.carBox;
        let carPos = this.carNode.position;
        let carCenterBc = GameMath.plusV3(carPos, carBc.center);
        let x = (carCenterBc.x + obCenterBc.x)  / 2;
        let y = 1;
        let z = obCenterBc.z + obSizeBc.z / 2;
        this.collision.collision(obstacle, x, y, z);
    }

    startReadyCounterDown(): Promise<void>  {
        this.animation.play();
        return wait(3000)
    }

    showComplete() {
        wait(1000).then(() => {
            this.levelComplete.show(this.state.score, this.state.gold, this.state.score / this.state.star3Score);
        })
    }

    nextLevel() {
        GameMath.updatePositionXYZ(this.camera.node, always(0), always(30), always(36));
        GameMath.updatePositionXYZ(this.carNode, always(0), always(0), always(0));
        GameData.updateLevel(add(1));
       
        this.roadScene.reset();
        this.obstacles.forEach(o => o.initLife(GameData.getLevel()))
        this.state.gameState = "BeforeStart";
        this.gamePageNode.active = false;
        this.menuPageNode.active = true;
        this.state.remainTime = 30;
        this.state.score = this.state.gold = 0;
        this.stars.setStar(0);
        this.timeBar.progress = 1;
        this.state.bulletTime.isTriggered = false;
        this.tailFlameNode.active = false;
        this.state.bulletTime.energy = 0.4;
        this.cameraAnimation.start();
        this.state.car.speed.z = -GameData.carSpeed();
    }

    loadModel() {
        let info = GameData.getCarInfo();
        if (this.carBox && this.carBox.node) {
            safeDestory(this.carBox.node as CC.Node);
        }
        let node = CC.instantiate(this.carPrefabs[info.prefabId - 1]);
        let car = node.getComponent(VihecleModel) as VihecleModel;
        this.carModel = car;
        this.carBox = node.getComponent(CC.BoxColliderComponent) as CC.BoxColliderComponent;
        car.initColor(info.colorId);
        this.carNode.addChild(node);


        this.carBox.on("onTriggerEnter", (event: CC.ITriggerEvent) => {
            let ob = event.otherCollider.node.getComponent(ObstacleModel) as ObstacleModel;
            if (!ob) { return ; }
            if (ob.state.collision) {
                return;
            } else {
                ob.state.collision = true;
                this.state.currentObstacle = Maybe.Just(ob);
                this.showCollision(ob);
            }
        }, this);
    }

}