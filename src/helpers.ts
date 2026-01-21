import {
  ConnectionManagerInterface,
  PortInterface,
  InputPortInterface,
  OutputPortInterface,
} from "./types";
import {
  ConnectionNotExistError,
  DuplicateConnectionError,
  InputAlreadyConnectedError,
  InvalidPortsPairError,
} from "./exceptions";

/**
 * Helper class for managing connections between ports.
 * Ensures that connections are valid and prevents duplicate connections.
 */
export class ConnectionManager<TValue> implements ConnectionManagerInterface<TValue> {
  private readonly _defaultValue: TValue;
  private _connectionMap: Map<InputPortInterface<TValue>, OutputPortInterface<TValue>>;

  /**
   * @param defaultValue - The value to set on an input port when it is disconnected.
   */
  constructor(defaultValue: TValue) {
    this._defaultValue = defaultValue;
    this._connectionMap = new Map();
  }

  /**
   * Connects an output port to an input port.
   * @param lhs - First port (input or output).
   * @param rhs - Second port (output or input).
   * @throws {DuplicateConnectionError} If the connection already exists.
   * @throws {InputAlreadyConnectedError} If the input port is already connected to another output.
   * @throws {InvalidPortsPairError} If both ports are of the same type.
   */
  public connect(lhs: PortInterface<TValue>, rhs: PortInterface<TValue>): void {
    const [outputPort, inputPort] = this.getOrderedPair(lhs, rhs);
    if (this._connectionMap.has(inputPort)) {
      if (this._connectionMap.get(inputPort) === outputPort) {
        throw new DuplicateConnectionError<TValue>(inputPort, outputPort);
      }
      throw new InputAlreadyConnectedError<TValue>(inputPort);
    }

    outputPort.addTarget(inputPort);
    inputPort.value = outputPort.value;

    this._connectionMap.set(inputPort, outputPort);
  }

  /**
   * Disconnects an output port from an input port.
   * @param lhs - First port.
   * @param rhs - Second port.
   * @throws {ConnectionNotExistError} If the connection does not exist.
   * @throws {InvalidPortsPairError} If both ports are of the same type.
   */
  public disconnect(lhs: PortInterface<TValue>, rhs: PortInterface<TValue>): void {
    const [outputPort, inputPort] = this.getOrderedPair(lhs, rhs);

    if (!this._connectionMap.has(inputPort)) {
      throw new ConnectionNotExistError<TValue>(inputPort, outputPort);
    }

    outputPort.removeTarget(inputPort);
    inputPort.value = this._defaultValue;

    this._connectionMap.delete(inputPort);
  }

  /**
   * Helper method to identify which port is output and which is input.
   * @param lhs - First port.
   * @param rhs - Second port.
   * @returns A tuple of [Output, Input].
   * @throws {InvalidPortsPairError} If the pair is invalid (e.g., both are inputs).
   */
  private getOrderedPair(lhs: PortInterface<TValue>, rhs: PortInterface<TValue>): [OutputPortInterface<TValue>, InputPortInterface<TValue>] {
    if (lhs.type === 'output' && rhs.type === 'input') {
      return [lhs as OutputPortInterface<TValue>, rhs as InputPortInterface<TValue>];
    }
    if (lhs.type === 'input' && rhs.type === 'output') {
      return [rhs as OutputPortInterface<TValue>, lhs as InputPortInterface<TValue>];
    }
    throw new InvalidPortsPairError<TValue>(lhs, rhs);
  }
}
