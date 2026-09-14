"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Heart,
  LockKeyhole,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  compareAt: number;
  color: string;
  colorLabel: string;
  category: string;
  index: number;
  description: string;
  variants: { label: string; color: string; image: string }[];
  visualKind?: string;
};

type CartItem = {
  product: Product;
  size: number;
  quantity: number;
};

const makeProduct = (
  id: string,
  name: string,
  price: number,
  compareAt: number,
  category: string,
  description: string,
  variants: Product["variants"],
): Product => ({
  id,
  name,
  price,
  compareAt,
  color: variants[0].color,
  colorLabel: variants[0].label,
  category,
  index: 0,
  description,
  variants,
});

const PRODUCTS: Product[] = [
  makeProduct("core-pace", "Corre Pace", 18490, 19990, "Corrida", "Um parceiro leve para acompanhar seu ritmo, com cabedal respirável e conforto para os treinos do dia a dia.", [
    { label: "Branco / Azul", color: "#f5f2e9", image: "tenis-corre-pace.webp" },
  ]),
  makeProduct("core-4", "Corre 4 50 Anos", 8190, 23990, "Corrida", "Edição comemorativa de 50 anos com visual marcante, ajuste confortável e sola para acompanhar sua rotina.", [
    { label: "Marinho / Areia · 50 anos", color: "#172d4d", image: "corre-4-50-anos-azul.webp" },
    { label: "Off-white", color: "#eee9dc", image: "corre-4/off-white.webp" },
    { label: "Preto / Creme", color: "#242426", image: "corre-4/preto-creme.webp" },
    { label: "Cinza / Oliva", color: "#8a8c7e", image: "corre-4/cinza-oliva.webp" },
  ]),
  makeProduct("supra-2", "Corre Supra 2", 15190, 27990, "Performance", "Amortecimento confortável e construção respirável para corridas, academia e movimento urbano.", [
    { label: "Preto / Grafite", color: "#303236", image: "supra-2.webp" },
    { label: "Azul / Lima", color: "#2a64bb", image: "supra-2/azul-lima.webp" },
    { label: "Preto / Lima", color: "#23272c", image: "supra-2/preto-lima.webp" },
    { label: "Creme / Lima", color: "#d9d5c6", image: "supra-2/creme-lima.webp" },
  ]),
  makeProduct("trilha-2", "Corre Trilha 2", 8190, 24990, "Trilha", "Aderência e conforto para explorar novos caminhos, com sola preparada para acompanhar você fora do asfalto.", [
    { label: "Areia / Oliva", color: "#788064", image: "tenis-corre-trilha-2.webp" },
    { label: "Azul Petróleo", color: "#275469", image: "corre-trilha-2/azul-petroleo.webp" },
    { label: "Oliva / Preto", color: "#555b43", image: "corre-trilha-2/oliva-preto.webp" },
    { label: "Preto", color: "#242426", image: "corre-trilha-2/preto-total.webp" },
  ]),
  makeProduct("grafeno-3", "Corre Grafeno 3", 10190, 29990, "Performance", "Um modelo de corrida com design dinâmico e diferentes combinações de cores para os seus treinos.", [
    { label: "Grafite / Branco", color: "#4a4e50", image: "grafeno-3.webp" },
    { label: "Azul / Turquesa", color: "#2088a1", image: "grafeno-3/azul-turquesa.webp" },
    { label: "Limão / Preto", color: "#a1bd24", image: "grafeno-3/limao-preto.webp" },
    { label: "Roxo / Preto", color: "#5b4a7a", image: "grafeno-3/roxo-preto.webp" },
  ]),
  makeProduct("corre-max", "Corre Max", 7590, 22990, "Corrida", "Conforto para seguir em movimento, em um visual versátil para seus treinos e para o dia a dia.", [
    { label: "Preto / Carvão", color: "#292b2d", image: "corre-max/preto-carvao.webp" },
    { label: "Branco Gelo", color: "#ecebe7", image: "corre-max/branco-gelo.webp" },
    { label: "Verde Oliva", color: "#747a50", image: "corre-max/verde-oliva.webp" },
    { label: "Areia / Turquesa", color: "#c8b49b", image: "corre-max/areia-turquesa.webp" },
  ]),
  makeProduct("corre-5", "Corre 5", 8190, 22990, "Corrida", "Leve e confortável para acompanhar diferentes ritmos, do treino diário à sua próxima corrida.", [
    { label: "Branco", color: "#f1eee8", image: "corre-5-branco.webp" },
    { label: "Preto / Neon", color: "#292b2d", image: "corre-5-preto-neon.webp" },
    { label: "Cinza / Bege", color: "#a7a49b", image: "corre-5/cinza-bege.webp" },
    { label: "Verde Oliva", color: "#747a50", image: "corre-5/verde-oliva.webp" },
  ]),
  makeProduct("corre-vento-3", "Corre Vento 3", 6990, 19990, "Corrida", "Um tênis leve com opções de cores vibrantes para colocar mais movimento nos seus quilômetros.", [
    { label: "Azul", color: "#2453a6", image: "corre-vento-3-azul.webp" },
    { label: "Bege", color: "#d4c8ab", image: "corre-vento-3-bege.webp" },
    { label: "Branco", color: "#f1eee8", image: "corre-vento-3-branco.webp" },
    { label: "Laranja", color: "#e97722", image: "corre-vento-3-laranja.webp" },
  ]),
  makeProduct("corre-trilha-3", "Corre Trilha 3", 8190, 22990, "Trilha", "Feito para explorar caminhos com conforto e firmeza em diferentes terrenos.", [
    { label: "Bege", color: "#cfc2a7", image: "corre-trilha-3-bege.webp" },
    { label: "Preto", color: "#242426", image: "corre-trilha-3-preto.webp" },
    { label: "Amarelo / Petróleo", color: "#c3a726", image: "corre-trilha-3/amarelo-petroleo.webp" },
    { label: "Oliva / Areia", color: "#777a55", image: "corre-trilha-3/oliva-areia.webp" },
  ]),
  makeProduct("corre-max-2", "Corre Max 2", 8190, 22990, "Corrida", "Amortecimento macio e combinações atuais para os seus treinos e caminhadas.", [
    { label: "Bege / Oliva", color: "#b9aa8c", image: "corre-max-2/bege-oliva.webp" },
    { label: "Creme / Bege", color: "#d4cbbb", image: "corre-max-2/creme-bege.webp" },
    { label: "Lilás", color: "#a58cb5", image: "corre-max-2/lilas.webp" },
    { label: "Preto", color: "#242426", image: "corre-max-2/preto.webp" },
  ]),
  makeProduct("corre-turbo", "Corre Turbo", 9190, 24990, "Performance", "Design esportivo e visual marcante para manter você em movimento.", [
    { label: "Azul Royal", color: "#254ab0", image: "corre-turbo/azul-royal.webp" },
    { label: "Preto / Lima", color: "#292b2d", image: "corre-turbo/preto-limao.webp" },
    { label: "Creme / Coral", color: "#d8cdbc", image: "corre-turbo/creme-coral-menta.webp" },
    { label: "Areia / Azul Royal", color: "#c8b49b", image: "corre-turbo/areia-azul-royal.webp" },
  ]),
  makeProduct("corre-nuvem", "Corre Nuvem", 6190, 16990, "Corrida", "Leveza e suavidade para caminhar, treinar e curtir cada passo do seu dia.", [
    { label: "Azul Marinho", color: "#193c89", image: "corre-nuvem/azul-marinho.webp" },
    { label: "Azul Claro", color: "#84a9dc", image: "corre-nuvem/azul-claro.webp" },
    { label: "Areia / Coral", color: "#d1b9a2", image: "corre-nuvem/areia-coral.webp" },
    { label: "Preto / Creme", color: "#292b2d", image: "corre-nuvem/preto-creme.webp" },
  ]),
];

const UPSELLS = [
  { name: "Jaqueta Corre 51 Anos", price: 42990, compareAt: 69990, kind: "jacket" },
  { name: "Camiseta Corre Essencial", price: 11990, compareAt: 22990, kind: "shirt" },
  { name: "Shorts Run 51", price: 13990, compareAt: 26990, kind: "shorts" },
  { name: "Corta-vento Corre", price: 36990, compareAt: 59990, kind: "jacket" },
  { name: "Regata Movimento", price: 9990, compareAt: 19990, kind: "shirt" },
  { name: "Calça Run Comfort", price: 25990, compareAt: 42990, kind: "shorts" },
  { name: "Moletom 51 Anos", price: 28990, compareAt: 48990, kind: "shirt" },
  { name: "Boné Corre", price: 8990, compareAt: 16990, kind: "cap" },
  { name: "Meia Performance", price: 4990, compareAt: 9990, kind: "socks" },
];

const SHIPPING = [
  { id: "economico", title: "Correios Econômico", detail: "8 a 12 dias úteis", price: 0 },
  { id: "pac", title: "Correios Pacote", detail: "4 a 7 dias úteis", price: 1691 },
  { id: "express", title: "Correios Express", detail: "1 a 3 dias úteis", price: 2492 },
];

const HERO_SLIDES = [
  { desktop: "banner-nuvem-desktop.webp", mobile: "banner-nuvem-mobile.jpg", alt: "Olymp Nuvem: leveza e suavidade a cada passo" },
  { desktop: "banner-aniversario51-desktop.webp", mobile: "banner-aniversario51-mobile.png", alt: "Celebração Olympikus 51 anos" },
  { desktop: "banner-trilha3-desktop.webp", mobile: "banner-trilha3-mobile.jpg", alt: "Coleção Olympikus Corre Trilha" },
  { desktop: "banner-corre5-vanderlei-desktop.webp", mobile: "banner-corre5-vanderlei-mobile.jpg", alt: "Olympikus Corre 5 com Vanderlei Cordeiro de Lima" },
];

const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Brand() {
  return (
    <span className="brand">
      <img className="brand-logo" src="/olympikus/olympikus-logo-white-full.svg" alt="Olympikus" />
    </span>
  );
}

function ProductVisual({ product, large = false, imageIndex = 0 }: { product: Product; large?: boolean; imageIndex?: number }) {
  const variant = product.variants[imageIndex % product.variants.length] ?? product.variants[0];
  if (product.visualKind) {
    return <div className={`product-visual ${large ? "product-visual-large" : ""}`}><OutfitVisual kind={product.visualKind} /></div>;
  }
  return (
    <div
      className={`product-visual ${large ? "product-visual-large" : ""}`}
    >
      <img src={`/olympikus/${variant.image}`} alt={`Tênis ${product.name}, ${variant.label}`} />
    </div>
  );
}

function OutfitVisual({ kind }: { kind: string }) {
  return (
    <div className={`outfit-visual outfit-${kind}`} aria-hidden="true">
      <span />
      <i />
    </div>
  );
}

function GameModal({
  screen,
  onClose,
  onStart,
  onRetry,
  onWin,
}: {
  screen: "welcome" | "game1" | "retry" | "game2" | null;
  onClose: () => void;
  onStart: () => void;
  onRetry: () => void;
  onWin: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchedRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const isGame = screen === "game1" || screen === "game2";
  const isWin = screen === "game2";

  useEffect(() => {
    scratchedRef.current = false;
    const canvas = canvasRef.current;
    if (!isGame || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    const sheen = ctx.createLinearGradient(0, 0, width, height);
    sheen.addColorStop(0, "#ddbd35");
    sheen.addColorStop(0.5, "#f2d64d");
    sheen.addColorStop(1, "#c6a819");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255,255,255,.12)";
    for (let x = 12; x < width; x += 24) {
      for (let y = 12; y < height; y += 24) ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalCompositeOperation = "source-over";
  }, [isGame, screen]);

  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    if (revealed) return;
    if (event.type === "pointerdown") canvas.setPointerCapture(event.pointerId);
    if (event.buttons === 0 && event.type !== "pointerdown") return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(event.clientX - rect.left, event.clientY - rect.top, 28, 0, Math.PI * 2);
    ctx.fill();
    if (!scratchedRef.current) {
      scratchedRef.current = true;
      window.setTimeout(() => {
        setRevealed(true);
        scratchedRef.current = false;
      }, 650);
    }
    void dpr;
  };

  if (!screen) return null;
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="campaign-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-title">
        <div className="modal-brand-row">
          <Brand />
          <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="Fechar campanha"><X size={19} /></button>
        </div>
        <div className="campaign-card">
          <img src="/olympikus/banner-aniversario51-desktop.webp" alt="Aniversário Olympikus: há 51 anos acompanhando o seu corre" />
        </div>
        {screen === "welcome" && (
          <div className="modal-content">
            <h2 id="campaign-title">Celebre com a gente!</h2>
            <p>A Olympikus completa <b>51 anos</b> de movimento. Descubra sua surpresa na raspadinha e participe da celebração.</p>
            <div className="discount-teaser"><strong>ATÉ 85% OFF</strong><span>Uma surpresa especial espera por você</span></div>
            <button className="button button-gold button-full" type="button" onClick={onStart}>QUERO PARTICIPAR <ChevronRight size={17} /></button>
            <button className="quiet-link" type="button" onClick={onClose}>Continuar para a loja</button>
          </div>
        )}
        {(screen === "game1" || screen === "game2") && !revealed && (
          <div className="modal-content">
            <div className="modal-headline">
              <div><h2 id="campaign-title">Raspadinha da Sorte</h2><p>Raspe e descubra sua surpresa</p></div>
              <span className="attempt-pill">Tentativa {screen === "game1" ? "1" : "2"}/2</span>
            </div>
            <div className={`scratch-card ${revealed ? "scratch-revealed" : ""}`}>
              <div className="scratch-prize">
                <strong>{isWin ? "85% OFF" : "+1 CHANCE"}</strong>
                <span>{isWin ? "Coleção Comemorativa 51 Anos" : "Tente mais uma vez!"}</span>
              </div>
              <canvas
                ref={canvasRef}
                className="scratch-layer"
                aria-label="Raspadinha: arraste para revelar"
                onPointerDown={scratch}
                onPointerMove={scratch}
              />
              <span className="scratch-hint"><Sparkles size={16} /> RASPE AQUI</span>
            </div>
            <div className="scratch-progress"><span>Progresso</span><span>0%</span><i><b style={{ width: "0%" }} /></i></div>
            <button className="quiet-link reveal-link" type="button" onClick={() => setRevealed(true)}>Revelar prêmio</button>
          </div>
        )}
        {screen === "game1" && revealed && (
          <div className="modal-content">
            <h2 id="campaign-title">Quase lá!</h2>
            <p>Você ainda tem <b>1 chance</b> de descobrir uma surpresa da coleção.</p>
            <div className="discount-teaser"><strong>+1 CHANCE</strong><span>Uma nova raspadinha está esperando</span></div>
            <button className="button button-gold button-full" type="button" onClick={onRetry}><RotateCcw size={17} /> TENTAR NOVAMENTE</button>
          </div>
        )}
        {screen === "game2" && revealed && (
          <div className="modal-content">
            <h2 id="campaign-title">Parabéns! Você ganhou!</h2>
            <p>Uma surpresa de <b>85% de desconto</b> na Coleção Comemorativa 51 Anos.</p>
            <div className="discount-teaser"><strong>85% OFF</strong><span>Cupom de demonstração: CORRE51</span></div>
            <button className="button button-gold button-full" type="button" onClick={onWin}>VER LINHA 51 ANOS <ShoppingBag size={17} /></button>
            <p className="demo-note">Prévia interativa. O desconto não é válido para compras reais.</p>
          </div>
        )}
        {screen === "retry" && (
          <div className="modal-content">
            <h2 id="campaign-title">Quase lá!</h2>
            <p>Você ainda tem <b>1 chance</b> de descobrir uma surpresa da coleção.</p>
            <div className="discount-teaser"><strong>+1 CHANCE</strong><span>Não desista agora</span></div>
            <button className="button button-gold button-full" type="button" onClick={onRetry}><RotateCcw size={17} /> TENTAR NOVAMENTE</button>
            <button className="quiet-link" type="button" onClick={onClose}>Agora não</button>
          </div>
        )}
        <div className="modal-footnote"><span>DEMONSTRAÇÃO</span><span>Campanha conceitual</span></div>
      </section>
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon: Truck, title: "Frete Grátis", text: "Para todo o Brasil" },
    { icon: RotateCcw, title: "Troca Grátis", text: "Até 30 dias" },
    { icon: CreditCard, title: "10x Sem Juros", text: "Parcelamento" },
    { icon: ShieldCheck, title: "Compra Segura", text: "Prévia de demonstração" },
  ];
  return <div className="trust-bar"><div className="container trust-inner">{items.map(({ icon: Icon, title, text }) => <div className="trust-item" key={title}><span><Icon size={21} /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}</div></div>;
}

function CreditCard({ size = 20 }: { size?: number }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 9h20M6 15h4" /></svg>;
}

export default function Home() {
  const [campaignScreen, setCampaignScreen] = useState<"welcome" | "game1" | "retry" | "game2" | null>(null);
  const [couponWon, setCouponWon] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState(38);
  const [selectedColor, setSelectedColor] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkoutError, setCheckoutError] = useState("");
  const [shipping, setShipping] = useState(SHIPPING[0].id);
  const [showPixDemo, setShowPixDemo] = useState(false);
  const [upsellIndex, setUpsellIndex] = useState(0);
  const [upsellSize, setUpsellSize] = useState(38);
  const [heroSlide, setHeroSlide] = useState(0);
  const [cep, setCep] = useState("");
  const [cepFound, setCepFound] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", cpf: "", phone: "",
    street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingPrice = SHIPPING.find((option) => option.id === shipping)?.price ?? 0;
  const total = subtotal + shippingPrice;
  const currentUpsell = UPSELLS[upsellIndex];

  useEffect(() => {
    if (window.sessionStorage.getItem("olympikus-demo-campaign") === "seen") return;
    const timer = window.setTimeout(() => setCampaignScreen("welcome"), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const dismissCampaign = () => {
    window.sessionStorage.setItem("olympikus-demo-campaign", "seen");
    setCampaignScreen(null);
  };

  const updateForm = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget;
    setCheckoutError("");
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const addToCart = (product: Product, size = selectedSize, alreadyDiscounted = false) => {
    const cartProduct = couponWon && !alreadyDiscounted
      ? { ...product, price: Math.round(product.price * 0.15) }
      : product;
    setCart((items) => {
      const existing = items.find((item) => item.product.id === cartProduct.id && item.size === size);
      if (existing) return items.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [...items, { product: cartProduct, size, quantity: 1 }];
    });
    setNotice(`${cartProduct.name} adicionado à sacola`);
    window.setTimeout(() => setNotice(""), 2600);
    setCartOpen(true);
  };

  const changeQuantity = (productId: string, size: number, delta: number) => {
    setCart((items) => items
      .map((item) => item.product.id === productId && item.size === size ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const goToShop = () => {
    setSelectedProduct(null);
    setCheckoutStep(0);
    setCartOpen(false);
    setSearchOpen(false);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(0);
    setCheckoutStep(0);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseShipping = (id: string) => setShipping(id);

  const nextFromIdentity = () => {
    if (!form.name.trim() || !form.email.includes("@") || form.cpf.replace(/\D/g, "").length < 11 || form.phone.replace(/\D/g, "").length < 10) {
      setCheckoutError("Preencha nome, e-mail, CPF e celular para continuar.");
      return;
    }
    setCheckoutError("");
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextFromDelivery = () => {
    if (cep.replace(/\D/g, "").length !== 8 || !form.street || !form.number || !form.city || !form.state) {
      setCheckoutError("Informe CEP, endereço, número, cidade e estado.");
      return;
    }
    setCheckoutError("");
    setCheckoutStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const searchResults = PRODUCTS.filter((product) => product.name.toLowerCase().includes(searchText.toLowerCase()));
  const launchCheckout = () => {
    setCheckoutStep(1);
    setShowPixDemo(false);
    setCartOpen(false);
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const lookupCep = () => {
    if (cep.replace(/\D/g, "").length !== 8) {
      setCheckoutError("Digite um CEP com 8 números.");
      return;
    }
    setCheckoutError("");
    setCepFound(true);
    setForm((value) => ({ ...value, street: value.street || "Rua Exemplo", neighborhood: value.neighborhood || "Jardim das Flores", city: value.city || "São Paulo", state: value.state || "SP" }));
  };

  const copyDemoCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText("DEMO-OLYMPIKUS-51-NAO-PAGAR");
      setNotice("Código de demonstração copiado");
    } catch {
      setNotice("Código fictício: DEMO-OLYMPIKUS-51-NAO-PAGAR");
    }
    window.setTimeout(() => setNotice(""), 3000);
  }, []);

  return (
    <main className="site-shell">
      <div className="demo-ribbon"><span>PRÉVIA DE DEMONSTRAÇÃO</span><i /> Loja conceitual • nenhum pagamento real é processado</div>
      <header className="site-header">
        <div className="container header-main">
          <button className="icon-button header-side" type="button" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
          <button className="logo-button" type="button" aria-label="Voltar para a loja" onClick={goToShop}><Brand /></button>
          <div className="header-actions">
            <button className="icon-button" type="button" aria-label="Área da conta" onClick={() => setNotice("Prévia: área da conta indisponível")}><UserRound size={22} /></button>
            <button className="icon-button cart-trigger" type="button" aria-label={`Sacola, ${totalItems} itens`} onClick={() => setCartOpen(true)}><ShoppingBag size={22} />{totalItems > 0 && <b className="cart-badge">{totalItems}</b>}</button>
          </div>
        </div>
        <div className="container search-row">
          <input aria-label="Buscar produtos" value={searchText} onFocus={() => setSearchOpen(true)} onChange={(event) => { setSearchText(event.target.value); setSearchOpen(true); }} placeholder="Buscar" />
          <button type="button" aria-label="Buscar" onClick={() => setSearchOpen((open) => !open)}><Search size={21} /></button>
          {searchOpen && searchText && <div className="search-results">{searchResults.length ? searchResults.map((item) => <button key={item.id} type="button" onClick={() => openProduct(item)}><ProductVisual product={item} /><span>{item.name}<small>{brl(item.price)}</small></span><ChevronRight size={18} /></button>) : <p>Nenhum produto encontrado. Tente “Corre”.</p>}</div>}
        </div>
      </header>
      <div className="ticker"><div className="container ticker-inner"><button type="button" aria-label="Mensagem anterior"><ChevronLeft size={15} /></button><span>Frete grátis para todo Brasil <b>•</b> Até 85% OFF em itens selecionados <b>•</b> Troca grátis até 30 dias</span><button type="button" aria-label="Próxima mensagem"><ChevronRight size={15} /></button></div></div>

      {selectedProduct ? (
        <div className="product-page">
          <div className="container">
            <button className="back-link" type="button" onClick={goToShop}><ArrowLeft size={16} /> Voltar para a loja</button>
            <div className="product-detail-grid">
              <div className="product-gallery">
                <ProductVisual product={selectedProduct} large imageIndex={selectedColor} />
                <div className="gallery-thumbs">{selectedProduct.variants.map((variant, n) => <button key={variant.image} className={n === selectedColor ? "selected" : ""} type="button" aria-label={`Ver cor ${variant.label}`} onClick={() => setSelectedColor(n)}><ProductVisual product={selectedProduct} imageIndex={n} /></button>)}</div>
              </div>
              <section className="product-info">
                <span className="eyebrow">TÊNIS OLYMPIKUS</span>
                <h1>{selectedProduct.name}</h1>
                <div className="rating-row"><span className="stars"><Star /><Star /><Star /><Star /><Star /></span><span>(187)</span><span className="muted">Ref. 432046_3-030</span></div>
                <div className="detail-price"><strong>{brl(couponWon ? Math.round(selectedProduct.price * 0.15) : selectedProduct.price)}</strong><del>{brl(selectedProduct.compareAt)}</del><b>-{couponWon ? "85" : Math.round((1 - selectedProduct.price / selectedProduct.compareAt) * 100)}%</b></div>
                <div className="selling-points"><span><i className="green-dot" /> Lançamento</span><span><i className="orange-dot" /> 10% off no Pix</span></div>
                {couponWon && <div className="coupon-applied"><Sparkles size={17} /> Cupom CORRE51 aplicado · 85% OFF</div>}
                <div className="detail-spacer"><Heart size={22} /></div>
                <div className="option-block"><div className="option-title"><b>COR</b><span>{selectedProduct.variants[selectedColor]?.label ?? selectedProduct.colorLabel}</span></div><div className="color-options">{selectedProduct.variants.map((variant, i) => <button type="button" key={variant.image} className={selectedColor === i ? "color-selected" : ""} aria-label={variant.label} title={variant.label} style={{ background: variant.color }} onClick={() => setSelectedColor(i)} />)}</div></div>
                <div className="option-block"><div className="option-title"><b>NUMERAÇÃO</b><button type="button" className="size-guide">Guia de tamanho</button></div><div className="size-grid">{[33, 34, 35, 36, 37, 38, 39, 40, 41, 42].map((size) => <button key={size} type="button" className={selectedSize === size ? "size-selected" : ""} onClick={() => setSelectedSize(size)}>{size}</button>)}</div></div>
                <div className="cep-check"><label htmlFor="product-cep">CALCULAR FRETE</label><div><input id="product-cep" placeholder="00000-000" inputMode="numeric" maxLength={9} /><button type="button" onClick={() => setNotice("Frete grátis disponível para todo o Brasil")}>Calcular</button></div></div>
                <button className="button button-black button-full" type="button" onClick={() => { const variant = selectedProduct.variants[selectedColor] ?? selectedProduct.variants[0]; addToCart({ ...selectedProduct, color: variant.color, colorLabel: variant.label, variants: [variant] }, selectedSize); }}>COMPRAR · {brl(couponWon ? Math.round(selectedProduct.price * 0.15) : selectedProduct.price)}</button>
                <button className="button button-outline button-full add-bag" type="button" onClick={() => { const variant = selectedProduct.variants[selectedColor] ?? selectedProduct.variants[0]; addToCart({ ...selectedProduct, color: variant.color, colorLabel: variant.label, variants: [variant] }, selectedSize); }}>ADICIONAR À SACOLA</button>
              </section>
            </div>
            <section className="details-section"><h2>DETALHES DO PRODUTO</h2><div className="details-card"><h3>Descrição</h3><p>{selectedProduct.description}</p></div><div className="details-card"><h3>Características</h3><ul>{["Cabedal em mesh respirável", "Entressola macia para mais conforto", "Solado com boa aderência", "Drop de 8 mm para transição natural", "Leve para acompanhar seus treinos", "Indicado para corrida e uso diário"].map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul></div></section>
          </div>
        </div>
      ) : null}

      {!selectedProduct && !(checkoutStep > 0 && cart.length > 0 && !cartOpen) && (
        <div className="store-page">
          {!selectedProduct && <div className="container page-anchor" id="loja" />}
          <section className="hero-section">
            <picture className="hero-picture" onClick={() => document.getElementById("colecao")?.scrollIntoView({ behavior: "smooth" })}>
              <source media="(max-width: 640px)" srcSet={`/olympikus/${HERO_SLIDES[heroSlide].mobile}`} />
              <img className="hero-image" src={`/olympikus/${HERO_SLIDES[heroSlide].desktop}`} alt={HERO_SLIDES[heroSlide].alt} />
            </picture>
            <div className="hero-controls"><button type="button" aria-label="Slide anterior" onClick={() => setHeroSlide((heroSlide + HERO_SLIDES.length - 1) % HERO_SLIDES.length)}><ChevronLeft size={18} /></button><span>{String(heroSlide + 1).padStart(2, "0")} <i /> {String(HERO_SLIDES.length).padStart(2, "0")}</span><button type="button" aria-label="Próximo slide" onClick={() => setHeroSlide((heroSlide + 1) % HERO_SLIDES.length)}><ChevronRight size={18} /></button></div>
          </section>

          <section className="collection container" id="colecao">
            <div className="section-title-line"><h2>COLEÇÃO PROMOÇÃO 51 ANOS</h2><a href="#produtos">VER TODOS <ChevronRight size={15} /></a></div>
            <a className="collection-banner" href="#produtos"><img src="/olympikus/banner-para-cada-corrida.png" alt="Para cada corrida, um Corre. Descubra a coleção Olympikus." /></a>
            {couponWon && <div className="coupon-banner"><Sparkles size={18} /><div><b>Seu cupom CORRE51 está ativo</b><span>85% OFF na coleção comemorativa desta demonstração</span></div><button type="button" onClick={() => { setCouponWon(false); setNotice("Cupom removido"); }}>Remover cupom</button></div>}
            <div className="product-section-heading" id="produtos"><div><span className="eyebrow">ESCOLHIDOS PARA VOCÊ</span><h2>Tênis Olympikus</h2></div><button className="filter-button" type="button" onClick={() => setNotice("Mostrando a coleção de aniversário")}><ChevronDown size={16} /> Filtrar</button></div>
            <div className="product-grid">{PRODUCTS.map((product) => {
              const isFavorite = favorites.includes(product.id);
              const shownPrice = couponWon ? Math.round(product.price * 0.15) : product.price;
              return <article className="product-card" key={product.id}>
                <div className="product-card-image" onClick={() => openProduct(product)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") openProduct(product); }}>
                  <ProductVisual product={product} />
                  <span className="product-tag">LANÇAMENTO</span>
                  <button className={`favorite-button ${isFavorite ? "is-favorite" : ""}`} type="button" aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={(event) => { event.stopPropagation(); toggleFavorite(product.id); }}><Heart size={18} fill={isFavorite ? "currentColor" : "none"} /></button>
                  {couponWon && <span className="sale-tag">85% OFF</span>}
                </div>
                <button className="product-title-button" type="button" onClick={() => openProduct(product)}><span className="eyebrow">TÊNIS OLYMPIKUS</span><strong>{product.name}</strong></button>
                <div className="product-meta"><span><i className="orange-dot" /> Lançamento</span><span><i className="green-dot" /> 10% off no Pix</span></div>
                <div className="product-price">Por <strong>{brl(shownPrice)}</strong></div>
                <small className="installments">10x de {brl(Math.round(shownPrice / 10))} sem juros</small>
                <del>De {brl(product.compareAt)}</del>
              </article>;
            })}</div>
          </section>
          <section className="anniversary-strip"><div className="container"><span>DESDE 1975</span><p>51 anos inspirando brasileiros a se moverem.</p><b>VIVA O MOVIMENTO.</b></div></section>
        </div>
      )}

      {menuOpen && <div className="drawer-backdrop" onClick={() => setMenuOpen(false)}><aside className="side-drawer menu-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><Brand /><button className="icon-button" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}><X size={21} /></button></div><p>MENU</p>{["Novidades", "Feminino", "Masculino", "Corrida", "Treino", "Trilha", "Coleção 51 Anos"].map((label) => <button className="menu-link" key={label} type="button" onClick={() => { setMenuOpen(false); document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" }); }}>{label}<ChevronRight size={17} /></button>)}<div className="menu-promo"><span>51 ANOS</span><b>Viva o movimento</b><button type="button" onClick={() => setCampaignScreen("welcome")}>Descubra a campanha</button></div></aside></div>}

      {cartOpen && <div className="drawer-backdrop" onClick={() => setCartOpen(false)}><aside className="side-drawer cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-head"><div><h2>Sua sacola</h2><span>{totalItems} {totalItems === 1 ? "item" : "itens"}</span></div><button className="icon-button" type="button" aria-label="Fechar sacola" onClick={() => setCartOpen(false)}><X size={21} /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={33} /><h3>Sua sacola está vazia</h3><p>Descubra os modelos da coleção 51 anos.</p><button className="button button-black" type="button" onClick={() => setCartOpen(false)}>CONTINUAR COMPRANDO</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.product.id + item.size}><ProductVisual product={item.product} /><div className="cart-item-info"><strong>{item.product.name}</strong><span>{item.product.colorLabel} · Tam. {item.size}</span><b>{brl(item.product.price)}</b><div className="quantity-stepper"><button type="button" aria-label="Diminuir quantidade" onClick={() => changeQuantity(item.product.id, item.size, -1)}><Minus size={14} /></button><span>{item.quantity}</span><button type="button" aria-label="Aumentar quantidade" onClick={() => changeQuantity(item.product.id, item.size, 1)}><Plus size={14} /></button></div></div></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><b>{brl(subtotal)}</b></div><div><span><Truck size={15} /> Frete</span><b className="muted">a calcular</b></div><div className="summary-total"><span>Total</span><b>{brl(subtotal)}</b></div><button className="button button-black button-full" type="button" onClick={launchCheckout}>FINALIZAR PEDIDO <ChevronRight size={17} /></button><p><LockKeyhole size={13} /> Fluxo de checkout demonstrativo</p></div></>}</aside></div>}

      {checkoutStep > 0 && cart.length > 0 && !cartOpen && !selectedProduct && <section className="checkout-page">
        <div className="checkout-secure"><LockKeyhole size={15} /> Prévia segura · pagamento desativado</div>
        <div className="checkout-container">
          <button className="back-link checkout-back" type="button" onClick={() => checkoutStep === 1 ? setCartOpen(true) : setCheckoutStep(checkoutStep - 1)}><ChevronLeft size={16} /> Voltar para {checkoutStep === 1 ? "a sacola" : checkoutStep === 2 ? "Identificação" : "Entrega"}</button>
          <div className="steps-indicator">{["Identificação", "Entrega", "Pagamento"].map((label, i) => <div className={`step-item ${checkoutStep === i + 1 ? "active" : ""} ${checkoutStep > i + 1 ? "complete" : ""}`} key={label}><span>{checkoutStep > i + 1 ? <Check size={15} /> : i + 1}</span><small>{label}</small></div>)}</div>
          <div className="checkout-layout">
            <div className="checkout-form-column">
              <div className="demo-callout"><span>DEMONSTRAÇÃO</span><p>Este checkout é apenas ilustrativo. Nenhum dado será enviado ou armazenado.</p></div>
              {checkoutStep === 1 && <section className="checkout-form"><h1>Quem vai receber?</h1><p className="form-intro">Só o essencial para começar.</p><label>Nome completo<input name="name" autoComplete="name" value={form.name} onChange={updateForm} placeholder="Seu nome completo" /></label><label>E-mail<input type="email" name="email" autoComplete="email" value={form.email} onChange={updateForm} placeholder="voce@email.com" /></label><div className="form-two-cols"><label>CPF<input name="cpf" inputMode="numeric" maxLength={14} value={form.cpf} onChange={updateForm} placeholder="000.000.000-00" /></label><label>Celular<input name="phone" inputMode="tel" maxLength={15} value={form.phone} onChange={updateForm} placeholder="(11) 98765-4321" /></label></div><p className="privacy-hint">No protótipo, seus dados ficam somente no seu navegador durante esta visita.</p>{checkoutError && <p className="form-error">{checkoutError}</p>}<button className="button button-black button-full" type="button" onClick={nextFromIdentity}>CONTINUAR <ChevronRight size={17} /></button></section>}
              {checkoutStep === 2 && <section className="checkout-form"><h1>Onde entregamos?</h1><p className="form-intro">Digite o CEP e complete o restante.</p><label>CEP<div className="cep-input"><input aria-label="CEP" inputMode="numeric" maxLength={9} value={cep} onChange={(event) => { setCep(event.currentTarget.value); setCepFound(false); }} placeholder="00000-000" /><button type="button" onClick={lookupCep}>Buscar CEP</button></div></label>{cepFound && <div className="cep-success"><Check size={15} /> Endereço de demonstração preenchido · São Paulo, SP</div>}<label>Rua / avenida<input name="street" value={form.street} onChange={updateForm} placeholder="Nome da rua" /></label><div className="form-two-cols"><label>Número<input name="number" value={form.number} onChange={updateForm} placeholder="Número" /></label><label>Complemento<input name="complement" value={form.complement} onChange={updateForm} placeholder="Apto, bloco" /></label></div><label>Bairro<input name="neighborhood" value={form.neighborhood} onChange={updateForm} placeholder="Bairro" /></label><div className="form-two-cols"><label>Cidade<input name="city" value={form.city} onChange={updateForm} placeholder="Cidade" /></label><label>UF<input name="state" maxLength={2} value={form.state} onChange={updateForm} placeholder="SP" /></label></div><fieldset className="shipping-options"><legend>ESCOLHA O FRETE</legend>{SHIPPING.map((option) => <label className={`shipping-option ${shipping === option.id ? "shipping-selected" : ""}`} key={option.id}><input type="radio" name="shipping" value={option.id} checked={shipping === option.id} onChange={() => chooseShipping(option.id)} /><span className="shipping-logo"><Truck size={19} /></span><span className="shipping-copy"><b>{option.title}</b><small>{option.detail}</small></span><strong>{option.price === 0 ? "Grátis" : brl(option.price)}</strong></label>)}</fieldset>{checkoutError && <p className="form-error">{checkoutError}</p>}<button className="button button-black button-full" type="button" onClick={nextFromDelivery}>CONTINUAR <ChevronRight size={17} /></button></section>}
          {checkoutStep === 3 && !showPixDemo && <section className="checkout-form payment-step"><div className="upsell-heading"><Sparkles size={17} /><b>85% OFF ANTES DE PAGAR</b><span>{upsellIndex + 1}/9</span></div><div className="upsell-card"><button className="upsell-arrow" type="button" aria-label="Oferta anterior" onClick={() => setUpsellIndex((upsellIndex + 8) % 9)}><ChevronLeft size={19} /></button><OutfitVisual kind={currentUpsell.kind} /><div className="upsell-copy"><span>COLEÇÃO ASSINADA · ÚLTIMAS PEÇAS</span><strong>{currentUpsell.name}</strong><div><b>{brl(Math.round(currentUpsell.price * 0.15))}</b><del>{brl(currentUpsell.compareAt)}</del><i>-85%</i></div></div><button className="upsell-arrow" type="button" aria-label="Próxima oferta" onClick={() => setUpsellIndex((upsellIndex + 1) % 9)}><ChevronRight size={19} /></button><div className="upsell-size"><b>TAMANHO</b><div>{[33, 34, 35, 36, 37, 38, 39].map((size) => <button key={size} className={upsellSize === size ? "selected" : ""} type="button" onClick={() => setUpsellSize(size)}>{size}</button>)}</div></div><button className="button button-soft button-full" type="button" onClick={() => { const offer: Product = { id: `upsell-${upsellIndex}`, name: currentUpsell.name, price: Math.round(currentUpsell.price * 0.15), compareAt: currentUpsell.compareAt, color: "#2039cc", colorLabel: "Azul", category: "Coleção 51 Anos", index: 1, description: "Item demonstrativo da coleção de aniversário.", variants: [{ label: "Azul", color: "#2039cc", image: "" }], visualKind: currentUpsell.kind }; addToCart(offer, upsellSize, true); }}>+ ESCOLHA TAMANHO</button></div>{couponWon && <div className="applied-coupon"><Check size={15} /> Cupom CORRE51 selecionado nesta prévia</div>}<hr /><h1>Pagamento no Pix</h1><p className="form-intro">Ao confirmar, esta demonstração mostrará um QR fictício. Nenhuma cobrança será criada.</p><button className="button button-black button-full" type="button" onClick={() => setShowPixDemo(true)}>SIMULAR PAGAMENTO · {brl(total)} <ChevronRight size={17} /></button><p className="privacy-hint">Seus dados não são enviados para uma operadora de pagamento.</p></section>}
              {checkoutStep === 3 && showPixDemo && <section className="pix-demo-card"><span className="eyebrow">VALOR A PAGAR · DEMONSTRAÇÃO</span><strong className="pix-total">{brl(total)}</strong><div className="fake-qr" aria-label="QR code fictício, não pagável">{Array.from({ length: 121 }, (_, i) => <i key={i} className={((i * 17 + Math.floor(i / 11) * 13 + 5) % 7) < 3 ? "qr-dark" : ""} />)}<b>DEMO</b></div><p className="pix-status"><span /> QR Code fictício. Não é possível realizar pagamento.</p><label className="pix-code-label">CÓDIGO DE DEMONSTRAÇÃO</label><code>DEMO-OLYMPIKUS-51-NAO-PAGAR</code><button className="button button-black button-full" type="button" onClick={copyDemoCode}><Copy size={16} /> COPIAR CÓDIGO FICTÍCIO</button><ol className="pix-instructions"><li>Esta tela não se conecta a um banco.</li><li>O código exibido não é um Pix válido.</li><li>Volte à loja para continuar avaliando o protótipo.</li></ol></section>}
            </div>
            <aside className="order-summary"><span className="eyebrow">RESUMO ({totalItems} {totalItems === 1 ? "ITEM" : "ITENS"})</span>{cart.map((item) => <div className="summary-item" key={item.product.id + item.size}><ProductVisual product={item.product} /><div><b>{item.product.name}</b><small>{item.product.colorLabel} · Tam. {item.size} · {item.quantity}x</small></div><strong>{brl(item.product.price * item.quantity)}</strong></div>)}<div className="summary-line"><span>Subtotal</span><b>{brl(subtotal)}</b></div><div className="summary-line"><span><Truck size={15} /> Frete</span><b className={shippingPrice === 0 ? "price-free" : ""}>{checkoutStep === 1 ? "a calcular" : shippingPrice === 0 ? "Grátis" : brl(shippingPrice)}</b></div><div className="summary-line summary-grand"><span>Total</span><strong>{brl(checkoutStep === 1 ? subtotal : total)}</strong></div></aside>
          </div>
        </div>
      </section>}

      <TrustBar />
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand"><Brand /><p>Inspirando brasileiros a se moverem.</p><div className="social-links"><a href="#instagram" aria-label="Instagram">ig</a><a href="#facebook" aria-label="Facebook">f</a><a href="#youtube" aria-label="YouTube">▶</a></div></div>
          <div><h3>Institucional</h3><a href="#sobre">Sobre nós</a><a href="#lojas">Nossas lojas</a><a href="#trabalhe">Trabalhe conosco</a><a href="#sustentabilidade">Sustentabilidade</a></div>
          <div><h3>Ajuda</h3><a href="#ajuda">Central de Ajuda</a><a href="#trocas">Trocas e Devoluções</a><a href="#pedido">Rastrear Pedido</a><a href="#pagamento">Formas de Pagamento</a></div>
        </div>
        <div className="footer-warning"><div className="container"><strong>ESTA É UMA PRÉVIA DE DEMONSTRAÇÃO</strong><p>Os preços, descontos, produtos e condições desta página são ilustrativos. Nenhum pedido ou pagamento real será processado.</p><hr /><small>Copyright 2026 OLYMPIKUS · Protótipo conceitual para avaliação visual.</small><div><a href="#privacidade">Política de Privacidade</a><a href="#termos">Termos de Uso</a></div></div></div>
      </footer>

      {notice && <div className="toast" role="status"><Check size={16} />{notice}</div>}
      <GameModal key={campaignScreen ?? "closed"} screen={campaignScreen} onClose={dismissCampaign} onStart={() => setCampaignScreen("game1")} onRetry={() => setCampaignScreen("game2")} onWin={() => { setCouponWon(true); dismissCampaign(); document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" }); }} />
    </main>
  );
}
