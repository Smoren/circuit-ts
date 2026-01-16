import { describe, expect, it } from '@jest/globals';
import { AndElement } from "../../src/elements";

describe.each([
  ...dataProviderForAndElementStaticTest(),
] as Array<[boolean[], boolean]>)(
  'AndElement Static Test',
  (inputValues: boolean[], expectedOutputValue: boolean) => {
    it('', () => {
      const andElement = new AndElement(inputValues.length);
      const andElementOutput = andElement.outputs[0];

      expect(andElementOutput.value).toEqual(false);

      for (let i=0; i<inputValues.length; ++i) {
        andElement.inputs[i].value = inputValues[i];
      }

      andElement.propagate();

      expect(andElementOutput.value).toEqual(expectedOutputValue);
    });
  },
);

describe.each([
  ...dataProviderForAndElementDynamicTest(),
] as Array<[number, [number, boolean, boolean][]]>)(
  'OrElement Dynamic Test',
  (inputsCount: number, operations: [number, boolean, boolean][]) => {
    it('', () => {
      const andElement = new AndElement(inputsCount);
      const andElementOutput = andElement.outputs[0];

      expect(andElementOutput.value).toEqual(false);

      for (const [inputIndex, inputValue, expectedOutputValue] of operations) {
        andElement.inputs[inputIndex].value = inputValue;
        andElement.propagate(inputIndex);

        expect(andElementOutput.value).toEqual(expectedOutputValue);
      }
    });
  },
);

function dataProviderForAndElementStaticTest(): Array<[boolean[], boolean]> {
  return [
    [[false], false],
    [[true], true],

    [[false, false], false],
    [[true, false], false],
    [[false, true], false],
    [[true, true], true],

    [[false, false, false], false],
    [[true, false, false], false],
    [[false, true, false], false],
    [[false, false, true], false],
    [[true, true, false], false],
    [[true, false, true], false],
    [[false, true, true], false],
    [[true, true, true], true],
  ];
}

function dataProviderForAndElementDynamicTest(): Array<[number, [number, boolean, boolean][]]> {
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
