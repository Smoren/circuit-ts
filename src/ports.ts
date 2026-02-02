import type {
  PortInterface,
  PortDirection,
  ElementInterface,
  InputPortInterface,
  OutputPortInterface,
} from "./types";

/**
 * Base abstract class for ports.
 * Implements common logic for both input and output ports.
 */
export abstract class BasePort<TValue> implements PortInterface<TValue> {
  protected _value: TValue;
  protected _dirty: boolean;
  protected readonly _element: ElementInterface<TValue>;
  protected readonly _index: number;

  /**
   * @param element - The element this port belongs to.
   * @param index - The index of the port in the element's port collection.
   * @param value - Initial value of the port.
   */
  protected constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    this._value = value;
    this._dirty = true;
    this._element = element;
    this._index = index;
  }

  /**
   * Abstract method for signal propagation. 
   * Implementation depends on whether the port is an input or an output.
   */
  public abstract propagate(): Array<PortInterface<TValue>>;

  /** Returns the port direction ('input' or 'output'). */
  abstract get direction(): PortDirection;

  /** Returns the list of targets connected to this port. */
  abstract get targets(): Array<InputPortInterface<TValue>>;

  /** Sets the value and marks the port as dirty if the value has changed. */
  set value(value: TValue) {
    this._dirty ||= this._value !== value;
    this._value = value;
  }

  /** Returns the current value. */
  get value(): TValue {
    return this._value;
  }

  /** Returns true if the port needs propagation. */
  get dirty(): boolean {
    return this._dirty;
  }

  /** Returns the element this port belongs to. */
  get element(): ElementInterface<TValue> {
    return this._element;
  }

  /** Returns the index of the port. */
  get index(): number {
    return this._index;
  }

  /** Forces the port into a dirty state. */
  public makeDirty() {
    this._dirty = true;
  }
}

/**
 * Concrete implementation of an input port.
 */
export class InputPort<TValue> extends BasePort<TValue> implements InputPortInterface<TValue> {
  readonly direction: PortDirection = 'input';

  /**
   * Constructor for creating an input port.
   * @param element - The owner element.
   * @param index - Index of the port within the element.
   * @param value - Initial value of the port.
   */
  constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    super(element, index, value);
  }

  /**
   * Helper method to create a collection of input ports.
   * @param element - The owner element.
   * @param size - Number of ports to create.
   * @param defaultValue - Initial value for each port.
   */
  public static createCollection<TValue>(element: ElementInterface<TValue>, size: number, defaultValue: TValue): Array<InputPortInterface<TValue>> {
    return Array.from({ length: size }, (_, i) => new InputPort<TValue>(element, i, defaultValue));
  }

  /** Returns the outputs of the owner element as potential targets for propagation. */
  get targets(): Array<InputPortInterface<TValue>> {
    return [...this._element.outputs];
  }

  /**
   * Propagates the signal to the owner element.
   * @returns List of ports that were affected (usually the element's outputs).
   */
  public propagate(): Array<PortInterface<TValue>> {
    if (!this._dirty) {
      return [];
    }
    this._dirty = false;
    return this._element.propagate(this._index);
  }
}

/**
 * Concrete implementation of an output port.
 */
export class OutputPort<TValue> extends BasePort<TValue> implements OutputPortInterface<TValue> {
  readonly direction: PortDirection = 'output';
  private readonly _targets: Set<InputPortInterface<TValue>>;

  /**
   * Constructor for creating an output port.
   * @param element - The owner element.
   * @param index - Index of the port within the element.
   * @param value - Initial value of the port.
   */
  constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    super(element, index, value);
    this._targets = new Set();
  }

  /**
   * Helper method to create a collection of output ports.
   * @param element - The owner element.
   * @param size - Number of ports to create.
   * @param defaultValue - Initial value for each port.
   */
  public static createCollection<TValue>(element: ElementInterface<TValue>, size: number, defaultValue: TValue): Array<OutputPortInterface<TValue>> {
    return Array.from({ length: size }, (_, i) => new OutputPort<TValue>(element, i, defaultValue));
  }

  /** Returns the list of connected input ports. */
  get targets(): Array<InputPortInterface<TValue>> {
    return [...this._targets];
  }

  /**
   * Propagates the current value to all connected input ports.
   * @returns List of input ports that became dirty after receiving the value.
   */
  public propagate(): Array<PortInterface<TValue>> {
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

  /** Adds a target input port. */
  public addTarget(target: InputPortInterface<TValue>): void {
    this._targets.add(target);
  }

  /** Removes a target input port. */
  public removeTarget(target: InputPortInterface<TValue>): void {
    this._targets.delete(target);
  }
}
