import type { ConnectorInterface, InputConnectorInterface, OutputConnectorInterface } from "./types";

/**
 * Base class for errors occurring during signal propagation.
 */
export class SignalPropagationError<TValue> extends Error {
  protected readonly _connector: ConnectorInterface<TValue>;

  constructor(connector: ConnectorInterface<TValue>, message: string) {
    super(message);
    this.name = "SignalPropagationError";
    this._connector = connector;
  }

  /** The connector where the error was detected. */
  get connector(): ConnectorInterface<TValue> {
    return this._connector;
  }
}

/**
 * Thrown when an infinite loop is detected during signal propagation.
 */
export class InfiniteLoopError<TValue> extends SignalPropagationError<TValue> {
  constructor(connector: ConnectorInterface<TValue>) {
    super(connector, 'Infinite loop detected');
    this.name = "InfiniteLoopError";
  }
}

/**
 * Base class for errors related to connector connections.
 */
export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConnectionError";
  }
}

/**
 * Thrown when trying to create a connection that already exists.
 */
export class DuplicateConnectionError<TValue> extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface<TValue>;
  private readonly _outputConnector: OutputConnectorInterface<TValue>;

  constructor(inputConnector: InputConnectorInterface<TValue>, outputConnector: OutputConnectorInterface<TValue>) {
    super('Duplicate connection detected');
    this.name = "DuplicateConnectionError";
    this._inputConnector = inputConnector;
    this._outputConnector = outputConnector;
  }

  /** The input connector involved in the duplicate connection. */
  public get inputConnector(): InputConnectorInterface<TValue> {
    return this._inputConnector;
  }

  /** The output connector involved in the duplicate connection. */
  public get outputConnector(): OutputConnectorInterface<TValue> {
    return this._outputConnector;
  }
}

/**
 * Thrown when trying to connect an already connected input connector to another output.
 */
export class InputAlreadyConnectedError<TValue> extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface<TValue>;

  constructor(inputConnector: InputConnectorInterface<TValue>) {
    super('Input connector is already has connection');
    this.name = "InputAlreadyConnectedError";
    this._inputConnector = inputConnector;
  }

  /** The input connector that is already occupied. */
  public get inputConnector(): InputConnectorInterface<TValue> {
    return this._inputConnector;
  }
}

/**
 * Thrown when trying to connect two connectors of incompatible types (e.g., two inputs or two outputs).
 */
export class InvalidConnectorsPairError<TValue> extends ConnectionError {
  private readonly _lhsConnector: ConnectorInterface<TValue>;
  private readonly _rhsConnector: ConnectorInterface<TValue>;

  constructor(lhsConnector: ConnectorInterface<TValue>, rhsConnector: ConnectorInterface<TValue>) {
    super('Invalid connectors pair');
    this.name = "InvalidConnectorsPairError";
    this._lhsConnector = lhsConnector;
    this._rhsConnector = rhsConnector;
  }

  /** The first connector in the invalid pair. */
  public get lhsConnector(): ConnectorInterface<TValue> {
    return this._lhsConnector;
  }

  /** The second connector in the invalid pair. */
  public get rhsConnector(): ConnectorInterface<TValue> {
    return this._rhsConnector;
  }
}

/**
 * Thrown when trying to disconnect a connection that does not exist.
 */
export class ConnectionNotExistError<TValue> extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface<TValue>;
  private readonly _outputConnector: OutputConnectorInterface<TValue>;

  constructor(inputConnector: InputConnectorInterface<TValue>, outputConnector: OutputConnectorInterface<TValue>) {
    super('Connection does not exist');
    this.name = "ConnectionNotExistError";
    this._inputConnector = inputConnector;
    this._outputConnector = outputConnector;
  }

  /** The input connector of the non-existent connection. */
  public get inputConnector(): InputConnectorInterface<TValue> {
    return this._inputConnector;
  }

  /** The output connector of the non-existent connection. */
  public get outputConnector(): OutputConnectorInterface<TValue> {
    return this._outputConnector;
  }
}
