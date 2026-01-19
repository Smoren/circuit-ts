import { expect, it } from '@jest/globals';
import { NotElement } from "../../src/elements";
import { ConnectionManager } from "../../src/helpers";
import {
  ConnectionNotExistError,
  DuplicateConnectionError,
  InputAlreadyConnectedError,
  InvalidConnectorsPairError,
} from "../../src/exceptions";

it('Base Connectors test', () => {
  const connectionManager = new ConnectionManager();

  const notElement1 = new NotElement();
  const notElement2 = new NotElement();

  notElement1.init();
  notElement2.init();

  const output = notElement1.outputs[0];
  const input = notElement2.inputs[0];

  expect(output.element).toEqual(notElement1);
  expect(input.element).toEqual(notElement2);

  expect(input.index).toEqual(0);
  expect(output.index).toEqual(0);

  expect(input.name).toEqual(undefined);
  expect(output.name).toEqual(undefined);

  input.name = 'A';
  expect(input.name).toEqual('A');

  expect(output.targets.length).toEqual(0);

  connectionManager.connect(output, input);
  expect(output.targets.length).toEqual(1);

  connectionManager.disconnect(input, output);
  expect(output.targets.length).toEqual(0);
});

it('Base Connector Exceptions test', () => {
  const connectionManager = new ConnectionManager();

  const notElement1 = new NotElement();
  const notElement2 = new NotElement();
  const notElement3 = new NotElement();

  notElement1.init();
  notElement2.init();
  notElement3.init();

  connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0]);

  expect(() => connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0])).toThrow(DuplicateConnectionError);
  try {
    connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as DuplicateConnectionError).name).toEqual("DuplicateConnectionError");
    expect((e as DuplicateConnectionError).inputConnector).toEqual(notElement2.inputs[0]);
    expect((e as DuplicateConnectionError).outputConnector).toEqual(notElement1.outputs[0]);
  }

  expect(() => connectionManager.connect(notElement3.outputs[0], notElement2.inputs[0])).toThrow(InputAlreadyConnectedError);
  try {
    connectionManager.connect(notElement3.outputs[0], notElement2.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as InputAlreadyConnectedError).name).toEqual("InputAlreadyConnectedError");
    expect((e as InputAlreadyConnectedError).inputConnector).toEqual(notElement2.inputs[0]);
  }

  expect(() => connectionManager.connect(notElement1.outputs[0], notElement2.outputs[0])).toThrow(InvalidConnectorsPairError);
  expect(() => connectionManager.connect(notElement1.inputs[0], notElement2.inputs[0])).toThrow(InvalidConnectorsPairError);
  expect(() => connectionManager.disconnect(notElement1.outputs[0], notElement2.outputs[0])).toThrow(InvalidConnectorsPairError);
  expect(() => connectionManager.disconnect(notElement1.inputs[0], notElement2.inputs[0])).toThrow(InvalidConnectorsPairError);
  try {
    connectionManager.connect(notElement1.outputs[0], notElement2.outputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as InvalidConnectorsPairError).name).toEqual("InvalidConnectorsPairError");
    expect((e as InvalidConnectorsPairError).lhsConnector).toEqual(notElement1.outputs[0]);
    expect((e as InvalidConnectorsPairError).rhsConnector).toEqual(notElement2.outputs[0]);
  }

  expect(() => connectionManager.disconnect(notElement2.outputs[0], notElement1.inputs[0])).toThrow(ConnectionNotExistError);
  try {
    connectionManager.disconnect(notElement2.outputs[0], notElement1.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as ConnectionNotExistError).name).toEqual("ConnectionNotExistError");
    expect((e as ConnectionNotExistError).inputConnector).toEqual(notElement1.inputs[0]);
    expect((e as ConnectionNotExistError).outputConnector).toEqual(notElement2.outputs[0]);
  }
});
