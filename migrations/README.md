# Миграция URL файлов в БД

## Описание

Этот скрипт мигрирует полные URL файлов в БД на относительные пути для более гибкого управления хранилищем.

**Формат хранения после миграции:**
- Старый формат: `https://s3.twcstorage.ru/bucket-name/path/to/file`
- Новый формат: `bucket-name/path/to/file`

## Преимущества

1. **Легкая смена хранилища** - достаточно изменить `S3_URL` в `.env`
2. **Нет дублирования данных** - базовый URL хранится только в конфигурации
3. **Гибкость** - можно использовать разные bucket'ы для разных файлов

## Как использовать

1. **Сделайте резервную копию БД:**
   ```bash
   pg_dump -U username -d database_name > backup_before_migration.sql
   ```

2. **Запустите миграцию:**
   ```bash
   psql -U username -d database_name -f migrate-file-urls.sql
   ```

3. **Проверьте результат:**
   ```sql
   SELECT "photoUrl" FROM teacher_profiles LIMIT 5;
   -- Должны быть относительные пути: bucket-name/images/xxx.jpg
   ```

4. **Перезапустите бэкенд:**
   ```bash
   pm2 restart backend
   # или
   npm run start:prod
   ```

## Что делает скрипт

Скрипт обновляет следующие таблицы:
- `teacher_profiles` (photoUrl, videoUrl)
- `posts` (images, videos, files, fileUrl, coverImage)
- `master_classes` (images, videos, files, fileUrl, coverImage)
- `presentations` (fileUrl, coverImage, previewImage)
- `publications` (fileUrl, coverImage, previewImage)
- `parent_sections` (files, coverImage)
- `life_in_dou` (mediaItems - JSON поле)
- `folders` (mediaItems - JSON поле)

## Откат миграции

Если нужно откатить изменения, используйте обратную миграцию (не включена, но можно создать аналогично).

## Примечания

- Скрипт безопасен для повторного запуска (идемпотентный)
- Обрабатывает как `https://s3.twcstorage.ru/`, так и `https://swift.twcstorage.ru/`
- Не изменяет URL, которые уже в относительном формате

