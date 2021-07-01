*****************************
Основной функционал - API
*****************************

Содержит основные функции для отображения тестов.
содержит все для аутентификации и регистрации. Здесь расположена модель Base User.

Используемые URL:

- **/auth_login** - Метод API. Аутентификация логин
- **/auth_logout** - Метод API. Аутентификация логаут
- **/auth_register** - Метод API. Регистрация
- **/create_exercise** - Метод API. Создание Упражнения(Exercise)
- **/view_exercise/<int:exercise_id>** - Метод API. Отображение существующего Упражнения(Exercise) по ID
- **/redact_exrcise/<int:exercise_id>** - Метод API. Редактирования существующего Упражнения(Exercise) по ID
- **/get_exercise_data/<int:exercise_id>** - *Только для разработчиков.* Метод API. Выдает данные об Упражнении(Exercise)
- **/get_schedule** - *Только для разработчиков.* Метод API. Выдает расписание Урока(Lesson)

Модели:

.. automodule:: app.api.models
    :members:

View-функции:

.. automodule:: app.api.views
    :members:

Конфигурация приложения(App configuration):

.. automodule:: app.api.apps
    :members:
