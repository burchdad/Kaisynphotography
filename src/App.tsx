import {
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Heart,
  Image,
  Lock,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Photo = {
  id: string;
  title: string;
  category: "Senior" | "Family" | "Sports" | "Portrait";
  session: string;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "Digital" | "Print" | "Collection";
};

type CartItem = {
  photoId: string;
  productId: string;
  quantity: number;
};

const photos: Photo[] = [
  {
    id: "kp-1042",
    title: "Golden Field Portrait",
    category: "Senior",
    session: "Class of 2026",
    imageUrl: "/photos/golden-field.jpg",
  },
  {
    id: "kp-1188",
    title: "Sideline Victory",
    category: "Sports",
    session: "Fall Athletics",
    imageUrl: "/photos/sideline-victory.jpg",
  },
  {
    id: "kp-1224",
    title: "Family Walk",
    category: "Family",
    session: "Autumn Mini",
    imageUrl: "/photos/family-walk.jpg",
  },
  {
    id: "kp-1309",
    title: "Studio Classic",
    category: "Portrait",
    session: "Headshots",
    imageUrl: "/photos/studio-classic.jpg",
  },
  {
    id: "kp-1450",
    title: "Cap And Gown",
    category: "Senior",
    session: "Graduation",
    imageUrl: "/photos/cap-and-gown.jpg",
  },
  {
    id: "kp-1512",
    title: "Game Day Focus",
    category: "Sports",
    session: "Team Media Day",
    imageUrl: "/photos/game-day.jpg",
  },
];

const products: Product[] = [
  {
    id: "digital",
    name: "High-res download",
    description: "Retouched file delivered after payment approval.",
    price: 18,
    type: "Digital",
  },
  {
    id: "print-5x7",
    name: "5 x 7 print",
    description: "Professional print with color correction.",
    price: 12,
    type: "Print",
  },
  {
    id: "print-8x10",
    name: "8 x 10 print",
    description: "Archival print packed for pickup or delivery.",
    price: 20,
    type: "Print",
  },
  {
    id: "collection",
    name: "Digital + print bundle",
    description: "High-res download plus one 8 x 10 print.",
    price: 32,
    type: "Collection",
  },
];

const categories = ["All", "Senior", "Family", "Sports", "Portrait"] as const;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function App() {
  const [selectedPhotoId, setSelectedPhotoId] = useState(photos[0].id);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    delivery: "Digital delivery",
    notes: "",
  });

  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? photos[0];
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[0];

  const filteredPhotos = useMemo(() => {
    return photos.filter((photo) => {
      const matchesCategory = activeCategory === "All" || photo.category === activeCategory;
      const text = `${photo.title} ${photo.session} ${photo.id}`.toLowerCase();
      return matchesCategory && text.includes(query.trim().toLowerCase());
    });
  }, [activeCategory, query]);

  const cartTotal = cart.reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = () => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.photoId === selectedPhotoId && item.productId === selectedProductId,
      );

      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...current, { photoId: selectedPhotoId, productId: selectedProductId, quantity: 1 }];
    });
  };

  const updateQuantity = (photoId: string, productId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.photoId === photoId && item.productId === productId ? { ...item, quantity } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const toggleFavorite = (photoId: string) => {
    setFavorites((current) =>
      current.includes(photoId) ? current.filter((id) => id !== photoId) : [...current, photoId],
    );
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderStatus("");

    const payload = {
      customer,
      items: cart.map((item) => ({
        imageId: item.photoId,
        productId: item.productId,
        quantity: item.quantity,
      })),
      source: "kaisynphotography-web",
      requestedAt: new Date().toISOString(),
    };

    const apiUrl = import.meta.env.VITE_GHOST_PROOF_API_URL;

    if (!apiUrl) {
      localStorage.setItem("kaisyn-order-draft", JSON.stringify(payload));
      setOrderStatus(
        "Order draft saved locally. Add VITE_GHOST_PROOF_API_URL to send it to Ghost-Proof checkout.",
      );
      return;
    }

    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setOrderStatus("Ghost-Proof could not create the checkout yet. Please try again.");
      return;
    }

    const data = (await response.json()) as { checkoutUrl?: string; orderId?: string };
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }

    setOrderStatus(`Order ${data.orderId ?? "received"} was sent to Ghost-Proof.`);
    setCart([]);
  };

  return (
    <main>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <img src={photos[0].imageUrl} alt="" />
        </div>
        <div className="hero__content">
          <div className="brand">
            <Camera size={28} aria-hidden="true" />
            <span>Kaisyn Photography</span>
          </div>
          <h1>Client Gallery & Ordering</h1>
          <p>
            Browse protected proofs, choose your favorites, build a print or download order,
            and send it through Ghost-Proof for watermark release, payment, and fulfillment.
          </p>
          <a className="hero__button" href="#gallery">
            Start selecting <ChevronRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="workflow" aria-label="Ordering workflow">
        <div>
          <ShieldCheck aria-hidden="true" />
          <span>Watermarked previews</span>
        </div>
        <div>
          <ShoppingBag aria-hidden="true" />
          <span>Select products</span>
        </div>
        <div>
          <CreditCard aria-hidden="true" />
          <span>Ghost-Proof checkout</span>
        </div>
        <div>
          <Download aria-hidden="true" />
          <span>Release originals</span>
        </div>
      </section>

      <section className="app-grid" id="gallery">
        <aside className="panel controls" aria-label="Gallery filters">
          <div className="section-heading">
            <span>Find Photos</span>
            <Search size={18} aria-hidden="true" />
          </div>
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ID, session, or title"
            />
          </label>
          <div className="tabs" aria-label="Filter by session category">
            {categories.map((category) => (
              <button
                key={category}
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          <div className="upload-box">
            <UploadCloud aria-hidden="true" />
            <strong>Ghost-Proof ready</strong>
            <span>Connect image IDs to watermarked proofs and paid originals.</span>
          </div>
        </aside>

        <section className="gallery" aria-label="Proof gallery">
          {filteredPhotos.map((photo) => (
            <button
              type="button"
              key={photo.id}
              className={`photo-tile ${selectedPhotoId === photo.id ? "selected" : ""}`}
              onClick={() => setSelectedPhotoId(photo.id)}
            >
              <img src={photo.imageUrl} alt={photo.title} />
              <span className="watermark">KAISYN PROOF</span>
              <span className="photo-meta">
                <strong>{photo.title}</strong>
                <small>{photo.id}</small>
              </span>
            </button>
          ))}
        </section>

        <aside className="panel order-panel" aria-label="Order builder">
          <div className="preview">
            <img src={selectedPhoto.imageUrl} alt={selectedPhoto.title} />
            <span className="watermark watermark--large">KAISYN PROOF</span>
            <button
              className={`icon-button ${favorites.includes(selectedPhoto.id) ? "liked" : ""}`}
              type="button"
              onClick={() => toggleFavorite(selectedPhoto.id)}
              aria-label="Save favorite"
              title="Save favorite"
            >
              <Heart size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="photo-details">
            <span>{selectedPhoto.session}</span>
            <h2>{selectedPhoto.title}</h2>
            <p>{selectedPhoto.id}</p>
          </div>

          <div className="product-list">
            {products.map((product) => (
              <button
                type="button"
                key={product.id}
                className={selectedProductId === product.id ? "product active" : "product"}
                onClick={() => setSelectedProductId(product.id)}
              >
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.description}</small>
                </span>
                <b>{currency.format(product.price)}</b>
              </button>
            ))}
          </div>

          <button className="add-button" type="button" onClick={addToCart}>
            <Plus size={18} aria-hidden="true" />
            Add {selectedProduct.type.toLowerCase()}
          </button>
        </aside>
      </section>

      <section className="checkout" aria-label="Checkout">
        <div className="checkout__summary">
          <div className="section-heading">
            <span>Order</span>
            <PackageCheck size={18} aria-hidden="true" />
          </div>
          {cart.length === 0 ? (
            <p className="empty">Your selected images and products will appear here.</p>
          ) : (
            <div className="cart-list">
              {cart.map((item) => {
                const photo = photos.find((entry) => entry.id === item.photoId);
                const product = products.find((entry) => entry.id === item.productId);
                if (!photo || !product) return null;

                return (
                  <div className="cart-item" key={`${item.photoId}-${item.productId}`}>
                    <img src={photo.imageUrl} alt={photo.title} />
                    <div>
                      <strong>{photo.title}</strong>
                      <span>
                        {product.name} · {currency.format(product.price)}
                      </span>
                    </div>
                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.photoId, item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        title="Decrease quantity"
                      >
                        <Minus size={15} aria-hidden="true" />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.photoId, item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        title="Increase quantity"
                      >
                        <Plus size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="total">
            <span>{cartCount} item{cartCount === 1 ? "" : "s"}</span>
            <strong>{currency.format(cartTotal)}</strong>
          </div>
        </div>

        <form className="checkout__form" onSubmit={submitOrder}>
          <div className="section-heading">
            <span>Customer Details</span>
            <Lock size={18} aria-hidden="true" />
          </div>
          <div className="form-grid">
            <label>
              Name
              <input
                value={customer.name}
                onChange={(event) => setCustomer({ ...customer, name: event.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={customer.email}
                onChange={(event) => setCustomer({ ...customer, email: event.target.value })}
                required
              />
            </label>
            <label>
              Phone
              <input
                value={customer.phone}
                onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
              />
            </label>
            <label>
              Delivery
              <select
                value={customer.delivery}
                onChange={(event) => setCustomer({ ...customer, delivery: event.target.value })}
              >
                <option>Digital delivery</option>
                <option>Local pickup</option>
                <option>Ship prints</option>
              </select>
            </label>
          </div>
          <label>
            Notes
            <textarea
              value={customer.notes}
              onChange={(event) => setCustomer({ ...customer, notes: event.target.value })}
              placeholder="Retouching requests, school/team name, deadline, or pickup notes"
            />
          </label>
          <button className="checkout-button" type="submit" disabled={cart.length === 0}>
            <CreditCard size={18} aria-hidden="true" />
            Send to Ghost-Proof checkout
          </button>
          {orderStatus && (
            <p className="status">
              <Check size={17} aria-hidden="true" />
              {orderStatus}
            </p>
          )}
        </form>
      </section>

      <section className="integration">
        <div>
          <Sparkles aria-hidden="true" />
          <h2>Ghost-Proof Frontend Contract</h2>
        </div>
        <p>
          Set <code>VITE_GHOST_PROOF_API_URL</code> in Vercel. Checkout posts to
          <code>/orders</code> with customer details, image IDs, products, quantities, and source.
          Ghost-Proof can respond with <code>checkoutUrl</code> to redirect into payment.
        </p>
        <div className="contract">
          <span><Image size={16} aria-hidden="true" /> imageId</span>
          <span><ShoppingBag size={16} aria-hidden="true" /> productId</span>
          <span><CreditCard size={16} aria-hidden="true" /> checkoutUrl</span>
          <span><ShieldCheck size={16} aria-hidden="true" /> watermark release</span>
        </div>
      </section>
    </main>
  );
}

export default App;
