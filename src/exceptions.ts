import type { ConnectorInterface, InputConnectorInterface, OutputConnectorInterface } from "./types";

export class SignalPropagationError<TValue> extends Error {
  protected readonly _connector: ConnectorInterface<TValue>;

  constructor(connector: ConnectorInterface<TValue>, message: string) {
    super(message);
    this.name = "SignalPropagationError";
    this._connector = connector;
  }

  get connector(): ConnectorInterface<TValue> {
    return this._connector;
  }
}

export class InfiniteLoopError<TValue> extends SignalPropagationError<TValue> {
  constructor(connector: ConnectorInterface<TValue>) {
    super(connector, 'Infinite loop detected');
    this.name = "InfiniteLoopError";
  }
}

export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectionError";
  }
}

export class DuplicateConnectionError<TValue> extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface<TValue>;
  private readonly _outputConnector: OutputConnectorInterface<TValue>;

  constructor(inputConnector: InputConnectorInterface<TValue>, outputConnector: OutputConnectorInterface<TValue>) {
    super('Duplicate connection detected');
    this.name = "DuplicateConnectionError";
    this._inputConnector = inputConnector;
    this._outputConnector = outputConnector;
  }

  public get inputConnector(): InputConnectorInterface<TValue> {
    return this._inputConnector;
  }

  public get outputConnector(): OutputConnectorInterface<TValue> {
    return this._outputConnector;
  }
}

export class InputAlreadyConnectedError<TValue> extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface<TValue>;

  constructor(inputConnector: InputConnectorInterface<TValue>) {
    super('Input connector is already has connection');
    this.name = "InputAlreadyConnectedError";
    this._inputConnector = inputConnector;
  }

  public get inputConnector(): InputConnectorInterface<TValue> {
    return this._inputConnector;
  }
}

export class InvalidConnectorsPairError<TValue> extends ConnectionError {
  private readonly _lhsConnector: ConnectorInterface<TValue>;
  private readonly _rhsConnector: ConnectorInterface<TValue>;

  constructor(lhsConnector: ConnectorInterface<TValue>, rhsConnector: ConnectorInterface<TValue>) {
    super('Invalid connectors pair');
    this.name = "InvalidConnectorsPairError";
    this._lhsConnector = lhsConnector;
    this._rhsConnector = rhsConnector;
  }

  public get lhsConnector(): ConnectorInterface<TValue> {
    return this._lhsConnector;
  }

  public get rhsConnector(): ConnectorInterface<TValue> {
    return this._rhsConnector;
  }
}

export class ConnectionNotExistError<TValue> extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface<TValue>;
  private readonly _outputConnector: OutputConnectorInterface<TValue>;

  constructor(inputConnector: InputConnectorInterface<TValue>, outputConnector: OutputConnectorInterface<TValue>) {
    super('Connection does not exist');
    this.name = "ConnectionNotExistError";
    this._inputConnector = inputConnector;
    this._outputConnector = outputConnector;
  }

  public get inputConnector(): InputConnectorInterface<TValue> {
    return this._inputConnector;
  }

  public get outputConnector(): OutputConnectorInterface<TValue> {
    return this._outputConnector;
  }
}
