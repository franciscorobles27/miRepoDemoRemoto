import { useEffect, useMemo, useState } from "react";
import "./App.css";

const typeStyles = {
  grass: { gradient: "grass-gradient", chip: "grass-chip" },
  fire: { gradient: "fire-gradient", chip: "fire-chip" },
  water: { gradient: "water-gradient", chip: "water-chip" },
  electric: { gradient: "electric-gradient", chip: "electric-chip" },
  poison: { gradient: "poison-gradient", chip: "poison-chip" },
  bug: { gradient: "bug-gradient", chip: "bug-chip" },
  normal: { gradient: "normal-gradient", chip: "normal-chip" },
  flying: { gradient: "flying-gradient", chip: "flying-chip" },
  ground: { gradient: "ground-gradient", chip: "ground-chip" },
  fairy: { gradient: "fairy-gradient", chip: "fairy-chip" },
  fighting: { gradient: "fighting-gradient", chip: "fighting-chip" },
  psychic: { gradient: "psychic-gradient", chip: "psychic-chip" },
  rock: { gradient: "rock-gradient", chip: "rock-chip" },
  ice: { gradient: "ice-gradient", chip: "ice-chip" },
  dragon: { gradient: "dragon-gradient", chip: "dragon-chip" },
  ghost: { gradient: "ghost-gradient", chip: "ghost-chip" },
};

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
        if (!response.ok) {
          throw new Error("No se pudieron obtener los Pokémon");
        }

        const data = await response.json();

        const details = await Promise.all(
          data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            if (!res.ok) {
              throw new Error(`Error al obtener ${pokemon.name}`);
            }

            const detail = await res.json();
            const mainType = detail.types[0]?.type?.name || "normal";

            return {
              id: detail.id,
              name: detail.name,
              image:
                detail.sprites.other["official-artwork"].front_default ||
                detail.sprites.front_default,
              types: detail.types.map((typeInfo) => typeInfo.type.name),
              mainType,
              hp:
                detail.stats.find((stat) => stat.stat.name === "hp")?.base_stat || 0,
              attack:
                detail.stats.find((stat) => stat.stat.name === "attack")?.base_stat || 0,
              defense:
                detail.stats.find((stat) => stat.stat.name === "defense")?.base_stat || 0,
              speed:
                detail.stats.find((stat) => stat.stat.name === "speed")?.base_stat || 0,
            };
          })
        );

        setPokemons(details);
      } catch (err) {
        setError(err.message || "Ocurrió un error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  const availableTypes = useMemo(() => {
    const allTypes = pokemons.flatMap((pokemon) => pokemon.types);
    return ["all", ...new Set(allTypes)];
  }, [pokemons]);

  const filteredPokemons = useMemo(() => {
    return pokemons.filter((pokemon) => {
      const matchesSearch = pokemon.name.toLowerCase().includes(search.toLowerCase());
      const matchesType =
        selectedType === "all" || pokemon.types.includes(selectedType);

      return matchesSearch && matchesType;
    });
  }, [pokemons, search, selectedType]);

  if (loading) {
    return (
      <main className="app-shell">
        <section className="hero">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />
          <h1 className="hero-title">Pokédex Elite</h1>
          <p className="hero-subtitle">Cargando tus 20 Pokémon...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="app-shell">
        <section className="hero">
          <h1 className="hero-title">Pokédex Elite</h1>
          <p className="hero-subtitle error-text">{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />

        <p className="eyebrow">React + PokéAPI</p>
        <h1 className="hero-title">Pokédex Elite</h1>
        <p className="hero-subtitle">
          Diseño premium, responsivo y con filtros para explorar tus Pokémon.
        </p>

        <div className="controls">
          <input
            type="text"
            placeholder="Buscar Pokémon..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="type-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "Todos los tipos" : type}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="results-bar">
        <p>
          Mostrando <strong>{filteredPokemons.length}</strong> de <strong>{pokemons.length}</strong> Pokémon
        </p>
      </section>

      <section className="cards-grid">
        {filteredPokemons.map((pokemon) => {
          const styles = typeStyles[pokemon.mainType] || {
            gradient: "default-gradient",
            chip: "default-chip",
          };

          return (
            <article
              key={pokemon.id}
              className={`pokemon-card ${styles.gradient}`}
            >
              <div className="card-shine" />

              <div className="pokemon-card-top">
                <span className="pokemon-number">
                  #{String(pokemon.id).padStart(3, "0")}
                </span>
                <div className="pokemon-types">
                  {pokemon.types.map((type) => {
                    const chipClass = typeStyles[type]?.chip || "default-chip";

                    return (
                      <span key={type} className={`pokemon-chip ${chipClass}`}>
                        {type}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="pokemon-image-wrap">
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="pokemon-image"
                />
              </div>

              <div className="pokemon-content">
                <h2 className="pokemon-name">
                  {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                </h2>

                <div className="stats-grid">
                  <div className="stat-box">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">{pokemon.hp}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">ATK</span>
                    <span className="stat-value">{pokemon.attack}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">DEF</span>
                    <span className="stat-value">{pokemon.defense}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">SPD</span>
                    <span className="stat-value">{pokemon.speed}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default App;
