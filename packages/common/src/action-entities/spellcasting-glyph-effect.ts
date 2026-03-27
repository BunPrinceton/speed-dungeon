import {
  AbstractMesh,
  Color3,
  Color4,
  CreateGround,
  DynamicTexture,
  GPUParticleSystem,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Scene,
  SphereParticleEmitter,
  StandardMaterial,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { CosmeticEffect } from "./cosmetic-effect.js";
import { ManagedParticleSystem } from "./managed-particle-system.js";

const GLYPH_EXPAND_DURATION_MS = 400;
const GLYPH_HOLD_DURATION_MS = 800;
const GLYPH_FADE_DURATION_MS = 400;
const GLYPH_MAX_RADIUS = 1.5;
const GLYPH_Y_OFFSET = 0.02; // slightly above ground to avoid z-fighting

/**
 * A spellcasting ground glyph effect.
 *
 * Displays an expanding circular plane beneath the caster that glows,
 * holds, then fades out. The glyph uses a procedurally generated
 * concentric-ring texture on a DynamicTexture.
 *
 * The rank parameter controls visual intensity:
 * - Higher rank = larger radius, brighter glow, more rings
 */
export class SpellcastingGlyphEffect extends CosmeticEffect {
  private glyphMesh: Mesh | null = null;
  private glyphMaterial: StandardMaterial | null = null;
  private startTime: number = 0;
  private phase: "expand" | "hold" | "fade" = "expand";
  private disposed = false;
  private animationFrameId: ReturnType<typeof requestAnimationFrame> | null = null;

  constructor(scene: Scene, rank: number) {
    super(scene, rank);
    this.startTime = performance.now();
    this.createGlyph(scene);
    this.animate();
  }

  private createGlyph(scene: Scene) {
    const radius = GLYPH_MAX_RADIUS * (0.8 + this.rank * 0.1);

    // Create a flat disc mesh
    this.glyphMesh = MeshBuilder.CreateDisc(
      "spellcasting-glyph",
      { radius, tessellation: 64 },
      scene
    );
    this.glyphMesh.rotation.x = Math.PI / 2; // lay flat on the ground
    this.glyphMesh.position.y = GLYPH_Y_OFFSET;
    this.glyphMesh.setParent(this.transformNode);
    this.glyphMesh.scaling.set(0, 0, 0); // start invisible, will expand

    // Create a glowing material with procedural glyph texture
    this.glyphMaterial = new StandardMaterial("glyph-material", scene);
    this.glyphMaterial.backFaceCulling = false;
    this.glyphMaterial.disableLighting = true;
    this.glyphMaterial.alpha = 0.8;

    // Default color — can be overridden by subclasses
    const intensity = 0.6 + this.rank * 0.1;
    this.glyphMaterial.emissiveColor = new Color3(
      0.4 * intensity,
      0.6 * intensity,
      1.0 * intensity
    );

    // Procedural glyph texture
    const textureSize = 512;
    const dynamicTexture = new DynamicTexture("glyph-texture", textureSize, scene, true);
    const ctx = dynamicTexture.getContext() as unknown as CanvasRenderingContext2D;

    this.drawGlyphPattern(ctx, textureSize);
    dynamicTexture.update();
    dynamicTexture.hasAlpha = true;

    this.glyphMaterial.opacityTexture = dynamicTexture;
    this.glyphMaterial.emissiveTexture = dynamicTexture;
    this.glyphMesh.material = this.glyphMaterial;
  }

  /**
   * Draws concentric rings and radial lines on the glyph texture.
   * Override this in subclasses for different glyph patterns.
   */
  protected drawGlyphPattern(ctx: CanvasRenderingContext2D, size: number) {
    const center = size / 2;
    const maxRadius = size / 2 - 4;
    const ringCount = 2 + Math.min(this.rank, 4);

    ctx.clearRect(0, 0, size, size);

    // Outer circle
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center, maxRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner concentric rings
    for (let i = 1; i <= ringCount; i++) {
      const ringRadius = maxRadius * (i / (ringCount + 1));
      const alpha = 0.3 + (i / ringCount) * 0.5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial lines
    const lineCount = 6 + this.rank * 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(
        center + Math.cos(angle) * maxRadius,
        center + Math.sin(angle) * maxRadius
      );
      ctx.stroke();
    }

    // Center dot
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(center, center, 6, 0, Math.PI * 2);
    ctx.fill();

    // Radial fade — transparent in center, visible toward edges
    const gradient = ctx.createRadialGradient(center, center, maxRadius * 0.1, center, center, maxRadius);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over";
  }

  private animate() {
    if (this.disposed) return;

    const elapsed = performance.now() - this.startTime;
    const totalDuration = GLYPH_EXPAND_DURATION_MS + GLYPH_HOLD_DURATION_MS + GLYPH_FADE_DURATION_MS;

    if (elapsed < GLYPH_EXPAND_DURATION_MS) {
      // Expand phase
      this.phase = "expand";
      const t = elapsed / GLYPH_EXPAND_DURATION_MS;
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const scale = eased;
      this.glyphMesh?.scaling.set(scale, scale, scale);
    } else if (elapsed < GLYPH_EXPAND_DURATION_MS + GLYPH_HOLD_DURATION_MS) {
      // Hold phase — glyph slowly rotates
      this.phase = "hold";
      this.glyphMesh?.scaling.set(1, 1, 1);
      const holdElapsed = elapsed - GLYPH_EXPAND_DURATION_MS;
      if (this.glyphMesh) {
        this.glyphMesh.rotation.z = holdElapsed * 0.001; // slow rotation
      }
    } else if (elapsed < totalDuration) {
      // Fade phase
      this.phase = "fade";
      const fadeElapsed = elapsed - GLYPH_EXPAND_DURATION_MS - GLYPH_HOLD_DURATION_MS;
      const t = fadeElapsed / GLYPH_FADE_DURATION_MS;
      if (this.glyphMaterial) {
        this.glyphMaterial.alpha = 0.8 * (1 - t);
      }
    } else {
      // Done — don't auto-cleanup, let the effect lifecycle manager handle it
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  cleanup() {
    this.disposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.glyphMesh) {
      this.glyphMesh.dispose(false, true);
      this.glyphMesh = null;
    }
    if (this.glyphMaterial) {
      this.glyphMaterial.dispose();
      this.glyphMaterial = null;
    }
    super.cleanup();
  }

  softCleanup(onComplete: () => void) {
    this.disposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Fade out then cleanup
    const fadeStart = performance.now();
    const fadeOut = () => {
      const t = (performance.now() - fadeStart) / GLYPH_FADE_DURATION_MS;
      if (t >= 1 || !this.glyphMaterial) {
        this.cleanup();
        onComplete();
        return;
      }
      this.glyphMaterial.alpha = 0.8 * (1 - t);
      requestAnimationFrame(fadeOut);
    };
    fadeOut();
  }
}
