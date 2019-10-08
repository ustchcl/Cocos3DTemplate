import { _decorator, Component, Node, Vec3, ButtonComponent, LabelComponent, SystemEventType } from "cc";
import { Stars } from "./prefabs/Stars";
import { safeRemove } from "../../basic/BaseFunctions";
import MainScene from "../MainScene";
const { ccclass, property } = _decorator;

@ccclass("LevelComplete")
export class LevelComplete extends Component {
    @property({type: ButtonComponent})
    backBtn: ButtonComponent = null;
    @property({type: ButtonComponent})
    nextLevelBtn: ButtonComponent = null;
    @property({type: LabelComponent})
    scoreLabel: LabelComponent = null;
    @property({type: LabelComponent})
    coinLabel: LabelComponent = null;
    @property({type: Stars})
    stars: Stars = null;

    @property(MainScene)
    mainScene: MainScene = null;



    start () {
        // Your initialization goes here.
        this.initEvents();
    }

    initEvents() {
        this.backBtn.node.on(SystemEventType.TOUCH_END, () => {
            this.node.active = false;
            this.mainScene.eval(["BackToMain"]);
        }, this);

        this.nextLevelBtn.node.on(SystemEventType.TOUCH_END, () => {
            this.node.active = false;
            this.mainScene.eval(["NextLevel"]);
        }, this);
    }

    show(score: number, gold: number, starPercent: number) {
        this.node.active = true;
        this.coinLabel.string = `${gold}`;
        this.scoreLabel.string = `${score}`;
        this.stars.setStar(starPercent);
    }
}
