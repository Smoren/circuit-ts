export type ConnectorType = 'input' | 'output';

export interface ConnectorInterface {
  value: boolean;
  name: string;
  readonly type: ConnectorType;
  readonly dirty: boolean;
  readonly element: ElementInterface;
  readonly index: number;
  readonly targets: Array<InputConnectorInterface>;
  propagate(): Array<ConnectorInterface>;
  makeDirty(): void;
}

export interface InputConnectorInterface extends ConnectorInterface {}

export interface OutputConnectorInterface extends ConnectorInterface {
  addTarget(connector: InputConnectorInterface): void;
  removeTarget(connector: InputConnectorInterface): void;
}

export interface ElementInterface {
  name: string;
  readonly inputs: Array<InputConnectorInterface>;
  readonly outputs: Array<OutputConnectorInterface>;
  init(): void;
  propagate(index?: number): Array<ConnectorInterface>;
}

export interface SignalPropagatorInterface {
  propagate(targets: ConnectorInterface[]): Set<ConnectorInterface>;
}

export interface ResetElementPropagatorInterface {
  propagate(element: ElementInterface): void;
}

export interface ConnectionManagerInterface {
  connect(lhs: ConnectorInterface, rhs: ConnectorInterface): void;
  disconnect(lhs: ConnectorInterface, rhs: ConnectorInterface): void;
}
