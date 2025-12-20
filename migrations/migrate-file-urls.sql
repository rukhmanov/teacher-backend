-- Миграция URL файлов в БД: извлечение относительных путей из полных URL
-- Формат хранения: bucket-name/path/to/file
-- Старый формат: https://s3.twcstorage.ru/bucket-name/path/to/file

-- Обновление teacher_profiles
UPDATE teacher_profiles
SET 
  "photoUrl" = CASE 
    WHEN "photoUrl" LIKE 'https://s3.twcstorage.ru/%' THEN 
      SUBSTRING("photoUrl" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
    WHEN "photoUrl" LIKE 'https://swift.twcstorage.ru/%' THEN 
      SUBSTRING("photoUrl" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
    ELSE "photoUrl"
  END
WHERE "photoUrl" LIKE 'https://%';

-- Обновление posts
UPDATE posts
SET 
  "coverImage" = CASE 
    WHEN "coverImage" LIKE 'https://s3.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
    WHEN "coverImage" LIKE 'https://swift.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
    ELSE "coverImage"
  END
WHERE "coverImage" LIKE 'https://%';

-- Обновление массивов images, videos, files в posts
-- Примечание: simple-array хранится как строка с разделителями запятыми
UPDATE posts
SET 
  images = (
    SELECT string_agg(
      CASE 
        WHEN value LIKE 'https://s3.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://s3.twcstorage.ru/') + 1)
        WHEN value LIKE 'https://swift.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://swift.twcstorage.ru/') + 1)
        ELSE value
      END,
      ','
    )
    FROM unnest(string_to_array(images, ',')) AS value
  )
WHERE images LIKE '%https://%';

UPDATE posts
SET 
  videos = (
    SELECT string_agg(
      CASE 
        WHEN value LIKE 'https://s3.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://s3.twcstorage.ru/') + 1)
        WHEN value LIKE 'https://swift.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://swift.twcstorage.ru/') + 1)
        ELSE value
      END,
      ','
    )
    FROM unnest(string_to_array(videos, ',')) AS value
  )
WHERE videos LIKE '%https://%';

-- Колонка files отсутствует в posts

-- Обновление master_classes
UPDATE master_classes
SET 
  "coverImage" = CASE 
    WHEN "coverImage" LIKE 'https://s3.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
    WHEN "coverImage" LIKE 'https://swift.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
    ELSE "coverImage"
  END
WHERE "coverImage" LIKE 'https://%';

UPDATE master_classes
SET 
  images = (
    SELECT string_agg(
      CASE 
        WHEN value LIKE 'https://s3.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://s3.twcstorage.ru/') + 1)
        WHEN value LIKE 'https://swift.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://swift.twcstorage.ru/') + 1)
        ELSE value
      END,
      ','
    )
    FROM unnest(string_to_array(images, ',')) AS value
  )
WHERE images LIKE '%https://%';

UPDATE master_classes
SET 
  videos = (
    SELECT string_agg(
      CASE 
        WHEN value LIKE 'https://s3.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://s3.twcstorage.ru/') + 1)
        WHEN value LIKE 'https://swift.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://swift.twcstorage.ru/') + 1)
        ELSE value
      END,
      ','
    )
    FROM unnest(string_to_array(videos, ',')) AS value
  )
WHERE videos LIKE '%https://%';

-- Колонка files отсутствует в master_classes

-- Обновление presentations
UPDATE presentations
SET 
  "fileUrl" = CASE 
    WHEN "fileUrl" LIKE 'https://s3.twcstorage.ru/%' THEN 
      SUBSTRING("fileUrl" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
    WHEN "fileUrl" LIKE 'https://swift.twcstorage.ru/%' THEN 
      SUBSTRING("fileUrl" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
    ELSE "fileUrl"
  END,
  "coverImage" = CASE 
    WHEN "coverImage" LIKE 'https://s3.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
    WHEN "coverImage" LIKE 'https://swift.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
    ELSE "coverImage"
  END
WHERE "fileUrl" LIKE 'https://%' OR "coverImage" LIKE 'https://%';

-- Обновление publications (таблица отсутствует в текущей схеме БД)
-- UPDATE publications
-- SET 
--   "fileUrl" = CASE 
--     WHEN "fileUrl" LIKE 'https://s3.twcstorage.ru/%' THEN 
--       SUBSTRING("fileUrl" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
--     WHEN "fileUrl" LIKE 'https://swift.twcstorage.ru/%' THEN 
--       SUBSTRING("fileUrl" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
--     ELSE "fileUrl"
--   END,
--   "coverImage" = CASE 
--     WHEN "coverImage" LIKE 'https://s3.twcstorage.ru/%' THEN 
--       SUBSTRING("coverImage" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
--     WHEN "coverImage" LIKE 'https://swift.twcstorage.ru/%' THEN 
--       SUBSTRING("coverImage" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
--     ELSE "coverImage"
--   END,
--   "previewImage" = CASE 
--     WHEN "previewImage" LIKE 'https://s3.twcstorage.ru/%' THEN 
--       SUBSTRING("previewImage" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
--     WHEN "previewImage" LIKE 'https://swift.twcstorage.ru/%' THEN 
--       SUBSTRING("previewImage" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
--     ELSE "previewImage"
--   END
-- WHERE "fileUrl" LIKE 'https://%' OR "coverImage" LIKE 'https://%' OR "previewImage" LIKE 'https://%';

-- Обновление parent_sections
UPDATE parent_sections
SET 
  "coverImage" = CASE 
    WHEN "coverImage" LIKE 'https://s3.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://s3.twcstorage.ru/') + 1)
    WHEN "coverImage" LIKE 'https://swift.twcstorage.ru/%' THEN 
      SUBSTRING("coverImage" FROM LENGTH('https://swift.twcstorage.ru/') + 1)
    ELSE "coverImage"
  END
WHERE "coverImage" LIKE 'https://%';

UPDATE parent_sections
SET 
  files = (
    SELECT string_agg(
      CASE 
        WHEN value LIKE 'https://s3.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://s3.twcstorage.ru/') + 1)
        WHEN value LIKE 'https://swift.twcstorage.ru/%' THEN 
          SUBSTRING(value FROM LENGTH('https://swift.twcstorage.ru/') + 1)
        ELSE value
      END,
      ','
    )
    FROM unnest(string_to_array(files, ',')) AS value
  )
WHERE files LIKE '%https://%';

-- Обновление life_in_dou (JSON поле mediaItems)
-- Примечание: JSON поле требует специальной обработки
UPDATE life_in_dou
SET "mediaItems" = (
  SELECT json_agg(
    json_build_object(
      'type', item->>'type',
      'url', CASE 
        WHEN (item->>'url') LIKE 'https://s3.twcstorage.ru/%' THEN 
          SUBSTRING((item->>'url') FROM LENGTH('https://s3.twcstorage.ru/') + 1)
        WHEN (item->>'url') LIKE 'https://swift.twcstorage.ru/%' THEN 
          SUBSTRING((item->>'url') FROM LENGTH('https://swift.twcstorage.ru/') + 1)
        ELSE item->>'url'
      END,
      'caption', item->>'caption'
    )
  )
  FROM json_array_elements("mediaItems") AS item
)
WHERE "mediaItems"::text LIKE '%https://%';

-- Обновление folders (таблица отсутствует в текущей схеме БД)
-- UPDATE folders
-- SET "mediaItems" = (
--   SELECT json_agg(
--     json_build_object(
--       'type', item->>'type',
--       'url', CASE 
--         WHEN (item->>'url') LIKE 'https://s3.twcstorage.ru/%' THEN 
--           SUBSTRING((item->>'url') FROM LENGTH('https://s3.twcstorage.ru/') + 1)
--         WHEN (item->>'url') LIKE 'https://swift.twcstorage.ru/%' THEN 
--           SUBSTRING((item->>'url') FROM LENGTH('https://swift.twcstorage.ru/') + 1)
--         ELSE item->>'url'
--       END,
--       'caption', item->>'caption'
--     )
--   )
--   FROM json_array_elements("mediaItems") AS item
-- )
-- WHERE "mediaItems"::text LIKE '%https://%';

