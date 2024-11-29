/* 
 * -> Comando para installar o Three.js (usar no console do computador): npm install three
*/

const simulacao = document.getElementById("simulacao");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, simulacao.offsetWidth / simulacao.offsetHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

//tentar: render.setSize(window.document.body.simulacao.innerWidth, window.document.body.simulacao.innerHeight);
renderer.setSize(simulacao.offsetWidth, simulacao.offsetHeight);
simulacao.appendChild(renderer.domElement);

camera.position.z = 15;

let shape;
let volume = 0;

// Inicializa a função do mouse
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Atualizar forma - inicio
function updateShape() {
  const shapeType = document.getElementById('shape-type').value;
  const xDimension = parseFloat(document.getElementById('x-dimension').value) || 1;
  const yDimension = parseFloat(document.getElementById('y-dimension').value) || 1;
  const zDimension = parseFloat(document.getElementById('z-dimension').value) || 1;

  if (shape) {
      scene.remove(shape);
  }

  let geometry;

  if (shapeType === 'cube') {
      geometry = new THREE.BoxGeometry(xDimension, yDimension, zDimension);
      volume = xDimension * yDimension * zDimension;
  } else if (shapeType === 'pyramid') {
      geometry = new THREE.ConeGeometry(xDimension, yDimension, 4);
      volume = (1 / 3) * Math.pow(xDimension, 2) * yDimension;
  } else if (shapeType === 'sphere') {
      geometry = new THREE.SphereGeometry(xDimension, 32, 32);
      volume = (4 / 3) * Math.PI * Math.pow(xDimension, 3);
  } else {
      alert('Tipo de forma desconhecido.');
      return;
  }

  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
  shape = new THREE.Mesh(geometry, material);
  scene.add(shape);

  // Chama a função para salvar o histórico
  saveShapeToHistory(shapeType, {
      x: xDimension,
      y: yDimension,
      z: zDimension
  }, volume);
}
// Atualizar forma - fim


function calculateVolume() {
    const volumeDisplay = document.getElementById('volume-display');
    volumeDisplay.innerHTML = `Volume: ${volume.toFixed(2)} metros cúbicos`;
}

function handleShapeChange() {
    const shapeType = document.getElementById('shape-type').value;
    const yContainer = document.getElementById('y-dimension-container');
    const zContainer = document.getElementById('z-dimension-container');

    if (shapeType === 'cube') {
        yContainer.style.display = 'block';
        zContainer.style.display = 'block';
    } else if (shapeType === 'pyramid') {
        yContainer.style.display = 'block';
        zContainer.style.display = 'none';
    } else if (shapeType === 'sphere') {
        yContainer.style.display = 'none';
        zContainer.style.display = 'none';
    }
}

document.getElementById('shape-type').addEventListener('change', handleShapeChange);
handleShapeChange();
updateShape();


// Mexer a forma - inicio
document.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
        isDragging = true;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

document.addEventListener('mousemove', (event) => {
    if (isDragging && shape) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        shape.rotation.y += deltaMove.x * 0.01;
        shape.rotation.x += deltaMove.y * 0.01;
    }

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});
// Mexer a forma - fim

// Zoom no scroll do mouse - inicio
document.addEventListener('wheel', (event) => {
    camera.position.z += event.deltaY * 0.01;
    camera.position.z = Math.max(2, Math.min(100, camera.position.z));
});

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
// Zoom no scroll do mouse - fim


// -__ funções historico __-

function saveShapeToHistory(shapeType, dimensions, volume) {
  let history = JSON.parse(localStorage.getItem('shapeHistory')) || [];

  // adicionar nova entry
  history.push({
      shapeType: shapeType,
      dimensions: dimensions,
      volume: volume,
      timestamp: new Date().toISOString()
  });

  // excluir entrada mais antiga quando passar de 10
  if (history.length > 10) {
      history = history.slice(-10);
  }

  localStorage.setItem('shapeHistory', JSON.stringify(history));
}

// Carregar histórico e exibir no modal
function loadShapeHistory() {
    const history = JSON.parse(localStorage.getItem('shapeHistory')) || [];
    const historicoContent = document.getElementById('historico-content');
    historicoContent.innerHTML = '';  // Limpar o conteúdo atual

    const shapeNames = {
        'cube': 'Cubo',
        'pyramid': 'Pirâmide',
        'sphere': 'Esfera'
    };
    
    // Ordena do mais recente para o mais antigo
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    history.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.innerHTML = `
            <p><strong>Forma:</strong> ${shapeNames[entry.shapeType] || entry.shapeType}</p>
            <p><strong>Dimensões:</strong> X: ${entry.dimensions.x}, Y: ${entry.dimensions.y}, Z: ${entry.dimensions.z}</p>
            <p><strong>Volume:</strong> ${entry.volume.toFixed(2)} metros cúbicos</p>
            <p><strong>Data:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
            <hr>
        `;
        historicoContent.appendChild(entryElement);
    });
}

// Exibir o modal
function openModal() {
    loadShapeHistory();  // Carregar o histórico no modal
    document.getElementById('historico-modal').style.display = 'block';
}

// Fechar o modal
function closeModal() {
    document.getElementById('historico-modal').style.display = 'none';
}
