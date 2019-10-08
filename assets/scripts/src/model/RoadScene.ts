import { Component, _decorator, Prefab, CCObject, instantiate, Node} from "cc"
import BuildingModel from "./BuildingModel";
import { GameMath, always, add } from "../../basic/BaseFunctions";
import BuildingPool from "./BuildingPool";
const { property, ccclass }  = cc._decorator

@ccclass("RoadScene")
export default class RoadScene extends Component {
    @property({type: [Node]})
    roadNodes: Node [] = [];
    @property({type: BuildingPool})
    pool: BuildingPool = null;
    @property({type: Node})
    leftBuildingNode: Node = null;
    @property({type: Node})
    rightBuildingNode: Node = null;
    @property({type: [Node]})
    lightNodes: Node [] = [];

    leftBuildings: {[key: string]: BuildingModel} = {};
    rightBuildings: {[key: string]: BuildingModel} = {}

    rightZ = 50;
    leftZ = 50;
    roadIndex: number = 0;
    lightIndex: number = 0;

    reset() {
        for (let key in this.leftBuildings) {
            let b = this.leftBuildings[key];
            this.pool.recycleModel(b);
        }
        for (let key in this.rightBuildings) {
            let b = this.rightBuildings[key];
            this.pool.recycleModel(b);
        }
        this.rightZ = 50;
        this.leftZ = 50;
        this.initBuildings();
        this.lightNodes.forEach((node, index) => {
            GameMath.updatePosition(node, "z", always(20 - index * 10));
        });
        this.lightIndex = 0;
        this.roadNodes.forEach((node, index) => GameMath.updatePosition(node, "z", always(-index*100)))
        this.roadIndex = 0;
    }

    initBuildings(z: number = -100) {
        while (this.rightZ > z) {
            let model = this.pool.getModel(true);
            GameMath.updatePosition(model.node, "z", always(this.rightZ));
            this.rightBuildings[this.rightZ + ''] = model; 
            this.rightZ -= (model.width + 30);
            this.rightBuildingNode.addChild(model.node as Node);
        }
        while (this.leftZ > z) {
            let model = this.pool.getModel(false);
            GameMath.updatePosition(model.node, "z", always(this.leftZ));
            this.leftBuildings[this.leftZ + ''] = model;
            this.leftZ -= (model.width + 30);
            this.leftBuildingNode.addChild(model.node as Node);
        }
    }

    moveForward(z: number) {
        // 第一步, 回收
        for (let key in this.leftBuildings) {
            let b = this.leftBuildings[key];
            if (b.node.position.z > z + 30) {
                this.pool.recycleModel(b);
            }
        }
        for (let key in this.rightBuildings) {
            let b = this.rightBuildings[key];
            if (b.node.position.z > z + 30) {
                this.pool.recycleModel(b);
            }
        }

        // 第二步, 循环地面
        if (this.roadNodes[this.roadIndex].position.z > z + 100) {
            GameMath.updatePosition(this.roadNodes[this.roadIndex], "z", add(-300));
            this.roadIndex = (this.roadIndex + 1) % 3;
        }

        // 循环路灯\
        while (this.lightNodes[this.lightIndex].position.z > z + 40) {
            GameMath.updatePosition(this.lightNodes[this.lightIndex], "z", add(-120));
            this.lightIndex = (this.lightIndex + 1) % 12;
        }

        // 第三步, 生成新的建筑
        this.initBuildings(z - 200);
    }


}