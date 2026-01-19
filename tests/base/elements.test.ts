import { expect, it } from '@jest/globals';
import { BusElement, CompositeElement, NotElement } from "../../src/elements";
import { ResetElementPropagator, SignalPropagator } from "../../src/propagators";
import { ConnectionManager } from "../../src/helpers";
import { NAME_INPUT_BUS, NAME_NOT, NAME_OUTPUT_BUS } from "../../src/constants";

it('Base Elements test', () => {
  const connectionManager = new ConnectionManager();
  const signalPropagator = new SignalPropagator();

  const inputBus = new BusElement(NAME_INPUT_BUS, 1);
  const notElement = new NotElement();
  const outputBus = new BusElement(NAME_OUTPUT_BUS, 1);

  expect(inputBus.name).toEqual(NAME_INPUT_BUS);
  expect(notElement.name).toEqual(NAME_NOT);
  expect(outputBus.name).toEqual(NAME_OUTPUT_BUS);

  inputBus.name = "TEST";
  expect(inputBus.name).toEqual("TEST");

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
    const compositeElement = new CompositeElement("TEST", inputBus, outputBus, signalPropagator, new ResetElementPropagator());

    expect(compositeElement.name).toEqual("TEST");

    compositeElement.name = "NEW";
    expect(compositeElement.name).toEqual("NEW");

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
    const compositeElement = new CompositeElement("TEST", inputBus, outputBus, signalPropagator, new ResetElementPropagator());
    compositeElement.propagate();

    expect(compositeElement.inputs[0].value).toEqual(false);
    expect(compositeElement.outputs[0].value).toEqual(true);
  }
});
