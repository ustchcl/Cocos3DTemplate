import * as CC from "cc";
const {ccclass, property} = CC._decorator;
import { range, randomOneWithRate, GameMath, always } from "../basic/BaseFunctions";
import Particle from "./Particle";
import ObstacleModel from "./model/ObstacleModel";

@ccclass("Boom")
export default class Boom extends CC.Component {
    materials: CC.Material[] = [];

    @property({type: CC.Prefab})
    cubePrefab: CC.Prefab = null;

    particles: Particle[];

    readonly timeScale = 1.5;
    

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
        let p =  this.node.position;
        let cube: CC.Node = CC.instantiate(this.cubePrefab);
        cube.setPosition(p);
        this.particles = range(this.state.spNum).map(i => {
            let node: CC.Node = CC.instantiate(cube);
            let particle = node.getComponent(Particle) as Particle;
            particle.idx = i;
            let scale = Math.random();
            node.setScale(new CC.Vec3(scale, scale, scale));
            let model = node.getComponent(CC.ModelComponent) as CC.ModelComponent;
            let idx = randomOneWithRate(this.state.rates).getOrElse(0);
            model.material = this.materials[idx];
            node.active = false;
            this.node.addChild(node);
            return particle;
        });
        
    }

    initParticles() {
        this.state.deadCount = 0;
        this.state.map = {};
        this.particles.forEach(p => {
            let idx = randomOneWithRate(this.state.rates).getOrElse(0);
            p.getComponent(CC.ModelComponent).material = this.materials[idx];
            this.recycleParticle(p)
        });
    }

    recycleParticle(particle: Particle) {
        particle.node.active = true;
        particle.node.position.set(0, 0, 0);

        let phi = Math.random() * 2 * Math.PI;
        let theta = Math.random() * Math.PI / 6;
        let spd = this.state.speed * (Math.random() + 0.5)
        particle.velocity.z = spd * Math.sin(theta) * Math.cos(phi);
        particle.velocity.x = spd * Math.sin(theta) * Math.sin(phi);
        particle.velocity.y = spd * Math.cos(theta);


        particle.node.setRotationFromEuler(Math.random() * 180, Math.random() * 180, Math.random() * 180 - 90);

        particle.node.active = true;
        return particle;
    }

    updateParticle(particle: Particle) {
        if (particle.node.position.y < -2) {
            if (Math.abs(particle.velocity.y) > 0.1) {
                particle.velocity.y *= -0.6;
            } else {
                if (!this.state.map[particle.idx]) {
                    this.state.map[particle.idx] = true;
                    this.state.deadCount ++;
                    if (this.state.deadCount >= this.state.spNum) {
                        this.state.on = false;
                    }
                }
                return;
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

    boom (obstacle: ObstacleModel) {
        this.materials = obstacle.materials;
        this.state.rates = obstacle.rates;
        GameMath.updatePositionXYZ(this.node, always(obstacle.node.position.x), always(0), always(obstacle.node.position.z));
        this.initParticles();
        this.state.on = true;
        this.node.active = true;
    }

    reset() {
        this.state.on = false;
        this.particles.forEach(p => p.node.active = false);
    }

}