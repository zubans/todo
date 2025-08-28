document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = 'http://localhost:8080'; // Базовый URL API
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');

  let currentTaskId = null; // ID текущей редактируемой задачи

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

    // Подсказка с описанием
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    tooltip.textContent = task.description || 'Нет описания';

    // Добавляем индикатор, текст и подсказку в контейнер
    taskContent.appendChild(priorityIndicator);
    taskContent.appendChild(taskText);
    taskContent.appendChild(tooltip);

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

    // Открытие формы редактирования при клике на задачу
    li.addEventListener('click', () => openEditForm(li, task));

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
        headers: { 'Content-Type': 'application/json' },
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

  // Обновление задачи
  async function updateTask(id, updatedData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  // Открытие формы редактирования
  function openEditForm(li, task) {
    // Если уже есть открытая форма, закрываем её
    const existingForm = list.querySelector('.edit-form');
    if (existingForm) {
      closeEditForm(existingForm);
    }

    // Создаем форму редактирования
    const editForm = document.createElement('form');
    editForm.classList.add('edit-form');

    // Поле заголовка
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Заголовок:';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.required = true;

    // Поле описания
    const descriptionLabel = document.createElement('label');
    descriptionLabel.textContent = 'Описание:';
    const descriptionTextarea = document.createElement('textarea');
    descriptionTextarea.rows = 4;
    descriptionTextarea.value = task.description || '';

    // Выбор приоритета
    const priorityLabel = document.createElement('label');
    priorityLabel.textContent = 'Приоритет:';
    const prioritySelect = document.createElement('select');
    const priorities = ['green', 'yellow', 'red'];
    priorities.forEach((priority) => {
      const option = document.createElement('option');
      option.value = priority;
      option.textContent = getPriorityName(priority);
      if (priority === task.priority) {
        option.selected = true;
      }
      prioritySelect.appendChild(option);
    });

    // Кнопка сохранения
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Сохранить';

    // Добавляем элементы в форму
    editForm.appendChild(titleLabel);
    editForm.appendChild(titleInput);
    editForm.appendChild(descriptionLabel);
    editForm.appendChild(descriptionTextarea);
    editForm.appendChild(priorityLabel);
    editForm.appendChild(prioritySelect);
    editForm.appendChild(saveButton);

    // Добавляем форму под задачей
    list.insertBefore(editForm, li.nextSibling);

    // Обработка отправки формы
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedTask = {
        title: titleInput.value.trim(),
        description: descriptionTextarea.value.trim(),
        priority: prioritySelect.value,
      };

      if (!updatedTask.title) {
        alert('Заголовок не может быть пустым');
        return;
      }

      try {
        const updatedTaskData = await updateTask(task.id, updatedTask);
        li.querySelector('.priority-indicator').dataset.priority = updatedTaskData.priority;
        li.querySelector('.priority-indicator').className = 'priority-indicator';
        if (updatedTaskData.priority === 'green') {
          li.querySelector('.priority-indicator').classList.add('priority-low');
        } else if (updatedTaskData.priority === 'yellow') {
          li.querySelector('.priority-indicator').classList.add('priority-medium');
        } else if (updatedTaskData.priority === 'red') {
          li.querySelector('.priority-indicator').classList.add('priority-high');
        }
        li.querySelector('.tooltip').textContent = updatedTaskData.description || 'Нет описания';
        li.querySelector('div').childNodes[1].textContent = updatedTaskData.title;

        closeEditForm(editForm); // Скрываем форму после сохранения
      } catch (error) {
        console.error('Error updating task:', error);
      }
    });
  }

  // Закрытие формы редактирования
  function closeEditForm(form) {
    form.remove(); // Удаляем форму из DOM
  }

  // Получение имени приоритета
  function getPriorityName(priority) {
    switch (priority) {
      case 'green':
        return 'Низкий';
      case 'yellow':
        return 'Средний';
      case 'red':
        return 'Высокий';
      default:
        return '';
    }
  }

  // Обработка отправки формы добавления задачи
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

  // Загружаем задачи при запуске
  loadTasks();
});
