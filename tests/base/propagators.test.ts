import { expect, it } from '@jest/globals';
import { BusElement, CompositeElement, NotElement } from "../../src/elements";
import { ResetElementPropagator, SignalPropagator } from "../../src/propagators";
import { InfiniteLoopError } from "../../src/excpetions";
import { BaseConnector } from "../../src/connectors";

it('Base Signal Propagator test', () => {
    const signalPropagator = new SignalPropagator();

    const inputBus = new BusElement(1);
    const notElement = new NotElement();
    const outputBus = new BusElement(1);

    inputBus.init();
    notElement.init();
    outputBus.init();

    inputBus.outputs[0].connect(notElement.inputs[0]);
    signalPropagator.propagate(notElement.inputs);

    notElement.outputs[0].connect(outputBus.inputs[0]);
    signalPropagator.propagate(outputBus.inputs);

    expect(inputBus.outputs[0].value).toEqual(false);
    expect(notElement.outputs[0].value).toEqual(true);
    expect(outputBus.outputs[0].value).toEqual(true);

    outputBus.outputs[0].connect(inputBus.inputs[0]);
    expect(inputBus.inputs[0].value).toEqual(true);

    expect(() => signalPropagator.propagate(inputBus.inputs)).toThrow(InfiniteLoopError);
    try {
      signalPropagator.propagate(inputBus.inputs);
    } catch (e) {
      expect((e as InfiniteLoopError).name).toEqual('InfiniteLoopError');
      expect((e as InfiniteLoopError).message).toEqual('Infinite loop detected');
      expect((e as InfiniteLoopError).connector).toBeInstanceOf(BaseConnector);

      const allConnectors = new Set([...inputBus.inputs, ...inputBus.outputs, ...notElement.inputs, ...notElement.outputs, ...outputBus.inputs, ...outputBus.outputs]);
      expect(allConnectors).toContain((e as InfiniteLoopError).connector);
    }
});
