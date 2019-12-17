/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  // Breadcrumb,
  // BreadcrumbItem,
  Button,
  Tabs,
  Tab,
} from 'carbon-components-react';
import SEO from '../seo';

export const LandingPage = () => {
  const props = {
    tabs: {
      selected: 0,
      triggerHref: '#',
      role: 'navigation',
    },
    tab: {
      href: '#',
      role: 'presentation',
      tabIndex: 0,
    },
  };
  return (
    <>
      <SEO title="Home" />
      <div className="bx--grid bx--grid--full-width landing-page">
        <div className="bx--row landing-page__banner">
          <div className="bx--col-lg-16">
            {/* <Breadcrumb noTrailingSlash aria-label="Page navigation">
              <BreadcrumbItem>
                <a href="/app">Getting started</a>
              </BreadcrumbItem>
            </Breadcrumb> */}
            <h1 className="landing-page__heading">
              Design &amp; build with Carbon
            </h1>
          </div>
        </div>
        <div className="bx--row landing-page__r2">
          <div className="bx--col bx--no-gutter">
            <Tabs {...props.tabs} aria-label="Tab navigation">
              <Tab {...props.tab} label="About">
                <div className="bx--grid bx--grid--no-gutter bx--grid--full-width fix-padding">
                  <div className="bx--row landing-page__tab-content">
                    <div className="bx--col-md-4 bx--col-lg-7">
                      <h2 className="landing-page__subheading">
                        What is Carbon?
                      </h2>
                      <p className="landing-page__p">
                        Carbon is IBM’s open-source design system for digital
                        products and experiences. With the IBM Design Language
                        as its foundation, the system consists of working code,
                        design tools and resources, human interface guidelines,
                        and a vibrant community of contributors.
                      </p>
                      <Button>Learn more</Button>
                    </div>
                    <div className="bx--col-md-4 bx--offset-lg-1 bx--col-lg-8 custom-flex-end">
                      <svg
                        className="landing-page__illo"
                        width="420"
                        height="420"
                        viewBox="0 0 420 420"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0)">
                          <path
                            d="M268.344 133.747C291.06 133.747 309.541 152.228 309.541 174.944C309.541 197.661 291.06 216.142 268.344 216.142C245.626 216.142 227.145 197.661 227.145 174.944C227.145 152.229 245.627 133.747 268.344 133.747ZM268.344 151.747C255.552 151.747 245.145 162.153 245.145 174.944C245.145 187.736 255.552 198.142 268.344 198.142C281.135 198.142 291.541 187.736 291.541 174.944C291.542 162.154 281.135 151.747 268.344 151.747ZM118 419.077H145.405C145.418 419.077 145.431 419.079 145.444 419.079C150.415 419.079 154.444 415.05 154.444 410.079V255.985L233.528 124.679L279.387 103.15C283.887 101.038 285.822 95.6777 283.71 91.1787C281.598 86.6777 276.234 84.7417 271.738 86.8567L223.404 109.546C221.791 110.304 220.438 111.524 219.518 113.05L137.733 248.84C136.889 250.241 136.442 251.847 136.442 253.484V401.078H118C113.029 401.078 109 405.107 109 410.078C109 415.049 113.029 419.077 118 419.077ZM223.549 341.858C225.25 343.329 227.345 344.048 229.43 344.048C231.953 344.048 234.463 342.992 236.243 340.933L266.472 305.954C268.706 303.369 269.284 299.741 267.962 296.59L238.476 226.258C237.798 224.642 236.664 223.258 235.211 222.278L216.593 209.711C214.569 208.345 212.074 207.858 209.686 208.367C207.298 208.876 205.217 210.333 203.923 212.405L175.161 258.477C175.121 258.54 175.091 258.607 175.053 258.671C174.961 258.827 174.872 258.984 174.789 259.146C174.732 259.257 174.68 259.368 174.628 259.48C174.557 259.633 174.49 259.787 174.428 259.944C174.377 260.072 174.331 260.2 174.287 260.33C174.238 260.474 174.192 260.618 174.15 260.764C174.107 260.912 174.07 261.061 174.035 261.21C174.005 261.341 173.976 261.473 173.952 261.606C173.921 261.774 173.896 261.943 173.875 262.112C173.86 262.233 173.845 262.353 173.835 262.475C173.819 262.658 173.812 262.839 173.807 263.021C173.805 263.095 173.796 263.167 173.796 263.242V410.08C173.796 415.051 177.825 419.08 182.796 419.08C182.809 419.08 182.822 419.078 182.835 419.078H210.243C215.214 419.078 219.243 415.049 219.243 410.078C219.243 405.107 215.214 401.078 210.243 401.078H191.797V265.82L214.254 229.847L222.915 235.694L249.206 298.405L222.624 329.164C219.374 332.924 219.788 338.608 223.549 341.858Z"
                            fill="#39927E"
                          />
                          <path
                            d="M268.344 133.747C291.06 133.747 309.541 152.228 309.541 174.944C309.541 197.661 291.06 216.142 268.344 216.142C245.626 216.142 227.145 197.661 227.145 174.944C227.145 152.229 245.627 133.747 268.344 133.747ZM268.344 151.747C255.552 151.747 245.145 162.153 245.145 174.944C245.145 187.736 255.552 198.142 268.344 198.142C281.135 198.142 291.541 187.736 291.541 174.944C291.542 162.154 281.135 151.747 268.344 151.747ZM118 419.077H145.405C145.418 419.077 145.431 419.079 145.444 419.079C150.415 419.079 154.444 415.05 154.444 410.079V255.985L233.528 124.679L279.387 103.15C283.887 101.038 285.822 95.6777 283.71 91.1787C281.598 86.6777 276.234 84.7417 271.738 86.8567L223.404 109.546C221.791 110.304 220.438 111.524 219.518 113.05L137.733 248.84C136.889 250.241 136.442 251.847 136.442 253.484V401.078H118C113.029 401.078 109 405.107 109 410.078C109 415.049 113.029 419.077 118 419.077ZM223.549 341.858C225.25 343.329 227.345 344.048 229.43 344.048C231.953 344.048 234.463 342.992 236.243 340.933L266.472 305.954C268.706 303.369 269.284 299.741 267.962 296.59L238.476 226.258C237.798 224.642 236.664 223.258 235.211 222.278L216.593 209.711C214.569 208.345 212.074 207.858 209.686 208.367C207.298 208.876 205.217 210.333 203.923 212.405L175.161 258.477C175.121 258.54 175.091 258.607 175.053 258.671C174.961 258.827 174.872 258.984 174.789 259.146C174.732 259.257 174.68 259.368 174.628 259.48C174.557 259.633 174.49 259.787 174.428 259.944C174.377 260.072 174.331 260.2 174.287 260.33C174.238 260.474 174.192 260.618 174.15 260.764C174.107 260.912 174.07 261.061 174.035 261.21C174.005 261.341 173.976 261.473 173.952 261.606C173.921 261.774 173.896 261.943 173.875 262.112C173.86 262.233 173.845 262.353 173.835 262.475C173.819 262.658 173.812 262.839 173.807 263.021C173.805 263.095 173.796 263.167 173.796 263.242V410.08C173.796 415.051 177.825 419.08 182.796 419.08C182.809 419.08 182.822 419.078 182.835 419.078H210.243C215.214 419.078 219.243 415.049 219.243 410.078C219.243 405.107 215.214 401.078 210.243 401.078H191.797V265.82L214.254 229.847L222.915 235.694L249.206 298.405L222.624 329.164C219.374 332.924 219.788 338.608 223.549 341.858Z"
                            fill="url(#paint0_linear)"
                          />
                        </g>
                        <defs>
                          <linearGradient
                            id="paint0_linear"
                            x1="310"
                            y1="221"
                            x2="109"
                            y2="221"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#3A8BFD" />
                            <stop offset="1" stopColor="#06B9BC" />
                          </linearGradient>
                          <clipPath id="clip0">
                            <rect
                              width="419.255"
                              height="419.255"
                              fill="white"
                            />
                          </clipPath>
                        </defs>
                      </svg>

                      {/* <img
                        className="landing-page__illo"
                        src="/tab-illo.png"
                        alt="Carbon illustration"
                      /> */}
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab {...props.tab} label="Design">
                <div className="bx--grid bx--grid--no-gutter bx--grid--full-width fix-padding">
                  <div className="bx--row landing-page__tab-content">
                    <div className="bx--col-lg-16">
                      Rapidly build beautiful and accessible experiences. The
                      Carbon kit contains all resources you need to get started.
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab {...props.tab} label="Develop">
                <div className="bx--grid bx--grid--no-gutter bx--grid--full-width fix-padding">
                  <div className="bx--row landing-page__tab-content">
                    <div className="bx--col-lg-16">
                      Carbon provides styles and components in Vanilla, React,
                      Angular, and Vue for anyone building on the web.
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
        <div className="bx--row landing-page__r3">
          <div className="bx--col-md-4 bx--col-lg-4">
            <h3 className="landing-page__label">The Principles</h3>
          </div>
          <div className="bx--col-md-4 bx--col-lg-4">Carbon is Open</div>
          <div className="bx--col-md-4 bx--col-lg-4">Carbon is Modular</div>
          <div className="bx--col-md-4 bx--col-lg-4">Carbon is Consistent</div>
        </div>
      </div>
    </>
  );
};
