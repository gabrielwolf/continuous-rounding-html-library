if (typeof registerPaint !== 'undefined') {

    class ContinuousCorner {

        static get inputProperties() {
            return [
                '--continuous-rounding',                 // uniform
                '--continuous-rounding-top-left',
                '--continuous-rounding-top-right',
                '--continuous-rounding-bottom-right',
                '--continuous-rounding-bottom-left'
            ];
        }

        /* Draw the mask */
        paint(context, geometry, properties) {

            /* Read the uniform value (may be NaN if not set). */
            const uniformRequestedRadius =
                parseFloat(properties.get('--continuous-rounding')) || 0;

            /* Helper — returns `undefined` if the corner prop was **not** set
               inline/in a rule; otherwise returns its numeric value.
               This lets us distinguish “unset” from “explicitly 0px”.        */
            const readCorner = propName => {
                const tokenList = properties.get(propName);
                if (!tokenList) { return undefined; }
                const raw = tokenList.toString().trim();
                if (raw === '') { return undefined; }
                const numeric = parseFloat(raw);
                return Number.isNaN(numeric) ? undefined : numeric;
            };

            /* Corner order: TR, TL, BL, BR  (matches the switch further below) */
            const requestedRadii = [
                readCorner('--continuous-rounding-top-right'),
                readCorner('--continuous-rounding-top-left'),
                readCorner('--continuous-rounding-bottom-left'),
                readCorner('--continuous-rounding-bottom-right')
            ].map(v => v === undefined ? uniformRequestedRadius : v);

            const maxPossible = Math.min(geometry.width, geometry.height) / 2;

            const cornerRadii = requestedRadii.map(r => Math.min(r, maxPossible));

            const cornerExponents = requestedRadii.map(r => {
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
                const corner =
                    angle <= Math.PI / 2 ? 0 :
                    angle <= Math.PI     ? 1 :
                    angle <= Math.PI * 3 / 2 ? 2 : 3;

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
