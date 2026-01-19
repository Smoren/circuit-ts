import {
  ConnectorInterface,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { InputConnector, OutputConnector } from "./connectors";
import { NAME_AND, NAME_NOT, NAME_OR } from "./constants";

export abstract class BaseElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  protected _name: string;

  protected constructor(name: string, inputsCount: number, outputsCount: number) {
    this._name = name;
    this.inputs = InputConnector.createCollection(this, inputsCount);
    this.outputs = OutputConnector.createCollection(this, outputsCount);
  }

  public init(): void {
    this.propagate();
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    return this.outputs.filter((output) => output.dirty);
  }

  set name(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }
}

export class OrElement extends BaseElement {
  constructor(inputsCount: number) {
    super(NAME_OR, inputsCount, 1);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.some((input) => input.value);
    return super.propagate();
  }
}

export class AndElement extends BaseElement {
  constructor(inputsCount: number) {
    super(NAME_AND, inputsCount, 1);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.every((input) => input.value);
    return super.propagate(index);
  }
}

export class NotElement extends BaseElement {
  constructor() {
    super(NAME_NOT, 1, 1);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    this.outputs[0].value = !this.inputs[0].value;
    return super.propagate(index);
  }
}

export class BusElement extends BaseElement {
  constructor(name: string, inputsCount: number) {
    super(name, inputsCount, inputsCount);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    if (index === undefined) {
      this._sendAll();
      return super.propagate(index);
    }

    this.outputs[index].value = this.inputs[index].value;
    return [this.outputs[index]];
  }

  private _sendAll() {
    for (let i=0; i<this.inputs.length; ++i) {
      this.outputs[i].value = this.inputs[i].value;
    }
  }
}

export class CompositeElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  protected _name: string;
  private readonly _signalPropagator: SignalPropagatorInterface;
  private readonly _resetPropagator: ResetElementPropagatorInterface;
  private _isInited: boolean = false;

  constructor(
    name: string,
    inputBus: BusElement,
    outputBus: BusElement,
    signalPropagator: SignalPropagatorInterface,
    resetPropagator: ResetElementPropagatorInterface,
  ) {
    this._name = name;
    this.inputs = inputBus.inputs;
    this.outputs = outputBus.outputs;
    this._signalPropagator = signalPropagator;
    this._resetPropagator = resetPropagator;
    // this.init();
  }

  public init(): void {
    this._resetPropagator.propagate(this);
    this._isInited = true;
    this.propagate();
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    // TODO возможно принимать пропагатор на вход, добавлять в него инпуты как дополнительные таргеты (их придется хранить в атрибуте пропагатора).
    // а возможно и не нужно собирать вложенные выходы, потому что они будут скрыты подкат, а при открытии детализации автоматом обновлять все на экране.
    if (!this._isInited) {
      this.init();
      return this._getDirtyOutputs();
    }

    const inputs = index === undefined ? this.inputs : [this.inputs[index]];
    this._signalPropagator.propagate(inputs);
    return this._getDirtyOutputs();
  }

  set name(name: string) {
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  private _getDirtyOutputs(): Array<ConnectorInterface> {
    return this.outputs.filter((output) => output.dirty);
  }
}
