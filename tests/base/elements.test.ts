import { expect, it } from '@jest/globals';
import * as circuit from "../../src";

it('Base Boolean Elements test', () => {
  const connectionManager = circuit.boolean.factories.createConnectionManager();
  const signalPropagator = circuit.boolean.factories.createSignalPropagator();

  const inputBus = circuit.boolean.factories.createBusElement(1);
  const notElement = circuit.boolean.factories.createNotElement();
  const outputBus = circuit.boolean.factories.createBusElement(1);

  inputBus.init();
  notElement.init();
  outputBus.init();

  connectionManager.connect(inputBus.outputs[0], notElement.inputs[0]);
  signalPropagator.propagate(notElement.inputs);

  connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);
  signalPropagator.propagate(outputBus.inputs);

  expect(inputBus.composite).toEqual(false);
  expect(notElement.composite).toEqual(false);
  expect(outputBus.composite).toEqual(false);

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

  const compositeFactory = new circuit.boolean.factories.CompositeElementFactory(connectionManager, signalPropagator, circuit.boolean.factories.createResetElementPropagator())

  {
    const compositeElement = compositeFactory.createComposite(inputBus, outputBus);
    expect(compositeElement.composite).toEqual(true);

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
    const compositeElement = compositeFactory.createComposite(inputBus, outputBus);
    compositeElement.propagate();

    expect(compositeElement.inputs[0].value).toEqual(false);
    expect(compositeElement.outputs[0].value).toEqual(true);
  }
});
