import {
  ConnectionManagerInterface,
  ConnectorInterface,
  InputConnectorInterface,
  OutputConnectorInterface,
} from "./types";
import { DuplicateConnectionError, InputAlreadyConnectedError, InvalidConnectorsPairError } from "./exceptions";

export class ConnectionManager implements ConnectionManagerInterface {
  private _connectionMap: Map<InputConnectorInterface, OutputConnectorInterface>;

  constructor() {
    this._connectionMap = new Map();
  }

  public connect(lhs: ConnectorInterface, rhs: ConnectorInterface): void {
    const [outputConnector, inputConnector] = this.getOrderedPair(lhs, rhs);
    if (this._connectionMap.has(inputConnector)) {
      if (this._connectionMap.get(inputConnector) === outputConnector) {
        throw new DuplicateConnectionError(inputConnector, outputConnector);
      }
      throw new InputAlreadyConnectedError(inputConnector);
    }

    outputConnector.addTarget(inputConnector);
    inputConnector.value = outputConnector.value;

    this._connectionMap.set(inputConnector, outputConnector);
  }

  public disconnect(lhs: ConnectorInterface, rhs: ConnectorInterface): void {
    const [outputConnector, inputConnector] = this.getOrderedPair(lhs, rhs);

    outputConnector.removeTarget(inputConnector);
    inputConnector.value = false;

    this._connectionMap.delete(inputConnector);
  }

  private getOrderedPair(lhs: ConnectorInterface, rhs: ConnectorInterface): [OutputConnectorInterface, InputConnectorInterface] {
    if (lhs.type === 'output' && rhs.type === 'input') {
      return [lhs as OutputConnectorInterface, rhs as InputConnectorInterface];
    } else if (lhs.type === 'input' && rhs.type === 'output') {
      return [rhs as OutputConnectorInterface, lhs as InputConnectorInterface];
    } else {
      throw new InvalidConnectorsPairError(lhs, rhs);
    }
  }
}
