//
// INTERPOLANT
//
function multiplyPolynomials(poly1, poly2) {
    const result = Array(poly1.length + poly2.length - 1).fill(0);

    // convolution
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            result[i + j] += poly1[i] * poly2[j];
        }
    }

    return result;
}

function addPolynomials(poly1, poly2) {
    const length = Math.max(poly1.length, poly2.length);

    return Array.from({length: length}, (_, index) => (
        (poly1[index] || 0) + (poly2[index] || 0)
    ));
}

function scalePolynomial(scalar, poly) {
    return poly.map(coeff => scalar * coeff)
}

function lagrangeNumerator(index, points) {
    let result = [1];

    for (let i = 0; i < points.length; i++) {
        if (i === index) continue;
        result = multiplyPolynomials(result, [-points[i], 1]);
    }

    return result;
}

function lagrangeDenominator(index, points) {
    let result = 1;

    for (let i = 0; i < points.length; i++) {
        if (i === index) continue;
        result *= points[index] - points[i]
    }

    return result;
}

function polynomialInterpolant(f, points) {
    let result = [0]

    for (let i = 0; i < points.length; i++) {
        let lagrangeBasis = lagrangeNumerator(i, points);
        const scale = f(points[i]) / lagrangeDenominator(i, points);
        lagrangeBasis = scalePolynomial(scale, lagrangeBasis);
        result = addPolynomials(result, lagrangeBasis);
    }

    return result;
}

function polynomialToString(poly) {
    return poly.map((coeff, index) => {
        if (coeff === 0) return '';

        coeff = parseFloat(coeff).toFixed(15)
        if (index === 0) {
            return `${coeff}`;
        } else if (index === 1) {
            return `${coeff}x`;
        } else {
            return `${coeff}x^{${index}}`;
        }
    }).filter(coeff => coeff !== '').join(' + ')
}

//
// PARSE LATEX
//
function handleCurrentFrac(input) {
    const result = [];
    let currentContent = '';
    let bracketDepth = 0;

    for (let i = 0; i < input.length; i++) {
        if (result.length === 2) {
            result.push(input.slice(i));
            break;
        }
        const char = input[i];

        if (char === '{') {
            if (bracketDepth > 0) {
                currentContent += '{';
            }
            bracketDepth++;
        } else if (char === '}') {
            bracketDepth--;

            if (bracketDepth === 0) {
                result.push(currentContent);
                currentContent = '';
            } else {
                currentContent += '}';
            }
        } else {
            currentContent += char;
        }
    }

    if (currentContent.length > 0) {
        result.push(currentContent);
    }

    return result;
}

function parseFrac(string) {
    let fracIndex = string.indexOf("\\frac")
    while (fracIndex !== -1) {
        const left = string.slice(0, fracIndex)
        const extracted = handleCurrentFrac(string.slice(fracIndex + 5))
        string = `${left}((${extracted[0]})/(${extracted[1]}))${extracted[2] || ''}`

        fracIndex = string.indexOf("\\frac")
    }

    return string
}

function parseLatex(string) {
    let result = parseFrac(string)
    result = result.replace(/\\/g, '');
    result = result.replace("{", "(");
    result = result.replace("}", ")");
    return result
}

//
// MATHJS
//
function latexToFunction(latex) {
    const parsed = parseLatex(latex);
    const f = math.parse(parseLatex(parsed)).compile()

    return (x) => f.evaluate({x})
}
