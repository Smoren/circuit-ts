import type { ConnectorInterface, SignalPropagatorInterface } from "./types";
import { InfiniteLoopError } from "./excpetions";

export class SignalPropagator implements SignalPropagatorInterface {
  private readonly visitedDirtyConnectors: Set<ConnectorInterface>;

  constructor() {
    this.visitedDirtyConnectors = new Set<ConnectorInterface>();
  }

  public propagate(targets: ConnectorInterface[]): Set<ConnectorInterface> {
    this.visitedDirtyConnectors.clear();

    while (targets.length > 0) {
      targets = targets.flatMap((target) => this.handleTarget(target));
    }

    return this.visitedDirtyConnectors;
  }

  private handleTarget(target: ConnectorInterface): Array<ConnectorInterface> {
    if (target.dirty) {
      if (this.visitedDirtyConnectors.has(target)) {
        // FIXME
        // throw new InfiniteLoopError(target);
      }
      this.visitedDirtyConnectors.add(target);
    }

    return target.propagate();
  }
}
