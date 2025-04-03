document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');

  // Функция для создания новой задачи
  function createTodoItem(text) {
    const li = document.createElement('li');
    li.setAttribute('draggable', 'true'); // Делаем элемент перетаскиваемым

    // Контейнер для текста и приоритета
    const taskContent = document.createElement('div');
    taskContent.style.display = 'flex';
    taskContent.style.alignItems = 'center';

    // Создаем индикатор приоритета
    const priorityIndicator = document.createElement('span');
    priorityIndicator.classList.add('priority-indicator', 'priority-low');
    priorityIndicator.dataset.priority = 'low'; // По умолчанию низкий приоритет

    // Текст задачи
    const taskText = document.createTextNode(text);

    // Добавляем индикатор и текст в контейнер
    taskContent.appendChild(priorityIndicator);
    taskContent.appendChild(taskText);

    // Кнопка удаления
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';
    deleteButton.classList.add('delete');
    deleteButton.addEventListener('click', () => {
      list.removeChild(li);
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

      if (currentPriority === 'low') {
        priorityIndicator.className = 'priority-indicator priority-medium';
        priorityIndicator.dataset.priority = 'medium';
      } else if (currentPriority === 'medium') {
        priorityIndicator.className = 'priority-indicator priority-high';
        priorityIndicator.dataset.priority = 'high';
      } else {
        priorityIndicator.className = 'priority-indicator priority-low';
        priorityIndicator.dataset.priority = 'low';
      }

      sortTasksByPriority();
    });

    return li;
  }

  // Сортировка задач по приоритету
  function sortTasksByPriority() {
    const tasks = Array.from(list.querySelectorAll('li'));

    tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
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
      const todoItem = createTodoItem(text);
      list.appendChild(todoItem);
      input.value = ''; // Очищаем поле ввода
      sortTasksByPriority(); // Сортируем задачи после добавления
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
});