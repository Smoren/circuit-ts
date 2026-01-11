export interface ConnectorInterface {
  value: boolean;
  readonly dirty: boolean;
  propagate(): Array<ConnectorInterface>;
}

export interface InputConnectorInterface extends ConnectorInterface {
  readonly element: ElementInterface;
  readonly index: number;
}

export interface OutputConnectorInterface extends ConnectorInterface {
  connect(connector: InputConnectorInterface): void;
  disconnect(connector: InputConnectorInterface): void;
}

export interface ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  propagate(index: number): Array<ConnectorInterface>;
}

export interface SignalPropagationInterface {
  send(target: ConnectorInterface, value: boolean): Set<ConnectorInterface>;
}
