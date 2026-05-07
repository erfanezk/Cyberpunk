import type { Project } from '@/types';
import { generateId } from '@/utils';
import snappImg from '@/assets/Snapp.svg';
import moneyroImg from '@/assets/Moneyro.webp';
import reportPlusImg from '@/assets/reportplus.png';
import meroojImg from '@/assets/Merooj.svg';

export const PROJECTS: Project[] = [
  {
    title: 'Snapp',
    description:
      "Iran's largest super app — ride-hailing, food delivery, logistics, and digital payments serving millions of users",
    link: 'https://snapp.ir',
    color: '#00fff5',
    id: generateId(),
    image: snappImg,
  },
  {
    title: 'Moneyro',
    description:
      'Fintech platform for digital payments, money management, and financial services in the Iranian market',
    link: 'https://moneyro.app',
    color: '#ff00ff',
    id: generateId(),
    image: moneyroImg,
  },
  {
    title: 'ReportPlus',
    description:
      'Construction supervision and municipal reporting platform — work orders, documentation, and coordination between owners, contractors, and city authorities',
    link: 'https://reportplus.ir/',
    color: '#0066ff',
    id: generateId(),
    image: reportPlusImg,
  },
  {
    title: 'Merooj',
    description:
      'Iranian sports brand — athletic shoes, clothing, and accessories for the domestic market',
    link: 'https://merooj.ir/',
    color: '#ff9900',
    id: generateId(),
    image: meroojImg,
  },
];
