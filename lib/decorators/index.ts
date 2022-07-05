import { Container } from "../container/Container";
import { Class } from "../container/IContainer";
import { IModifiable } from "../container/IModifiable";
import { ResolutionStrategy } from "../container/ResolutionStrategy";

export const RootContainer = new Container();

export function Injectable<T>(strategy: ResolutionStrategy = ResolutionStrategy.INSTANCE_PER_DEPENDENCY) {
    return (target: Class<any>) => {
        const modifiable: IModifiable = RootContainer.register(target);

        if (strategy == ResolutionStrategy.SINGLE_INSTANCE) {
            modifiable.singleInstance();
        }
    }
}