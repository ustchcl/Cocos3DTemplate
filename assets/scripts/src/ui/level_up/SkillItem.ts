import { _decorator, Component, SpriteComponent, LabelComponent, ButtonComponent, SpriteFrame } from "cc";
import { skillConfig } from "../../../config/json/Skill";
import { GameData } from "../../GameData";
import { skillUpgradeConfig } from "../../../config/json/SkillUpg";

const {ccclass, property} = _decorator;

@ccclass("SkillItem")
export default class SkillItem extends Component {
    @property(SpriteComponent)
    icon: SpriteComponent = null;
    @property(LabelComponent)
    titleLabel: LabelComponent = null;
    @property(LabelComponent)
    descriptionLabel: LabelComponent = null;
    @property(LabelComponent)
    priceLabel: LabelComponent = null;
    @property(ButtonComponent)
    levelUpButton: ButtonComponent = null;

    skillId: number = -1;

    start () {
        this.levelUpButton.node.on("touch-end", () => {
            if (this.skillId == -1) { return; }
            GameData.skillLevelUp(this.skillId);
            let level = GameData.getSkillLevel(this.skillId);
            this.priceLabel.string = skillUpgradeConfig[level]['goldCost'];
            this.initSkillLv();
        }, this);
    }

    init(skillId: number, iconSf: SpriteFrame) {
        let skill = skillConfig[skillId];
        let level = GameData.getSkillLevel(skillId);
        this.titleLabel.string = `${skill['name']} LV${level}`;
        this.descriptionLabel.string = skill['description'];
        this.priceLabel.string = skillUpgradeConfig[level]['goldCost'];
        this.skillId = skillId;
        this.icon.spriteFrame = iconSf;
    }

    initSkillLv () {
        if (this.skillId > 0) {
            let skill = skillConfig[this.skillId];
            let level = GameData.getSkillLevel(this.skillId);
            this.titleLabel.string = `${skill['name']} LV${level}`;
        }
    }



}