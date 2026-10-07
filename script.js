const GITHUB_USER = "randomtandomproductions-stack";
const GITHUB_REPO = "puppipyro-website";
const GITHUB_BRANCH = "main";

const RAW_BASE =
    `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

const API_BASE =
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;


/* =========================
   PAGE NAVIGATION
========================= */

function enterSite() {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const menu = document.getElementById("menu-screen");

    if (menu) {
        menu.classList.add("active");
    }
}


function showSection(sectionId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (!section) {
        console.warn(`Section "${sectionId}" was not found.`);
        return;
    }

    section.classList.add("active");

    /*
        Automatically load galleries when opened.
    */

    if (sectionId === "body-sheets") {
        loadBodySheets();
    }

    if (sectionId === "art") {
        loadArt();
    }
}


function backToMenu() {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const menu = document.getElementById("menu-screen");

    if (menu) {
        menu.classList.add("active");
    }
}


/* =========================
   GITHUB IMAGE SYSTEM
========================= */

async function getImagesFromFolder(folder) {
    try {
        const response = await fetch(
            `${API_BASE}/assets/${folder}`
        );

        if (!response.ok) {
            throw new Error(
                `GitHub returned status ${response.status}`
            );
        }

        const files = await response.json();

        return files.filter(file =>
            file.type === "file" &&
            /\.(png|jpe?g|webp|gif)$/i.test(file.name)
        );

    } catch (error) {
        console.error(
            `Could not load images from "${folder}":`,
            error
        );

        return [];
    }
}


/* =========================
   BODY SHEETS
========================= */

async function loadBodySheets() {
    const gallery =
        document.getElementById("body-sheet-gallery");

    if (!gallery) return;

    gallery.innerHTML = `
        <div class="loading-message">
            <span>✦</span>
            SEARCHING THE ALIEN DATABASE...
        </div>
    `;

    const files =
        await getImagesFromFolder("body-sheets");

    if (files.length === 0) {
        gallery.innerHTML = `
            <div class="empty-gallery">

                <div class="empty-icon">✦</div>

                <h2>NO BODY SHEETS YET</h2>

                <p>
                    The alien database is currently empty.
                    Upload a body sheet to the folder
                    and it'll appear here automatically.
                </p>

            </div>
        `;

        return;
    }

    gallery.innerHTML = "";

    files.forEach((file, index) => {
        const card =
            createBodySheetCard(file, index);

        gallery.appendChild(card);
    });
}


function createBodySheetCard(file, index) {
    const card =
        document.createElement("article");

    const filename =
        file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ");

    let tier = "Body Sheet";
    let price = "";

    /*
        Tier is detected from the beginning
        of the filename.

        Example:
        T1-red-demon.png
        T2-green-girl.png
        T3-muscular-man.png
    */

    if (/^t1/i.test(file.name)) {
        tier = "Tier 1 • Simple";
        price = "$10";

    } else if (/^t2/i.test(file.name)) {
        tier = "Tier 2 • Stylized";
        price = "$20";

    } else if (/^t3/i.test(file.name)) {
        tier = "Tier 3 • Realistic";
        price = "$30";
    }


    card.className = "gallery-card";

    card.innerHTML = `
        <button
            class="gallery-image-button"
            onclick="openImageViewer(
                '${file.download_url}',
                '${escapeQuotes(filename)}'
            )"
        >

            <img
                src="${file.download_url}"
                alt="${escapeQuotes(filename)}"
                loading="lazy"
            >

        </button>


        <div class="gallery-card-info">

            <p class="gallery-tier">
                ${tier}
            </p>

            <h2>
                ${filename}
            </h2>

            ${
                price
                    ? `<p class="gallery-price">${price}</p>`
                    : ""
            }


            <button
                class="view-button"
                onclick="openImageViewer(
                    '${file.download_url}',
                    '${escapeQuotes(filename)}'
                )"
            >
                VIEW SHEET
            </button>

        </div>
    `;

    return card;
}


/* =========================
   ART GALLERY
========================= */

async function loadArt() {
    const gallery =
        document.getElementById("art-gallery");

    if (!gallery) return;

    gallery.innerHTML = `
        <div class="loading-message">
            <span>✦</span>
            SEARCHING THE ART ARCHIVE...
        </div>
    `;


    const files =
        await getImagesFromFolder("art");


    if (files.length === 0) {
        gallery.innerHTML = `
            <div class="empty-gallery">

                <div class="empty-icon">✧</div>

                <h2>NO ART YET</h2>

                <p>
                    Upload artwork to the art folder
                    and it'll automatically appear here.
                </p>

            </div>
        `;

        return;
    }


    gallery.innerHTML = "";


    files.forEach(file => {

        const card =
            document.createElement("article");


        const filename =
            file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[-_]+/g, " ");


        card.className = "art-card";


        card.innerHTML = `
            <button
                class="art-image-button"
                onclick="openImageViewer(
                    '${file.download_url}',
                    '${escapeQuotes(filename)}'
                )"
            >

                <img
                    src="${file.download_url}"
                    alt="${escapeQuotes(filename)}"
                    loading="lazy"
                >

            </button>


            <h2>
                ${filename}
            </h2>
        `;


        gallery.appendChild(card);
    });
}


/* =========================
   IMAGE VIEWER
========================= */

function openImageViewer(imageURL, title) {
    const viewer =
        document.getElementById("image-viewer");

    if (!viewer) return;


    const viewerImage =
        document.getElementById("viewer-image");

    const viewerTitle =
        document.getElementById("viewer-title");


    if (viewerImage) {
        viewerImage.src = imageURL;
    }


    if (viewerTitle) {
        viewerTitle.textContent = title;
    }


    viewer.classList.add("active");
}


function closeImageViewer() {
    const viewer =
        document.getElementById("image-viewer");

    if (viewer) {
        viewer.classList.remove("active");
    }
}


/* =========================
   IMAGE VIEWER CLICK-OUTSIDE
========================= */

document.addEventListener("click", function(event) {

    const viewer =
        document.getElementById("image-viewer");

    if (!viewer) return;


    if (
        event.target === viewer
    ) {
        closeImageViewer();
    }

});


/* =========================
   ESCAPE KEY
========================= */

document.addEventListener("keydown", function(event) {

    if (event.key !== "Escape") return;


    const viewer =
        document.getElementById("image-viewer");


    if (
        viewer &&
        viewer.classList.contains("active")
    ) {
        closeImageViewer();
    }

});


/* =========================
   SMALL SECURITY HELPER
========================= */

function escapeQuotes(text) {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================
   INITIAL PAGE STATE
========================= */

document.addEventListener("DOMContentLoaded", function() {

    /*
        Make sure the home screen is visible
        when the website first opens.
    */

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });


    const home =
        document.getElementById("home-screen");


    if (home) {
        home.classList.add("active");
    }

});
