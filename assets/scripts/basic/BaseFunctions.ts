import { Vec2, Node, Quat, Vec3, CCObject, SystemEvent, __internal, BoxColliderComponent, PhysicsSystem } from "cc";
import { Maybe } from "./Maybe";
import { Fn } from "./Types";
import VihecleModel from "../src/model/VehicleModel";
import ObstacleModel from "../src/model/ObstacleModel";

export module GameMath {
    export function plusV3(a: Vec3, b: Vec3): Vec3 {
        return new Vec3(a.x + b.x, a.y + b.y, a.z + b.z);
    }


    export function scaleV3(a: Vec3, scale: number): Vec3 {
        return new Vec3(a.x * scale, a.y * scale, a.z * scale)
    }

    export function subtract(a: Vec2, b: Vec2): Vec2 {
        return new Vec2(a.x - b.x, a.y - b.y);
    }

    export function updateQuat(quat: Quat, attr: "x" | "y" | "z" | "w", func: (_: number) => number) {
        switch(attr) {
            case "x": {
                return new Quat(func(quat.x), quat.y, quat.z, quat.w);
            }
            case "y": {
                return new Quat(quat.x, func(quat.y), quat.z, quat.w);
            }
            case "z": {
                return new Quat(quat.x, quat.y, func(quat.z), quat.w);
            }
            case "w": {
                return new Quat(quat.x, quat.y, quat.z, func(quat.w));
            }
        }
    }

    export function updateVec3(quat: Vec3, attr: "x" | "y" | "z", func: (_: number) => number) {
        switch(attr) {
            case "x": {
                return new Vec3(func(quat.x), quat.y, quat.z);
            }
            case "y": {
                return new Vec3(quat.x, func(quat.y), quat.z);
            }
            case "z": {
                return new Vec3(quat.x, quat.y, func(quat.z));
            }
        }
    }

    export function updateRotation(node: Node |  __internal.cocos_core_utils_interfaces_INode, attr: "x" | "y" | "z", func: (_: number) => number) {
        let r = node.rotation;
        let eulerR = new Vec3();
        Quat.toEuler(eulerR, r);
        let tempVec3 = updateVec3(eulerR, attr, func)
        node.setRotationFromEuler(tempVec3.x, tempVec3.y, tempVec3.z);
    }

    export function setEulerRotation() {
        
    }

    export function updatePosition(node: Node |  __internal.cocos_core_utils_interfaces_INode, attr: "x" | "y" | "z", func: (_: number) => number) {
        let p = node.position;
        node.setPosition(updateVec3(p, attr, func))
    }

    export function updateScale(node: Node |  __internal.cocos_core_utils_interfaces_INode, attr: "x" | "y" | "z", func: (_: number) => number) {
        let p = node.scale;
        node.setScale(updateVec3(p, attr, func))
    }

    export function updatePositionXYZ(node: Node | __internal.cocos_core_utils_interfaces_INode, xFunc: Fn<number, number>, yFunc: Fn<number, number>, zFunc: Fn<number, number>) {
        let p = node.position;
        node.setPosition(new Vec3(xFunc(p.x), yFunc(p.y), zFunc(p.z)));
    }

    export function hitTest(carNode: Node |  __internal.cocos_core_utils_interfaces_INode, obstacleNode: Node |  __internal.cocos_core_utils_interfaces_INode): boolean {
        // return (carNode.position.z < obstacleNode.position.z)
        // return false;
        // let vehicle = carNode.getComponent(BoxColliderComponent) as BoxColliderComponent;
        // let obstacle = obstacleNode.getComponent(BoxColliderComponent) as BoxColliderComponent;
        // PhysicsSystem.instance.
        // return carNode.position.z < obstacleNode.position.z;
        return false;

    }
}

export function range (start: number, end?: number, step?: number): Array<number> {
    if (end == null) {
        end = start || 0;
        start = 0;
    }

    if (!step) step = end < start ? -1 : 1;

    const len = Math.max(Math.ceil((end - start) / step), 0);
    const ret = Array(len);

    for (let i = 0; i < len; i++, start += step) ret[i] = start;

    return ret;
}

/**
 * 
 * @param rates example [0.5, 0.6, 0.9, 1.0]
 */
export function randomOneWithRate(rates: Array<number>): Maybe<number> {
    let length = rates.length;
    if (length == 0) {
        return Maybe.Nothing();
    }
    
    // let temp = new Array(length);
    // temp[0] = rates[0]
    // for (let i = 1; i < length; ++i) {
    //     temp[i] = rates[i] + temp[i - 1];
    // }
    let sum = rates[length - 1];
    let r = sum * Math.random();

    for (let i = 0; i < length; ++i) {
        if (rates[i] > r) {
            return Maybe.Just(i);
        }
    }
    return Maybe.Nothing();
}


type TouchType = "touch-start" | "touch-move" | "touch-cancel" | "touch-end"
export function addListener(node: Node, type: TouchType, cb: (e: SystemEvent) => any) {
    node.on(type, cb);
}

export function safeRemove(node: Node) {
    if (node.parent) {
        node.parent.removeChild(node);
    }
}

export function safeDestory(node: Node) {
    if (node.parent) {
        node.parent.removeChild(node);
        node.destroy();
    }
}


// 震动
type VibrateType = "Short" | "Long"
export function vibrate(type: VibrateType) {
    if (!window['wx']) {
        return;
    }
    let func = type == "Short" ? wx.vibrateShort :  wx.vibrateLong;
    func({
        success: () => { },
        fail: () => { },
        complete: () => { }
    });
}

export function wait(duration: number) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, duration);
    })
}

export function add(x: number) {
    return (y: number): number => {
        return x + y;
    }
}

export function always<T> (value: T): (() => T) {
    return () => value
}

export function ifNullThen<T>(t: T | null, defaultValue: T): T {
    if (t == null) {
        return defaultValue;
    } else {
        return t;
    }
}


type MsgType = "success" | "none"
export function showMsg(msg: string, msgType: MsgType = "none", duration=1500) {
    if (wx) {
        wx.showToast({
            title: msg,
            icon: msgType,
            duration: duration
        } as any);
    }
}