import { Component, _decorator, ModelComponent, Material, CCInteger, ColliderComponent, BoxColliderComponent, ITriggerEvent, RigidBodyComponent } from "cc"
import ObstacleModel from "./ObstacleModel";
const { property, ccclass }  = cc._decorator

@ccclass("VihecleModel")
export default class VihecleModel extends ObstacleModel {

    // rates.length == materials.length + 1;
    // 第一种材质额外加入, 为会变化的主材质

    @property({type: [Material]})
    extraMaterials: Material[] = [];

    @property({type: RigidBodyComponent})
    rb: RigidBodyComponent = null;

    initColor(color: number) {
        let index = 0;
        if (this.protoId == 1) {
            index = 6;
        }
        this.model.setMaterial(this.extraMaterials[color - 1], index);
    }

    asObstalce(color: number) {
        this.initColor(color);
        this.materials.unshift(this.extraMaterials[color - 1]);
    }
}