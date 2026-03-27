import {
  ACTION_PAYABLE_RESOURCE_STRINGS,
  ActionPayableResource,
  ActionResolutionGameLogMessageUpdateCommand,
  ActionUseGameLogMessageUpdateCommand,
  COMBAT_ACTIONS,
  CRAFTING_ACTION_PAST_TENSE_STRINGS,
  CombatActionComponent,
  CombatActionOrigin,
  CraftingAction,
  Equipment,
  GameMessage,
  GameMessageType,
  HP_CHANGE_SOURCE_CATEGORY_STRINGS,
  IActionUser,
  Item,
  KINETIC_DAMAGE_TYPE_STRINGS,
  MAGICAL_ELEMENT_STRINGS,
  ResourceChange,
} from "@speed-dungeon/common";
import { ClientApplication } from "..";
import {
  COMBAT_LOG_MESSAGE_STYLES_BY_MESSAGE_TYPE,
  GameLogMessage,
  GameLogMessageStyle,
} from "./game-log-messages";
import { DialogElementName } from "../ui/dialogs";

export class EventLogGameMessageService {
  constructor(private clientApplication: ClientApplication) {}

  private dispatch(message: GameLogMessage) {
    this.clientApplication.eventLogStore.postMessage(message);
  }

  private dispatchText(text: string, style: GameLogMessageStyle) {
    this.dispatch(new GameLogMessage({ type: "text", text }, style));
  }

  postGameStarted() {
    this.dispatchText("A new game has begun!", GameLogMessageStyle.Basic);
  }

  postActionUse(command: ActionUseGameLogMessageUpdateCommand) {
    {
      const { actionUseMessageData, actionName } = command;
      const action = COMBAT_ACTIONS[actionName];
      if (!action.gameLogMessageProperties.getOnUseMessage) return;

      const message = action.gameLogMessageProperties.getOnUseMessage(actionUseMessageData);
      this.dispatchText(message, GameLogMessageStyle.Basic);
    }
  }

  postActionResolution(command: ActionResolutionGameLogMessageUpdateCommand) {
    {
      const { actionUseMessageData, actionName } = command;
      const action = COMBAT_ACTIONS[actionName];
      const { gameLogMessageProperties } = action;

      let message: null | string = null;

      if (command.isSuccess && gameLogMessageProperties.getOnSuccessMessage) {
        message = gameLogMessageProperties.getOnSuccessMessage(actionUseMessageData);
      } else if (gameLogMessageProperties.getOnFailureMessage) {
        message = gameLogMessageProperties.getOnFailureMessage(actionUseMessageData);
      }

      if (message) {
        this.dispatchText(message, GameLogMessageStyle.Basic);
      }
    }
  }

  postUserLeftGame(username: string) {
    this.dispatchText(`${username} left the game`, GameLogMessageStyle.PartyWipe);
  }

  postGameMessage(message: GameMessage) {
    const style = COMBAT_LOG_MESSAGE_STYLES_BY_MESSAGE_TYPE[message.type];
    this.dispatchText(message.message, style);
  }

  postActionMissed(actionUserName: string, targetName: string) {
    this.dispatchText(
      `${actionUserName} failed to hit ${targetName}`,
      GameLogMessageStyle.Basic
    );
  }

  postActionEvaded(actionUserName: string, targetName: string) {
    this.dispatchText(
      `${targetName} evaded an attack from ${actionUserName}`,
      GameLogMessageStyle.Basic
    );
  }

  postActionParried(actionUserName: string, targetName: string) {
    this.dispatchText(
      `${targetName} parried an attack from ${actionUserName}`,
      GameLogMessageStyle.Basic
    );
  }

  postActionCountered(actionUserName: string, targetName: string) {
    this.dispatchText(
      `${targetName} countered an attack from ${actionUserName}`,
      GameLogMessageStyle.Basic
    );
  }

  postActionResisted(actionUserName: string, targetName: string) {
    this.dispatchText(`${targetName} resisted.`, GameLogMessageStyle.Basic);
  }

  postItemLink(posterName: string, item: Item) {
    this.dispatch(
      new GameLogMessage(
        { type: "itemLink", posterName, item },
        COMBAT_LOG_MESSAGE_STYLES_BY_MESSAGE_TYPE[GameMessageType.CraftingAction]
      )
    );
  }

  postCraftActionResult(
    crafterName: string,
    itemBeforeModification: Equipment,
    craftingAction: CraftingAction,
    itemResult: Equipment
  ) {
    const style = COMBAT_LOG_MESSAGE_STYLES_BY_MESSAGE_TYPE[GameMessageType.CraftingAction];
    const item = Equipment.fromSerialized(itemResult);

    let itemAfter: Equipment | null = null;
    switch (craftingAction) {
      case CraftingAction.Repair:
        break;
      case CraftingAction.Reform:
      case CraftingAction.Shake:
      case CraftingAction.Imbue:
      case CraftingAction.Augment:
      case CraftingAction.Tumble:
        itemAfter = item;
        break;
    }

    this.dispatch(
      new GameLogMessage(
        {
          type: "craftResult",
          crafterName,
          craftingAction,
          itemBefore: itemBeforeModification,
          itemAfter,
        },
        style
      )
    );
  }

  postCombatantDeath(targetName: string) {
    this.dispatchText(`${targetName}'s hp was reduced to zero`, GameLogMessageStyle.Basic);
  }

  postExperienceGained(gainerName: string, value: number) {
    this.dispatchText(
      `${gainerName} gained ${value} experience points`,
      GameLogMessageStyle.PartyProgress
    );
  }

  postLevelup(levelerName: string, newLevel: number) {
    this.dispatchText(
      `${levelerName} reached level ${newLevel}!`,
      GameLogMessageStyle.PartyProgress
    );
  }

  postWipeMessage() {
    this.dispatchText("Your party was defeated", GameLogMessageStyle.PartyWipe);
  }

  postResourceChange(
    resourceChange: ResourceChange,
    resourceType: ActionPayableResource,
    action: CombatActionComponent,
    wasBlocked: boolean,
    target: IActionUser,
    actionUserName: string,
    actionUserTargetingSelf: boolean
  ) {
    const { elementOption, kineticDamageTypeOption } = resourceChange.source;
    const showDebug = this.clientApplication.uiStore.dialogs.isOpen(DialogElementName.Debug);
    let elementOptionString: string = "";
    if (elementOption !== undefined) {
      elementOptionString = ` ${MAGICAL_ELEMENT_STRINGS[elementOption].toLowerCase()}`;
    }

    let kineticOptionString = "";
    if (kineticDamageTypeOption !== undefined) {
      kineticOptionString = ` ${KINETIC_DAMAGE_TYPE_STRINGS[kineticDamageTypeOption].toLowerCase()}`;
    }

    const resourceChangeSourceCategoryText =
      HP_CHANGE_SOURCE_CATEGORY_STRINGS[resourceChange.source.category].toLowerCase();

    let manaDamage = "";
    if (resourceType === ActionPayableResource.Mana) manaDamage = " mana";

    const resourceTypeString = ACTION_PAYABLE_RESOURCE_STRINGS[resourceType].toLowerCase();

    const sOption = Math.abs(resourceChange.value) > 1 ? "s" : "";
    const damageText = `point${sOption} of ${resourceChangeSourceCategoryText + kineticOptionString + elementOptionString}${manaDamage} damage`;

    const resourceTypeOrDamageText = resourceChange.value > 0 ? resourceTypeString : damageText;

    let style = GameLogMessageStyle.Basic;
    if (resourceType === ActionPayableResource.HitPoints && resourceChange.value > 0)
      style = GameLogMessageStyle.Healing;

    if (resourceType === ActionPayableResource.Mana && resourceChange.value > 0)
      style = GameLogMessageStyle.Mana;

    let messageText = "";

    const { gameLogMessageProperties } = action;
    const { origin } = gameLogMessageProperties;

    if (spellLikeOrigins.includes(origin)) {
      const damagedOrHealed = resourceChange.value > 0 ? "recovers" : "takes";
      messageText = `${target.getName()} ${damagedOrHealed} ${Math.abs(resourceChange.value)} ${resourceTypeOrDamageText}`;
    } else {
      let recoveryWord = "healed";
      if (resourceType === ActionPayableResource.Mana) recoveryWord = "refreshed";
      const damagedOrHealed = resourceChange.value > 0 ? recoveryWord : "hit";

      const targetId = target.getEntityId();

      const targetNameText = actionUserTargetingSelf ? "themselves" : target.getName();

      const debugTargetId = showDebug ? targetId : "";
      messageText = `${actionUserName} ${damagedOrHealed} ${targetNameText} ${debugTargetId} for ${Math.abs(resourceChange.value)} ${resourceTypeOrDamageText}`;
    }

    if (resourceChange.isCrit) messageText = "Critical! " + messageText;
    if (wasBlocked) messageText = "Shield block: " + messageText;

    this.dispatchText(messageText, style);
  }
}

const spellLikeOrigins = [
  CombatActionOrigin.SpellCast,
  CombatActionOrigin.Medication,
  CombatActionOrigin.TriggeredCondition,
];
