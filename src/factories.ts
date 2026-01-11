import type { ElementInterface, SignalPropagatorInterface } from "./types";
import { AndElement, BusElement, CompositeElement, NotElement, OrElement } from "./elements";

export class CompositeElementFactory {
  private readonly _signalPropagator: SignalPropagatorInterface;

  constructor(signalPropagator: SignalPropagatorInterface) {
    this._signalPropagator = signalPropagator;
  }

  public createNotOr(inputsCount: number): ElementInterface {
    const inputBus = new BusElement(inputsCount, true);
    const outputBus = new BusElement(1);

    const orElement = new OrElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      inputBus.outputs[i].connect(orElement.inputs[i]);
    }

    orElement.outputs[0].connect(notElement.inputs[0]);
    notElement.outputs[0].connect(outputBus.inputs[0]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator);
  }

  public createNotAnd(inputsCount: number): ElementInterface {
    const inputBus = new BusElement(inputsCount, true);
    const outputBus = new BusElement(1);

    const andElement = new AndElement(inputsCount);
    const notElement = new NotElement();

    for (let i=0; i<inputsCount; ++i) {
      inputBus.outputs[i].connect(andElement.inputs[i]);
    }

    andElement.outputs[0].connect(notElement.inputs[0]);
    notElement.outputs[0].connect(outputBus.inputs[0]);

    return new CompositeElement(inputBus, outputBus, this._signalPropagator);
  }
}
