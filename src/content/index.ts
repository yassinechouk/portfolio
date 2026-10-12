import type { Content } from './types'

export const content: Content = {
  about: {
    name: 'Yassine Chouk',
    role: 'Embedded Systems Engineering Student',
    affiliation: 'INSAT, Tunisia',
    availability: 'Open to collaborations',
    headline: 'I make microcontrollers keep their promises.',
    tagline: 'Firmware that meets its deadlines, from bare-metal bootloaders to RTOS-driven motor control.',
    lead: "I'm an embedded systems engineering student at INSAT in Tunis. I write C and C++ firmware for STM32, ESP32-S3 and TI C2000 microcontrollers.",
    blocks: [
      {
        title: "Let's collaborate",
        text: "Building something with microcontrollers, or have an idea that needs a firmware hand? I'm open to collaborations. Send me a message and let's talk.",
      },
    ],
    highlights: ['Real-time firmware', 'Bootloaders & OTA', 'Hardware-in-the-loop testing'],
    education: 'INSAT, Engineering degree in Industrial IT & Automation, 2023 to 2028 (expected)',
    spokenLanguages: ['Arabic (native)', 'English (IELTS 7.0, C1)', 'French (C1)', 'German (ÖSD A2)'],
    links: {
      cv: 'cv.pdf', // relative to BASE_URL
      github: 'https://github.com/yassinechouk',
      linkedin: 'https://www.linkedin.com/in/yassine-chouk-8ba806312/',
    },
  },
  skills: [
    { id: 'languages', label: 'Languages', items: ['C', 'C++', 'Python'] },
    { id: 'platforms', label: 'Platforms', items: ['STM32', 'ESP32-S3', 'TI C2000', 'Raspberry Pi'] },
    {
      id: 'firmware',
      label: 'RTOS & Firmware',
      items: [
        'FreeRTOS',
        'Real-time scheduling',
        'Bare-metal',
        'Bootloaders',
        'OTA updates',
        'Interrupts',
        'DMA',
        'ADC / DAC',
        'Timers',
        'PWM',
      ],
    },
    { id: 'protocols', label: 'Protocols', items: ['UART', 'SPI', 'I2C', 'CAN', 'Wi-Fi'] },
    {
      id: 'tools',
      label: 'Tools',
      items: ['STM32CubeIDE', 'Code Composer Studio', 'ESP-IDF', 'Arduino IDE', 'Git', 'Linux'],
    },
    {
      id: 'testing',
      label: 'Testing',
      items: ['Hardware-in-the-loop (HIL)', 'On-target debugging', 'Oscilloscope', 'Logic analyzer'],
    },
  ],
  experience: [
    {
      id: 'qehna-lab',
      role: 'Embedded control intern',
      organization: 'Qehna LAB (ENIT)',
      place: 'Tunis',
      period: 'Jun 2026',
      outcomes: [
        'Drove a three-phase induction motor from a TI C2000 with open-loop V/f control.',
        'Used third-harmonic injection for about 15.5% more DC-bus use, and checked the sine references and the 300 ns dead-time on an oscilloscope.',
      ],
      tags: ['TI C2000', 'PWM', 'V/f control'],
      repoUrl: 'https://github.com/yassinechouk/c2000-vf-motor-control',
    },
    {
      id: 'sagemcom',
      role: 'Test automation intern',
      organization: 'Sagemcom',
      place: 'Ezzahra',
      period: 'Aug 2025',
      outcomes: [
        'Built LOGCOMPARE, a Python tool that checks test-bench logs against a reference with colour-coded thresholds, replacing about half an hour of manual inspection per run.',
      ],
      tags: ['Python', 'Tkinter'],
      repoUrl: 'https://github.com/yassinechouk/LOGCOMPARE',
    },
  ],
  projects: [
    {
      id: 'freertos-inspector',
      title: 'FreeRTOS Inspector',
      featured: true,
      summary:
        'A live timing analyser for FreeRTOS: it finds every task, measures response times on the target, and checks each deadline by calculation and by measurement. Proven on a hardware-in-the-loop motor bench.',
      tags: ['STM32L476RG', 'FreeRTOS', 'ESP32-S3', 'DWT', 'UART'],
      role: 'Author',
      metrics: ['13 tasks', '0 deadline misses', '47.8% CPU', '5/5 injected faults caught within 0.58 s'],
      media: [
        {
          src: 'projects/freertos-inspector/inspector.webp',
          alt: 'FreeRTOS Inspector dashboard with an All tasks on time verdict, CPU load and the task table',
          caption: 'Live dashboard on the bench: 13 tasks discovered, every deadline met, CPU 47.8% busy.',
        },
      ],
      repoUrl: 'https://github.com/yassinechouk/Freertos-inspector',
    },
    {
      id: 'ota-bootloader',
      title: 'Dual-slot OTA bootloader',
      featured: true,
      summary:
        'A bare-metal update system for the STM32L476RG: new firmware is verified three ways, installed in a spare slot and started on trial, and the board rolls back by itself if it fails. Updates can arrive over UART or Wi-Fi.',
      tags: ['STM32L476RG', 'Bare-metal C', 'ESP32-S3', 'UART', 'CRC32', 'IWDG'],
      role: 'Author',
      metrics: ['3-layer verification', 'automatic rollback', '43 host tests'],
      media: [
        {
          src: 'projects/ota-bootloader/arch.webp',
          alt: 'Architecture diagram: an ST-Link debugger, a USB-UART cable and a PC on Wi-Fi reach an ESP32-S3 gateway and an STM32L476RG Nucleo holding the bootloader, slot A and slot B',
          caption: 'One STM32 with a 32 KB bootloader and two 480 KB slots, reachable over UART or a Wi-Fi gateway.',
        },
      ],
      repoUrl: 'https://github.com/yassinechouk/BOOTLOADER_OTA',
    },
    {
      id: 'trackify',
      title: 'Trackify: fall-detection safety device',
      summary:
        "Wearable safety device for Alzheimer's patients: on-device fall detection, GPS tracking and SMS alerts.",
      tags: ['ESP32-S3', 'Random Forest', 'GSM'],
      metrics: [],
      media: [],
      repoUrl: 'https://github.com/yassinechouk/smart-belt-alzheimer',
    },
    {
      id: 'aqua-genius',
      title: 'AQUA GENIUS: edge-ML irrigation',
      summary: 'Smart irrigation that decides on the ESP32-S3, not in the cloud: two XGBoost models running as plain C++.',
      tags: ['ESP32-S3', 'XGBoost', 'C++'],
      metrics: [],
      media: [],
      repoUrl: 'https://github.com/yassinechouk/AQUA_GENIUS_project',
    },
  ],
  contact: {
    email: 'yassine.chouk@insat.ucar.tn',
    phone: '+216 21 691 995',
    form: { accessKey: 'TODO(owner): web3forms access key' },
  },
}
