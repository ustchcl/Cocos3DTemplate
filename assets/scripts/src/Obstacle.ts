import * as c3d from "cc";
const { ccclass, property  } = c3d._decorator;

type State = {
    life: number, 
    lifeMax: number,
    width: number,
    height: number,
    depth: number,
    active: boolean
}

@ccclass("Obstacle")
export default class Obstacle extends c3d.Component {
    @property(c3d.Node)
    owner: c3d.Node | null = null;

    state: State = {
        life: 0,
        lifeMax: 0,
        width: 1,
        height: 4,
        depth: 0.2,
        active: true
    }

    start () {

    }



}