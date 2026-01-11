export type ConnectorType = 'input' | 'output';

export interface ConnectorInterface {
  value: boolean;
  readonly type: ConnectorType;
  readonly dirty: boolean;
  readonly element: ElementInterface;
  readonly index: number;
  propagate(): Array<ConnectorInterface>;
}

export interface InputConnectorInterface extends ConnectorInterface {}

export interface OutputConnectorInterface extends ConnectorInterface {
  readonly targets: Array<InputConnectorInterface>;
  connect(connector: InputConnectorInterface): void;
  disconnect(connector: InputConnectorInterface): void;
}

export interface ElementInterface {
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  propagate(index?: number): Array<ConnectorInterface>;
}

export interface CompositeElementInterface extends ElementInterface {
  init(): Array<ConnectorInterface>;
}

export interface SignalPropagatorInterface {
  propagate(targets: ConnectorInterface[]): Set<ConnectorInterface>;
}
