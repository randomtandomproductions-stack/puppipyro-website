/* =========================================================
   PUPPIPYRO.EXE
   MAIN WEBSITE SCRIPT
========================================================= */


/* =========================================================
   WEBSITE SETTINGS
========================================================= */

const GITHUB_USER = "randomtandomproductions-stack";
const GITHUB_REPO = "puppipyro-website";
const GITHUB_BRANCH = "main";

const API_BASE =
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;


/* =========================================================
   PAGE NAVIGATION
========================================================= */

/**
 * Shows one screen and hides every other screen.
 */
function showSection(sectionId) {

    const screens =
        document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });


    const section =
        document.getElementById(sectionId);


    if (!section) {

        console.warn(
            `PUPPIPYRO.EXE: Section "${sectionId}" was not found.`
        );

        return;
    }


    section.classList.add("active");


    /*
       Load dynamic content when necessary.
    */

    if (sectionId === "body-sheets") {
        loadBodySheets();
    }


    if (sectionId === "art") {
        resetArtCategory();
    }


    /*
       Put the user at the top of the newly opened screen.
    */

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   ENTER WEBSITE
========================================================= */

function enterSite() {

    showSection("menu-screen");

}


/* =========================================================
   RETURN TO MAIN MENU
========================================================= */

function backToMenu() {

    showSection("menu-screen");

}


/* =========================================================
   ART CATEGORY DATABASE
========================================================= */

const ART_CATEGORIES = {

    "character-art": {

        folder: "art/character-art",

        title: "CHARACTER ART",

        description:
            "Personal characters and finished character illustrations."

    },


    "gacha-art": {

        folder: "art/gacha-art",

        title: "GACHA ART",

        description:
            "Gacha-based artwork, designs, and creations."

    },


    "body-sheets": {

        folder: "body-sheets",

        title: "BODY SHEETS",

        description:
            "Gacha bodysheets and character bases."

    },


    "animation-edits": {

        folder: "art/animation-edits",

        title: "ANIMATION / EDITS",

        description:
            "Animations, speedpaints, edits, and other moving creations."

    },


    "other": {

        folder: "art/other",

        title: "OTHER",

        description:
            "Everything that doesn't fit neatly into another category."

    }

};


/*
   Used to prevent an older GitHub request from replacing
   a newer category selection.

   Example:

   User clicks Character Art
   then immediately clicks Gacha Art.

   If Character Art takes longer to load, its response
   should NOT overwrite Gacha Art.
*/

let artRequestNumber = 0;


/* =========================================================
   SHOW ART CATEGORY
========================================================= */

async function showArtCategory(categoryId) {

    const category =
        ART_CATEGORIES[categoryId];


    if (!category) {

        console.warn(
            `PUPPIPYRO.EXE: Unknown art category "${categoryId}".`
        );

        return;
    }


    const categoryView =
        document.getElementById("art-category-view");


    const gallery =
        document.getElementById("art-gallery");


    if (!categoryView || !gallery) {

        console.warn(
            "PUPPIPYRO.EXE: Art gallery elements are missing."
        );

        return;
    }


    /*
       Create a unique request ID.
    */

    const requestId =
        ++artRequestNumber;


    /*
       Highlight selected category.
    */

    document
        .querySelectorAll(".category-button")
        .forEach(button => {

            button.classList.remove("selected");

        });


    const clickedButton =
        [...document.querySelectorAll(".category-button")]
            .find(button => {

                const onclick =
                    button.getAttribute("onclick");

                return onclick &&
                    onclick.includes(categoryId);

            });


    if (clickedButton) {

        clickedButton.classList.add("selected");

    }


    /*
       Show category information.
    */

    categoryView.innerHTML = `

        <div class="category-selected">

            <div class="system-label">
                FILE DIRECTORY: ${escapeHTML(
                    category.folder.toUpperCase()
                )}
            </div>

            <h2>
                ${escapeHTML(category.title)}
            </h2>

            <p>
                ${escapeHTML(category.description)}
            </p>

        </div>

    `;


    /*
       Show loading state.
    */

    gallery.innerHTML = `

        <div class="loading-message">

            <span>✦</span>

            SEARCHING THE ALIEN DATABASE...

        </div>

    `;


    /*
       Get files from GitHub.
    */

    const result =
        await getImagesFromFolder(category.folder);


    /*
       If another category was selected while this one
       was loading, abandon this result.
    */

    if (requestId !== artRequestNumber) {
        return;
    }


    /*
       Display GitHub/API errors separately from an
       actually empty folder.
    */

    if (result.error) {

        gallery.innerHTML = `

            <div class="empty-gallery">

                <div class="empty-icon">
                    ✦
                </div>

                <h2>
                    ARCHIVE UNAVAILABLE
                </h2>

                <p>
                    The alien database couldn't access
                    this folder right now.
                </p>

            </div>

        `;

        console.error(
            "PUPPIPYRO.EXE:",
            result.error
        );

        return;
    }


    const files =
        result.files;


    /*
       Empty folder.
    */

    if (files.length === 0) {

        gallery.innerHTML = `

            <div class="empty-gallery">

                <div class="empty-icon">
                    ✦
                </div>

                <h2>
                    NO FILES FOUND
                </h2>

                <p>
                    This alien archive is currently empty.
                    Upload artwork to the matching folder
                    and it'll appear here automatically.
                </p>

            </div>

        `;

        return;
    }


    /*
       Display gallery.
    */

    gallery.innerHTML = "";


    files.forEach((file, index) => {

        const card =
            createArtCard(file, index);

        gallery.appendChild(card);

    });

}


/* =========================================================
   RESET ART CATEGORY
========================================================= */

function resetArtCategory() {

    /*
       Invalidate any currently loading category.
    */

    artRequestNumber++;


    const categoryView =
        document.getElementById("art-category-view");


    const gallery =
        document.getElementById("art-gallery");


    if (categoryView) {

        categoryView.innerHTML = `

            <div class="empty-gallery">

                <div class="empty-icon">
                    ✦
                </div>

                <h2>
                    SELECT A CATEGORY
                </h2>

                <p>
                    Choose an art category above to open
                    the corresponding alien archive.
                </p>

            </div>

        `;

    }


    if (gallery) {

        gallery.innerHTML = "";

    }


    document
        .querySelectorAll(".category-button")
        .forEach(button => {

            button.classList.remove("selected");

        });

}


/* =========================================================
   GITHUB IMAGE SYSTEM
========================================================= */

/**
 * Gets image files from a folder in the GitHub repository.
 *
 * Returns:
 *
 * {
 *     files: [...]
 * }
 *
 * or
 *
 * {
 *     files: [],
 *     error: ...
 * }
 */
async function getImagesFromFolder(folder) {

    const url =
        `${API_BASE}/assets/${folder}`;


    try {

        const response =
            await fetch(url, {
                headers: {
                    "Accept":
                        "application/vnd.github+json"
                }
            });


        /*
           A missing folder is treated as an empty archive.
           This is useful while you're still building folders.
        */

        if (response.status === 404) {

            return {
                files: []
            };

        }


        if (!response.ok) {

            throw new Error(
                `GitHub returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        /*
           GitHub returns an array for a folder.
        */

        if (!Array.isArray(data)) {

            throw new Error(
                "GitHub did not return a folder listing."
            );

        }


        const files =
            data.filter(file => {

                return (
                    file.type === "file" &&
                    /\.(png|jpe?g|webp|gif)$/i.test(file.name)
                );

            });


        /*
           Sort alphabetically so the gallery doesn't
           randomly reorder itself.
        */

        files.sort((a, b) =>
            a.name.localeCompare(
                b.name,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base"
                }
            )
        );


        return {
            files
        };


    } catch (error) {

        console.error(
            `Could not load images from "${folder}":`,
            error
        );


        return {
            files: [],
            error
        };

    }

}


/* =========================================================
   BODY SHEET GALLERY
========================================================= */

let bodySheetRequestNumber = 0;


async function loadBodySheets() {

    const gallery =
        document.getElementById("body-sheet-gallery");


    if (!gallery) {

        console.warn(
            "PUPPIPYRO.EXE: Body-sheet gallery not found."
        );

        return;
    }


    const requestId =
        ++bodySheetRequestNumber;


    gallery.innerHTML = `

        <div class="loading-message">

            <span>✦</span>

            SEARCHING THE ALIEN DATABASE...

        </div>

    `;


    const result =
        await getImagesFromFolder("body-sheets");


    /*
       Prevent old requests from overwriting newer ones.
    */

    if (requestId !== bodySheetRequestNumber) {
        return;
    }


    if (result.error) {

        gallery.innerHTML = `

            <div class="empty-gallery">

                <div class="empty-icon">
                    ✦
                </div>

                <h2>
                    ARCHIVE UNAVAILABLE
                </h2>

                <p>
                    The alien database couldn't access
                    the body-sheet folder right now.
                </p>

            </div>

        `;

        return;
    }


    const files =
        result.files;


    if (files.length === 0) {

        gallery.innerHTML = `

            <div class="empty-gallery">

                <div class="empty-icon">
                    ✦
                </div>

                <h2>
                    NO BODY SHEETS YET
                </h2>

                <p>
                    The alien database is currently empty.
                    Upload a body sheet to the body-sheets
                    folder and it'll appear here automatically.
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


/* =========================================================
   CREATE BODY SHEET CARD
========================================================= */

function createBodySheetCard(file, index) {

    const card =
        document.createElement("article");


    const filename =
        cleanFilename(file.name);


    let tier =
        "Body Sheet";


    let price =
        "";


    /*
       Detect commission tier from filename.

       Examples:

       T1_red_demon.png
       T2_green_girl.png
       T3_deer.png
    */

    if (/^t1(?:[_\-\s]|$)/i.test(file.name)) {

        tier =
            "Tier 1 • Simple";

        price =
            "$10";

    }

    else if (/^t2(?:[_\-\s]|$)/i.test(file.name)) {

        tier =
            "Tier 2 • Stylized";

        price =
            "$20";

    }

    else if (/^t3(?:[_\-\s]|$)/i.test(file.name)) {

        tier =
            "Tier 3 • Realistic";

        price =
            "$30";

    }


    card.className =
        "gallery-card";


    card.innerHTML = `

        <button
            class="gallery-image-button"
            type="button"
            aria-label="View ${escapeHTML(filename)}"
        >

            <img
                src="${escapeHTML(file.download_url)}"
                alt="${escapeHTML(filename)}"
                loading="lazy"
            >

        </button>


        <div class="gallery-card-info">

            <p class="gallery-tier">
                ${escapeHTML(tier)}
            </p>


            <h2>
                ${escapeHTML(filename)}
            </h2>


            ${
                price
                    ? `<p class="gallery-price">${escapeHTML(price)}</p>`
                    : ""
            }


            <button
                class="view-button"
                type="button"
            >
                VIEW SHEET
            </button>

        </div>

    `;


    const imageButton =
        card.querySelector(".gallery-image-button");


    const viewButton =
        card.querySelector(".view-button");


    if (imageButton) {

        imageButton.addEventListener(
            "click",
            () => {

                openImageViewer(
                    file.download_url,
                    filename
                );

            }
        );

    }


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            () => {

                openImageViewer(
                    file.download_url,
                    filename
                );

            }
        );

    }


    return card;

}


/* =========================================================
   CREATE ART CARD
========================================================= */

function createArtCard(file, index) {

    const card =
        document.createElement("article");


    const filename =
        cleanFilename(file.name);


    card.className =
        "art-card";


    card.innerHTML = `

        <button
            class="art-image-button"
            type="button"
            aria-label="View ${escapeHTML(filename)}"
        >

            <img
                src="${escapeHTML(file.download_url)}"
                alt="${escapeHTML(filename)}"
                loading="lazy"
            >

        </button>


        <h2>
            ${escapeHTML(filename)}
        </h2>

    `;


    const imageButton =
        card.querySelector(".art-image-button");


    if (imageButton) {

        imageButton.addEventListener(
            "click",
            () => {

                openImageViewer(
                    file.download_url,
                    filename
                );

            }
        );

    }


    return card;

}


/* =========================================================
   CLEAN FILE NAMES
========================================================= */

function cleanFilename(filename) {

    return String(filename)
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   IMAGE VIEWER
========================================================= */

function openImageViewer(imageURL, title) {

    const viewer =
        document.getElementById("image-viewer");


    const viewerImage =
        document.getElementById("viewer-image");


    const viewerTitle =
        document.getElementById("viewer-title");


    if (!viewer) {

        console.warn(
            "PUPPIPYRO.EXE: Image viewer not found."
        );

        return;
    }


    if (viewerImage) {

        viewerImage.src =
            imageURL;

        viewerImage.alt =
            title || "PuppiPyro artwork";

    }


    if (viewerTitle) {

        viewerTitle.textContent =
            title || "";

    }


    viewer.classList.add("active");


    viewer.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
       Prevent the page underneath from moving while
       the image viewer is open.
    */

    document.body.classList.add(
        "image-viewer-open"
    );

}


/* =========================================================
   CLOSE IMAGE VIEWER
========================================================= */

function closeImageViewer() {

    const viewer =
        document.getElementById("image-viewer");


    if (!viewer) return;


    viewer.classList.remove("active");


    viewer.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "image-viewer-open"
    );


    const viewerImage =
        document.getElementById("viewer-image");


    if (viewerImage) {

        setTimeout(() => {

            if (
                !viewer.classList.contains("active")
            ) {

                viewerImage.removeAttribute("src");

            }

        }, 250);

    }

}


/* =========================================================
   IMAGE VIEWER — OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const viewer =
            document.getElementById("image-viewer");


        if (!viewer) return;


        if (event.target === viewer) {

            closeImageViewer();

        }

    }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key !== "Escape") {
            return;
        }


        const viewer =
            document.getElementById("image-viewer");


        if (
            viewer &&
            viewer.classList.contains("active")
        ) {

            closeImageViewer();

        }

    }
);


/* =========================================================
   SYSTEM MESSAGES
========================================================= */

const SYSTEM_MESSAGES = [

    "SYSTEM ONLINE",

    "ALIEN SIGNAL DETECTED",

    "NEW ART FILE FOUND",

    "PUPPIPYRO.EXE IS RUNNING",

    "COMMISSION DATABASE READY",

    "SPACE WEATHER: SILLY",

    "ALIEN ACTIVITY: NORMAL",

    "TOO MUCH CUTENESS DETECTED"

];


function getRandomSystemMessage() {

    const index =
        Math.floor(
            Math.random() *
            SYSTEM_MESSAGES.length
        );


    return SYSTEM_MESSAGES[index];

}


/* =========================================================
   ALIEN ERROR HOOK
========================================================= */

function showAlienError(message) {

    console.log(
        `ALIEN ERROR: ${message}`
    );

}


/* =========================================================
   ALIEN NOTIFICATION HOOK
========================================================= */

function showAlienNotification(message) {

    console.log(
        `ALIEN NOTIFICATION: ${message}`
    );

}


/* =========================================================
   EASTER EGG HOOK
========================================================= */

function triggerEasterEgg(name) {

    console.log(
        `EASTER EGG FOUND: ${name}`
    );

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(text) {

    const element =
        document.createElement("div");


    element.textContent =
        String(text);


    return element.innerHTML;

}


/* =========================================================
   INITIAL PAGE STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Make sure the site always starts on HOME.
        */

        document
            .querySelectorAll(".screen")
            .forEach(screen => {

                screen.classList.remove("active");

            });


        const home =
            document.getElementById("home-screen");


        if (home) {

            home.classList.add("active");

        }


        /*
           Make sure the image viewer starts closed.
        */

        const viewer =
            document.getElementById("image-viewer");


        if (viewer) {

            viewer.classList.remove("active");

            viewer.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        /*
           Make sure the body isn't locked when the
           site initially loads.
        */

        document.body.classList.remove(
            "image-viewer-open"
        );


        console.log(
            "PUPPIPYRO.EXE // SYSTEM ONLINE"
        );

    }
);
