import type {
  ConnectorInterface, ElementInterface, InputConnectorInterface, OutputConnectorInterface,
  SignalPropagatorInterface,
} from "./types";
import { InputConnector, OutputConnector } from "./connectors";

export abstract class BaseElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;

  protected constructor(inputsCount: number, outputsCount: number) {
    this.inputs = InputConnector.createCollection(this, inputsCount);
    this.outputs = OutputConnector.createCollection(outputsCount);
  }

  propagate(index: number): Array<ConnectorInterface> {
    return this.outputs.filter((output) => output.dirty);
  }
}

export class OrElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, 1);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.some((input) => input.value);
    return super.propagate(index);
  }
}

export class BusElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, inputsCount);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[index].value = this.inputs[index].value;
    return super.propagate(index);
  }
}

export class AndElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, 1);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.every((input) => input.value);
    return super.propagate(index);
  }
}

export class NotElement extends BaseElement {
  constructor() {
    super(1, 1);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[0].value = !this.inputs[0].value;
    return super.propagate(index);
  }
}

export class CompositeElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  private readonly _signalPropagator: SignalPropagatorInterface;

  constructor(
    inputBus: BusElement,
    outputBus: BusElement,
    signalPropagator: SignalPropagatorInterface,
  ) {
    this.inputs = inputBus.inputs;
    this.outputs = outputBus.outputs;
    this._signalPropagator = signalPropagator;

    for (const input of this.inputs) {
      this._signalPropagator.propagate(input);
    }
  }

  public propagate(index: number): Array<ConnectorInterface> {
    const input = this.inputs[index];

    const dirtyConnectors: Set<ConnectorInterface> = this._signalPropagator.propagate(input);
    const outputConnectors: Set<ConnectorInterface> = new Set(this.outputs);

    const result = []

    for (const connector of dirtyConnectors) {
      if (outputConnectors.has(connector)) {
        result.push(connector);
      }
    }

    return result;
  }
}
