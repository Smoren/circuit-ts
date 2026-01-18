import { expect, it } from '@jest/globals';
import { NotElement } from "../../src/elements";
import { ConnectionManager } from "../../src/helpers";

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

  expect(output.targets.length).toEqual(0);

  connectionManager.connect(output, input);
  expect(output.targets.length).toEqual(1);

  connectionManager.disconnect(output, input);
  expect(output.targets.length).toEqual(0);
});
