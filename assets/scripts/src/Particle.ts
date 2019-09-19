import * as CC from "cc"
const { ccclass, property } = CC._decorator;


@ccclass("Particle")
export default class Particle extends CC.Component {
    velocity: CC.Vec3 = new CC.Vec3(0, 0, 0);
    rotationVelocity: CC.Vec3 = new CC.Vec3(0, 0, 0);

    idx: number = 1;
}