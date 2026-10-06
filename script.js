function enterSite() {
    document.getElementById("home-screen").classList.remove("active");

    setTimeout(() => {
        document.getElementById("menu-screen").classList.add("active");
    }, 150);
}


function showSection(sectionId) {
    // Hide every screen
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    // Show the section that was clicked
    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }
}


function backToMenu() {
    // Hide every screen
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    // Return to the main menu
    document.getElementById("menu-screen").classList.add("active");
}
