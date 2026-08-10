"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

const REVIEWS = [
  {
    id: 1,
    name: "Zoe Kacungira",
    time: "3 weeks ago",
    text: "You take such good care of my doggos! 10/10 service from the loveliest team.",
    image: null,
    initial: "Z",
    initialBg: "bg-purple-600",
  },
  {
    id: 2,
    name: "Tina Roy",
    time: "9 months ago",
    text: "I’m honestly impressed! Stephan’s Pet Store is one of the most organized, clean, and pet-friendly spots I’ve seen in Dar. You can tell there’s real love and effort behind everything from how the space is set up to how they treat the pets and customers. If you’ve got a furry friend, this is the place to visit! 🐶🐾❤️ Rai my fur baby gets treated like a princess here.",
    image: "/tina-dog.webp",
    initial: "T",
    initialBg: "bg-[#7A574A]",
  },
  {
    id: 3,
    name: "淡淡大海",
    time: "a year ago",
    text: "My cat runs out today and becomes very dirty. Stephan’s is the place that accepts my cat after hours. The employee here are very nice and gentle. I'm very grateful to people here!",
    image: null,
    initial: "淡",
    initialBg: "bg-orange-500",
  }
];

export function ReviewsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <section className="py-16 md:py-24 bg-[#F4F0EB]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#A66C44] uppercase mb-6">
          LOVED BY PET PARENTS
        </h3>
        
        <div className="flex justify-center gap-1 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex">
            {REVIEWS.map((review) => (
              <div key={review.id} className="flex-[0_0_100%] min-w-0">
                <p className="text-xl md:text-2xl lg:text-[28px] leading-relaxed font-serif text-[#222] mb-10 max-w-3xl mx-auto px-4">
                  “{review.text}”
                </p>
                <div className="flex items-center justify-center gap-4">
                  {review.image ? (
                    <div className="w-[52px] h-[52px] relative rounded-xl overflow-hidden shrink-0 shadow-sm">
                      <Image
                        src={review.image}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-medium text-xl shrink-0 shadow-sm ${review.initialBg}`}>
                      {review.initial}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-bold text-[#222] text-[15px]">{review.name}</p>
                    <p className="text-[#888] text-[13px]">{review.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === selectedIndex ? "bg-[#222]" : "border border-[#222] bg-transparent"
              }`}
              onClick={() => emblaApi?.scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
