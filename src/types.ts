/**
 * Represents the type of a port: 'input' or 'output'.
 */
export type PortType = 'input' | 'output';

/**
 * Base interface for all ports (ports) of an element.
 * Ports are used to link elements and propagate values.
 */
export interface PortInterface<TValue> {
  /** Current value on the port. */
  value: TValue;
  /** Type of the port: 'input' or 'output'. */
  readonly type: PortType;
  /** Indicates if the port's value has changed and needs propagation. */
  readonly dirty: boolean;
  /** The element this port belongs to. */
  readonly element: ElementInterface<TValue>;
  /** Index of the port in the element's input or output collection. */
  readonly index: number;
  /** List of input ports that receive signal from this port. */
  readonly targets: Array<InputPortInterface<TValue>>;
  /**
   * Propagates the signal from this port.
   * @returns A list of downstream ports that were affected by the propagation.
   */
  propagate(): Array<PortInterface<TValue>>;
  /** Marks the port as dirty, forcing its re-evaluation in the next propagation. */
  makeDirty(): void;
}

/**
 * Interface for input ports.
 */
export interface InputPortInterface<TValue> extends PortInterface<TValue> {}

/**
 * Interface for output ports.
 */
export interface OutputPortInterface<TValue> extends PortInterface<TValue> {
  /**
   * Connects an input port to this output.
   * @param port - The input port to add as a target.
   */
  addTarget(port: InputPortInterface<TValue>): void;
  /**
   * Disconnects an input port from this output.
   * @param port - The input port to remove.
   */
  removeTarget(port: InputPortInterface<TValue>): void;
}

/**
 * Represents a logic element or a circuit component.
 */
export interface ElementInterface<TValue> {
  /** Collection of input ports. */
  readonly inputs: Array<InputPortInterface<TValue>>;
  /** Collection of output ports. */
  readonly outputs: Array<OutputPortInterface<TValue>>;
  /** Indicates whether the element is a composite element, containing other elements. */
  readonly composite: boolean;
  /** Initializes the element's internal state and performs initial propagation. */
  init(): void;
  /**
   * Recalculates the element's logic and propagates changes to outputs.
   * @param index - Optional index of the input port that triggered the propagation.
   * @returns A list of affected ports.
   */
  propagate(index?: number): Array<PortInterface<TValue>>;
}

/**
 * Interface for services that handle signal propagation across the circuit.
 */
export interface SignalPropagatorInterface<TValue> {
  /**
   * Propagates signals starting from the given target ports.
   * @param targets - Ports to start propagation from.
   * @returns A set of all ports that were involved in the propagation.
   */
  propagate(targets: PortInterface<TValue>[]): Set<PortInterface<TValue>>;
}

/**
 * Interface for services that reset or initialize the circuit state.
 */
export interface ResetElementPropagatorInterface<TValue> {
  /**
   * Recursively marks ports downstream from the element as dirty.
   * @param element - The element to start resetting from.
   */
  propagate(element: ElementInterface<TValue>): void;
}

/**
 * Interface for managing connections between ports.
 */
export interface ConnectionManagerInterface<TValue> {
  /**
   * Creates a connection between two ports.
   * One must be an output and the other an input.
   * @param lhs - First port.
   * @param rhs - Second port.
   * @throws {DuplicateConnectionError} If a connection already exists between the given ports.
   * @throws {InvalidPortsPairError} If the ports are of incompatible types.
   */
  connect(lhs: PortInterface<TValue>, rhs: PortInterface<TValue>): void;
  /**
   * Removes a connection between two ports.
   * @param lhs - First port.
   * @param rhs - Second port.
   * @throws {ConnectionNotExistError} If there is no connection between the given ports.
   */
  disconnect(lhs: PortInterface<TValue>, rhs: PortInterface<TValue>): void;
}
