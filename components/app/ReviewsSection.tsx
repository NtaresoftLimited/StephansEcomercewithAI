"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const REVIEWS = [
  {
    id: 1,
    name: "Zoe Kacungira",
    time: "3 weeks ago",
    text: "You take such good care of my doggos! 10/10 service from the loveliest team.",
    avatar: null,
    initial: "Z",
    initialBg: "bg-[#5939A7]", // Purple from the screenshot
    gallery: ["/zoe-1.webp", "/zoe-2.webp", "/zoe-3.webp"]
  },
  {
    id: 2,
    name: "Tina Roy",
    time: "9 months ago",
    text: "I’m honestly impressed! Stephan’s Pet Store is one of the most organized, clean, and pet-friendly spots I’ve seen in Dar. You can tell there’s real love and effort behind everything from how the space is set up to how they treat the pets and customers. If you’ve got a furry friend, this is the place to visit! 🐶🐾❤️ Rai my fur baby gets treated like a princess here.",
    avatar: null,
    initial: "T",
    initialBg: "bg-[#A66C44]",
    gallery: ["/tina-dog.webp"]
  },
  {
    id: 3,
    name: "淡淡大海",
    time: "a year ago",
    text: "My cat runs out today and becomes very dirty. Stephan’s is the place that accepts my cat after hours. The employee here are very nice and gentle. I'm very grateful to people here!",
    avatar: "/avatar-dandan.png",
    initial: "淡",
    initialBg: "bg-orange-500",
    gallery: ["/review-dandan.webp"]
  }
];

const GALLERY_STYLES = [
  "-rotate-6 z-10 translate-y-1",
  "rotate-3 z-20 -ml-6 -translate-y-2",
  "rotate-12 z-30 -ml-6 translate-y-2",
  "-rotate-3 z-40 -ml-6"
];

export function ReviewsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="py-12 md:py-16 bg-[#F9F7F5] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#A66C44] uppercase mb-10 text-center">
          LOVED BY PET PARENTS
        </h3>
        
        <div className="relative mx-auto" ref={emblaRef}>
          <div className="flex -ml-4 touch-pan-y">
            {REVIEWS.map((review, index) => {
              const isActive = index === selectedIndex;
              return (
                <div 
                  key={review.id} 
                  className="flex-[0_0_85%] md:flex-[0_0_70%] lg:flex-[0_0_60%] min-w-0 pl-4 relative"
                  onClick={() => emblaApi?.scrollTo(index)}
                >
                  <div 
                    className={`h-full bg-white rounded-3xl p-6 md:p-10 flex flex-col shadow-sm border border-[#EAE3D9]/50 transition-all duration-700 ease-out cursor-grab active:cursor-grabbing ${
                      isActive 
                        ? 'scale-100 opacity-100 blur-0 shadow-[0_8px_30px_rgba(0,0,0,0.08)]' 
                        : 'scale-90 opacity-40 blur-[3px] hover:blur-[1px] hover:opacity-60'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-4 mb-6">
                      {review.avatar ? (
                        <div className="w-12 h-12 md:w-14 md:h-14 relative rounded-full overflow-hidden shrink-0 border border-[#EAE3D9]">
                          <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-medium text-xl shrink-0 shadow-sm ${review.initialBg}`}>
                          {review.initial}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-[#222] text-base md:text-lg">{review.name}</p>
                        </div>
                        <p className="text-[#888] text-[13px] mt-0.5">{review.time}</p>
                      </div>
                    </div>
                    
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Text */}
                    <p className="text-[#4E2A15] text-lg md:text-xl leading-relaxed mb-8 font-serif italic">
                      "{review.text}"
                    </p>

                    {/* Minimalist Disorganized Gallery */}
                    {review.gallery.length > 0 && (
                      <div className="flex justify-center items-center mt-auto pb-2 pt-6">
                        {review.gallery.map((img, i) => (
                          <div 
                            key={i} 
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(img);
                            }}
                            className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border-[4px] border-white shadow-md transition-transform duration-300 hover:scale-110 hover:!z-50 cursor-pointer ${GALLERY_STYLES[i % GALLERY_STYLES.length]}`}
                          >
                            <Image src={img} alt="Review photo" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-5xl max-h-[90vh] aspect-square md:aspect-[4/3] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedImage} alt="Viewed photo" fill className="object-contain" />
          </div>
          <button 
            className="absolute top-6 right-6 text-white bg-black/50 hover:bg-black p-3 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
