const API_BASE_URL = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');

  // Функция для создания элемента задачи
  function createTodoItem(task) {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true'); // Делаем элемент перетаскиваемым
    li.dataset.id = task.id; // Сохраняем ID задачи

    // Контейнер для текста и приоритета
    const taskContent = document.createElement('div');
    taskContent.style.display = 'flex';
    taskContent.style.alignItems = 'center';

    // Создаем индикатор приоритета
    const priorityIndicator = document.createElement('span');
    priorityIndicator.classList.add('priority-indicator');
    priorityIndicator.dataset.priority = task.priority;

    // Определяем цвет индикатора
    if (task.priority === 'green') {
      priorityIndicator.classList.add('priority-low');
    } else if (task.priority === 'yellow') {
      priorityIndicator.classList.add('priority-medium');
    } else if (task.priority === 'red') {
      priorityIndicator.classList.add('priority-high');
    }

    // Текст задачи
    const taskText = document.createTextNode(task.title);

    // Добавляем индикатор и текст в контейнер
    taskContent.appendChild(priorityIndicator);
    taskContent.appendChild(taskText);

    // Кнопка удаления
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.classList.add('delete');
    deleteButton.addEventListener('click', () => {
      deleteTask(task.id);
    });

    // Добавляем контент и кнопку удаления в задачу
    li.appendChild(taskContent);
    li.appendChild(deleteButton);

    // Логика перетаскивания
    li.addEventListener('dragstart', () => {
      li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
    });

    // Логика изменения приоритета
    priorityIndicator.addEventListener('click', () => {
      const currentPriority = priorityIndicator.dataset.priority;

      let newPriority;
      if (currentPriority === 'green') {
        newPriority = 'yellow';
      } else if (currentPriority === 'yellow') {
        newPriority = 'red';
      } else {
        newPriority = 'green';
      }

      updateTaskPriority(task.id, newPriority);
    });

    return li;
  }

  // Загрузка задач с сервера
  async function loadTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasks = await response.json();
      tasks.forEach((task) => {
        const todoItem = createTodoItem(task);
        list.appendChild(todoItem);
      });
      sortTasksByPriority();
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  // Добавление новой задачи
  async function addTask(title) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: '',
          priority: 'green',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      const newTask = await response.json();
      const todoItem = createTodoItem(newTask);
      list.appendChild(todoItem);
      sortTasksByPriority();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  // Удаление задачи
  async function deleteTask(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      const li = document.querySelector(`li[data-id="${id}"]`);
      if (li) {
        list.removeChild(li);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  // Обновление приоритета задачи
  async function updateTaskPriority(id, priority) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
          description: '',
          priority,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update task priority');
      }
      const li = document.querySelector(`li[data-id="${id}"]`);
      if (li) {
        const priorityIndicator = li.querySelector('.priority-indicator');
        priorityIndicator.dataset.priority = priority;

        // Обновляем классы для цвета
        priorityIndicator.className = 'priority-indicator';
        if (priority === 'green') {
          priorityIndicator.classList.add('priority-low');
        } else if (priority === 'yellow') {
          priorityIndicator.classList.add('priority-medium');
        } else if (priority === 'red') {
          priorityIndicator.classList.add('priority-high');
        }

        sortTasksByPriority();
      }
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  }

  // Сортировка задач по приоритету
  function sortTasksByPriority() {
    const tasks = Array.from(list.querySelectorAll('li'));

    tasks.sort((a, b) => {
      const priorityOrder = { red: 3, yellow: 2, green: 1 };
      const priorityA = a.querySelector('.priority-indicator').dataset.priority;
      const priorityB = b.querySelector('.priority-indicator').dataset.priority;

      return priorityOrder[priorityB] - priorityOrder[priorityA];
    });

    tasks.forEach((task) => list.appendChild(task));
  }

  // Обработка отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы

    const text = input.value.trim();
    if (text !== '') {
      addTask(text);
      input.value = ''; // Очищаем поле ввода
    }
  });

  // Логика перетаскивания между элементами
  list.addEventListener('dragover', (e) => {
    e.preventDefault(); // Разрешаем перетаскивание
    const dragging = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(list, e.clientY);

    if (afterElement == null) {
      list.appendChild(dragging);
    } else {
      list.insertBefore(dragging, afterElement);
    }

    sortTasksByPriority(); // Сортируем задачи после перетаскивания
  });

  // Функция для определения позиции перетаскиваемого элемента
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;
          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
    ).element;
  }

  // Загружаем задачи при запуске
  loadTasks();
});