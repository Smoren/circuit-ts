import type { ConnectorInterface, ElementInterface, InputConnectorInterface, OutputConnectorInterface } from "./types";

export class InputConnector implements InputConnectorInterface {
  private _value: boolean;
  private _dirty: boolean;
  private readonly _element: ElementInterface;
  private readonly _index: number;

  constructor(element: ElementInterface, index: number, dirty: boolean = false) {
    this._value = false;
    this._dirty = dirty;
    this._element = element;
    this._index = index;
  }

  public static createCollection(element: ElementInterface, size: number, dirty: boolean = false): Array<InputConnectorInterface> {
    return Array.from({ length: size }, (_, i) => new InputConnector(element, i, dirty));
  }

  set value(value: boolean) {
    this._dirty = this._value !== value;
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
  private _value: boolean;
  private _dirty: boolean;
  private readonly _targets: Set<InputConnectorInterface>;

  constructor(targets?: Set<InputConnectorInterface>, value: boolean = false) {
    this._value = value;
    this._dirty = false;
    this._targets = targets ?? new Set();
  }

  public static createCollection(size: number): Array<OutputConnectorInterface> {
    return Array.from({ length: size }, () => new OutputConnector());
  }

  set value(value: boolean) {
    this._dirty = this._value !== value;
    this._value = value;
  }

  get value(): boolean {
    return this._value;
  }

  get dirty(): boolean {
    return this._dirty;
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
  }

  public disconnect(target: InputConnectorInterface): void {
    this._targets.delete(target);
  }
}
