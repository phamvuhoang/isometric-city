# IsoCity

IsoCity is a open-source isometric city-building simulation game built with **Next.js**, **TypeScript**, and **Tailwind CSS**. It leverages the HTML5 Canvas API for high-performance rendering of isometric graphics, featuring complex systems for economic simulation, trains, planes, seaplanes, helicopters, cars, pedestrians, and more.

![IsoCity Banner](public/readme-image.png)

Made with [Cursor](https://cursor.com)

## Features

-   **Isometric Rendering Engine**: Custom-built rendering system using HTML5 Canvas (`CanvasIsometricGrid`) capable of handling complex depth sorting and layer management.
-   **Dynamic Simulation**:
    -   **Traffic System**: Autonomous vehicles including cars, trains, and aircraft (planes/seaplanes).
    -   **Pedestrian System**: Pathfinding and crowd simulation for city inhabitants.
    -   **Economy & Resources**: Resource management, zoning (Residential, Commercial, Industrial), and city growth logic.
-   **Interactive Grid**: Tile-based placement system for buildings, roads, parks, and utilities.
-   **State Management**: Save/Load functionality for multiple cities.
-   **Responsive Design**: Mobile-friendly interface with specialized touch controls and toolbars.

## Tech Stack

-   **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) components.
-   **Graphics**: HTML5 Canvas API (No external game engine libraries; pure native implementation).
-   **Icons**: Lucide React.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/amilich/isometric-city.git
    cd isometric-city
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the game:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Spin-off Experiences

IsoCity now ships with two relaxing side modes that reuse the isometric canvas:

- **Zen Cityscapes** (`/zen-cityscapes`): Pair a 4x4 merge puzzle with soft city-building so every merge grows a new tiered building on the isometric grid. It is a slow, no-pressure creative loop focused on visual rewards.
- **Starlight Village** (`/starlight-village`): A nighttime fantasy village where you help spirit villagers by playing cozy mini-games (star-catching, potion brewing, etc.). Completing each mini-game lights up a different area of the village with lantern glow.

## Zen Cityscapes

Zen Cityscapes is a relaxing merge-and-build mode that pairs a 4x4 merge puzzle with the isometric renderer.
There is no economy, timers, or fail state; each merge grows the skyline visually.

To play locally after starting the dev server, visit:

```
http://localhost:3000/zen-cityscapes
```

## Contributing

Contributions are welcome! Whether it's reporting a bug, proposing a new feature, or submitting a pull request, your input is valued.

Please ensure your code follows the existing style and conventions.

## License

Distributed under the MIT License. See `LICENSE` for more information.
