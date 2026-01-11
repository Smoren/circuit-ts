import type { CompositeElementInterface, ElementInterface, SignalPropagatorInterface } from "./types";
import { AndElement, BusElement, CompositeElement, NotElement, OrElement } from "./elements";

export class CompositeElementFactory {
  private readonly _signalPropagator: SignalPropagatorInterface;

  constructor(signalPropagator: SignalPropagatorInterface) {
    this._signalPropagator = signalPropagator;
  }

  public createNotOr(inputsCount: number): CompositeElementInterface {
    const inputBus = new BusElement(inputsCount);
    const outputBus = new BusElement(1);

    const orElement = new OrElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      inputBus.outputs[i].connect(orElement.inputs[i]);
    }

    orElement.outputs[0].connect(notElement.inputs[0]);
    notElement.outputs[0].connect(outputBus.inputs[0]);

    const elements = new Set([orElement, notElement]);

    return new CompositeElement(inputBus, outputBus, elements, this._signalPropagator);
  }

  public createNotAnd(inputsCount: number): CompositeElementInterface {
    const inputBus = new BusElement(inputsCount);
    const outputBus = new BusElement(1);

    const andElement = new AndElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      inputBus.outputs[i].connect(andElement.inputs[i]);
    }

    andElement.outputs[0].connect(notElement.inputs[0]);
    notElement.outputs[0].connect(outputBus.inputs[0]);

    const elements = new Set([andElement, notElement]);

    return new CompositeElement(inputBus, outputBus, elements, this._signalPropagator);
  }

  public createRsTriggerNotOrBased(): CompositeElementInterface {
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

    const elements = new Set([notOr1, notOr2]);

    return new CompositeElement(inputBus, outputBus, elements, this._signalPropagator);
  }
}
