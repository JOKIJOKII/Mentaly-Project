// Função para carregar os elementos do usuário
function loadUserElements(userId) {
  fetch(`http://localhost:3000/load?userId=${userId}`)
    .then((response) => response.json())
    .then((elements) => {
      console.log('Elementos carregados:', elements);
      renderElements(elements); // Renderiza os elementos no editor
    })
    .catch((error) => {
      console.error('Erro ao carregar elementos:', error);
    });
}

function renderElements(elements, userId) {
  const editor = document.getElementById('editor');
  editor.innerHTML = ''; 

  elements.forEach((element) => {
    let el;

    if (element.type === 'text') {
      el = document.createElement('div');
      el.classList.add('draggable', 'textBox');
      el.textContent = element.content;
    } else if (element.type === 'image') {
      el = document.createElement('div');
      el.classList.add('draggable', 'imageBox');

      const img = document.createElement('img');
      img.src = element.content;
      el.appendChild(img);
    } else if (element.type === 'checklist') {
      el = document.createElement('div');
      el.classList.add('draggable', 'checklist-container');

      // tarefa
      const tasks = JSON.parse(element.content);
      tasks.forEach((task) => {
        const taskItem = document.createElement('div');
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `
          <input type="checkbox" ${task.completed ? 'checked' : ''}>
          <span class="task-input" contenteditable="true">${task.text}</span>
        `;
        el.appendChild(taskItem);
      });

      // botad addtext
      const addTaskButton = document.createElement('button');
      addTaskButton.classList.add('add-task-button');
      addTaskButton.textContent = '+ Adicionar Tarefa';
      addTaskButton.addEventListener('click', (e) => {
        e.preventDefault();
        addNewTask(addTaskButton);
        const elements = collectElements();
        autoSave(userId, elements); 
      });
      el.appendChild(addTaskButton);
    }

    const position = JSON.parse(element.position);
    el.style.position = 'absolute';
    el.style.top = `${position.top}px`;
    el.style.left = `${position.left}px`;
    el.style.width = `${element.width}px`;
    el.style.height = `${element.height}px`;

    // Adiciona o drag-handle
    const dragHandle = document.createElement('div');
    dragHandle.classList.add('drag-handle');
    el.appendChild(dragHandle);

    // Reaplica a funcionalidade de arrastar
    makeDraggable(el);

    // Adiciona o elemento ao editor
    editor.appendChild(el);
  });

}

// Função para salvar automaticamente
function autoSave(userId, elements) {
  fetch('http://localhost:3000/auto-save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, elements }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Dados salvos automaticamente:', data);
    })
    .catch((error) => {
      console.error('Erro ao salvar automaticamente:', error);
    });
}

// Função para coletar os elementos do editor
function collectElements() {
  const elements = [];

  // Coleta caixas de texto
  const textBoxes = document.querySelectorAll('.draggable.textBox');
  textBoxes.forEach((textBox) => {
    elements.push({
      type: 'text',
      content: textBox.textContent,
      position: JSON.stringify({
        top: textBox.offsetTop,
        left: textBox.offsetLeft,
      }),
      width: textBox.offsetWidth,
      height: textBox.offsetHeight,
    });
  });

  // Coleta caixas de imagem
  const imageBoxes = document.querySelectorAll('.draggable.imageBox');
  imageBoxes.forEach((imageBox) => {
    const img = imageBox.querySelector('img');
    elements.push({
      type: 'image',
      content: img.src, // Salva o caminho da imagem
      position: JSON.stringify({
        top: imageBox.offsetTop,
        left: imageBox.offsetLeft,
      }),
      width: imageBox.offsetWidth,
      height: imageBox.offsetHeight,
    });
  });

  // Coleta checklists
  const checklists = document.querySelectorAll('.draggable.checklist-container');
  checklists.forEach((checklist) => {
    const tasks = [];
    checklist.querySelectorAll('.task-item').forEach((task) => {
      tasks.push({
        text: task.querySelector('.task-input').textContent,
        completed: task.querySelector('input[type="checkbox"]').checked,
      });
    });

    elements.push({
      type: 'checklist',
      content: JSON.stringify(tasks),
      position: JSON.stringify({
        top: checklist.offsetTop,
        left: checklist.offsetLeft,
      }),
      width: checklist.offsetWidth,
      height: checklist.offsetHeight,
    });
  });

  return elements;
}


// Carrega os elementos quando a página é carregada
window.addEventListener('load', () => {
  const userId = localStorage.getItem('currentUser'); // ID do usuário logado
  if (userId) {
    loadUserElements(userId);

    // Configura o salvamento automático a cada 10 segundos
    setInterval(() => {
      const elements = collectElements();
      autoSave(userId, elements);
    }, 5000); // 10 segundos
  }
});