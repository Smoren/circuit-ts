import { describe, expect, it } from '@jest/globals'
import { CompositeElementFactory } from "../../src/factories";
import { ResetElementPropagator, SignalPropagator } from "../../src/propagators";

describe.each([
  ...dataProviderForNotAndElementStaticTest(),
] as Array<[boolean[], boolean]>)(
  'NotAndElement Static Test',
  (inputValues: boolean[], expectedOutputValue: boolean) => {
    it('', () => {
      const signalPropagator = new SignalPropagator();
      const resetPropagator = new ResetElementPropagator();
      const factory = new CompositeElementFactory(signalPropagator, resetPropagator);

      const notAndElement = factory.createNotAnd(inputValues.length);
      const notAndElementOutput = notAndElement.outputs[0];

      notAndElement.init();

      expect(notAndElementOutput.value).toEqual(true);

      for (let i=0; i<inputValues.length; ++i) {
        notAndElement.inputs[i].value = inputValues[i];
      }

      notAndElement.propagate();

      expect(notAndElementOutput.value).toEqual(expectedOutputValue);
    });
  },
);

describe.each([
  ...dataProviderForNotAndElementDynamicTest(),
] as Array<[number, [number, boolean, boolean][]]>)(
  'NotAndElement Dynamic Test',
  (inputsCount: number, operations: [number, boolean, boolean][]) => {
    it('', () => {
      const signalPropagator = new SignalPropagator();
      const resetPropagator = new ResetElementPropagator();
      const factory = new CompositeElementFactory(signalPropagator, resetPropagator);

      const notAndElement = factory.createNotAnd(inputsCount);
      const notAndElementOutput = notAndElement.outputs[0];

      notAndElement.init();

      expect(notAndElementOutput.value).toEqual(true);

      for (const [inputIndex, inputValue, expectedOutputValue] of operations) {
        notAndElement.inputs[inputIndex].value = inputValue;
        notAndElement.propagate(inputIndex);

        expect(notAndElementOutput.value).toEqual(expectedOutputValue);
      }
    });
  },
);

function dataProviderForNotAndElementStaticTest(): Array<[boolean[], boolean]> {
  return [
    [[false], true],
    [[true], false],

    [[false, false], true],
    [[true, false], true],
    [[false, true], true],
    [[true, true], false],

    [[false, false, false], true],
    [[true, false, false], true],
    [[false, true, false], true],
    [[false, false, true], true],
    [[true, true, false], true],
    [[true, false, true], true],
    [[false, true, true], true],
    [[true, true, true], false],
  ];
}

function dataProviderForNotAndElementDynamicTest(): Array<[number, [number, boolean, boolean][]]> {
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
      [[0, true, true], [1, true, false], [0, false, true], [1, false, true]],
    ],
    [
      2,
      [[0, true, true], [0, false, true], [1, false, true], [1, true, true], [0, true, false], [0, false, true], [1, true, true], [1, false, true]],
    ],
  ];
}
