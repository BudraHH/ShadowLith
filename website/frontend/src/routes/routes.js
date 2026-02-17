export const ROUTES = {
    HOME: '/',
    DOCS: '/docs',
    EXTERNAL_DOCS: 'http://localhost:5173/docs',
    INSTALL_SCRIPT: 'https://shadowlith.io/install.ps1',
    GITHUB: 'https://github.com/shadowlith',
    TWITTER: 'https://twitter.com/shadowlith',
    DISCORD: 'https://discord.gg/shadowlith',
};

export const LANDING_PAGE_SECTIONS = {
    HERO: 'hero',
    FEATURES: 'features',
    HOW_IT_WORKS: 'how-it-works',
    SECURITY: 'security',
    FOOTER: 'footer',
};

/**
 * Returns the anchor path for a given section ID.
 * @param {string} sectionId 
 * @returns {string}
 */
export const getSectionAnchor = (sectionId) => `${ROUTES.HOME}#${sectionId}`;
