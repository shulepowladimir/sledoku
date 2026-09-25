# Шпаргалка конвенций для нового уровня

Точечная сверка перед добавлением предмета/иконки — не открывать полные файлы ради этого.
Обновляй этот файл при каждом новом item/иконке в itemLibrary.ts / ItemIcon.tsx / floorTextures.ts.

## itemLibrary.ts — готовые предметы (id — kind)

- chair — occupiable
- armchair — occupiable
- sofa — occupiable
- bench — occupiable
- stool — occupiable
- workbench — occupiable
- plant — decorative
- globe — decorative
- portrait — decorative
- telescope — decorative
- bookshelf — decorative
- box — decorative
- rack — decorative
- ladder — decorative
- lamppost — decorative
- trashcan — decorative
- barrel — decorative
- safe — decorative
- fountain — decorative
- kiosk — decorative
- kassa — decorative
- piano — decorative
- billiardTable — decorative
- barStool — occupiable
- hitchingPost — decorative
- souvenirRack — decorative
- computer — decorative
- watercooler — decorative
- locker — decorative
- horse — occupiable
- cactus — decorative
- wagon — decorative
- trough — decorative
- goal — occupiable
- ball — decorative
- seat — occupiable
- treadmill — occupiable
- exerciseBike — occupiable
- hurdle — decorative
- bed — occupiable
- table — decorative
- basketball — decorative
- toilet — decorative
- camera — decorative
- toolbox — decorative
- clock — decorative
- bathtub — occupiable
- jacuzzi — occupiable
- tv — decorative
- floorLamp — decorative
- keyBox — decorative
- journal — decorative
- barCounter — decorative
- palm — decorative
- rock — decorative
- coconut — decorative
- hammock — occupiable
- hut — decorative
- bottle — decorative
- shell — decorative
- campfire — decorative
- pants — decorative (бежевые штаны с ремнём, отсылка heavy; без тени-подложки — мягкий текстиль б7)
- chest — decorative (icon artifactChest)
- lamp — decorative
- boat — decorative
- tree — decorative
- broadleafTree — decorative (лиственное дерево с округлой кроной)
- stove — decorative (существующая иконка из 01-apartment)
- fridge — decorative (существующая иконка из 01-apartment)
- wardrobe — decorative (существующая иконка из 01-apartment)
- suitcase — decorative (существующая иконка из 10-station)
- berth — occupiable
- samovar — decorative
- luggageRack — decorative
- throne — occupiable
- candleStand — decorative
- armorStand — decorative
- weaponRack — decorative
- well — decorative
- haystack — decorative
- ferrisWheel — occupiable
- carousel — occupiable
- swing — occupiable
- shootingGallery — decorative
- popcornStand — decorative
- plane — decorative
- windsock — decorative
- baggageCart — decorative
- lion — decorative
- giraffe — decorative
- monkey — decorative
- hippo — decorative
- zebra — decorative
- penguin — decorative
- clueBoard — decorative
- clapperboard — decorative
- spotlight — decorative
- makeupMirror — decorative
- movieCamera — decorative
- car — occupiable (2-клеточный: единственный предмет с cells.length=2, рендер через ItemOverlay)
- trafficLight — decorative
- trafficSign — decorative
- washer — decorative (icon washingMachine)
- kettle — decorative
- fryingPan — occupiable
- burner — decorative
- pillow — occupiable
- remote — decorative
- plate — occupiable
- cup — decorative
- slippers — decorative
- cat — decorative
- fireplace — decorative
- skiRack — decorative
- cage — decorative
- hoop — decorative
- jukebox — decorative
- booth — occupiable (2-клеточный: стол+скамья, рендер через ItemOverlay)
- pieDisplay — decorative
- neonSign — decorative (неон-исключение из палитры, см. art/STYLE-GUIDE §1)
- motorcycle — occupiable (2-клеточный, как car; рендер через ItemOverlay)
- polarBear — decorative
- igloo — decorative
- snowmobile — occupiable (2-клеточный, как car/motorcycle)
- radioStation — decorative
- inflatableMattress — occupiable
- sunLounger — occupiable
- beachChair — occupiable
- bathrobe — decorative
- beachUmbrella — decorative
- directorConsole — decorative
- studioSoftbox — decorative
- newsDesk — decorative
- wheel — occupiable
- cannon — occupiable (2-клеточный, как car/motorcycle/snowmobile)
- parrot — decorative
- lifebuoy — decorative
- lifeboat — occupiable (icon boat, реюз иконки)
- saunaStove — decorative (уровневый тип «Каменка», bania)
- washTub — decorative (Таз)
- towel — decorative
- venik — decorative
- tombstone — decorative (Надгробие с гравировкой «SLED OKU 10-10», cemetery; все экземпляры именные — нуар-юмор)
- freshGrave — decorative (Свежая могила: холмик + венок с бантом)
- cemeteryGate — decorative (Ворота: столбы + кованая арка, ворона)
- bushHedge — decorative, render: 'tile' — полиомино-кусты (как в parkmaze): движок рисует тень юг/восток + волнистую губу север/запад у каждой фигуры; иконка full-bleed, БЕЗ render:'tile' не использовать
- roseBush — decorative, render: 'tile' — цветущий куст-полиомино (greenhouse); full-bleed SVG, тень и волнистую кромку рисует движок
- barberChair — occupiable (парикмахерское кресло)
- hairDryer — decorative
- productShelf — decorative (стойка с косметикой)
- grapeVine — decorative, render: 'tile' (виноградная лоза-полиомино; winery)
- winePress — decorative (винный пресс; winery)
- wineRack — decorative (стеллаж с винными бутылками; winery)
- grapeCrate — decorative (ящик винограда; winery)
- wineGlass — decorative (бокал с вином; winery)

## ItemIcon.tsx — существующие иконки (имена case, без кода)

Новые ключи SVG сюда НЕ добавляются: иконки резолвятся через SVG-registry
(`src/assets/iconRegistry.ts`, `import.meta.glob`) — он выигрывает у switch-case.
Список ниже — только legacy-ключи fallback-свитча.

stove, fridge, chair, sofa, bed, wardrobe, bookshelf, kassa, veggieCounter, cart, plant, rack, box, stool, paintingStand, sculpture, souvenirRack, ladder, bench, fountain, swing, lamppost, trashcan, flowerbed, kiosk, barCounter, piano, billiardTable, barStool, barrel, hitchingPost, haystack, safe, cauldron, workbench, spellbookStand, globe, artifactChest, armchair, portrait, telescope, broomRack, computer, watercooler, mannequin, tent, campfire, tree, stump, suitcase, departureBoard, turnstile, clock, sarcophagus, canopicJar, torch, goldStatue, stela, airlock, satelliteDish, cryopod, examTable, medicineCabinet, horse, cactus, wagon, trough, goal, ball, seat, treadmill, exerciseBike, hurdle, table, basketball, toilet, camera, toolbox, bathtub, jacuzzi, tv, floorLamp, keyBox, journal, palm, rock, coconut, hammock, hut, bottle, shell, lamp, boat, berth, samovar, luggageRack, throne, candleStand, armorStand, weaponRack, well, ferrisWheel, carousel, shootingGallery, popcornStand, plane, windsock, baggageCart, lion, giraffe, monkey, hippo, zebra, penguin, clueBoard, clapperboard, spotlight, makeupMirror, movieCamera

## floorTextures.ts — textureKey

tile, carpet, wood, marble, linoleum, rug, grass, dirt, stone, water, sand, metal, concrete, rubber, stairs, cliff, cobble, asphalt, snow, ice, checker, rails

## Имена

Таблица имён по буквам — `notes.md` §5 (`~/.paiw/projects/personal/murdoku/notes.md`, симлинк `.paiw/README.md` в репо). Не дублировать здесь.
