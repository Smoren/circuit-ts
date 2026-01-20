import { expect, it } from '@jest/globals';
import { BusElement, NotElement } from "../../src/elements";
import { SignalPropagator } from "../../src/propagators";
import { InfiniteLoopError } from "../../src/exceptions";
import { BaseConnector } from "../../src/connectors";
import { ConnectionManager } from "../../src/helpers";

it('Base Signal Propagator test', () => {
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

  connectionManager.connect(outputBus.outputs[0], inputBus.inputs[0]);
  expect(inputBus.inputs[0].value).toEqual(true);

  expect(() => signalPropagator.propagate(inputBus.inputs)).toThrow(InfiniteLoopError<boolean>);
  try {
    signalPropagator.propagate(inputBus.inputs);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as InfiniteLoopError<boolean>).name).toEqual('InfiniteLoopError');
    expect((e as InfiniteLoopError<boolean>).message).toEqual('Infinite loop detected');
    expect((e as InfiniteLoopError<boolean>).connector).toBeInstanceOf(BaseConnector<boolean>);

    const allConnectors = new Set([...inputBus.inputs, ...inputBus.outputs, ...notElement.inputs, ...notElement.outputs, ...outputBus.inputs, ...outputBus.outputs]);
    expect(allConnectors).toContain((e as InfiniteLoopError<boolean>).connector);
  }
});
