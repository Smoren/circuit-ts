import { expect, it } from '@jest/globals';
import * as circuit from "../../src";

it('Base Boolean Elements test', () => {
  const connectionManager = new circuit.helpers.ConnectionManager<boolean>(false);
  const signalPropagator = new circuit.propagators.SignalPropagator<boolean>();

  const inputBus = new circuit.elements.BusElement<boolean>(1, false);
  const notElement = new circuit.boolean.elements.NotElement();
  const outputBus = new circuit.elements.BusElement<boolean>(1, false);

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
    const compositeElement = new circuit.elements.CompositeElement<boolean>(inputBus, outputBus, signalPropagator, new circuit.propagators.ResetElementPropagator<boolean>());

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
    const compositeElement = new circuit.elements.CompositeElement<boolean>(inputBus, outputBus, signalPropagator, new circuit.propagators.ResetElementPropagator<boolean>());
    compositeElement.propagate();

    expect(compositeElement.inputs[0].value).toEqual(false);
    expect(compositeElement.outputs[0].value).toEqual(true);
  }
});
