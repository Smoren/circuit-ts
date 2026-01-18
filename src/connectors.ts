import type {
  ConnectorInterface,
  ConnectorType,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
} from "./types";

let ID_COUNTER = 1;

export abstract class BaseConnector implements ConnectorInterface {
  protected _id: number;
  protected _value: boolean;
  protected _dirty: boolean;
  protected readonly _element: ElementInterface;
  protected readonly _index: number;

  protected constructor(element: ElementInterface, index: number) {
    this._id = ID_COUNTER++;
    this._value = false;
    this._dirty = true;
    this._element = element;
    this._index = index;
  }

  public abstract propagate(): Array<ConnectorInterface>;

  abstract get type(): ConnectorType;

  abstract get targets(): Array<InputConnectorInterface>;

  set value(value: boolean) {
    this._dirty ||= this._value !== value;
    this._value = value;
  }

  get value(): boolean {
    return this._value;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get element(): ElementInterface {
    return this._element;
  }

  get index(): number {
    return this._index;
  }

  public makeDirty() {
    this._dirty = true;
  }
}

export class InputConnector extends BaseConnector implements InputConnectorInterface {
  readonly type: ConnectorType = 'input';

  constructor(element: ElementInterface, index: number) {
    super(element, index);
  }

  public static createCollection(element: ElementInterface, size: number): Array<InputConnectorInterface> {
    return Array.from({ length: size }, (_, i) => new InputConnector(element, i));
  }

  get targets(): Array<InputConnectorInterface> {
    return [...this._element.outputs];
  }

  public propagate(): Array<ConnectorInterface> {
    if (!this._dirty) {
      return [];
    }
    this._dirty = false;
    return this._element.propagate(this._index);
  }
}

export class OutputConnector extends BaseConnector implements OutputConnectorInterface {
  readonly type: ConnectorType = 'output';
  private readonly _targets: Set<InputConnectorInterface>;

  constructor(element: ElementInterface, index: number) {
    super(element, index);
    this._targets = new Set();
  }

  public static createCollection(element: ElementInterface, size: number): Array<OutputConnectorInterface> {
    return Array.from({ length: size }, (_, i) => new OutputConnector(element, i));
  }

  get targets(): Array<InputConnectorInterface> {
    return [...this._targets];
  }

  public propagate(): Array<ConnectorInterface> {
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

  public connect(target: InputConnectorInterface): void {
    this._targets.add(target);
    // target.value = this.value;
  }

  public disconnect(target: InputConnectorInterface): void {
    // TODO нужен ConnectionManager, чтобы избежать подключения 2-х линков к одному входу (либо предусмотреть обработку)
    this._targets.delete(target);
    // target.value = false;
  }
}
