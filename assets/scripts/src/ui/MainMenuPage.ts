import { _decorator, Component, Node, Vec3, ButtonComponent, LabelComponent } from "cc";
import MainScene from "../MainScene";
import { GameData } from "../GameData";
const { ccclass, property } = _decorator;



@ccclass("MainMenuPage")
export class MainMenuPage extends Component {
    @property({type: ButtonComponent})
    startButton: ButtonComponent = null;
    @property({type: ButtonComponent})
    skillButton: ButtonComponent = null;
    @property({type: ButtonComponent})
    rollButton: ButtonComponent = null;

    @property({type: LabelComponent})
    goldLabel: LabelComponent = null;
    @property({type: LabelComponent})
    crystalLabel: LabelComponent = null;
    @property({type: LabelComponent})
    levelLabel: LabelComponent = null;

    @property({type: MainScene})
    mainScene: MainScene = null;

    start () {
        // Your initialization goes here.
        this.initEvents();
    }

    initEvents () {
        this.startButton.node.on("touch-end", () => {
            this.mainScene.eval(["StartGame"])
        }, this);
        this.skillButton.node.on("touch-end", () => {
            this.mainScene.eval(['OpenSkillPanel']);
        }, this);
        this.rollButton.node.on("touch-end", () => {
            this.mainScene.eval(["OpenRollPanel"])
        }, this);
    }

    setGold(gold: number) {
        this.goldLabel.string = `${gold}`;
    } 

    setCrystal(crystal: number) {
        this.crystalLabel.string = `${crystal}`;
    }

    setLevel(level: number) {

    }

    update () {
        this.goldLabel.string = `${GameData.getGoldAmount()}`;
        this.crystalLabel.string = `${GameData.getCrystalAmount()}`;
        this.levelLabel.string = `(当前第${GameData.getLevel()}关)`;
    }
}
