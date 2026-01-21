import { expect, it } from '@jest/globals';
import * as circuit from "../../src";

it('Base Ports test', () => {
  const connectionManager = circuit.boolean.factories.createConnectionManager();

  const notElement1 = circuit.boolean.factories.createNotElement();
  const notElement2 = circuit.boolean.factories.createNotElement();

  notElement1.init();
  notElement2.init();

  const output = notElement1.outputs[0];
  const input = notElement2.inputs[0];

  expect(output.element).toEqual(notElement1);
  expect(input.element).toEqual(notElement2);

  expect(input.index).toEqual(0);
  expect(output.index).toEqual(0);

  expect(output.targets.length).toEqual(0);

  connectionManager.connect(output, input);
  expect(output.targets.length).toEqual(1);

  connectionManager.disconnect(input, output);
  expect(output.targets.length).toEqual(0);
});

it('Base Port Exceptions test', () => {
  const connectionManager = circuit.boolean.factories.createConnectionManager();

  const notElement1 = circuit.boolean.factories.createNotElement();
  const notElement2 = circuit.boolean.factories.createNotElement();
  const notElement3 = circuit.boolean.factories.createNotElement();

  notElement1.init();
  notElement2.init();
  notElement3.init();

  connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0]);

  expect(() => connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0])).toThrow(circuit.exceptions.DuplicateConnectionError<boolean>);
  try {
    connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as circuit.exceptions.DuplicateConnectionError<boolean>).name).toEqual("DuplicateConnectionError");
    expect((e as circuit.exceptions.DuplicateConnectionError<boolean>).inputPort).toEqual(notElement2.inputs[0]);
    expect((e as circuit.exceptions.DuplicateConnectionError<boolean>).outputPort).toEqual(notElement1.outputs[0]);
  }

  expect(() => connectionManager.connect(notElement3.outputs[0], notElement2.inputs[0])).toThrow(circuit.exceptions.InputAlreadyConnectedError<boolean>);
  try {
    connectionManager.connect(notElement3.outputs[0], notElement2.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as circuit.exceptions.InputAlreadyConnectedError<boolean>).name).toEqual("InputAlreadyConnectedError");
    expect((e as circuit.exceptions.InputAlreadyConnectedError<boolean>).inputPort).toEqual(notElement2.inputs[0]);
  }

  expect(() => connectionManager.connect(notElement1.outputs[0], notElement2.outputs[0])).toThrow(circuit.exceptions.InvalidPortsPairError<boolean>);
  expect(() => connectionManager.connect(notElement1.inputs[0], notElement2.inputs[0])).toThrow(circuit.exceptions.InvalidPortsPairError<boolean>);
  expect(() => connectionManager.disconnect(notElement1.outputs[0], notElement2.outputs[0])).toThrow(circuit.exceptions.InvalidPortsPairError<boolean>);
  expect(() => connectionManager.disconnect(notElement1.inputs[0], notElement2.inputs[0])).toThrow(circuit.exceptions.InvalidPortsPairError<boolean>);
  try {
    connectionManager.connect(notElement1.outputs[0], notElement2.outputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as circuit.exceptions.InvalidPortsPairError<boolean>).name).toEqual("InvalidPortsPairError");
    expect((e as circuit.exceptions.InvalidPortsPairError<boolean>).lhsPort).toEqual(notElement1.outputs[0]);
    expect((e as circuit.exceptions.InvalidPortsPairError<boolean>).rhsPort).toEqual(notElement2.outputs[0]);
  }

  expect(() => connectionManager.disconnect(notElement2.outputs[0], notElement1.inputs[0])).toThrow(circuit.exceptions.ConnectionNotExistError<boolean>);
  try {
    connectionManager.disconnect(notElement2.outputs[0], notElement1.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as circuit.exceptions.ConnectionNotExistError<boolean>).name).toEqual("ConnectionNotExistError");
    expect((e as circuit.exceptions.ConnectionNotExistError<boolean>).inputPort).toEqual(notElement1.inputs[0]);
    expect((e as circuit.exceptions.ConnectionNotExistError<boolean>).outputPort).toEqual(notElement2.outputs[0]);
  }
});
