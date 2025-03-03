"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

type AdminCardProps = {
  title: string;
  src: string;
  color: string;
  onClick: () => void;
};

const AdminCard: React.FC<AdminCardProps> = ({
  title,
  src,
  color,
  onClick,
}) => (
  <div
    className={`p-6 rounded-lg shadow-md ${color} transition-transform hover:scale-105 hover:cursor-pointer`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center">
      <Image src={src} alt={title} width={60} height={60} />
      <h3 className="mt-4 text-2xl text-gray-800 font-teachers">{title}</h3>
    </div>
  </div>
);

type CardData = {
  title: string;
  src: string;
  color: string;
  path: string;
};

export default function AdminDashboard() {
  const router = useRouter();

  const handleCardClick = (path: string) => {
    router.push(path);
  };

  const cards: CardData[] = [
    {
      title: "Add Therapist",
      src: "/floatingBar/chatAnon.svg",
      color: "bg-[#CEC8BD]",
      path: "/admin-dashboard/add?category=Therapist",
    },
    {
      title: "Add Medications",
      src: "/floatingBar/medication.svg",
      color: "bg-[#E5CED6]",
      path: "/admin-dashboard/add?category=Medications",
    },
    {
      title: "Add Help",
      src: "/floatingBar/help.svg",
      color: "bg-[#CEE4E5]",
      path: "/admin-dashboard/add?category=Help",
    },
    {
      title: "Add Articles & Videos",
      src: "/floatingBar/article.svg",
      color: "bg-[#C8BDCE]",
      path: "/admin-dashboard/add?category=Articles",
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-28">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-black mb-8 text-center font-gloock">
          Hello, Admin!
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <AdminCard
              key={index}
              title={card.title}
              src={card.src}
              color={card.color}
              onClick={() => handleCardClick(card.path)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
