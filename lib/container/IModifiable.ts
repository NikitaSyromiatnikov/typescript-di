export interface IModifiable {
    singleInstance: () => void;
    instancePerDependency: () => void;
}