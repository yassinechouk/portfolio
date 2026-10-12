import type { Content } from './types'

// TODO(owner): every value below is placeholder text. Replace with real content.
export const content: Content = {
  about: {
    name: 'Yassine Chouk', // TODO(owner): confirm display name
    headline: 'TODO(owner): INSAT student building embedded, IoT and systems software',
    bio: 'TODO(owner): write a short bio (2-3 sentences) about your background and goals.',
    links: {
      cv: 'cv.pdf', // relative to BASE_URL; TODO(owner): add public/cv.pdf
      github: 'https://github.com/TODO-owner', // TODO(owner)
      linkedin: 'https://www.linkedin.com/in/TODO-owner', // TODO(owner)
    },
  },
  skills: [
    { id: 'languages', label: 'Languages', items: ['C', 'C++', 'Python'] }, // TODO(owner)
    { id: 'platforms', label: 'Platforms', items: ['STM32', 'ESP32'] }, // TODO(owner)
    { id: 'protocols', label: 'Protocols', items: ['I2C', 'SPI', 'UART', 'CAN'] }, // TODO(owner)
    { id: 'tools', label: 'Tools', items: ['RTOS', 'Git', 'GDB'] }, // TODO(owner)
  ],
  projects: [
    {
      id: 'todo-sensor-node',
      title: 'TODO(owner): Low-power IoT sensor node',
      summary: 'TODO(owner): describe the project, your contribution and the outcome.',
      tags: ['ESP32', 'C', 'I2C'],
      role: 'TODO(owner): role',
      repoUrl: 'https://github.com/TODO-owner/sensor-node',
    },
    {
      id: 'todo-rtos-scheduler',
      title: 'TODO(owner): RTOS task scheduler on STM32',
      summary: 'TODO(owner): describe the project, your contribution and the outcome.',
      tags: ['STM32', 'RTOS', 'C'],
      role: 'TODO(owner): role',
      repoUrl: 'https://github.com/TODO-owner/rtos-scheduler',
    },
    {
      id: 'todo-can-gateway',
      title: 'TODO(owner): CAN bus gateway',
      summary: 'TODO(owner): describe the project, your contribution and the outcome.',
      tags: ['CAN', 'UART', 'C++'],
      role: 'TODO(owner): role',
      repoUrl: 'https://github.com/TODO-owner/can-gateway',
    },
  ],
  contact: { email: 'todo-owner@example.com' }, // TODO(owner)
}
