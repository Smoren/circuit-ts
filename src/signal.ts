import type { ConnectorInterface, SignalPropagationInterface } from "./types";
import { InfiniteLoopError } from "./excpetions";

export class SignalPropagation implements SignalPropagationInterface {
  private readonly visitedDirtyConnectors: Set<ConnectorInterface>;

  constructor() {
    this.visitedDirtyConnectors = new Set<ConnectorInterface>();
  }

  public send(target: ConnectorInterface, value: boolean): Set<ConnectorInterface> {
    this.visitedDirtyConnectors.clear();

    target.value = value;
    let targets = this.handleTarget(target);

    while (targets.length > 0) {
      targets = targets.flatMap((target) => this.handleTarget(target));
    }

    return this.visitedDirtyConnectors;
  }

  private handleTarget(target: ConnectorInterface): Array<ConnectorInterface> {
    if (target.dirty) {
      if (this.visitedDirtyConnectors.has(target)) {
        throw new InfiniteLoopError(target);
      }
      this.visitedDirtyConnectors.add(target);
    }

    return target.propagate();
  }
}
