function Tabzy(selector, options = {}) {
    this.container = document.querySelector(selector);

    if (!this.container) {
        console.error(`Tabzy: No container found for selector '${selector}'`);
        return;
    }

    this.tabs = Array.from(this.container.querySelectorAll("li a"));

    if (!this.tabs.length) {
        console.error(`Tabzy: No tabs found inside the container`);
        return;
    }

    let hasError = false;

    this.panels = this.getPanels();

    if (hasError) return;

    this.opt = Object.assign(
        {
            activeClassName: "tabzy--active",
            remember: false,
            onChange: null,
        },
        options
    );

    this._cleanRegex = /[^a-zA-Z0-9]/g;
    this.paramKey = selector.replace(this._cleanRegex, "");
    this._originalHTML = this.container.innerHTML;

    this._init();
}

Tabzy.prototype.getPanels = function () {
    return this.tabs.map((tab) => {
        const panel = document.querySelector(tab.getAttribute("href"));
        if (!panel) {
            hasError = true;
            console.error(
                `Tabzy: No panel for selector '${tab.getAttribute("href")}'`
            );
            return;
        }
        return panel;
    });
};

Tabzy.prototype._init = function () {
    // const hash = location.hash;
    // if (hash) {
    //     tabToActivate =
    //         this.tabs.find((tab) => tab.getAttribute("href") === hash) ||
    //         this.tabs[0];
    // } else {
    //     tabToActivate = this.tabs[0];
    // }

    const params = new URLSearchParams(location.search);
    const tabSelector = params.get(this.paramKey);
    const tab =
        (this.opt.remember &&
            tabSelector &&
            this.tabs.find(
                (tab) =>
                    tab.getAttribute("href").replace(this._cleanRegex, "") ===
                    tabSelector
            )) ||
        this.tabs[0];

    this.currentTab = tab;
    this._activateTab(tab, false, false);

    this.tabs.forEach((tab) => {
        tab.onclick = (event) => {
            event.preventDefault();
            this._tryActivateTab(tab);
        };
    });
};

Tabzy.prototype._tryActivateTab = function (tab) {
    if (this.currentTab !== tab) {
        this.currentTab = tab;
        this._activateTab(tab);
    }
};
Tabzy.prototype._activateTab = function (
    tab,
    triggerOnChange = true,
    updateURL = this.opt.remember
) {
    this.tabs.forEach((tab) => {
        tab.closest("li").classList.remove(this.opt.activeClassName);
    });

    tab.closest("li").classList.add(this.opt.activeClassName);

    this.panels.forEach((panel) => {
        panel.hidden = true;
    });

    const panelActive = document.querySelector(tab.getAttribute("href"));
    panelActive.hidden = false;

    // Dung localStorage
    // localStorage.setItem("tabzy-active", tab.getAttribute("href"));

    // Dung queryParam
    if (updateURL) {
        const params = new URLSearchParams(location.search);
        const paramValue = tab
            .getAttribute("href")
            .replace(this._cleanRegex, "");
        params.set(this.paramKey, paramValue);
        history.replaceState(null, null, `?${params}`);
    }

    if (triggerOnChange && typeof this.opt.onChange === "function") {
        this.opt.onChange({
            tab,
            panel: panelActive,
        });
    }
};
Tabzy.prototype.switch = function (input) {
    const tab =
        typeof input === "string"
            ? this.tabs.find((tab) => tab.getAttribute("href") === input)
            : this.tabs.includes(input)
            ? input
            : null;

    if (!tab) {
        console.error(`Tabzy: Invalid input '${input}'`);
        return;
    }

    this._tryActivateTab(tab);
};

Tabzy.prototype.destroy = function () {
    this.container.innerHTML = this._originalHTML;
    this.panels.forEach((panel) => {
        panel.hidden = false;
    });
    this.container = null;
    this.tabs = null;
    this.panels = null;
    this.currentTab = null;
};
