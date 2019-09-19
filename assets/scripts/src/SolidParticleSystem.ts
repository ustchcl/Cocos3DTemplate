import * as CC from "cc"
import Particle from "./Particle";
import { range } from "../basic/BaseFunctions";
const { ccclass, property } = CC._decorator;

@ccclass("SolidParticleSystem")
export default class SolidParticleSystem extends CC.Component {
    node: CC.Node;
    particles: Particle[];

    readonly speed = 0.5;
    readonly gravity = -0.01;

    @property({type: CC.Prefab})
    prefab: CC.Prefab = null;

    @property(CC.CCInteger)
    spNum: number = 0;

    particle: Particle = null;

    private _state = {
        on: true
    }

    onload() {
        let node: CC.Node = CC.instantiate(this.prefab);
        let particle = node.getComponent(Particle) as Particle;
        this.particles = range(0, this.spNum).map(i => cc.instantiate(particle));
        this.node.active = false;
    }

    initParticles() {
        this.particles.forEach(p => this.recycleParticle(p));
    }

    recycleParticle(particle: Particle) {
        particle.node.position.set(0, 0, 0);
        particle.velocity.z = -Math.random() * this.speed;

        let randomY = Math.random() - 0.2;
        particle.velocity.y =  randomY * 0.7 * this.speed;

        let randomX = Math.random() - 0.5;
        if (Math.abs(randomX) < 0.3) {
            if (randomX > 0) {
                randomX = 0.3;
            } else {
                randomX = -0.3;
            }
        }
        particle.velocity.x = randomX * 0.7 * this.speed * 2;
        particle.node.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI, 0);

        let sizeX = Math.random() + 0.1;
        let sizeY = Math.random() + 0.1;
        let sizeZ = Math.random() + 0.1;
        particle.node.scale.set(sizeX * 0.3, sizeY * 0.3, sizeZ * 0.3);

        particle.node.active = true;
        return particle;
    }

    updateParticle(particle: Particle) {
        if (particle.node.position.y < -2) {
            this.recycleParticle(particle)
        }
        particle.velocity.y += this.gravity;
        particle.node.position.add(particle.velocity);

        let sign = particle.idx % 2 == 0 ? 1 : -1; 
        let r = particle.node.rotation;
        particle.node.rotation.set(r.x + 0.1 * sign, r.y + 0.008 * sign, r.z + 0.05 * sign, r.w);
    }

    // update() {
    //     if (this._state.on) {
    //         this.particles.forEach(p => this.updateParticle(p));
    //     }
    // }

    start () {
        this._state.on = true;
        this.node.active = true;
    }

    stop() {
        this._state.on = false;
        this.node.active = false;
    }

    dispose() {
        this.particles.forEach(p => p.node.destroy());
        this.particles = [];
        this.node.removeAllChildren();
    }

}