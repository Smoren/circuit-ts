import type { ConnectorInterface } from "./types";

export class InfiniteLoopError extends Error {
  private readonly _connector: ConnectorInterface;

  constructor(connector: ConnectorInterface) {
    super('Infinite loop detected');
    this.name = "InfiniteLoopError";
    this._connector = connector;
  }

  get connector(): ConnectorInterface {
    return this._connector;
  }
}
