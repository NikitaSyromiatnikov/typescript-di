export interface Class<T> {
    new(...args: any[]): T;
}

export enum ResolutionStrategy {
    INSTANCE_PER_DEPENDENCY = 0,
    SINGLE_INSTANCE = 1,
}

export type Modifiable = {
    singleInstance: () => void;
    instancePerDependency: () => void;
}

export type Meta = {
    class: Class<any>,
    type: ResolutionStrategy,
}

export interface IContainer {
    register: (dependency: Class<any>, scope?: string) => Modifiable;
    resolve: (dependency: Class<any>) => any | null;
}

export type InstanceContainer = {
    class: Class<any>;
    instance: any;
}