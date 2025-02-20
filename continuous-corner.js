if (typeof registerPaint !== 'undefined') {
  class ContinuousCorner {
    static get inputProperties() {
      return ['--continuous-rounding'];
    }

    paint(ctx, size, properties) {
      const requestedRadius = parseFloat(properties.get('--continuous-rounding'));
      const maxRadius = Math.min(size.width, size.height) / 2;
      const radius = Math.min(requestedRadius, maxRadius);
      
      const circularityRatio = Math.min(requestedRadius / maxRadius, 2);
      const n = Math.max(2, 4 - (circularityRatio) * 0.8);
      
      const width = size.width;
      const height = size.height;
      
      ctx.beginPath();

      const superellipsePoint = (angle) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const cosn = Math.pow(Math.abs(cos), 2/n) * Math.sign(cos);
        const sinn = Math.pow(Math.abs(sin), 2/n) * Math.sign(sin);
        return {
          x: radius * cosn,
          y: radius * sinn
        };
      };

      const steps = 100;
      
      ctx.moveTo(width, radius);
      
      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const point = superellipsePoint(angle);
        
        let x, y;
        if (angle <= Math.PI/2) {
          x = width - radius + point.x;
          y = radius - point.y;
        } else if (angle <= Math.PI) {
          x = radius + point.x;
          y = radius - point.y;
        } else if (angle <= Math.PI * 3/2) {
          x = radius + point.x;
          y = height - radius - point.y;
        } else {
          x = width - radius + point.x;
          y = height - radius - point.y;
        }

        ctx.lineTo(x, y);
      }
      
      ctx.lineTo(width, radius);
      ctx.closePath();
      ctx.fill();
    }
  }

  registerPaint('continuous-corner', ContinuousCorner);
} 
