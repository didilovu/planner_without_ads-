# Запуск проекта и публикация

Требования к приложению: [PROJECT_SPEC.md](../PROJECT_SPEC.md). Правила разработки: [AGENTS.md](../AGENTS.md).

## Локальный запуск

Нужен Node.js 22 или новее.

```sh
npm ci
npm run dev
```

Проверки: `npm test` и `npm run build`. Production-сборка появится в `dist`; проверить её можно через `npm run preview`. Офлайн-режим включён в production-сборке.

Для браузерных тестов установите Chromium командой `npx playwright install chromium`, затем выполните `npm run build` и `npm run test:e2e`. При использовании системного браузера: `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`.

## Бесплатная публикация

Для GitHub Pages выберите Settings → Pages → Source: GitHub Actions. Затем откройте Actions → «Опубликовать на GitHub Pages» → Run workflow и выберите `main`. Публикация запускается вручную.

Можно разместить содержимое `dist` на другом статическом HTTPS-хостинге. Сервер и база данных не нужны. Установку на Android/iPhone проверяйте после HTTPS-публикации.

## Устройство приложения

Модели и календарные правила находятся в `src/models.ts` и `src/logic.ts`, IndexedDB — в `src/storage.ts`, действия и актуализация даты — в `src/usePlanner.ts`, интерфейс — в `src/components` и `src/App.tsx`. Настройки PWA находятся в `vite.config.ts`.

Календарные даты хранятся в локальном формате `yyyy-MM-dd`. Недельный срок — воскресенье. Просроченные задачи отображаются сегодня без изменения исходного срока. Изменение расписания привычки меняет плановые дни календаря, сохраняя фактические отметки. Обновления приложения не удаляют IndexedDB.
