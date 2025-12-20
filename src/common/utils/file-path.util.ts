/**
 * Утилита для работы с путями файлов в хранилище
 * Храним в БД относительный путь: bucket-name/path/to/file
 * Формируем полный URL из конфигурации при возврате данных
 */

export class FilePathUtil {
  /**
   * Извлекает относительный путь из полного URL
   * Пример: https://s3.twcstorage.ru/bucket-name/images/file.jpg -> bucket-name/images/file.jpg
   */
  static extractRelativePath(fullUrl: string | null | undefined, s3Url: string): string | null | undefined {
    if (!fullUrl || typeof fullUrl !== 'string') {
      return fullUrl;
    }

    // Если это уже относительный путь (не начинается с http), возвращаем как есть
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      return fullUrl;
    }

    // Извлекаем путь после базового URL
    if (fullUrl.includes(s3Url)) {
      const urlWithoutBase = fullUrl.replace(s3Url + '/', '').replace(s3Url, '');
      return urlWithoutBase;
    }

    // Если URL не содержит базовый URL, пытаемся извлечь путь после последнего /
    const lastSlashIndex = fullUrl.lastIndexOf('/');
    if (lastSlashIndex > 0) {
      // Пытаемся найти bucket name (обычно это UUID или имя после первого /)
      const parts = fullUrl.split('/');
      // Ищем часть, которая может быть bucket name (обычно после домена)
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].includes('.') && parts[i + 1]) {
          // Нашли домен, следующий элемент - bucket name
          return parts.slice(i + 1).join('/');
        }
      }
    }

    // Если не удалось извлечь, возвращаем как есть
    return fullUrl;
  }

  /**
   * Формирует полный URL из относительного пути
   * Пример: bucket-name/images/file.jpg -> https://s3.twcstorage.ru/bucket-name/images/file.jpg
   * Если передан полный URL, сначала нормализует его, затем формирует новый из конфигурации
   * Также заменяет старый bucket name на новый из конфигурации
   */
  static buildFullUrl(
    relativePath: string | null | undefined, 
    s3Url: string,
    newBucketName?: string,
    oldBucketName?: string
  ): string | null | undefined {
    if (!relativePath || typeof relativePath !== 'string') {
      return relativePath;
    }

    // Если это уже полный URL, сначала нормализуем его (извлекаем относительный путь)
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      const normalized = this.extractRelativePath(relativePath, s3Url);
      if (normalized && normalized !== relativePath) {
        // Если удалось извлечь относительный путь, заменяем bucket name если нужно
        let pathToUse = normalized;
        if (oldBucketName && newBucketName && pathToUse.startsWith(oldBucketName + '/')) {
          pathToUse = pathToUse.replace(oldBucketName + '/', newBucketName + '/');
        }
        // Формируем новый полный URL
        return `${s3Url}/${pathToUse}`;
      }
      // Если не удалось нормализовать, возвращаем как есть (для внешних URL)
      return relativePath;
    }

    // Заменяем старый bucket name на новый, если указаны
    let pathToUse = relativePath;
    if (oldBucketName && newBucketName && pathToUse.startsWith(oldBucketName + '/')) {
      pathToUse = pathToUse.replace(oldBucketName + '/', newBucketName + '/');
    }

    // Формируем полный URL из относительного пути
    return `${s3Url}/${pathToUse}`;
  }

  /**
   * Нормализует путь - извлекает относительный путь из полного URL или возвращает как есть
   * Возвращает undefined вместо null для совместимости с TypeORM
   */
  static normalizePath(path: string | null | undefined, s3Url: string): string | undefined {
    const result = this.extractRelativePath(path, s3Url);
    return result === null ? undefined : result;
  }

  /**
   * Нормализует массив путей
   */
  static normalizePaths(paths: string[] | null | undefined, s3Url: string): string[] | undefined {
    if (!paths || !Array.isArray(paths)) {
      return paths === null ? undefined : paths;
    }

    return paths.map(path => this.normalizePath(path, s3Url) || path).filter((p): p is string => p !== undefined);
  }

  /**
   * Формирует массив полных URL из относительных путей
   */
  static buildFullUrls(
    paths: string[] | null | undefined, 
    s3Url: string,
    newBucketName?: string,
    oldBucketName?: string
  ): string[] | null | undefined {
    if (!paths || !Array.isArray(paths)) {
      return paths;
    }

    return paths.map(path => this.buildFullUrl(path, s3Url, newBucketName, oldBucketName) || path);
  }
}

