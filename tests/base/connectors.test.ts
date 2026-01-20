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
  const connectionManager = new ConnectionManager<boolean>(false);

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

  expect(output.targets.length).toEqual(0);

  connectionManager.connect(output, input);
  expect(output.targets.length).toEqual(1);

  connectionManager.disconnect(input, output);
  expect(output.targets.length).toEqual(0);
});

it('Base Connector Exceptions test', () => {
  const connectionManager = new ConnectionManager<boolean>(false);

  const notElement1 = new NotElement();
  const notElement2 = new NotElement();
  const notElement3 = new NotElement();

  notElement1.init();
  notElement2.init();
  notElement3.init();

  connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0]);

  expect(() => connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0])).toThrow(DuplicateConnectionError<boolean>);
  try {
    connectionManager.connect(notElement1.outputs[0], notElement2.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as DuplicateConnectionError<boolean>).name).toEqual("DuplicateConnectionError");
    expect((e as DuplicateConnectionError<boolean>).inputConnector).toEqual(notElement2.inputs[0]);
    expect((e as DuplicateConnectionError<boolean>).outputConnector).toEqual(notElement1.outputs[0]);
  }

  expect(() => connectionManager.connect(notElement3.outputs[0], notElement2.inputs[0])).toThrow(InputAlreadyConnectedError<boolean>);
  try {
    connectionManager.connect(notElement3.outputs[0], notElement2.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as InputAlreadyConnectedError<boolean>).name).toEqual("InputAlreadyConnectedError");
    expect((e as InputAlreadyConnectedError<boolean>).inputConnector).toEqual(notElement2.inputs[0]);
  }

  expect(() => connectionManager.connect(notElement1.outputs[0], notElement2.outputs[0])).toThrow(InvalidConnectorsPairError<boolean>);
  expect(() => connectionManager.connect(notElement1.inputs[0], notElement2.inputs[0])).toThrow(InvalidConnectorsPairError<boolean>);
  expect(() => connectionManager.disconnect(notElement1.outputs[0], notElement2.outputs[0])).toThrow(InvalidConnectorsPairError<boolean>);
  expect(() => connectionManager.disconnect(notElement1.inputs[0], notElement2.inputs[0])).toThrow(InvalidConnectorsPairError<boolean>);
  try {
    connectionManager.connect(notElement1.outputs[0], notElement2.outputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as InvalidConnectorsPairError<boolean>).name).toEqual("InvalidConnectorsPairError");
    expect((e as InvalidConnectorsPairError<boolean>).lhsConnector).toEqual(notElement1.outputs[0]);
    expect((e as InvalidConnectorsPairError<boolean>).rhsConnector).toEqual(notElement2.outputs[0]);
  }

  expect(() => connectionManager.disconnect(notElement2.outputs[0], notElement1.inputs[0])).toThrow(ConnectionNotExistError<boolean>);
  try {
    connectionManager.disconnect(notElement2.outputs[0], notElement1.inputs[0]);
    expect(true).toEqual(false);
  } catch (e) {
    expect((e as ConnectionNotExistError<boolean>).name).toEqual("ConnectionNotExistError");
    expect((e as ConnectionNotExistError<boolean>).inputConnector).toEqual(notElement1.inputs[0]);
    expect((e as ConnectionNotExistError<boolean>).outputConnector).toEqual(notElement2.outputs[0]);
  }
});
