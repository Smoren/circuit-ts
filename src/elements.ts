import {
  ConnectorInterface,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { InputConnector, OutputConnector } from "./connectors";

export abstract class BaseElement<TValue> implements ElementInterface<TValue> {
  readonly inputs: Array<InputConnectorInterface<TValue>>;
  readonly outputs: Array<OutputConnectorInterface<TValue>>;

  protected constructor(inputsCount: number, outputsCount: number, defaultValue: TValue) {
    this.inputs = InputConnector.createCollection<TValue>(this, inputsCount, defaultValue);
    this.outputs = OutputConnector.createCollection<TValue>(this, outputsCount, defaultValue);
  }

  public init(): void {
    this.propagate();
  }

  public propagate(index?: number): Array<ConnectorInterface<TValue>> {
    return this.outputs.filter((output) => output.dirty);
  }
}

export class BusElement<TValue> extends BaseElement<TValue> {
  constructor(inputsCount: number, defaultValue: TValue) {
    super(inputsCount, inputsCount, defaultValue);
  }

  public propagate(index?: number): Array<ConnectorInterface<TValue>> {
    if (index === undefined) {
      this._sendAll();
      return super.propagate(index);
    }

    this.outputs[index].value = this.inputs[index].value;
    return [this.outputs[index]];
  }

  private _sendAll(): void {
    for (let i=0; i<this.inputs.length; ++i) {
      this.outputs[i].value = this.inputs[i].value;
    }
  }
}

export class CompositeElement<TValue> implements ElementInterface<TValue> {
  readonly inputs: Array<InputConnectorInterface<TValue>>;
  readonly outputs: Array<OutputConnectorInterface<TValue>>;
  private readonly _signalPropagator: SignalPropagatorInterface<TValue>;
  private readonly _resetPropagator: ResetElementPropagatorInterface<TValue>;
  private _isInited: boolean = false;

  constructor(
    inputBus: BusElement<TValue>,
    outputBus: BusElement<TValue>,
    signalPropagator: SignalPropagatorInterface<TValue>,
    resetPropagator: ResetElementPropagatorInterface<TValue>,
  ) {
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

  public propagate(index?: number): Array<ConnectorInterface<TValue>> {
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

  private _getDirtyOutputs(): Array<ConnectorInterface<TValue>> {
    return this.outputs.filter((output) => output.dirty);
  }
}
