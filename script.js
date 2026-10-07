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

const RAW_BASE =
    `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

const API_BASE =
    `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;


/* =========================================================
   SECRET EVENT SETTINGS
========================================================= */

/*
   This event is intentionally controlled entirely from here.

   Anyone who visits the website during the correct date/time
   window can encounter it.

   Change these values whenever you want a new secret event.

   IMPORTANT:
   Months are numbered normally here:
   January = 1
   February = 2
   ...
   October = 10
   December = 12
*/

const SECRET_EVENT = {

    enabled: true,

    year: 2026,

    month: 10,

    day: 31,

    startHour: 19,

    startMinute: 0,

    endHour: 20,

    endMinute: 0,

    code: "ALIEN15",

    durationMinutes: 1

};


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showSection(sectionId) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });


    const section =
        document.getElementById(sectionId);


    if (!section) {

        console.warn(
            `Section "${sectionId}" was not found.`
        );

        return;
    }


    section.classList.add("active");


    /*
       Load the appropriate content when the page opens.
    */

    if (sectionId === "body-sheets") {
        loadBodySheets();
    }


    if (sectionId === "art") {
        resetArtCategory();
    }

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
   ART CATEGORY SYSTEM
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


/* =========================================================
   SHOW ART CATEGORY
========================================================= */

async function showArtCategory(categoryId) {

    const category =
        ART_CATEGORIES[categoryId];


    if (!category) {

        console.warn(
            `Unknown art category: ${categoryId}`
        );

        return;
    }


    const categoryView =
        document.getElementById("art-category-view");

    const gallery =
        document.getElementById("art-gallery");


    if (!categoryView || !gallery) return;


    /*
       Highlight selected category.
    */

    document.querySelectorAll(".category-button").forEach(button => {
        button.classList.remove("selected");
    });


    const clickedButton =
        [...document.querySelectorAll(".category-button")]
            .find(button =>
                button.getAttribute("onclick")?.includes(categoryId)
            );


    if (clickedButton) {
        clickedButton.classList.add("selected");
    }


    categoryView.innerHTML = `

        <div class="category-selected">

            <div class="system-label">
                FILE DIRECTORY: ${category.folder.toUpperCase()}
            </div>

            <h2>
                ${category.title}
            </h2>

            <p>
                ${category.description}
            </p>

        </div>

    `;


    gallery.innerHTML = `

        <div class="loading-message">

            <span>✦</span>

            SEARCHING THE ALIEN DATABASE...

        </div>

    `;


    const files =
        await getImagesFromFolder(category.folder);


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


    document.querySelectorAll(".category-button").forEach(button => {
        button.classList.remove("selected");
    });

}


/* =========================================================
   GITHUB IMAGE SYSTEM
========================================================= */

async function getImagesFromFolder(folder) {

    try {

        const response =
            await fetch(
                `${API_BASE}/assets/${folder}`
            );


        if (!response.ok) {

            throw new Error(
                `GitHub returned status ${response.status}`
            );

        }


        const files =
            await response.json();


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


/* =========================================================
   BODY SHEET GALLERY
========================================================= */

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


    if (/^t1/i.test(file.name)) {

        tier =
            "Tier 1 • Simple";

        price =
            "$10";

    }

    else if (/^t2/i.test(file.name)) {

        tier =
            "Tier 2 • Stylized";

        price =
            "$20";

    }

    else if (/^t3/i.test(file.name)) {

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
                src="${file.download_url}"
                alt="${escapeHTML(filename)}"
                loading="lazy"
            >

        </button>


        <div class="gallery-card-info">

            <p class="gallery-tier">
                ${tier}
            </p>


            <h2>
                ${escapeHTML(filename)}
            </h2>


            ${
                price
                    ? `<p class="gallery-price">${price}</p>`
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


    imageButton.addEventListener("click", () => {

        openImageViewer(
            file.download_url,
            filename
        );

    });


    viewButton.addEventListener("click", () => {

        openImageViewer(
            file.download_url,
            filename
        );

    });


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
                src="${file.download_url}"
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


    imageButton.addEventListener("click", () => {

        openImageViewer(
            file.download_url,
            filename
        );

    });


    return card;

}


/* =========================================================
   CLEAN FILE NAMES
========================================================= */

function cleanFilename(filename) {

    return filename
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


    if (!viewer) return;


    if (viewerImage) {

        viewerImage.src =
            imageURL;

        viewerImage.alt =
            title;

    }


    if (viewerTitle) {

        viewerTitle.textContent =
            title;

    }


    viewer.classList.add("active");


    viewer.setAttribute(
        "aria-hidden",
        "false"
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


    const viewerImage =
        document.getElementById("viewer-image");


    if (viewerImage) {

        /*
           Clear the image after closing.
           This prevents large images from staying loaded
           unnecessarily.
        */

        setTimeout(() => {

            if (
                !viewer.classList.contains("active")
            ) {

                viewerImage.src = "";

            }

        }, 250);

    }

}


/* =========================================================
   IMAGE VIEWER CLICK OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const viewer =
            document.getElementById("image-viewer");


        if (!viewer) return;


        if (
            event.target === viewer
        ) {

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

        if (event.key !== "Escape") return;


        const viewer =
            document.getElementById("image-viewer");


        if (
            viewer &&
            viewer.classList.contains("active")
        ) {

            closeImageViewer();

        }


        const secretPopup =
            document.getElementById("secret-code-popup");


        if (
            secretPopup &&
            secretPopup.classList.contains("active")
        ) {

            closeSecretCode();

        }

    }
);


/* =========================================================
   SECRET EVENT
========================================================= */

/*
   The event checks the visitor's LOCAL computer time.

   This means:
   - No server is required.
   - No login is required.
   - Anyone visiting during the event window can see it.
   - The event automatically disappears when the time window ends.
*/

function checkSecretEvent() {

    if (!SECRET_EVENT.enabled) {
        return;
    }


    const now =
        new Date();


    const correctDate =
        now.getFullYear() === SECRET_EVENT.year &&
        now.getMonth() + 1 === SECRET_EVENT.month &&
        now.getDate() === SECRET_EVENT.day;


    if (!correctDate) {
        hideSecretEvent();
        return;
    }


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const startMinutes =
        SECRET_EVENT.startHour * 60 +
        SECRET_EVENT.startMinute;


    const endMinutes =
        SECRET_EVENT.endHour * 60 +
        SECRET_EVENT.endMinute;


    const eventIsActive =
        currentMinutes >= startMinutes &&
        currentMinutes < endMinutes;


    if (eventIsActive) {

        showSecretEvent();

    }

    else {

        hideSecretEvent();

    }

}


/* =========================================================
   SHOW SECRET EVENT
========================================================= */

function showSecretEvent() {

    const event =
        document.getElementById("secret-event");


    if (!event) return;


    if (
        event.classList.contains("active")
    ) {
        return;
    }


    event.classList.add("active");


    event.setAttribute(
        "aria-hidden",
        "false"
    );


    startSecretPyroAnimation();

}


/* =========================================================
   HIDE SECRET EVENT
========================================================= */

function hideSecretEvent() {

    const event =
        document.getElementById("secret-event");


    if (!event) return;


    event.classList.remove("active");


    event.setAttribute(
        "aria-hidden",
        "true"
    );


    stopSecretPyroAnimation();

}


/* =========================================================
   SECRET PYRO ANIMATION
========================================================= */

let secretPyroTimer =
    null;


function startSecretPyroAnimation() {

    const pyro =
        document.getElementById("secret-pyro");


    if (!pyro) return;


    pyro.classList.add("running");


    /*
       Re-trigger the animation periodically.

       CSS handles the actual movement.
    */

    if (secretPyroTimer) {
        clearInterval(secretPyroTimer);
    }


    secretPyroTimer =
        setInterval(() => {

            const event =
                document.getElementById("secret-event");


            if (
                !event ||
                !event.classList.contains("active")
            ) {
                return;
            }


            pyro.classList.remove("running");


            void pyro.offsetWidth;


            pyro.classList.add("running");

        }, 12000);

}


/* =========================================================
   STOP SECRET PYRO ANIMATION
========================================================= */

function stopSecretPyroAnimation() {

    const pyro =
        document.getElementById("secret-pyro");


    if (pyro) {
        pyro.classList.remove("running");
    }


    if (secretPyroTimer) {

        clearInterval(
            secretPyroTimer
        );

        secretPyroTimer =
            null;

    }

}


/* =========================================================
   SECRET PYRO CLICK
========================================================= */

function revealSecretCode() {

    const popup =
        document.getElementById("secret-code-popup");


    const codeElement =
        document.getElementById("secret-code");


    if (!popup) return;


    if (codeElement) {

        codeElement.textContent =
            SECRET_EVENT.code;

    }


    popup.classList.add("active");


    popup.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   CLOSE SECRET CODE
========================================================= */

function closeSecretCode() {

    const popup =
        document.getElementById("secret-code-popup");


    if (!popup) return;


    popup.classList.remove("active");


    popup.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   SECRET POPUP CLICK OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const popup =
            document.getElementById("secret-code-popup");


        if (!popup) return;


        if (
            event.target === popup
        ) {

            closeSecretCode();

        }

    }
);


/* =========================================================
   CONNECT SECRET PYRO BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const secretPyro =
            document.getElementById("secret-pyro");


        if (secretPyro) {

            secretPyro.addEventListener(
                "click",
                revealSecretCode
            );

        }

    }
);


/* =========================================================
   RANDOM SYSTEM MESSAGE HOOK
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
   FUTURE ERROR POPUP HOOK
========================================================= */

function showAlienError(message) {

    /*
       This is intentionally simple for now.

       Later, the website can have actual fake
       computer error windows using this function.
    */

    console.log(
        `ALIEN ERROR: ${message}`
    );

}


/* =========================================================
   FUTURE NOTIFICATION HOOK
========================================================= */

function showAlienNotification(message) {

    /*
       Reserved for future fake system notifications.
    */

    console.log(
        `ALIEN NOTIFICATION: ${message}`
    );

}


/* =========================================================
   FUTURE EASTER EGG HOOK
========================================================= */

function triggerEasterEgg(name) {

    console.log(
        `EASTER EGG FOUND: ${name}`
    );

}


/* =========================================================
   HTML SAFETY HELPERS
========================================================= */

function escapeHTML(text) {

    const element =
        document.createElement("div");


    element.textContent =
        text;


    return element.innerHTML;

}


/* =========================================================
   INITIAL PAGE STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
           Start on HOME.
        */

        document.querySelectorAll(".screen").forEach(screen => {

            screen.classList.remove("active");

        });


        const home =
            document.getElementById("home-screen");


        if (home) {

            home.classList.add("active");

        }


        /*
           Start the secret event checker.
        */

        checkSecretEvent();


        /*
           Check again every 10 seconds.

           This means someone can leave the page open
           and the secret event can appear when the
           correct time begins.
        */

        setInterval(
            checkSecretEvent,
            10000
        );

    }
);
