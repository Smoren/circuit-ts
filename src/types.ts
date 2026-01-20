/**
 * Represents the type of a connector: 'input' or 'output'.
 */
export type ConnectorType = 'input' | 'output';

/**
 * Base interface for all connectors (ports) of an element.
 * Connectors are used to link elements and propagate values.
 */
export interface ConnectorInterface<TValue> {
  /** Current value on the connector. */
  value: TValue;
  /** Type of the connector: 'input' or 'output'. */
  readonly type: ConnectorType;
  /** Indicates if the connector's value has changed and needs propagation. */
  readonly dirty: boolean;
  /** The element this connector belongs to. */
  readonly element: ElementInterface<TValue>;
  /** Index of the connector in the element's input or output collection. */
  readonly index: number;
  /** List of input connectors that receive signal from this connector. */
  readonly targets: Array<InputConnectorInterface<TValue>>;
  /**
   * Propagates the signal from this connector.
   * @returns A list of downstream connectors that were affected by the propagation.
   */
  propagate(): Array<ConnectorInterface<TValue>>;
  /** Marks the connector as dirty, forcing its re-evaluation in the next propagation. */
  makeDirty(): void;
}

/**
 * Interface for input connectors.
 */
export interface InputConnectorInterface<TValue> extends ConnectorInterface<TValue> {}

/**
 * Interface for output connectors.
 */
export interface OutputConnectorInterface<TValue> extends ConnectorInterface<TValue> {
  /**
   * Connects an input connector to this output.
   * @param connector - The input connector to add as a target.
   */
  addTarget(connector: InputConnectorInterface<TValue>): void;
  /**
   * Disconnects an input connector from this output.
   * @param connector - The input connector to remove.
   */
  removeTarget(connector: InputConnectorInterface<TValue>): void;
}

/**
 * Represents a logic element or a circuit component.
 */
export interface ElementInterface<TValue> {
  /** Collection of input connectors. */
  readonly inputs: Array<InputConnectorInterface<TValue>>;
  /** Collection of output connectors. */
  readonly outputs: Array<OutputConnectorInterface<TValue>>;
  /** Initializes the element's internal state and performs initial propagation. */
  init(): void;
  /**
   * Recalculates the element's logic and propagates changes to outputs.
   * @param index - Optional index of the input connector that triggered the propagation.
   * @returns A list of affected connectors.
   */
  propagate(index?: number): Array<ConnectorInterface<TValue>>;
}

/**
 * Interface for services that handle signal propagation across the circuit.
 */
export interface SignalPropagatorInterface<TValue> {
  /**
   * Propagates signals starting from the given target connectors.
   * @param targets - Connectors to start propagation from.
   * @returns A set of all connectors that were involved in the propagation.
   */
  propagate(targets: ConnectorInterface<TValue>[]): Set<ConnectorInterface<TValue>>;
}

/**
 * Interface for services that reset or initialize the circuit state.
 */
export interface ResetElementPropagatorInterface<TValue> {
  /**
   * Recursively marks connectors downstream from the element as dirty.
   * @param element - The element to start resetting from.
   */
  propagate(element: ElementInterface<TValue>): void;
}

/**
 * Interface for managing connections between connectors.
 */
export interface ConnectionManagerInterface<TValue> {
  /**
   * Creates a connection between two connectors.
   * One must be an output and the other an input.
   * @param lhs - First connector.
   * @param rhs - Second connector.
   * @throws {DuplicateConnectionError} If a connection already exists between the given connectors.
   * @throws {InvalidConnectorsPairError} If the connectors are of incompatible types.
   */
  connect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void;
  /**
   * Removes a connection between two connectors.
   * @param lhs - First connector.
   * @param rhs - Second connector.
   * @throws {ConnectionNotExistError} If there is no connection between the given connectors.
   */
  disconnect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void;
}
