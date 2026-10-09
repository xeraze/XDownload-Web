import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: {
    translation: {
      nav: {
        how: "Как это работает",
        services: "Сервисы",
        download: "Скачать",
        menu: "Меню",
      },
      tool: {
        title: "Скачать файл",
        subtitle: "Вставь ссылку, выбери формат - файл появится ниже в «Скачанные».",
      },
      downloads: {
        title: "Скачанные файлы",
        empty: "Пока пусто - вставь ссылку и скачай первый файл.",
        clear: "Очистить историю",
        again: "Скачать снова",
        local: "на твоём устройстве",
      },
      hero: {
        title: "Скачивай видео и аудио",
        subtitle:
          "Вставь ссылку - выбери формат и сохрани файл к себе. 13 сервисов, без регистрации и водяных знаков.",
        cta: "Скачать файл",
      },
      dl: {
        placeholder: "Вставь ссылку на видео или аудио",
        submit: "Скачать",
        change: "Изменить",
        back: "Назад",
        chooseFormat: "Выбери формат",
        video: "Видео · MP4",
        audio: "Аудио · MP3",
        chooseQuality: "Качество",
        working: "Скачиваем - это может занять до минуты",
        save: "Сохранить файл",
        again: "Скачать ещё",
        retry: "Попробовать снова",
        errOffline: "Сервер недоступен - попробуйте позже.",
        errUnsupported: "Эта ссылка не поддерживается.",
        errGeneric: "Не удалось скачать - попробуйте другую ссылку.",
      },
      status: {
        title: "Статус сервиса",
        checking: "Проверяем сервис…",
        day: "Сервис работает",
        technical: "Технические неполадки - попробуйте позже",
        morning: "Утреннее обслуживание - откроемся в 09:00",
        pauseToday: "Плановая пауза - откроемся сегодня в 09:00",
        pauseTomorrow: "Плановая пауза - откроемся завтра в 09:00",
      },
      how: {
        title: "Как это работает",
        lead: "Три шага от ссылки до файла.",
        s1t: "Вставь ссылку",
        s1d: "Поддерживается YouTube, TikTok, Spotify и ещё 10 сервисов.",
        s2t: "Выбери формат",
        s2d: "Видео MP4 в нужном качестве или аудио MP3.",
        s3t: "Скачай файл",
        s3d: "Файл сохранится к тебе на устройство, ничего никуда не загружается.",
        fmtT: "Форматы и качество",
        fmtD: "MP4 выбирается по разрешению: от 360p до того, что есть у источника. MP3 - аудио без видео. Что доступно, зависит от сервиса и самой записи.",
        storT: "Где хранятся файлы",
        storD: "Файл собирается на сервере, отдаётся тебе и удаляется через 30 минут. Данных о скачанных файлах не остаётся.",
        histT: "История",
        histD: "Список «Скачанные» живёт в localStorage твоего браузера: сервер его не видит, на других устройствах не появляется.",
        faqT: "Частые вопросы",
        q1: "Почему не скачивается?",
        a1: "Сервис мог измениться или временно ограничивать выдачу. Попробуй позже или другую ссылку.",
        q2: "Нужна ли регистрация?",
        a2: "Нет. Вставляешь ссылку, выбираешь формат и скачиваешь.",
        q3: "Есть ли лимиты?",
        a3: "Запросы идут через очередь, чтобы сервис оставался стабильным для всех.",
      },
      services: {
        title: "Поддерживаются",
        subtitle: "13 сервисов - список расширяется.",
        legend: "MP4 - видео, MP3 - аудио. Что доступно, зависит от записи.",
      },
      footer: {
        note: "XDownload не хранит твои файлы - скачивание идёт напрямую к тебе.",
        bot: "Бот в Telegram",
        contacts: "Контакты",
        privacy: "Приватность",
      },
      privacy: {
        title: "Политика конфиденциальности",
        s1h: "Что мы храним",
        s1p: "Файлы нигде не хранятся - они скачиваются прямо на твоё устройство. История «Скачанные» существует только в localStorage твоего браузера: сервер её не видит и не копирует.",
        s2h: "Как работает сервис",
        s2p: "Ссылка уходит на наш сервер, где yt-dlp обрабатывает её во временном каталоге. Готовый файл доступен по внутренней ссылке только время обработки - обычно до 30 минут, затем удаляется автоматически. Баз данных и истории ссылок нет.",
        s3h: "Третьи стороны",
        s3p: "Сторонние API для скачивания не используются: всё выполняется на нашем собственном инстансе yt-dlp. Данные третьим лицам не передаются.",
        s4h: "Telegram",
        s4p: "Если пользуешься ботом, доставкой сообщений занимается сам Telegram - на его обработку данных распространяется Telegram Privacy Policy (telegram.org/privacy). Эта политика описывает только сайт и бота XDownload.",
        s5h: "Твоя ответственность",
        s5p: "Ты отвечаешь за контент отправляемых ссылок, соблюдение правил площадок (YouTube, TikTok, Instagram и других) и требования авторского права в своей юрисдикции. Сервис - только для личного использования.",
        s6h: "Контакты",
        s6p: "Вопросы по политике - в Telegram: t.me/xdlabot.",
      },
    },
  },
  en: {
    translation: {
      nav: {
        how: "How it works",
        services: "Services",
        download: "Download",
        menu: "Menu",
      },
      tool: {
        title: "Download a file",
        subtitle: "Paste a link, pick a format - the file appears in Downloads below.",
      },
      downloads: {
        title: "Downloaded files",
        empty: "Nothing here yet - paste a link and grab your first file.",
        clear: "Clear history",
        again: "Download again",
        local: "on your device",
      },
      hero: {
        title: "Download video and audio",
        subtitle:
          "Paste a link - pick a format and save the file. 13 services, no sign-ups, no watermarks.",
        cta: "Download a file",
      },
      dl: {
        placeholder: "Paste a video or audio link",
        submit: "Download",
        change: "Change",
        back: "Back",
        chooseFormat: "Choose a format",
        video: "Video · MP4",
        audio: "Audio · MP3",
        chooseQuality: "Quality",
        working: "Downloading - this may take up to a minute",
        save: "Save file",
        again: "Download another",
        retry: "Try again",
        errOffline: "Server unavailable - try again later.",
        errUnsupported: "This link isn't supported.",
        errGeneric: "Download failed - try another link.",
      },
      status: {
        title: "Service status",
        checking: "Checking the service…",
        day: "Service is running",
        technical: "Technical difficulties - try again later",
        morning: "Morning maintenance - opens at 09:00",
        pauseToday: "Scheduled pause - opens today at 09:00",
        pauseTomorrow: "Scheduled pause - opens tomorrow at 09:00",
      },
      how: {
        title: "How it works",
        lead: "Three steps from link to file.",
        s1t: "Paste a link",
        s1d: "YouTube, TikTok, Spotify and 10 more services are supported.",
        s2t: "Choose a format",
        s2d: "Video MP4 in the quality you need, or audio MP3.",
        s3t: "Get the file",
        s3d: "The file goes straight to your device, nothing is stored anywhere.",
        fmtT: "Formats and quality",
        fmtD: "MP4 is picked by resolution: from 360p up to whatever the source has. MP3 is audio without video. Availability depends on the service and the post itself.",
        storT: "Where files live",
        storD: "A file is assembled on the server, handed to you, and deleted after 30 minutes. No data about downloaded files is kept.",
        histT: "History",
        histD: "The Downloads list lives in your browser's localStorage: the server never sees it and it never appears on other devices.",
        faqT: "FAQ",
        q1: "Why does it not download?",
        a1: "The service may have changed or rate-limited us for a while. Try again later or another link.",
        q2: "Do I need an account?",
        a2: "No. Paste a link, pick a format, download.",
        q3: "Are there limits?",
        a3: "Requests go through a queue so the service stays stable for everyone.",
      },
      services: {
        title: "Supported",
        subtitle: "13 services - the list keeps growing.",
        legend: "MP4 is video, MP3 is audio. Availability depends on the post.",
      },
      footer: {
        note: "XDownload does not store your files - downloads go straight to you.",
        bot: "Bot on Telegram",
        contacts: "Contacts",
        privacy: "Privacy",
      },
      privacy: {
        title: "Privacy Policy",
        s1h: "What we store",
        s1p: "Files are not stored anywhere - they download straight to your device. The Downloads history lives only in your browser's localStorage: the server never sees or copies it.",
        s2h: "How the service works",
        s2p: "Your link goes to our server, where yt-dlp processes it in a temporary directory. The finished file is available through an internal link only while the job runs - usually up to 30 minutes - and is then deleted automatically. There are no databases and no link history.",
        s3h: "Third parties",
        s3p: "No third-party download APIs are used: everything runs on our own yt-dlp instance. No data is shared with third parties.",
        s4h: "Telegram",
        s4p: "If you use the bot, message delivery is handled by Telegram itself - its data practices are covered by the Telegram Privacy Policy (telegram.org/privacy). This policy covers only the XDownload site and bot.",
        s5h: "Your responsibility",
        s5p: "You are responsible for the content of the links you submit, for complying with the platforms' terms (YouTube, TikTok, Instagram and others) and with copyright law in your jurisdiction. The service is for personal use only.",
        s6h: "Contact",
        s6p: "Questions about this policy - on Telegram: t.me/xdlabot.",
      },
    },
  },
};

const stored = localStorage.getItem("xdl-lang");
const initial =
  stored === "ru" || stored === "en"
    ? stored
    : navigator.language.toLowerCase().startsWith("ru")
      ? "ru"
      : "en";

i18n.use(initReactI18next).init({
  resources,
  lng: initial,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = initial;

export function setLanguage(lng: "ru" | "en") {
  void i18n.changeLanguage(lng);
  localStorage.setItem("xdl-lang", lng);
}
