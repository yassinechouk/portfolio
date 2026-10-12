import type { Content } from './types'

export const content: Content = {
  about: {
    name: 'Yassine Chouk',
    eyebrow: 'Embedded · Real-time · Firmware',
    headline: 'I make microcontrollers keep their promises.',
    tagline: 'Firmware that meets its deadlines, from bare-metal bootloaders to RTOS-driven motor control.',
    paragraphs: [
      "I'm an engineering student at INSAT in Tunis who likes the part of software where a late answer is a wrong answer. I write C and C++ firmware for STM32, ESP32-S3 and TI C2000 chips, and I like proving it works on a bench with an oscilloscope, not just in a simulator.",
      'My favourite problems sit between the code and the hardware: making an update survive a power cut, catching a missed deadline before the motor does, fitting a model into a few hundred kilobytes.',
      "Right now I'm looking for an embedded firmware internship where I can keep building things that have to be right the first time.",
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
      image: {
        src: 'experience/qehna-deadband.webp',
        alt: 'Photo of an oscilloscope screen with two PWM traces and cursors; the readout shows a 300 ns time difference between them',
        caption: '300 ns dead-time between complementary PWM signals, measured on the oscilloscope.',
      },
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
      summary:
        'A live timing analyser for FreeRTOS. It discovers every task by itself, measures response times on the target, and checks each deadline twice: by calculation and by measurement. Proven on a hardware-in-the-loop motor-control bench, including a fault lab that injects CPU hogs on purpose.',
      tags: ['STM32L476RG', 'FreeRTOS', 'ESP32-S3', 'DWT', 'UART'],
      role: 'Author',
      metrics: ['13 tasks', '0 deadline misses', '47.8% CPU', '5/5 injected faults caught in under 0.58 s'],
      media: [
        {
          src: 'projects/freertos-inspector/inspector.webp',
          alt: 'FreeRTOS Inspector dashboard with an All tasks on time verdict, CPU load and the task table',
          caption: 'Live dashboard on the bench: 13 tasks discovered, every deadline met, CPU 47.8% busy.',
        },
        {
          src: 'projects/freertos-inspector/inspector-fault.webp',
          alt: 'The same dashboard showing a red Deadline problem verdict, with the late tasks link and taskB highlighted in the task table',
          caption: 'After an injected CPU hog, the Inspector names the late tasks.',
        },
        {
          src: 'projects/freertos-inspector/bench.webp',
          alt: 'Photo of the test bench: an STM32 Nucleo board, a purple ESP32-S3 board and a green microcontroller board wired to a breadboard with a potentiometer',
          caption: 'The hardware-in-the-loop bench: an STM32 Nucleo under test, two more microcontroller boards and a speed potentiometer.',
        },
      ],
      repoUrl: 'https://github.com/yassinechouk/Freertos-inspector',
    },
    {
      id: 'ota-bootloader',
      title: 'Dual-slot OTA bootloader',
      summary:
        'A firmware update system for the STM32L476RG, written bare-metal with no HAL and no RTOS. New images are verified three ways, installed in a spare flash slot and started on trial; if the application never confirms, the watchdog resets the board and the bootloader rolls back by itself. Updates arrive over UART or wirelessly through an ESP32-S3 Wi-Fi gateway.',
      tags: ['STM32L476RG', 'Bare-metal C', 'ESP32-S3', 'UART', 'CRC32', 'IWDG'],
      role: 'Author',
      metrics: ['3-layer verification', 'automatic rollback', '43 host tests'],
      media: [
        {
          src: 'projects/ota-bootloader/arch.webp',
          alt: 'Architecture diagram: an ST-Link debugger, a USB-UART cable and a PC on Wi-Fi reach an ESP32-S3 gateway and an STM32L476RG Nucleo holding the bootloader, slot A and slot B',
          caption: 'One STM32 with a 32 KB bootloader and two 480 KB slots, reachable over UART or a Wi-Fi gateway.',
        },
        {
          src: 'projects/ota-bootloader/memory-layout.webp',
          alt: 'Flash memory map of the STM32L476RG: a 32 KB bootloader, two 480 KB application slots and two 2 KB metadata blocks, with addresses from 0x08000000 to 0x08100000',
          caption: 'Flash layout: bootloader, slots A and B, and two metadata copies so a power loss never corrupts the state; rollback is a single field write.',
        },
      ],
      repoUrl: 'https://github.com/yassinechouk/BOOTLOADER_OTA',
    },
    {
      id: 'trackify',
      title: 'Trackify: fall-detection safety device',
      summary:
        "A wearable safety device for people with Alzheimer's. An ESP32-S3 reads motion from an MPU6050 and classifies idle, walking and falling with a Random Forest running on the device, then raises Wi-Fi cloud alerts with a GSM SMS fallback, alongside GPS tracking and an SOS button.",
      tags: ['ESP32-S3', 'MPU6050', 'SIM800L', 'NEO-6M GPS', 'Random Forest'],
      role: 'Embedded firmware & ML (team project)', // TODO(owner): confirm role
      metrics: ['Random Forest on-device', 'Wi-Fi alerts + SMS fallback'],
      media: [
        {
          src: 'projects/trackify/prototype.webp',
          alt: 'Prototype on a cardboard board: an ESP32-S3 board, a GPS module, a SIM800L modem, an LCD, a yellow button and a battery supply wired on a breadboard',
          caption: 'Working prototype: ESP32-S3, GPS, SIM800L GSM modem, an SOS button and an LCD, powered from a Li-ion cell.',
        },
        {
          src: 'projects/trackify/concept.webp',
          alt: 'Concept illustration of an older woman wearing the chest-worn device, with callouts for the SOS button, LCD, fall detection states, geolocation and alerts',
          caption: 'The imagined wearable product.',
        },
      ],
      repoUrl: 'https://github.com/yassinechouk/smart-belt-alzheimer',
    },
    {
      id: 'aqua-genius',
      title: 'AQUA GENIUS: edge-ML irrigation',
      summary:
        'A smart irrigation controller that decides on the device, not in the cloud. Two XGBoost models (pump on/off and water volume) are trained in Python and converted to plain C++ for an ESP32-S3, matching the Python output exactly. Telemetry and manual override go through a Blynk dashboard.',
      tags: ['ESP32-S3', 'XGBoost', 'C++', 'DS18B20'],
      role: 'Model training & ESP32-S3 firmware',
      metrics: ['under 10 ms inference', '~400 KB flash', '~1 KB RAM', 'bit-exact with Python'],
      media: [
        {
          src: 'projects/aqua-genius/prototype.webp',
          alt: 'Top view of the field prototype: a microcontroller on a breadboard in a cardboard box, a soil sensor in a plant pot and two water tanks joined by tubing',
          caption: 'Field prototype: ESP32-S3 controller on a breadboard, soil sensor in a pot, and two water tanks linked by tubing.',
        },
      ],
      repoUrl: 'https://github.com/yassinechouk/AQUA_GENIUS_project',
    },
  ],
  contact: {
    email: 'yassine.chouk@insat.ucar.tn',
    phone: '+216 21 691 995',
    form: { accessKey: 'TODO(owner): web3forms access key' },
  },
}
