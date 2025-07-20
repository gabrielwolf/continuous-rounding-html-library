if (typeof registerPaint !== 'undefined') {

    class ContinuousCorner {

        static get inputProperties() {
            return [
                '--continuous-rounding',
                '--continuous-rounding-top-left',
                '--continuous-rounding-top-right',
                '--continuous-rounding-bottom-right',
                '--continuous-rounding-bottom-left'
            ];
        }

        /**
         * Read a custom property and return its value in **pixels**.
         * – If the property is not set, returns `undefined`.
         * – Works for any `<length>` unit thanks to CSS Typed OM.
         */
        readLengthInPx(properties, propName) {
            const raw = properties.get(propName);

            /* Not set at all → undefined */
            if (!raw || (raw.toString && raw.toString().trim() === '')) {
                return undefined;
            }

            /* Typed OM: CSSUnitValue, CSSMathSum, … */
            if (typeof raw.to === 'function') {
                try { return raw.to('px').value; }     // most browsers
                catch { /* fall through if conversion fails */ }
            }

            /* Fallback: numeric prefix (treats `10rem` as 10 px(!) when
               Typed OM is missing — still better than crashing).         */
            const fallback = parseFloat(raw.toString());
            return Number.isNaN(fallback) ? undefined : fallback;
        }

        paint(context, geometry, properties) {

            /* Uniform fallback radius (may be 0 if not provided) */
            const uniformPx =
                this.readLengthInPx(properties, '--continuous-rounding') || 0;

            /* Corner order: TR, TL, BL, BR — matches angle→index logic */
            const requestedPx = [
                this.readLengthInPx(properties, '--continuous-rounding-top-right'),
                this.readLengthInPx(properties, '--continuous-rounding-top-left'),
                this.readLengthInPx(properties, '--continuous-rounding-bottom-left'),
                this.readLengthInPx(properties, '--continuous-rounding-bottom-right')
            ].map(v => v === undefined ? uniformPx : v);

            const maxPossible = Math.min(geometry.width, geometry.height) / 2;

            const cornerRadii = requestedPx.map(r => Math.min(r, maxPossible));

            const cornerExponents = requestedPx.map(r => {
                const ratio = Math.min(r / maxPossible, 2);
                return Math.max(2, 4 - ratio * 0.8);
            });

            const superellipsePoint = (a, n, r) => {
                const c = Math.cos(a), s = Math.sin(a);
                return {
                    x: r * Math.sign(c) * Math.pow(Math.abs(c), 2 / n),
                    y: r * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)
                };
            };

            context.beginPath();

            const steps = 120;
            for (let i = 0; i <= steps; i += 1) {

                const angle = (i / steps) * Math.PI * 2;

                /* Angle → corner index (0 TR, 1 TL, 2 BL, 3 BR) */
                const corner =
                      angle <= Math.PI / 2       ? 0
                    : angle <= Math.PI           ? 1
                    : angle <= Math.PI * 3 / 2   ? 2
                    :                              3;

                const p = superellipsePoint(
                    angle,
                    cornerExponents[corner],
                    cornerRadii[corner]
                );

                let x, y;
                switch (corner) {
                    case 0: x = geometry.width  - cornerRadii[0] + p.x;
                            y =                   cornerRadii[0] - p.y;           break;
                    case 1: x =                   cornerRadii[1] + p.x;
                            y =                   cornerRadii[1] - p.y;           break;
                    case 2: x =                   cornerRadii[2] + p.x;
                            y = geometry.height - cornerRadii[2] - p.y;           break;
                    case 3: x = geometry.width  - cornerRadii[3] + p.x;
                            y = geometry.height - cornerRadii[3] - p.y;           break;
                }

                i === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
            }

            context.closePath();
            context.fill();
        }
    }

    registerPaint('continuous-corner', ContinuousCorner);
}
