import type {
  ConnectionManagerInterface,
  ElementInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "../types";
import { BusElement, CompositeElement } from "../elements";
import { AndElement, NotElement, OrElement } from "./elements";
import { ConnectionManager } from "../helpers";
import { ResetElementPropagator, SignalPropagator } from "../propagators";

export class CompositeElementFactory {
  private readonly _connectionManager: ConnectionManagerInterface<boolean>;
  private readonly _signalPropagator: SignalPropagatorInterface<boolean>;
  private readonly _resetElementPropagator: ResetElementPropagatorInterface<boolean>;

  constructor(
    connectionManager: ConnectionManagerInterface<boolean>,
    signalPropagator: SignalPropagatorInterface<boolean>,
    resetElementPropagator: ResetElementPropagatorInterface<boolean>,
  ) {
    this._connectionManager = connectionManager;
    this._signalPropagator = signalPropagator;
    this._resetElementPropagator = resetElementPropagator;
  }

  public createComposite(inputBus: BusElement<boolean>, outputBus: BusElement<boolean>): ElementInterface<boolean> {
    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }

  public createNotOr(inputsCount: number): ElementInterface<boolean> {
    const inputBus = new BusElement(inputsCount, false);
    const outputBus = new BusElement(1, false);

    const orElement = new OrElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      this._connectionManager.connect(inputBus.outputs[i], orElement.inputs[i]);
    }

    this._connectionManager.connect(orElement.outputs[0], notElement.inputs[0]);
    this._connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);

    return this.createComposite(inputBus, outputBus);
  }

  public createNotAnd(inputsCount: number): ElementInterface<boolean> {
    const inputBus = new BusElement<boolean>(inputsCount, false);
    const outputBus = new BusElement<boolean>(1, false);

    const andElement = new AndElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      this._connectionManager.connect(inputBus.outputs[i], andElement.inputs[i]);
    }

    this._connectionManager.connect(andElement.outputs[0], notElement.inputs[0]);
    this._connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);

    return this.createComposite(inputBus, outputBus);
  }

  public createRsTriggerNotOrBased(): ElementInterface<boolean> {
    const inputBus = new BusElement<boolean>(2, false);
    const outputBus = new BusElement<boolean>(2, false);

    const notOr1 = this.createNotOr(2);
    const notOr2 = this.createNotOr(2);

    this._connectionManager.connect(inputBus.outputs[0], notOr1.inputs[0]);
    this._connectionManager.connect(inputBus.outputs[1], notOr2.inputs[0]);

    this._connectionManager.connect(notOr1.outputs[0], notOr2.inputs[1]);
    this._connectionManager.connect(notOr2.outputs[0], notOr1.inputs[1]);

    this._connectionManager.connect(notOr1.outputs[0], outputBus.inputs[0]);
    this._connectionManager.connect(notOr2.outputs[0], outputBus.inputs[1]);

    return this.createComposite(inputBus, outputBus);
  }
}

export function createConnectionManager(): ConnectionManagerInterface<boolean> {
  return new ConnectionManager<boolean>(false);
}

export function createSignalPropagator(): SignalPropagatorInterface<boolean> {
  return new SignalPropagator<boolean>();
}

export function createResetElementPropagator(): ResetElementPropagatorInterface<boolean> {
  return new ResetElementPropagator<boolean>();
}

export function createBusElement(channelsCount: number): BusElement<boolean> {
  return new BusElement(channelsCount, false);
}

export function createOrElement(inputsCount: number): OrElement {
  return new OrElement(inputsCount);
}

export function createAndElement(inputsCount: number): AndElement {
  return new AndElement(inputsCount);
}

export function createNotElement(): NotElement {
  return new NotElement();
}
