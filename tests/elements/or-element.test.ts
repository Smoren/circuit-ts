import { describe, expect, it } from '@jest/globals'
import { OrElement } from "../../src/elements";

describe.each([
  ...dataProviderForOrElementStaticTest(),
] as Array<[boolean[], boolean]>)(
  'OrElement Static Test',
  (inputValues: boolean[], expectedOutputValue: boolean) => {
    it('', () => {
      const orElement = new OrElement(inputValues.length);
      const orElementOutput = orElement.outputs[0];

      expect(orElementOutput.value).toEqual(false);

      for (let i=0; i<inputValues.length; ++i) {
        orElement.inputs[i].value = inputValues[i];
      }

      for (let i=0; i<inputValues.length; ++i) {
        orElement.propagate(i);
      }

      expect(orElementOutput.value).toEqual(expectedOutputValue);
    });
  },
);

describe.each([
  ...dataProviderForOrElementDynamicTest(),
] as Array<[number, [number, boolean, boolean][]]>)(
  'OrElement Dynamic Test',
  (inputsCount: number, operations: [number, boolean, boolean][]) => {
    it('', () => {
      const orElement = new OrElement(inputsCount);
      const orElementOutput = orElement.outputs[0];

      expect(orElementOutput.value).toEqual(false);

      for (const [inputIndex, inputValue, expectedOutputValue] of operations) {
        orElement.inputs[inputIndex].value = inputValue;
        orElement.propagate(inputIndex);

        expect(orElementOutput.value).toEqual(expectedOutputValue);
      }
    });
  },
);

function dataProviderForOrElementStaticTest(): Array<[boolean[], boolean]> {
  return [
    [[false], false],
    [[true], true],

    [[false, false], false],
    [[true, false], true],
    [[false, true], true],
    [[true, true], true],

    [[false, false, false], false],
    [[true, false, false], true],
    [[false, true, false], true],
    [[false, false, true], true],
    [[true, true, false], true],
    [[true, false, true], true],
    [[false, true, true], true],
    [[true, true, true], true],
  ];
}

function dataProviderForOrElementDynamicTest(): Array<[number, [number, boolean, boolean][]]> {
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
      [[0, true, true], [1, true, true], [0, false, true], [1, false, false]],
    ],
    [
      2,
      [[0, true, true], [0, false, false], [1, false, false], [0, false, false], [1, true, true], [0, false, true], [1, false, false]],
    ],
  ];
}
