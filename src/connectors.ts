import type {
  ConnectorInterface,
  ConnectorType,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
} from "./types";

/**
 * Base abstract class for connectors.
 * Implements common logic for both input and output connectors.
 */
export abstract class BaseConnector<TValue> implements ConnectorInterface<TValue> {
  protected _value: TValue;
  protected _dirty: boolean;
  protected readonly _element: ElementInterface<TValue>;
  protected readonly _index: number;

  /**
   * @param element - The element this connector belongs to.
   * @param index - The index of the connector in the element's connector collection.
   * @param value - Initial value of the connector.
   */
  protected constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    this._value = value;
    this._dirty = true;
    this._element = element;
    this._index = index;
  }

  /**
   * Abstract method for signal propagation. 
   * Implementation depends on whether the connector is an input or an output.
   */
  public abstract propagate(): Array<ConnectorInterface<TValue>>;

  /** Returns the connector type ('input' or 'output'). */
  abstract get type(): ConnectorType;

  /** Returns the list of targets connected to this connector. */
  abstract get targets(): Array<InputConnectorInterface<TValue>>;

  /** Sets the value and marks the connector as dirty if the value has changed. */
  set value(value: TValue) {
    this._dirty ||= this._value !== value;
    this._value = value;
  }

  /** Returns the current value. */
  get value(): TValue {
    return this._value;
  }

  /** Returns true if the connector needs propagation. */
  get dirty(): boolean {
    return this._dirty;
  }

  /** Returns the element this connector belongs to. */
  get element(): ElementInterface<TValue> {
    return this._element;
  }

  /** Returns the index of the connector. */
  get index(): number {
    return this._index;
  }

  /** Forces the connector into a dirty state. */
  public makeDirty() {
    this._dirty = true;
  }
}

/**
 * Concrete implementation of an input connector.
 */
export class InputConnector<TValue> extends BaseConnector<TValue> implements InputConnectorInterface<TValue> {
  readonly type: ConnectorType = 'input';

  /**
   * Constructor for creating an input connector.
   * @param element - The owner element.
   * @param index - Index of the connector within the element.
   * @param value - Initial value of the connector.
   */
  constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    super(element, index, value);
  }

  /**
   * Helper method to create a collection of input connectors.
   * @param element - The owner element.
   * @param size - Number of connectors to create.
   * @param defaultValue - Initial value for each connector.
   */
  public static createCollection<TValue>(element: ElementInterface<TValue>, size: number, defaultValue: TValue): Array<InputConnectorInterface<TValue>> {
    return Array.from({ length: size }, (_, i) => new InputConnector<TValue>(element, i, defaultValue));
  }

  /** Returns the outputs of the owner element as potential targets for propagation. */
  get targets(): Array<InputConnectorInterface<TValue>> {
    return [...this._element.outputs];
  }

  /**
   * Propagates the signal to the owner element.
   * @returns List of connectors that were affected (usually the element's outputs).
   */
  public propagate(): Array<ConnectorInterface<TValue>> {
    if (!this._dirty) {
      return [];
    }
    this._dirty = false;
    return this._element.propagate(this._index);
  }
}

/**
 * Concrete implementation of an output connector.
 */
export class OutputConnector<TValue> extends BaseConnector<TValue> implements OutputConnectorInterface<TValue> {
  readonly type: ConnectorType = 'output';
  private readonly _targets: Set<InputConnectorInterface<TValue>>;

  /**
   * Constructor for creating an output connector.
   * @param element - The owner element.
   * @param index - Index of the connector within the element.
   * @param value - Initial value of the connector.
   */
  constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    super(element, index, value);
    this._targets = new Set();
  }

  /**
   * Helper method to create a collection of output connectors.
   * @param element - The owner element.
   * @param size - Number of connectors to create.
   * @param defaultValue - Initial value for each connector.
   */
  public static createCollection<TValue>(element: ElementInterface<TValue>, size: number, defaultValue: TValue): Array<OutputConnectorInterface<TValue>> {
    return Array.from({ length: size }, (_, i) => new OutputConnector<TValue>(element, i, defaultValue));
  }

  /** Returns the list of connected input connectors. */
  get targets(): Array<InputConnectorInterface<TValue>> {
    return [...this._targets];
  }

  /**
   * Propagates the current value to all connected input connectors.
   * @returns List of input connectors that became dirty after receiving the value.
   */
  public propagate(): Array<ConnectorInterface<TValue>> {
    if (!this._dirty) {
      return [];
    }
    this._dirty = false;

    const result = [];
    for (const target of this._targets) {
      target.value = this._value;
      if (target.dirty) {
        result.push(target);
      }
    }

    return result;
  }

  /** Adds a target input connector. */
  public addTarget(target: InputConnectorInterface<TValue>): void {
    this._targets.add(target);
  }

  /** Removes a target input connector. */
  public removeTarget(target: InputConnectorInterface<TValue>): void {
    this._targets.delete(target);
  }
}
