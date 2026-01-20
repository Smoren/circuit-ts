import {
  ConnectorInterface,
  ElementInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
  ResetElementPropagatorInterface,
  SignalPropagatorInterface,
} from "./types";
import { InputConnector, OutputConnector } from "./connectors";

/**
 * Base abstract class for logic elements.
 * Provides a foundation for implementing specific logic components.
 */
export abstract class BaseElement<TValue> implements ElementInterface<TValue> {
  /** Collection of input connectors for this element. */
  readonly inputs: Array<InputConnectorInterface<TValue>>;
  /** Collection of output connectors for this element. */
  readonly outputs: Array<OutputConnectorInterface<TValue>>;

  /**
   * @param inputsCount - Number of input ports.
   * @param outputsCount - Number of output ports.
   * @param defaultValue - Initial value for all connectors.
   */
  protected constructor(inputsCount: number, outputsCount: number, defaultValue: TValue) {
    this.inputs = InputConnector.createCollection<TValue>(this, inputsCount, defaultValue);
    this.outputs = OutputConnector.createCollection<TValue>(this, outputsCount, defaultValue);
  }

  /**
   * Performs initial initialization and propagation.
   */
  public init(): void {
    this.propagate();
  }

  /**
   * Recalculates the element state and propagates changes to outputs.
   * Default implementation just returns dirty outputs.
   * @param index - Index of the input connector that triggered the update.
   * @returns List of connectors that were affected.
   */
  public propagate(index?: number): Array<ConnectorInterface<TValue>> {
    return this.outputs.filter((output) => output.dirty);
  }
}

/**
 * An element that acts as a bus, passing signals from inputs to corresponding outputs without modification.
 */
export class BusElement<TValue> extends BaseElement<TValue> {
  /**
   * @param channelsCount - Number of parallel signal channels.
   * @param defaultValue - Initial value for all channels.
   */
  constructor(channelsCount: number, defaultValue: TValue) {
    super(channelsCount, channelsCount, defaultValue);
  }

  /**
   * Propagates signal from inputs to outputs.
   * @param index - Optional index of the single channel to propagate. If undefined, all channels are updated.
   * @returns Affected output connectors.
   */
  public propagate(index?: number): Array<ConnectorInterface<TValue>> {
    if (index === undefined) {
      this._sendAll();
      return super.propagate(index);
    }

    this.outputs[index].value = this.inputs[index].value;
    return [this.outputs[index]];
  }

  /** Updates all outputs with current input values. */
  private _sendAll(): void {
    for (let i=0; i<this.inputs.length; ++i) {
      this.outputs[i].value = this.inputs[i].value;
    }
  }
}

/**
 * An element that encapsulates a complex internal circuit.
 * It uses an internal input bus and output bus to map its external connectors to the internal ones.
 */
export class CompositeElement<TValue> implements ElementInterface<TValue> {
  /** External input connectors. */
  readonly inputs: Array<InputConnectorInterface<TValue>>;
  /** External output connectors. */
  readonly outputs: Array<OutputConnectorInterface<TValue>>;
  private readonly _signalPropagator: SignalPropagatorInterface<TValue>;
  private readonly _resetPropagator: ResetElementPropagatorInterface<TValue>;
  private _isInited: boolean = false;

  /**
   * @param inputBus - The bus that receives signals from external inputs and sends them into the internal circuit.
   * @param outputBus - The bus that collects signals from the internal circuit and sends them to external outputs.
   * @param signalPropagator - Propagator for signal flow within the component.
   * @param resetPropagator - Propagator for resetting the internal state.
   */
  constructor(
    inputBus: BusElement<TValue>,
    outputBus: BusElement<TValue>,
    signalPropagator: SignalPropagatorInterface<TValue>,
    resetPropagator: ResetElementPropagatorInterface<TValue>,
  ) {
    this.inputs = inputBus.inputs;
    this.outputs = outputBus.outputs;
    this._signalPropagator = signalPropagator;
    this._resetPropagator = resetPropagator;
  }

  /** Initializes the internal circuit. */
  public init(): void {
    this._resetPropagator.propagate(this);
    this._isInited = true;
    this.propagate();
  }

  /**
   * Propagates signals through the internal circuit.
   * @param index - Index of the input that changed.
   * @returns Dirty external output connectors.
   */
  public propagate(index?: number): Array<ConnectorInterface<TValue>> {
    if (!this._isInited) {
      this.init();
      return this._getDirtyOutputs();
    }

    const inputs = index === undefined ? this.inputs : [this.inputs[index]];
    this._signalPropagator.propagate(inputs);
    return this._getDirtyOutputs();
  }

  /** Returns all output connectors that have a dirty state. */
  private _getDirtyOutputs(): Array<ConnectorInterface<TValue>> {
    return this.outputs.filter((output) => output.dirty);
  }
}
