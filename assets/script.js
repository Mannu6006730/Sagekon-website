document.addEventListener('DOMContentLoaded', () => {
    // Determine path to root
    const pathToRoot = document.body.getAttribute('data-path-to-root') || './';

    // Function to load HTML components
    const loadComponent = async (id, file) => {
        const placeholder = document.getElementById(id);
        if (!placeholder) return;

        try {
            const response = await fetch(pathToRoot + 'assets/' + file);
            let html = await response.text();
            
            // Replace {{ROOT}} with pathToRoot
            html = html.replace(/{{ROOT}}/g, pathToRoot);
            
            placeholder.innerHTML = html;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
        }
    };

    // Load components and then initialize logic
    Promise.all([
        loadComponent('header-placeholder', 'header.html'),
        loadComponent('footer-placeholder', 'footer.html')
    ]).then(() => {
        initializeInteractiveLogic();
    });

    function initializeInteractiveLogic() {
        // Theme Toggle Logic
        const themeToggle = document.getElementById('theme-toggle');
        const body = document.body;
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        body.setAttribute('data-theme', savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = body.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                body.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }

        // Sticky Header & Scroll Progress
        const headerWrapper = document.querySelector('.header-wrapper');
        const topBar = document.querySelector('.top-bar');
        const topBarHeight = topBar ? topBar.offsetHeight : 0;

        // Create Scroll Progress Bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'scroll-progress-container';
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress-bar';
        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);

        window.addEventListener('scroll', () => {
            // Sticky logic
            if (window.scrollY > topBarHeight) {
                headerWrapper?.classList.add('scrolled');
            } else {
                headerWrapper?.classList.remove('scrolled');
            }

            // Progress logic
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        });

        // Mobile Menu Logic
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        const existingOverlay = document.querySelector('.nav-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        const navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
                navOverlay.classList.toggle('active');
                const icon = menuToggle.querySelector('i');
                if (mainNav.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            });

            navOverlay.addEventListener('click', () => {
                mainNav.classList.remove('active');
                navOverlay.classList.remove('active');
                menuToggle.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
            });

            // Handle dropdowns on mobile
            const navLinksWithDropdown = document.querySelectorAll('.nav-links > li:has(.dropdown)');
            navLinksWithDropdown.forEach(item => {
                const link = item.querySelector('a');
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 992) {
                        const hasDropdown = item.querySelector('.dropdown');
                        if (hasDropdown) {
                            e.preventDefault();
                            item.classList.toggle('active');
                        }
                    }
                });
            });
        }

        // Search Logic (Redirection to Search Page)
        const searchBtn = document.querySelector('.search-btn');
        const searchInput = document.querySelector('.search-bar input');
        const suggestionsBox = document.getElementById('search-suggestions');

        if (searchBtn && searchInput && suggestionsBox) {
            const inventory = [
                { name: "Laptops", category: "Products", icon: "fa-laptop", url: "assets/products/laptops.html" },
                { name: "Business Laptops", category: "Products", icon: "fa-laptop-code", url: "assets/products/laptops.html" },
                { name: "Enterprise Servers", category: "Products", icon: "fa-server", url: "assets/products/servers.html" },
                { name: "Rack Servers", category: "Products", icon: "fa-database", url: "assets/products/servers.html" },
                { name: "Networking Solutions", category: "Products", icon: "fa-network-wired", url: "assets/products/networking.html" },
                { name: "CCTV Surveillance", category: "Products", icon: "fa-video", url: "assets/products/surveillance.html" },
                { name: "IP Cameras", category: "Products", icon: "fa-camera", url: "assets/products/surveillance.html" },
                { name: "VoIP Communication", category: "Products", icon: "fa-phone-volume", url: "assets/products/communication.html" },
                { name: "AMC Contracts", category: "Services", icon: "fa-file-contract", url: "assets/services/amc.html" },
                { name: "Bulk GeM Orders", category: "Services", icon: "fa-boxes-stacked", url: "assets/services/bulk-orders.html" },
                { name: "Hardware Repair", category: "Services", icon: "fa-screwdriver-wrench", url: "assets/services/repair.html" }
            ];

            const performSearch = (val) => {
                const query = (val || searchInput.value).trim().toLowerCase();
                if (!query) return searchInput.focus();

                // Find a direct match in inventory
                const match = inventory.find(item => 
                    item.name.toLowerCase() === query || 
                    query.includes(item.name.toLowerCase()) ||
                    item.name.toLowerCase().includes(query)
                );

                if (match) {
                    window.location.href = pathToRoot + match.url;
                } else {
                    // If no direct match, show a gentle alert or just focus
                    searchInput.placeholder = "Try 'Laptops' or 'AMC'...";
                    searchInput.value = "";
                }
            };

            const showSuggestions = (val) => {
                if (val.length < 2) {
                    suggestionsBox.style.display = 'none';
                    return;
                }

                const matches = inventory.filter(item => 
                    item.name.toLowerCase().includes(val.toLowerCase())
                ).slice(0, 6);

                if (matches.length > 0) {
                    suggestionsBox.innerHTML = matches.map(item => `
                        <div class="suggestion-item" data-url="${item.url}" data-value="${item.name}">
                            <i class="fa-solid ${item.icon}"></i>
                            <div class="suggestion-text">
                                <div class="suggestion-name">${item.name}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">${item.category}</div>
                            </div>
                        </div>
                    `).join('');
                    suggestionsBox.style.display = 'block';
                } else {
                    suggestionsBox.style.display = 'none';
                }
            };

            searchInput.addEventListener('input', (e) => showSuggestions(e.target.value));
            
            suggestionsBox.addEventListener('click', (e) => {
                const item = e.target.closest('.suggestion-item');
                if (item) {
                    const url = item.getAttribute('data-url');
                    window.location.href = pathToRoot + url;
                }
            });

            // Hide suggestions on click outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-bar')) {
                    suggestionsBox.style.display = 'none';
                }
            });

            searchBtn.addEventListener('click', () => performSearch());
            searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });
            
            // Dynamic Placeholder rotation
            const placeholders = ["Search for Laptops...", "Servers & Networking...", "CCTV Surveillance...", "Hardware Repair..."];
            let idx = 0;
            setInterval(() => {
                if (document.activeElement !== searchInput) {
                    searchInput.placeholder = placeholders[idx];
                    idx = (idx + 1) % placeholders.length;
                }
            }, 3000);
        }

        // Dynamic Chat Button Status
        const chatBtn = document.querySelector('.btn-warning');
        if (chatBtn) {
            const status = document.createElement('span');
            status.className = 'online-status';
            chatBtn.style.position = 'relative';
            chatBtn.appendChild(status);
        }

        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });

        // Interaction for category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A' && !e.target.closest('a')) {
                    const link = card.querySelector('a');
                    if (link) link.click();
                }
            });
        });

        // FAQ Accordion Logic
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const header = item.querySelector('.faq-header');
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close other items
                faqItems.forEach(i => i.classList.remove('active'));
                
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }
});