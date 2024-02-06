export type Project = {
  name: string;
  description: string;
  href: string;
  date: string;
};

export const projects: Project[] = [
  {
    name: "kafeasist",
    description:
      "kafeasist is a café/restaurant/bar management software as a service. kafeasist makes managing your business much more simpler with easy-to-use dashboard. With kafeasist, you won't need any other software to run your business.",
    href: "https://kafeasist.com",
    date: "2023-08-01",
  },
  {
    name: "vue-paho-mqtt",
    description:
      "Easy-to-use Paho MQTT client for Vue 3 with centralized subscription management, type support, and built-in optional alert notification library.",
    href: "https://github.com/kaandesu/vue-paho-mqtt/",
    date: "2023-03-30",
  },
  {
    name: "istasyoncikolata",
    description:
      "istasyoncikolata is a website for a restaurant/café built with Astro.",
    href: "https://github.com/EgeOnder/istasyoncikolata/",
    date: "2022-10-26",
  },
  {
    name: "egeonder.dev",
    description:
      "My personal portfolio and blog website built with Next.js and Tailwind CSS.",
    href: "https://github.com/EgeOnder/egeonder.dev/",
    date: "2023-12-20",
  },
];
