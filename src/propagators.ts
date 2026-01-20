import { ConnectorInterface, ResetElementPropagatorInterface, ElementInterface, SignalPropagatorInterface } from "./types";
import { InfiniteLoopError } from "./exceptions";

export class SignalPropagator<TValue> implements SignalPropagatorInterface<TValue> {
  private readonly _visitCounterLimit: number;
  private readonly _visitedDirtyConnectors: Set<ConnectorInterface<TValue>>;
  private readonly _visitedCounters: Map<ConnectorInterface<TValue>, number>;

  constructor(visitCounterLimit: number = 100) {
    this._visitCounterLimit = visitCounterLimit;
    this._visitedDirtyConnectors = new Set<ConnectorInterface<TValue>>();
    this._visitedCounters = new Map<ConnectorInterface<TValue>, number>();
  }

  public propagate(targets: ConnectorInterface<TValue>[]): Set<ConnectorInterface<TValue>> {
    this._visitedDirtyConnectors.clear();
    this._visitedCounters.clear();

    while (targets.length > 0) {
      if (targets.length == 1) {
        targets = targets.flatMap((target) => this._handleTarget(target));
        continue;
      }

      targets = [...targets];
      targets.sort(() => Math.random() - 0.5);

      const middle = Math.round(targets.length/2);
      const [actualTargets, deferredTargets] = [targets.slice(0, middle), targets.slice(middle)];

      targets = actualTargets.flatMap((target) => this._handleTarget(target));
      targets.push(...deferredTargets);
    }

    return this._visitedDirtyConnectors;
  }

  private _handleTarget(target: ConnectorInterface<TValue>): Array<ConnectorInterface<TValue>> {
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

export class ResetElementPropagator<TValue> implements ResetElementPropagatorInterface<TValue> {
  private readonly _visitedDirtyConnectors: Set<ConnectorInterface<TValue>>;

  constructor() {
    this._visitedDirtyConnectors = new Set<ConnectorInterface<TValue>>();
  }

  public propagate(element: ElementInterface<TValue>): void {
    this._visitedDirtyConnectors.clear();

    let targets: ConnectorInterface<TValue>[] = element.inputs;
    const stopConnectors: Set<ConnectorInterface<TValue>> = new Set(element.outputs);

    while (targets.length > 0) {
      targets = targets.flatMap((target) => this._handleTarget(target, stopConnectors));
    }
  }

  private _handleTarget(target: ConnectorInterface<TValue>, stopConnectors: Set<ConnectorInterface<TValue>>): Array<ConnectorInterface<TValue>> {
    if (this._visitedDirtyConnectors.has(target)) {
      return [];
    }
    this._visitedDirtyConnectors.add(target);

    target.makeDirty();

    if (stopConnectors.has(target)) {
      return [];
    }

    return target.targets;
  }
}
