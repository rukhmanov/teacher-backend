# Миграция URL файлов в БД

## Описание

Эти скрипты мигрируют URL файлов в БД для более гибкого управления хранилищем.

**Формат хранения после миграции:**
- Старый формат: `https://s3.twcstorage.ru/bucket-name/path/to/file`
- Новый формат: `bucket-name/path/to/file`

## Скрипты миграции

### 1. `migrate-file-urls.sql` - Нормализация URL
Извлекает относительные пути из полных URL, удаляя базовый URL хранилища.

### 2. `migrate-bucket-name.sql` - Замена bucket name
Заменяет старый bucket name (`1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc`) на новый (`79dfaf80-vospitatel`) во всех URL.

## Преимущества

1. **Легкая смена хранилища** - достаточно изменить `S3_URL` в `.env`
2. **Нет дублирования данных** - базовый URL хранится только в конфигурации
3. **Гибкость** - можно использовать разные bucket'ы для разных файлов

## Как использовать

### Миграция нормализации URL (migrate-file-urls.sql)

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

### Миграция замены bucket name (migrate-bucket-name.sql)

**Используйте этот скрипт, если нужно заменить старый bucket name на новый во всех URL.**

1. **Сделайте резервную копию БД:**
   ```bash
   pg_dump -U username -d database_name > backup_before_bucket_migration.sql
   ```

2. **Запустите миграцию:**
   ```bash
   psql -U username -d database_name -f migrate-bucket-name.sql
   ```

3. **Проверьте результат:**
   ```sql
   SELECT "mediaItems" FROM life_in_dou LIMIT 1;
   -- URL должны содержать новый bucket name: 79dfaf80-vospitatel
   ```

4. **Перезапустите бэкенд:**
   ```bash
   pm2 restart backend
   # или
   npm run start:prod
   ```

## Что делают скрипты

### migrate-file-urls.sql
Обновляет следующие таблицы, извлекая относительные пути:
- `teacher_profiles` (photoUrl, videoUrl)
- `posts` (images, videos, files, fileUrl, coverImage)
- `master_classes` (images, videos, files, fileUrl, coverImage)
- `presentations` (fileUrl, coverImage, previewImage)
- `publications` (fileUrl, coverImage, previewImage)
- `parent_sections` (files, coverImage)
- `life_in_dou` (mediaItems - JSON поле)
- `folders` (mediaItems - JSON поле)

### migrate-bucket-name.sql
Заменяет старый bucket name на новый во всех таблицах:
- `life_in_dou` (mediaItems - JSON поле)
- `folders` (mediaItems - JSON поле)
- `teacher_profiles` (photoUrl)
- `posts` (images, videos, coverImage)
- `master_classes` (images, videos, coverImage)
- `presentations` (fileUrl, coverImage)
- `parent_sections` (files, coverImage)

## Откат миграции

Если нужно откатить изменения, используйте обратную миграцию (не включена, но можно создать аналогично).

## Примечания

- Оба скрипта безопасны для повторного запуска (идемпотентные)
- `migrate-file-urls.sql` обрабатывает как `https://s3.twcstorage.ru/`, так и `https://swift.twcstorage.ru/`
- Скрипты не изменяют URL, которые уже в правильном формате
- **Важно:** Перед заменой bucket name убедитесь, что файлы физически перенесены в новый bucket, иначе ссылки будут вести на несуществующие файлы

