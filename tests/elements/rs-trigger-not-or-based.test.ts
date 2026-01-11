import { describe, expect, it } from '@jest/globals'
import { CompositeElementFactory } from "../../src/factories";
import { SignalPropagator } from "../../src/propagators";

describe.each([
  ...dataProviderForRsTriggerNotOrBasedDynamicTest(),
] as Array<[[number, boolean, boolean, boolean][]]>)(
  'NotOrBased RS trigger Dynamic Test',
  (operations: [number, boolean, boolean, boolean][]) => {
    it('', () => {
      const signalPropagator = new SignalPropagator();
      const factory = new CompositeElementFactory(signalPropagator);

      const rsTrigger = factory.createRsTriggerNotOrBased();
      rsTrigger.init();

      const [resetInput, setInput] = rsTrigger.inputs;
      const [directOutput, inverseOutput] = rsTrigger.outputs;

      expect(directOutput.value).toEqual(false);
      expect(inverseOutput.value).toEqual(true);

      // for (const [inputIndex, inputValue, expectedOutputValue] of operations) {
      //   notAndElement.inputs[inputIndex].value = inputValue;
      //   notAndElement.propagate(inputIndex);
      //
      //   expect(notAndElementOutput.value).toEqual(expectedOutputValue);
      // }
    });
  },
);


function dataProviderForRsTriggerNotOrBasedDynamicTest(): Array<[[number, boolean, boolean, boolean][]]> {
  return [
    [
      [],
    ],
  ];
}
