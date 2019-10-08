import { carConfig } from "../config/json/Car";
import { obstacleConfig } from "../config/json/Obstacle";
import { skillConfig } from "../config/json/Skill";
import { Fn } from "../basic/Types";
import { skillUpgradeConfig } from "../config/json/SkillUpg";
import { add, showMsg } from "../basic/BaseFunctions";

export module GameData {
    let level = 1;
    let carId = 1;
    let colorId = 1;
    let goldAmount: number = 0;
    let crystalAmount: number = 0;

    const key = "疯狂撞撞车";

    let skillLevel = {
        "破坏": 1,
        "速度": 1,
        "幸运": 1,
        "暴击": 1,
        "强袭": 1,
        "无双": 1 
    }  

    function getBJRateByLevel(level: number) {
        return level / 100;
    }

    function getWSRateByLevel(level: number) {
        return 0.001 * level;
    }

    function getXYRateByLevel(level: number) {
        let carLucky = carConfig[getRealCarId()]['lukBase'];
        return (carLucky + level * 100) / 20000;
    }

    function getRealCarId(): number {
        return (carId - 1) * 3 + (colorId - 1) + 1;
    } 

    // getters
    export function carDamage(sprint: boolean = false) {
        let car = carConfig[getRealCarId()];
        let d1 = car["dmgBase"];        // 基础伤害
        let d2 = d1 + skillLevel["破坏"] * 100; // 破坏补正
        let d3 = d2 + skillLevel["破坏"] * (Math.random() * 0.2 + 0.9); // 随机补正
        let d4 = d3 * (1 + skillLevel['强袭'] * 0.01);  // 强袭补正
        let d5 = d4 * (Math.random() < getBJRateByLevel(skillLevel["暴击"]) ? 2 : 1);    // 暴击补正 
        let d6 = d5 * (sprint ? 2 : 1); // 冲刺补正
        let d7 = Math.random() < getWSRateByLevel(skillLevel['无双']) ? 99999999 : d6; // 无双补正
        return Math.ceil(d7/2);
    }

    export function getCarInfo(): {prefabId: number, colorId: number} {
        return {prefabId: carId, colorId: colorId}
    }

    const carBaseSpeed = 0.8;
    export function carSpeed(sprint: boolean = false) {
        return carBaseSpeed * ((sprint ? 2 : 1) + skillLevel["速度"] / 200)
    }

    export function gold(obProtoId: number) {
        let g1 = obstacleConfig[level][`obs${obProtoId}_gold`];
        let g2 = (Math.random() < getXYRateByLevel(skillLevel["幸运"]) ? 2 : 1) * g1;
        return Math.ceil(g2);
    }

    export function getLevel() {
        return level;
    }

    export function getGoldAmount() {
        return goldAmount;
    }

    export function getCrystalAmount() {
        return crystalAmount;
    }

    export function getSkillLevel(skillId: number) {
        return skillLevel[skillConfig[skillId]["name"]]
    }

    // setters 
    export function skillLevelUp(skillId: number) {
        let skill = skillConfig[skillId];
        let level = skillLevel[skill["name"]];
        let cost = skillUpgradeConfig[skillId]["goldCost"];
        if (skillUpgradeConfig[skillId]["goldCost"] > goldAmount) {
            console.error("金币不足");
            showMsg("金币不足", "none");
            
        } else {
            skillLevel[skill["name"]] = Math.min(skill["maxLv"], level + 1);
            updateGoldAmount(add(-cost));
        }
        saveToLocal();
    }

    export function updateGoldAmount(func: Fn<number, number>) {
        goldAmount = func(goldAmount);
        saveToLocal();
    } 

    export function setCarAndColor(_carId: number, _colorId: number) {
        carId = _carId;
        colorId = _colorId;
        saveToLocal();
    }

    export function updateLevel(func: Fn<number, number>) {
        level = func(level);
        saveToLocal();
    }
    

    // save to Local
    type LocalStore = {
        skillLevel: {
            "破坏": number,
            "速度": number,
            "幸运": number,
            "暴击": number,
            "强袭": number,
            "无双": number 
        }, 
        level: number, 
        carId: number,
        goldAmount: number,
        crystalAmount: number,
    }
    function saveToLocal() {
        let json = {
            skillLevel,
            level,
            carId,
            goldAmount,
            crystalAmount
        }
        localStorage.setItem(key, JSON.stringify(json));
    }

    function readLocal() {
        let data = localStorage.getItem(key);
        if (data) {
            let json = JSON.parse(data) as LocalStore;
            level = json.level;
            carId = json.carId;
            goldAmount = json.goldAmount;
            crystalAmount = json.crystalAmount;
            skillLevel = json.skillLevel;
        }
    }

    export function init() {
        readLocal();
    }
}