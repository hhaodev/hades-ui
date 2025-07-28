import { disableBodyScrollSafe } from "../../utils";

class HadesUILoading extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.visible = false;
    this.delayTimer = null;
    this.restoreScroll = null;

    this.render();
    this.overlay = this.shadowRoot.querySelector("#overlay");

    this.observer = new MutationObserver(this.handleThemeChange.bind(this));
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  connectedCallback() {
    this.updateThemeStyle();
  }

  disconnectedCallback() {
    this.observer.disconnect();
  }

  handleThemeChange() {
    this.updateThemeStyle();
  }

  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  updateThemeStyle() {
    const theme = this.getCurrentTheme();
    const bg =
      theme === "dark" ? "var(--hadesui-gray-9)" : "var(--hadesui-gray-3)";
    const textColor =
      theme === "dark" ? "var(--hadesui-gray-5-5)" : "var(--hadesui-gray-9)";

    this.shadowRoot.querySelector("#overlay-content").style.background = bg;
    this.shadowRoot.querySelector(".loading-text").style.color = textColor;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        #overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          display: none;
          z-index: var(--z-loading);
          align-items: center;
          justify-content: center;
        }

        #overlay-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 16px var(--hadesui-boxshadow-color);
          min-width: 150px;
          transition: background 0.2s;
        }

        .loader {
          display: flex;
          transition: all 0.4s;
          gap: 8px;
        }

        .loader div {
          background-color: var(--hadesui-icon-loading-global);
          box-shadow: inset 2px 2px 10px black;
          border-radius: 100%;
          height: 10px;
          width: 10px;
        }

        .box-load1 {
          animation: brighten 1.2s infinite;
        }

        .box-load2 {
          animation: brighten 1.2s infinite;
          animation-delay: .2s;
        }

        .box-load3 {
          animation: brighten 1.2s infinite;
          animation-delay: .4s;
        }

        .box-load4 {
          animation: brighten 1.2s infinite;
          animation-delay: .6s;
        }

        .box-load5 {
          animation: brighten 1.2s infinite;
          animation-delay: .8s;
        }

        .box-load6 {
          animation: brighten 1.2s infinite;
          animation-delay: 1s;
        }

        @keyframes brighten {
          0%{
              background-color: var(--hadesui-icon-loading-global);
              box-shadow: none;
          }
          100% {
            background-color: var(--hadesui-icon-loading-global-animate);
            box-shadow: none;
          }
        }

        .loading-text {
          font-size: 14px;
          color: #333;
        }
      </style>

      <div id="overlay">
        <div id="overlay-content">
          <div class="loading-text">Loading...</div>
          <div class="loader">
            <div class="box-load1"></div>
            <div class="box-load2"></div>
            <div class="box-load3"></div>
            <div class="box-load4"></div>
            <div class="box-load5"></div>
            <div class="box-load6"></div>
          </div>
        </div>
      </div>
    `;
  }

  show() {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }

    if (this.visible) return;

    this.overlay.style.display = "flex";
    this.visible = true;
    this.restoreScroll = disableBodyScrollSafe();
  }

  hide() {
    if (!this.visible) return;

    if (this.delayTimer) clearTimeout(this.delayTimer);
    this.delayTimer = setTimeout(() => {
      if (this.visible) {
        this.overlay.style.display = "none";
        this.visible = false;
        this.restoreScroll?.();
        this.restoreScroll = null;
      }
      this.delayTimer = null;
    }, 100);
  }

  reset() {
    clearTimeout(this.delayTimer);
    this.delayTimer = null;
    this.overlay.style.display = "none";
    this.visible = false;
    this.restoreScroll?.();
    this.restoreScroll = null;
  }
}

if (!customElements.get("hades-ui-global-loading")) {
  customElements.define("hades-ui-global-loading", HadesUILoading);
}

const loadingEl =
  document.querySelector("hades-ui-global-loading") ||
  (() => {
    const el = document.createElement("hades-ui-global-loading");
    document.body.appendChild(el);
    return el;
  })();

window.$$ = {
  loading: (show) => (show ? loadingEl.show() : loadingEl.hide()),
  clearAllLoading: () => loadingEl.reset?.(),
};
globalThis.$$ = window.$$;
