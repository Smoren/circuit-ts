import { expect, it } from '@jest/globals';
import { BusElement, CompositeElement, NotElement } from "../../src/elements";
import { ResetElementPropagator, SignalPropagator } from "../../src/propagators";

it('Base Elements test', () => {
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
        const compositeElement = new CompositeElement(inputBus, outputBus, signalPropagator, new ResetElementPropagator());

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
        const compositeElement = new CompositeElement(inputBus, outputBus, signalPropagator, new ResetElementPropagator());
        compositeElement.propagate();

        expect(compositeElement.inputs[0].value).toEqual(false);
        expect(compositeElement.outputs[0].value).toEqual(true);
    }
});
