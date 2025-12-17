/**
 * GDPR Cookie Consent Manager
 * Handles cookie consent for GDPR compliance
 */

class CookieConsent {
    constructor() {
        this.cookieName = 'uniqon_cookie_consent';
        this.cookieExpiry = 365; // days
        this.init();
    }

    init() {
        // Check if consent already given
        const consent = this.getConsent();
        
        if (!consent) {
            // Show banner after a short delay
            setTimeout(() => this.showBanner(), 1000);
        } else {
            // Apply saved preferences
            this.applyConsent(consent);
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Accept all button
        document.getElementById('cookie-accept')?.addEventListener('click', () => {
            this.acceptAll();
        });

        // Decline all button
        document.getElementById('cookie-decline')?.addEventListener('click', () => {
            this.declineAll();
        });

        // Settings button
        document.getElementById('cookie-settings-btn')?.addEventListener('click', () => {
            this.showSettings();
        });

        // Close settings modal
        document.getElementById('cookie-settings-close')?.addEventListener('click', () => {
            this.hideSettings();
        });

        // Save settings button
        document.getElementById('cookie-save-settings')?.addEventListener('click', () => {
            this.saveSettings();
        });

        // Accept all from settings
        document.getElementById('cookie-accept-all-settings')?.addEventListener('click', () => {
            this.acceptAllFromSettings();
        });

        // Close modal on background click
        document.getElementById('cookie-settings-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'cookie-settings-modal') {
                this.hideSettings();
            }
        });
    }

    showBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('show');
        }
    }

    hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    showSettings() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    hideSettings() {
        const modal = document.getElementById('cookie-settings-modal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    acceptAll() {
        const consent = {
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        this.showNotification('All cookies accepted. Thank you!');
    }

    declineAll() {
        const consent = {
            necessary: true, // Always required
            analytics: false,
            marketing: false,
            preferences: false,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideBanner();
        this.showNotification('Only necessary cookies will be used.');
    }

    saveSettings() {
        const consent = {
            necessary: true, // Always true
            analytics: document.getElementById('cookie-analytics')?.checked || false,
            marketing: document.getElementById('cookie-marketing')?.checked || false,
            preferences: document.getElementById('cookie-preferences')?.checked || false,
            timestamp: new Date().toISOString()
        };
        
        this.saveConsent(consent);
        this.applyConsent(consent);
        this.hideSettings();
        this.hideBanner();
        this.showNotification('Cookie preferences saved!');
    }

    acceptAllFromSettings() {
        // Check all toggles
        document.getElementById('cookie-analytics').checked = true;
        document.getElementById('cookie-marketing').checked = true;
        document.getElementById('cookie-preferences').checked = true;
        
        this.saveSettings();
    }

    saveConsent(consent) {
        const consentString = JSON.stringify(consent);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.cookieExpiry);
        
        document.cookie = `${this.cookieName}=${consentString}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }

    getConsent() {
        const name = this.cookieName + '=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookies = decodedCookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(name) === 0) {
                try {
                    return JSON.parse(cookie.substring(name.length));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }

    applyConsent(consent) {
        // Apply analytics cookies (Google Analytics, etc.)
        if (consent.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }

        // Apply marketing cookies (AdSense is loaded but can be controlled)
        if (consent.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }

        // Apply preference cookies
        if (consent.preferences) {
            this.enablePreferences();
        } else {
            this.disablePreferences();
        }

        console.log('Cookie consent applied:', consent);
    }

    enableAnalytics() {
        // Enable Google Analytics or other analytics tools
        console.log('Analytics enabled');
        
        // Example: Initialize Google Analytics
        // window.dataLayer = window.dataLayer || [];
        // function gtag(){dataLayer.push(arguments);}
        // gtag('consent', 'update', { 'analytics_storage': 'granted' });
    }

    disableAnalytics() {
        console.log('Analytics disabled');
        
        // Example: Disable Google Analytics
        // window['ga-disable-GA_MEASUREMENT_ID'] = true;
    }

    enableMarketing() {
        console.log('Marketing cookies enabled');
        
        // AdSense is already loaded in template, but you can control behavior
        // Example: Re-enable personalized ads
        // (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 0;
    }

    disableMarketing() {
        console.log('Marketing cookies disabled - showing non-personalized ads');
        
        // Request non-personalized ads for AdSense
        // (adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;
    }

    enablePreferences() {
        console.log('Preference cookies enabled');
        // Enable theme preferences, language settings, etc.
    }

    disablePreferences() {
        console.log('Preference cookies disabled');
    }

    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10002;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Public method to check if specific cookie type is allowed
    isAllowed(type) {
        const consent = this.getConsent();
        return consent ? consent[type] === true : false;
    }

    // Public method to revoke consent (for privacy policy page)
    revokeConsent() {
        document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        location.reload();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.cookieConsent = new CookieConsent();
});

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
