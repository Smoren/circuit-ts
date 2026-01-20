import type {
  ConnectorInterface,
  ConnectorType,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
} from "./types";

export abstract class BaseConnector<TValue> implements ConnectorInterface<TValue> {
  protected _value: TValue;
  protected _dirty: boolean;
  protected readonly _element: ElementInterface<TValue>;
  protected readonly _index: number;

  protected constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    this._value = value;
    this._dirty = true;
    this._element = element;
    this._index = index;
  }

  public abstract propagate(): Array<ConnectorInterface<TValue>>;

  abstract get type(): ConnectorType;

  abstract get targets(): Array<InputConnectorInterface<TValue>>;

  set value(value: TValue) {
    this._dirty ||= this._value !== value;
    this._value = value;
  }

  get value(): TValue {
    return this._value;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get element(): ElementInterface<TValue> {
    return this._element;
  }

  get index(): number {
    return this._index;
  }

  public makeDirty() {
    this._dirty = true;
  }
}

export class InputConnector<TValue> extends BaseConnector<TValue> implements InputConnectorInterface<TValue> {
  readonly type: ConnectorType = 'input';

  constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    super(element, index, value);
  }

  public static createCollection<TValue>(element: ElementInterface<TValue>, size: number, defaultValue: TValue): Array<InputConnectorInterface<TValue>> {
    return Array.from({ length: size }, (_, i) => new InputConnector<TValue>(element, i, defaultValue));
  }

  get targets(): Array<InputConnectorInterface<TValue>> {
    return [...this._element.outputs];
  }

  public propagate(): Array<ConnectorInterface<TValue>> {
    if (!this._dirty) {
      return [];
    }
    this._dirty = false;
    return this._element.propagate(this._index);
  }
}

export class OutputConnector<TValue> extends BaseConnector<TValue> implements OutputConnectorInterface<TValue> {
  readonly type: ConnectorType = 'output';
  private readonly _targets: Set<InputConnectorInterface<TValue>>;

  constructor(element: ElementInterface<TValue>, index: number, value: TValue) {
    super(element, index, value);
    this._targets = new Set();
  }

  public static createCollection<TValue>(element: ElementInterface<TValue>, size: number, defaultValue: TValue): Array<OutputConnectorInterface<TValue>> {
    return Array.from({ length: size }, (_, i) => new OutputConnector<TValue>(element, i, defaultValue));
  }

  get targets(): Array<InputConnectorInterface<TValue>> {
    return [...this._targets];
  }

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

  public addTarget(target: InputConnectorInterface<TValue>): void {
    this._targets.add(target);
  }

  public removeTarget(target: InputConnectorInterface<TValue>): void {
    this._targets.delete(target);
  }
}
