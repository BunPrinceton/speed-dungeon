import cloneDeep from "lodash.clonedeep";
import { SkeletalAnimationName } from "../../../../../app-consts.js";
import { ActionResolutionStepsConfig } from "../../../combat-action-steps-config.js";
import { getSpeciesTimedAnimation } from "../../get-species-timed-animation.js";
import { RANGED_SKILL_STEPS_CONFIG } from "./ranged-skill.js";
import { ActionResolutionStepType } from "../../../../../action-processing/action-steps/index.js";
import { CosmeticEffectNames } from "../../../../../action-entities/cosmetic-effect.js";
import { CosmeticEffectInstructionFactory } from "../cosmetic-effect-factories/index.js";

const config = cloneDeep(RANGED_SKILL_STEPS_CONFIG);

config.steps[ActionResolutionStepType.ChamberingMotion] = {
  ...config.steps[ActionResolutionStepType.ChamberingMotion],
  getAnimation: (user, animationLengths) =>
    getSpeciesTimedAnimation(
      user,
      animationLengths,
      SkeletalAnimationName.CastSpellChambering,
      false
    ),
  getCosmeticEffectsToStart: (context) => [
    CosmeticEffectInstructionFactory.createEffectOnCasterRoot(
      CosmeticEffectNames.SpellcastingGlyph,
      context,
      1600,
      1
    ),
    CosmeticEffectInstructionFactory.createEffectOnCasterRoot(
      CosmeticEffectNames.SpellcastingAura,
      context,
      2000,
      1
    ),
  ],
};
config.steps[ActionResolutionStepType.RollIncomingHitOutcomes] = {};
config.steps[ActionResolutionStepType.EvalOnHitOutcomeTriggers] = {};
config.steps[ActionResolutionStepType.PostOnResolutionGameLogMessage] = {};
config.steps[ActionResolutionStepType.DeliveryMotion] = {
  ...config.steps[ActionResolutionStepType.DeliveryMotion],
  getAnimation: (user, animationLengths) =>
    getSpeciesTimedAnimation(
      user,
      animationLengths,
      SkeletalAnimationName.CastSpellDelivery,
      false
    ),
};

config.finalSteps[ActionResolutionStepType.RecoveryMotion] = {
  ...config.finalSteps[ActionResolutionStepType.RecoveryMotion],
  getAnimation: (user, animationLengths) =>
    getSpeciesTimedAnimation(
      user,
      animationLengths,
      SkeletalAnimationName.CastSpellRecovery,
      false
    ),
  getCosmeticEffectsToStop: (context) => [
    CosmeticEffectInstructionFactory.createEffectOnCasterRoot(
      CosmeticEffectNames.SpellcastingGlyph,
      context
    ),
    CosmeticEffectInstructionFactory.createEffectOnCasterRoot(
      CosmeticEffectNames.SpellcastingAura,
      context
    ),
  ],
};

export const BASIC_SPELL_STEPS_CONFIG = new ActionResolutionStepsConfig(
  config.steps,
  config.finalSteps,
  config.options
);
