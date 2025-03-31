// Update date and time
function updateDateTime() {
    const now = new Date();
    
    // Update date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Update time
    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const timeElement = document.getElementById('current-time');
    const timeStr = now.toLocaleTimeString('en-US', timeOptions);
    timeElement.innerHTML = `<time>${timeStr}</time>`;
    
    // Update countdown days
    updateCountdowns(now);
    
    // Update calendar if day changes
    if (!lastDate || lastDate.getDate() !== now.getDate()) {
        generateCalendar(now);
        lastDate = now;
    }
}

// Update countdowns
function updateCountdowns(now) {
    // Abstract deadline - May 11, 2025
    const abstractDeadline = new Date(2025, 4, 11); // Month is 0-indexed (4 = May)
    
    // Full paper deadline - May 15, 2025
    const paperDeadline = new Date(2025, 4, 15);
    
    // Supplemental deadline - May 22, 2025
    const supplementalDeadline = new Date(2025, 4, 22);
    
    // Calculate days remaining
    document.getElementById('abstract-days').textContent = calculateDaysRemaining(now, abstractDeadline);
    document.getElementById('paper-days').textContent = calculateDaysRemaining(now, paperDeadline);
    document.getElementById('supplemental-days').textContent = calculateDaysRemaining(now, supplementalDeadline);
}

// Calculate days remaining
function calculateDaysRemaining(now, deadline) {
    // If we're past the deadline this year, calculate for next year
    if (now > deadline && deadline.getFullYear() === now.getFullYear()) {
        deadline.setFullYear(deadline.getFullYear() + 1);
    }
    
    const timeDiff = deadline - now;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Generate calendar
let lastDate = null;
function generateCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Days in month
    
    // Set month and year in header
    document.getElementById('calendar-month-year').textContent = 
        date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Clear calendar
    const calendarDaysContainer = document.getElementById('calendar-days');
    calendarDaysContainer.innerHTML = '';
    
    // Add empty days for start of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDaysContainer.appendChild(emptyDay);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        // Check if it's today
        if (i === date.getDate() && month === date.getMonth() && year === date.getFullYear()) {
            dayElement.classList.add('today');
        }
        
        // Check if it's a deadline
        const isAbstractDeadline = i === 11 && month === 4; // May 11
        const isPaperDeadline = i === 15 && month === 4; // May 15
        const isSupplementalDeadline = i === 22 && month === 4; // May 22
        
        if (isAbstractDeadline) {
            dayElement.classList.add('abstract-deadline');
            const indicator = document.createElement('span');
            indicator.className = 'deadline-indicator pulsing';
            dayElement.appendChild(indicator);
            if (!dayElement.classList.contains('today')) {
                dayElement.classList.add('pulsing');
            }
        } else if (isPaperDeadline) {
            dayElement.classList.add('paper-deadline');
            const indicator = document.createElement('span');
            indicator.className = 'deadline-indicator';
            dayElement.appendChild(indicator);
        } else if (isSupplementalDeadline) {
            dayElement.classList.add('supplemental-deadline');
            const indicator = document.createElement('span');
            indicator.className = 'deadline-indicator';
            dayElement.appendChild(indicator);
        }
        
        calendarDaysContainer.appendChild(dayElement);
    }
}

// Task management
const taskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const assignedTasksList = document.getElementById('assigned-tasks');
const completedTasksList = document.getElementById('completed-tasks');

// Load tasks from localStorage
let assignedTasks = JSON.parse(localStorage.getItem('neurips-assigned-tasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('neurips-completed-tasks')) || [];

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('neurips-assigned-tasks', JSON.stringify(assignedTasks));
    localStorage.setItem('neurips-completed-tasks', JSON.stringify(completedTasks));
}

// Render tasks
function renderTasks() {
    // Clear lists
    assignedTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';
    
    // Render assigned tasks
    if (assignedTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No assigned tasks';
        assignedTasksList.appendChild(emptyMessage);
    } else {
        assignedTasks.forEach(task => {
            const li = document.createElement('li');
            
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            li.appendChild(taskText);
            
            const actionDiv = document.createElement('div');
            actionDiv.className = 'task-actions';
            
            const completeBtn = document.createElement('button');
            completeBtn.className = 'task-btn complete-btn';
            completeBtn.textContent = '✓';
            completeBtn.title = 'Mark as completed';
            completeBtn.addEventListener('click', () => {
                completedTasks.push(task);
                assignedTasks = assignedTasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            actionDiv.appendChild(completeBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-btn delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Delete task';
            deleteBtn.addEventListener('click', () => {
                assignedTasks = assignedTasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            actionDiv.appendChild(deleteBtn);
            
            li.appendChild(actionDiv);
            assignedTasksList.appendChild(li);
        });
    }
    
    // Render completed tasks
    if (completedTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No completed tasks';
        completedTasksList.appendChild(emptyMessage);
    } else {
        completedTasks.forEach(task => {
            const li = document.createElement('li');
            
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            li.appendChild(taskText);
            
            const actionDiv = document.createElement('div');
            actionDiv.className = 'task-actions';
            
            const returnBtn = document.createElement('button');
            returnBtn.className = 'task-btn return-btn';
            returnBtn.textContent = '↩';
            returnBtn.title = 'Move back to assigned';
            returnBtn.addEventListener('click', () => {
                assignedTasks.push(task);
                completedTasks = completedTasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            actionDiv.appendChild(returnBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-btn delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Delete task';
            deleteBtn.addEventListener('click', () => {
                completedTasks = completedTasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });
            actionDiv.appendChild(deleteBtn);
            
            li.appendChild(actionDiv);
            completedTasksList.appendChild(li);
        });
    }
}

// Add new task
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const newTask = { id: Date.now(), text: taskText };
        assignedTasks.push(newTask);
        taskInput.value = '';
        saveTasks();
        renderTasks();
    }
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initialize
updateDateTime();
renderTasks();

// Update date and time every second
setInterval(updateDateTime, 1000);