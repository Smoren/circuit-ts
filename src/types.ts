/**
 * Represents the type of port: 'input' or 'output'.
 */
export type PortDirection = 'input' | 'output';

/**
 * Represents the granularity level of an element.
 */
export type ElementGranularity = 'atomic' | 'composite';

/**
 * Base interface for all ports (ports) of an element.
 * Ports are used to link elements and propagate values.
 */
export interface PortInterface<TValue> {
  /** Current value on the port. */
  value: TValue;
  /** Direction of the port: 'input' or 'output'. */
  readonly direction: PortDirection;
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

export type BaseIdType = string | number;

export type PortDescriptor<TId extends BaseIdType> = {
  readonly id: TId;
  readonly index: number;
}

export type ConnectionDescriptor<TId extends BaseIdType> = {
  readonly id: TId;
  readonly lhs: PortDescriptor<TId>;
  readonly rhs: PortDescriptor<TId>;
}

export type ElementDescriptor<TId extends BaseIdType, TOperation> = {
  readonly id: TId;
  readonly granularity: ElementGranularity;
} & (
  {
    readonly granularity: 'atomic';
    readonly operation: TOperation;
    readonly inputPorts: PortDescriptor<TId>[];
    readonly outputPorts: PortDescriptor<TId>[];
  } | {
    readonly granularity: 'composite';
    readonly inputBus: ElementDescriptor<TId, 'bus'>;
    readonly outputBus: ElementDescriptor<TId, 'bus'>;
    readonly nestedElements: ElementDescriptor<TId, TOperation>[];
    readonly nestedConnections: ConnectionDescriptor<TId>[];
  }
);

export type AtomicElementDescriptorConfig<TId extends BaseIdType, TOperation> = {
  readonly operation: TOperation;
  readonly inputBus: ElementDescriptor<TId, 'bus'>;
  readonly outputBus: ElementDescriptor<TId, 'bus'>;
}

export type CompositeElementDescriptorConfig = {
  readonly inputsCount: number;
  readonly outputCount: number;
}

export interface IdFactoryInterface<TId extends BaseIdType> {
  create(): TId;
}

export interface DescriptorIdFactoryInterface<TId extends BaseIdType> {
  createForElement(): TId;
  createForPort(): TId;
  createForConnection(): TId;
}

export interface DescriptorFactoryInterface<TId extends BaseIdType, TOperation> {
  createAtomicElementDescriptor(config: AtomicElementDescriptorConfig<TId, TOperation>): ElementDescriptor<TId, TOperation>;
  createPortDescriptorCollection(size: number): PortDescriptor<TId>[];
  createConnectionDescriptor(lhs: PortDescriptor<TId>, rhs: PortDescriptor<TId>): ConnectionDescriptor<TId>;
}

export interface CompositeElementDescriptorBuilderInterface<TId extends BaseIdType, TOperation> {
  addElement(element: ElementDescriptor<TId, TOperation>): CompositeElementDescriptorBuilderInterface<TId, TOperation>;
  addElements(elements: ElementDescriptor<TId, TOperation>[]): CompositeElementDescriptorBuilderInterface<TId, TOperation>;

  addConnection(connection: ConnectionDescriptor<TId>): CompositeElementDescriptorBuilderInterface<TId, TOperation>;
  addConnections(connections: ConnectionDescriptor<TId>[]): CompositeElementDescriptorBuilderInterface<TId, TOperation>;

  build(): ElementDescriptor<TId, TOperation>;
}

export interface CircuitRepositoryInterface<TId extends BaseIdType, TOperation, TValue> {
  addElement(descriptor: ElementDescriptor<TId, TOperation>): ElementInterface<TValue>;
  addConnection(identifier: ConnectionDescriptor<TId>): [PortInterface<TValue>, PortInterface<TValue>];

  removeElement(elementId: TId): ElementDescriptor<TId, TOperation>;
  removeConnection(connectionId: TId): ConnectionDescriptor<TId>;

  hasElement(elementId: TId): boolean;
  hasConnection(connectionId: TId): boolean;

  getElement(elementId: TId): ElementInterface<TValue>;
  getElementDescriptor(elementId: TId): ElementDescriptor<TId, TOperation>;

  getElementInputPortDescriptor(elementId: TId, index: number): PortDescriptor<TId>;
  getElementOutputPortDescriptor(elementId: TId, index: number): PortDescriptor<TId>;

  getConnectionDescriptor(connectionId: TId): ConnectionDescriptor<TId>;
}
