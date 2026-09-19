import React from "react";
import { MapPin, Calendar, ArrowRight, Star, Sparkles } from "lucide-react";

interface Props {
  onSelectPlace: (placeName: string) => void;
}

export const FamousPlacesGrid: React.FC<Props> = ({ onSelectPlace }) => {
  const famousPlaces = [
    {
      id: "taj_mahal",
      name: "Taj Mahal (Agra)",
      destinationQuery: "Agra",
      state: "Uttar Pradesh",
      tag: "Wonder of the World",
      rating: 4.9,
      stayDays: 2,
      img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
      desc: "Iconic white marble mausoleum and UNESCO World Heritage monument on Yamuna riverfront.",
    },
    {
      id: "jaipur",
      name: "Jaipur (Rajasthan)",
      destinationQuery: "Jaipur",
      state: "Rajasthan",
      tag: "Pink City Heritage",
      rating: 4.8,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
      desc: "Royal palaces, grand hilltop forts, vibrant markets, and rich Rajasthani court culture.",
    },
    {
      id: "new_delhi",
      name: "New Delhi",
      destinationQuery: "New Delhi",
      state: "Delhi UT",
      tag: "Capital & History",
      rating: 4.7,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80",
      desc: "India Gate, Qutub Minar, Red Fort, bustling Chandni Chowk markets, and food streets.",
    },
    {
      id: "goa",
      name: "Goa",
      destinationQuery: "Goa",
      state: "Goa",
      tag: "Beaches & Nightlife",
      rating: 4.8,
      stayDays: 4,
      img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
      desc: "Sun-kissed beaches, Portuguese Latin quarters, water sports, and vibrant coastal dining.",
    },
    {
      id: "kerala_backwaters",
      name: "Kerala Backwaters",
      destinationQuery: "Kerala Backwaters",
      state: "Kerala",
      tag: "Serene Houseboats",
      rating: 4.9,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
      desc: "Placid lagoons, luxury houseboat cruises, lush palm shores, and authentic Kerala Sadya.",
    },
    {
      id: "varanasi",
      name: "Varanasi (Uttar Pradesh)",
      destinationQuery: "Varanasi",
      state: "Uttar Pradesh",
      tag: "Spiritual Capital",
      rating: 4.8,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80",
      desc: "Ancient Ganges River ghats, mesmerizing evening Ganga Aarti, and sacred Sarnath.",
    },
    {
      id: "mumbai",
      name: "Mumbai (Maharashtra)",
      destinationQuery: "Mumbai",
      state: "Maharashtra",
      tag: "Financial Capital",
      rating: 4.7,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80",
      desc: "Gateway of India, Marine Drive promenade, Bollywood, Elephanta Caves, and street food.",
    },
    {
      id: "hampi",
      name: "Hampi (Karnataka)",
      destinationQuery: "Hampi",
      state: "Karnataka",
      tag: "UNESCO Ruins",
      rating: 4.9,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=600&q=80",
      desc: "Boulder-strewn landscape of the Vijayanagara Empire, Stone Chariot, and coracle river rides.",
    },
    {
      id: "leh_ladakh",
      name: "Leh-Ladakh",
      destinationQuery: "Leh-Ladakh",
      state: "Ladakh UT",
      tag: "High Mountain Passes",
      rating: 4.9,
      stayDays: 5,
      img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=600&q=80",
      desc: "Turquoise Pangong Lake, Nubra Valley sand dunes, Khardung La pass, and Buddhist monasteries.",
    },
    {
      id: "mysuru",
      name: "Mysuru (Karnataka)",
      destinationQuery: "Mysuru",
      state: "Karnataka",
      tag: "Palace City",
      rating: 4.7,
      stayDays: 2,
      img: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=600&q=80",
      desc: "Illuminated Mysuru Palace, Chamundi Hill temple, silk weavers, and Mysore Pak sweets.",
    },
    {
      id: "udaipur",
      name: "Udaipur (Rajasthan)",
      destinationQuery: "Udaipur",
      state: "Rajasthan",
      tag: "City of Lakes",
      rating: 4.9,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?auto=format&fit=crop&w=600&q=80",
      desc: "Romantic Lake Pichola, grand City Palace complex, Jag Mandir, and sunset boat rides.",
    },
    {
      id: "ajanta_ellora",
      name: "Ajanta and Ellora Caves (Maharashtra)",
      destinationQuery: "Ajanta and Ellora Caves",
      state: "Maharashtra",
      tag: "Rock-cut Masterpieces",
      rating: 4.8,
      stayDays: 2,
      img: "https://images.unsplash.com/photo-1600100397608-f010e423b971?auto=format&fit=crop&w=600&q=80",
      desc: "Monolithic Kailasa Temple at Ellora and 2nd-century BCE ancient Buddhist cave murals at Ajanta.",
    },
    {
      id: "golden_temple",
      name: "Golden Temple (Amritsar)",
      destinationQuery: "Amritsar",
      state: "Punjab",
      tag: "Spiritual Sanctum",
      rating: 4.9,
      stayDays: 2,
      img: "https://images.unsplash.com/photo-1588097281266-310cead47879?auto=format&fit=crop&w=600&q=80",
      desc: "Luminous Golden Temple (Sri Harmandir Sahib), Wagah Border ceremony, and kulcha dhabas.",
    },
    {
      id: "andaman",
      name: "Andaman and Nicobar Islands",
      destinationQuery: "Andaman",
      state: "Andaman UT",
      tag: "Tropical Paradise",
      rating: 4.9,
      stayDays: 5,
      img: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=600&q=80",
      desc: "Pristine Radhanagar Beach, scuba diving coral reefs, Havelock Island, and Cellular Jail.",
    },
    {
      id: "darjeeling",
      name: "Darjeeling (West Bengal)",
      destinationQuery: "Darjeeling",
      state: "West Bengal",
      tag: "Queen of the Hills",
      rating: 4.7,
      stayDays: 3,
      img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
      desc: "Tiger Hill Kanchenjunga sunrise views, UNESCO Toy Train ride, and organic tea gardens.",
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" /> Famous Tourist Destinations in India
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any destination to select dates, set budget, and let Antigravity AI generate your custom schedule.
          </p>
        </div>
        <span className="text-xs font-bold text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
          15 Featured Places
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {famousPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => onSelectPlace(place.destinationQuery)}
            className="group bg-slate-900 border border-slate-800 hover:border-blue-500/80 rounded-3xl overflow-hidden shadow-xl hover:shadow-blue-500/10 cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Card Image Banner */}
              <div className="relative h-44 overflow-hidden bg-slate-950">
                <img
                  src={place.img}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-blue-400 border border-blue-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  {place.tag}
                </div>

                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> {place.rating}
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">{place.name}</h3>
                  <div className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                    {place.state}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2">
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{place.desc}</p>
              </div>
            </div>

            {/* Card Footer Button */}
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Rec. {place.stayDays} Days
                </span>

                <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 group-hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md">
                  <span>Plan Trip</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
