let canvas;
let ctxt;

let addingPoint;

let points;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctxt = canvas.getContext("2d");

    addingPoint = document.getElementById("add-point");

    points = [];

    canvas.onclick = e => {
        let x = e.clientX;
        let y = e.clientY;

        if(addingPoint.checked) {
            // insert sorted by x then y
            let inserted = false;
            for(let i=0;i<points.length;i++) {
                if(
                    (points[i][0] < x) ||
                    (points[i][0] === x && points[i][1] < y)
                ) {
                    continue
                }

                points.splice(i, 0, [x, y]);
                inserted = true;
                break
            }
            if(!inserted) {
                points.push([x, y]);
            }
        } else {
            if(points.length === 0) {
                return
            }

            let index = 0;
            let distance = Infinity;
            for(let i=0;i<points.length;i++) {
                let d = Math.hypot(points[i][1] - y, points[i][0] - x);
                if(d < distance) {
                    distance = d;
                    index = i;
                }
            }

            points.splice(index, 1);
        }

        update();
    }

    update();
}

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    update();
}

function update() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    if(points.length < 2) {
        renderPoints(points);
        return
    }

    let [index1, index2] = calculateClosestPair(points)

    renderClosest(points, index1, index2);
    renderPoints(points);
}

function renderClosest(points, index1, index2) {
    ctxt.lineWidth = canvas.height / 300;
    ctxt.strokeStyle = "#FFF";
    ctxt.lineCap = "round";
    ctxt.beginPath();
    ctxt.moveTo(points[index1][0], points[index1][1]);
    ctxt.lineTo(points[index2][0], points[index2][1]);
    ctxt.stroke();

    ctxt.beginPath();
    ctxt.arc(points[index1][0], points[index1][1], canvas.height / 100, 0, 2 * Math.PI);
    ctxt.stroke();

    ctxt.beginPath();
    ctxt.arc(points[index2][0], points[index2][1], canvas.height / 100, 0, 2 * Math.PI);
    ctxt.stroke();
}

function renderPoints(points) {
    ctxt.fillStyle = "#000A";
    for(let point of points) {
        ctxt.beginPath();
        ctxt.arc(point[0], point[1], canvas.height / 100, 0, 2 * Math.PI);
        ctxt.fill();
    }
}

function calculateClosestPair(points) {
    let minDistance = Infinity;
    let bestIndex1 = 0;
    let bestIndex2 = 0;
    let activeIndexStart = 0;

    for(let i=0;i<points.length;i++) {
        // remove oldest active points
        while(activeIndexStart < i) {
            // abs not needed since points are sorted
            let xDistance = points[activeIndexStart][0] - points[i][0];
            if(xDistance >= minDistance) {
                activeIndexStart++;
            } else {
                // other points are still active
                break;
            }
        }

        for(let j=activeIndexStart;j<i;j++) {
            let signedYDistance = Math.abs(points[j][1] - points[i][1]);

            if (signedYDistance > minDistance) {
                // we don't need expensive hypot calculation
                continue
            }
            if(signedYDistance < -minDistance) {
                // there cannot be better points
                break
            }

            // it's close so we check using hypot
            let distance = Math.hypot(signedYDistance, points[j][0] - points[i][0]);
            if(distance < minDistance) {
                minDistance = distance;
                bestIndex1 = j;
                bestIndex2 = i;
            }
        }
    }

    return [bestIndex1, bestIndex2];
}
