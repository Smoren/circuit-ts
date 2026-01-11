import { describe, expect, it } from '@jest/globals'
import { AndElement } from "../../src/elements";
import { CompositeElementFactory } from "../../src/factories";
import { SignalPropagator } from "../../src/propagators";

describe.each([
  ...dataProviderForNotAndElementStaticTest(),
] as Array<[boolean[], boolean]>)(
  'NotAndElement Static Test',
  (inputValues: boolean[], expectedOutputValue: boolean) => {
    it('', () => {
      const signalPropagator = new SignalPropagator();
      const factory = new CompositeElementFactory(signalPropagator);

      const notAndElement = factory.createNotAnd(inputValues.length);
      const notAndElementOutput = notAndElement.outputs[0];

      expect(notAndElementOutput.value).toEqual(false);

      for (let i=0; i<inputValues.length; ++i) {
        notAndElement.inputs[i].value = inputValues[i];
      }

      for (let i=0; i<inputValues.length; ++i) {
        notAndElement.propagate(i);
      }

      expect(notAndElementOutput.value).toEqual(expectedOutputValue);
    });
  },
);

// describe.each([
//   ...dataProviderForNotAndElementDynamicTest(),
// ] as Array<[number, [number, boolean, boolean][]]>)(
//   'NotAndElement Dynamic Test',
//   (inputsCount: number, operations: [number, boolean, boolean][]) => {
//     it('', () => {
//       const andElement = new AndElement(inputsCount);
//       const andElementOutput = andElement.outputs[0];
//
//       expect(andElementOutput.value).toEqual(false);
//
//       for (const [inputIndex, inputValue, expectedOutputValue] of operations) {
//         andElement.inputs[inputIndex].value = inputValue;
//         andElement.propagate(inputIndex);
//
//         expect(andElementOutput.value).toEqual(expectedOutputValue);
//       }
//     });
//   },
// );

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
      [[0, true, true], [0, false, false]],
    ],
    [
      1,
      [[0, true, true], [0, true, true], [0, false, false], [0, false, false], [0, true, true], [0, false, false]],
    ],
    [
      2,
      [[0, true, false], [1, true, true], [0, false, false], [1, false, false]],
    ],
    [
      2,
      [[0, true, false], [0, false, false], [1, false, false], [1, true, false], [0, true, true], [0, false, false], [1, true, false], [1, false, false]],
    ],
  ];
}
