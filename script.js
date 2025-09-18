let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentColumn = "todo";
let taskToDelete = null;
let currentFilter = { assignee: "", sprint: "", release: "", search: "" };


function openModal(status) {
    currentColumn = status;
    document.getElementById("taskModal").style.display = "block";
    document.getElementById("taskForm").reset();
}

function closeModal() {
    document.getElementById("taskModal").style.display = "none";
}


function openConfirmation(id) {
    taskToDelete = id;
    document.getElementById("confirmationModal").style.display = "block";
}

function closeConfirmation() {
    taskToDelete = null;
    document.getElementById("confirmationModal").style.display = "none";
}

function confirmDeleteTask() {
    if (taskToDelete !== null) {
        tasks = tasks.filter(t => t.id !== taskToDelete);
        saveTasks();
        renderTasks();
    }
    closeConfirmation();
}


function saveTask(event) {
    event.preventDefault();

    const newTask = {
        id: Date.now(),
        title: document.getElementById("taskTitle").value,
        description: document.getElementById("taskDescription").value,
        type: document.getElementById("taskType").value,
        priority: document.getElementById("taskPriority").value,
        assignee: document.getElementById("taskAssignee").value,
        status: currentColumn,
        sprint: "Sprint 1",
        release: "v1.0"
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeModal();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
    const columns = {
        todo: document.getElementById("todo-column"),
        progress: document.getElementById("progress-column"),
        review: document.getElementById("review-column"),
        done: document.getElementById("done-column")
    };


    Object.values(columns).forEach(col => col.innerHTML = "");


    tasks.filter(applyFilters).forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task-card");
        taskDiv.setAttribute("draggable", "true");
        taskDiv.dataset.id = task.id;

        taskDiv.innerHTML = `
            <h4>${task.title}</h4>
            <p>${task.description || ""}</p>
            <small>Tipo: ${task.type} | Prioridad: ${task.priority}</small><br>
            <small>Asignado: ${task.assignee || "Nadie"}</small><br>
            <small>Sprint: ${task.sprint}</small> | <small>Release: ${task.release}</small><br>
            <button class="btn btn-danger" onclick="openConfirmation(${task.id})">Eliminar</button>
        `;

     
        taskDiv.addEventListener("dragstart", dragStart);
        taskDiv.addEventListener("dragend", dragEnd);

        columns[task.status].appendChild(taskDiv);
    });

    updateCounts();
}


function updateCounts() {
    document.getElementById("todo-count").innerText =
        tasks.filter(t => t.status === "todo").length;
    document.getElementById("progress-count").innerText =
        tasks.filter(t => t.status === "progress").length;
    document.getElementById("review-count").innerText =
        tasks.filter(t => t.status === "review").length;
    document.getElementById("done-count").innerText =
        tasks.filter(t => t.status === "done").length;
}




let draggedTaskId = null;

function dragStart(e) {
    draggedTaskId = e.target.dataset.id;
    e.target.classList.add("dragging");
}

function dragEnd(e) {
    e.target.classList.remove("dragging");
}

document.querySelectorAll(".column").forEach(column => {
    const columnContent = column.querySelector(".column-content");
    const status = column.dataset.status;

    columnContent.addEventListener("dragover", e => {
        e.preventDefault();
    });

    columnContent.addEventListener("drop", e => {
        e.preventDefault();
        if (draggedTaskId) {
            const task = tasks.find(t => t.id == draggedTaskId);
            if (task) {
                task.status = status;
                saveTasks();
                renderTasks();
            }
        }
    });
});



function applyFilters(task) {
    if (currentFilter.assignee && task.assignee !== currentFilter.assignee) return false;
    if (currentFilter.sprint && task.sprint !== currentFilter.sprint) return false;
    if (currentFilter.release && task.release !== currentFilter.release) return false;
    if (currentFilter.search &&
        !task.title.toLowerCase().includes(currentFilter.search.toLowerCase()) &&
        !task.description.toLowerCase().includes(currentFilter.search.toLowerCase())) return false;
    return true;
}

function filterByAssignee() {
    const assignee = prompt("Filtrar por asignado (JP, BA, AA, AV). Deja vacío para limpiar:");
    currentFilter.assignee = assignee || "";
    renderTasks();
}

function filterBySprint() {
    const sprint = prompt("Filtrar por Sprint (ej: Sprint 1, Sprint 2). Deja vacío para limpiar:");
    currentFilter.sprint = sprint || "";
    renderTasks();
}

function filterByRelease() {
    const release = prompt("Filtrar por Release (ej: v1.0, v2.0). Deja vacío para limpiar:");
    currentFilter.release = release || "";
    renderTasks();
}

function searchTasks(e) {
    currentFilter.search = e.target.value;
    renderTasks();
}


function debugLocalStorage() {
    console.log("Tasks en localStorage:", JSON.parse(localStorage.getItem("tasks")));
}



document.addEventListener("DOMContentLoaded", () => {
    renderTasks();

    document.querySelector(".header-actions .btn:nth-child(2)").addEventListener("click", filterByAssignee);
    document.querySelector(".header-actions .btn:nth-child(3)").addEventListener("click", filterBySprint);
    document.querySelector(".header-actions .btn:nth-child(4)").addEventListener("click", filterByRelease);

    document.querySelector(".search-box").addEventListener("input", searchTasks);
});
