console.log("Script carregado");
let highestZIndex = 1;

function addTextBox() {
  let box = document.createElement("div");
  box.classList.add("draggable");
  box.classList.add("textBox");
  box.textContent = "Texto";
  box.style.left = "50px";
  box.style.top = "50px";
  box.id = "drag" + document.getElementsByClassName("draggable").length;
  
  box.setAttribute("contenteditable", "false");
  
  box.addEventListener("dblclick", function() {
    box.setAttribute("contenteditable", "true");
    box.focus();
  });
  
  box.addEventListener("blur", function() {
    box.setAttribute("contenteditable", "false");
  });
  
  let dragHandle = document.createElement("div");
  dragHandle.classList.add("drag-handle");
  dragHandle.setAttribute("contenteditable", "false");
  dragHandle.style.userSelect = "none";
  dragHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  box.appendChild(dragHandle);
  
  makeDraggable(box);
  document.getElementById("editor").appendChild(box);
}

function addChecklist() {
  const checklist = document.createElement("div");
  checklist.classList.add("draggable", "checklist-container");
  checklist.innerHTML = `
    <div class="task-item">
      <input type="checkbox">
      <span class="task-input" contenteditable="true">Tarefa 1</span>
    </div>
    <button class="add-task-button" onclick="addNewTask(this)">+ Adicionar Tarefa</button>
  `;
  
  checklist.style.left = "50px";
  checklist.style.top = "50px";
  
  checklist.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      this.parentElement.classList.toggle('completed', this.checked);
    });
  });
  
  const dragHandle = document.createElement("div");
  dragHandle.classList.add("drag-handle");
  dragHandle.style.userSelect = "none";
  dragHandle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  
  checklist.insertBefore(dragHandle, checklist.firstChild);
  makeDraggable(checklist);
  document.getElementById("editor").appendChild(checklist);
}

function addNewTask(button) {
  const taskList = button.previousElementSibling;
  const newTask = document.createElement("div");
  newTask.classList.add("task-item");
  newTask.innerHTML = `
    <input type="checkbox">
    <span class="task-input" contenteditable="true">Nova Tarefa</span>
  `;
  
  newTask.querySelector('input').addEventListener('change', function() {
    this.parentElement.classList.toggle('completed', this.checked);
  });
  
  taskList.parentNode.insertBefore(newTask, button);
}
function makeDraggable(element) {
  let isDragging = false;
  let offsetX, offsetY;

  const dragHandle = element.querySelector(".drag-handle");

  function startDrag(e) {
    highestZIndex++;
    element.style.zIndex = highestZIndex;
    isDragging = true;

    const editor = document.getElementById("editor");
    const editorRect = editor.getBoundingClientRect();

    let clientX = e.clientX ?? e.touches[0].clientX;
    let clientY = e.clientY ?? e.touches[0].clientY;

    offsetX = clientX - editorRect.left - element.offsetLeft;
    offsetY = clientY - editorRect.top - element.offsetTop;
    element.style.cursor = "grabbing";

    if (e.type === "touchstart") {
      e.preventDefault();
    }
  }

  function onDrag(e) {
    if (!isDragging) return;

    const editor = document.getElementById("editor");
    const editorRect = editor.getBoundingClientRect();

    let clientX = e.clientX ?? e.touches[0].clientX;
    let clientY = e.clientY ?? e.touches[0].clientY;

    const x = clientX - editorRect.left - offsetX;
    const y = clientY - editorRect.top - offsetY;

    const elementRect = element.getBoundingClientRect();
    const maxX = editorRect.width - elementRect.width;
    const maxY = editorRect.height - elementRect.height;

    element.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
    element.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;

    // Atualiza a posição do painel de ferramentas
    updateToolPanelPosition(element);

    if (e.type === "touchmove") {
      e.preventDefault();
    }
  }

  function endDrag() {
    isDragging = false;
    element.style.cursor = "grab";
  }

  // Eventos para mouse
  dragHandle.addEventListener("mousedown", startDrag);
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", endDrag);

  // Eventos para toque (mobile)
  dragHandle.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("touchmove", onDrag, { passive: false });
  document.addEventListener("touchend", endDrag);
}


function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  document.querySelector(".editor").classList.toggle("dark-mode");
  document.querySelector(".sidebar").classList.toggle("dark-mode");
  document.querySelectorAll(".draggable").forEach(el => el.classList.toggle("dark-mode"));
  
  let themebutton = document.querySelector(".theme-toggle");
  if (document.body.classList.contains("dark-mode")) {
    themebutton.classList.remove("fa-moon");
    themebutton.classList.add("fa-sun");
  } else {
    themebutton.classList.remove("fa-sun");
    themebutton.classList.add("fa-moon");
  }
}

function triggerImageUpload() {
  document.getElementById("imageInput").click();
}

function addImageFromFile(event) {
  let file = event.target.files[0];
  if (file && file.type.startsWith("image")) {
    let reader = new FileReader();
    reader.onload = function(e) {
      let container = document.createElement("div");
      container.classList.add("resizable-container");
      container.classList.add("imageBox");
      container.style.left = "50px";
      container.style.top = "50px";
      
      let img = document.createElement("img");
      img.src = e.target.result;
      container.classList.add("draggable");
      container.id = "drag" + document.getElementsByClassName("draggable").length;
      
      let dragHandle = document.createElement("div");
      dragHandle.classList.add("drag-handle");
      dragHandle.setAttribute("contenteditable", "false");
      dragHandle.style.userSelect = "none";
      dragHandle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
      container.appendChild(dragHandle);
      
      makeDraggable(container);
      document.getElementById("editor").appendChild(container);
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}
//show tools panel
function createToolPanel(element) {
  const toolPanel = document.createElement("div");
  toolPanel.classList.add("tool-panel");

  // Cria um input do tipo color
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = "#ffffff"; // Cor inicial (opcional)
  colorPicker.addEventListener("input", () => {
    element.style.backgroundColor = colorPicker.value; // Atualiza a cor de fundo do elemento
  });

  // Botão para excluir o elemento
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");

  // Adiciona o ícone de exclusão
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "https://img.icons8.com/?size=100&id=i6vYP02pzd0f&format=png&color=000000";
  deleteIcon.alt = "Excluir";
  deleteButton.appendChild(deleteIcon);

  // Adiciona um popup de confirmação ao clicar no botão
  deleteButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Evita que o evento se propague para o elemento pai
    const confirmDelete = confirm("Tem certeza que deseja excluir este elemento?");
    if (confirmDelete) {
      element.remove();
      toolPanel.remove();
    }
  });

  toolPanel.appendChild(colorPicker);
  toolPanel.appendChild(deleteButton);

  return toolPanel;
}

function showToolPanel(element) {
  // Verifica se já existe um painel de ferramentas para este elemento
  if (element.toolPanel && document.body.contains(element.toolPanel)) {
    return; // Se o painel já estiver visível, não faz nada
  }

  // Remove o painel existente, se houver
  if (element.toolPanel) {
    element.toolPanel.remove();
  }

  const toolPanel = createToolPanel(element);
  element.toolPanel = toolPanel; // Armazena uma referência ao painel no elemento

  // Adiciona o painel de ferramentas ao editor
  document.getElementById("editor").appendChild(toolPanel);

  // Força a renderização do painel de ferramentas antes de calcular a posição
  toolPanel.offsetHeight;

  // Atualiza a posição do painel de ferramentas
  updateToolPanelPosition(element);

  // Adiciona eventos para evitar que o painel desapareça ao mover o mouse para ele
  toolPanel.addEventListener("mouseenter", () => {
    clearTimeout(element.toolPanelTimeout); // Cancela o timeout se o mouse entrar no painel
  });

  toolPanel.addEventListener("mouseleave", () => {
    // Remove o painel imediatamente quando o mouse sai do painel
    toolPanel.remove();
    delete element.toolPanel;
  });

  // Oculta o painel de ferramentas quando o mouse sai do elemento (com delay)
  element.addEventListener("mouseleave", () => {
    // Remove o painel após um pequeno delay
    element.toolPanelTimeout = setTimeout(() => {
      toolPanel.remove();
      delete element.toolPanel;
    }, 300); // 300ms de delay
  });
}

function updateToolPanelPosition(element) {
  if (element.toolPanel) {
    const editor = document.getElementById("editor");
    const editorRect = editor.getBoundingClientRect(); // Obtém as coordenadas do editor
    const rect = element.getBoundingClientRect(); // Obtém as coordenadas do elemento
    const toolPanelHeight = element.toolPanel.offsetHeight; // Altura do painel de ferramentas

    // Posiciona o painel de ferramentas acima do elemento
    element.toolPanel.style.position = "absolute";
    element.toolPanel.style.top = `${rect.top - editorRect.top - toolPanelHeight - 10}px`; // 10px de margem
    element.toolPanel.style.left = `${rect.left - editorRect.left}px`;
  }
}

// Adiciona evento de mouseenter ao editor para detectar elementos .draggable
document.getElementById("editor").addEventListener("mouseenter", (event) => {
  const draggableElement = event.target.closest(".draggable");
  if (draggableElement) {
    // Verifica se o mouse já está sobre um painel de ferramentas
    const isOverToolPanel = event.target.closest(".tool-panel");
    if (!isOverToolPanel) {
      showToolPanel(draggableElement);
    }
  }
}, true);

