// Environmental Renderer - Renders nebula clouds, planets, and special effects
import { Theme } from '../../../shared/types/cosmicWhiskers';

interface NebulaCloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
}

interface Satellite {
  x: number;
  y: number;
  size: number;
  rotation: number;
  speed: number;
  type: 'dish' | 'solar' | 'station';
}

export class EnvironmentalRenderer {
  private nebulaClouds: NebulaCloud[] = [];
  private planetX: number = 0;
  private planetRotation: number = 0;
  private satellites: Satellite[] = [];

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.initializeNebulaClouds();
    this.initializeSatellites();
    this.planetX = canvasWidth * 0.8;
  }

  private initializeSatellites(): void {
    // Create 3-5 satellites at random positions
    const satelliteCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < satelliteCount; i++) {
      this.satellites.push({
        x: Math.random() * this.canvasWidth * 2,
        y: Math.random() * this.canvasHeight,
        size: 15 + Math.random() * 25,
        rotation: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.5,
        type: ['dish', 'solar', 'station'][Math.floor(Math.random() * 3)] as 'dish' | 'solar' | 'station'
      });
    }
  }

  private initializeNebulaClouds(): void {
    this.nebulaClouds = [];
    for (let i = 0; i < 5; i++) {
      this.nebulaClouds.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        width: 150 + Math.random() * 200,
        height: 100 + Math.random() * 150,
        speed: 0.1 + Math.random() * 0.3,
        opacity: 0.1 + Math.random() * 0.2,
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    // Render nebula clouds if theme has them
    if (theme.visuals.nebulaColor && theme.visuals.nebulaOpacity) {
      this.renderNebulaClouds(ctx, theme);
    }

    // Render planet if theme has one
    if (theme.visuals.planetImage) {
      this.renderPlanet(ctx, theme, time);
    }

    // Render satellites floating in space
    this.renderSatellites(ctx, time);

    // Render special effects
    if (theme.visuals.specialEffect && theme.visuals.specialEffect !== 'none') {
      this.renderSpecialEffect(ctx, theme, time);
    }

    // Render floating space dust
    this.renderSpaceDust(ctx, theme, time);
  }

  private renderNebulaClouds(ctx: CanvasRenderingContext2D, theme: Theme): void {
    if (!theme.visuals.nebulaColor || !theme.visuals.nebulaOpacity) return;

    for (const cloud of this.nebulaClouds) {
      ctx.save();
      ctx.globalAlpha = cloud.opacity * (theme.visuals.nebulaOpacity || 0.2);

      // Create radial gradient for organic cloud shape
      const gradient = ctx.createRadialGradient(
        cloud.x + cloud.width / 2,
        cloud.y + cloud.height / 2,
        0,
        cloud.x + cloud.width / 2,
        cloud.y + cloud.height / 2,
        cloud.width / 2
      );

      gradient.addColorStop(0, theme.visuals.nebulaColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);

      ctx.restore();
    }
  }

  private renderPlanet(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    const planetRadius = 80;
    const planetY = this.canvasHeight * 0.3;

    // Slow rotation
    this.planetRotation = (time / 50000) * Math.PI * 2;

    ctx.save();
    ctx.globalAlpha = 0.6;

    // Draw planet body
    const gradient = ctx.createRadialGradient(
      this.planetX,
      planetY,
      0,
      this.planetX,
      planetY,
      planetRadius
    );

    // Planet color based on theme
    const planetColors: Record<string, [string, string]> = {
      'pink-planet': ['#ec4899', '#db2777'],
      'rocky-planet': ['#78716c', '#57534e'],
      'purple-planet': ['#a855f7', '#7c3aed'],
      'home-planet': ['#fb923c', '#f97316'],
    };

    const colors = planetColors[theme.visuals.planetImage || ''] || ['#6b7280', '#4b5563'];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.planetX, planetY, planetRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw atmospheric glow
    ctx.globalAlpha = 0.3;
    const glowGradient = ctx.createRadialGradient(
      this.planetX,
      planetY,
      planetRadius,
      this.planetX,
      planetY,
      planetRadius + 20
    );
    glowGradient.addColorStop(0, colors[0]);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(this.planetX, planetY, planetRadius + 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderSpecialEffect(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    switch (theme.visuals.specialEffect) {
      case 'aurora':
        this.renderAurora(ctx, theme, time);
        break;
      case 'lightRays':
        this.renderLightRays(ctx, theme, time);
        break;
      case 'energyField':
        this.renderEnergyField(ctx, theme, time);
        break;
    }
  }

  private renderAurora(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    ctx.save();
    ctx.globalAlpha = 0.15;

    const waveOffset = (time / 2000) * Math.PI * 2;

    for (let i = 0; i < 3; i++) {
      const y = this.canvasHeight * 0.3 + i * 50;
      const gradient = ctx.createLinearGradient(0, y, this.canvasWidth, y);

      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.3, theme.visuals.ringGlowColor);
      gradient.addColorStop(0.7, theme.visuals.ringAccentColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;

      ctx.beginPath();
      ctx.moveTo(0, y);

      for (let x = 0; x < this.canvasWidth; x += 10) {
        const wave = Math.sin((x / 100 + waveOffset + i) * Math.PI) * 30;
        ctx.lineTo(x, y + wave);
      }

      ctx.lineTo(this.canvasWidth, y + 100);
      ctx.lineTo(0, y + 100);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderLightRays(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    ctx.save();
    ctx.globalAlpha = 0.1;

    const rayCount = 5;
    const sourceX = this.canvasWidth * 0.8;
    const sourceY = this.canvasHeight * 0.2;

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 0.5 + Math.PI * 0.75;
      const length = this.canvasWidth * 1.5;
      const width = 40;

      const gradient = ctx.createLinearGradient(
        sourceX,
        sourceY,
        sourceX + Math.cos(angle) * length,
        sourceY + Math.sin(angle) * length
      );

      gradient.addColorStop(0, theme.visuals.particleColor);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(sourceX, sourceY);
      ctx.lineTo(
        sourceX + Math.cos(angle - 0.05) * length,
        sourceY + Math.sin(angle - 0.05) * length
      );
      ctx.lineTo(
        sourceX + Math.cos(angle + 0.05) * length,
        sourceY + Math.sin(angle + 0.05) * length
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderEnergyField(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = theme.visuals.ringAccentColor;
    ctx.lineWidth = 1;

    const gridSize = 50;
    const pulse = Math.sin((time / 1000) * Math.PI * 2) * 0.5 + 0.5;

    // Vertical lines
    for (let x = 0; x < this.canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < this.canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderSpaceDust(ctx: CanvasRenderingContext2D, theme: Theme, time: number): void {
    ctx.save();

    const dustCount = 30;
    for (let i = 0; i < dustCount; i++) {
      const x = ((time * 0.02 + i * 50) % this.canvasWidth) - 50;
      const y = (i * 37) % this.canvasHeight;
      const size = 1 + (i % 3);
      const opacity = 0.2 + (i % 5) * 0.1;

      ctx.globalAlpha = opacity;
      ctx.fillStyle = theme.visuals.particleColor;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderSatellites(ctx: CanvasRenderingContext2D, time: number): void {
    this.satellites.forEach(satellite => {
      // Move satellite slowly to the left
      satellite.x -= satellite.speed;
      satellite.rotation += 0.01;
      
      // Reset position when off-screen
      if (satellite.x < -satellite.size) {
        satellite.x = this.canvasWidth + satellite.size;
        satellite.y = Math.random() * this.canvasHeight;
      }
      
      ctx.save();
      ctx.translate(satellite.x, satellite.y);
      ctx.rotate(satellite.rotation);
      
      // Render different satellite types
      switch (satellite.type) {
        case 'dish':
          this.renderSatelliteDish(ctx, satellite.size);
          break;
        case 'solar':
          this.renderSolarSatellite(ctx, satellite.size);
          break;
        case 'station':
          this.renderSpaceStation(ctx, satellite.size);
          break;
      }
      
      ctx.restore();
    });
  }

  private renderSatelliteDish(ctx: CanvasRenderingContext2D, size: number): void {
    const radius = size / 2;
    
    // Main body
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(-radius * 0.3, -radius * 0.2, radius * 0.6, radius * 0.4);
    
    // Dish
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(radius * 0.5, 0, radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    
    // Dish center
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(radius * 0.5, 0, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Blinking light
    if (Math.sin(Date.now() * 0.01) > 0) {
      ctx.fillStyle = '#f56565';
      ctx.beginPath();
      ctx.arc(-radius * 0.2, 0, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderSolarSatellite(ctx: CanvasRenderingContext2D, size: number): void {
    const radius = size / 2;
    
    // Main body
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(-radius * 0.2, -radius * 0.3, radius * 0.4, radius * 0.6);
    
    // Solar panels
    ctx.fillStyle = '#1a365d';
    ctx.fillRect(-radius * 0.8, -radius * 0.1, radius * 0.5, radius * 0.2);
    ctx.fillRect(radius * 0.3, -radius * 0.1, radius * 0.5, radius * 0.2);
    
    // Solar panel lines
    ctx.strokeStyle = '#4299e1';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const x = -radius * 0.8 + (i * radius * 0.15);
      ctx.beginPath();
      ctx.moveTo(x, -radius * 0.1);
      ctx.lineTo(x, radius * 0.1);
      ctx.stroke();
      
      const x2 = radius * 0.3 + (i * radius * 0.15);
      ctx.beginPath();
      ctx.moveTo(x2, -radius * 0.1);
      ctx.lineTo(x2, radius * 0.1);
      ctx.stroke();
    }
  }

  private renderSpaceStation(ctx: CanvasRenderingContext2D, size: number): void {
    const radius = size / 2;
    
    // Main ring
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Center hub
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Spokes
    ctx.strokeStyle = '#718096';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.3, Math.sin(angle) * radius * 0.3);
      ctx.lineTo(Math.cos(angle) * radius * 0.8, Math.sin(angle) * radius * 0.8);
      ctx.stroke();
    }
    
    // Lights
    const lightCount = 8;
    for (let i = 0; i < lightCount; i++) {
      const angle = (i * Math.PI * 2) / lightCount;
      const x = Math.cos(angle) * radius * 0.8;
      const y = Math.sin(angle) * radius * 0.8;
      
      ctx.fillStyle = Math.sin(Date.now() * 0.005 + i) > 0 ? '#ffd700' : '#4a5568';
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public updateClouds(deltaTime: number): void {
    for (const cloud of this.nebulaClouds) {
      cloud.x -= cloud.speed;

      if (cloud.x + cloud.width < 0) {
        cloud.x = this.canvasWidth;
        cloud.y = Math.random() * this.canvasHeight;
      }
    }
  }
}
