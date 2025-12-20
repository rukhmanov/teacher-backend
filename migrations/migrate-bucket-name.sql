-- Миграция: замена старого bucket name на новый в URL
-- Старый bucket: 1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc
-- Новый bucket: 79dfaf80-vospitatel

-- Обновление life_in_dou (JSON поле mediaItems)
-- Заменяем старый bucket name на новый в URL
UPDATE life_in_dou
SET "mediaItems" = (
  SELECT json_agg(
    json_build_object(
      'type', item->>'type',
      'url', CASE 
        -- Если URL содержит старый bucket, заменяем на новый
        WHEN (item->>'url') LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%' THEN 
          REPLACE((item->>'url'), '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
        -- Если это относительный путь со старым bucket, заменяем
        WHEN (item->>'url') LIKE '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc/%' THEN 
          REPLACE((item->>'url'), '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc/', '79dfaf80-vospitatel/')
        ELSE item->>'url'
      END,
      'caption', item->>'caption'
    )
  )
  FROM json_array_elements("mediaItems") AS item
)
WHERE "mediaItems"::text LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

-- Обновление folders (JSON поле mediaItems)
UPDATE folders
SET "mediaItems" = (
  SELECT json_agg(
    json_build_object(
      'type', item->>'type',
      'url', CASE 
        -- Если URL содержит старый bucket, заменяем на новый
        WHEN (item->>'url') LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%' THEN 
          REPLACE((item->>'url'), '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
        -- Если это относительный путь со старым bucket, заменяем
        WHEN (item->>'url') LIKE '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc/%' THEN 
          REPLACE((item->>'url'), '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc/', '79dfaf80-vospitatel/')
        ELSE item->>'url'
      END,
      'caption', item->>'caption'
    )
  )
  FROM json_array_elements("mediaItems") AS item
)
WHERE "mediaItems"::text LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

-- Обновление других таблиц, если там есть старый bucket name
-- teacher_profiles
UPDATE teacher_profiles
SET "photoUrl" = REPLACE("photoUrl", '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
WHERE "photoUrl" LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

-- posts
UPDATE posts
SET 
  "coverImage" = REPLACE("coverImage", '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel'),
  images = REPLACE(images, '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel'),
  videos = REPLACE(videos, '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
WHERE "coverImage" LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%' 
   OR images LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%'
   OR videos LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

-- master_classes
UPDATE master_classes
SET 
  "coverImage" = REPLACE("coverImage", '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel'),
  images = REPLACE(images, '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel'),
  videos = REPLACE(videos, '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
WHERE "coverImage" LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%' 
   OR images LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%'
   OR videos LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

-- presentations
UPDATE presentations
SET 
  "fileUrl" = REPLACE("fileUrl", '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel'),
  "coverImage" = REPLACE("coverImage", '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
WHERE "fileUrl" LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%' 
   OR "coverImage" LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

-- parent_sections
UPDATE parent_sections
SET 
  "coverImage" = REPLACE("coverImage", '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel'),
  files = REPLACE(files, '1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc', '79dfaf80-vospitatel')
WHERE "coverImage" LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%' 
   OR files LIKE '%1f48199c-cfe29ccc-c471-493c-b13e-fadb10f330bc%';

