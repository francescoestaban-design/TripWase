
import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, firebaseConfigReady } from "./firebase";
import { geocodeDestination, getGoogleMapsEmbedUrl, googleMapsReady, type VerifiedDestination } from "./googleMaps";
import {
  Compass,
  MapPin,
  ArrowUpRight,
  Wallet,
  Clock3,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Ticket,
  Star,
  Users,
  CalendarDays,
  Send,
  Phone,
  CreditCard,
  LogOut,
  LockKeyhole,
} from "lucide-react";

const destinations = [
  {
    name: "Lisboa",
    country: "Portugal",
    description: "Tranvías históricos, miradores y tardes junto al Atlántico.",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1800&q=85",
    tag: "Escapada urbana",
  },
  {
    name: "Kyoto",
    country: "Japón",
    description: "Templos serenos, jardines secretos y calles llenas de historia.",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1800&q=85",
    tag: "Cultura y calma",
  },
  {
    name: "Dolomitas",
    country: "Italia",
    description: "Senderos de montaña, lagos turquesa y paisajes inolvidables.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=85",
    tag: "Naturaleza",
  },
  {
    name: "Madrid",
    country: "España",
    description: "Vive el ambiente del fútbol y descubre la ciudad a tu ritmo.",
    image:
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1800&q=85",
    tag: "Deporte y ciudad",
  },
];

const experiences = [
  {
    id: "lisbon-walk",
    destination: "Lisboa",
    country: "Portugal",
    name: "Lisboa entre barrios y miradores",
    category: "Visitas guiadas",
    duration: "3 horas",
    meetingPoint: "Praça do Comércio",
    price: "35 €",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "kyoto-temples",
    destination: "Kyoto",
    country: "Japón",
    name: "Templos y jardines de Kyoto",
    category: "Cultura",
    duration: "4 horas",
    meetingPoint: "Higashiyama",
    price: "48 €",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "dolomites-hike",
    destination: "Dolomitas",
    country: "Italia",
    name: "Senderismo panorámico en los Dolomitas",
    category: "Naturaleza",
    duration: "6 horas",
    meetingPoint: "Cortina d'Ampezzo",
    price: "62 €",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "madrid-stadium",
    destination: "Madrid",
    country: "España",
    name: "Tour del estadio Santiago Bernabéu",
    category: "Deporte",
    duration: "2 horas",
    meetingPoint: "Estadio Santiago Bernabéu",
    price: "38 €",
    image:
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
  },
];

const hotels = [
  {
    destination: "Lisboa",
    name: "Casa do Mercado",
    neighborhood: "Baixa",
    distance: "A 8 min del punto de encuentro",
    price: "desde 112 €",
    rating: "4,8",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
  },
  {
    destination: "Kyoto",
    name: "Higashiyama Garden Stay",
    neighborhood: "Higashiyama",
    distance: "A 6 min del punto de encuentro",
    price: "desde 138 €",
    rating: "4,9",
    image:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80",
  },
  {
    destination: "Dolomitas",
    name: "Alpine View Lodge",
    neighborhood: "Cortina d'Ampezzo",
    distance: "A 10 min del punto de encuentro",
    price: "desde 156 €",
    rating: "4,8",
    image:
      "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=900&q=80",
  },
  {
    destination: "Madrid",
    name: "Estadio Boutique Hotel",
    neighborhood: "Chamartín",
    distance: "A 5 min del estadio",
    price: "desde 129 €",
    rating: "4,7",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80",
  },
];

const experienceCategories = ["Todas", "Cultura", "Deporte", "Naturaleza", "Visitas guiadas"];

type RequestSummary = {
  destination: string;
  experience: string;
  date: string;
  dateIsFlexible: boolean;
  adults: number;
  children: number;
  days: number;
  activityTotal: number;
  hotel: string;
  nights: number;
  rooms: number;
  hotelTotal: number;
  hotelNeedsQuote: boolean;
  mealsTotal: number;
  localTransport: number;
  extras: number;
  total: number;
  estimateComplete: boolean;
  activityNeedsQuote: boolean;
  targetBudget: number;
  paymentMethod: string;
};

type Screen = "explore" | "request" | "itinerary" | "expenses";

const formatEuros = (amount: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);

const demoPriceNumber = (price: string) =>
  Number(price.replace(/[^\d,]/g, "").replace(",", "."));

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese correo. Inicia sesión.";
    case "auth/invalid-email":
      return "El correo electrónico no tiene un formato válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-credential":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    case "auth/operation-not-allowed":
      return "Activa el método correo/contraseña en Firebase Authentication.";
    case "auth/network-request-failed":
      return "No se pudo conectar con Firebase. Comprueba tu conexión.";
    default:
      return error instanceof Error
        ? `No se pudo completar la autenticación: ${error.message}`
        : "No se pudo completar la autenticación. Inténtalo de nuevo.";
  }
}

function App() {
  const [screen, setScreen] = useState<Screen>("explore");
  const [wizardStep, setWizardStep] = useState(1);
  const [authMode, setAuthMode] = useState<"register" | "login">("register");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [wizardNotice, setWizardNotice] = useState("");
  const requestFormRef = useRef<HTMLFormElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [activeDestination, setActiveDestination] = useState(0);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [customDestination, setCustomDestination] = useState<string | null>(null);
  const [verifiedDestination, setVerifiedDestination] = useState<VerifiedDestination | null>(null);
  const [destinationSearchBusy, setDestinationSearchBusy] = useState(false);
  const [destinationSearchError, setDestinationSearchError] = useState("");
  const [destinationPhotoUrl, setDestinationPhotoUrl] = useState(destinations[0].image);
  const [destinationPhotoSource, setDestinationPhotoSource] = useState("");
  const [destinationPhotoLoading, setDestinationPhotoLoading] = useState(false);
  const [destinationPhotoSearchFailed, setDestinationPhotoSearchFailed] = useState(false);
  const [destinationPhotoFailed, setDestinationPhotoFailed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedExperienceId, setSelectedExperienceId] = useState<string | null>(null);
  const [activityRequest, setActivityRequest] = useState("");
  const [activityPrice, setActivityPrice] = useState("");
  const [activityCount, setActivityCount] = useState(1);
  const [targetBudget, setTargetBudget] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState(1);
  const [dateIsFlexible, setDateIsFlexible] = useState(true);
  const [hotelNights, setHotelNights] = useState(1);
  const [hotelRooms, setHotelRooms] = useState(1);
  const [hotelNightlyPrice, setHotelNightlyPrice] = useState("");
  const [mealsPerPersonPerDay, setMealsPerPersonPerDay] = useState("");
  const [localTransport, setLocalTransport] = useState("");
  const [extras, setExtras] = useState("");
  const [hotelInterest, setHotelInterest] = useState(false);
  const [selectedHotelName, setSelectedHotelName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [requestSummary, setRequestSummary] = useState<RequestSummary | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    return onAuthStateChanged(
      auth,
      (user) => {
        setAuthUser(user);
        setAuthReady(true);
      },
      (error) => {
        setAuthError(getAuthErrorMessage(error));
        setAuthReady(true);
      },
    );
  }, []);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) {
      setAuthError("Configura Firebase con las variables de frontend indicadas para activar el registro.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("authEmail") || "").trim();
    const password = String(formData.get("authPassword") || "");
    setAuthBusy(true);
    setAuthError("");

    try {
      if (authMode === "register") {
        const displayName = String(formData.get("displayName") || "").trim();
        if (password !== String(formData.get("confirmPassword") || "")) {
          setAuthError("Las contraseñas no coinciden.");
          return;
        }
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName });
        setAuthUser(credential.user);
      } else {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        setAuthUser(credential.user);
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    setAuthError("");
    try {
      await signOut(auth);
      setRequestSummary(null);
      setWizardStep(1);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    }
  }
  const featuredDestination = destinations[activeDestination];
  const destination = customDestination
    ? {
        name: customDestination,
        country: "",
        description: "Un destino elegido por ti. Cuéntanos qué quieres vivir allí.",
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1800&q=85",
        tag: "Tu próximo destino",
      }
    : featuredDestination;

  useEffect(() => {
    setDestinationPhotoFailed(false);
    setDestinationPhotoSearchFailed(false);
    setDestinationPhotoSource("");
    if (!customDestination) {
      setDestinationPhotoUrl(destination.image);
      setDestinationPhotoLoading(false);
      return;
    }

    const controller = new AbortController();
    const search = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${destination.name} landmark`,
      gsrnamespace: "6",
      gsrlimit: "10",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "1200",
      format: "json",
      origin: "*",
    });
    let cancelled = false;
    setDestinationPhotoUrl(destination.image);
    setDestinationPhotoLoading(true);

    fetch(`https://commons.wikimedia.org/w/api.php?${search}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Photo search failed: ${response.status}`);
        return response.json();
      })
      .then((data: {
        query?: {
          pages?: Record<string, {
            title?: string;
            imageinfo?: Array<{ thumburl?: string; descriptionurl?: string }>;
          }>;
        };
      }) => {
        if (cancelled) return;
        const result = Object.values(data.query?.pages ?? {}).find(
          (page) => page.imageinfo?.[0]?.thumburl,
        );
        if (result?.imageinfo?.[0]?.thumburl) {
          setDestinationPhotoUrl(result.imageinfo[0].thumburl);
          setDestinationPhotoSource(result.imageinfo[0].descriptionurl ?? "");
        } else {
          setDestinationPhotoSearchFailed(true);
        }
      })
      .catch((error: unknown) => {
        if (cancelled || (error instanceof Error && error.name === "AbortError")) return;
        setDestinationPhotoSearchFailed(true);
      })
      .finally(() => {
        if (!cancelled) setDestinationPhotoLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [customDestination, destination.image, destination.name]);
  const destinationExperiences = experiences.filter(
    (experience) =>
      experience.destination === destination.name &&
      (selectedCategory === "Todas" || experience.category === selectedCategory),
  );
  const allDestinationExperiences = experiences.filter(
    (experience) => experience.destination === destination.name,
  );
  const selectedExperience = experiences.find(
    (experience) =>
      experience.id === selectedExperienceId &&
      experience.destination === destination.name,
  );
  const recommendedHotels = hotels.filter(
    (hotel) => hotel.destination === destination.name,
  );
  const travelerCount = adults + children;
  const activityTotal = Number(activityPrice || 0) * travelerCount * activityCount;
  const hotelTotal = hotelInterest ? Number(hotelNightlyPrice || 0) * hotelNights * hotelRooms : 0;
  const mealsTotal = Number(mealsPerPersonPerDay || 0) * travelerCount * days;
  const totalEstimate =
    activityTotal + hotelTotal + mealsTotal + Number(localTransport || 0) + Number(extras || 0);
  const activityNeedsQuote = !selectedExperience;
  const estimateComplete =
    !activityNeedsQuote && activityPrice !== "" && (!hotelInterest || hotelNightlyPrice !== "");
  const knownCostSubtotal =
    (activityNeedsQuote ? 0 : activityTotal) +
    hotelTotal +
    mealsTotal +
    Number(localTransport || 0) +
    Number(extras || 0);
  const destinationMapUrl = getGoogleMapsEmbedUrl(
    `${destination.name}${destination.country ? `, ${destination.country}` : ""}`,
    verifiedDestination?.placeId,
  );

  function chooseFeaturedDestination(index: number) {
    setActiveDestination(index);
    setCustomDestination(null);
    setVerifiedDestination(null);
    setDestinationSearchError("");
    setDestinationQuery("");
    setSelectedExperienceId(null);
    setActivityRequest("");
    setActivityPrice("");
    setActivityCount(1);
    setTargetBudget("");
    setSelectedHotelName("");
    setHotelNightlyPrice("");
    setHotelInterest(false);
    setRequestSummary(null);
  }

  function showDestination(offset: number) {
    chooseFeaturedDestination(
      (activeDestination + offset + destinations.length) % destinations.length,
    );
  }

  async function handleDestinationSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const search = destinationQuery.trim();
    if (!search || destinationSearchBusy) return;

    setDestinationSearchBusy(true);
    setDestinationSearchError("");

    try {
      const verified = await geocodeDestination(search);
      if (!verified) {
        setDestinationSearchError("No encontramos ese lugar. Escribe una ciudad, región o país real e inténtalo de nuevo.");
        return;
      }

      const featuredMatch = destinations.find((item) =>
        `${item.name}, ${item.country}`.toLocaleLowerCase() === verified.formattedAddress.toLocaleLowerCase() ||
        item.name.toLocaleLowerCase() === search.toLocaleLowerCase(),
      );
      if (featuredMatch) {
        chooseFeaturedDestination(destinations.indexOf(featuredMatch));
      } else {
        setCustomDestination(verified.formattedAddress);
        setVerifiedDestination(verified);
        setSelectedExperienceId(null);
        setActivityRequest("");
        setActivityPrice("");
        setActivityCount(1);
        setTargetBudget("");
        setSelectedHotelName("");
        setHotelNightlyPrice("");
        setHotelInterest(false);
        setRequestSummary(null);
      }
    } catch (error) {
      setDestinationSearchError(
        error instanceof Error
          ? `No se pudo validar el destino: ${error.message}`
          : "No se pudo validar el destino. Comprueba la configuración de Google Maps e inténtalo de nuevo.",
      );
    } finally {
      setDestinationSearchBusy(false);
    }
  }

  function handleRequestSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser) {
      setScreen("request");
      setAuthError("Inicia sesión o crea una cuenta antes de preparar la solicitud.");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const experienceId = String(formData.get("experience"));
    const experience = experiences.find((item) => item.id === experienceId);
    const requestedActivity = String(formData.get("activityRequest") || "").trim();
    if (!requestedActivity) {
      return;
    }

    setRequestSummary({
      destination: destination.name,
      experience: experience?.name ?? requestedActivity,
      date: String(formData.get("date") || ""),
      dateIsFlexible,
      adults,
      children,
      days,
      activityTotal,
      hotel: hotelInterest ? String(formData.get("hotel") || "Por definir") : "",
      nights: hotelInterest ? hotelNights : 0,
      rooms: hotelInterest ? hotelRooms : 0,
      hotelTotal,
      hotelNeedsQuote: hotelInterest && hotelNightlyPrice === "",
      mealsTotal,
      localTransport: Number(localTransport || 0),
      extras: Number(extras || 0),
      total: knownCostSubtotal,
      estimateComplete,
      activityNeedsQuote,
      targetBudget: Number(formData.get("budget") || 0),
      paymentMethod,
    });
    setScreen("expenses");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function continueWizard() {
    if (!activityRequest.trim()) {
      setWizardNotice("Describe la actividad que quieres reservar o elige una experiencia del catálogo.");
      return;
    }
    if (!dateIsFlexible && dateInputRef.current && !dateInputRef.current.reportValidity()) {
      return;
    }
    setWizardNotice("");
    setWizardStep(2);
    requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function navigateTo(nextScreen: Screen) {
    setScreen(nextScreen);
    if (nextScreen === "request") {
      setWizardStep(1);
      setWizardNotice("");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#202820]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white px-6 py-8 md:flex md:flex-col">
        <a href="#" className="flex items-center gap-3 text-2xl font-bold tracking-tight">
          <span className="rounded-xl bg-emerald-800 p-2 text-white">
            <Compass size={23} />
          </span>
          tripwise
        </a>

        <p className="mb-3 mt-12 text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          Explora
        </p>

        <nav className="space-y-2" aria-label="Navegación principal">
          <button type="button" onClick={() => navigateTo("explore")} aria-current={screen === "explore" ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold ${screen === "explore" ? "bg-emerald-50 text-emerald-900" : "text-stone-600 hover:bg-stone-50"}`}>
            <Compass size={19} /> Explorar
          </button>
          <button type="button" onClick={() => navigateTo("request")} aria-current={screen === "request" ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold ${screen === "request" ? "bg-emerald-50 text-emerald-900" : "text-stone-600 hover:bg-stone-50"}`}>
            <Ticket size={19} /> Nueva solicitud
          </button>
          <button type="button" onClick={() => navigateTo("itinerary")} aria-current={screen === "itinerary" ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold ${screen === "itinerary" ? "bg-emerald-50 text-emerald-900" : "text-stone-600 hover:bg-stone-50"}`}>
            <CalendarDays size={19} /> Itinerario
          </button>
          <button type="button" onClick={() => navigateTo("expenses")} aria-current={screen === "expenses" ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold ${screen === "expenses" ? "bg-emerald-50 text-emerald-900" : "text-stone-600 hover:bg-stone-50"}`}>
            <Wallet size={19} /> Gastos
          </button>
        </nav>

        {authUser ? (
          <div className="mt-auto rounded-2xl bg-emerald-900 p-5 text-white">
            <p className="truncate text-sm font-semibold">{authUser.displayName || authUser.email}</p>
            <button type="button" onClick={handleSignOut} className="mt-3 flex items-center gap-2 text-sm text-emerald-100 hover:text-white">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="mt-auto rounded-2xl bg-emerald-900 p-5 text-white">
          <Compass size={24} />
          <p className="mt-4 font-semibold">Experiencias en todo el mundo.</p>
          <p className="mt-2 text-sm leading-6 text-emerald-100">
            Encuentra algo especial que hacer en tu próximo destino.
          </p>
          </div>
        )}
      </aside>

      <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8 md:ml-64 md:px-10 md:py-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">
              {screen === "explore" ? "Experiencias y alojamientos a tu medida" : "Tu espacio TripWise"}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {screen === "explore" && "Explora el mundo a tu manera."}
              {screen === "request" && "Prepara una experiencia."}
              {screen === "itinerary" && "Tu itinerario."}
              {screen === "expenses" && "Tu presupuesto."}
            </h1>
            <p className="mt-3 text-stone-500">
              {screen === "explore" && "Encuentra actividades y alojamiento cerca de lo que quieres vivir."}
              {screen === "request" && "Unos pasos breves para preparar tu experiencia."}
              {screen === "itinerary" && "Consulta las fechas y actividades de tus planes."}
              {screen === "expenses" && "Revisa el desglose de tu estimación."}
            </p>
          </div>
          <button
            onClick={() => navigateTo("request")}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Ticket size={19} />
            <span className="hidden sm:inline">{screen === "explore" ? "Preparar solicitud" : "Nueva solicitud"}</span>
          </button>
        </header>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 md:hidden" aria-label="Navegación principal">
          {([
            ["explore", "Explorar"],
            ["request", "Solicitud"],
            ["itinerary", "Itinerario"],
            ["expenses", "Gastos"],
          ] as const).map(([page, label]) => (
            <button
              key={page}
              type="button"
              onClick={() => navigateTo(page)}
              aria-current={screen === page ? "page" : undefined}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${screen === page ? "bg-emerald-800 text-white" : "bg-white text-stone-600"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {screen === "explore" && (
        <div>
        <section className="mt-9 grid gap-4 sm:grid-cols-3">
          <Stat icon={<Ticket size={20} />} label="Experiencias de muestra" value="04" />
          <Stat icon={<MapPin size={20} />} label="Destinos destacados" value="04" />
          <Stat icon={<Wallet size={20} />} label="Precio de muestra desde" value="35 €" />
        </section>

        <section id="destinations" className="mt-12">
          <div className="mb-5">
            <p className="text-sm font-medium text-emerald-800">INSPIRACIÓN PARA TU PRÓXIMA EXPERIENCIA</p>
            <h2 className="mt-1 text-2xl font-bold">¿A dónde te gustaría ir?</h2>
            <p className="mt-2 text-sm text-stone-500">
            Escribe cualquier ciudad, región o país. Para lugares fuera de los ejemplos, cuéntanos qué actividad y alojamiento buscas.
            </p>
          </div>

          <form onSubmit={handleDestinationSearch} className="mb-5 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="destination-search">Busca cualquier lugar del mundo</label>
            <input
              id="destination-search"
              value={destinationQuery}
              onChange={(event) => {
                setDestinationQuery(event.target.value);
                setDestinationSearchError("");
              }}
              placeholder="Escribe un destino real, por ejemplo: Kioto, Japón"
              aria-describedby="destination-search-help"
              className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            />
            <button
              type="submit"
              disabled={!destinationQuery.trim() || destinationSearchBusy || !googleMapsReady}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MapPin size={18} /> {destinationSearchBusy ? "Validando destino..." : "Validar destino"}
            </button>
          </form>
          <p id="destination-search-help" className="-mt-2 mb-5 text-xs text-stone-500">
            Indica una ciudad, región o país. Google Maps comprobará que el lugar exista antes de seleccionarlo.
          </p>
          {!googleMapsReady && (
            <p className="-mt-2 mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              La búsqueda está pendiente de configuración: añade <code>VITE_GOOGLE_MAPS_API_KEY</code> a <code>.env.local</code> y habilita Maps JavaScript API, Geocoding API y Maps Embed API en Google Cloud.
            </p>
          )}
          {destinationSearchError && (
            <p role="alert" className="-mt-2 mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {destinationSearchError}
            </p>
          )}

          <div
            className="relative min-h-[360px] overflow-hidden rounded-3xl bg-stone-900 text-white sm:min-h-[420px]"
            aria-roledescription="carrusel"
            aria-label="Destinos recomendados"
          >
            <img
              key={destination.name}
              src={destinationPhotoFailed ? destination.image : destinationPhotoUrl}
              alt={`Paisaje de ${destination.name}${destination.country ? `, ${destination.country}` : ""}`}
              onError={() => setDestinationPhotoFailed(true)}
              className="absolute inset-0 z-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/75 via-black/35 to-black/5" />

            <div
              className="relative z-20 flex min-h-[360px] flex-col justify-end p-6 sm:min-h-[420px] sm:p-10 lg:max-w-2xl"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="mb-4 w-fit rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                {destination.tag}
              </span>
              <h3 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {destination.name}
                {destination.country && (
                  <span className="ml-3 text-2xl font-medium text-white/80 sm:text-3xl">
                    {destination.country}
                  </span>
                )}
              </h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/85 sm:text-lg">
                {destination.description}
              </p>

              <div className="mt-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2" aria-label={`Destino ${activeDestination + 1} de ${destinations.length}`}>
                  {destinations.map((item, index) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => chooseFeaturedDestination(index)}
                      aria-label={`Ver inspiración: ${item.name}`}
                      aria-current={customDestination === null && index === activeDestination ? "true" : undefined}
                      className={`h-2.5 rounded-full transition-all ${
                        customDestination === null && index === activeDestination
                          ? "w-8 bg-white"
                          : "w-2.5 bg-white/55 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => showDestination(-1)}
                    aria-label="Destino anterior"
                    className="rounded-full border border-white/40 bg-black/20 p-3 transition hover:bg-white/20"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => showDestination(1)}
                    aria-label="Destino siguiente"
                    className="rounded-full border border-white/40 bg-black/20 p-3 transition hover:bg-white/20"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="experiences" className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-800">EN {destination.name.toLocaleUpperCase()}</p>
              <h2 className="mt-1 text-2xl font-bold">Experiencias para vivir el destino</h2>
              <p className="mt-2 text-sm text-stone-500">
                {destination.country
              ? `Catálogo demostrativo de actividades en ${destination.name}, ${destination.country}.`
              : `Cuéntanos qué actividad te interesa en ${destination.name} y te prepararemos una propuesta.`}
              </p>
              <p className="mt-1 text-xs text-stone-400">
                Los precios y alojamientos visibles son datos de ejemplo, no tarifas en tiempo real.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600">
              <span>Categoría</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 font-medium text-[#202820] outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
              >
                {experienceCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>

          {destinationExperiences.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {destinationExperiences.map((experience) => (
                <article
                  key={experience.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={experience.image}
                      alt={experience.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold">
                      {experience.category}
                    </span>
                    <span className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold">
                      {experience.price} <span className="font-normal text-stone-500">/ persona</span>
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold">{experience.name}</h3>
                    <div className="mt-3 space-y-2 text-sm text-stone-500">
                      <p className="flex items-center gap-2"><Clock3 size={16} /> {experience.duration}</p>
                      <p className="flex items-center gap-2"><MapPin size={16} /> Punto de encuentro: {experience.meetingPoint}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExperienceId(experience.id);
                        setActivityRequest(experience.name);
                        setActivityPrice(String(demoPriceNumber(experience.price)));
                        setRequestSummary(null);
                        document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <BedDouble size={18} />
                      Ver hoteles cercanos
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExperienceId(experience.id);
                        setActivityRequest(experience.name);
                        setActivityPrice(String(demoPriceNumber(experience.price)));
                        setRequestSummary(null);
                        setScreen("request");
                        setWizardStep(1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-800 px-4 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
                    >
                      <Send size={17} />
                      Solicitar esta experiencia
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">
              {customDestination
                ? `Aún no mostramos actividades para ${destination.name}. Describe en el formulario qué te gustaría hacer y añadiremos tu petición al presupuesto orientativo.`
                : `No hay experiencias de esta categoría en ${destination.name}. Prueba otra categoría.`}
            </p>
          )}
        </section>

        <section id="hotels" className="mb-8 mt-12 scroll-mt-8">
          <div className="mb-5">
            <p className="text-sm font-medium text-emerald-800">ALOJAMIENTOS EN {destination.name.toLocaleUpperCase()}</p>
            <h2 className="mt-1 text-2xl font-bold">
              {selectedExperience
                ? `Quédate cerca de ${selectedExperience.meetingPoint}`
                : `Hoteles cerca de tus experiencias en ${destination.name}`}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Recomendaciones por ubicación para que estés cerca de lo que quieres hacer.
            </p>
          </div>

          {recommendedHotels.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {recommendedHotels.map((hotel) => (
                <article
                  key={hotel.name}
                  className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:flex-row"
                >
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="h-48 w-full object-cover sm:h-auto sm:w-2/5"
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-stone-500">{hotel.neighborhood}</p>
                        <h3 className="mt-1 text-lg font-bold">{hotel.name}</h3>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-800">
                        <Star size={14} fill="currentColor" /> {hotel.rating}
                      </span>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-sm text-stone-500">
                      <MapPin size={16} /> {selectedExperience
                        ? `${hotel.distance} · ${selectedExperience.meetingPoint}`
                        : hotel.distance}
                    </p>
                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <p className="font-bold text-emerald-900">
                        {hotel.price}<span className="ml-1 text-sm font-normal text-stone-500">/ noche</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setHotelInterest(true);
                          setSelectedHotelName(hotel.name);
                          setHotelNightlyPrice(String(demoPriceNumber(hotel.price)));
                          setRequestSummary(null);
                          setScreen("request");
                          setWizardStep(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold transition hover:bg-stone-50"
                      >
                        Me interesa este hotel <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-stone-200 bg-white p-6 text-stone-600">
              Aún no tenemos hoteles de muestra en este lugar. Puedes indicar si necesitas alojamiento y tu presupuesto; no se mostrarán precios reales hasta conectar disponibilidad.
            </p>
          )}
          <p className="mt-4 flex items-center gap-2 text-xs text-stone-400">
            <Users size={14} /> Precios orientativos; disponibilidad y tarifas finales dependen de las fechas.
          </p>
        </section>
        <section aria-label={`Mapa de ${destination.name}`} className="mb-8 mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {destinationMapUrl ? (
            <iframe
              title={`Mapa de ${destination.name}`}
              src={destinationMapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-72 w-full border-0"
            />
          ) : (
            <div className="flex min-h-28 items-center gap-3 p-5 text-sm text-stone-600">
              <MapPin className="shrink-0 text-emerald-800" size={22} />
              <p>El mapa aparecerá cuando configures la clave de Google Maps. Los destinos escritos no se seleccionan hasta que Google Maps esté habilitado.</p>
            </div>
          )}
        </section>
        </div>
        )}

        {screen === "request" && (
        <section id="request" className="mb-10 scroll-mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 max-w-2xl">
            <p className="text-sm font-medium text-emerald-800">CUÉNTANOS QUÉ BUSCAS</p>
            <h2 className="mt-1 text-2xl font-bold">
              {authUser ? "Prepara tu experiencia" : "Crea una cuenta para continuar"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {authUser
                ? "Elige cualquier lugar, dinos qué te interesa y configura el plan para ti o para tu grupo."
                : "Regístrate o inicia sesión antes de preparar una solicitud o reserva."}
            </p>
          </div>

          <div className="mb-7 grid overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.8fr)]">
            {!destinationPhotoFailed ? (
              <img
                src={destinationPhotoUrl}
                alt={`Vista de ${destination.name}`}
                onError={() => setDestinationPhotoFailed(true)}
                className="h-52 w-full object-cover sm:h-full sm:min-h-56"
              />
            ) : (
              <div className="flex min-h-52 items-center justify-center bg-emerald-50 text-emerald-800 sm:min-h-56">
                <div className="text-center">
                  <MapPin className="mx-auto" size={32} />
                  <p className="mt-2 text-sm font-semibold">Imagen no disponible</p>
                </div>
              </div>
            )}
            <div className="flex flex-col justify-center p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Destino seleccionado</p>
              <h3 className="mt-2 text-xl font-bold">{destination.name}{destination.country ? `, ${destination.country}` : ""}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {destinationPhotoLoading
                  ? "Buscando una fotografía de este destino..."
                  : destinationPhotoSearchFailed
                    ? "No encontramos una foto específica; mostramos una imagen ilustrativa."
                    : customDestination && !destinationPhotoSource
                    ? "Mostramos una imagen ilustrativa mientras no encontremos una fotografía específica."
                    : "Confirma visualmente el lugar antes de continuar."}
              </p>
              {destinationPhotoSource && (
                <a
                  href={destinationPhotoSource}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-xs font-medium text-emerald-800 underline underline-offset-2"
                >
                  Ver fuente de la fotografía
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setDestinationQuery("");
                  navigateTo("explore");
                }}
                className="mt-4 w-fit rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100"
              >
                Cambiar destino
              </button>
            </div>
          </div>

          <div className="mb-7 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {destinationMapUrl ? (
              <iframe
                title={`Mapa de ${destination.name}`}
                src={destinationMapUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0"
              />
            ) : (
              <p className="flex items-center gap-3 p-4 text-sm text-stone-600">
                <MapPin className="shrink-0 text-emerald-800" size={20} />
                Configura la clave de Google Maps para mostrar el mapa del destino.
              </p>
            )}
          </div>

          {!authReady ? (
            <p role="status" className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
              Comprobando tu sesión...
            </p>
          ) : !authUser ? (
            <div className="max-w-xl rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="rounded-xl bg-emerald-100 p-3 text-emerald-900"><LockKeyhole size={22} /></span>
                <div>
                  <h3 className="font-bold">{authMode === "register" ? "Crear cuenta" : "Iniciar sesión"}</h3>
                  <p className="text-sm text-stone-500">Autenticación segura con Firebase</p>
                </div>
              </div>
              {!firebaseConfigReady && (
                <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  Para activar el registro, configura un proyecto Firebase con Authentication por correo y contraseña y completa las variables de <code>.env.local</code> usando <code>.env.example</code> como guía.
                </p>
              )}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <label className="block space-y-2 text-sm font-medium text-stone-700">
                    <span>Nombre</span>
                    <input
                      name="displayName"
                      autoComplete="name"
                      required
                      minLength={2}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                )}
                <label className="block space-y-2 text-sm font-medium text-stone-700">
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    name="authEmail"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                </label>
                <label className="block space-y-2 text-sm font-medium text-stone-700">
                  <span>Contraseña</span>
                  <input
                    type="password"
                    name="authPassword"
                    autoComplete={authMode === "register" ? "new-password" : "current-password"}
                    minLength={6}
                    required
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                </label>
                {authMode === "register" && (
                  <label className="block space-y-2 text-sm font-medium text-stone-700">
                    <span>Repite la contraseña</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      autoComplete="new-password"
                      minLength={6}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                )}
                {authError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{authError}</p>}
                <button
                  type="submit"
                  disabled={!firebaseConfigReady || authBusy}
                  className="w-full rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {authBusy ? "Un momento..." : authMode === "register" ? "Crear mi cuenta" : "Iniciar sesión"}
                </button>
              </form>
              <button
                type="button"
                onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setAuthError(""); }}
                className="mt-4 text-sm font-semibold text-emerald-900 underline underline-offset-4"
              >
                {authMode === "register" ? "Ya tengo cuenta · Iniciar sesión" : "Crear una cuenta nueva"}
              </button>
              <p className="mt-5 text-xs leading-5 text-stone-500">
                Solo pedimos tu nombre y correo para la cuenta. No introduzcas documentos de identidad ni datos de tarjeta.
              </p>
            </div>
          ) : (
          <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-950">
              Sesión iniciada como {authUser.displayName || authUser.email}
            </p>
            <button type="button" onClick={handleSignOut} className="flex items-center gap-2 text-sm font-semibold text-emerald-900 hover:underline">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>

          <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Pasos para preparar la experiencia">
            {["Actividad", "Alojamiento y gastos", "Revisión"].map((label, index) => {
              const step = index + 1;
              return (
                <li key={label} className={`rounded-xl px-3 py-3 text-center text-xs font-semibold sm:text-sm ${wizardStep === step ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-500"}`}>
                  <span className="mr-1">{step}.</span>{label}
                </li>
              );
            })}
          </ol>

          <form
            ref={requestFormRef}
            onSubmit={handleRequestSubmit}
            onChange={() => setRequestSummary(null)}
            className="space-y-6"
          >
            <fieldset disabled={wizardStep !== 1} hidden={wizardStep !== 1} className="min-w-0 space-y-6 border-0 p-0">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Destino</span>
                <input
                  value={destination.country ? `${destination.name}, ${destination.country}` : destination.name}
                  readOnly
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-600"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>¿Qué te gustaría hacer?</span>
                <input
                  name="activityRequest"
                  value={activityRequest}
                  onChange={(event) => {
                    setActivityRequest(event.target.value);
                    setSelectedExperienceId(null);
                    setActivityPrice("");
                    setRequestSummary(null);
                  }}
                  required
                  placeholder="Ej.: visitar un estadio, hacer senderismo, una clase de cocina..."
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>O elige una experiencia del catálogo de muestra</span>
                <select
                  name="experience"
                  value={selectedExperience?.id ?? ""}
                  onChange={(event) => {
                    const experience = allDestinationExperiences.find(
                      (item) => item.id === event.target.value,
                    );
                    setSelectedExperienceId(experience?.id ?? null);
                    if (experience) {
                      setActivityRequest(experience.name);
                      setActivityPrice(String(demoPriceNumber(experience.price)));
                    } else {
                      setActivityRequest("");
                      setActivityPrice("");
                    }
                    setRequestSummary(null);
                  }}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-[#202820] outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                >
                  <option value="">Sin elegir / petición personalizada</option>
                  {allDestinationExperiences.map((experience) => (
                    <option key={experience.id} value={experience.id}>
                      {experience.name} · {experience.price} por persona
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Presupuesto máximo deseado para el grupo (€)</span>
                <input
                  type="number"
                  name="budget"
                  min="0"
                  step="1"
                  value={targetBudget}
                  onChange={(event) => setTargetBudget(event.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 text-sm font-medium text-stone-700">
                <span className="flex items-center gap-2"><CalendarDays size={17} /> Fecha de la experiencia</span>
                <input
                  ref={dateInputRef}
                  type="date"
                  name="date"
                  min={new Date().toISOString().slice(0, 10)}
                  required={!dateIsFlexible}
                  disabled={dateIsFlexible}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-stone-50 disabled:text-stone-400"
                />
                <label className="flex items-center gap-2 font-normal">
                  <input
                    type="checkbox"
                    checked={dateIsFlexible}
                    onChange={(event) => setDateIsFlexible(event.target.checked)}
                    className="h-4 w-4 accent-emerald-800"
                  />
                  Mis fechas son flexibles
                </label>
              </div>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Días que estarás en el destino</span>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={days}
                  onChange={(event) => setDays(Math.max(1, Number(event.target.value)))}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
            </div>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-stone-700">¿Quiénes van? Puedes viajar solo o en grupo.</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Adultos</span>
                  <input
                    type="number"
                    name="adults"
                    min="1"
                    max="30"
                    value={adults}
                    onChange={(event) => setAdults(Math.max(1, Number(event.target.value)))}
                    required
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Niños</span>
                  <input
                    type="number"
                    name="children"
                    min="0"
                    max="30"
                    value={children}
                    onChange={(event) => setChildren(Math.max(0, Number(event.target.value)))}
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                </label>
                {children > 0 && (
                  <label className="space-y-2 text-sm font-medium text-stone-700 sm:col-span-2">
                    <span>Edades de los niños (opcional, para estimar tarifas)</span>
                    <input
                      type="text"
                      name="childrenAges"
                      placeholder="Por ejemplo: 6, 9"
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                )}
              </div>
            </fieldset>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={continueWizard}
                className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Continuar a alojamiento y gastos
              </button>
            </div>
            {wizardNotice && <p role="alert" className="text-sm text-rose-700">{wizardNotice}</p>}
            </fieldset>

            <fieldset disabled={wizardStep !== 2} hidden={wizardStep !== 2} className="min-w-0 space-y-6 border-0 p-0">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Idioma preferido para la experiencia</span>
                <select
                  name="language"
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                >
                  <option>Español</option>
                  <option>Inglés</option>
                  <option>Francés</option>
                  <option>Italiano</option>
                  <option>Japonés</option>
                  <option>Sin preferencia</option>
                </select>
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Accesibilidad, necesidades o preferencias (opcional)</span>
                <textarea
                  name="specialRequirements"
                  rows={3}
                  placeholder="Por ejemplo, movilidad reducida, ritmo tranquilo o actividad para familias."
                  className="w-full resize-y rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Número de actividades iguales</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={activityCount}
                  onChange={(event) => setActivityCount(Math.max(1, Number(event.target.value)))}
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Precio estimado de la actividad por persona (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={activityPrice}
                  onChange={(event) => setActivityPrice(event.target.value)}
                  placeholder="Añade el precio si lo conoces"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Comidas por persona y día (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={mealsPerPersonPerDay}
                  onChange={(event) => setMealsPerPersonPerDay(event.target.value)}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
            </div>

            <div className="rounded-2xl bg-stone-50 p-5">
              <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={hotelInterest}
                  onChange={(event) => {
                    setHotelInterest(event.target.checked);
                    if (!event.target.checked) {
                      setSelectedHotelName("");
                      setHotelNightlyPrice("");
                    }
                  }}
                  className="mt-0.5 h-4 w-4 accent-emerald-800"
                />
                <span>También me interesa encontrar hotel cerca de la actividad</span>
              </label>
              {hotelInterest && (
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    <span>Tipo de alojamiento</span>
                    <select
                      name="lodgingType"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    >
                      <option>Sin preferencia</option>
                      <option>Hotel</option>
                      <option>Apartahotel</option>
                      <option>Apartamento</option>
                      <option>Hostal</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    <span>Barrio o zona preferida (opcional)</span>
                    <input
                      type="text"
                      name="hotelArea"
                      placeholder="Por ejemplo, cerca del estadio"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    <span>Hotel de interés (opcional)</span>
                    <select
                      name="hotel"
                      value={selectedHotelName}
                      onChange={(event) => {
                        const hotel = recommendedHotels.find((item) => item.name === event.target.value);
                        setSelectedHotelName(event.target.value);
                        setHotelNightlyPrice(hotel ? String(demoPriceNumber(hotel.price)) : "");
                      }}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    >
                      <option value="">Ayúdenme a elegir</option>
                      {recommendedHotels.map((hotel) => (
                        <option key={hotel.name} value={hotel.name}>{hotel.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    <span>Noches aproximadas</span>
                    <input
                      type="number"
                      name="nights"
                      min="1"
                      max="30"
                      value={hotelNights}
                      onChange={(event) => setHotelNights(Math.max(1, Number(event.target.value)))}
                      required={hotelInterest}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    <span>Precio aproximado del hotel por noche (€)</span>
                    <input
                      type="number"
                      name="hotelBudget"
                      min="0"
                      step="0.01"
                      value={hotelNightlyPrice}
                      onChange={(event) => setHotelNightlyPrice(event.target.value)}
                      placeholder="Añade el precio si lo conoces"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-stone-700">
                    <span>Habitaciones</span>
                    <input
                      type="number"
                      name="rooms"
                      min="1"
                      max="20"
                      value={hotelRooms}
                      onChange={(event) => setHotelRooms(Math.max(1, Number(event.target.value)))}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Transporte local para el grupo (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={localTransport}
                  onChange={(event) => setLocalTransport(event.target.value)}
                  placeholder="Opcional: transporte público, taxi, etc."
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Otros gastos para el grupo (€)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={extras}
                  onChange={(event) => setExtras(event.target.value)}
                  placeholder="Opcional: entradas, extras..."
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="rounded-xl border border-stone-200 px-5 py-3 font-semibold text-stone-700 hover:bg-stone-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => setWizardStep(3)}
                className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Revisar presupuesto
              </button>
            </div>
            </fieldset>

            <fieldset disabled={wizardStep !== 3} hidden={wizardStep !== 3} className="min-w-0 space-y-6 border-0 p-0">
            <section aria-labelledby="estimate-title" className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
              <p className="text-sm font-medium text-emerald-800">PRESUPUESTO ORIENTATIVO</p>
              <h3 id="estimate-title" className="mt-1 text-xl font-bold">Tu estimación para {destination.name}</h3>
              <div className="mt-4 space-y-2 text-sm text-stone-700">
                {activityNeedsQuote ? (
                  <>
                    <div className="flex justify-between gap-4">
                      <span>Experiencia solicitada</span>
                      <span className="font-medium text-amber-800">Pendiente de cotización</span>
                    </div>
                    {Number(activityPrice) > 0 && (
                      <div className="flex justify-between gap-4">
                        <span>Referencia introducida, no incluida en el subtotal ({activityCount} × {travelerCount} personas)</span>
                        <span>{formatEuros(activityTotal)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between gap-4">
                    <span>Experiencia de muestra ({activityCount} × {travelerCount} personas)</span>
                    <span>{activityPrice ? formatEuros(activityTotal) : "Añade un precio"}</span>
                  </div>
                )}
                {targetBudget && estimateComplete && (
                  <p className={`mt-3 text-sm font-semibold ${totalEstimate > Number(targetBudget) ? "text-rose-700" : "text-emerald-800"}`}>
                    {totalEstimate > Number(targetBudget)
                      ? `La estimación supera tu presupuesto objetivo de ${formatEuros(Number(targetBudget))}.`
                      : `La estimación está dentro de tu presupuesto objetivo de ${formatEuros(Number(targetBudget))}.`}
                  </p>
                )}
                {targetBudget && !estimateComplete && (
                  <p className="mt-3 text-sm text-stone-600">
                    {activityNeedsQuote
                      ? "La actividad aún necesita cotización para comparar el total con tu presupuesto."
                      : `Añade el precio${hotelInterest ? " del alojamiento" : ""} para comparar el total con tu presupuesto.`}
                  </p>
                )}
                {hotelInterest && (
                  <div className="flex justify-between gap-4">
                    <span>Alojamiento ({hotelRooms} habitaciones · {hotelNights} noches)</span>
                    <span>{hotelNightlyPrice ? formatEuros(hotelTotal) : "Añade un precio"}</span>
                  </div>
                )}
                {Number(mealsPerPersonPerDay) > 0 && (
                  <div className="flex justify-between gap-4">
                    <span>Comidas ({travelerCount} personas · {days} días)</span>
                    <span>{formatEuros(mealsTotal)}</span>
                  </div>
                )}
                {Number(localTransport) > 0 && (
                  <div className="flex justify-between gap-4">
                    <span>Transporte local</span>
                    <span>{formatEuros(Number(localTransport))}</span>
                  </div>
                )}
                {Number(extras) > 0 && (
                  <div className="flex justify-between gap-4">
                    <span>Otros gastos</span>
                    <span>{formatEuros(Number(extras))}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-emerald-200 pt-3 text-base font-bold text-emerald-950">
                  <span>{estimateComplete ? "Total estimado" : "Subtotal parcial"}</span>
                  <span>{formatEuros(knownCostSubtotal)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-600">
                Cálculo con los importes que introduces y precios de muestra en los destinos destacados. No consulta tarifas globales ni es una oferta confirmada; no incluye vuelos y pueden variar disponibilidad, impuestos y precios infantiles.
              </p>
            </section>

            <fieldset className="rounded-2xl border border-stone-200 p-5">
              <legend className="px-2 text-sm font-semibold text-stone-700">¿Cómo preferirías pagar si confirmas la reserva?</legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {["Tarjeta", "PayPal", "Transferencia"].map((method) => (
                  <label key={method} className="flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-700 hover:bg-stone-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      required
                      className="h-4 w-4 accent-emerald-800"
                    />
                    {method === "Tarjeta" && <CreditCard size={17} />}
                    {method}
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-500">
                Esto solo indica tu preferencia. No introduzcas datos de tarjeta aquí: el pago se haría más adelante mediante una pasarela segura.
              </p>
            </fieldset>

            <p className="text-sm text-stone-600">
              Usaremos el correo de tu cuenta ({authUser.email}) como contacto principal.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Teléfono de contacto (opcional)</span>
                <span className="flex items-center gap-2 rounded-xl border border-stone-200 px-4 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/15">
                  <Phone size={18} className="shrink-0 text-stone-400" />
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    className="w-full py-3 outline-none"
                  />
                </span>
              </label>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-stone-600">
              <input
                type="checkbox"
                name="privacyConsent"
                value="true"
                required
                className="mt-0.5 h-4 w-4 accent-emerald-800"
              />
              <span>
                Acepto que TripWise use estos datos para responder a mi solicitud. La política de privacidad debe estar disponible antes de publicar el formulario.
              </span>
            </label>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
            >
              <Send size={18} />
              Ver resumen estimado
            </button>
            </fieldset>
          </form>
          </>
          )}

        </section>
        )}

        {screen === "itinerary" && (
        <section className="mb-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-emerald-800">MIS PLANES</p>
            <h2 className="mt-1 text-2xl font-bold">Itinerario</h2>
          </div>
          {requestSummary ? (
            <article className="rounded-2xl bg-stone-50 p-5">
              <p className="text-sm font-semibold text-emerald-800">VISTA PREVIA · AÚN NO RESERVADA</p>
              <h3 className="mt-2 text-xl font-bold">{requestSummary.experience}</h3>
              <p className="mt-2 text-stone-600">{requestSummary.destination} · {requestSummary.adults + requestSummary.children} personas</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Fecha de la experiencia</span>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={requestSummary.date}
                    disabled={requestSummary.dateIsFlexible}
                    onChange={(event) => setRequestSummary((current) => current ? {
                      ...current,
                      date: event.target.value,
                      dateIsFlexible: false,
                    } : current)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 disabled:bg-stone-100 disabled:text-stone-500"
                  />
                  <span className="flex items-center gap-2 font-normal">
                    <input
                      type="checkbox"
                      checked={requestSummary.dateIsFlexible}
                      onChange={(event) => setRequestSummary((current) => current ? {
                        ...current,
                        dateIsFlexible: event.target.checked,
                        date: event.target.checked ? "" : current.date,
                      } : current)}
                      className="h-4 w-4 accent-emerald-800"
                    />
                    Tengo fechas flexibles
                  </span>
                </label>
                <label className="space-y-2 text-sm font-medium text-stone-700">
                  <span>Días en el destino</span>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={requestSummary.days}
                    onChange={(event) => setRequestSummary((current) => current ? {
                      ...current,
                      days: Math.max(1, Number(event.target.value)),
                    } : current)}
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => navigateTo("request")}
                className="mt-5 rounded-xl border border-emerald-800 px-4 py-2.5 font-semibold text-emerald-900 transition hover:bg-emerald-50"
              >
                Modificar actividad y otros datos
              </button>
              <p className="mt-2 text-sm text-stone-500">
                Los cambios se reflejan en esta vista previa de la sesión. El itinerario no está reservado ni guardado.
              </p>
            </article>
          ) : (
            <div className="rounded-2xl bg-stone-50 p-6 text-center">
              <CalendarDays className="mx-auto text-emerald-800" size={28} />
              <p className="mt-3 font-semibold">Todavía no tienes planes preparados</p>
              <p className="mt-1 text-sm text-stone-500">Explora experiencias y prepara una solicitud para crear una vista previa.</p>
              <button type="button" onClick={() => navigateTo("explore")} className="mt-4 rounded-xl bg-emerald-800 px-4 py-2.5 font-semibold text-white">
                Explorar destinos
              </button>
            </div>
          )}
        </section>
        )}

        {screen === "expenses" && (
        <section className="mb-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-emerald-800">DESGLOSE</p>
            <h2 className="mt-1 text-2xl font-bold">Gastos y presupuesto</h2>
          </div>
          {requestSummary ? (
            <div className="max-w-2xl">
              <div className="mb-5 rounded-2xl bg-stone-50 p-5">
                <p className="font-semibold">{requestSummary.experience}</p>
                <p className="mt-1 text-sm text-stone-500">{requestSummary.destination} · {requestSummary.adults + requestSummary.children} personas</p>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt>{requestSummary.activityNeedsQuote ? "Actividad solicitada" : "Actividad (precio de muestra)"}</dt>
                  <dd className={requestSummary.activityNeedsQuote ? "font-medium text-amber-800" : ""}>
                    {requestSummary.activityNeedsQuote ? "Pendiente de cotización" : formatEuros(requestSummary.activityTotal)}
                  </dd>
                </div>
                {requestSummary.hotel && (
                  <div className="flex justify-between gap-4">
                    <dt>Alojamiento · {requestSummary.rooms} habitaciones · {requestSummary.nights} noches</dt>
                    <dd className={requestSummary.hotelNeedsQuote ? "font-medium text-amber-800" : ""}>
                      {requestSummary.hotelNeedsQuote ? "Pendiente de cotización" : formatEuros(requestSummary.hotelTotal)}
                    </dd>
                  </div>
                )}
                {requestSummary.mealsTotal > 0 && <div className="flex justify-between gap-4"><dt>Comidas</dt><dd>{formatEuros(requestSummary.mealsTotal)}</dd></div>}
                {requestSummary.localTransport > 0 && <div className="flex justify-between gap-4"><dt>Transporte local</dt><dd>{formatEuros(requestSummary.localTransport)}</dd></div>}
                {requestSummary.extras > 0 && <div className="flex justify-between gap-4"><dt>Otros gastos</dt><dd>{formatEuros(requestSummary.extras)}</dd></div>}
                <div className="flex justify-between gap-4 border-t border-stone-200 pt-4 text-lg font-bold">
                  <dt>{requestSummary.estimateComplete ? "Estimación orientativa" : "Subtotal de costes conocidos"}</dt>
                  <dd>{formatEuros(requestSummary.total)}</dd>
                </div>
              </dl>
              {(requestSummary.activityNeedsQuote || requestSummary.hotelNeedsQuote) && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                  {requestSummary.activityNeedsQuote && "La actividad todavía no tiene precio para este destino. El subtotal no la incluye."}
                  {requestSummary.activityNeedsQuote && requestSummary.hotelNeedsQuote && " "}
                  {requestSummary.hotelNeedsQuote && "El alojamiento tampoco tiene precio confirmado. "}
                  El total final queda pendiente de cotización.
                </p>
              )}
              {requestSummary.targetBudget > 0 && (
                <p className="mt-3 text-sm text-stone-600">Tu presupuesto objetivo: {formatEuros(requestSummary.targetBudget)}.</p>
              )}
              <p className="mt-4 text-xs leading-5 text-stone-500">
                Esta vista previa está solo en tu sesión del navegador. No es una reserva ni una tarifa confirmada y se perderá al recargar.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-stone-50 p-6 text-center">
              <Wallet className="mx-auto text-emerald-800" size={28} />
              <p className="mt-3 font-semibold">Aún no hay presupuestos</p>
              <p className="mt-1 text-sm text-stone-500">Prepara una experiencia para ver su desglose.</p>
              <button type="button" onClick={() => navigateTo("request")} className="mt-4 rounded-xl bg-emerald-800 px-4 py-2.5 font-semibold text-white">
                Preparar experiencia
              </button>
            </div>
          )}
        </section>
        )}

        <footer className="border-t border-stone-200 py-6 text-sm text-stone-400">
          TripWise · Experiencias que te acercan al destino.
        </footer>
      </main>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-500">{label}</span>
        <span className="text-emerald-800">{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default App;