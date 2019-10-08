import { Component, _decorator, ModelComponent, Material, CCInteger, BoxColliderComponent } from "cc"
import { obstacleConfig } from "../../config/json/Obstacle";
const { property, ccclass }  = cc._decorator


type State = {
    life: number, 
    lifeMax: number,
    width: number,
    height: number,
    depth: number,
    active: boolean,
    idx: number,
    collision: boolean
    gold: number,
    score: number,
}

@ccclass("ObstacleModel")
export default class ObstacleModel extends Component {
    @property({type: ModelComponent})
    model: ModelComponent = null;

    @property({type: [Material]})
    materials: Material[] = [];

    // rates.length == materials.length;
    @property({type: [Number]})
    rates: number[] = [];

    @property({type: CCInteger})
    protoId: number = 0;

    applyDamage(damage: number) {
        this.state.life -= damage;
    }

    state: State = {
        life: 0,
        lifeMax: 0,
        width: 1,
        height: 4,
        depth: 0.2,
        active: true,
        idx: 0,
        collision: false,
        gold: 0,
        score: 0,
    }

    initLife(level: number) {
        let ob = obstacleConfig[level];
        let hp = ob[`obs${this.protoId}_hp`];
        let gold = ob[`obs${this.protoId}_gold`];
        this.state.life = this.state.lifeMax = hp;
        this.state.gold = gold;
        this.node.active = true;
        this.state.active = true;
        this.state.score = ob[`obs${this.protoId}_score`];
    }   

}