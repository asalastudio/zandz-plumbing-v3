import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      // ============ A2 · CONTENT MIGRATIONS (308 permanent) ============
      // Legacy URLs mapped to real v1 destinations. Pages without a v1-specific
      // counterpart (e.g. /repipe-oakland/, /gas-line-oakland/) point to the
      // nearest existing service or city hub. Sprint 2 will tighten these to
      // dedicated landing pages once those ship.

      // Direct hub matches
      { source: "/plumbers-san-leandro-ca", destination: "/plumber-san-leandro-ca/", permanent: true },
      { source: "/plumbing-services", destination: "/services/", permanent: true },
      { source: "/plumbing-services/request-plumbing-services", destination: "/contact/", permanent: true },
      { source: "/plumbing-services/financing", destination: "/financing/", permanent: true },
      { source: "/privacy-policy-copy", destination: "/privacy-policy/", permanent: true },

      // Legacy plumbing-services/X subpaths -> v1 /services/X/
      { source: "/plumbing-services/sewer-lateral-services", destination: "/services/sewer-lateral/", permanent: true },
      { source: "/plumbing-services/sewer-plumbing-services", destination: "/services/sewer-lateral/", permanent: true },
      { source: "/plumbing-services/drain-cleaning", destination: "/services/drain-cleaning/", permanent: true },
      { source: "/plumbing-services/pipe-repair-installation", destination: "/services/repipe/", permanent: true },
      { source: "/plumbing-services/toilet-repair-replacement", destination: "/services/toilet/", permanent: true },
      { source: "/plumbing-services/faucet-installation-and-repair", destination: "/services/faucet/", permanent: true },
      { source: "/plumbing-services/leak-detection", destination: "/services/leak-detection/", permanent: true },
      { source: "/plumbing-services/gas-line-services", destination: "/services/gas-line/", permanent: true },
      { source: "/plumbing-services/garbage-disposal-repair", destination: "/services/garbage-disposal/", permanent: true },
      { source: "/plumbing-services/water-line-repairs", destination: "/services/water-line/", permanent: true },

      // Other legacy service URLs
      { source: "/water-heater-repair-and-installation", destination: "/services/water-heater/", permanent: true },

      // Legacy Oakland service+city URLs -> existing priority page or service hub
      { source: "/water-leak-detection-in-oakland", destination: "/services/leak-detection/", permanent: true },
      { source: "/how-trenchless-sewer-replacement-saves-time-and-money-in-oakland-ca", destination: "/sewer-lateral-oakland/", permanent: true },
      { source: "/oakland-clogged-drain-repair", destination: "/drain-cleaning-oakland/", permanent: true },
      { source: "/whole-house-repiping-in-oakland-ca-what-to-expect-during-the-process", destination: "/services/repipe/", permanent: true },
      { source: "/natural-gas-repairs-in-oakland-ca-what-every-homeowner-should-know-about-safety", destination: "/services/gas-line/", permanent: true },
      { source: "/san-leandro-slab-leak-repair", destination: "/plumber-san-leandro-ca/", permanent: true },

      // ============ B · THIN BLOG POSTS RETIRED (308 to /blog/) ============
      // One-pot to /blog/ index per the integrated roadmap retire strategy.
      // The /blog/ index ships as a v1 placeholder; full archive lands in Sprint 2.
      { source: "/plumbing-diy-tips-how-to-handle-common-household-plumbing-issues", destination: "/blog/", permanent: true },
      { source: "/top-7-reasons-why-regular-plumbing-maintenance-is-crucial", destination: "/blog/", permanent: true },
      { source: "/the-importance-of-regular-sewer-maintenance-protecting-your-homes-plumbing", destination: "/blog/", permanent: true },
      { source: "/your-garbage-disposal", destination: "/blog/", permanent: true },
      { source: "/leak-detection-how-to-spot-and-address-plumbing-leaks-early", destination: "/blog/", permanent: true },
      { source: "/how-to-save-money-on-your-water-bill-with-simple-plumbing-upgrades", destination: "/blog/", permanent: true },
      { source: "/how-to-prevent-drain-clogs-expert-advice-from-z-and-z-plumbing", destination: "/blog/", permanent: true },
      { source: "/hire-a-professional-plumber", destination: "/blog/", permanent: true },
      { source: "/5-most-common-causes-of-a-leaky-faucet", destination: "/blog/", permanent: true },
      { source: "/5-plumbing-tips-for-the-spring-from-your-local-plumber", destination: "/blog/", permanent: true },
      { source: "/3-ways-to-improve-your-sinks-flow-and-prevent-clogged-drains", destination: "/blog/", permanent: true },
      { source: "/5-signs-you-may-have-plumbing-leaks", destination: "/blog/", permanent: true },
      { source: "/5-signs-your-sewer-needs-repair-dont-ignore-these-warning-signals", destination: "/blog/", permanent: true },
      { source: "/5-signs-your-water-heater-needs-to-be-repaired-or-replaced", destination: "/blog/", permanent: true },
      { source: "/10-common-plumbing-problems-and-how-to-fix-them-a-comprehensive-guide", destination: "/blog/", permanent: true },
      { source: "/the-ultimate-guide-to-hiring-a-reliable-plumber-in-your-area", destination: "/blog/", permanent: true },
      { source: "/understanding-the-basics-of-your-homes-plumbing-system", destination: "/blog/", permanent: true },
      { source: "/top-10-common-plumbing-problems-and-how-to-prevent-them", destination: "/blog/", permanent: true },
      { source: "/prevent-clogged-drains-5-household-items-that-should-never-go-down-the-drain", destination: "/blog/", permanent: true },
      { source: "/unclog-a-clogged-drain", destination: "/blog/", permanent: true },
      { source: "/10-common-causes-of-clogged-drains-you-need-to-know", destination: "/blog/", permanent: true },
      { source: "/3-simple-ways-to-clean-your-garbage-disposal", destination: "/blog/", permanent: true },
      { source: "/5-common-causes-of-sewer-backups", destination: "/blog/", permanent: true },
      { source: "/5-common-plumbing-problems-and-how-to-fix-them-before-they-get-worse", destination: "/blog/", permanent: true },
      { source: "/5-critical-plumbing-problems-and-how-to-fix-them", destination: "/blog/", permanent: true },
      { source: "/5-plumbing-problems-that-require-a-professional-plumber", destination: "/blog/", permanent: true },
      { source: "/5-problems-that-are-a-plumbing-emergency-and-how-to-avoid-them", destination: "/blog/", permanent: true },
      { source: "/5-reasons-you-should-hire-a-plumber-for-water-heater-replacements", destination: "/blog/", permanent: true },
      { source: "/5-reasons-your-sewer-line-gets-clogged", destination: "/blog/", permanent: true },
      { source: "/5-signs-its-time-for-a-toilet-replacement", destination: "/blog/", permanent: true },
      { source: "/5-signs-its-time-to-replace-your-water-heater", destination: "/blog/", permanent: true },
      { source: "/5-simple-ways-to-detect-water-leaks-in-your-home", destination: "/blog/", permanent: true },
      { source: "/a-comprehensive-guide-to-understanding-your-homes-plumbing", destination: "/blog/", permanent: true },
      { source: "/category/plumber-blog", destination: "/blog/", permanent: true },
      { source: "/category/plumber-blog/page/2", destination: "/blog/", permanent: true },
      { source: "/category/plumber-blog/page/3", destination: "/blog/", permanent: true },
      { source: "/category/plumber-blog/page/4", destination: "/blog/", permanent: true },
      { source: "/category/plumber-blog/page/5", destination: "/blog/", permanent: true },
      { source: "/category/plumber-blog/page/6", destination: "/blog/", permanent: true },
      { source: "/clear-clogged-drains-in-your-home", destination: "/blog/", permanent: true },
      { source: "/common-plumbing-repairs-every-homeowner-should-know-about", destination: "/blog/", permanent: true },
      { source: "/diy-plumbing-fixes-for-common-household-problems", destination: "/blog/", permanent: true },
      { source: "/emergency-plumbing-services-what-to-do-when-you-need-a-plumber-asap", destination: "/blog/", permanent: true },
      { source: "/here-is-a-fully-optimized-1000-word-blog-post-for", destination: "/blog/", permanent: true },
      { source: "/is-your-water-heater-on-the-fritz-top-reasons-to-call-for-a-repair", destination: "/blog/", permanent: true },
      { source: "/replace-your-toilet", destination: "/blog/", permanent: true },
      { source: "/replacing-your-pipes", destination: "/blog/", permanent: true },
      { source: "/the-importance-of-regular-plumbing-maintenance-for-your-home", destination: "/blog/", permanent: true },
      { source: "/the-importance-of-sewer-line-repair", destination: "/blog/", permanent: true },
      { source: "/the-top-10-plumbing-system-tips-for-homeowners", destination: "/blog/", permanent: true },
      { source: "/the-ultimate-guide-to-drain-cleaning-tips-and-tricks-for-a-clog-free-home", destination: "/blog/", permanent: true },
      { source: "/unclog-drains", destination: "/blog/", permanent: true },
      { source: "/z-and-z-plumbing-red", destination: "/blog/", permanent: true },
    ];
  },
};

export default nextConfig;
