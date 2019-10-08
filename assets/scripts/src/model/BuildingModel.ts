import { Component, _decorator, ModelComponent, Material, CCInteger, ColliderComponent, BoxColliderComponent, ITriggerEvent, CCString, CCBoolean } from "cc"
const { property, ccclass }  = cc._decorator

@ccclass("BuildingModel")
export default class BuildingModel extends Component {
    @property({type: CCBoolean})
    faceToLeft: boolean = true;
    
    @property({type: CCInteger})
    width: number = 10;
    
}