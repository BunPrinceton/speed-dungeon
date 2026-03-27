import { AbstractMesh, Quaternion, TransformNode, Vector3 } from "@babylonjs/core";
import { getChildMeshByName } from "@/game-world-view/utils";

const SPINE_BONE_NAME = "DEF-spine.003";
const BLEND_SPEED = 4.0; // per second — how fast the aim blends in/out
const MAX_PITCH_RADIANS = 0.4; // clamp to ~23 degrees up/down

/**
 * Manages upper-body aiming by applying a pitch rotation to the upper spine bone
 * (DEF-spine.003) toward a target's hitbox center during attack animations.
 *
 * The rotation is purely a pitch adjustment (tilt forward/back) applied on top of
 * the existing skeletal animation. It blends in when aiming starts and blends out
 * when aiming stops, producing a subtle but realistic effect.
 */
export class SpineAimingManager {
  private spineBone: TransformNode | null = null;
  private targetNode: TransformNode | null = null;
  private blendWeight = 0; // 0 = no aim, 1 = full aim
  private isAiming = false;

  constructor(rootMesh: AbstractMesh) {
    const bone = getChildMeshByName(rootMesh, SPINE_BONE_NAME);
    if (bone && "rotationQuaternion" in bone) {
      this.spineBone = bone as TransformNode;
      if (!this.spineBone.rotationQuaternion) {
        this.spineBone.rotationQuaternion = Quaternion.Identity();
      }
    }
  }

  get isAvailable(): boolean {
    return this.spineBone !== null;
  }

  /** Start aiming the upper body toward a target transform node (e.g. HitboxCenter) */
  startAiming(targetNode: TransformNode) {
    if (!this.spineBone) return;
    this.targetNode = targetNode;
    this.isAiming = true;
  }

  /** Stop aiming — will smoothly blend back to the animation's natural pose */
  stopAiming() {
    this.isAiming = false;
    this.targetNode = null;
  }

  /**
   * Called each frame. Computes the pitch delta needed to aim at the target
   * and applies it as a blended additive rotation on the spine bone.
   */
  update(deltaTime: number) {
    if (!this.spineBone) return;

    // Update blend weight
    if (this.isAiming && this.blendWeight < 1) {
      this.blendWeight = Math.min(1, this.blendWeight + BLEND_SPEED * deltaTime);
    } else if (!this.isAiming && this.blendWeight > 0) {
      this.blendWeight = Math.max(0, this.blendWeight - BLEND_SPEED * deltaTime);
    }

    // Nothing to do if fully blended out
    if (this.blendWeight <= 0) {
      return;
    }

    // Capture the animation's current rotation as our base each frame
    // (the skeletal animation is constantly updating this bone)
    if (!this.spineBone.rotationQuaternion) return;

    if (!this.targetNode) {
      // Blending out with no target — just let the weight decay
      return;
    }

    const pitchDelta = this.computePitchToTarget();
    if (pitchDelta === null) return;

    // Clamp the pitch
    const clampedPitch = Math.max(-MAX_PITCH_RADIANS, Math.min(MAX_PITCH_RADIANS, pitchDelta));

    // Apply as a local X rotation (pitch) scaled by blend weight
    const aimRotation = Quaternion.RotationAxis(
      Vector3.Right(),
      clampedPitch * this.blendWeight
    );

    // Multiply onto the current animation rotation
    this.spineBone.rotationQuaternion = this.spineBone.rotationQuaternion.multiply(aimRotation);
  }

  /**
   * Computes the pitch angle (in radians) from the spine bone to the target,
   * in the spine bone's local space. Positive = tilt down, negative = tilt up.
   */
  private computePitchToTarget(): number | null {
    if (!this.spineBone || !this.targetNode) return null;

    const spineWorldPos = this.spineBone.getAbsolutePosition();
    const targetWorldPos = this.targetNode.getAbsolutePosition();

    // Direction from spine to target in world space
    const toTarget = targetWorldPos.subtract(spineWorldPos);
    const horizontalDist = Math.sqrt(toTarget.x * toTarget.x + toTarget.z * toTarget.z);
    const verticalDist = toTarget.y;

    if (horizontalDist < 0.001) return null;

    // Pitch angle: negative atan2 because we want to tilt the spine forward (down)
    // when the target is below, and backward (up) when above
    return -Math.atan2(verticalDist, horizontalDist);
  }
}
