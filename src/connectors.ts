import type { ConnectorInterface, ElementInterface, InputConnectorInterface, OutputConnectorInterface } from "./types";

let ID_COUNTER = 1;

export class InputConnector implements InputConnectorInterface {
  private _id: number;
  private _value: boolean;
  private _dirty: boolean;
  private readonly _element: ElementInterface;
  private readonly _index: number;

  constructor(element: ElementInterface, index: number) {
    this._id = ID_COUNTER++;
    this._value = false;
    this._dirty = true;
    this._element = element;
    this._index = index;
  }

  public static createCollection(element: ElementInterface, size: number): Array<InputConnectorInterface> {
    return Array.from({ length: size }, (_, i) => new InputConnector(element, i));
  }

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

  public propagate(): Array<ConnectorInterface> {
    if (!this._dirty) {
      return [];
    }
    this._dirty = false;
    return this._element.propagate(this._index);
  }
}

export class OutputConnector implements OutputConnectorInterface {
  private _id: number;
  private _value: boolean;
  private _dirty: boolean;
  private readonly _targets: Set<InputConnectorInterface>;

  constructor(targets?: Set<InputConnectorInterface>) {
    this._id = ID_COUNTER++;
    this._value = false;
    this._dirty = true;
    this._targets = targets ?? new Set();
  }

  public static createCollection(size: number): Array<OutputConnectorInterface> {
    return Array.from({ length: size }, () => new OutputConnector());
  }

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

  get targets(): Array<InputConnectorInterface> {
    return [...this._targets];
  }

  public propagate(): Array<ConnectorInterface> {
    if (!this._dirty) {
      return [];
    }
    // this._dirty = false;
    this._dirty = this._targets.size == 0;

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
    target.value = this.value;
  }

  public disconnect(target: InputConnectorInterface): void {
    // TODO нужен ConnectionManager, чтобы избежать подключения 2-х линков к одному входу (либо предусмотреть обработку)
    this._targets.delete(target);
    target.value = false;
  }
}
