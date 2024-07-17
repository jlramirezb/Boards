// Objeto para definir cada tablero
const Boards = {
    board1: {
        id: 'jxgbox1',
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        grid: true,
        gridSpacing: 1,
        mode: 'none',
        elements: []
    },
    board2: {
        id: 'jxgbox2',
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        grid: true,
        gridSpacing: 1,
        mode: 'none',
        elements: []
    },
    board3: {
        id: 'jxgbox3',
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        grid: true,
        gridSpacing: 1,
        mode: 'none',
        elements: []
    },
    board4: {
        id: 'jxgbox4',
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        grid: true,
        gridSpacing: 1,
        mode: 'none',
        elements: []
    },
    board5: {
        id: 'jxgbox5',
        boundingbox: [-10, 10, 10, -10],
        axis: true,
        grid: true,
        gridSpacing: 1,
        mode: 'none',
        elements: []
    }
};

// Función para cargar elementos desde localStorage
function loadElements(boardKey) {
    const savedElements = JSON.parse(localStorage.getItem(boardKey + '_elements')) || [];
    savedElements.forEach(el => {
        if (el.type === 'line') {
            const line = Boards[boardKey].instance.create('line', el.coords, {
                straightFirst: false,
                straightLast: false,
                strokeColor: 'blue',
                fixed: false
            });
            line.on('drag', () => {
                const newX = line.point1.X();
                line.point1.moveTo([newX, -10]);
                line.point2.moveTo([newX, 10]);
                updateElement(boardKey, {type: 'line', coords: [[newX, -10], [newX, 10]]});
            });
            el.object = line;
        } else if (el.type === 'point') {
            const point = Boards[boardKey].instance.create('point', el.coords, {
                size: 4,
                name: '',
                color: 'red',
                fixed: false
            });
            point.on('drag', () => {
                const newY = point.Y();
                point.moveTo([point.X(), newY]);
                updateElement(boardKey, {type: 'point', coords: [point.X(), newY]});
            });
            el.object = point;
        }
        Boards[boardKey].elements.push(el);
    });
}

// Función para guardar elementos en localStorage
function saveElements(boardKey, element) {
    Boards[boardKey].elements.push(element);
    localStorage.setItem(boardKey + '_elements', JSON.stringify(Boards[boardKey].elements));
}

// Función para actualizar elementos en localStorage
function updateElement(boardKey, updatedElement) {
    const elements = Boards[boardKey].elements;
    const index = elements.findIndex(el => el.type === updatedElement.type && JSON.stringify(el.coords) === JSON.stringify(updatedElement.coords));
    if (index !== -1) {
        elements[index] = updatedElement;
        localStorage.setItem(boardKey + '_elements', JSON.stringify(elements));
    }
}

// Función para limpiar el tablero
function clearBoard(boardKey) {
    const boardConfig = Boards[boardKey];
    boardConfig.elements.forEach(el => {
        boardConfig.instance.removeObject(el.object);
    });
    boardConfig.elements = [];
    localStorage.removeItem(boardKey + '_elements');
}

// Inicializar los tableros JSXGraph
Object.keys(Boards).forEach(key => {
    const boardConfig = Boards[key];
    boardConfig.instance = JXG.JSXGraph.initBoard(boardConfig.id, {
        boundingbox: boardConfig.boundingbox,
        axis: boardConfig.axis,
        grid: {
            gridX: boardConfig.gridSpacing,
            gridY: boardConfig.gridSpacing
        }
    });

    // Cargar elementos desde localStorage
    loadElements(key);

    // Manejar el evento de clic para cada tablero
    boardConfig.instance.on('down', (e) => {
        const coords = boardConfig.instance.getUsrCoordsOfMouse(e);

        if (boardConfig.mode === 'line') {
            const line = boardConfig.instance.create('line', [[coords[0], -10], [coords[0], 10]], {
                straightFirst: false,
                straightLast: false,
                strokeColor: 'blue',
                fixed: false
            });
            line.on('drag', () => {
                const newX = line.point1.X();
                line.point1.moveTo([newX, -10]);
                line.point2.moveTo([newX, 10]);
                updateElement(key, {type: 'line', coords: [[newX, -10], [newX, 10]]});
            });
            saveElements(key, {type: 'line', coords: [[coords[0], -10], [coords[0], 10]], object: line});
            boardConfig.mode = 'none';
        } else if (boardConfig.mode === 'point') {
            const point = boardConfig.instance.create('point', coords, {
                size: 4,
                name: '',
                color: 'red',
                fixed: false
            });
            point.on('drag', () => {
                const newY = point.Y();
                point.moveTo([coords[0], newY]);  // Solo permitir movimiento vertical
                updateElement(key, {type: 'point', coords: [coords[0], newY]});
            });
            saveElements(key, {type: 'point', coords, object: point});
            boardConfig.mode = 'none';
        }
    });
});

// Manejar eventos de botones para dibujar líneas
document.querySelectorAll('.draw-line').forEach(button => {
    button.addEventListener('click', () => {
        const boardKey = 'board' + button.getAttribute('data-board');
        Boards[boardKey].mode = 'line';
    });
});

// Manejar eventos de botones para dibujar puntos
document.querySelectorAll('.draw-point').forEach(button => {
    button.addEventListener('click', () => {
        const boardKey = 'board' + button.getAttribute('data-board');
        Boards[boardKey].mode = 'point';
    });
});

// Manejar eventos de botones para limpiar tableros
document.querySelectorAll('.clear-board').forEach(button => {
    button.addEventListener('click', () => {
        const boardKey = 'board' + button.getAttribute('data-board');
        clearBoard(boardKey);
    });
});
