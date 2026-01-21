import { expect, it } from '@jest/globals';
import * as circuit from "../../src";

it('Base Signal Propagator test', () => {
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

  expect(inputBus.outputs[0].value).toEqual(false);
  expect(notElement.outputs[0].value).toEqual(true);
  expect(outputBus.outputs[0].value).toEqual(true);

  connectionManager.connect(outputBus.outputs[0], inputBus.inputs[0]);
  expect(inputBus.inputs[0].value).toEqual(true);

  expect(() => signalPropagator.propagate(inputBus.inputs)).toThrow(circuit.exceptions.InfiniteLoopError<boolean>);
  try {
    signalPropagator.propagate(inputBus.inputs);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as circuit.exceptions.InfiniteLoopError<boolean>).name).toEqual('InfiniteLoopError');
    expect((e as circuit.exceptions.InfiniteLoopError<boolean>).message).toEqual('Infinite loop detected');
    expect((e as circuit.exceptions.InfiniteLoopError<boolean>).port).toBeInstanceOf(circuit.ports.BasePort<boolean>);

    const allPorts = new Set([...inputBus.inputs, ...inputBus.outputs, ...notElement.inputs, ...notElement.outputs, ...outputBus.inputs, ...outputBus.outputs]);
    expect(allPorts).toContain((e as circuit.exceptions.InfiniteLoopError<boolean>).port);
  }
});
