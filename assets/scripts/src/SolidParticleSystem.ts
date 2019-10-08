import * as CC from "cc"
import Particle from "./Particle";
import { range, randomOneWithRate, GameMath, always } from "../basic/BaseFunctions";
import ObstacleModel from "./model/ObstacleModel";
const { ccclass, property } = CC._decorator;

@ccclass("SolidParticleSystem")
export default class SolidParticleSystem extends CC.Component {
    node: CC.Node;
    particles: Particle[];

    materials: CC.Material[] = [];

    @property({type: CC.Prefab})
    prefab: CC.Prefab = null;

    @property(CC.CCInteger)
    spNum: number = 0;

    readonly timeScale = 1;

    particle: Particle = null;

    state = {
        on: false,
        spNum: 100,
        rates: [0.3, 0.6, 1.0],
        gravity: -0.04,
        speed: 0.6,
        deadCount: 0,
        map: {}
    }

    onLoad() {
        let p = this.node.position;
        let cube: CC.Node = CC.instantiate(this.prefab);
        cube.setPosition(p);
        this.particles = range(0, this.spNum).map(i => {
            let node: CC.Node = cc.instantiate(cube);
            let particle = node.getComponent(Particle) as Particle;
            particle.idx = i;
            let scale = () => Math.random() * 0.3; 
            node.setScale(new CC.Vec3(scale(), scale(), scale()));
            let model = node.getComponent(CC.ModelComponent) as CC.ModelComponent;
            let idx = randomOneWithRate(this.state.rates).getOrElse(0);
            model.material = this.materials[idx];
            node.active = false;
            this.node.addChild(node);
            return particle;
        });
        this.node.active = false;
    }

    initParticles() {
        this.particles.forEach(p => {
            let idx = randomOneWithRate(this.state.rates).getOrElse(0);
            p.getComponent(CC.ModelComponent).material = this.materials[idx];
            this.recycleParticle(p)
        });
    }

    recycleParticle(particle: Particle) {
        particle.node.active = true;
        particle.node.position.set(0, 0, 0);

        let randomY = Math.random() - 0.2;
        particle.velocity.y = randomY * 0.7 * this.state.speed;
        let randomX = Math.random() - 0.5;
        if (Math.abs(randomX) < 0.3) {
            if (randomX > 0) {
                randomX = 0.3;
            } else {
                randomX = -0.3;
            }
        }
        particle.velocity.x = randomX * 0.8 * this.state.speed * 2;
        particle.velocity.z = Math.random() * this.state.speed;

        particle.node.setRotationFromEuler(Math.random() * 180, Math.random() * 180, Math.random() * 180 - 90);

        particle.node.active = true;
        return particle;
    }

    updateParticle(particle: Particle) {
        if (particle.node.position.y < 0) {
            if (Math.abs(particle.velocity.y) > 0.1) {
                particle.velocity.y *= -0.6;
            } else {
                this.recycleParticle(particle);
            }
        }
        particle.velocity.y += this.state.gravity * this.timeScale;
        let p = particle.node.position;
        particle.node.setPosition(GameMath.plusV3(p, GameMath.scaleV3(particle.velocity, this.timeScale)));

        let sign = particle.idx % 2 == 0 ? 1 : -1; 
        let r = particle.node.getRotation();
        let eulerR = new CC.Vec3();
        CC.Quat.toEuler(eulerR, r);
        particle.node.setRotationFromEuler(eulerR.x + this.timeScale * 4 * sign, eulerR.y + 0.03 * this.timeScale * sign, eulerR.z + 0.2 * this.timeScale * sign);
    }

    update() {
        if (this.state.on) {
            this.particles.forEach(p => this.updateParticle(p));
        }
    }

    collision (obstacle: ObstacleModel, x: number, y: number, z: number) {
        this.materials = obstacle.materials;
        this.state.rates = obstacle.rates;
        GameMath.updatePositionXYZ(this.node, always(x), always(y), always(z));
        this.initParticles();
        this.state.on = true;
        this.node.active = true;
    }

    stop() {
        this.state.on = false;
        this.node.active = false;
    }

    dispose() {
        this.particles.forEach(p => p.node.destroy());
        this.particles = [];
        this.node.removeAllChildren();
    }

}