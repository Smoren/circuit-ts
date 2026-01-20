export type ConnectorType = 'input' | 'output';

export interface ConnectorInterface<TValue> {
  value: TValue;
  readonly type: ConnectorType;
  readonly dirty: boolean;
  readonly element: ElementInterface<TValue>;
  readonly index: number;
  readonly targets: Array<InputConnectorInterface<TValue>>;
  propagate(): Array<ConnectorInterface<TValue>>;
  makeDirty(): void;
}

export interface InputConnectorInterface<TValue> extends ConnectorInterface<TValue> {}

export interface OutputConnectorInterface<TValue> extends ConnectorInterface<TValue> {
  addTarget(connector: InputConnectorInterface<TValue>): void;
  removeTarget(connector: InputConnectorInterface<TValue>): void;
}

export interface ElementInterface<TValue> {
  readonly inputs: Array<InputConnectorInterface<TValue>>;
  readonly outputs: Array<OutputConnectorInterface<TValue>>;
  init(): void;
  propagate(index?: number): Array<ConnectorInterface<TValue>>;
}

export interface SignalPropagatorInterface<TValue> {
  propagate(targets: ConnectorInterface<TValue>[]): Set<ConnectorInterface<TValue>>;
}

export interface ResetElementPropagatorInterface<TValue> {
  propagate(element: ElementInterface<TValue>): void;
}

export interface ConnectionManagerInterface<TValue> {
  connect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void;
  disconnect(lhs: ConnectorInterface<TValue>, rhs: ConnectorInterface<TValue>): void;
}
