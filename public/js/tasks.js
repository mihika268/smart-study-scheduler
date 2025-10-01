// Tasks Manager
class TasksManager {
    constructor() {
        this.tasks = [];
        this.subjects = [];
        this.currentFilter = { status: 'all', subject: 'all', priority: 'all' };
        this.currentPage = 1;
        this.tasksPerPage = 10;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        await this.loadTasksPage();
        await this.loadSubjects();
        this.setupEventListeners();
        this.isInitialized = true;
    }

    async loadTasksPage() {
        const tasksPage = document.getElementById('tasksPage');
        if (!tasksPage) return;

        tasksPage.innerHTML = `
            <div class="tasks-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2>My Tasks</h2>
                <button class="btn btn-primary" id="addTaskBtn">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>

            <div class="tasks-filters" style="background: var(--bg-primary); padding: 20px; border-radius: var(--border-radius); margin-bottom: 20px;">
                <div class="filter-row" style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <div class="filter-group">
                        <label>Status</label>
                        <select id="statusFilter">
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="missed">Missed</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Subject</label>
                        <select id="subjectFilter">
                            <option value="all">All Subjects</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Priority</label>
                        <select id="priorityFilter">
                            <option value="all">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <button class="btn btn-secondary" id="clearFilters">Clear Filters</button>
                    </div>
                </div>
            </div>

            <div class="tasks-content">
                <div id="tasksGrid" class="tasks-grid"></div>
                <div id="tasksPagination" class="pagination"></div>
            </div>
        `;

        await this.loadTasks();
    }

    setupEventListeners() {
        // Add task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => this.showAddTaskModal());
        }

        // Filter controls
        const statusFilter = document.getElementById('statusFilter');
        const subjectFilter = document.getElementById('subjectFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const clearFilters = document.getElementById('clearFilters');

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilter.status = e.target.value;
                this.applyFilters();
            });
        }

        if (subjectFilter) {
            subjectFilter.addEventListener('change', (e) => {
                this.currentFilter.subject = e.target.value;
                this.applyFilters();
            });
        }

        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.currentFilter.priority = e.target.value;
                this.applyFilters();
            });
        }

        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    async loadTasks() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.tasksPerPage
            };

            if (this.currentFilter.status !== 'all') params.status = this.currentFilter.status;
            if (this.currentFilter.subject !== 'all') params.subject = this.currentFilter.subject;
            if (this.currentFilter.priority !== 'all') params.priority = this.currentFilter.priority;

            const response = await api.getTasks(params);
            
            if (response.success) {
                this.tasks = response.tasks;
                this.renderTasks();
                this.renderPagination(response.pagination);
            }
        } catch (error) {
            utils.handleError(error, 'Loading tasks');
        }
    }

    async loadSubjects() {
        try {
            const response = await api.getSubjects();
            if (response.success) {
                this.subjects = response.subjects;
                this.updateSubjectFilter();
            }
        } catch (error) {
            console.error('Error loading subjects:', error);
        }
    }

    updateSubjectFilter() {
        const subjectFilter = document.getElementById('subjectFilter');
        if (!subjectFilter) return;

        // Keep existing options and add new ones
        const existingOptions = Array.from(subjectFilter.options).map(opt => opt.value);
        
        this.subjects.forEach(subject => {
            if (!existingOptions.includes(subject)) {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectFilter.appendChild(option);
            }
        });
    }

    renderTasks() {
        const tasksGrid = document.getElementById('tasksGrid');
        if (!tasksGrid) return;

        if (this.tasks.length === 0) {
            tasksGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <h3>No tasks found</h3>
                    <p>Create your first task to get started!</p>
                    <button class="btn btn-primary" onclick="window.tasks.showAddTaskModal()">
                        <i class="fas fa-plus"></i> Add Task
                    </button>
                </div>
            `;
            return;
        }

        const tasksHTML = this.tasks.map(task => this.renderTaskCard(task)).join('');
        tasksGrid.innerHTML = tasksHTML;
    }

    renderTaskCard(task) {
        const priorityColor = utils.getPriorityColor(task.priority);
        const statusColor = utils.getStatusColor(task.status);
        const dueDate = task.due_date ? utils.formatDate(task.due_date) : 'No due date';
        const tags = task.tags || [];

        return `
            <div class="task-card" style="background: var(--bg-primary); border-radius: var(--border-radius); padding: 20px; box-shadow: var(--shadow); border-left: 4px solid ${priorityColor};">
                <div class="task-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                    <div class="task-title-section">
                        <h3 style="margin: 0 0 5px 0; color: var(--text-primary);">${task.title}</h3>
                        <div class="task-meta" style="display: flex; gap: 10px; align-items: center; font-size: 14px; color: var(--text-secondary);">
                            <span class="subject">${task.subject}</span>
                            <span class="badge" style="background: ${statusColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${task.status.replace('_', ' ')}</span>
                            <span class="priority" style="color: ${priorityColor}; font-weight: 500;">${task.priority} priority</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-sm btn-secondary" onclick="window.tasks.editTask(${task.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.tasks.deleteTask(${task.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                ${task.description ? `<p style="margin-bottom: 15px; color: var(--text-secondary);">${task.description}</p>` : ''}

                <div class="task-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    <div class="detail-item">
                        <small style="color: var(--text-secondary); display: block;">Duration</small>
                        <span style="font-weight: 500;">${utils.formatDuration(task.estimated_duration)}</span>
                    </div>
                    <div class="detail-item">
                        <small style="color: var(--text-secondary); display: block;">Due Date</small>
                        <span style="font-weight: 500;">${dueDate}</span>
                    </div>
                    <div class="detail-item">
                        <small style="color: var(--text-secondary); display: block;">Difficulty</small>
                        <span style="font-weight: 500;">${'★'.repeat(task.difficulty_level)}${'☆'.repeat(5 - task.difficulty_level)}</span>
                    </div>
                </div>

                ${tags.length > 0 ? `
                    <div class="task-tags" style="margin-bottom: 15px;">
                        ${tags.map(tag => `<span class="badge secondary" style="background: var(--secondary-color); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px;">${tag}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="task-footer" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="task-progress">
                        ${task.actual_duration > 0 ? `
                            <small style="color: var(--text-secondary);">
                                ${utils.formatDuration(task.actual_duration)} / ${utils.formatDuration(task.estimated_duration)} completed
                            </small>
                        ` : ''}
                    </div>
                    <div class="task-quick-actions">
                        ${task.status === 'pending' ? `
                            <button class="btn btn-sm btn-primary" onclick="window.tasks.startTask(${task.id})">
                                <i class="fas fa-play"></i> Start
                            </button>
                        ` : ''}
                        ${task.status === 'in_progress' ? `
                            <button class="btn btn-sm btn-success" onclick="window.tasks.completeTask(${task.id})">
                                <i class="fas fa-check"></i> Complete
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderPagination(pagination) {
        const paginationContainer = document.getElementById('tasksPagination');
        if (!paginationContainer || !pagination) return;

        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button ${page === 1 ? 'disabled' : ''} onclick="window.tasks.goToPage(${page - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
            paginationHTML += `
                <button class="${i === page ? 'active' : ''}" onclick="window.tasks.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        paginationHTML += `
            <button ${page === pages ? 'disabled' : ''} onclick="window.tasks.goToPage(${page + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    showAddTaskModal() {
        const modalContent = `
            <form id="addTaskForm">
                <div class="form-group">
                    <label for="taskTitle">Task Title *</label>
                    <input type="text" id="taskTitle" name="title" required>
                </div>
                
                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea id="taskDescription" name="description" rows="3"></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <label for="taskSubject">Subject *</label>
                        <input type="text" id="taskSubject" name="subject" list="subjectsList" required>
                        <datalist id="subjectsList">
                            ${this.subjects.map(subject => `<option value="${subject}">`).join('')}
                        </datalist>
                    </div>
                    <div class="form-col">
                        <label for="taskPriority">Priority</label>
                        <select id="taskPriority" name="priority">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <label for="taskDuration">Estimated Duration (minutes) *</label>
                        <input type="number" id="taskDuration" name="estimated_duration" min="5" max="480" required>
                    </div>
                    <div class="form-col">
                        <label for="taskDifficulty">Difficulty Level</label>
                        <select id="taskDifficulty" name="difficulty_level">
                            <option value="1">1 - Very Easy</option>
                            <option value="2">2 - Easy</option>
                            <option value="3" selected>3 - Medium</option>
                            <option value="4">4 - Hard</option>
                            <option value="5">5 - Very Hard</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="taskDueDate">Due Date</label>
                    <input type="datetime-local" id="taskDueDate" name="due_date">
                </div>
                
                <div class="form-group">
                    <label for="taskTags">Tags (comma-separated)</label>
                    <input type="text" id="taskTags" name="tags" placeholder="e.g., exam, homework, project">
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Task</button>
                </div>
            </form>
        `;

        utils.showModal(modalContent, 'Add New Task');

        const addTaskForm = document.getElementById('addTaskForm');
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', (e) => this.handleAddTask(e));
        }
    }

    async handleAddTask(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Process tags
        if (data.tags) {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // Convert numeric fields
        data.estimated_duration = parseInt(data.estimated_duration);
        data.difficulty_level = parseInt(data.difficulty_level);

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.createTask(data);
            
            if (response.success) {
                utils.showToast('Task created successfully!', 'success');
                utils.hideModal();
                await this.loadTasks();
                await this.loadSubjects(); // Refresh subjects list
                
                // Show AI suggestion if provided
                if (response.suggestion) {
                    setTimeout(() => {
                        utils.showToast(response.suggestion.message, 'info', 8000);
                    }, 1000);
                }
            }
        } catch (error) {
            utils.handleError(error, 'Creating task');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async editTask(taskId) {
        try {
            const response = await api.getTask(taskId);
            if (!response.success) return;

            const task = response.task;
            const modalContent = `
                <form id="editTaskForm">
                    <input type="hidden" name="id" value="${task.id}">
                    
                    <div class="form-group">
                        <label for="editTaskTitle">Task Title *</label>
                        <input type="text" id="editTaskTitle" name="title" value="${task.title}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTaskDescription">Description</label>
                        <textarea id="editTaskDescription" name="description" rows="3">${task.description || ''}</textarea>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col">
                            <label for="editTaskSubject">Subject *</label>
                            <input type="text" id="editTaskSubject" name="subject" value="${task.subject}" list="editSubjectsList" required>
                            <datalist id="editSubjectsList">
                                ${this.subjects.map(subject => `<option value="${subject}">`).join('')}
                            </datalist>
                        </div>
                        <div class="form-col">
                            <label for="editTaskPriority">Priority</label>
                            <select id="editTaskPriority" name="priority">
                                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col">
                            <label for="editTaskStatus">Status</label>
                            <select id="editTaskStatus" name="status">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="in_progress" ${task.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                                <option value="missed" ${task.status === 'missed' ? 'selected' : ''}>Missed</option>
                            </select>
                        </div>
                        <div class="form-col">
                            <label for="editTaskDifficulty">Difficulty Level</label>
                            <select id="editTaskDifficulty" name="difficulty_level">
                                <option value="1" ${task.difficulty_level === 1 ? 'selected' : ''}>1 - Very Easy</option>
                                <option value="2" ${task.difficulty_level === 2 ? 'selected' : ''}>2 - Easy</option>
                                <option value="3" ${task.difficulty_level === 3 ? 'selected' : ''}>3 - Medium</option>
                                <option value="4" ${task.difficulty_level === 4 ? 'selected' : ''}>4 - Hard</option>
                                <option value="5" ${task.difficulty_level === 5 ? 'selected' : ''}>5 - Very Hard</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-col">
                            <label for="editTaskDuration">Estimated Duration (minutes) *</label>
                            <input type="number" id="editTaskDuration" name="estimated_duration" value="${task.estimated_duration}" min="5" max="480" required>
                        </div>
                        <div class="form-col">
                            <label for="editTaskActualDuration">Actual Duration (minutes)</label>
                            <input type="number" id="editTaskActualDuration" name="actual_duration" value="${task.actual_duration || 0}" min="0">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="editTaskDueDate">Due Date</label>
                        <input type="datetime-local" id="editTaskDueDate" name="due_date" value="${task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editTaskTags">Tags (comma-separated)</label>
                        <input type="text" id="editTaskTags" name="tags" value="${(task.tags || []).join(', ')}" placeholder="e.g., exam, homework, project">
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                        <button type="button" class="btn btn-secondary" onclick="hideModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Task</button>
                    </div>
                </form>
            `;

            utils.showModal(modalContent, 'Edit Task');

            const editTaskForm = document.getElementById('editTaskForm');
            if (editTaskForm) {
                editTaskForm.addEventListener('submit', (e) => this.handleEditTask(e));
            }

        } catch (error) {
            utils.handleError(error, 'Loading task for edit');
        }
    }

    async handleEditTask(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const taskId = data.id;
        delete data.id;

        // Process tags
        if (data.tags) {
            data.tags = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }

        // Convert numeric fields
        data.estimated_duration = parseInt(data.estimated_duration);
        data.actual_duration = parseInt(data.actual_duration);
        data.difficulty_level = parseInt(data.difficulty_level);

        const submitBtn = form.querySelector('button[type="submit"]');
        utils.setLoading(submitBtn, true);

        try {
            const response = await api.updateTask(taskId, data);
            
            if (response.success) {
                utils.showToast('Task updated successfully!', 'success');
                utils.hideModal();
                await this.loadTasks();
            }
        } catch (error) {
            utils.handleError(error, 'Updating task');
        } finally {
            utils.setLoading(submitBtn, false);
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await api.deleteTask(taskId);
            
            if (response.success) {
                utils.showToast('Task deleted successfully!', 'success');
                await this.loadTasks();
            }
        } catch (error) {
            utils.handleError(error, 'Deleting task');
        }
    }

    async startTask(taskId) {
        try {
            const response = await api.updateTask(taskId, { status: 'in_progress' });
            
            if (response.success) {
                utils.showToast('Task started!', 'success');
                await this.loadTasks();
                
                // Optionally redirect to timer
                if (confirm('Would you like to start the study timer for this task?')) {
                    window.app.showPage('timer');
                    if (window.timer) {
                        window.timer.startTaskTimer(taskId);
                    }
                }
            }
        } catch (error) {
            utils.handleError(error, 'Starting task');
        }
    }

    async completeTask(taskId) {
        try {
            const response = await api.updateTask(taskId, { status: 'completed' });
            
            if (response.success) {
                utils.showToast('Task completed! Great job! 🎉', 'success');
                await this.loadTasks();
            }
        } catch (error) {
            utils.handleError(error, 'Completing task');
        }
    }

    async applyFilters() {
        this.currentPage = 1;
        await this.loadTasks();
    }

    clearAllFilters() {
        this.currentFilter = { status: 'all', subject: 'all', priority: 'all' };
        
        const statusFilter = document.getElementById('statusFilter');
        const subjectFilter = document.getElementById('subjectFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (statusFilter) statusFilter.value = 'all';
        if (subjectFilter) subjectFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        
        this.applyFilters();
    }

    async goToPage(page) {
        this.currentPage = page;
        await this.loadTasks();
    }
}

// Initialize tasks manager
window.tasks = new TasksManager();
