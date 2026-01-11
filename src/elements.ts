import {
  ConnectorInterface,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { InputConnector, OutputConnector } from "./connectors";

export abstract class BaseElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;

  protected constructor(inputsCount: number, outputsCount: number) {
    this.inputs = InputConnector.createCollection(this, inputsCount);
    this.outputs = OutputConnector.createCollection(this, outputsCount);
  }

  public init(): Array<ConnectorInterface> {
    return [];
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    return this.outputs.filter((output) => output.dirty);
  }
}

export class OrElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, 1);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.some((input) => input.value);
    return super.propagate();
  }
}

export class BusElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, inputsCount);
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

export class AndElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, 1);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.every((input) => input.value);
    return super.propagate(index);
  }
}

export class NotElement extends BaseElement {
  constructor() {
    super(1, 1);
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    this.outputs[0].value = !this.inputs[0].value;
    return super.propagate(index);
  }
}

export class CompositeElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  private readonly _signalPropagator: SignalPropagatorInterface;
  private readonly _resetPropagator: ResetElementPropagatorInterface;
  private _isInited: boolean = false;

  constructor(
    inputBus: BusElement,
    outputBus: BusElement,
    signalPropagator: SignalPropagatorInterface,
    resetPropagator: ResetElementPropagatorInterface,
  ) {
    this.inputs = inputBus.inputs;
    this.outputs = outputBus.outputs;
    this._signalPropagator = signalPropagator;
    this._resetPropagator = resetPropagator;
    // this.init();
  }

  public init(): Array<ConnectorInterface> {
    this._resetPropagator.propagate(this);
    this._isInited = true;
    return this.propagate();
  }

  public propagate(index?: number): Array<ConnectorInterface> {
    if (!this._isInited) {
      return this.init();
    }

    const inputs = index === undefined ? this.inputs : [this.inputs[index]];
    this._signalPropagator.propagate(inputs);
    return this.outputs.filter((output) => output.dirty);
  }
}
