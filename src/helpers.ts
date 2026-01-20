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

export class ConnectionManager<TValue> implements ConnectionManagerInterface<TValue> {
  private _defaultValue: TValue;
  private _connectionMap: Map<InputConnectorInterface<TValue>, OutputConnectorInterface<TValue>>;

  constructor(defaultValue: TValue) {
    this._defaultValue = defaultValue;
    this._connectionMap = new Map();
  }

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

  public disconnect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void {
    const [outputConnector, inputConnector] = this.getOrderedPair(lhs, rhs);

    if (!this._connectionMap.has(inputConnector)) {
      throw new ConnectionNotExistError<TValue>(inputConnector, outputConnector);
    }

    outputConnector.removeTarget(inputConnector);
    inputConnector.value = this._defaultValue;

    this._connectionMap.delete(inputConnector);
  }

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
