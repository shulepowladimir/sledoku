import type { Gender } from '../types/level';

export interface LibraryName {
  name: string;
  gender: Gender;
  letter: string;
}

/**
 * Имена, уже встречающиеся в существующих уровнях игры (собрано из levels/*.ts).
 * Используется в конструкторе для быстрого выбора вместо ввода вручную.
 * При появлении новых уровней с новыми именами список можно дополнить.
 */
export const NAME_LIBRARY: LibraryName[] = [
  { name: 'Августа', gender: 'female', letter: 'А' },
  { name: 'Аглая', gender: 'female', letter: 'А' },
  { name: 'Алексей', gender: 'male', letter: 'А' },
  { name: 'Альби', gender: 'male', letter: 'А' },
  { name: 'Андрей', gender: 'male', letter: 'А' },
  { name: 'Анна', gender: 'female', letter: 'А' },
  { name: 'Аристарх', gender: 'male', letter: 'А' },
  { name: 'Аркадий', gender: 'male', letter: 'А' },
  { name: 'Артём', gender: 'male', letter: 'А' },
  { name: 'Беата', gender: 'female', letter: 'Б' },
  { name: 'Беатриса', gender: 'female', letter: 'Б' },
  { name: 'Белла', gender: 'female', letter: 'Б' },
  { name: 'Блейк', gender: 'male', letter: 'Б' },
  { name: 'Борис', gender: 'male', letter: 'Б' },
  { name: 'Борислав', gender: 'male', letter: 'Б' },
  { name: 'Бронислава', gender: 'female', letter: 'Б' },
  { name: 'Вадим', gender: 'male', letter: 'В' },
  { name: 'Василиса', gender: 'female', letter: 'В' },
  { name: 'Вероника', gender: 'female', letter: 'В' },
  { name: 'Виктор', gender: 'male', letter: 'В' },
  { name: 'Влада', gender: 'female', letter: 'В' },
  { name: 'Владимир', gender: 'male', letter: 'В' },
  { name: 'Вольдемар', gender: 'male', letter: 'В' },
  { name: 'Всеволод', gender: 'male', letter: 'В' },
  { name: 'Галина', gender: 'female', letter: 'Г' },
  { name: 'Гелена', gender: 'female', letter: 'Г' },
  { name: 'Геннадий', gender: 'male', letter: 'Г' },
  { name: 'Глафира', gender: 'female', letter: 'Г' },
  { name: 'Григорий', gender: 'male', letter: 'Г' },
  { name: 'Гурий', gender: 'male', letter: 'Г' },
  { name: 'Гэри', gender: 'male', letter: 'Г' },
  { name: 'Даниил', gender: 'male', letter: 'Д' },
  { name: 'Дарко', gender: 'male', letter: 'Д' },
  { name: 'Дарья', gender: 'female', letter: 'Д' },
  { name: 'Демид', gender: 'male', letter: 'Д' },
  { name: 'Демьян', gender: 'male', letter: 'Д' },
  { name: 'Денис', gender: 'male', letter: 'Д' },
  { name: 'Диана', gender: 'female', letter: 'Д' },
  { name: 'Дина', gender: 'female', letter: 'Д' },
  { name: 'Дмитрий', gender: 'male', letter: 'Д' },
  { name: 'Ева', gender: 'female', letter: 'Е' },
  { name: 'Егор', gender: 'male', letter: 'Е' },
  { name: 'Елисей', gender: 'male', letter: 'Е' },
  { name: 'Есения', gender: 'female', letter: 'Е' },
  { name: 'Есфирь', gender: 'female', letter: 'Е' },
  { name: 'Ефим', gender: 'male', letter: 'Е' },
  { name: 'Жабридж', gender: 'female', letter: 'Ж' },
  { name: 'Жанна', gender: 'female', letter: 'Ж' },
  { name: 'Ждан', gender: 'male', letter: 'Ж' },
  { name: 'Жозефина', gender: 'female', letter: 'Ж' },
  { name: 'Захар', gender: 'male', letter: 'З' },
  { name: 'Зинаида', gender: 'female', letter: 'З' },
  { name: 'Зоя', gender: 'female', letter: 'З' },
  { name: 'Иван', gender: 'male', letter: 'И' },
  { name: 'Игорь', gender: 'male', letter: 'И' },
  { name: 'Инна', gender: 'female', letter: 'И' },
  { name: 'Ирина', gender: 'female', letter: 'И' },
  { name: 'Кирилл', gender: 'male', letter: 'К' },
  { name: 'Клавдия', gender: 'female', letter: 'К' },
  { name: 'Харит', gender: 'male', letter: 'Х' },
  { name: 'Харита', gender: 'female', letter: 'Х' },
  { name: 'Харитина', gender: 'female', letter: 'Х' },
  { name: 'Харитон', gender: 'male', letter: 'Х' },
  { name: 'Хиония', gender: 'female', letter: 'Х' },
  { name: 'Христиан', gender: 'male', letter: 'Х' },
  { name: 'Христина', gender: 'female', letter: 'Х' },
  { name: 'Христофор', gender: 'male', letter: 'Х' },
];

const RUSSIAN_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

/** Буквы из библиотеки, отсортированные в алфавитном порядке (не порядке появления в массиве). */
export const NAME_LIBRARY_LETTERS: string[] = RUSSIAN_ALPHABET.filter((letter) =>
  NAME_LIBRARY.some((n) => n.letter === letter),
);

export function namesForLetter(letter: string): LibraryName[] {
  return NAME_LIBRARY.filter((n) => n.letter === letter);
}
