import type { ConnectorInterface, ElementInterface, InputConnectorInterface, OutputConnectorInterface } from "./types";
import { InputConnector, OutputConnector } from "./connectors";

export abstract class BaseElement implements ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;

  protected constructor(inputsCount: number, outputsCount: number) {
    this.inputs = InputConnector.createCollection(this, inputsCount);
    this.outputs = OutputConnector.createCollection(outputsCount);
  }

  propagate(index: number): Array<ConnectorInterface> {
    return this.outputs.filter((output) => output.dirty);
  }
}

export class OrElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, 1);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.some((input) => input.value);
    return super.propagate(index);
  }
}

export class BusElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, inputsCount);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[index].value = this.inputs[index].value;
    return super.propagate(index);
  }
}

export class AndElement extends BaseElement {
  constructor(inputsCount: number) {
    super(inputsCount, 1);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[0].value = this.inputs.every((input) => input.value);
    return super.propagate(index);
  }
}

export class NotElement extends BaseElement {
  constructor() {
    super(1, 1);
  }

  propagate(index: number): Array<ConnectorInterface> {
    this.outputs[0].value = !this.inputs[0].value;
    return super.propagate(index);
  }
}
