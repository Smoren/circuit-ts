import {
  ConnectorInterface,
} from "../types";
import { BaseElement } from "../elements";

export class OrElement extends BaseElement<boolean> {
  constructor(inputsCount: number) {
    super(inputsCount, 1, false);
  }

  public propagate(index?: number): Array<ConnectorInterface<boolean>> {
    this.outputs[0].value = this.inputs.some((input) => input.value);
    return super.propagate();
  }
}

export class AndElement extends BaseElement<boolean> {
  constructor(inputsCount: number) {
    super(inputsCount, 1, false);
  }

  public propagate(index?: number): Array<ConnectorInterface<boolean>> {
    this.outputs[0].value = this.inputs.every((input) => input.value);
    return super.propagate(index);
  }
}

export class NotElement extends BaseElement<boolean> {
  constructor() {
    super(1, 1, false);
  }

  public propagate(index?: number): Array<ConnectorInterface<boolean>> {
    this.outputs[0].value = !this.inputs[0].value;
    return super.propagate(index);
  }
}
