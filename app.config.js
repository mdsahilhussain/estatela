const appJson = require("./app.json");

const sentryPlugin = [
  "@sentry/react-native/expo",
  {
    url: process.env.SENTRY_URL || "https://sentry.io/",
    organization: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
];

module.exports = () => {
  const expo = {
    ...appJson.expo,
    plugins: [...(appJson.expo.plugins || []), sentryPlugin],
  };

  return { expo };
};
