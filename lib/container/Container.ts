import "reflect-metadata";
import { Class, IContainer, InstanceContainer, DependencyWithMetadata } from "./IContainer";
import { IModifiable } from "./IModifiable";
import { ResolutionStrategy } from "./ResolutionStrategy";

export class Container implements IContainer {
    private _cachedScope: string;
    private _cachedDependency: Class<any> | null;

    private readonly _scopes: Record<string, DependencyWithMetadata[]>;
    private readonly _defaultScopeId: string = "global";
    private readonly _metadataKey: string = "design:paramtypes";
    private readonly _singleInstances: InstanceContainer[];

    constructor() {
        this._cachedScope = this._defaultScopeId;
        this._cachedDependency = null;
        this._singleInstances = [];
        this._scopes = {
            [this._defaultScopeId]: [],
        }
    }

    public register<T>(dependency: Class<T>, scope: string = this._defaultScopeId) {
        if (this._scopes[scope] == null) {
            this._scopes[scope] = [];
        }

        this._scopes[scope].push({ class: dependency, type: ResolutionStrategy.INSTANCE_PER_DEPENDENCY });

        this._cachedDependency = dependency;
        this._cachedScope = scope;

        return this.modifiable;
    }

    public resolve<T>(dependency: Class<T>, scope: string = this._defaultScopeId): T {
        const meta: DependencyWithMetadata | undefined = this._scopes[scope]?.find((i) => i.class == dependency);

        if (meta == null) {
            throw new Error("Failed to resolve");
        }

        switch (meta.type) {
            case ResolutionStrategy.INSTANCE_PER_DEPENDENCY:
                return this.resolveInstance<T>(meta.class, scope);

            case ResolutionStrategy.SINGLE_INSTANCE:
                return this.resolveSingleInstance<T>(meta.class, scope);
        }
    }

    private resolveInstance<T>(classT: Class<any>, scope: string): T {
        const args = Reflect.getMetadata(this._metadataKey, classT).reduce((args: any[], current: Class<any>) => {
            return [...args, this.resolve(current, scope)];
        }, []);

        return Reflect.construct(classT, args) as T;
    }

    private resolveSingleInstance<T>(classT: Class<any>, scope: string): T {
        const exists: boolean = this._singleInstances.some((container: InstanceContainer) => container.class == classT);

        if (!exists) {
            const container: InstanceContainer = {
                class: classT,
                instance: new classT(),
            };

            this._singleInstances.push(container);
        }

        return this._singleInstances.find((container: InstanceContainer) => container.class == classT)?.instance as T;
    }

    private get modifiable(): IModifiable {
        if (this._cachedDependency != null) {
            let idx: number = -1;

            const exists = this._scopes[this._cachedScope].some((i: DependencyWithMetadata, index: number) => {
                idx = index;
                return i.class == this._cachedDependency
            });

            if (!exists) {
                throw new Error("Failed to resolve dependency");
            }

            return {
                singleInstance: () => {
                    this._scopes[this._cachedScope][idx].type = ResolutionStrategy.SINGLE_INSTANCE;
                },
                instancePerDependency: () => {
                    this._scopes[this._cachedScope][idx].type = ResolutionStrategy.INSTANCE_PER_DEPENDENCY;
                }
            }
        }

        return {
            singleInstance: () => {
            },
            instancePerDependency: () => {
            }
        }
    }
}