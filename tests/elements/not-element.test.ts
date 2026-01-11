import { describe, expect, it } from '@jest/globals'
import { NotElement } from "../../src/elements";

describe.each([
  ...dataProviderForNotElementDynamicTest(),
] as Array<[[boolean, boolean][]]>)(
  'NotElement Dynamic Test',
  (operations: [boolean, boolean][]) => {
    it('', () => {
      const notElement = new NotElement();
      const notElementOutput = notElement.outputs[0];

      expect(notElementOutput.value).toEqual(false);

      for (const [inputValue, expectedOutputValue] of operations) {
        notElement.inputs[0].value = inputValue;
        notElement.propagate(0);

        expect(notElementOutput.value).toEqual(expectedOutputValue);
      }
    });
  },
);

function dataProviderForNotElementDynamicTest(): Array<[[boolean, boolean][]]> {
  return [
    [
      [[true, false], [false, true]],
    ],
    [
      [[true, false], [true, false], [false, true], [false, true]],
    ],
    [
      [[true, false], [false, true], [true, false], [false, true]],
    ],
  ];
}
