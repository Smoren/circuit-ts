import { expect, it } from '@jest/globals';
import * as circuit from "../../src";

it('Base Signal Propagator test', () => {
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

  connectionManager.connect(outputBus.outputs[0], inputBus.inputs[0]);
  expect(inputBus.inputs[0].value).toEqual(true);

  expect(() => signalPropagator.propagate(inputBus.inputs)).toThrow(circuit.exceptions.InfiniteLoopError<boolean>);
  try {
    signalPropagator.propagate(inputBus.inputs);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as circuit.exceptions.InfiniteLoopError<boolean>).name).toEqual('InfiniteLoopError');
    expect((e as circuit.exceptions.InfiniteLoopError<boolean>).message).toEqual('Infinite loop detected');
    expect((e as circuit.exceptions.InfiniteLoopError<boolean>).connector).toBeInstanceOf(circuit.connectors.BaseConnector<boolean>);

    const allConnectors = new Set([...inputBus.inputs, ...inputBus.outputs, ...notElement.inputs, ...notElement.outputs, ...outputBus.inputs, ...outputBus.outputs]);
    expect(allConnectors).toContain((e as circuit.exceptions.InfiniteLoopError<boolean>).connector);
  }
});
