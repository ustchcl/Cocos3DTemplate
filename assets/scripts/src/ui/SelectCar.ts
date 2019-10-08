import { _decorator, Component, Node, Vec3, ButtonComponent, SpriteComponent, LabelComponent, Vec2, EventTouch } from "cc";
import { GameMath, add, always } from "../../basic/BaseFunctions";
import { carConfig } from "../../config/json/Car";
import { GameData } from "../GameData";
import MainScene from "../MainScene";
const { ccclass, property } = _decorator;


/**
 * NOTE: 此界面使用2D图标为宜 
 */

type Msg 
    = ["TouchStart", Vec2]
    | ["TouchMove", Vec2]
    | ["TouchEnd"]

@ccclass("SelectCar")
export class SelectCar extends Component {
    @property({type: SpriteComponent})
    topSprite: SpriteComponent = null;
    @property({type: ButtonComponent})
    backBtn: ButtonComponent = null;
    @property({type: ButtonComponent})
    confrimButton: ButtonComponent = null;

    @property([SpriteComponent])
    carSprites: SpriteComponent [] = [];
    @property([Node])
    carNodes: Node [] = [];

    @property(LabelComponent)
    damageLabel: LabelComponent = null;
    @property(LabelComponent)
    speedLabel: LabelComponent = null;
    @property(LabelComponent)
    luckyLabel: LabelComponent = null;
    @property(LabelComponent)
    nameLabel: LabelComponent = null;

    @property(MainScene)
    mainScene: MainScene = null;

    @property(Node)
    layoutNode: Node = null;

    touchPreX: number = 0;
    currentIndex: number = -1;

    start () {
        this.layoutNode.on("touch-start", (e: EventTouch) => {
            this.eval(["TouchStart", e.getLocation()])
        }, this);
        this.updateTop(0);
        this.backBtn.node.on("touch-end", () => {
            this.node.active = false;
        }, this);
        this.confrimButton.node.on("touch-end", () => {
            GameData.setCarAndColor(Math.floor(this.currentIndex / 3) + 1, this.currentIndex % 3 + 1);
            this.node.active = false;
            this.mainScene.loadModel();
        }, this);
    }

    update () {
        this.carNodes.forEach((node, index) => {
            let distance = Math.min(200, Math.abs(node.position.x + this.layoutNode.position.x));
            let scale = 1.2 - distance / 200 * 0.4;
            if (distance < 128) {
                this.updateTop(index);
            }
            this.carSprites[index].node.setScale(new Vec3(scale, scale, 1));
        })
    }

    eval(msg: Msg) {
        switch (msg[0]) {
            case "TouchStart": {
                this.layoutNode.on("touch-end", this.canvasTouchEnd, this);
                this.layoutNode.on("touch-cancel", this.canvasTouchEnd, this);
                this.layoutNode.on("touch-move", this.canvasTouchMove, this);
                this.touchPreX = msg[1].x;
                break;
            }
            case "TouchMove": {
                let delta = msg[1].x - this.touchPreX;
                this.touchPreX = msg[1].x;
                if ((this.layoutNode.position.x >= -128 && delta > 0) || 
                    (this.layoutNode.position.x <= -2176 && delta < 0)) {
                        break;
                }
                GameMath.updatePosition(this.layoutNode, "x", add(delta))
                break;
            }
            case "TouchEnd": {
                this.layoutNode.off("touch-end", this.canvasTouchEnd, this);
                this.layoutNode.off("touch-cancel", this.canvasTouchEnd, this);
                this.layoutNode.off("touch-move", this.canvasTouchMove, this);

                let idx = Math.round((this.layoutNode.position.x + 128) / 256);
                console.log('select car', idx);
                GameMath.updatePosition(this.layoutNode,  "x", always(idx * 256 - 128));
                this.updateTop(0 - idx);
                break;
            }
        }
    }

    canvasTouchMove(e: EventTouch) {
        this.eval(["TouchMove", e.getLocation()])
    }

    canvasTouchEnd() {
        this.eval(["TouchEnd"]);
    }

    updateTop(index: number) {
        if (index == this.currentIndex) {
            return;
        }
        this.currentIndex = index;
        this.topSprite.spriteFrame = this.carSprites[index].spriteFrame;
        let car = carConfig[index + 1];
        this.damageLabel.string = `破坏基础值: ${car["dmgBase"]}`;
        this.speedLabel.string = `速度基础值: ${car["spdBase"]}`;
        this.speedLabel.string = `幸运基础值: ${car["lukBase"]}`;
        this.nameLabel.string = car["name"];
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
