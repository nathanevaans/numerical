function splitIntervals(mesh, degree) {
    const result = []

    for (let i = 1; i < mesh.length; i++) {
        const step = (mesh[i] - mesh[i - 1]) / degree;
        const interval = [];

        for (let j = 0; j < degree + 1; j++) {
            const point = mesh[i - 1] + j * step;
            interval.push(point);
        }
        result.push(interval)
    }

    return result
}