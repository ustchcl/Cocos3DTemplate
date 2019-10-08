import { Component, _decorator, Prefab, CCObject, instantiate, Node} from "cc"
import BuildingModel from "./BuildingModel";
import { GameMath, always, safeRemove } from "../../basic/BaseFunctions";
const { property, ccclass }  = cc._decorator

@ccclass("BuildingPool")
export default class BuildingPool extends Component {
    @property({type: [Prefab]})
    faceToLefts: Prefab[] = [];
    @property({type: [Prefab]})
    faceToRights: Prefab[] = [];


    private faceToLeftPool: BuildingModel[] = [];
    private faceToRightPool: BuildingModel[] = [];


    getModel(factToLeft: boolean): BuildingModel {
        let model = this._getModel(factToLeft);
        let scale = factToLeft ? 1 : -1;
        GameMath.updatePosition(model.node, "x", always(0));
        GameMath.updateScale(model.node, "x", always((model.faceToLeft ? 1 : -1) * scale));
        return model;
    }

    recycleModel(model: BuildingModel) {
        safeRemove(model.node as Node);
        if (model.faceToLeft) {
            this.faceToLeftPool.push(model);
        } else {
            this.faceToRightPool.push(model);
        }
    }

    private _getModel(factToLeft: boolean) {
        if (factToLeft) {
            if (this.faceToLeftPool.length == 0) {
                let idx = Math.floor(this.faceToLefts.length * Math.random());
                let node: Node = instantiate(this.faceToLefts[idx]);
                let bm = node.getComponent(BuildingModel) as BuildingModel;
                return bm;
            } else {
                let bm = this.faceToLeftPool.pop();
                return bm;
            }
        } else {
            if (this.faceToRightPool.length == 0) {
                let idx = Math.floor(this.faceToRights.length * Math.random());
                let node: Node = instantiate(this.faceToRights[idx]);
                let bm = node.getComponent(BuildingModel) as BuildingModel;
                return bm;
            } else {
                let bm = this.faceToRightPool.pop();
                return bm;
            }
        }
    }
}