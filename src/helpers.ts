import {
  ConnectionManagerInterface,
  ConnectorInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
} from "./types";
import {
  ConnectionNotExistError,
  DuplicateConnectionError,
  InputAlreadyConnectedError,
  InvalidConnectorsPairError,
} from "./exceptions";

/**
 * Helper class for managing connections between connectors.
 * Ensures that connections are valid and prevents duplicate connections.
 */
export class ConnectionManager<TValue> implements ConnectionManagerInterface<TValue> {
  private readonly _defaultValue: TValue;
  private _connectionMap: Map<InputConnectorInterface<TValue>, OutputConnectorInterface<TValue>>;

  /**
   * @param defaultValue - The value to set on an input connector when it is disconnected.
   */
  constructor(defaultValue: TValue) {
    this._defaultValue = defaultValue;
    this._connectionMap = new Map();
  }

  /**
   * Connects an output connector to an input connector.
   * @param lhs - First connector (input or output).
   * @param rhs - Second connector (output or input).
   * @throws {DuplicateConnectionError} If the connection already exists.
   * @throws {InputAlreadyConnectedError} If the input connector is already connected to another output.
   * @throws {InvalidConnectorsPairError} If both connectors are of the same type.
   */
  public connect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void {
    const [outputConnector, inputConnector] = this.getOrderedPair(lhs, rhs);
    if (this._connectionMap.has(inputConnector)) {
      if (this._connectionMap.get(inputConnector) === outputConnector) {
        throw new DuplicateConnectionError<TValue>(inputConnector, outputConnector);
      }
      throw new InputAlreadyConnectedError<TValue>(inputConnector);
    }

    outputConnector.addTarget(inputConnector);
    inputConnector.value = outputConnector.value;

    this._connectionMap.set(inputConnector, outputConnector);
  }

  /**
   * Disconnects an output connector from an input connector.
   * @param lhs - First connector.
   * @param rhs - Second connector.
   * @throws {ConnectionNotExistError} If the connection does not exist.
   * @throws {InvalidConnectorsPairError} If both connectors are of the same type.
   */
  public disconnect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void {
    const [outputConnector, inputConnector] = this.getOrderedPair(lhs, rhs);

    if (!this._connectionMap.has(inputConnector)) {
      throw new ConnectionNotExistError<TValue>(inputConnector, outputConnector);
    }

    outputConnector.removeTarget(inputConnector);
    inputConnector.value = this._defaultValue;

    this._connectionMap.delete(inputConnector);
  }

  /**
   * Helper method to identify which connector is output and which is input.
   * @param lhs - First connector.
   * @param rhs - Second connector.
   * @returns A tuple of [Output, Input].
   * @throws {InvalidConnectorsPairError} If the pair is invalid (e.g., both are inputs).
   */
  private getOrderedPair(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): [OutputConnectorInterface<TValue>, InputConnectorInterface<TValue>] {
    if (lhs.type === 'output' && rhs.type === 'input') {
      return [lhs as OutputConnectorInterface<TValue>, rhs as InputConnectorInterface<TValue>];
    }
    if (lhs.type === 'input' && rhs.type === 'output') {
      return [rhs as OutputConnectorInterface<TValue>, lhs as InputConnectorInterface<TValue>];
    }
    throw new InvalidConnectorsPairError<TValue>(lhs, rhs);
  }
}
