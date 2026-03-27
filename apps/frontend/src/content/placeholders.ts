export interface LandingLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  coords: {
    lat: number;
    lng: number;
  };
  features?: string[];
}
interface SiteContent {
  brand: string;
  nav: Array<{
    href: string;
    label: string;
  }>;
  landing: {
    title: string;
    subtitle: string;
    about: string;
    gallery: Array<{
      src: string;
      alt: string;
      caption: string;
    }>;
    testimonials: string[];
    locations: LandingLocation[];
  };
}
export const siteContent: SiteContent = {
  brand: 'SHOOTER VR',
  nav: [{
    href: '/',
    label: 'Главная'
  }, {
    href: '/booking',
    label: 'Запись на игру'
  }, {
    href: '/business',
    label: 'Партнерам'
  }, {
    href: '/matches',
    label: 'Матчи'
  }],
  landing: {
    title: 'SHOOTER VR — тактический командный VR-шутер',
    subtitle: 'Командные матчи в виртуальной реальности с картами, режимами и архивом завершённых встреч.',
    about: 'SHOOTER VR — игровой продукт про командное взаимодействие, матчи и соревновательный опыт. Собирайте состав, выходите на карту и возвращайтесь к истории матчей, чтобы разбирать результаты и статистику.',
    gallery: [{
      src: '/landing-screenshot-1.jpg',
      alt: 'Карта SHOOTER VR',
      caption: 'Карта SHOOTER VR'
    }, {
      src: '/landing-screenshot-2.jpg',
      alt: 'Матч SHOOTER VR',
      caption: 'Матч SHOOTER VR'
    }, {
      src: '/landing-screenshot-3.jpg',
      alt: 'Команда перед матчем',
      caption: 'Команда перед матчем'
    }],
    testimonials: ['«Сильнее всего заходит командная динамика и возможность после игры разобрать счёт и статистику всей встречи.»', '«Архив матчей помогает возвращаться к результатам, сравнивать составы и обсуждать лучшие раунды после сессии.»'],
    locations: [{
      id: 'msk-central',
      name: 'Площадка Центр',
      city: 'Москва',
      address: 'ул. Тверская, 12',
      coords: {
        lat: 55.7558,
        lng: 37.6173
      },
      features: ['Матчи SHOOTER VR', 'История сыгранных встреч', 'Игровые слоты по расписанию']
    }, {
      id: 'spb-nevsky',
      name: 'Площадка Север',
      city: 'Санкт-Петербург',
      address: 'Невский проспект, 48',
      coords: {
        lat: 59.9343,
        lng: 30.3351
      },
      features: ['Командные сессии', 'Разбор результатов матчей', 'Игровые карты']
    }, {
      id: 'kzn-tech-loft',
      name: 'Площадка Юг',
      city: 'Казань',
      address: 'ул. Баумана, 19',
      coords: {
        lat: 55.7961,
        lng: 49.1064
      },
      features: ['PvP-матчи', 'Статистика игроков', 'Запись на игру']
    }]
  }
};
