import { makeAutoObservable } from "mobx";

export enum ConnectionStatus {
  Initializing,
  Connected,
  Disconnected,
}
export class ConnectionStatusStore {
  private _connectionStatus: ConnectionStatus = ConnectionStatus.Initializing;
  private _pingMs: number | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  set connectionStatus(newStatus: ConnectionStatus) {
    this._connectionStatus = newStatus;
  }

  get connectionStatus() {
    return this._connectionStatus;
  }

  get isConnected() {
    return this.connectionStatus === ConnectionStatus.Connected;
  }

  get pingMs() {
    return this._pingMs;
  }

  set pingMs(value: number | null) {
    this._pingMs = value;
  }
}
