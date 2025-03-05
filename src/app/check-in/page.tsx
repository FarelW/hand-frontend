"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getTodayCheckIn, createCheckIn, updateCheckIn, CheckInData } from '../api/service'; 
import { toast } from 'sonner';
import LoadingBouncer from '@/components/Loading';


const emotions = [
  { emoji: '/checkIn/emoji1 (9).png', id: 1 },
  { emoji: '/checkIn/emoji1 (8).png', id: 2 },
  { emoji: '/checkIn/emoji1 (7).png', id: 3 },
  { emoji: '/checkIn/emoji1 (6).png', id: 4 },
  { emoji: '/checkIn/emoji1 (10).png', id: 5 },
  { emoji: '/checkIn/emoji1 (1).png', id: 6 },
  { emoji: '/checkIn/emoji1 (3).png', id: 7 },
  { emoji: '/checkIn/emoji1 (4).png', id: 8 },
  { emoji: '/checkIn/emoji1 (5).png', id: 9 },
  { emoji: '/checkIn/emoji1 (2).png', id: 10 },
];

interface Feeling {
  id: number;
  label: string;
}

const feelings: Feeling[] = [
  { id: 1, label: "can't sleep" },
  { id: 2, label: "hard to stay focus" },
  { id: 3, label: "very tired" },
  { id: 4, label: "feeling empty" }
];

export default function MoodTracker() {
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [differentFeeling, setDifferentFeeling] = useState<string>('');
  const [selectedFeelings, setSelectedFeelings] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false); 

  useEffect(() => {
    getTodayCheckIn().then(data => {
      if (data) {
        setSelectedEmotion(data.mood_score - 1); 
        setDifferentFeeling(data.notes);
        setSelectedFeelings(data.feelings.split(',').map(Number));
        setIsUpdating(true); 
      }
      setIsLoading(false);
    }).catch(error => {
      console.error('Failed to fetch today\'s check-in:', error);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    const checkInData: CheckInData = {
      mood_score: selectedEmotion ? selectedEmotion + 1 : 1, 
      feelings: selectedFeelings.join(','), 
      notes: differentFeeling
    };

    try {
      let response;
      if (isUpdating) {

        console.log(checkInData)
        response = await updateCheckIn(checkInData);
        toast.success("Update successful")
      } else {

        response = await createCheckIn(checkInData);
        toast.success("Create succesful")
      }
      console.log('CheckIn Success:', response);

    } catch (error) {
      console.log("Check-in failed")
      console.error('Error during check-in operation:', error);
    }finally{
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingBouncer />;
  }

  return (
    <div className="min-h-screen max-h-screen bg-[#FFF2F2] flex items-center justify-center p-4">
      <div className="rounded-lg px-10 md:px-20 lg:px-40 w-full h-full">
        <h1 className="font-gloock text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-6 mt-6">How are you doing today?</h1>
        <p className="font-teachers text-center text-m md:text-lg lg:text-xl xl:text-2xl tracking-wider text-gray-600 mb-4">Pick your most dominant emotion right now</p>
        <div className="flex justify-center flex-wrap space-x-2 mb-6">
          {emotions.map((emotion, index) => (
            <button
              key={emotion.id}
              className={`rounded-full flex items-center justify-center text-2xl transition hover:bg-gray-400 duration-300 ${
                selectedEmotion === index ? 'bg-gray-400' : ''
              }`}
              onClick={() => setSelectedEmotion(index)}
            >
              <div className='relative w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] 2xl:w-[80px] 2xl:h-[80px]'>
                <Image src={emotion.emoji} alt="emoji" layout='fill' />
              </div>
            </button>
          ))}
        </div>
        <div className="my-5 lg:my-10">
          <label htmlFor="different" className="font-gloock block text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-700">
            Anything you felt different?
          </label>
          <input
            type="text"
            id="different"
            className="w-full px-2 py-2 lg:px-3 lg:py-2 mt-2 md:mt-3 xl:mt-5 text-sm md:text-lg lg:text-xl xl:text-2xl border border-gray-300 rounded-md"
            value={differentFeeling}
            onChange={(e) => setDifferentFeeling(e.target.value)}
          />
        </div>
        <div className='mb-5 lg:mb-10'>
          <p className="font-gloock text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-700">Do you feel any of these?</p>
          <div className="flex flex-wrap gap-3 mt-2 md:mt-3 xl:mt-5">
            {feelings.map((feeling) => (
              <button
                key={feeling.id}
                className={`font-teachers px-3 py-1 rounded-full text-sm md:text-lg lg:text-xl shadow-lg ${
                  selectedFeelings.includes(feeling.id)
                    ? 'bg-[#aba4a4] text-gray-800'
                    : 'bg-[#DAD4D4] text-[#7B7B7B]'
                }`}
                onClick={() => {
                  setSelectedFeelings((prev) =>
                    prev.includes(feeling.id)
                      ? prev.filter((f) => f !== feeling.id)
                      : [...prev, feeling.id]
                  );
                }}
              >
                {feeling.label}
              </button>
            ))}
          </div>
        </div>
        <div className='w-full flex items-end justify-end mt-10'>
          <Button className='text-lg md:text-xl lg:text-2xl font-teachers' size={'lg'} onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
