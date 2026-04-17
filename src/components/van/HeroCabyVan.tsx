import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Minus, Plus } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

/**
 * Hero CabyVan — moteur de réservation style EasyJet (wiring complet)
 *
 * SPECS LAYOUT (verrouillées) :
 *  - Moteur 1200px
 *  - Grille 224 / 228 / 228 / 228 / 208
 *  - Cards promo 440 × 248
 *
 * WIRING :
 *  - Onglets Trajets/Ski/Cross-Border (filtre les destinations)
 *  - Aller simple / Aller-retour (switch single ↔ range date picker)
 *  - Autocomplete "À" avec destinations curées + drapeaux + prix
 *  - Date picker shadcn (Popover + Calendar) en français
 *  - Compteur passagers min 1, max 8
 *  - Submit → navigate("/trajets/search?...")
 */

/* ---------- Types ---------- */

type Tab = "trajets" | "ski" | "cross-border";
type TripType = "oneway" | "roundtrip";
type Country = "CH" | "FR" | "IT" | "DE" | "AT";

type Destination = {
  id: string;
  label: string;
  country: Country;
  categories: Tab[];
  fromPrice: number;
};

/* ---------- Data (à déplacer dans /data/destinations.ts quand ça grossira) ---------- */

const FLAG: Record<Country, string> = {
  CH: "🇨🇭",
  FR: "🇫🇷",
  IT: "🇮🇹",
  DE: "🇩🇪",
  AT: "🇦🇹",
};

const DESTINATIONS: Destination[] = [
  // Suisse
  { id: "lausanne", label: "Lausanne", country: "CH", categories: ["trajets"],                  fromPrice: 20 },
  { id: "zurich",   label: "Zurich",   country: "CH", categories: ["trajets"],                  fromPrice: 69 },
  { id: "bale",     label: "Bâle",     country: "CH", categories: ["trajets"],                  fromPrice: 52 },
  { id: "sion",     label: "Sion",     country: "CH", categories: ["trajets"],                  fromPrice: 45 },
  { id: "montreux", label: "Montreux", country: "CH", categories: ["trajets"],                  fromPrice: 29 },
  { id: "verbier",  label: "Verbier",  country: "CH", categories: ["ski"],                      fromPrice: 35 },
  { id: "zermatt",  label: "Zermatt",  country: "CH", categories: ["ski", "trajets"],           fromPrice: 55 },
  { id: "davos",    label: "Davos",    country: "CH", categories: ["ski"],                      fromPrice: 85 },
  // France
  { id: "annecy",   label: "Annecy",   country: "FR", categories: ["trajets", "cross-border"],  fromPrice: 13 },
  { id: "chamonix", label: "Chamonix", country: "FR", categories: ["ski", "cross-border"],      fromPrice: 25 },
  { id: "lyon",     label: "Lyon",     country: "FR", categories: ["trajets", "cross-border"],  fromPrice: 42 },
  // Italie
  { id: "milan",    label: "Milan",    country: "IT", categories: ["cross-border"],             fromPrice: 79 },
];

/* ---------- Composant ---------- */

export default function HeroCabyVan() {
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("trajets");
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [to, setTo] = useState<Destination | null>(null);
  const [toPopoverOpen, setToPopoverOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [departDate, setDepartDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [pax, setPax] = useState(1);

  // Filtrage des destinations selon l'onglet actif
  const filteredDestinations = useMemo(
    () => DESTINATIONS.filter((d) => d.categories.includes(tab)),
    [tab]
  );

  // Si la destination sélectionnée n'est plus dans la nouvelle catégorie, on la reset
  useEffect(() => {
    if (to && !to.categories.includes(tab)) setTo(null);
  }, [tab, to]);

  // Si on repasse en aller simple, on nettoie la date de retour
  useEffect(() => {
    if (tripType === "oneway") setReturnDate(undefined);
  }, [tripType]);

  const canSubmit =
    !!to &&
    !!departDate &&
    (tripType === "oneway" || !!returnDate) &&
    pax >= 1;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const params = new URLSearchParams({
      from: "geneve",
      to: to!.id,
      depart: format(departDate!, "yyyy-MM-dd"),
      pax: String(pax),
      type: tripType,
      tab,
    });
    if (tripType === "roundtrip" && returnDate) {
      params.set("return", format(returnDate, "yyyy-MM-dd"));
    }
    navigate(`/trajets/search?${params.toString()}`);
  };

  /* ---------- Labels affichés ---------- */

  const toDisplay = to ? (
    <span className="flex items-center gap-2">
      <span>{FLAG[to.country]}</span>
      <span>{to.label}</span>
    </span>
  ) : (
    <span className="text-slate-400">Pays, ville, gare…</span>
  );

  const dateDisplay = (() => {
    if (tripType === "oneway") {
      return departDate
        ? format(departDate, "d MMM yyyy", { locale: fr })
        : <span className="text-slate-400">Choisir une date</span>;
    }
    if (departDate && returnDate) {
      return `${format(departDate, "d MMM", { locale: fr })} — ${format(returnDate, "d MMM", { locale: fr })}`;
    }
    if (departDate) {
      return `${format(departDate, "d MMM", { locale: fr })} — …`;
    }
    return <span className="text-slate-400">Aller et retour</span>;
  })();

  /* ---------- Render ---------- */

  return (
    <section
      className="relative w-full bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.35) 100%), url('/hero-lake-geneva.jpg')",
        minHeight: 760,
      }}
    >
      <div className="mx-auto pt-8" style={{ width: 1200 }}>
        {/* ====== MOTEUR 1200px ====== */}
        <div
          className="bg-white rounded-2xl shadow-2xl px-6 py-5"
          style={{ width: 1200 }}
        >
          {/* Barre : onglets + toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-7">
              <TabButton active={tab === "trajets"}       onClick={() => setTab("trajets")}       icon="🚐" label="Trajets" />
              <TabButton active={tab === "ski"}           onClick={() => setTab("ski")}           icon="🎿" label="Ski" />
              <TabButton active={tab === "cross-border"}  onClick={() => setTab("cross-border")}  icon="🌐" label="Cross-Border" />
            </div>

            <div className="flex items-center bg-slate-100 rounded-full p-1">
              <button
                onClick={() => setTripType("oneway")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  tripType === "oneway" ? "bg-[#c9a24a] text-white shadow" : "text-slate-700"
                }`}
              >
                Aller simple
              </button>
              <button
                onClick={() => setTripType("roundtrip")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                  tripType === "roundtrip" ? "bg-[#c9a24a] text-white shadow" : "text-slate-700"
                }`}
              >
                Aller-retour
                <span className="text-[11px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                  -5%
                </span>
              </button>
            </div>
          </div>

          {/* ====== GRILLE 224/228/228/228/208 ====== */}
          <div
            className="grid items-stretch border border-slate-200 rounded-xl overflow-hidden"
            style={{ gridTemplateColumns: "224px 228px 228px 228px 208px" }}
          >
            {/* DE (non éditable — Genève fixe) */}
            <Field label="DE">
              <div className="flex items-center gap-2 text-[15px] font-medium text-slate-900">
                <span>🇨🇭</span>
                <span>Genève</span>
              </div>
            </Field>

            {/* À — Autocomplete */}
            <Field label="À" divider>
              <Popover open={toPopoverOpen} onOpenChange={setToPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full text-left text-[15px] font-medium text-slate-900 outline-none">
                    {toDisplay}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="start"
                  style={{ width: 300 }}
                >
                  <Command>
                    <CommandInput placeholder="Rechercher une ville…" />
                    <CommandList>
                      <CommandEmpty>Aucune destination.</CommandEmpty>
                      <CommandGroup heading={tabLabel(tab)}>
                        {filteredDestinations.map((d) => (
                          <CommandItem
                            key={d.id}
                            value={`${d.label} ${d.country}`}
                            onSelect={() => {
                              setTo(d);
                              setToPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <span className="mr-2">{FLAG[d.country]}</span>
                            <span className="flex-1">{d.label}</span>
                            <span className="text-xs text-slate-500">
                              dès CHF&nbsp;{d.fromPrice}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>

            {/* DATES */}
            <Field label="DATES DE VOYAGE" divider>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full text-left text-[15px] font-medium text-slate-900 outline-none">
                    {dateDisplay}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto" align="start">
                  {tripType === "oneway" ? (
                    <Calendar
                      mode="single"
                      selected={departDate}
                      onSelect={(d) => {
                        setDepartDate(d);
                        if (d) setDatePopoverOpen(false);
                      }}
                      locale={fr}
                      disabled={{ before: new Date() }}
                      initialFocus
                    />
                  ) : (
                    <Calendar
                      mode="range"
                      selected={{ from: departDate, to: returnDate } as DateRange}
                      onSelect={(range: DateRange | undefined) => {
                        setDepartDate(range?.from);
                        setReturnDate(range?.to);
                        if (range?.from && range?.to) setDatePopoverOpen(false);
                      }}
                      locale={fr}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                      initialFocus
                    />
                  )}
                </PopoverContent>
              </Popover>
            </Field>

            {/* QUI */}
            <Field label="QUI" divider>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPax((n) => Math.max(1, n - 1))}
                  disabled={pax <= 1}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                  aria-label="Retirer un passager"
                >
                  <Minus size={14} />
                </button>
                <span className="text-[15px] font-medium text-slate-900">
                  {pax} {pax > 1 ? "adultes" : "adulte"}
                </span>
                <button
                  onClick={() => setPax((n) => Math.min(8, n + 1))}
                  disabled={pax >= 8}
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-30 text-slate-600"
                  aria-label="Ajouter un passager"
                >
                  <Plus size={14} />
                </button>
              </div>
            </Field>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-[#c9a24a] hover:bg-[#b48d3a] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-[15px] leading-tight transition"
              style={{ width: 208 }}
            >
              Afficher
              <br />
              les trajets
            </button>
          </div>
        </div>

        {/* ====== BLOC TEXTE ====== */}
        <div className="text-center text-white pt-24 pb-14">
          <h1
            className="font-serif text-white tracking-tight"
            style={{
              fontSize: 64,
              lineHeight: 1.1,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Voyagez malin.
            <br />
            Genève ↔ Suisse &amp; Europe.
          </h1>
          <p className="mt-6 text-[15px] text-white/90 tracking-wide">
            Siège partagé · Chauffeur certifié · Dès CHF 9
          </p>
        </div>

        {/* ====== CARDS PROMO 440 × 248 ====== */}
        <div className="flex justify-center gap-6 pb-20">
          <PromoCard
            title="DES SIÈGES À MOINS DE CHF 19*"
            description="Genève–Annecy, Genève–Lausanne, Genève–Zurich… Et la ligne Genève–Lyon à partir de CHF 42 ! Réservez tôt et économisez jusqu'à 30%."
            cta="Je réserve mon trajet"
            onClick={() => navigate("/trajets")}
          />
          <PromoCard
            title="ET POURQUOI PAS UNE STATION DE SKI ?"
            description="Verbier, Zermatt, Chamonix, Davos — votre station favorite en van partagé. Chauffeur certifié, skis pris en charge dès CHF 35."
            cta="Je réserve mon van ski"
            onClick={() => {
              setTab("ski");
              navigate("/ski");
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Sous-composants ---------- */

function tabLabel(tab: Tab): string {
  return tab === "trajets" ? "Trajets" : tab === "ski" ? "Stations de ski" : "Cross-Border";
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-2 text-[15px] font-medium transition relative ${
        active ? "text-[#c9a24a]" : "text-slate-600 hover:text-slate-900"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
      {active && (
        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-[#c9a24a] rounded-full" />
      )}
    </button>
  );
}

function Field({
  label,
  children,
  divider = false,
}: {
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}) {
  return (
    <div className={`px-4 py-3 ${divider ? "border-l border-slate-200" : ""}`}>
      <div className="text-[11px] text-slate-500 font-semibold tracking-wider mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function PromoCard({
  title,
  description,
  cta,
  onClick,
}: {
  title: string;
  description: string;
  cta: string;
  onClick?: () => void;
}) {
  return (
    <div
      className="bg-white/95 backdrop-blur rounded-2xl shadow-xl flex flex-col justify-between p-6"
      style={{ width: 440, height: 248 }}
    >
      <div>
        <h3 className="font-bold text-slate-900 text-[15px] tracking-tight">
          {title}
        </h3>
        <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
      <button
        onClick={onClick}
        className="self-center bg-[#c9a24a] hover:bg-[#b48d3a] text-white font-semibold text-[14px] px-6 py-2.5 rounded-lg transition"
      >
        {cta}
      </button>
    </div>
  );
}
