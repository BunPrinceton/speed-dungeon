import {
  Color4,
  GPUParticleSystem,
  Mesh,
  MeshBuilder,
  Scene,
  SphereParticleEmitter,
  StandardMaterial,
  Color3,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { CosmeticEffect } from "./cosmetic-effect.js";
import { ManagedParticleSystem } from "./managed-particle-system.js";

const AURA_ORBIT_SPEED = 2.0; // radians per second
const AURA_PARTICLE_RISE_SPEED = 0.5;
const DEFAULT_AURA_RADIUS = 0.8;
const DEFAULT_AURA_HEIGHT = 1.2;

/**
 * A cylindrical aura effect around a combatant.
 *
 * Emits particles in a ring pattern that orbit the caster within a
 * cylindrical volume. Supports:
 * - Orbiting particles (like FFXI Corsair cards circling at hip height)
 * - Rising particles (like Path of Exile auras emanating upward)
 * - Configurable radius, height, orbit speed, particle colors
 *
 * The rank parameter scales intensity:
 * - Higher rank = more particles, wider radius, faster orbit
 *
 * Subclass and override `getAuraConfig()` to customize for specific spells.
 */
export class SpellcastingAuraEffect extends CosmeticEffect {
  private orbitMeshes: Mesh[] = [];
  private orbitAngle = 0;
  private disposed = false;
  private animationFrameId: ReturnType<typeof requestAnimationFrame> | null = null;
  private lastFrameTime = performance.now();

  constructor(scene: Scene, rank: number) {
    super(scene, rank);
    this.createOrbitElements(scene);
    this.animateOrbits();
  }

  /**
   * Override in subclasses to customize the aura appearance.
   */
  protected getAuraConfig() {
    return {
      radius: DEFAULT_AURA_RADIUS + this.rank * 0.1,
      height: DEFAULT_AURA_HEIGHT,
      orbitSpeed: AURA_ORBIT_SPEED + this.rank * 0.3,
      elementCount: 3 + Math.min(this.rank, 5),
      elementSize: 0.08,
      elementColor: new Color3(0.4, 0.6, 1.0),
      elementAlpha: 0.8,
      verticalOscillation: 0.15, // how much elements bob up/down
      orbitTilt: 0, // radians — tilt the orbit plane
    };
  }

  createParticleSystems(scene: Scene): ManagedParticleSystem[] {
    const config = this.getAuraConfig();
    const emitterMesh = MeshBuilder.CreateBox("aura-emitter", { size: 0.01 }, scene);
    emitterMesh.isVisible = false;

    const capacity = 20 + this.rank * 10;
    const particleSystem = new GPUParticleSystem("aura-particles", { capacity }, scene);
    particleSystem.particleTexture = new Texture("/img/particle-textures/flare.png", scene);

    // Emit from a cylindrical ring
    const emitter = new SphereParticleEmitter(config.radius, 0);
    particleSystem.particleEmitterType = emitter;
    particleSystem.emitter = emitterMesh;

    particleSystem.minEmitPower = 0.05;
    particleSystem.maxEmitPower = 0.15;
    particleSystem.minLifeTime = 1.0;
    particleSystem.maxLifeTime = 2.0;
    particleSystem.emitRate = 5 + this.rank * 3;
    particleSystem.minSize = 0.03;
    particleSystem.maxSize = 0.08;

    // Gentle upward drift
    particleSystem.gravity = new Vector3(0, AURA_PARTICLE_RISE_SPEED, 0);

    // Colors from config
    const { r, g, b } = config.elementColor;
    particleSystem.color1 = new Color4(r, g, b, 0.6);
    particleSystem.color2 = new Color4(r * 0.8, g * 0.8, b * 0.8, 0.4);
    particleSystem.colorDead = new Color4(r * 0.5, g * 0.5, b * 0.5, 0.0);

    particleSystem.preWarmCycles = 200;

    return [new ManagedParticleSystem(particleSystem, emitterMesh, scene)];
  }

  private createOrbitElements(scene: Scene) {
    const config = this.getAuraConfig();

    for (let i = 0; i < config.elementCount; i++) {
      const element = MeshBuilder.CreatePlane(
        `aura-orbit-element-${i}`,
        { size: config.elementSize * 2 },
        scene
      );

      const material = new StandardMaterial(`aura-element-mat-${i}`, scene);
      material.disableLighting = true;
      material.emissiveColor = config.elementColor.clone();
      material.alpha = config.elementAlpha;
      material.backFaceCulling = false;
      element.material = material;
      element.billboardMode = Mesh.BILLBOARDMODE_ALL;

      element.setParent(this.transformNode);
      this.orbitMeshes.push(element);
    }
  }

  private animateOrbits() {
    if (this.disposed) return;

    const now = performance.now();
    const deltaSeconds = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    const config = this.getAuraConfig();
    this.orbitAngle += config.orbitSpeed * deltaSeconds;

    const elementCount = this.orbitMeshes.length;
    for (let i = 0; i < elementCount; i++) {
      const mesh = this.orbitMeshes[i];
      if (!mesh) continue;

      const angleOffset = (i / elementCount) * Math.PI * 2;
      const angle = this.orbitAngle + angleOffset;

      // Circular orbit
      const x = Math.cos(angle) * config.radius;
      const z = Math.sin(angle) * config.radius;

      // Vertical position with gentle oscillation
      const baseHeight = config.height * 0.5; // hip height
      const oscillation = Math.sin(angle * 2 + i) * config.verticalOscillation;
      const y = baseHeight + oscillation;

      mesh.position.set(x, y, z);
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateOrbits());
  }

  cleanup() {
    this.disposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    for (const mesh of this.orbitMeshes) {
      mesh.dispose(false, true);
    }
    this.orbitMeshes = [];
    super.cleanup();
  }

  softCleanup(onComplete: () => void) {
    this.disposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Fade out orbit elements
    const fadeStart = performance.now();
    const fadeDuration = 500;
    const fadeOut = () => {
      const t = (performance.now() - fadeStart) / fadeDuration;
      if (t >= 1) {
        this.cleanup();
        onComplete();
        return;
      }
      for (const mesh of this.orbitMeshes) {
        if (mesh.material instanceof StandardMaterial) {
          mesh.material.alpha = (1 - t) * this.getAuraConfig().elementAlpha;
        }
      }
      requestAnimationFrame(fadeOut);
    };
    fadeOut();

    // Also soft-cleanup particles
    for (const ps of this.particleSystems) {
      ps.softCleanup(() => {});
    }
  }
}
