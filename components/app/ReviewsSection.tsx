import Image from "next/image";

const REVIEWS = [
  {
    id: 1,
    name: "Zoe Kacungira",
    time: "3 weeks ago",
    text: "You take such good care of my doggos! 10/10 service from the loveliest team.",
    avatar: null,
    initial: "Z",
    initialBg: "bg-[#7A574A]",
    gallery: []
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

export function ReviewsSection() {
  return (
    <section className="py-12 md:py-16 bg-[#F9F7F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-[11px] font-bold tracking-[0.2em] text-[#A66C44] uppercase mb-10 text-center">
          LOVED BY PET PARENTS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-6 flex flex-col shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[#EAE3D9]/50 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                {review.avatar ? (
                  <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0 border border-[#EAE3D9]">
                    <Image src={review.avatar} alt={review.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm shrink-0 shadow-sm ${review.initialBg}`}>
                    {review.initial}
                  </div>
                )}
                <div>
                  <p className="font-bold text-[#222] text-sm">{review.name}</p>
                  <p className="text-[#888] text-[11px] tracking-wide uppercase mt-0.5">{review.time}</p>
                </div>
              </div>
              
              {/* Stars */}
              <div className="flex gap-[2px] mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Text */}
              <p className="text-[#4E2A15] text-[14px] leading-relaxed mb-6 flex-grow">
                "{review.text}"
              </p>

              {/* Gallery */}
              {review.gallery.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-auto">
                  {review.gallery.map((img, i) => (
                    <div key={i} className="relative w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 border border-[#EAE3D9]">
                      <Image src={img} alt="Review photo" fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
