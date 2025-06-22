document.addEventListener("DOMContentLoaded", () => {
    const plzPartners = [
        {
            url: "https://klimarando.de/partner/mhb-green-gmbh/konfigurator",
            plzList: ["49082", "50739", "12345"]
        },
        {
            url: "https://klimarando.de/partner/kuttner-gebaudeenergietechnik/konfigurator",
            plzList: ["92637", "92648", "92655", "92660", "92665", "92670", "92676", "92681", "92685", "92690", "92693", "92694", "92696", "92697", "92699", "92700", "92702", "92703", "92705", "92706", "92709", "92711", "92712", "92715", "92717", "92718", "92720", "92721", "92723", "02724", "92726", "92727", "92729", "92507", "92521", "92526", "92533", "92536", "92539", "92543", "92546", "92548", "92549", "92551", "92552", "92554", "92555", "92557", "92559", "92431", "92436", "92439", "92442", "92444", "92445", "92447", "92449", "92450", "92451", "92452", "92453", "92454", "92455", "92456", "92457", "92458", "92459", "92460", "92461", "92462", "92463", "92464", "92465", "92466", "92467", "92468", "92469", "92470", "92471", "92472", "92473", "92474", "92475", "92476", "92477", "92478", "92479", "92480", "92481", "92482", "92483", "92484", "92485", "92486", "92487", "92488", "92489", "92490", "92491", "92492", "92493", "92494", "92495", "92496", "92497", "92498", "92499", "92500"]
        }
    ];

    const plzMap = new Map();
    plzPartners.forEach(partner => {
        partner.plzList.forEach(plz => {
            plzMap.set(plz, partner.url);
        });
    });

    $("[custom-form]").each((_, form) => {
        const $f = $(form),
              $p = $f.parent(),
              $ok = $p.find(".w-form-done"),
              enc = $f.attr("bs-has-atob"),
              url = enc ? atob(enc) : $f.attr("action");

        form.removeAttribute("action");
        form.removeAttribute("data-wf-form");

        const plzInput = form.querySelector('input[name="PLZ-2"]');
        const embedField = form.querySelector('input[name="embed-code"]') || 
                          form.querySelector('textarea[name="embed-code"]') || 
                          form.querySelector('input[type="hidden"][name="embed-code"]');
        const redirectUrlField = form.querySelector('input[name="redirect-url"]');
        const redirectUrlNameField = form.querySelector('input[name="redirect-url-name"]');

        if (plzInput && embedField) {
            plzInput.addEventListener('input', (e) => {
                const plzValue = e.target.value.trim();
                if (plzMap.has(plzValue)) {
                    embedField.value = "static-match";
                    const redirectUrl = plzMap.get(plzValue);
                    if (redirectUrlField) {
                        redirectUrlField.value = redirectUrl;
                    }
                    if (redirectUrlNameField) {
                        const urlParts = redirectUrl.split('/');
                        const lastTwoParts = '/' + urlParts.slice(-2).join('/');
                        redirectUrlNameField.value = lastTwoParts;
                    }
                } else {
                    embedField.value = "no-static-match";
                    if (redirectUrlField) {
                        redirectUrlField.value = "";
                    }
                    if (redirectUrlNameField) {
                        redirectUrlNameField.value = "";
                    }
                }
            });
        }

        form.addEventListener("submit", async e => {
            e.stopImmediatePropagation();
            e.preventDefault();

            const plzValue = plzInput ? plzInput.value.trim() : "";
            const hasMatch = plzMap.has(plzValue);

            if (embedField) {
                embedField.value = hasMatch ? "static-match" : "no-static-match";
            }

            if (hasMatch) {
                const redirectUrl = plzMap.get(plzValue);
                if (redirectUrlField) {
                    redirectUrlField.value = redirectUrl;
                }
                if (redirectUrlNameField) {
                    const urlParts = redirectUrl.split('/');
                    const lastTwoParts = '/' + urlParts.slice(-2).join('/');
                    redirectUrlNameField.value = lastTwoParts;
                }
            } else {
                if (redirectUrlField) {
                    redirectUrlField.value = "";
                }
                if (redirectUrlNameField) {
                    redirectUrlNameField.value = "";
                }
            }

            const formData = new FormData(form);

            $f.hide();
            $ok.show();

            if (hasMatch) {
                const redirectUrl = plzMap.get(plzValue);
                
                // Redirect nach 1,5 Sekunden, POST läuft im Hintergrund
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
                
                // POST Request ohne await - läuft parallel
                fetch(url, {
                    method: "POST",
                    body: formData
                }).catch(err => {
                    console.log("Form submission failed:", err);
                });
                
                return;
            }

            const fallback = "https://klimarando.de/partner/schunk-20-gmbh-andernach/konfigurator/";
            const timer = setTimeout(() => {
                window.location.href = fallback;
            }, 10000);

            try {
                const res = await fetch(url, {
                    method: "POST",
                    body: formData
                });
                clearTimeout(timer);
                const redirectUrl = (await res.text()).trim();
                if (redirectUrl.startsWith("http")) {
                    window.location.href = redirectUrl;
                } else {
                    throw new Error("Invalid response");
                }
            } catch (err) {
                clearTimeout(timer);
                window.location.href = fallback;
            }
        }, true);
    });
});
