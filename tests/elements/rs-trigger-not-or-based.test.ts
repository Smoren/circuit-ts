import { describe, expect, it } from '@jest/globals';
import * as circuit from "../../src";

describe.each([
  ...dataProviderForRsTriggerNotOrBasedDynamicTest(),
] as Array<[[number, boolean, boolean, boolean][]]>)(
  'NotOrBased RS trigger Dynamic Test',
  (operations: [number, boolean, boolean, boolean][]) => {
    it('', () => {
      const connectionManager = new circuit.helpers.ConnectionManager<boolean>(false);
      const signalPropagator = new circuit.propagators.SignalPropagator<boolean>();
      const resetPropagator = new circuit.propagators.ResetElementPropagator<boolean>();
      const factory = new circuit.boolean.factories.CompositeElementFactory(connectionManager, signalPropagator, resetPropagator);

      const rsTrigger = factory.createRsTriggerNotOrBased();

      rsTrigger.init();

      const [directOutput, inverseOutput] = rsTrigger.outputs;
      expect(directOutput.value).not.toEqual(inverseOutput.value);

      for (const [inputIndex, inputValue, expectedDirectOutputValue, expectedInverseOutputValue] of operations) {
        rsTrigger.inputs[inputIndex].value = inputValue;
        rsTrigger.propagate(inputIndex);

        expect(directOutput.value).toEqual(expectedDirectOutputValue);
        expect(inverseOutput.value).toEqual(expectedInverseOutputValue);
      }
    });
  },
);

function dataProviderForRsTriggerNotOrBasedDynamicTest(): Array<[[number, boolean, boolean, boolean][]]> {
  return [
    [
      [
        [0, true, false, true],     // R(1) => Q = 0
        [0, false, false, true],    // R(0) => Q = 0 (const)
        [1, true, true, false],     // S(1) => Q = 1
        [1, false, true, false],    // S(1) => Q = 1 (const)
        [0, true, false, true],     // R(1) => Q = 0
        [0, false, false, true],    // R(0) => Q = 0 (const)
        [0, true, false, true],     // R(1) => Q = 0
        [0, false, false, true],    // R(0) => Q = 0 (const)
      ],
    ],
    [
      [
        [1, true, true, false],      // S(1) => Q = 1
        [1, false, true, false],     // S(1) => Q = 1 (const)
        [0, true, false, true],      // R(1) => Q = 0
        [0, false, false, true],     // R(0) => Q = 0 (const)
        [1, true, true, false],      // S(1) => Q = 1
        [1, false, true, false],     // S(1) => Q = 1 (const)
        [1, true, true, false],      // S(1) => Q = 1
        [1, false, true, false],     // S(1) => Q = 1 (const)
      ],
    ],
    [
      [
        [0, true, false, true],     // R(1) => Q = 0
        [1, true, false, false],    // S(1) => forbidden state (Q = !Q = 0)
        [1, false, false, true],    // S(0) => Q = 0
        [0, false, false, true],    // R(0) => Q = 0 (const)
        [1, true, true, false],     // S(1) => Q = 1
      ],
    ],
    [
      [
        [1, true, true, false],     // S(1) => Q = 1
        [0, true, false, false],    // R(1) => forbidden state (Q = !Q = 0)
        [0, false, true, false],    // R(0) => Q = 1
        [1, false, true, false],    // S(0) => Q = 1 (const)
        [0, true, false, true],     // R(1) => Q = 0
      ],
    ],
  ];
}
