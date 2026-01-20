import {
  ConnectorInterface,
} from "../types";
import { BaseElement } from "../elements";

/**
 * Represents a logical OR gate.
 * The output is true if at least one input is true.
 */
export class OrElement extends BaseElement<boolean> {
  /**
   * @param inputsCount - Number of input ports for the OR gate.
   */
  constructor(inputsCount: number) {
    super(inputsCount, 1, false);
  }

  /**
   * Recalculates the OR logic.
   * @param index - Index of the input that triggered the update.
   * @returns Affected output connectors.
   */
  public propagate(index?: number): Array<ConnectorInterface<boolean>> {
    this.outputs[0].value = this.inputs.some((input) => input.value);
    return super.propagate();
  }
}

/**
 * Represents a logical AND gate.
 * The output is true if all inputs are true.
 */
export class AndElement extends BaseElement<boolean> {
  /**
   * @param inputsCount - Number of input ports for the AND gate.
   */
  constructor(inputsCount: number) {
    super(inputsCount, 1, false);
  }

  /**
   * Recalculates the AND logic.
   * @param index - Index of the input that triggered the update.
   * @returns Affected output connectors.
   */
  public propagate(index?: number): Array<ConnectorInterface<boolean>> {
    this.outputs[0].value = this.inputs.every((input) => input.value);
    return super.propagate(index);
  }
}

/**
 * Represents a logical NOT gate (inverter).
 * The output is the inverse of the input.
 */
export class NotElement extends BaseElement<boolean> {
  constructor() {
    super(1, 1, false);
  }

  /**
   * Recalculates the NOT logic.
   * @param index - Index of the input that triggered the update.
   * @returns Affected output connectors.
   */
  public propagate(index?: number): Array<ConnectorInterface<boolean>> {
    this.outputs[0].value = !this.inputs[0].value;
    return super.propagate(index);
  }
}
