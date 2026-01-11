import { describe, expect, it } from '@jest/globals'
import { CompositeElementFactory } from "../../src/factories";
import { ResetElementPropagator, SignalPropagator } from "../../src/propagators";

describe.each([
  ...dataProviderForNotOrElementStaticTest(),
] as Array<[boolean[], boolean]>)(
  'NotOrElement Static Test',
  (inputValues: boolean[], expectedOutputValue: boolean) => {
    it('', () => {
      const signalPropagator = new SignalPropagator();
      const resetPropagator = new ResetElementPropagator();
      const factory = new CompositeElementFactory(signalPropagator, resetPropagator);

      const notOrElement = factory.createNotOr(inputValues.length);
      const notOrElementOutput = notOrElement.outputs[0];

      notOrElement.init();

      expect(notOrElementOutput.value).toEqual(true);

      for (let i=0; i<inputValues.length; ++i) {
        notOrElement.inputs[i].value = inputValues[i];
      }

      for (let i=0; i<inputValues.length; ++i) {
        notOrElement.propagate(i);
      }

      expect(notOrElementOutput.value).toEqual(expectedOutputValue);
    });
  },
);

describe.each([
  ...dataProviderForNotOrElementDynamicTest(),
] as Array<[number, [number, boolean, boolean][]]>)(
  'NotOrElement Dynamic Test',
  (inputsCount: number, operations: [number, boolean, boolean][]) => {
    it('', () => {
      const signalPropagator = new SignalPropagator();
      const resetPropagator = new ResetElementPropagator();
      const factory = new CompositeElementFactory(signalPropagator, resetPropagator);

      const notOrElement = factory.createNotOr(inputsCount);
      const notOrElementOutput = notOrElement.outputs[0];

      notOrElement.init();

      expect(notOrElementOutput.value).toEqual(true);

      for (const [inputIndex, inputValue, expectedOutputValue] of operations) {
        notOrElement.inputs[inputIndex].value = inputValue;
        notOrElement.propagate(inputIndex);

        expect(notOrElementOutput.value).toEqual(expectedOutputValue);
      }
    });
  },
);

function dataProviderForNotOrElementStaticTest(): Array<[boolean[], boolean]> {
  return [
    [[false], true],
    [[true], false],

    [[false, false], true],
    [[true, false], false],
    [[false, true], false],
    [[true, true], false],

    [[false, false, false], true],
    [[true, false, false], false],
    [[false, true, false], false],
    [[false, false, true], false],
    [[true, true, false], false],
    [[true, false, true], false],
    [[false, true, true], false],
    [[true, true, true], false],
  ];
}

function dataProviderForNotOrElementDynamicTest(): Array<[number, [number, boolean, boolean][]]> {
  return [
    [
      1,
      [[0, true, false], [0, false, true]],
    ],
    [
      1,
      [[0, true, false], [0, true, false], [0, false, true], [0, false, true], [0, true, false], [0, false, true]],
    ],
    [
      2,
      [[0, true, false], [1, true, false], [0, false, false], [1, false, true]],
    ],
    [
      2,
      [[0, true, false], [0, false, true], [1, false, true], [1, true, false], [0, true, false], [0, false, false], [1, true, false], [1, false, true]],
    ],
  ];
}
