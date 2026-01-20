import type {
  ConnectionManagerInterface,
  ElementInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { AndElement, BusElement, CompositeElement, NotElement, OrElement } from "./elements";

export class BooleanCompositeElementFactory {
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

    return new CompositeElement<boolean>(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
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

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
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

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }
}
