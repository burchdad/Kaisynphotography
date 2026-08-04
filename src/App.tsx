import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Download,
  Image,
  Lock,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StudioPortal = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  publishedGalleryCount: number;
  latestGalleryTitle: string | null;
  latestGalleryUrl: string | null;
  clientPortalUrl: string;
  previewImageUrl: string | null;
};

type StudioDirectoryResponse = {
  studios: StudioPortal[];
};

const ghostProofUrl =
  import.meta.env.VITE_GHOST_PROOF_API_URL?.replace(/\/$/, "") ??
  "https://ghost-proofing.vercel.app";

function App() {
  const [studios, setStudios] = useState<StudioPortal[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function loadStudios() {
      try {
        const response = await fetch(`${ghostProofUrl}/api/public/studios`);
        if (!response.ok) throw new Error("Could not load studio portals.");
        const data = (await response.json()) as StudioDirectoryResponse;
        if (!cancelled) {
          setStudios(data.studios);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    loadStudios();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredStudios = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return studios;
    return studios.filter((studio) =>
      `${studio.name} ${studio.latestGalleryTitle ?? ""}`.toLowerCase().includes(needle),
    );
  }, [query, studios]);

  return (
    <main>
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <img src="/photos/golden-field.jpg" alt="" />
        </div>
        <a className="admin-link" href={`${ghostProofUrl}/login`}>
          <Settings size={15} aria-hidden="true" />
          Studio Admin
        </a>
        <div className="hero__content">
          <div className="brand">
            <Camera size={28} aria-hidden="true" />
            <span>Kaisyn Photography</span>
          </div>
          <h1>Client Proofing Portal</h1>
          <p>
            Choose your photographer, open your private proof gallery, select favorites, and
            complete checkout through Ghost-Proofing. Each studio has its own client space.
          </p>
          <a className="hero__button" href="#studios">
            Find your photographer <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="workflow" aria-label="Proofing workflow">
        <div>
          <Camera aria-hidden="true" />
          <span>Pick your studio</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" />
          <span>View protected proofs</span>
        </div>
        <div>
          <ShoppingBag aria-hidden="true" />
          <span>Order downloads</span>
        </div>
        <div>
          <Download aria-hidden="true" />
          <span>Receive originals</span>
        </div>
      </section>

      <section className="directory" id="studios">
        <div className="directory__header">
          <div>
            <p className="eyebrow">Photographer directory</p>
            <h2>Open the right proofing area</h2>
            <p>
              Galleries are separated by studio, so one photographer’s clients never browse
              another photographer’s proofs from this landing page.
            </p>
          </div>
          <label className="studio-search">
            <Search size={18} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search photographer or gallery"
            />
          </label>
        </div>

        {status === "loading" ? (
          <div className="directory-state">
            <Image aria-hidden="true" />
            <strong>Loading studio portals...</strong>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="directory-state">
            <Lock aria-hidden="true" />
            <strong>Studio portals could not load.</strong>
            <span>Use the admin link to confirm Ghost-Proofing is online.</span>
          </div>
        ) : null}

        {status === "ready" && studios.length === 0 ? (
          <div className="directory-state">
            <CheckCircle2 aria-hidden="true" />
            <strong>No published client portals yet.</strong>
            <span>Publish a gallery in Ghost-Proofing and it will appear here automatically.</span>
          </div>
        ) : null}

        {status === "ready" && studios.length > 0 ? (
          <div className="studio-grid">
            {filteredStudios.map((studio) => (
              <article className="studio-card" key={studio.id}>
                <a href={studio.clientPortalUrl} className="studio-card__media">
                  {studio.previewImageUrl ? (
                    <img src={studio.previewImageUrl} alt="" />
                  ) : (
                    <span>
                      <Camera size={34} aria-hidden="true" />
                    </span>
                  )}
                </a>
                <div className="studio-card__body">
                  <div>
                    <p>{studio.publishedGalleryCount} published gallery{studio.publishedGalleryCount === 1 ? "" : "ies"}</p>
                    <h3>{studio.name}</h3>
                    {studio.latestGalleryTitle ? (
                      <span>Latest: {studio.latestGalleryTitle}</span>
                    ) : null}
                  </div>
                  <div className="studio-card__actions">
                    <a className="studio-card__primary" href={studio.clientPortalUrl}>
                      Client portal <ArrowRight size={17} aria-hidden="true" />
                    </a>
                    {studio.latestGalleryUrl ? (
                      <a className="studio-card__secondary" href={studio.latestGalleryUrl}>
                        Latest gallery
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="integration">
        <div>
          <ShieldCheck aria-hidden="true" />
          <h2>Synced With Ghost-Proofing</h2>
        </div>
        <p>
          This page reads published studios from <code>{ghostProofUrl}/api/public/studios</code>.
          Photographer galleries stay organized in Ghost-Proofing and clients enter through their
          photographer’s own portal link.
        </p>
      </section>
    </main>
  );
}

export default App;
