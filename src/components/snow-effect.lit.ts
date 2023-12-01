import { LitElement, css, html, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('snow-effect')
export class SnowEffect extends LitElement {

  static styles = css`
    :host{
      position:absolute;
      top:0;
      right:0;
      bottom:0;
      left:0
    }
    canvas{
      position:absolute;
      height:100%;
      width:100%
    }
  `;
  render() {
    return html`<canvas></canvas>`;
  }

  firstUpdated() {
    const canvasElement = this.renderRoot.querySelector('canvas');
    const requestAnimationFrame = window.requestAnimationFrame;

    const defaultSnowflakeSettings = {
      color: '#ffffff',
      radiusRange: [0.5, 4],
      speedRange: [1, 4],
      windRange: [-0.5, 3],
    };

    const createSnowflake = (canvas, customDrawFunction = null, customSettings) => {
      const snowflakeSettings = { ...defaultSnowflakeSettings, ...customSettings };
      const { radiusRange, speedRange, windRange, color } = snowflakeSettings;

      const getRandomValueInRange = (min, max) => min + Math.random() * (max - min);

      const snowflake = {
        color: color,
        x: getRandomValueInRange(0, canvas.offsetWidth),
        y: getRandomValueInRange(-canvas.offsetHeight, 0),
        radius: getRandomValueInRange(...radiusRange),
        speed: getRandomValueInRange(...speedRange),
        wind: getRandomValueInRange(...windRange),
        isResized: false,
      };

      const updateSnowflakePosition = () => {
        snowflake.y += snowflake.speed;
        snowflake.x += snowflake.wind;
        ensureWithinCanvasBounds();
      };

      const ensureWithinCanvasBounds = () => {
        if (snowflake.y >= canvas.offsetHeight || snowflake.isResized) {
          snowflake.x = getRandomValueInRange(0, canvas.offsetWidth);
          snowflake.y = getRandomValueInRange(-canvas.offsetHeight, 0);
          snowflake.isResized = false;
        }
      };

      return {
        update: () => {
          updateSnowflakePosition();
        },
        resized: () => (snowflake.isResized = true),
        draw: customDrawFunction
          ? () => customDrawFunction(canvas.getContext('2d'), snowflake)
          : () => {
              const ctx = canvas.getContext('2d');
              ctx.beginPath();
              ctx.arc(snowflake.x, snowflake.y, snowflake.radius, 0, 2 * Math.PI);
              ctx.fillStyle = snowflake.color;
              ctx.fill();
              ctx.closePath();
            },
      };
    };

    const initializeSnowfall = (canvas, numberOfSnowflakes) => {
      const context = canvas.getContext('2d');
      const snowflakes = [];

      const addSnowflake = (customDrawFunction) => {
        snowflakes.push(createSnowflake(canvas, customDrawFunction));
      };

      const handleResize = () => {
        context.canvas.width = canvas.offsetWidth;
        context.canvas.height = canvas.offsetHeight;
        snowflakes.forEach((flake) => flake.resized());
      };

      const drawFrame = () => {
        context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        snowflakes.forEach((flake) => flake.draw());
        snowflakes.forEach((flake) => flake.update());
        requestAnimationFrame(drawFrame);
      };

      Array.from({ length: numberOfSnowflakes }, () => addSnowflake());

      window.addEventListener('resize', handleResize);
      drawFrame();
      handleResize();
    };

    const numberOfFlakes = 500;
    initializeSnowfall(canvasElement, numberOfFlakes);
  }
}
