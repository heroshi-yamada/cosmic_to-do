document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const allBtn = document.getElementById('allBtn');
    const activeBtn = document.getElementById('activeBtn');
    const completedBtn = document.getElementById('completedBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    renderTasks();
    updateEmptyState();
    
    // Add new task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Filter buttons
    allBtn.addEventListener('click', () => setFilter('all'));
    activeBtn.addEventListener('click', () => setFilter('active'));
    completedBtn.addEventListener('click', () => setFilter('completed'));
    
    // Clear completed tasks
    clearBtn.addEventListener('click', clearCompleted);
    
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            taskInput.value = '';
            updateEmptyState();
            
            // Add glow effect to the new task
            const newTaskElement = document.getElementById(`task-${newTask.id}`);
            if (newTaskElement) {
                newTaskElement.classList.add('glow');
                setTimeout(() => {
                    newTaskElement.classList.remove('glow');
                }, 1000);
            }
        }
    }
    
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            updateEmptyState();
            return;
        }
        
        emptyState.style.display = 'none';
        
        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.id = `task-${task.id}`;
            taskElement.className = `task-item flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600 ${task.completed ? 'completed opacity-80' : ''}`;
            
            taskElement.innerHTML = `
                <div class="flex items-center">
                    <button class="complete-btn mr-3 w-6 h-6 rounded-full border-2 ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-500'} flex items-center justify-center">
                        ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </button>
                    <span class="task-text ${task.completed ? 'text-gray-400' : 'text-gray-100'}">${task.text}</span>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="text-xs text-gray-500">${formatDate(task.createdAt)}</span>
                    <button class="edit-btn text-gray-400 hover:text-blue-400">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="delete-btn text-gray-400 hover:text-red-400">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            taskList.appendChild(taskElement);
            
            // Add event listeners
            const completeBtn = taskElement.querySelector('.complete-btn');
            const editBtn = taskElement.querySelector('.edit-btn');
            const deleteBtn = taskElement.querySelector('.delete-btn');
            const taskText = taskElement.querySelector('.task-text');
            
            completeBtn.addEventListener('click', () => toggleComplete(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            editBtn.addEventListener('click', () => {
                const currentText = task.text;
                taskText.innerHTML = `
                    <input type="text" value="${currentText}" class="edit-input bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
                `;
                
                const editInput = taskText.querySelector('.edit-input');
                editInput.focus();
                
                editInput.addEventListener('blur', () => {
                    updateTaskText(task.id, editInput.value);
                });
                
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        updateTaskText(task.id, editInput.value);
                    }
                });
            });
            
            // Double-click to edit
            taskText.addEventListener('dblclick', () => {
                const currentText = task.text;
                taskText.innerHTML = `
                    <input type="text" value="${currentText}" class="edit-input bg-gray-800 text-white px-2 py-1 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500">
                `;
                
                const editInput = taskText.querySelector('.edit-input');
                editInput.focus();
                
                editInput.addEventListener('blur', () => {
                    updateTaskText(task.id, editInput.value);
                });
                
                editInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        updateTaskText(task.id, editInput.value);
                    }
                });
            });
        });
        
        // Make tasks draggable
        makeTasksDraggable();
    }
    
    function toggleComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateEmptyState();
    }
    
    function updateTaskText(taskId, newText) {
        if (newText.trim()) {
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, text: newText.trim() };
                }
                return task;
            });
            
            saveTasks();
            renderTasks();
        }
    }
    
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
        updateEmptyState();
    }
    
    function setFilter(filter) {
        currentFilter = filter;
        
        // Update active button
        allBtn.className = 'filter-btn px-4 py-2 rounded-lg font-medium';
        activeBtn.className = 'filter-btn px-4 py-2 rounded-lg font-medium';
        completedBtn.className = 'filter-btn px-4 py-2 rounded-lg font-medium';
        
        if (filter === 'all') {
            allBtn.className = 'filter-btn px-4 py-2 bg-green-600 rounded-lg font-medium';
        } else if (filter === 'active') {
            activeBtn.className = 'filter-btn px-4 py-2 bg-green-600 rounded-lg font-medium';
        } else {
            completedBtn.className = 'filter-btn px-4 py-2 bg-green-600 rounded-lg font-medium';
        }
        
        renderTasks();
    }
    
    function updateEmptyState() {
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            if (currentFilter === 'all') {
                emptyState.innerHTML = `
                    <i class="fas fa-moon text-5xl mb-4 opacity-30"></i>
                    <p class="text-xl">Your mission list is empty</p>
                    <p class="text-sm mt-2">Add your first task to get started</p>
                `;
            } else if (currentFilter === 'active') {
                emptyState.innerHTML = `
                    <i class="fas fa-check-circle text-5xl mb-4 opacity-30"></i>
                    <p class="text-xl">No active missions</p>
                    <p class="text-sm mt-2">All tasks are completed</p>
                `;
            } else {
                emptyState.innerHTML = `
                    <i class="fas fa-star text-5xl mb-4 opacity-30"></i>
                    <p class="text-xl">No completed missions</p>
                    <p class="text-sm mt-2">Complete some tasks to see them here</p>
                `;
            }
        } else {
            emptyState.style.display = 'none';
        }
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    function makeTasksDraggable() {
        const draggables = document.querySelectorAll('.task-item');
        
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
            });
            
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
            });
        });
        
        taskList.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (afterElement == null) {
                taskList.appendChild(draggable);
            } else {
                taskList.insertBefore(draggable, afterElement);
            }
            
            // Update tasks order based on new DOM position
            updateTasksOrder();
        });
    }
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    function updateTasksOrder() {
        const taskElements = document.querySelectorAll('.task-item');
        const newTasksOrder = [];
        
        taskElements.forEach(element => {
            const taskId = parseInt(element.id.split('-')[1]);
            const task = tasks.find(t => t.id === taskId);
            if (task) newTasksOrder.push(task);
        });
        
        tasks = newTasksOrder;
        saveTasks();
    }
});