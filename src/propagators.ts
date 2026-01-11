import type { ConnectorInterface, SignalPropagatorInterface } from "./types";
import { InfiniteLoopError } from "./excpetions";

export class SignalPropagator implements SignalPropagatorInterface {
  private readonly _visitCounterLimit: number;
  private readonly _visitedDirtyConnectors: Set<ConnectorInterface>;
  private readonly _visitedCounters: Map<ConnectorInterface, number>;

  constructor(visitCounterLimit: number = 100) {
    this._visitCounterLimit = visitCounterLimit;
    this._visitedDirtyConnectors = new Set<ConnectorInterface>();
    this._visitedCounters = new Map<ConnectorInterface, number>();
  }

  public propagate(targets: ConnectorInterface[]): Set<ConnectorInterface> {
    this._visitedDirtyConnectors.clear();
    this._visitedCounters.clear();

    while (targets.length > 0) {
      if (targets.length == 1) {
        targets = targets.flatMap((target) => this.handleTarget(target));
        continue;
      }

      targets = [...targets];
      targets.sort(() => Math.random() - 0.5);

      const middle = Math.round(targets.length/2);
      const [actualTargets, deferredTargets] = [targets.slice(0, middle), targets.slice(middle)];

      targets = actualTargets.flatMap((target) => this.handleTarget(target));
      targets.push(...deferredTargets);
    }

    return this._visitedDirtyConnectors;
  }

  private handleTarget(target: ConnectorInterface): Array<ConnectorInterface> {
    if (target.dirty) {
      const visitedCounter = this._visitedCounters.get(target) ?? 0;
      if (visitedCounter > this._visitCounterLimit) {
        throw new InfiniteLoopError(target);
      }
      this._visitedCounters.set(target, visitedCounter + 1);
      this._visitedDirtyConnectors.add(target);
    }

    return target.propagate();
  }
}

// TODO set all dirty
// class ResetPropagator implements SignalPropagatorInterface {
//
// }
