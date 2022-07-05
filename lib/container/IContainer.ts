import { IModifiable } from "./IModifiable";
import { ResolutionStrategy } from "./ResolutionStrategy";

export interface Class<T> {
    new(...args: any[]): T;
}

export interface DependencyWithMetadata {
    class: Class<any>,
    type: ResolutionStrategy,
}

export interface IContainer {
    register: (dependency: Class<any>, scope?: string) => IModifiable;
    resolve: (dependency: Class<any>) => any | null;
}

export interface InstanceContainer {
    class: Class<any>;
    instance: any;
}