import { BusElement, CompositeElement, NotElement } from "../../src/elements";
import { ResetElementPropagator, SignalPropagator } from "../../src/propagators";
import { ConnectionManager } from "../../src/helpers";

it('Base Elements test', () => {
  const connectionManager = new ConnectionManager<boolean>(false);
  const signalPropagator = new SignalPropagator<boolean>();

  const inputBus = new BusElement<boolean>(1, false);
  const notElement = new NotElement();
  const outputBus = new BusElement<boolean>(1, false);

  inputBus.init();
  notElement.init();
  outputBus.init();

  connectionManager.connect(inputBus.outputs[0], notElement.inputs[0]);
  signalPropagator.propagate(notElement.inputs);

  connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);
  signalPropagator.propagate(outputBus.inputs);

  expect(inputBus.outputs[0].value).toEqual(false);
  expect(notElement.outputs[0].value).toEqual(true);
  expect(outputBus.outputs[0].value).toEqual(true);

  inputBus.inputs[0].value = true;
  signalPropagator.propagate(inputBus.inputs);

  expect(inputBus.outputs[0].value).toEqual(true);
  expect(notElement.outputs[0].value).toEqual(false);
  expect(outputBus.outputs[0].value).toEqual(false);

  inputBus.inputs[0].value = false;
  signalPropagator.propagate(inputBus.inputs);

  expect(inputBus.outputs[0].value).toEqual(false);
  expect(notElement.outputs[0].value).toEqual(true);
  expect(outputBus.outputs[0].value).toEqual(true);

  {
    const compositeElement = new CompositeElement<boolean>(inputBus, outputBus, signalPropagator, new ResetElementPropagator<boolean>());

    expect(compositeElement.inputs[0].value).toEqual(false);
    expect(compositeElement.outputs[0].value).toEqual(true);

    compositeElement.inputs[0].value = true;
    signalPropagator.propagate(inputBus.inputs);

    expect(compositeElement.inputs[0].value).toEqual(true);
    expect(compositeElement.outputs[0].value).toEqual(false);

    compositeElement.inputs[0].value = false;
    signalPropagator.propagate(inputBus.inputs);

    expect(compositeElement.inputs[0].value).toEqual(false);
    expect(compositeElement.outputs[0].value).toEqual(true);
  }

  {
    const compositeElement = new CompositeElement<boolean>(inputBus, outputBus, signalPropagator, new ResetElementPropagator<boolean>());
    compositeElement.propagate();

    expect(compositeElement.inputs[0].value).toEqual(false);
    expect(compositeElement.outputs[0].value).toEqual(true);
  }
});
