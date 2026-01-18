import type {
  ConnectionManagerInterface,
  ElementInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { AndElement, BusElement, CompositeElement, NotElement, OrElement } from "./elements";

export class CompositeElementFactory {
  private readonly _connectionManager: ConnectionManagerInterface;
  private readonly _signalPropagator: SignalPropagatorInterface;
  private readonly _resetElementPropagator: ResetElementPropagatorInterface;

  constructor(
    connectionManager: ConnectionManagerInterface,
    signalPropagator: SignalPropagatorInterface,
    resetElementPropagator: ResetElementPropagatorInterface,
  ) {
    this._connectionManager = connectionManager;
    this._signalPropagator = signalPropagator;
    this._resetElementPropagator = resetElementPropagator;
  }

  public createNotOr(inputsCount: number): ElementInterface {
    const inputBus = new BusElement(inputsCount);
    const outputBus = new BusElement(1);

    const orElement = new OrElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      this._connectionManager.connect(inputBus.outputs[i], orElement.inputs[i]);
    }

    this._connectionManager.connect(orElement.outputs[0], notElement.inputs[0]);
    this._connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }

  public createNotAnd(inputsCount: number): ElementInterface {
    const inputBus = new BusElement(inputsCount);
    const outputBus = new BusElement(1);

    const andElement = new AndElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      this._connectionManager.connect(inputBus.outputs[i], andElement.inputs[i]);
    }

    this._connectionManager.connect(andElement.outputs[0], notElement.inputs[0]);
    this._connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }

  public createRsTriggerNotOrBased(): ElementInterface {
    const inputBus = new BusElement(2);
    const outputBus = new BusElement(2);

    const notOr1 = this.createNotOr(2);
    const notOr2 = this.createNotOr(2);

    this._connectionManager.connect(inputBus.outputs[0], notOr1.inputs[0]);
    this._connectionManager.connect(inputBus.outputs[1], notOr2.inputs[0]);

    this._connectionManager.connect(notOr1.outputs[0], notOr2.inputs[1]);
    this._connectionManager.connect(notOr2.outputs[0], notOr1.inputs[1]);

    this._connectionManager.connect(notOr1.outputs[0], outputBus.inputs[0]);
    this._connectionManager.connect(notOr2.outputs[0], outputBus.inputs[1]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }
}
