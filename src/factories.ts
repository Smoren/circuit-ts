import type {
  ElementInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { AndElement, BusElement, CompositeElement, NotElement, OrElement } from "./elements";

export class CompositeElementFactory {
  private readonly _signalPropagator: SignalPropagatorInterface;
  private readonly _resetElementPropagator: ResetElementPropagatorInterface;

  constructor(signalPropagator: SignalPropagatorInterface, resetElementPropagator: ResetElementPropagatorInterface) {
    this._signalPropagator = signalPropagator;
    this._resetElementPropagator = resetElementPropagator;
  }

  public createNotOr(inputsCount: number): ElementInterface {
    const inputBus = new BusElement(inputsCount);
    const outputBus = new BusElement(1);

    const orElement = new OrElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      inputBus.outputs[i].connect(orElement.inputs[i]);
    }

    orElement.outputs[0].connect(notElement.inputs[0]);
    notElement.outputs[0].connect(outputBus.inputs[0]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }

  public createNotAnd(inputsCount: number): ElementInterface {
    const inputBus = new BusElement(inputsCount);
    const outputBus = new BusElement(1);

    const andElement = new AndElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      inputBus.outputs[i].connect(andElement.inputs[i]);
    }

    andElement.outputs[0].connect(notElement.inputs[0]);
    notElement.outputs[0].connect(outputBus.inputs[0]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }

  public createRsTriggerNotOrBased(): ElementInterface {
    const inputBus = new BusElement(2);
    const outputBus = new BusElement(2);

    const notOr1 = this.createNotOr(2);
    const notOr2 = this.createNotOr(2);

    inputBus.outputs[0].connect(notOr1.inputs[0]);
    inputBus.outputs[1].connect(notOr2.inputs[0]);

    notOr1.outputs[0].connect(notOr2.inputs[1]);
    notOr2.outputs[0].connect(notOr1.inputs[1]);

    notOr1.outputs[0].connect(outputBus.inputs[0]);
    notOr2.outputs[0].connect(outputBus.inputs[1]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator, this._resetElementPropagator);
  }
}
