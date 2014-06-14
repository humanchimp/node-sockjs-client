var test = require('tape');

var helpers = require('./lib/helpers.js');

['websocket'].forEach(function (protocol) {
    test('echo: basic', basic_echo_factory(protocol));
    test('echo: rich', rich_echo_factory(protocol));
    test('echo: unicode', unicode_echo_factory(protocol));
    test('echo: special chars', special_chars_echo_factory(protocol));
    test('echo: large message', large_message_echo_factory(protocol));
    test('echo: simple utf', simple_utf_encoding_echo_factory(protocol));
    test('echo: utf', utf_encoding_echo_factory(protocol));
});

function basic_echo_factory(protocol) {
    var messages;
    messages = ['data'];
    return echo_factory_factory(protocol, messages);
}

function rich_echo_factory(protocol) {
    var messages;
    messages = [
        [1, 2, 3, 'data'], null, false, "data", 1, 12.0, { a: 1, b: 2
        }
    ];
    return echo_factory_factory(protocol, messages);
}

function unicode_echo_factory(protocol) {
    var messages;
    messages = ["Τη γλώσσα μου έδωσαν ελληνική το σπίτι φτωχικό στις αμμουδιές του ", "ღმერთსი შემვედრე, ნუთუ კვლა დამხსნას სოფლისა შრომასა, ცეცხლს, წყალს", "⠊⠀⠉⠁⠝⠀⠑⠁⠞⠀⠛⠇⠁⠎⠎⠀⠁⠝⠙⠀⠊⠞⠀⠙⠕⠑⠎⠝⠞⠀⠓⠥⠗⠞⠀⠍⠑", "Би шил идэй чадна, надад хортой биш", "을", "나는 유리를 먹을 수 있어요. 그래도 아프지 않아요", "ฉันกินกระจกได้ แต่มันไม่ทำให้ฉันเจ็บฉันกินกระจกได้ แต่มันไม่ทำให้ฉันเจ็บ", "Ég get etið gler án þess að meiða mig.", "Mogę jeść szkło, i mi nie szkodzi.", "\ufffd\u10102\u2f877", "Начало музыкальной карьеры\nБритни пела в церковном хоре местной баптистской церкви. В возрасте 8-ми лет Спирс прошла аудирование для участия в шоу «Новый Клуб Микки-Мауса» на канале «Дисней». И хотя продюсеры решили, что Спирс слишком молода для участия в шоу, они представили её агенту в Нью-Йорке. Следующие 3 года Бритни училась в актёрской школе Professional Performing Arts School в Нью-Йорке и участвовала в нескольких постановках, в том числе «Ruthless!» 1991 года. В 1992 году Спирс участвовала в конкурсе Star Search, но проиграла во втором туре.\nВ 1993 году Спирс вернулась на канал «Дисней» и в течение 2-х лет участвовала в шоу «Новый Клуб Микки-Мауса». Другие будущие знаменитости, начинавшие с этого шоу — Кристина Агилера, участники 'N Sync Джастин Тимберлейк и Джейси Шазе, звезда сериала «Счастье» Кери Расселл и актёр фильма «Дневник памяти» Райан Гослинг.\nВ 1994 году шоу закрыли, Бритни вернулась домой в Луизиану, где поступила в среднюю школу. Некоторое время она пела в девичьей группе Innosense, но вскоре, решив начать сольную карьеру, записала демодиск, который попал в руки продюсерам из Jive Records, и те заключили с ней контракт.\nДалее последовал тур по стране, выступления в супермаркетах и работа на разогреве у групп 'N Sync и Backstreet Boys.\n[править]1999—2000: Ранний коммерческий успех\nВ октябре 1998 года вышел дебютный сингл Бритни Спирс «…Baby One More Time» . Песня имела огромный успех, в первые же недели возглавила международные чарты, мировые продажи сингла составили 9 миллионов копий, что сделало диск дважды платиновым. Альбом с одноимённым названием вышел в январе 1999 года. Альбом стартовал на первом месте рейтинга Billboard 200, пятьдесят одну неделю продержался в верхней десятке и шестьдесят недель в двадцати лучших. Альбом стал 15-кратным платиновым и на сегодняшний день является самым успешным альбомом Бритни Спирс.\nВ 1999 году Бритни снялась для апрельского номера журнала Rolling Stone. Откровенные фотографии спровоцировали слухи о том, что 17-летняя звезда сделала операцию по увеличению груди, что сама Спирс отрицала. Успех альбома и противоречивый образ Спирс, созданный массмедиа, сделали её главной звездой 1999 года.\nВслед за успешным дебютом последовал второй альбом певицы «Oops!... I Did It Again», также стартовавший на 1-м месте в США. Продажи за первую неделю составили 1 319 193 копии, что являлось абсолютным рекордом, который затем побил американский рэпер Эминем. Летом 2000 года Спирс отправилась в свой первый мировой тур, «Oops!… I Did It Again World Tour». В 2000 году Спирс получила две награды Billboards Music Awards и была номинирована на «Грэмми» в двух категориях — «Лучший поп-альбом» и «Лучшее живое выступление».\n[править]2001—2003: Вершина карьеры\n\n\nИсполняя «Me Against the Music»\nУспех Спирс сделал её заметной фигурой и в музыкальной индустрии, и в поп-культуре. В начале 2001 года она привлекла внимание «Пепси», эта компания предложила ей многомиллионный контракт, включавший телевизионную рекламу и участие в промо-акциях.\nВ ноябре 2001 года вышел третий альбом Спирс — Britney. Альбом дебютировал на первом месте в США с продажами в 745 744 пластинок за первую неделю, что сделало Бритни первой в истории исполнительницей, чьи первые три альбома стартовали на вершине рейтинга. Сразу же после выхода альбома Спирс отправилась в тур Dream Within a Dream Tour, по окончании которого объявила, что хочет взять 6-месячный перерыв в карьере.\nВ этом же году Спирс рассталась с солистом 'N Sync Джастином Тимберлейком, с которым встречалась 4 года.\nБритни вернулась на сцену в августе 2003 года.\nВ ноябре 2003 года вышел четвёртый студийный альбом Спирс In The Zone. Бритни участвовала в написании восьми из тринадцати композиций, а также выступила в качестве продюсера альбома. In The Zone дебютировал на первом месте в США, что сделало Бритни первой в истории исполнительницей, чьи первые четыре альбома стартовали на вершине рейтинга. Самый успешный сингл с альбома — Toxic — принёс Бритни первую для неё награду Грэмми в категории «Лучшая танцевальная композиция».\n[править]2007—2008: Возвращение к музыке\nВ начале 2007 года после двухлетнего перерыва Спирс приступила к записи нового сольного альбома, продюсерами которого выступили Nate «Danja» Hills, Шон Гарретт и Джонатан Ротэм.\nВ мае 2007 года Спирс в составе коллектива «The M and M’s» дала 6 концертов в рамках тура «House of Blues» в Лос-Анджелесе, Сан-Диего, Анахайме, Лас-Вегасе, Орландо и Майами. Каждый концерт длился около 15 минут и включал 5 старых хитов певицы.[4]\n30 августа 2007 года на волнах нью-йоркской радиостанции Z100 состоялась премьера песни «Gimme More», первого сингла с нового альбома Спирс.[5] Сингл вышел на iTunes 24 сентября и на CD 29 октября 2007.\n9 сентября 2007 года Спирс исполнила «Gimme More» на церемонии вручения наград MTV Video Music Awards. Выступление оказалось неудачным; Спирс выглядела непрофессионально — не всегда попадала в фонограмму и в танце отставала от группы хореографической поддержки.[6]\nНесмотря на это, в начале октября 2007 года сингл «Gimme More» достиг 3-го места в чарте Billboard Hot 100, став таким образом одним из самых успешных синглов Спирс.[7]"];
    return echo_factory_factory(protocol, messages);
}

function special_chars_echo_factory(protocol) {
    var messages;
    messages = [" ", "\u0000", "\xff", "\xff\x00", "\x00\xff", " \r ", " \n ", " \r\n ", "\r\n", "", "message\t", "\tmessage", "message ", " message", "message\r", "\rmessage", "message\n", "\nmessage", "message\xff", "\xffmessage", "A", "b", "c", "d", "e", "\ufffd", "\ufffd\u0000", "message\ufffd", "\ufffdmessage"];
    return echo_factory_factory(protocol, messages);
}

function large_message_echo_factory(protocol) {
    var messages;
    messages = [
        new Array(Math.pow(2, 1)).join('x'),
        new Array(Math.pow(2, 2)).join('x'),
        new Array(Math.pow(2, 4)).join('x'),
        new Array(Math.pow(2, 8)).join('x'),
        new Array(Math.pow(2, 13)).join('x'),
        new Array(Math.pow(2, 13)).join('x')
    ];
    return echo_factory_factory(protocol, messages);
}

function simple_utf_encoding_echo_factory(protocol) {
    var message = (function() {
        var _results, i;
        _results = [];
        for (i = 0; i <= 256; i++) {
            _results.push(String.fromCharCode(i));
        }
        return _results;
    })();
    return echo_factory_factory(protocol, [message.join('')]);
}

function utf_encoding_echo_factory(protocol) {
    var message = helpers.killerString();
    return echo_factory_factory(protocol, [message]);
}

function echo_factory_factory(protocol, messages) {
    return function (t) {
        var a, r;
        t.plan(2 + messages.length);
        a = messages.slice(0);
        r = helpers.newSockJS('/echo', protocol);
        r.onopen = function(e) {
            t.ok(true);
            r.send(a[0]);
        };
        r.onmessage = function(e) {
            var i, x, xx1, xx2, _ref;
            x = '' + a[0];
            if (e.data !== x) {
                for (i = 0, _ref = e.data.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                    if (e.data.charCodeAt(i) !== x.charCodeAt(i)) {
                        xx1 = ('0000' + x.charCodeAt(i).toString(16)).slice(-4);
                        xx2 = ('0000' + e.data.charCodeAt(i).toString(16)).slice(-4);
                        console.log('source: \\u' + xx1 + ' differs from: \\u' + xx2);
                        break;
                    }
                }
            }
            t.equal(e.data, '' + a[0]);
            a.shift();
            if (typeof a[0] === 'undefined') {
                r.close();
            } else {
                r.send(a[0]);
            }
        };
        r.onclose = function(e) {
            if (a.length) {
                t.ok(false, "Transport closed prematurely. " + e);
            } else {
                t.ok(true);
            }
        };
    };
}
