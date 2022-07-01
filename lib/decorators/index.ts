import { Container } from "../container/Container";
import { Class, Modifiable } from "../container/IContainer";

export const RootContainer = new Container();

export function Injectable<T>(asSingleInstance: boolean = false) {
    return (target: Class<any>) => {
        const modifiable: Modifiable = RootContainer.register(target);

        if (asSingleInstance) {
            modifiable.singleInstance();
        }
    }
}