import type { ConnectorInterface, InputConnectorInterface, OutputConnectorInterface } from "./types";

export class SignalPropagationError extends Error {
  protected readonly _connector: ConnectorInterface;

  constructor(connector: ConnectorInterface, message: string) {
    super(message);
    this.name = "SignalPropagationError";
    this._connector = connector;
  }

  get connector(): ConnectorInterface {
    return this._connector;
  }
}

export class InfiniteLoopError extends SignalPropagationError {
  constructor(connector: ConnectorInterface) {
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

export class DuplicateConnectionError extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface;
  private readonly _outputConnector: OutputConnectorInterface;

  constructor(inputConnector: InputConnectorInterface, outputConnector: OutputConnectorInterface) {
    super('Duplicate connection detected');
    this.name = "DuplicateConnectionError";
    this._inputConnector = inputConnector;
    this._outputConnector = outputConnector;
  }

  public get inputConnector(): InputConnectorInterface {
    return this._inputConnector;
  }

  public get outputConnector(): OutputConnectorInterface {
    return this._outputConnector;
  }
}

export class InputAlreadyConnectedError extends ConnectionError {
  private readonly _inputConnector: InputConnectorInterface;

  constructor(inputConnector: InputConnectorInterface) {
    super('Input connector is already has connection');
    this.name = "InputAlreadyConnectedError";
    this._inputConnector = inputConnector;
  }

  public get inputConnector(): InputConnectorInterface {
    return this._inputConnector;
  }
}

export class InvalidConnectorsPairError extends ConnectionError {
  private readonly _lhsConnector: ConnectorInterface;
  private readonly _rhsConnector: ConnectorInterface;

  constructor(lhsConnector: ConnectorInterface, rhsConnector: ConnectorInterface) {
    super('Invalid connectors pair');
    this.name = "InvalidConnectorsPairError";
    this._lhsConnector = lhsConnector;
    this._rhsConnector = rhsConnector;
  }

  public get lhsConnector(): ConnectorInterface {
    return this._lhsConnector;
  }

  public get rhsConnector(): ConnectorInterface {
    return this._rhsConnector;
  }
}
