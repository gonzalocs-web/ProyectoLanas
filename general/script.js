document.addEventListener("DOMContentLoaded", () => {
    // Scroll function for "scrollCompra"
    const scrollCompraBtn = document.getElementById("scrollCompra");
    if (scrollCompraBtn) {
        scrollCompraBtn.addEventListener("click", () => {
            const productosSection = document.getElementById("productos");
            if (productosSection) {
                productosSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // Pagination logic
    const itemsPerPage = 6;
    let currentPage = 1;
    const products = Array.from(document.querySelectorAll(".cardprod"));
    const paginationContainer = document.getElementById("pagination");

    if (products.length > 0 && paginationContainer) {
        const totalPages = Math.ceil(products.length / itemsPerPage);

        function showPage(page) {
            currentPage = page;

            // Hide/Show products
            products.forEach((product, index) => {
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                if (index >= startIndex && index < endIndex) {
                    product.style.display = "flex";
                } else {
                    product.style.display = "none";
                }
            });

            // Re-render pagination buttons
            renderPagination();
        }

        function renderPagination() {
            paginationContainer.innerHTML = "";

            if (totalPages <= 1) return; // No pagination needed if 1 page or less

            // Previous button
            const prevBtn = document.createElement("button");
            prevBtn.className = "pagination-btn";
            prevBtn.innerHTML = "&laquo;"; // << symbol
            prevBtn.disabled = currentPage === 1;
            prevBtn.addEventListener("click", () => {
                showPage(currentPage - 1);
                scrollToProducts();
            });
            paginationContainer.appendChild(prevBtn);

            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                const pageBtn = document.createElement("button");
                pageBtn.className = `pagination-btn${currentPage === i ? " active" : ""}`;
                pageBtn.innerText = i;
                pageBtn.addEventListener("click", () => {
                    showPage(i);
                    scrollToProducts();
                });
                paginationContainer.appendChild(pageBtn);
            }

            // Next button
            const nextBtn = document.createElement("button");
            nextBtn.className = "pagination-btn";
            nextBtn.innerHTML = "&raquo;"; // >> symbol
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.addEventListener("click", () => {
                showPage(currentPage + 1);
                scrollToProducts();
            });
            paginationContainer.appendChild(nextBtn);
        }

        function scrollToProducts() {
            const productosSection = document.getElementById("productos");
            if (productosSection) {
                // Scroll to the top of the products section
                productosSection.scrollIntoView({ behavior: "smooth" });
            }
        }

        // Initialize first page
        showPage(1);
    }

    // Form submission to email (directly from the page via FormSubmit AJAX)
    const contactForm = document.querySelector(".card_user form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector(".boton_contacto_user");
            const originalBtnText = submitBtn.innerText;
            
            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerText = "Enviando...";
            
            // Gather inputs
            const nombre = document.getElementById("nombre").value;
            const apellido = document.getElementById("apellido").value;
            const email = document.getElementById("email").value;
            const telefono = document.getElementById("telefono").value;
            const opinion = document.getElementById("opinion").value;

            // Remove any existing status message
            const existingStatus = contactForm.querySelector(".form-status-msg");
            if (existingStatus) {
                existingStatus.remove();
            }

            // Send AJAX request
            fetch("https://formsubmit.co/ajax/gonzalocabanas02@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    Nombre: nombre,
                    Apellido: apellido,
                    Email: email,
                    Telefono: telefono,
                    "Consulta/Opinión": opinion,
                    _subject: "Consulta"
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Error en la respuesta del servidor");
                }
            })
            .then(data => {
                // Success message
                const successMsg = document.createElement("div");
                successMsg.className = "form-status-msg success-msg";
                successMsg.innerHTML = "<strong>¡Consulta enviada con éxito!</strong><br>Te responderemos a la brevedad.";
                contactForm.appendChild(successMsg);
                
                // Clear form
                contactForm.reset();
            })
            .catch(error => {
                console.error(error);
                // Error message
                const errorMsg = document.createElement("div");
                errorMsg.className = "form-status-msg error-msg";
                errorMsg.innerHTML = "<strong>Hubo un problema.</strong><br>Por favor, vuelve a intentarlo más tarde.";
                contactForm.appendChild(errorMsg);
            })
            .finally(() => {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            });
        });
    }

    // Shopping Cart State
    const cart = [];
    const cartCountBadge = document.getElementById("cart-count");
    const cartLink = document.getElementById("cart-link");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartDrawer = document.getElementById("cart-drawer");
    const closeCartBtn = document.getElementById("close-cart");
    const cartDrawerItems = document.getElementById("cart-drawer-items");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const cartEmptyBtn = document.getElementById("cart-empty-btn");
    const cartCheckoutBtn = document.getElementById("cart-checkout-btn");

    // Toast container creation if it doesn't exist
    let toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className = "toast-container";
        document.body.appendChild(toastContainer);
    }

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast-msg";
        toast.innerHTML = `<span>${message}</span>`;
        toastContainer.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Toggle Cart Drawer
    function openCart() {
        renderCartItems();
        if (cartOverlay) cartOverlay.classList.add("open");
        if (cartDrawer) cartDrawer.classList.add("open");
    }

    function closeCart() {
        if (cartOverlay) cartOverlay.classList.remove("open");
        if (cartDrawer) cartDrawer.classList.remove("open");
    }

    if (cartLink) {
        cartLink.addEventListener("click", (e) => {
            e.preventDefault();
            openCart();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", closeCart);
    }

    // Discount helper
    function getDiscount(count) {
        if (count >= 20) return 0.25;
        if (count >= 10) return 0.20;
        if (count > 5)  return 0.10;
        return 0;
    }

    // Render Items inside Drawer
    function renderCartItems() {
        if (!cartDrawerItems) return;
        cartDrawerItems.innerHTML = "";

        if (cart.length === 0) {
            cartDrawerItems.innerHTML = '<div class="cart-empty-message">Tu carrito está vacío</div>';
            if (cartTotalPrice) cartTotalPrice.textContent = "$0";
            // Remove any existing discount row from the footer
            const existingDiscount = document.getElementById("cart-discount-row");
            if (existingDiscount) existingDiscount.remove();
            return;
        }

        cart.forEach((item, index) => {
            const itemRow = document.createElement("div");
            itemRow.className = "cart-item-row";
            itemRow.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">$${item.price.toLocaleString('es-AR')}</span>
                </div>
                <button class="remove-item-btn" data-index="${index}">Eliminar</button>
            `;
            cartDrawerItems.appendChild(itemRow);
        });

        // Calculate subtotal and discount
        const subtotal = cart.reduce((total, item) => total + item.price, 0);
        const discountRate = getDiscount(cart.length);
        const discountAmount = subtotal * discountRate;
        const finalTotal = subtotal - discountAmount;

        // Show/hide discount row in footer
        const cartFooter = document.querySelector(".cart-drawer-footer");
        let discountRow = document.getElementById("cart-discount-row");
        const cartTotalEl = document.querySelector(".cart-total");

        if (discountRate > 0) {
            if (!discountRow) {
                discountRow = document.createElement("div");
                discountRow.id = "cart-discount-row";
                discountRow.className = "cart-discount-row";
                if (cartFooter && cartTotalEl) {
                    cartFooter.insertBefore(discountRow, cartTotalEl);
                }
            }
            discountRow.innerHTML = `
                <div class="cart-discount-info">
                    <span class="discount-label">🏷️ Descuento (${discountRate * 100}%)</span>
                    <span class="discount-amount">-$${discountAmount.toLocaleString('es-AR')}</span>
                </div>
                <div class="cart-subtotal-info">
                    <span>Subtotal</span>
                    <span>$${subtotal.toLocaleString('es-AR')}</span>
                </div>
            `;
        } else {
            if (discountRow) discountRow.remove();
        }

        // Update total price display
        if (cartTotalPrice) {
            cartTotalPrice.textContent = `$${finalTotal.toLocaleString('es-AR')}`;
        }

        // Attach delete listeners
        const removeBtns = cartDrawerItems.querySelectorAll(".remove-item-btn");
        removeBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.target.getAttribute("data-index"));
                removeFromCart(idx);
            });
        });
    }

    function removeFromCart(index) {
        if (index >= 0 && index < cart.length) {
            const removedItem = cart[index];
            cart.splice(index, 1);
            updateCartBadge();
            renderCartItems();
            showToast(`🗑️ <strong>${removedItem.name}</strong> eliminado del carrito.`);
        }
    }

    function updateCartBadge() {
        if (cartCountBadge) {
            cartCountBadge.textContent = cart.length;
            if (cart.length > 0) {
                cartCountBadge.classList.add("visible");
            } else {
                cartCountBadge.classList.remove("visible");
            }
        }
    }

    // Empty Cart
    if (cartEmptyBtn) {
        cartEmptyBtn.addEventListener("click", () => {
            if (cart.length > 0) {
                cart.length = 0;
                updateCartBadge();
                renderCartItems();
                showToast("🧹 Carrito vaciado correctamente.");
            }
        });
    }

    // Checkout (scroll and pre-fill form)
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                showToast("⚠️ Tu carrito está vacío. Agrega productos para comprar.");
                return;
            }

            closeCart();

            // Scroll to contact form
            const contactSection = document.getElementById("contacto");
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
            }

            // Pre-fill form query input with cart details including discount
            const opinionTextarea = document.getElementById("opinion");
            if (opinionTextarea) {
                const subtotal = cart.reduce((total, item) => total + item.price, 0);
                const discountRate = getDiscount(cart.length);
                const discountAmount = subtotal * discountRate;
                const finalTotal = subtotal - discountAmount;
                const itemsList = cart.map(item => `- ${item.name} ($${item.price.toLocaleString('es-AR')})`).join("\n");
                let discountLine = "";
                if (discountRate > 0) {
                    discountLine = `\nDescuento aplicado (${discountRate * 100}%): -$${discountAmount.toLocaleString('es-AR')}`;
                }
                opinionTextarea.value = `Hola! Me gustaría realizar la compra de los siguientes productos:\n\n${itemsList}\n\nSubtotal: $${subtotal.toLocaleString('es-AR')}${discountLine}\nTotal final: $${finalTotal.toLocaleString('es-AR')}`;
            }
        });
    }

    // User Authentication Logic
    const userLink = document.getElementById("user-link");
    const authModalOverlay = document.getElementById("auth-modal-overlay");
    const authModal = document.getElementById("auth-modal");
    const closeAuthModalBtn = document.getElementById("close-auth-modal");
    
    const tabLoginBtn = document.getElementById("tab-login-btn");
    const tabRegisterBtn = document.getElementById("tab-register-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loggedInView = document.getElementById("logged-in-view");
    const loggedInGreeting = document.getElementById("logged-in-greeting");
    const logoutBtn = document.getElementById("logout-btn");
    const userLoggedIndicator = document.getElementById("user-logged-indicator");
    const authTabsContainer = document.getElementById("auth-tabs-container");

    function isUserLoggedIn() {
        return sessionStorage.getItem("tiendalanas_logged_in") !== null;
    }

    function getLoggedInUser() {
        const userDataStr = sessionStorage.getItem("tiendalanas_logged_in");
        return userDataStr ? JSON.parse(userDataStr) : null;
    }

    function updateAuthUI() {
        const loggedIn = isUserLoggedIn();
        if (loggedIn) {
            if (userLoggedIndicator) userLoggedIndicator.classList.add("active");
        } else {
            if (userLoggedIndicator) userLoggedIndicator.classList.remove("active");
        }
    }

    function showPanelSection(sectionId) {
        document.querySelectorAll(".user-panel-section").forEach(sec => sec.classList.remove("active"));
        const target = document.getElementById(sectionId);
        if (target) target.classList.add("active");
    }

    function openAuthModal() {
        if (isUserLoggedIn()) {
            // Show Logged In View — populate user data
            const user = getLoggedInUser();
            const greeting = document.getElementById("logged-in-greeting");
            const emailDisplay = document.getElementById("logged-in-email");
            if (greeting && user) greeting.innerText = `Hola, ${user.name}!`;
            if (emailDisplay && user) emailDisplay.textContent = user.email;

            // Populate profile info
            const profileInfo = document.getElementById("profile-info");
            if (profileInfo && user) {
                profileInfo.innerHTML = `
                    <div class="profile-info-row">
                        <span class="profile-info-label">Nombre</span>
                        <span class="profile-info-value">${user.name}</span>
                    </div>
                    <div class="profile-info-row">
                        <span class="profile-info-label">Correo electrónico</span>
                        <span class="profile-info-value">${user.email}</span>
                    </div>
                `;
            }

            if (loginForm) loginForm.classList.remove("active");
            if (registerForm) registerForm.classList.remove("active");
            if (authTabsContainer) authTabsContainer.style.display = "none";
            if (loggedInView) loggedInView.classList.add("active");

            // Always open on main panel home
            showPanelSection("user-panel-home");
        } else {
            // Show Login view by default
            switchTab("login");
            if (loggedInView) loggedInView.classList.remove("active");
            if (authTabsContainer) authTabsContainer.style.display = "flex";
        }

        if (authModalOverlay) authModalOverlay.classList.add("open");
        if (authModal) authModal.classList.add("open");
    }

    function closeAuthModal() {
        if (authModalOverlay) authModalOverlay.classList.remove("open");
        if (authModal) authModal.classList.remove("open");
    }

    function switchTab(tab) {
        if (tab === "login") {
            if (tabLoginBtn) tabLoginBtn.classList.add("active");
            if (tabRegisterBtn) tabRegisterBtn.classList.remove("active");
            if (loginForm) loginForm.classList.add("active");
            if (registerForm) registerForm.classList.remove("active");
        } else {
            if (tabLoginBtn) tabLoginBtn.classList.remove("active");
            if (tabRegisterBtn) tabRegisterBtn.classList.add("active");
            if (loginForm) loginForm.classList.remove("active");
            if (registerForm) registerForm.classList.add("active");
        }
    }

    // Modal listeners
    if (userLink) {
        userLink.addEventListener("click", (e) => {
            e.preventDefault();
            openAuthModal();
        });
    }

    if (closeAuthModalBtn) {
        closeAuthModalBtn.addEventListener("click", closeAuthModal);
    }

    if (authModalOverlay) {
        authModalOverlay.addEventListener("click", closeAuthModal);
    }

    if (tabLoginBtn) {
        tabLoginBtn.addEventListener("click", () => switchTab("login"));
    }

    if (tabRegisterBtn) {
        tabRegisterBtn.addEventListener("click", () => switchTab("register"));
    }

    const switchToRegisterLink = document.getElementById("switch-to-register");
    if (switchToRegisterLink) {
        switchToRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab("register");
        });
    }

    const switchToLoginLink = document.getElementById("switch-to-login");
    if (switchToLoginLink) {
        switchToLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            switchTab("login");
        });
    }

    // ---- User Panel Navigation ----
    const menuPaymentMethods = document.getElementById("menu-payment-methods");
    const menuMyOrders = document.getElementById("menu-my-orders");
    const menuMyProfile = document.getElementById("menu-my-profile");

    if (menuPaymentMethods) {
        menuPaymentMethods.addEventListener("click", () => {
            showPanelSection("user-panel-payments");
            renderSavedPaymentMethods();
        });
    }

    if (menuMyOrders) {
        menuMyOrders.addEventListener("click", () => {
            showPanelSection("user-panel-orders");
        });
    }

    if (menuMyProfile) {
        menuMyProfile.addEventListener("click", () => {
            showPanelSection("user-panel-profile");
        });
    }

    ["back-to-panel-home", "back-to-panel-home-orders", "back-to-panel-home-profile"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener("click", () => showPanelSection("user-panel-home"));
    });

    // ---- Payment Methods Logic ----
    function getUserPaymentKey() {
        const user = getLoggedInUser();
        return user ? `tiendalanas_payments_${user.email}` : null;
    }

    function getSavedPayments() {
        const key = getUserPaymentKey();
        if (!key) return [];
        return JSON.parse(localStorage.getItem(key) || "[]");
    }

    function savePayments(payments) {
        const key = getUserPaymentKey();
        if (!key) return;
        localStorage.setItem(key, JSON.stringify(payments));
    }

    function getCardTypeLabel(type) {
        const labels = { visa: "Visa", mastercard: "Mastercard", amex: "American Express", naranja: "Naranja", mercadopago: "MercadoPago" };
        return labels[type] || type;
    }

    function renderSavedPaymentMethods() {
        const container = document.getElementById("saved-payment-methods");
        if (!container) return;
        const payments = getSavedPayments();
        container.innerHTML = "";

        if (payments.length === 0) {
            container.innerHTML = '<p class="no-methods-msg">No tienes tarjetas guardadas.</p>';
            return;
        }

        payments.forEach((pm, index) => {
            const card = document.createElement("div");
            card.className = "saved-method-card";
            card.innerHTML = `
                <div class="method-card-info">
                    <span class="method-card-type">${getCardTypeLabel(pm.type)} &nbsp;${pm.cardHolder}</span>
                    <span class="method-card-number">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; ${pm.lastFour}</span>
                    <span class="method-card-expiry">Vence: ${pm.expiry}</span>
                </div>
                <button class="remove-method-btn" data-index="${index}">Eliminar</button>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll(".remove-method-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = parseInt(e.target.getAttribute("data-index"));
                const payments = getSavedPayments();
                payments.splice(idx, 1);
                savePayments(payments);
                renderSavedPaymentMethods();
                showToast("🗑️ Tarjeta eliminada correctamente.");
            });
        });
    }

    // Add payment form handler
    const addPaymentForm = document.getElementById("add-payment-form");
    if (addPaymentForm) {
        // Auto-format card number with spaces
        const cardNumberInput = document.getElementById("card-number");
        if (cardNumberInput) {
            cardNumberInput.addEventListener("input", (e) => {
                let val = e.target.value.replace(/\D/g, "").substring(0, 16);
                e.target.value = val.match(/.{1,4}/g)?.join(" ") || val;
            });
        }

        // Auto-format expiry MM/AA
        const cardExpiryInput = document.getElementById("card-expiry");
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener("input", (e) => {
                let val = e.target.value.replace(/\D/g, "").substring(0, 4);
                if (val.length >= 3) val = val.substring(0, 2) + "/" + val.substring(2);
                e.target.value = val;
            });
        }

        addPaymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const holder = document.getElementById("card-holder").value.trim();
            const number = document.getElementById("card-number").value.replace(/\s/g, "");
            const expiry = document.getElementById("card-expiry").value.trim();
            const type = document.getElementById("card-type").value;

            if (number.length < 13) {
                showToast("⚠️ Número de tarjeta inválido.");
                return;
            }

            const payments = getSavedPayments();
            const newMethod = { type, cardHolder: holder, lastFour: number.slice(-4), expiry };
            payments.push(newMethod);
            savePayments(payments);

            addPaymentForm.reset();
            renderSavedPaymentMethods();
            showToast(`💳 Tarjeta ${getCardTypeLabel(type)} guardada correctamente.`);
        });
    }

    // Register Form Handler
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim().toLowerCase();
            const password = document.getElementById("reg-password").value;
            const confirmPassword = document.getElementById("reg-confirm-password").value;

            if (password !== confirmPassword) {
                showToast("⚠️ Las contraseñas no coinciden.");
                return;
            }

            // Get existing users
            const users = JSON.parse(localStorage.getItem("tiendalanas_users") || "[]");
            
            // Check if email already exists
            const userExists = users.some(u => u.email === email);
            if (userExists) {
                showToast("⚠️ Este correo electrónico ya está registrado.");
                return;
            }

            // Save user
            const newUser = { name, email, password };
            users.push(newUser);
            localStorage.setItem("tiendalanas_users", JSON.stringify(users));

            // Log in user
            sessionStorage.setItem("tiendalanas_logged_in", JSON.stringify({ name, email }));
            
            updateAuthUI();
            closeAuthModal();
            registerForm.reset();
            showToast(`🎉 ¡Registro exitoso! Bienvenido, <strong>${name}</strong>.`);
        });
    }

    // Login Form Handler
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const password = document.getElementById("login-password").value;

            // Get registered users
            const users = JSON.parse(localStorage.getItem("tiendalanas_users") || "[]");
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                showToast("❌ Correo electrónico o contraseña incorrectos.");
                return;
            }

            // Log in user
            sessionStorage.setItem("tiendalanas_logged_in", JSON.stringify({ name: user.name, email: user.email }));
            
            updateAuthUI();
            closeAuthModal();
            loginForm.reset();
            showToast(`👋 ¡Hola de nuevo, <strong>${user.name}</strong>!`);
        });
    }

    // Logout Handler
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("tiendalanas_logged_in");
            updateAuthUI();
            closeAuthModal();
            
            // Clear cart upon logout
            cart.length = 0;
            updateCartBadge();
            renderCartItems();

            showToast("🔒 Sesión cerrada correctamente.");
        });
    }

    // Initialize Auth UI state on page load
    updateAuthUI();

    function addToCart(productCard) {
        // Only allow buying if logged in
        if (!isUserLoggedIn()) {
            showToast("⚠️ Debes iniciar sesión para comprar.");
            openAuthModal();
            return;
        }

        const productName = productCard.querySelector(".productos_title").textContent;
        const priceText = productCard.querySelector("p").textContent;
        const priceValue = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));

        // Add to cart array
        cart.push({ name: productName, price: priceValue });

        // Update badge count
        updateCartBadge();

        // Pop badge animation
        if (cartCountBadge) {
            cartCountBadge.classList.remove("pop-animation");
            void cartCountBadge.offsetWidth; // trigger reflow
            cartCountBadge.classList.add("pop-animation");
        }

        // Calculate total sum for toast
        const totalSum = cart.reduce((total, item) => total + item.price, 0);

        // Show confirmation toast
        showToast(`🛍️ <strong>${productName}</strong> agregado al carrito.<br>Total acumulado: <strong>$${totalSum.toLocaleString('es-AR')}</strong> (${cart.length} prod.)`);
    }

    // Attach listeners to "Comprar" buttons inside cards
    const cards = document.querySelectorAll(".cardprod");
    cards.forEach(card => {
        const comprarBtn = card.querySelector(".hero_button");
        if (comprarBtn && comprarBtn.textContent.trim() === "Comprar") {
            comprarBtn.addEventListener("click", () => {
                addToCart(card);
            });
        }
    });
});