import cityscape from "../assets/auth/toronto-rooftops.webp";
import cityscapeMobile from "../assets/auth/toronto-rooftops-mobile.webp";
import AuthIcon from "./AuthIcon";

export default function AuthCityPanel() {
  return (
    <aside className="auth-city" aria-label="Student housing in Toronto">
      <picture>
        <source media="(max-width: 700px)" srcSet={cityscapeMobile} />
        <img
          src={cityscape}
          alt=""
          fetchPriority="high"
          width="1200"
          height="1500"
        />
      </picture>
      <div className="auth-city-top">
        <span className="auth-location">
          <AuthIcon name="pin" /> Toronto, Ontario
        </span>
        <svg
          className="auth-compass"
          viewBox="0 0 32 46"
          width="32"
          height="46"
          aria-hidden="true"
        >
          <path
            d="M13 9V2l6 7V2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="m16 15 9 25-9-6-9 6Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path d="M16 15v19l-9 6Z" fill="currentColor" />
        </svg>
      </div>
      <div className="auth-city-story">
        <h2>
          Find your place{" "}
          <span>
            in <em>Toronto.</em>
          </span>
        </h2>
        <p>
          Compare student housing, explore neighbourhoods, and find a commute
          that fits your day.
        </p>
      </div>
      <ul className="auth-city-features">
        <li>
          <AuthIcon name="compare" />
          Compare homes
        </li>
        <li>
          <AuthIcon name="route" />
          Explore commutes
        </li>
        <li>
          <AuthIcon name="bookmark" />
          Save favourites
        </li>
      </ul>
    </aside>
  );
}
