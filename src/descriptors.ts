import { DescriptorIdFactoryInterface, IdFactoryInterface } from "./types";

export class IntAutoIncrementIdFactory implements IdFactoryInterface<number> {
  private _lastId: number = 0;

  public create(): number {
    return this._lastId++;
  }
}

export class SeparateAutoIncrementDescriptorIdFactory implements DescriptorIdFactoryInterface<number> {
  private _elementIdFactory: IntAutoIncrementIdFactory;
  private _portIdFactory: IntAutoIncrementIdFactory;
  private _connectionIdFactory: IntAutoIncrementIdFactory;

  constructor() {
    this._elementIdFactory = new IntAutoIncrementIdFactory();
    this._portIdFactory = new IntAutoIncrementIdFactory();
    this._connectionIdFactory = new IntAutoIncrementIdFactory();
  }

  public createForElement(): number {
    return this._elementIdFactory.create();
  }

  public createForPort(): number {
    return this._portIdFactory.create();
  }

  public createForConnection(): number {
    return this._connectionIdFactory.create();
  }
}

export class CommonAutoIncrementDescriptorIdFactory implements DescriptorIdFactoryInterface<number> {
  private _idFactory: IntAutoIncrementIdFactory;

  constructor() {
    this._idFactory = new IntAutoIncrementIdFactory();
  }

  public createForElement(): number {
    return this._idFactory.create();
  }

  public createForPort(): number {
    return this._idFactory.create();
  }

  public createForConnection(): number {
    return this._idFactory.create();
  }
}
