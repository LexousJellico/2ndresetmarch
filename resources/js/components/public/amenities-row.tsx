import { amenities } from '@/data/amenities';

export default function AmenitiesRow() {
  return (
    <section className="border-y border-black/5 bg-white px-4 py-8 dark:border-white/10 dark:bg-[#3a3a3d] md:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10">
        {amenities.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f1ea] text-[#12906a] dark:bg-[#2f2f33] dark:text-[#7da7ff]">
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-medium text-[#55524d] dark:text-white/75">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}