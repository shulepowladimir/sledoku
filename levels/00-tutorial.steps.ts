import type { TutorialStep } from '../src/types/tutorial';
import { cellId } from '../src/types/level';

/** Step-by-step onboarding scenario for the tutorial level (levels/00-tutorial.ts).
 *
 * Level solution recap (row-col, 0-based):
 *   Андрей (0,1) · Борис (1,4, стул) · Галина (2,0) · Владимир (3,3) · Христина (4,2, жертва)
 * Victim room: архив {Владимир (убийца), Христина} — ровно 2 человека.
 *
 * Act structure: 0 greeting → 1 interface tour → 2 Борис (marks + lesson B: cross intersections) →
 * 3 Андрей (three marks, deferred) → 4 Галина (clue elimination) → 5 undo/clear live practice +
 * rebuild + autocross (lesson: auto-crosses) → 6 Андрей resolved → 7 Владимир (lesson A: same
 * column) → 8 Христина (victim invariant + check + bridge to menu). */
export function buildTutorialSteps(): TutorialStep[] {
  const sel = (id: string) => `[data-testid="${id}"]`;

  return [
    // ── Акт 0. Приветствие ────────────────────────────────────────────────────
    {
      id: 'welcome',
      title: 'Добро пожаловать в Следоку!',
      text: [
        'Следоку — это судоку в детективной обёртке. Здесь мы расставляем не цифры, а подозреваемых и жертву убийства.',
        'Вы — сотрудник детективного агентства, и вам предстоит раскрыть своё первое дело.',
        'Это обучение проведёт вас через всё: от правил поля до приёмов дедукции. Займёт несколько минут.',
      ],
      target: { kind: 'none' },
      advance: { kind: 'next' },
    },
    {
      id: 'goal',
      title: 'В чём задача',
      text: [
        'Пять человек находились в агентстве в момент преступления. Нужно восстановить, кто где стоял.',
        'Подсказки-улики — в списке справа. Расставьте всех по местам и нажмите «Проверить».',
      ],
      target: { kind: 'none' },
      advance: { kind: 'next' },
    },
    {
      id: 'main-rule',
      title: 'Главное правило',
      text: [
        'Поле — 5×5 клеток, и людей ровно пять. Как в судоку: в каждом ряду и в каждом столбце стоит ровно один человек.',
        'Это железное правило — на нём держится вся дедукция. Запомнили? Идём знакомиться с местом преступления.',
      ],
      target: { kind: 'none' },
      advance: { kind: 'next' },
    },

    // ── Акт 1. Интерфейс ──────────────────────────────────────────────────────
    {
      id: 'board',
      title: 'Карта агентства',
      text: [
        'Перед вами три зоны: Кабинет детектива (наверху), Приёмная (слева внизу) и Архив (справа внизу). Жирные линии — стены между зонами.',
        'Ряды нумеруются сверху вниз, столбцы — слева направо. Это пригодится, когда улики начнут называть конкретные ряды и столбцы.',
      ],
      target: { kind: 'selector', selector: '.board' },
      advance: { kind: 'next' },
      tooltipSide: 'right',
    },
    {
      id: 'items-occupiable',
      title: 'Предметы: на них можно сесть',
      text: [
        'Некоторые предметы могут занимать персонажи. Например, эти три стула на карте. В других делах также бывают диваны, кресла, кровати и даже лошади.',
        'Такие предметы не мешают, а иногда и помогают расследованию: клетка со стулом — обычная клетка, на которую можно поставить человека.',
      ],
      target: {
        kind: 'cells',
        cellIds: [cellId(0, 2), cellId(1, 4), cellId(4, 0)],
      },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
    {
      id: 'items-decorative',
      title: 'Предметы: декоративные',
      text: [
        'Остальные предметы — декоративные: доска для записей, столы, коробки, шкафы, растение. Поставить на них человека нельзя — клетка занята.',
        'Наведите курсор на любой предмет — появится его название. Пригодится, когда улика скажет «находился рядом с коробкой».',
      ],
      target: {
        kind: 'cells',
        cellIds: [
          cellId(0, 3),
          cellId(1, 1),
          cellId(3, 0),
          cellId(2, 3),
          cellId(2, 4),
          cellId(3, 2),
          cellId(3, 4),
          cellId(4, 4),
        ],
      },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
    {
      id: 'roster',
      title: 'Действующие лица',
      text: [
        'Справа — список всех участников дела. У каждого подозреваемого — свои улики: это ваши зацепки.',
        'Кликните по человеку в списке — так вы берёте его «в руку», чтобы поставить на поле. Попробуйте: выберите Андрея.',
      ],
      target: { kind: 'selector', selector: sel('roster-person-andrei') },
      advance: { kind: 'selectPerson', personId: 'andrei' },
      tooltipSide: 'left',
    },
    {
      id: 'roster-2',
      title: 'Выбран — можно ставить',
      text: [
        'Отлично, Андрей выбран. Левый клик по клетке поставит его, правый — оставит метку-кандидата (о метках чуть позже).',
        'Пока ничего не ставим: сначала посмотрим на остальных участников.',
      ],
      target: { kind: 'selector', selector: sel('roster-person-andrei') },
      advance: { kind: 'next' },
      tooltipSide: 'left',
    },
    {
      id: 'victim',
      title: 'Жертва',
      text: [
        'Христина — жертва. У неё нет списка улик: вместо него одна строка — «Жертва находилась наедине с убийцей».',
        'Кто убийца — нигде не написано. Его вы вычислите сами, в самом конце. Это и есть кульминация каждого дела.',
      ],
      target: { kind: 'selector', selector: sel('roster-person-hristina') },
      advance: { kind: 'next' },
      tooltipSide: 'left',
    },
    {
      id: 'general',
      title: 'Общие подсказки',
      text: [
        'Помимо личных улик бывают общие — они действуют на всех сразу. Здесь одна: «У каждого стола находился хотя бы один человек».',
        'Общие подсказки часто несут неожиданно много информации — не пропускайте их.',
      ],
      target: { kind: 'selector', selector: sel('roster-general') },
      advance: { kind: 'next' },
      tooltipSide: 'left',
    },
    {
      id: 'timer',
      title: 'Таймер',
      text: [
        'Время пошло с открытия дела. Это не лимит и не поражение по таймауту — просто счёт для личных рекордов.',
        'В обучении время не сохраняется. В настоящих делах лучшее время останется на карточке уровня.',
      ],
      target: { kind: 'selector', selector: sel('hud-timer') },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
    {
      id: 'howto',
      title: 'Справка всегда рядом',
      text: [
        'Кнопка с вопросиком открывает памятку: термины игры и её правила. Если что-то забудете — она здесь.',
        'А теперь — к дедукции. Первым делом возьмёмся за Бориса.',
      ],
      target: { kind: 'selector', selector: sel('hud-howto') },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },

    // ── Акт 2. Борис: метки + урок B (пересечения) ────────────────────────────
    {
      id: 'boris-clues',
      title: 'Первый подозреваемый: Борис',
      text: [
        'Улики Бориса: «Борис сидел на стуле» и «Борис находился в углу своей зоны».',
        'Угол — это клетка, у которой сходятся две стены одной зоны (края карты — тоже стены!). Стульев на карте три, но в углу своей зоны стоят два: в кабинете и в приёмной. Который из них — пока неизвестно.',
      ],
      target: { kind: 'cells', cellIds: [cellId(1, 4), cellId(4, 0)] },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
    {
      id: 'boris-select',
      title: 'Выберите Бориса',
      text: ['Кликните по Борису в списке.'],
      target: { kind: 'selector', selector: sel('roster-person-boris') },
      advance: { kind: 'selectPerson', personId: 'boris' },
      tooltipSide: 'left',
    },
    {
      id: 'boris-marks',
      title: 'Метки-кандидаты',
      text: [
        'Когда кандидат не один, ставят метки: правый клик по клетке — на ней появится маленькая метка цвета персонажа.',
        'Поставьте метки Бориса на оба стула: угловой стул кабинета и угловой стул приёмной.',
      ],
      target: { kind: 'cells', cellIds: [cellId(1, 4), cellId(4, 0)] },
      advance: { kind: 'pencil', personId: 'boris', cellIds: [cellId(1, 4), cellId(4, 0)] },
      tooltipSide: 'bottom',
    },
    {
      id: 'lesson-b',
      title: 'Приём: метки в разных рядах и столбцах',
      text: [
        'У Бориса две метки — в разных рядах и разных столбцах. Проведите мысленно линии: ряд и столбец каждой метки.',
        'Клетки на пересечениях этих линий выбивают обе метки сразу: если бы другой персонаж встал туда, обе метки оказались бы не у дел; а других вариантов у Бориса нет. Значит, на пересечениях точно никого не будет.',
        'Пересечения здесь — клетки у левого края кабинета и в правом нижнем углу архива. Вторая занята коробкой — туда и так никто не встанет. А вот первую зачеркнём: включите режим «Крестик» и кликните по ней.',
      ],
      target: { kind: 'cell', cellId: cellId(1, 0) },
      advance: { kind: 'cross', cellIds: [cellId(1, 0)] },
      alsoSelectors: [sel('hud-mode-cross')],
      highlightCells: [cellId(4, 4)],
      tooltipSide: 'bottom',
    },
    {
      id: 'boris-hold',
      title: 'Борис пока не определён',
      text: [
        'Какой из двух стульев верный — неизвестно. Мы вернёмся к Борису, когда другие фигуры закроют один из вариантов.',
        'Это нормально: дела редко раскрываются по порядку. Двигаемся дальше — к Андрею.',
      ],
      target: { kind: 'cells', cellIds: [cellId(1, 4), cellId(4, 0)] },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },

    // ── Акт 3. Андрей: три метки ──────────────────────────────────────────────
    {
      id: 'andrei-clues',
      title: 'Андрей: две улики',
      text: [
        'Улики Андрея: «Андрей находился в 1-м ряду» и «Андрей не сидел на стуле».',
        'Первый ряд — верхний. Свободные клетки ряда: три — но одна из них стул, а Андрей на стуле не сидел. Остаётся… смотрите сами.',
      ],
      target: { kind: 'cells', cellIds: [cellId(0, 0), cellId(0, 1), cellId(0, 4)] },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
    {
      id: 'andrei-select',
      title: 'Выберите Андрея',
      text: ['Возьмите Андрея в «руку» — будем размечать его возможные клетки.'],
      target: { kind: 'selector', selector: sel('roster-person-andrei') },
      advance: { kind: 'selectPerson', personId: 'andrei' },
      tooltipSide: 'left',
    },
    {
      id: 'andrei-marks',
      title: 'Метки Андрея',
      text: [
        'Поставьте метки на все три свободные клетки первого ряда: левый и правый углы, а также место у стола.',
      ],
      target: { kind: 'cells', cellIds: [cellId(0, 0), cellId(0, 1), cellId(0, 4)] },
      advance: { kind: 'pencil', personId: 'andrei', cellIds: [cellId(0, 0), cellId(0, 1), cellId(0, 4)] },
      tooltipSide: 'bottom',
    },
    {
      id: 'lesson-a',
      title: 'Приём: все метки в одном ряду',
      text: [
        'Смотрите: все три метки Андрея — в одном ряду. Куда бы он ни встал, остальной ряд точно пуст!',
        'Значит, на свободные клетки ряда можно смело ставить крестики. Кроме меток в ряду остаётся только стул — на декоративную доску крестик не нужен, туда и так никто не встанет. Включите режим «Крестик» и зачеркните стул.',
      ],
      target: { kind: 'cell', cellId: cellId(0, 2) },
      advance: { kind: 'cross', cellIds: [cellId(0, 2)] },
      alsoSelectors: [sel('hud-mode-cross')],
      tooltipSide: 'bottom',
    },
    {
      id: 'andrei-hold',
      title: 'Три метки — так тоже бывает',
      text: [
        'У Андрея аж три потенциальных места. Не пугайтесь: метки для того и нужны, чтобы фиксировать неопределённость.',
        'По мере того, как другие люди займут свои ряды и столбцы, лишние метки отпадут сами. Проверим на Галине.',
      ],
      target: { kind: 'cells', cellIds: [cellId(0, 0), cellId(0, 1), cellId(0, 4)] },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },

    // ── Акт 4. Галина: метки + исключение по улике ────────────────────────────
    {
      id: 'galina-clues',
      title: 'Галина: зона и исключение',
      text: [
        'Улики Галины: «Галина находилась в приёмной» и «Галина не находилась на ковре».',
        'Приёмная — левый нижний угол карты. Ковёр — две клетки у её верхней кромки. Отрицательные улики («не…») — это исключения: они сужают круг, убирая клетки.',
      ],
      target: { kind: 'cells', cellIds: [cellId(2, 0), cellId(3, 0), cellId(3, 1), cellId(4, 0), cellId(4, 1)] },
      advance: { kind: 'next' },
      tooltipSide: 'right',
    },
    {
      id: 'galina-select',
      title: 'Выберите Галину',
      text: [
        'Кликните по Галине в списке.',
        'Кстати, сейчас вы в режиме «Крестик» после урока с пересечениями. Клик по человеку в списке автоматически вернёт обычный режим.',
      ],
      target: { kind: 'selector', selector: sel('roster-person-galina') },
      advance: { kind: 'selectPerson', personId: 'galina' },
      tooltipSide: 'left',
    },
    {
      id: 'galina-marks',
      title: 'Метки Галины',
      text: [
        'Пометьте правой кнопкой все три свободные клетки приёмной вне ковра: верхнюю клетку зоны и обе клетки нижнего ряда.',
      ],
      target: { kind: 'cells', cellIds: [cellId(2, 0), cellId(4, 0), cellId(4, 1)] },
      advance: { kind: 'pencil', personId: 'galina', cellIds: [cellId(2, 0), cellId(4, 0), cellId(4, 1)] },
      tooltipSide: 'right',
    },
    {
      id: 'galina-deduce',
      title: 'Работаем на опережение',
      text: [
        'Смотрите в улики Владимира: «Владимир находился на один ряд южнее Галины». Южнее — ниже по карте.',
        'Если Галина в нижнем ряду, Владимиру нужен ряд ещё ниже — а его не существует! Значит, обе метки нижнего ряда ошибочны. Снимите их правой кнопкой.',
      ],
      target: { kind: 'cells', cellIds: [cellId(4, 0), cellId(4, 1)] },
      advance: { kind: 'unpencil', personId: 'galina', cellIds: [cellId(4, 0), cellId(4, 1)] },
      tooltipSide: 'right',
    },
    {
      id: 'galina-place',
      title: 'Осталась одна',
      text: ['У Галины единственный вариант — верхняя клетка приёмной. Поставьте её левым кликом.'],
      target: { kind: 'cell', cellId: cellId(2, 0) },
      advance: { kind: 'place', personId: 'galina', cellId: cellId(2, 0) },
      tooltipSide: 'right',
    },

    // ── Акт 5. Борис раскрывается + практика откатов ──────────────────────────
    {
      id: 'boris-resolved',
      title: 'Вот так работают автокрестики',
      text: [
        'Галина заняла первый столбец — и её ряд и столбец автоматически зачеркнулись.',
        'Смотрите на метку Бориса в приёмной: автокрестик Галины только что её погасил. У Бориса остался единственный вариант — стул в кабинете. Поставьте его.',
      ],
      target: { kind: 'cells', cellIds: [cellId(4, 0), cellId(1, 4)] },
      advance: { kind: 'place', personId: 'boris', cellId: cellId(1, 4) },
      alsoSelectors: [sel('roster-person-boris')],
      tooltipSide: 'bottom',
    },
    {
      id: 'autocross',
      title: 'Автокрестики',
      text: [
        'Поставленный человек мгновенно зачёркивает все свободные клетки своего ряда и столбца — игра делает это за вас.',
        'Это правило «один на ряд и столбец» работает на вас. Кликните «Далее» и осмотрите поле: зачёркнуто всё, куда больше никого не поставить.',
      ],
      target: { kind: 'cells', cellIds: [cellId(1, 2), cellId(0, 4), cellId(0, 0)] },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
    {
      id: 'andrei-resolved',
      title: 'Метки отпали сами',
      text: [
        'Борис закрыл второй ряд и пятый столбец, Галина — третий ряд и первый столбец. Две метки Андрея погасли от автокрестиков — осталась одна, рядом с доской для записей.',
        'Поставьте Андрея на неё.',
      ],
      target: { kind: 'cell', cellId: cellId(0, 1) },
      advance: { kind: 'place', personId: 'andrei', cellId: cellId(0, 1) },
      alsoSelectors: [sel('roster-person-andrei')],
      tooltipSide: 'bottom',
    },
    {
      id: 'mistake',
      title: 'Учимся ошибаться',
      text: [
        'Никто не застрахован от ошибок — и игра к этому готова. Представим, что мы сомневаемся в Галине: переставьте её на стул в приёмной — сознательно неправильно.',
        'Начните с выбора Галины в списке.',
      ],
      target: { kind: 'cell', cellId: cellId(4, 0) },
      advance: { kind: 'place', personId: 'galina', cellId: cellId(4, 0) },
      alsoSelectors: [sel('roster-person-galina')],
      tooltipSide: 'right',
    },
    {
      id: 'undo',
      title: 'Отменить',
      text: [
        'Ошибка! «Отменить» откатывает последнее действие: Галина вернётся на правильную клетку, а автокрестики перестроятся.',
        'Нажмите «Отменить».',
      ],
      target: { kind: 'selector', selector: sel('undo-button') },
      advance: { kind: 'undo' },
      tooltipSide: 'bottom',
    },
    {
      id: 'clear',
      title: 'Очистить',
      text: [
        'Иногда хочется начать расстановку с чистого листа. Кнопка «Очистить» стирает всё: людей, метки, крестики. Время при этом не сбрасывается.',
        'Нажмите «Очистить» и подтвердите. Сейчас мы всё расставим заново — для закрепления.',
      ],
      target: { kind: 'selector', selector: sel('hud-clear') },
      advance: { kind: 'boardEmpty' },
      tooltipSide: 'bottom',
    },
    {
      id: 'rebuild-boris',
      title: 'Закрепление: Борис',
      text: ['Доска чиста — расставьте всех сами, без подсказок пошагово. Начните с Бориса: стул в углу кабинета.'],
      target: { kind: 'cell', cellId: cellId(1, 4) },
      advance: { kind: 'place', personId: 'boris', cellId: cellId(1, 4) },
      alsoSelectors: [sel('roster-person-boris')],
      tooltipSide: 'bottom',
    },
    {
      id: 'rebuild-galina',
      title: 'Закрепление: Галина',
      text: ['Галина — верхняя клетка приёмной.'],
      target: { kind: 'cell', cellId: cellId(2, 0) },
      advance: { kind: 'place', personId: 'galina', cellId: cellId(2, 0) },
      alsoSelectors: [sel('roster-person-galina')],
      tooltipSide: 'right',
    },
    {
      id: 'rebuild-andrei',
      title: 'Закрепление: Андрей',
      text: ['Андрей — первый ряд, клетка рядом со столом и стулом.'],
      target: { kind: 'cell', cellId: cellId(0, 1) },
      advance: { kind: 'place', personId: 'andrei', cellId: cellId(0, 1) },
      alsoSelectors: [sel('roster-person-andrei')],
      tooltipSide: 'bottom',
    },
    {
      id: 'restart-info',
      title: 'Начать заново',
      text: [
        'Последняя кнопка управления — «Начать заново»: полный сброс доски и времени. Пригодится, если захотите пройти дело на скорость.',
        'Сейчас её не нажимаем — у нас дело на раскрытии. Остались двое: Владимир и жертва.',
      ],
      target: { kind: 'selector', selector: sel('hud-restart') },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },

    // ── Акт 7. Владимир: урок A (один столбец) ────────────────────────────────
    {
      id: 'vladimir-clues',
      title: 'Владимир: предмет и отношение',
      text: [
        'Улики Владимира: «Владимир находился рядом с коробкой» и «на один ряд южнее Галины».',
        'Рядом — соседняя клетка по вертикали или горизонтали, причём в той же зоне. Коробки стоят в архиве; свободных клеток рядом с ними — две: в среднем ряду архива и в нижнем. Третья соседняя клетка занята шкафом.',
      ],
      target: { kind: 'cells', cellIds: [cellId(3, 3), cellId(4, 3)] },
      advance: { kind: 'next' },
      tooltipSide: 'left',
    },
    {
      id: 'vladimir-select',
      title: 'Выберите Владимира',
      text: ['Кликните по Владимиру в списке.'],
      target: { kind: 'selector', selector: sel('roster-person-vladimir') },
      advance: { kind: 'selectPerson', personId: 'vladimir' },
      tooltipSide: 'left',
    },
    {
      id: 'vladimir-marks',
      title: 'Метки Владимира',
      text: ['Правой кнопкой пометьте обе свободные клетки рядом с коробками.'],
      target: { kind: 'cells', cellIds: [cellId(3, 3), cellId(4, 3)] },
      advance: { kind: 'pencil', personId: 'vladimir', cellIds: [cellId(3, 3), cellId(4, 3)] },
      tooltipSide: 'left',
    },
    {
      id: 'vladimir-deduce',
      title: 'Южнее Галины',
      text: [
        'Галина стоит во 2-м ряду. Ровно на один ряд южнее — 3-й ряд. Из двух меток Владимира в 3-м ряду лежит только одна.',
        'Снимите правой кнопкой метку из нижнего ряда.',
      ],
      target: { kind: 'cells', cellIds: [cellId(4, 3)] },
      advance: { kind: 'unpencil', personId: 'vladimir', cellIds: [cellId(4, 3)] },
      tooltipSide: 'left',
    },
    {
      id: 'vladimir-place',
      title: 'Поставьте Владимира',
      text: ['Владимир — в сердце архива, между коробками и шкафом с делами.'],
      target: { kind: 'cell', cellId: cellId(3, 3) },
      advance: { kind: 'place', personId: 'vladimir', cellId: cellId(3, 3) },
      alsoSelectors: [sel('roster-person-vladimir')],
      tooltipSide: 'left',
    },

    // ── Акт 8. Жертва, проверка, финал ────────────────────────────────────────
    {
      id: 'victim-deduce',
      title: 'Последняя фигура: жертва',
      text: [
        'Осталась Христина. «Жертва находилась наедине с убийцей» — значит, в её зоне ровно два человека: она и убийца.',
        'Но есть путь быстрее: вспомните главное правило. Заняты четыре ряда и четыре столбца. Свободен один ряд и один столбец — их пересечение даёт единственную клетку. Она в архиве… наедине с Владимиром.',
      ],
      target: { kind: 'cell', cellId: cellId(4, 2) },
      advance: { kind: 'next' },
      tooltipSide: 'top',
    },
    {
      id: 'victim-reveal',
      title: 'Кто убийца?',
      text: [
        'Христина встаёт в архив — наедине с Владимиром. Раз жертва была наедине с убийцей… убийца — Владимир. Дело раскрыто!',
        'Осталось поставить жертву на место и зафиксировать результат.',
      ],
      target: { kind: 'selector', selector: sel('roster-person-hristina') },
      advance: { kind: 'next' },
      tooltipSide: 'left',
    },
    {
      id: 'victim-select',
      title: 'Выберите Христину',
      text: ['Кликните по Христине в списке.'],
      target: { kind: 'selector', selector: sel('roster-person-hristina') },
      advance: { kind: 'selectPerson', personId: 'hristina' },
      tooltipSide: 'left',
    },
    {
      id: 'victim-place',
      title: 'Поставьте Христину',
      text: ['Единственная свободная клетка — нижний ряд, средний столбец. Архив принимает жертву.'],
      target: { kind: 'cell', cellId: cellId(4, 2) },
      advance: { kind: 'place', personId: 'hristina', cellId: cellId(4, 2) },
      tooltipSide: 'top',
    },
    {
      id: 'check',
      title: 'Проверить',
      text: [
        'Все пятеро на местах. Нажмите «Проверить» — игра сверит вашу расстановку с истиной.',
      ],
      target: { kind: 'selector', selector: sel('check-button') },
      advance: { kind: 'solved' },
      tooltipSide: 'top',
    },
    {
      id: 'finale',
      title: 'Дело раскрыто!',
      text: [
        'Поздравляем, детектив! Вы освоили главное: правило «один на ряд и столбец», зоны и предметы, метки и крестики, приёмы дедукции и кнопки отката.',
        'В настоящих делах вас ждут уровни побольше, зоны похитрее и десятки новых типов улик — но принцип тот же. Раскрытое дело принесёт штамп «Раскрыто» и рекорд времени.',
      ],
      target: { kind: 'none' },
      advance: { kind: 'next' },
    },
    {
      id: 'go-menu',
      title: 'К списку дел',
      text: ['Нажмите «Уровни» — выберем вам первое настоящее дело.'],
      target: { kind: 'selector', selector: sel('menu-button') },
      advance: { kind: 'menu' },
      tooltipSide: 'bottom',
    },
    {
      id: 'bridge',
      title: 'Ваше первое настоящее дело',
      text: [
        'Вот оно — «Тихий вечер в квартире»: 6×6, три зоны, классическое дело для новичка.',
        'Удачи, детектив. Следоку ждёт вас!',
      ],
      target: { kind: 'selector', selector: sel('level-card-apartment-01') },
      advance: { kind: 'next' },
      tooltipSide: 'bottom',
    },
  ];
}
