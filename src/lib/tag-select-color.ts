type Color = {
  darkMode: string;
  lightMode: string;
};

type TagColor = {
  background: Color;
  text: Color;
};

export default function tagSelectColor(tagName: string) {
  const hashFunction = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const hashed = hashFunction(tagName);

  const colors: TagColor[] = [
    {
      background: {
        darkMode: "bg-red-800",
        lightMode: "bg-red-100",
      },
      text: {
        darkMode: "text-red-100",
        lightMode: "text-red-800",
      },
    },
    {
      background: {
        darkMode: "bg-yellow-800",
        lightMode: "bg-yellow-100",
      },
      text: {
        darkMode: "text-yellow-100",
        lightMode: "text-yellow-800",
      },
    },
    {
      background: {
        darkMode: "bg-green-800",
        lightMode: "bg-green-100",
      },
      text: {
        darkMode: "text-green-100",
        lightMode: "text-green-800",
      },
    },
    {
      background: {
        darkMode: "bg-blue-800",
        lightMode: "bg-blue-100",
      },
      text: {
        darkMode: "text-blue-100",
        lightMode: "text-blue-800",
      },
    },
  ];

  const index = Math.abs(hashed % colors.length);

  return colors[index];
}
