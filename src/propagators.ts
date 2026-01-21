import { PortInterface, ResetElementPropagatorInterface, ElementInterface, SignalPropagatorInterface } from "./types";
import { InfiniteLoopError } from "./exceptions";

/**
 * Service for propagating signals through the circuit.
 * Handles the logic of moving values from output ports to connected input ports
 * and triggering further propagation from those inputs.
 */
export class SignalPropagator<TValue> implements SignalPropagatorInterface<TValue> {
  /** Maximum number of times a single port can be visited during one propagation session. */
  private readonly _visitCounterLimit: number;
  /** Set of ports that were marked as dirty and visited during the current propagation. */
  private readonly _visitedDirtyPorts: Set<PortInterface<TValue>>;
  /** Counter of visits for each port to detect infinite loops. */
  private readonly _visitedCounters: Map<PortInterface<TValue>, number>;

  /**
   * @param visitCounterLimit - Safety limit for the number of visits to a single port (default: 100).
   */
  constructor(visitCounterLimit: number = 100) {
    this._visitCounterLimit = visitCounterLimit;
    this._visitedDirtyPorts = new Set<PortInterface<TValue>>();
    this._visitedCounters = new Map<PortInterface<TValue>, number>();
  }

  /**
   * Propagates signals starting from the given target ports.
   * Uses a randomized approach for multiple targets to ensure no bias in propagation order
   * and prevents infinite loops using a visit counter.
   *
   * @param targets - Array of ports to start propagation from.
   * @returns A set of all ports that were involved in the propagation.
   * @throws {InfiniteLoopError} If any port is visited more than the allowed limit.
   */
  public propagate(targets: PortInterface<TValue>[]): Set<PortInterface<TValue>> {
    this._visitedDirtyPorts.clear();
    this._visitedCounters.clear();

    // Propagation continues as long as there are ports that need to be processed
    while (targets.length > 0) {
      // Optimization: if only one target remains, process it directly without randomization
      if (targets.length == 1) {
        targets = targets.flatMap((target) => this._handleTarget(target));
        continue;
      }

      // To avoid deterministic bias in complex circuits with feedback loops or multiple paths,
      // we randomize the order of targets. This ensures that no single path is always 
      // prioritized over others during propagation sessions.
      targets = [...targets];
      targets.sort(() => Math.random() - 0.5);

      // Divide the current targets into two groups: those to be processed immediately
      // and those to be deferred to the next iteration. This "divide and conquer"
      // approach combined with randomization helps in balanced signal distribution.
      const middle = Math.round(targets.length/2);
      const [actualTargets, deferredTargets] = [targets.slice(0, middle), targets.slice(middle)];

      // Process the first half of the targets and collect new targets generated from them
      targets = actualTargets.flatMap((target) => this._handleTarget(target));
      
      // Add the deferred targets back to the queue for the next iteration
      targets.push(...deferredTargets);
    }

    return this._visitedDirtyPorts;
  }

  /**
   * Internal handler for a single target port.
   * Checks for dirty state, increments visit counter, and triggers propagation from the port.
   *
   * @param target - The port to process.
   * @returns An array of next target ports to visit.
   * @throws {InfiniteLoopError} If the visit counter for this target exceeds the limit.
   */
  private _handleTarget(target: PortInterface<TValue>): Array<PortInterface<TValue>> {
    // Only process ports that are marked as dirty (value changed or reset)
    if (target.dirty) {
      // Get and increment the visit counter for this specific port
      const visitedCounter = this._visitedCounters.get(target) ?? 0;
      
      // If the visit limit is reached, it indicates a probable infinite loop in the circuit
      if (visitedCounter > this._visitCounterLimit) {
        throw new InfiniteLoopError(target);
      }
      
      this._visitedCounters.set(target, visitedCounter + 1);
      
      // Track this port as part of the current propagation's affected set
      this._visitedDirtyPorts.add(target);
    }

    // Trigger the port's own propagation logic, which may involve 
    // updating its element and returning downstream target ports.
    return target.propagate();
  }
}

/**
 * Service for resetting the state of elements in a circuit.
 * It traverses the circuit starting from an element's inputs and marks all reachable 
 * ports as "dirty", effectively preparing them for a fresh propagation.
 */
export class ResetElementPropagator<TValue> implements ResetElementPropagatorInterface<TValue> {
  /** Set of ports that have been visited during the current reset process. */
  private readonly _visitedDirtyPorts: Set<PortInterface<TValue>>;

  constructor() {
    this._visitedDirtyPorts = new Set<PortInterface<TValue>>();
  }

  /**
   * Starts the reset process for the given element.
   * Marks all downstream ports as dirty to ensure they will be re-evaluated 
   * during the next signal propagation.
   *
   * @param element - The element to start the reset from.
   */
  public propagate(element: ElementInterface<TValue>): void {
    this._visitedDirtyPorts.clear();

    // Start traversal from the element's input ports
    let targets: PortInterface<TValue>[] = element.inputs;
    
    // Stop traversal when we reach the element's output ports to prevent 
    // escaping the scope of the reset if needed (though it continues through internal connections)
    const stopPorts: Set<PortInterface<TValue>> = new Set(element.outputs);

    while (targets.length > 0) {
      // Process each target and collect its downstream targets
      targets = targets.flatMap((target) => this._handleTarget(target, stopPorts));
    }
  }

  /**
   * Internal handler for a port during the reset traversal.
   * Marks the port as dirty and returns its downstream targets.
   *
   * @param target - The current port being processed.
   * @param stopPorts - A set of ports where the traversal should not continue further.
   * @returns An array of downstream ports to be processed next.
   */
  private _handleTarget(target: PortInterface<TValue>, stopPorts: Set<PortInterface<TValue>>): Array<PortInterface<TValue>> {
    // Avoid redundant processing and infinite loops in circuits with feedback
    if (this._visitedDirtyPorts.has(target)) {
      return [];
    }
    this._visitedDirtyPorts.add(target);

    // Mark the port as dirty so that SignalPropagator will re-evaluate it
    target.makeDirty();

    // If we reached a stop port, we don't look further downstream from it in this step
    if (stopPorts.has(target)) {
      return [];
    }

    // Return the next set of ports to visit
    return target.targets;
  }
}
