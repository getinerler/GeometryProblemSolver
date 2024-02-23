'use strict';

let showCode = false;

export function getQuestionText(elements, parallels, question) {
    let text = '';
    if (showCode) {
        text += codeText(elements, parallels, question);
    }
    if (elements.lines.length > 0) {
        for (let line of elements.lines) {
            if (!line.getValue() || line.getValue() === '?') {
                continue;
            }
            text += `|${line}| = ${line.getValue()} cm</br>`;

            for (let seg of line.getSegments()) {
                if (!seg.getValue() || seg.getValue() === '?') {
                    continue;
                }
                text += `|${seg}| = ${seg.getValue()} cm</br>`;
            }
        }
    }
    if (elements.angles.length > 0) {
        let anglesText = '';
        let found = false;
        for (let i = 0; i < elements.angles.length; i++) {
            let angle = elements.angles[i];
            if (!angle.getValue() || angle.getValue() === '?') {
                continue;
            }
            found = true;
            anglesText += `${angle.getValueName()} = ${angle.getValueString()}</br>`;
        }
        if (found) {
            text += anglesText;
        }
    }
    if (parallels.length > 0) {
        text += `Parallels: ${parallels.join(', ')}</br>`;
    }
    if (question) {
        text += `<b> ${question.getValueName()} = ?</b>`;
    }
    return text;
}

function codeText(elements, parallels, question) {
    let text = '';
    let dotMap = [];
    let dotCounter = 1;
    text += 'let dots = [</br>';
    for (let dot of elements.dots) {
        dotMap.push({ 'name': dot.getName(), 'id': dotCounter++ });
        text += `new Dot(${dot.getX()}, ${dot.getY()}, '${dot.getName()}'),</br>`;
    }
    text += '];';
    text += '</br>';

    let lineMap = [];
    let lineSegmentMap = [];
    let lineCounter = 1;
    let segCounter = 1;

    for (let line of elements.lines) {
        for (let seg of line.getSegments()) {
            let d1 = dotMap.find((x) => x.name === seg.getDot1().getName());
            let d2 = dotMap.find((x) => x.name === seg.getDot2().getName());
            text += 'let seg' + segCounter +
                ' = new Line(dots[' + (d1.id - 1) + '], dots[' +
                (d2.id - 1) + `]); // ${d1.name}${d2.name}</br>`
            lineSegmentMap.push({
                'name': seg.getName(),
                'id': segCounter++,
                'd1': d1.id,
                'd2': d2.id
            });
        }
    }

    let segText = '';

    text += 'let lines = [</br>';
    for (let line of elements.lines) {
        lineMap.push({ 'name': line.getName(), 'id': lineCounter++ });
        let d1 = dotMap.find((x) => x.name === line.getDot1().getName());
        let d2 = dotMap.find((x) => x.name === line.getDot2().getName());
        text += `new Line(dots[${d1.id - 1}], dots[${d2.id - 1}]) // ${d1.name}${d2.name}`;

        for (let seg of line.getSegments()) {
            let segEl = lineSegmentMap.find((x) => x.name === seg.getName());
            text += `</br>.addSegment(seg${segEl.id})`;

            segText += `seg${segEl.id}.setBase(lines[${(lineCounter - 2)}]);</br>`;
        }
        text += '</br>,</br>';
    }
    text += '];';
    text += '</br>';


    text += segText + '</br>';


    for (let dot of elements.dots) {
        if (dot.getBaseLine() !== null) {
            let d = dotMap.find((x) => x.name === dot.getName());
            let l = lineMap.find((x) => x.name === dot.getBaseLine().getName());
            text += 'dots[' + (d.id - 1) + '].setBaseLine(lines[' + l.id +
                ']).setLineRatio('
                + dot.getLineRatio() + ');</br>';
        }
    }
    text += 'let angles = [</br>';
    for (let angle of elements.angles) {
        let d = dotMap.find((x) => x.name === angle.getDot().getName());
        let l1 = lineMap.find((x) => x.name === angle.getLine1().getName());
        let l2 = lineMap.find((x) => x.name === angle.getLine2().getName());

        text += `new Angle(dots[${d.id - 1}],`;
        if (!l1) {
            l1 = lineSegmentMap.find((x) => x.name === angle.getLine1().getName());
            text += `seg${l1.id}, `;
        } else {
            text += `lines[${l1.id - 1}], `;
        }
        if (!l2) {
            l2 = lineSegmentMap.find((x) => x.name === angle.getLine2().getName());
            text += `seg${l2.id})`;
        } else {
            text += `lines[${l2.id - 1}])`;
        }
        if (angle.isKnown() || angle.getValue() === '?') {
            text += `.setValue(${angle.getValue()})`;
        }
        text += ',</br>';
    }
    text += '];';
    text += '</br>';
    text += '.....................................</br>';

    text += `   return {
            dots,
            lines,
            angles,
            parallels: [],
            question: ''
        }`;
    return text.replace('?', '"?"');
}

export function getEquationsText(solve) {
    if (solve.solved) {
        let tree = solve.tree;
        let ids = tree.getKeyList();
        let eqs = solve.equations.filter((x) => ids.indexOf(x.getCount()) > -1);
        return eqs.map(function (x) {
            let str = `<span class="equationExplanation">${x.getCreation() || ''}</span>`;
            let ancestorIds = x.getAncestorIds();
            if (ancestorIds.length > 0) {
                for (let ancestorId of ancestorIds) {
                    let ancestorEq = eqs.find((y) => y.getCount() === ancestorId);
                    str +=
                        `<span class="equationExplanation">${ancestorEq.toString()}</span>`;
                }
            }
            str += x.toString();
            return str;
        }).join('</br>');
    }
    return equations.map(function (x) {
        let str = `<span class="equationExplanation">${x.getCreation() || ''}</span>`;
        let ancestorIds = x.getAncestorIds();
        if (ancestorIds.length > 0) {
            for (let ancestorId of ancestorIds) {
                let ancestorEq = equations.find((y) => y.getCount() === ancestorId);
                str +=
                    `<span class="equationExplanation">${ancestorEq.toString()}</span>`;
            }
        }
        str += x.toString();
        return str;
    }).join('</br>');
}