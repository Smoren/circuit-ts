import type { PortInterface, InputPortInterface, OutputPortInterface } from "./types";

/**
 * Base class for errors occurring during signal propagation.
 */
export class SignalPropagationError<TValue> extends Error {
  protected readonly _port: PortInterface<TValue>;

  constructor(port: PortInterface<TValue>, message: string) {
    super(message);
    this.name = "SignalPropagationError";
    this._port = port;
  }

  /** The port where the error was detected. */
  get port(): PortInterface<TValue> {
    return this._port;
  }
}

/**
 * Thrown when an infinite loop is detected during signal propagation.
 */
export class InfiniteLoopError<TValue> extends SignalPropagationError<TValue> {
  constructor(port: PortInterface<TValue>) {
    super(port, 'Infinite loop detected');
    this.name = "InfiniteLoopError";
  }
}

/**
 * Base class for errors related to port connections.
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
  private readonly _inputPort: InputPortInterface<TValue>;
  private readonly _outputPort: OutputPortInterface<TValue>;

  constructor(inputPort: InputPortInterface<TValue>, outputPort: OutputPortInterface<TValue>) {
    super('Duplicate connection detected');
    this.name = "DuplicateConnectionError";
    this._inputPort = inputPort;
    this._outputPort = outputPort;
  }

  /** The input port involved in the duplicate connection. */
  public get inputPort(): InputPortInterface<TValue> {
    return this._inputPort;
  }

  /** The output port involved in the duplicate connection. */
  public get outputPort(): OutputPortInterface<TValue> {
    return this._outputPort;
  }
}

/**
 * Thrown when trying to connect an already connected input port to another output.
 */
export class InputAlreadyConnectedError<TValue> extends ConnectionError {
  private readonly _inputPort: InputPortInterface<TValue>;

  constructor(inputPort: InputPortInterface<TValue>) {
    super('Input port is already has connection');
    this.name = "InputAlreadyConnectedError";
    this._inputPort = inputPort;
  }

  /** The input port that is already occupied. */
  public get inputPort(): InputPortInterface<TValue> {
    return this._inputPort;
  }
}

/**
 * Thrown when trying to connect two ports of incompatible types (e.g., two inputs or two outputs).
 */
export class InvalidPortsPairError<TValue> extends ConnectionError {
  private readonly _lhsPort: PortInterface<TValue>;
  private readonly _rhsPort: PortInterface<TValue>;

  constructor(lhsPort: PortInterface<TValue>, rhsPort: PortInterface<TValue>) {
    super('Invalid ports pair');
    this.name = "InvalidPortsPairError";
    this._lhsPort = lhsPort;
    this._rhsPort = rhsPort;
  }

  /** The first port in the invalid pair. */
  public get lhsPort(): PortInterface<TValue> {
    return this._lhsPort;
  }

  /** The second port in the invalid pair. */
  public get rhsPort(): PortInterface<TValue> {
    return this._rhsPort;
  }
}

/**
 * Thrown when trying to disconnect a connection that does not exist.
 */
export class ConnectionNotExistError<TValue> extends ConnectionError {
  private readonly _inputPort: InputPortInterface<TValue>;
  private readonly _outputPort: OutputPortInterface<TValue>;

  constructor(inputPort: InputPortInterface<TValue>, outputPort: OutputPortInterface<TValue>) {
    super('Connection does not exist');
    this.name = "ConnectionNotExistError";
    this._inputPort = inputPort;
    this._outputPort = outputPort;
  }

  /** The input port of the non-existent connection. */
  public get inputPort(): InputPortInterface<TValue> {
    return this._inputPort;
  }

  /** The output port of the non-existent connection. */
  public get outputPort(): OutputPortInterface<TValue> {
    return this._outputPort;
  }
}
