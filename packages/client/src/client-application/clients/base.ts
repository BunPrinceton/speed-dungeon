import {
  ClientIntent,
  ClientIntentType,
  ClientSequentialEventType,
  ConnectionEndpoint,
  GameStateUpdate,
} from "@speed-dungeon/common";
import { ClientApplication } from "..";
import { ConnectionMode, ConnectionTopology } from "../connection-topology";
import { ConnectionStatus } from "../ui/connection-status";

const PING_INTERVAL_MS = 5000;

export abstract class BaseClient {
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    protected name: string,
    protected connectionEndpoint: ConnectionEndpoint,
    protected clientApplication: ClientApplication,
    protected connectionTopology: ConnectionTopology,
    protected _targetConnectionMode: ConnectionMode
  ) {
    this.registerListeners();
  }

  set targetConnectionMode(newMode: ConnectionMode) {
    this._targetConnectionMode = newMode;
  }

  dispatchIntent(message: ClientIntent) {
    this.connectionEndpoint.send(JSON.stringify(message));
  }

  close() {
    this.stopPingInterval();
    this.connectionEndpoint.close();
  }

  setEndpoint(connectionEndpoint: ConnectionEndpoint) {
    const oldEndpoint = this.connectionEndpoint;
    this.stopPingInterval();
    this.connectionEndpoint = connectionEndpoint;
    this.registerListeners();
    oldEndpoint.close();
  }

  private startPingInterval() {
    this.stopPingInterval();
    this.pingIntervalId = setInterval(() => {
      this.dispatchIntent({
        type: ClientIntentType.Ping,
        data: { timestamp: Date.now() },
      });
    }, PING_INTERVAL_MS);
  }

  private stopPingInterval() {
    if (this.pingIntervalId !== null) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    this.clientApplication.uiStore.connectionStatus.pingMs = null;
  }

  protected registerListeners() {
    this.connectionEndpoint.on("open", () => {
      console.info(`connected to ${this.name}`);
      const { gameContext, uiStore } = this.clientApplication;
      gameContext.clearGame();
      this.connectionTopology.runtimeMode = this._targetConnectionMode;
      uiStore.connectionStatus.connectionStatus = ConnectionStatus.Connected;

      this.clientApplication.replayTreeScheduler.clear();
      this.startPingInterval();
    });

    this.connectionEndpoint.on("message", (untyped) => {
      const typedMessage = this.getTypedMessage(untyped);
      this.handleMessage(typedMessage);
    });

    this.connectionEndpoint.on("close", (reason) => {
      console.info(`closed connection endpoint with code ${reason}`);
      this.stopPingInterval();
    });
  }

  abstract resetConnection(): void;

  protected abstract handleMessage(message: GameStateUpdate): void;

  protected getTypedMessage(rawData: string | ArrayBuffer) {
    const asString = rawData.toString();
    const asJson = JSON.parse(asString);
    const typedMessage = asJson as GameStateUpdate;
    return typedMessage;
  }
}
