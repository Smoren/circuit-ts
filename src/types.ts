export type ConnectorType = 'input' | 'output';

export interface ConnectorInterface {
  value: boolean;
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

export interface DirtyPropagatorInterface {
  propagate(element: ElementInterface): void;
}
