/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "N3WSWidget",
  displayName: "N3WS",

  // Widget icon (use your app icon from root assets directory)
  icon: "../../assets/icon.png",

  // Colors for dark theme
  colors: {
    // Widget background color
    $widgetBackground: "#000000",
    // Accent color (blue from your app)
    $accent: "#0a7ea4",
  },

  // iOS deployment target
  deploymentTarget: "16.0",

  // Bundle identifier (will be com.aderiushev.n3ws.N3WSWidget)
  bundleIdentifier: ".N3WSWidget",

  // Share data with main app using App Groups
  entitlements: {
    "com.apple.security.application-groups":
      config.ios?.entitlements?.["com.apple.security.application-groups"] || ["group.com.aderiushev.n3ws"],
  },
});
