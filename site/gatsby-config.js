module.exports = {
  siteMetadata: {
    title: `[ACEAI] BodyPose`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
    siteUrl: `https://aceai.netlify.com`,
  },
  plugins: [
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-react-helmet`,
    'gatsby-plugin-eslint',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: `#0099ff`,
        // Disable the loading spinner.
        showSpinner: false,
      },
    },
    `gatsby-plugin-netlify`,
    `gatsby-plugin-sitemap`,
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        host: 'https://aceai.netlify.com',
        sitemap: 'https://aceai.netlify.com/sitemap.xml',
        policy: [{ userAgent: '*', disallow: ['/'] }],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `[ACEAI] BodyPose`,
        short_name: `BodyPose`,
        start_url: `/`,
        background_color: `#fff`,
        theme_color: `#fff`,
        display: `minimal-ui`,
        icon: `src/images/logo-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    `gatsby-plugin-offline`,
  ],
};
