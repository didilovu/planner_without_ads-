import { test, expect } from "@playwright/test";
test("задачи, привычки, календарь, резервная копия и офлайн", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Мои маленькие ритуалы" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Добавить задачу: Сегодня", exact: true })
    .click();
  await page.getByLabel("Что хочется сделать?").fill("Полить цветы");
  await page.getByLabel("Приоритет").selectOption("1");
  await page.getByRole("button", { name: "Сохранить задачу" }).click();
  await expect(page.getByText("Полить цветы", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Выполнить: Полить цветы", exact: true })
    .click();
  await page.getByRole("button", { name: /Выполнено \d/ }).click();
  await expect(page.getByText("Полить цветы", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Вернуть задачу: Полить цветы", exact: true })
    .click();
  await page.getByRole("button", { name: "Мои планы", exact: true }).click();
  await expect(page.getByText("Полить цветы", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Изменить: Полить цветы", exact: true })
    .click();
  await page.getByLabel("Что хочется сделать?").fill("Полить любимые цветы");
  await page.getByRole("button", { name: "Сохранить задачу" }).click();
  await page
    .getByRole("button", { name: "Добавить привычку", exact: true })
    .click();
  await page.getByLabel("Название", { exact: true }).fill("Стакан воды");
  await page.getByRole("button", { name: "Сохранить привычку" }).click();
  await page
    .getByRole("button", { name: "Добавить привычку", exact: true })
    .click();
  await page.getByLabel("Название", { exact: true }).fill("Читать книгу");
  await page.getByRole("button", { name: "Чтение", exact: true }).click();
  await page.getByRole("button", { name: "Сохранить привычку" }).click();
  await page
    .getByRole("button", { name: "Отметить: Стакан воды", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /Черепашка|победа|шаг|молодец|вперёд/ }),
  ).toBeVisible();
  await expect(page.locator(".habit-item").first()).toContainText(
    "Читать книгу",
  );
  await page
    .getByRole("button", {
      name: "Подробнее о привычке: Стакан воды",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Отслеживание выполнения привычки" })
    .click();
  await expect(page.locator(".calendar-day.done")).toHaveCount(1);
  await expect(page.locator(".month-count")).toContainText("1");
  await page.getByRole("button", { name: "Предыдущий месяц" }).click();
  await expect(page.locator(".month-count")).toContainText("0");
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page
    .getByRole("button", { name: "Настройки и резервные копии" })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Экспортировать в JSON/ }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await page.reload();
  await expect(
    page.getByText("Полить любимые цветы", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Отменить: Стакан воды", exact: true }),
  ).toBeVisible();
  // Wait for an active worker and its precache before taking the network away.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((r) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => r(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  // The replacement mascot must decode from the service worker cache offline.
  expect(
    await page.evaluate(async () => {
      const source = document
        .querySelector(".turtle image")
        ?.getAttribute("href");
      if (!source) return false;
      const response = await fetch(source);
      const image = await createImageBitmap(await response.blob());
      const decoded = response.ok && image.width > 0 && image.height > 0;
      image.close();
      return decoded;
    }),
  ).toBe(true);
  await expect(
    page.getByText("Полить любимые цветы", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Отметить: Читать книгу", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Отменить: Читать книгу", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Отменить: Читать книгу", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await page
    .getByRole("button", { name: "Настройки и резервные копии" })
    .click();
  page.once("dialog", (d) => d.accept());
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(
    page.getByRole("button", { name: "Отметить: Читать книгу", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: test.info().outputPath("desktop.png"),
    fullPage: true,
  });
});
test("смена локального дня сохраняет историю и переносит задачи", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-23T16:59:30Z") }); // 23:59 Novosibirsk
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить привычку", exact: true })
    .click();
  await page.getByLabel("Название", { exact: true }).fill("Вечерняя прогулка");
  await page.getByRole("button", { name: "Сохранить привычку" }).click();
  await page
    .getByRole("button", { name: "Отметить: Вечерняя прогулка", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Добавить задачу: Завтра", exact: true })
    .click();
  await page.getByLabel("Что хочется сделать?").fill("Завтрашнее дело");
  await page.getByRole("button", { name: "Сохранить задачу" }).click();
  await page.clock.fastForward(60000);
  await expect(
    page.getByRole("button", {
      name: "Отметить: Вечерняя прогулка",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".task-section.today")).toContainText(
    "Завтрашнее дело",
  );
  await page
    .getByRole("button", {
      name: "Подробнее о привычке: Вечерняя прогулка",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Отслеживание выполнения привычки" })
    .click();
  await expect(page.locator(".calendar-day.done")).toHaveCount(1);
});

test("ошибка записи видна в форме и не создаёт несохранённую задачу", async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить задачу: Сегодня", exact: true })
    .click();
  await page.getByLabel("Что хочется сделать?").fill("Не потерять текст");
  await page.getByRole("button", { name: "Сохранить задачу" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Не удалось сохранить",
  );
  await expect(page.getByLabel("Что хочется сделать?")).toHaveValue(
    "Не потерять текст",
  );
  await page.getByRole("button", { name: "Закрыть", exact: true }).click();
  await expect(page.locator(".task")).toHaveCount(0);
});

test("неверный импорт не заменяет данные; мобильная вёрстка без переполнения", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 375, 640, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "Настройки и резервные копии" })
    .click();
  await page.locator("input[type=file]").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"tasks":[{}],"habits":[]}'),
  });
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "не соответствует формату",
  );
});

test("редактирование расписания и удаление привычки и задачи", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Добавить привычку", exact: true })
    .click();
  await page.getByLabel("Название", { exact: true }).fill("Прогулка");
  await page.getByLabel("Повторять").selectOption("interval");
  await page.getByLabel("Каждые … дней").fill("3");
  await page.getByRole("button", { name: "Сохранить привычку" }).click();
  await page
    .getByRole("button", {
      name: "Подробнее о привычке: Прогулка",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Каждые 3 дн.");
  await page.getByRole("button", { name: "Изменить", exact: true }).click();
  await page.getByLabel("Название", { exact: true }).fill("Тихая прогулка");
  await page.getByLabel("Повторять").selectOption("weekdays");
  await page.getByRole("button", { name: "Сб", exact: true }).click();
  await page.getByRole("button", { name: "Сохранить привычку" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page
    .getByRole("button", {
      name: "Подробнее о привычке: Тихая прогулка",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Сб");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Удалить", exact: true }).click();
  await expect(page.locator(".habit-item:not(.new-habit)")).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Добавить задачу: В течение недели",
      exact: true,
    })
    .click();
  await page.getByLabel("Что хочется сделать?").fill("Недельная задача");
  await page.getByRole("button", { name: "Сохранить задачу" }).click();
  await expect(page.locator(".task-section.week")).toContainText(
    "Недельная задача",
  );
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Удалить: Недельная задача", exact: true })
    .click();
  await expect(page.locator(".task")).toHaveCount(0);
});
