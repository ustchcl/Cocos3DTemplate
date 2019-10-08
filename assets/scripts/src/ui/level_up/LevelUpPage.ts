import { _decorator, Node, Component, ButtonComponent, LabelComponent, SpriteFrame } from "cc";
import SkillItem from "./SkillItem";
import { safeRemove } from "../../../basic/BaseFunctions";
import { GameData } from "../../GameData";

const { ccclass, property } = _decorator;

@ccclass("LevelUpPage")
export default class LevelUpPage extends Component {
    @property(ButtonComponent)
    backButton: ButtonComponent = null;
    @property(LabelComponent)
    goldAmountLabel: LabelComponent = null;

    @property({type: [SkillItem]})
    items: SkillItem[] = [];

    @property([SpriteFrame])
    iconSfs: SpriteFrame[] = []

    skillIds = [1, 2, 3, 4, 5, 6];

    onLoad() {
        this.initEvents();
    }

    start () {
        this.items.forEach((item, index) => item.init(this.skillIds[index], this.iconSfs[index]));
    }

    update () {
        this.goldAmountLabel.string = GameData.getGoldAmount() + '';
    }

    initEvents () {
        this.backButton.node.on("touch-end", () => {
            this.node.active = false;
        }, this);
    }
}